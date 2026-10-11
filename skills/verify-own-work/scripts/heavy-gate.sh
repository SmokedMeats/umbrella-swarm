#!/bin/sh
# heavy-gate.sh — run a heavy check (type check, verify, pr_ready) through a
# slotted gate so several can run at once without running the container out of
# memory. Reference script for Linux (needs flock from util-linux).
#
# Usage:  heavy-gate.sh <command> [args...]
#
# Config (env; values come from areas.yml caps):
#   HEAVY_GATE_LOCK         slot file prefix; slots are <prefix>.1 .. <prefix>.N
#                           (default /tmp/umbrella-swarm-heavy-gate.lock)
#   HEAVY_GATE_SLOTS        max slots, caps.heavy_gate_slots (default 3)
#   HEAVY_GATE_PER_CHECK_GB memory one check needs, caps.per_check_memory_gb (default 2)
#   HEAVY_GATE_RESERVE_GB   memory kept free, caps.memory_reserve_gb (default 2)
#
# N = floor((available memory - reserve) / per_check), capped at HEAVY_GATE_SLOTS.
# Available memory is read at each try, after the running checks have taken
# theirs, so the test is "does one more check fit now": free memory for one more
# check and a free slot among 1..HEAVY_GATE_SLOTS -> run there. No room ->
# only slot 1 is open, so checks run one at a time. Nothing free -> sleep 3 s and
# retry.
# flock's "busy" code (200) never reaches the caller: the command runs in this
# shell after the lock is taken, and its exit code is returned unchanged.

set -u
[ "$#" -gt 0 ] || { echo "usage: heavy-gate.sh <command> [args...]" >&2; exit 2; }

prefix=${HEAVY_GATE_LOCK:-/tmp/umbrella-swarm-heavy-gate.lock}
max=${HEAVY_GATE_SLOTS:-3}
per=${HEAVY_GATE_PER_CHECK_GB:-2}
reserve=${HEAVY_GATE_RESERVE_GB:-2}

# Available memory in whole GB: cgroup v2 limit when set, else MemAvailable.
avail_gb() {
  cg=/sys/fs/cgroup
  if [ -r "$cg/memory.max" ] && [ "$(cat "$cg/memory.max")" != max ]; then
    echo $(( ($(cat "$cg/memory.max") - $(cat "$cg/memory.current")) / 1073741824 ))
  else
    awk '/^MemAvailable:/ { print int($2 / 1048576) }' /proc/meminfo
  fi
}

# One more check fits in memory right now.
fits() {
  [ $(( ($(avail_gb) - reserve) / per )) -ge 1 ]
}

while :; do
  # Room for one more check -> any slot up to the cap; no room -> slot 1 only,
  # so a tight container still runs heavy checks, one at a time.
  if fits; then n=$max; else n=1; fi
  i=1
  while [ "$i" -le "$n" ]; do
    exec 9>"$prefix.$i"
    flock -n -E 200 9
    rc=$?
    if [ "$rc" -eq 0 ]; then
      # Slot i is held on fd 9 until this script exits. The command doesn't see fd 9.
      "$@" 9>&-
      exit $?
    fi
    exec 9>&-
    [ "$rc" -ne 200 ] && { echo "heavy-gate: flock failed on $prefix.$i ($rc)" >&2; exit 2; }
    i=$((i + 1))
  done
  sleep 3
done
