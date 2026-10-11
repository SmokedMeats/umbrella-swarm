---
name: swarm
description: >
  Conductor recipe for the product swarm: start, resume, pause, or check status;
  spin up, pause, or retire area coordinators; grant leases; route tickets by area;
  run the merge path with Dispatch. Use under /swarm-mode, or when the founder asks to
  start or resume the swarm. Reuses /triage, /grilling, /to-spec, /to-tickets,
  /implement, /code-review and /correct from umbrella-skills by name (v1 and
  Matt's pack must be installed alongside).
argument-hint: "start | resume | pause [area] | status | rotate | spin-up <area> | park <area> | retire <area>"
---

# Swarm

Bindings: `project.yml` keys, `<dev-branch>`-style placeholders, `areas.yml`, and `standing-product-rules.md` resolve per umbrella-skills [PROJECT-CONFIG.md](../umbrella/PROJECT-CONFIG.md). `areas.yml` and the goal docs live in the private overlay and sync to `docs/swarm/` in the primary product repo (template: `areas.example.yml` in this pack).

Run by **Chief of Staff** under [/swarm-mode](../swarm-mode/SKILL.md). Config is
`areas.yml` (private overlay → `docs/swarm/areas.yml` in the primary repo), mirrored on GitHub. Live state is three kinds of GitHub
issue, all labeled `swarm:state`, on milestone **Continuous**, on the configured Project with Status
**In Progress**:

| Issue | One per | Template |
| --- | --- | --- |
| Swarm state | repo | all areas with status (Active / Next / Parked / Retired) and rank, caps, lease table, merge tiers (below) |
| Area brief | Active or paused area | [coordinator-brief.md](../../templates/coordinator-brief.md) |
| Findings buffer | area | [findings-buffer.md](../../templates/findings-buffer.md) |

These are not work tickets. Nobody pulls them. Kanban hides `label:swarm:state`.

## Start

0. **Prerequisites.** Probe for umbrella-skills and Matt's pack the way
   `/umbrella` §0 does (list in [/swarm-mode](../swarm-mode/SKILL.md) **Prerequisites**).
   Missing → stop and name the install. This recipe calls v1 skills by name; it
   never copies them.
1. Read `areas.yml`. Every open milestone already belongs to one area. Confirm with
   the founder which areas are **Active** (proposed: `areas.yml` `first_wave`; if unset,
   the top-ranked areas). Never run more than
   `caps.active_coordinators` (start from the value in `areas.yml`, typical range 4-6).
   Why the cap: each Active area's workers spend shared cloud-agent rate limits and
   tokens; each adds landed commits the founder, the only reviewer, samples next morning;
   verification isn't trusted yet, so failures cost his time; and more parallel areas
   mean more hot-file collisions. Lauren runs more than 10 only after her environment
   and verification were in place.
2. **Records first.** Every open ticket in those areas' milestones has a milestone,
   a Project Status (see `project.yml`), and an `area:<slug>` label. If not, hand the list to Board
   (`/triage`). Do not label them yourself; triage stays on Board.
3. **Layered goals.** Each area milestone's description starts with its goal line
   ([milestone-goal.md](../../templates/milestone-goal.md)):
   `Ships <X>; done when <user-visible check with real numbers>. Why: <reason>. Area: <slug>.`
   Each live ticket has a `So that:` line ([ticket-goal.md](../../templates/ticket-goal.md))
   above its AC checkboxes. Missing ones go to Board as triage hits. Draft milestone
   lines for the founder to confirm; don't invent numbers. Take them from the tickets.
   Each live house in those areas has its own **house goal**
   ([house-goal.md](../../templates/house-goal.md)): one user-visible outcome,
   narrower than the milestone, with a done-check in real numbers and a `Why:` naming
   the milestone goal. Draft missing ones from the tickets (`areas.yml` `houses[].goal`)
   for the founder to confirm. A house too big for one outcome, spanning two milestones, or
   sitting in two areas goes to Board to split or relabel.
4. Create or find the swarm state issue, one brief issue per Active area, and one
   findings buffer per Active area (create the rest when an area is activated).
5. Launch one coordinator per active area with the packet below. Each coordinator
   runs [/area-coordinator](../area-coordinator/SKILL.md).
6. Post one status line per area to the founder. Name anything waiting on him.

**Coordinator packet:**

```text
AREA          <slug> · area goal (end-user story) · why it matters · done-signal   ← layer 1
BRIEF         <brief issue URL>
BUFFER        <findings buffer issue URL>
MILESTONES    titles + goal lines (with Why) from GitHub   ← layer 2
HOUSES        slugs + house goal lines (done-check, Why) from GitHub / areas.yml   ← layer 3, the coordinator's finish lines
CAPS          coding_subagents_per_area, coding_subagents_total, verifier_fanout, pr_soft_cap_files, cycle,
              per_worker_memory_gb, memory_reserve_gb, heavy_gate_lock, sibling_sessions_allowed
RUNTIME       cursor-cloud | claude-code (worker shapes per **Workers by runtime**)
MERGE_TIER    0 | 1 | 2   (from the swarm state issue)
LEASES        held by this area; hot_files list from areas.yml
SKILL_PATH    skills/area-coordinator/SKILL.md (umbrella-swarm)
V1_SKILLS     by name from umbrella-skills: /wayfinder /to-spec /to-tickets /implement
              /code-review /blast-radius build-verifier /how /why; Matt: /tdd /prototype
              /diagnosing-bugs /codebase-design /research /handoff
COMPANIONS    v1 umbrella/DELEGATION.md, umbrella/BUILD-STANDING.md, umbrella/PROJECTS.md,
              umbrella/DEVICE-QA.md; umbrella-swarm skills/verify-own-work/SKILL.md, skills/recall/SKILL.md
FORBIDDEN     umbrella/SKILL.md; running a grill with the founder; merge outside MERGE_TIER;
              master/Preview/OTA/migrate; editing another area's leased file; triage labels
STANDING      the standing rules list in /swarm-mode
```

**Brief opening order.** Standing rules, then the rule card; the changing part (ticket, files, findings) last so briefs within the hour share a cached prefix (same rule as `/swarm-mode` **Standing rules**).

Where a coordinator runs is a hosting choice: a Cursor Project (cloud coordinator
with its own computer), a Claude Code cloud session, or a durable Grok bot lane. All
read the same brief. Where its **workers** run decides how many can run safely:

## Workers by runtime

A "worker" is any coding agent a coordinator spawns for one ticket. What it shares
with the coordinator depends on the runtime:

| Runtime | What a worker is | Isolation | How to scale |
| --- | --- | --- | --- |
| Cursor cloud | a cloud agent | own VM | one per ticket; the worker caps are the only limit |
| Claude Code, in-process subagent (`Agent` tool) | runs inside the coordinator's container | **shared** CPU, memory, disk, `/tmp` | memory check before each spawn; one heavy check at a time (`heavy_gate_lock`) |
| Claude Code, sibling session (`create_session`, claude-code-remote) | a new cloud session | own container | the way past the memory check |

Why: on 2026-10-11 a garden run put 12 in-process workers in one 15 GB container;
about 5 type checks ran at once, the OOM killer fired 7 times (exit 137), and no
ticket reached a PR in an hour. Cursor workers never hit this because each is its
own VM. The pack had assumed the Cursor shape.

**Detect the runtime from your tools.** A Cursor cloud-agent spawn tool → Cursor
cloud. The `Agent` tool → Claude Code; `create_session` present and
`caps.sibling_sessions_allowed: true` → sibling sessions are available too.

**The caps count every worker.** `caps.coding_subagents_per_area` and
`caps.coding_subagents_total` count coding workers on any runtime: Cursor cloud
agent, in-process subagent, or sibling session. There is no separate sibling cap.
In Claude Code the memory check only picks the **shape** of the next worker inside
those caps:

1. Read available memory: the cgroup limit when one is set
   (`/sys/fs/cgroup/memory.max` minus `memory.current`), otherwise `MemAvailable`
   in `/proc/meminfo`.
2. `available - caps.memory_reserve_gb ≥ caps.per_worker_memory_gb` → spawn
   in-process.
3. Otherwise → a sibling session if `sibling_sessions_allowed`, else queue the
   ticket for the next cycle.

The memory check never applies on Cursor cloud. "Use as many agents as needed"
from the founder raises the configured caps; it never raises the memory check. Past
it, workers become sibling sessions or wait.
Why: the caps are about rate limits, review load and collisions, which don't care
where a worker runs; memory is about one container, so it only picks the shape.

**Sibling-session contract.** Separate containers share no filesystem, so:

- The brief is the full context packet: standing rules, rule card, ticket, ACs,
  shared helpers, lock path. Nothing by reference to `/tmp`, a scratchpad, or a
  file only the coordinator's container has.
- The worker pushes only its own ticket branch, named in the brief. Never
  `<dev-branch>`, Preview, master, or another worker's branch. The coordinator
  fetches that branch to review it.
- A cloud sibling can't message back. The coordinator schedules a check-in
  (`send_later`) and reads the result with `get_session` (status) and
  `list_events` (final report). A `child-session-event` arrives only when a turn
  fails; a clean finish is silent.
- Cost: each sibling is a full session. Use them when the batch needs more workers
  than memory allows, not by default.

## Resume

1. Read the swarm state issue. Then for each area marked Active or paused, run
   [/recall](../recall/SKILL.md) on its brief.
2. Re-detect from GitHub: open PRs by `area:` label, Ready to merge cards, merges
   since the brief's last cycle. GitHub wins over the brief.
3. Relaunch Active coordinators with the packet. Paused stay paused until the founder says.
4. Status line to the founder.

## Pause

- **One area:** mark it `paused` on the swarm state issue. The coordinator lets
  running agents finish their current step, spawns nothing new, rewrites its brief
  with **Next**, posts a cycle comment, and stops. Its leases stay listed but are
  released if another area asks.
- **Everything:** same for every area. Dispatch keeps the merge queue but merges
  nothing new.
- A pause is not a park. A paused area keeps its slot; a Parked area gives it up.

## Status

One line per Active area: goal · open live tickets · in flight · Ready to merge ·
waiting on the founder. One line for the Next list (rank order, ready-for-agent counts).
Then a single list of what needs the founder: grills, merge approvals, migrations,
opt-ins, rotation or cap proposals. Nothing else.

## Rotate

Every Monday, and whenever an Active area meets its done-signal, sits idle three
cycles (nothing ready, nothing in flight), or is blocked on the founder:

1. Move that area to Next or Parked (the founder confirms Parked). Its coordinator runs
   **Pause** first: brief rewritten, leases released.
2. Offer the slot to the top Next area whose `usually_touches` don't overlap an
   Active area's hot files without a lease. The founder can reorder Next.
3. **Start** for the new area only.

Why: a slot goes to the area with the most agent-ready work, not the one that
started first.

**Cap changes** follow `caps.raise_rule` in `areas.yml`: +1 only after a week with
trusted receipts, light morning review, no rate-limit stalls, no cross-area rebase
conflicts and low reverts; −1 after a revert from a missed rung or 3+ rate-limit
stalls in a week. Report the numbers; the founder confirms.

## Routing

Board runs `/triage` on every new issue. **Creation rule at triage:** Board does
not accept an area, milestone, house or ticket without goal + why + done-check (a
ticket: `So that:` line + ≥ 2 AC boxes). A missing part is a triage hit: the item
stays out of every coordinator's plan until it's filled in. Triage now also checks the goal layers:
the ticket has a `So that:` line pointing at its house goal (or milestone goal if
unhoused), the house has a goal line, and the milestone has a goal line. Missing either is a triage hit, the same as a missing milestone.
After triage, routing is mechanical:

1. `area:<slug>` label → that area.
2. Milestone description `Area: <slug>` → that area. Board adds the label.
3. An unhoused bug or `Device QA Fail:` → the `areas.yml` `bugs_area` (Device QA milestone).
4. No milestone → Board adds one first.
5. Area is Next or Parked → no coordinator pulls it. Chief of Staff runs its house
   with classic `/umbrella` (v1) when the founder names it.

One area per ticket. A house never splits across areas.

## When to create and retire

The parent and every coordinator follow the same table (full version in
[/area-coordinator](../area-coordinator/SKILL.md) and `docs/PLAN.md` §4.7):

| Level | Must have before it exists | Create when | Who creates | Retire when |
| --- | --- | --- | --- | --- |
| Area | Goal (end-user story) + Why it matters + done-signal | A burst of 3+ related issues fits no area's goal | Coordinator or parent proposes; **the founder approves**; starts Next or Parked | Done-signal passes, or the founder drops it (quality/infra areas: Parked, never retired) |
| Milestone | `Ships …; done when <numbers>. Why: …. Area: <slug>.` | A slice of an area goal no milestone covers | Coordinator or parent proposes; **the founder approves** | Done-check passes → Hit, closed, proof in the brief (continuous queues never Hit) |
| House | `House <slug>: <one outcome>; done when <numbers>. Why: <milestone goal>. Area: <slug>.` | The current house's done-check passed and the next finishable outcome has no house | **Coordinator** | Done-check passes → PASS + evidence in the brief |
| Ticket | `So that:` line + `## Acceptance criteria` with ≥ 2 checkable boxes | Coordinator splits a house (`/to-tickets` after a lock, or directly) | **Coordinator** | Every AC checked with proof and the lane is Done (merge never marks Done) |

**Refuse** any create that lacks the "must have" column, whoever asks for it.
Why: an item without a done-check can't be finished, verified or retired.
Why the founder approves areas and milestones: they use cap slots and change what ships.
Why coordinators create houses and tickets: those are working units inside a
milestone the founder already approved.

## Theme bursts: fold or new area

When Board flags three or more related tickets that fit no area's goal (shared
milestone or suspected root cause):

1. Overlap check: compare the burst's likely files with each active area's hot files.
2. Fits an existing area's goal → fold it in as a milestone (goal line with Why).
3. Otherwise propose a new area to the founder: name, goal, why, done-signal, and
   milestones with goal lines. No proposal without all of them. Once the founder
   approves, it starts as Next or Parked, never straight to Active past the cap.

## Retire

When an area's done-signal is met, or the founder drops the goal:

1. Coordinator writes its final brief.
2. Leftover and parked tickets keep their milestones. A milestone not Hit moves
   to another area (update its `Area:` line; Board relabels), so none is orphaned.
3. Close the brief issue. Keep the findings buffer open until it's reviewed.
4. Release leases. Update areas.yml status to `Retired`.

Areas listed in `areas.yml` `never_retire` never retire; they can be Parked.

## Leases

The lease table is on the swarm state issue:

```text
<path or glob> · held by <area> · since <date> · for <ticket/PR>
```

- Only the parent grants a lease. A coordinator asks in ESCALATE.
- One migration lease for all of `backend/drizzle/**`. Granting it does not
  approve the migration. The founder approves the migration itself.
- A lease ends when its PR merges or closes.
- Append-only docs (Device QA checklist, Effect Schema inventory, module-intent
  README, lessons) need no lease. They follow "docs last" and keep both sides.

## Merge path

The coordinator hands a PR to Dispatch only with a complete receipt
([verify-own-work](../verify-own-work/SKILL.md)) whose **VERDICT** comes from an
agent that didn't write the PR. Green CI or a bot review is not a verdict.
Why: an author grading its own work misses what it misread (pstack `shipping.md`).
Dispatch:

1. Checks the receipt has every rung the area lists, or N/A with a reason, and a
   VERDICT line (verifier, head SHA, base SHA, patch-id).
2. Checks leases and overlaps with other Ready PRs (soft-queue overlap check).
3. Sends the **before-merge ping**.
4. **Tier 0:** waits for the founder's approval. **Tier 1/2:** merges only if the PR fits
   that tier's rules on the swarm state issue. Otherwise waits for the founder.
5. **Lands one PR at a time from the bottom (stack base first, else oldest Ready), each rechecked on the current tip.**
   Before each merge: rebase the PR onto the current `<dev-branch>` tip, re-run
   `commands.pr_ready` (the `commands.pr_ready_pass` line must name that tip) and CI
   on the rebased head, and apply the **patch-id rule**
   ([verify-own-work](../verify-own-work/SKILL.md) **Verdict across a rebase**):
   same patch-id → the verdict holds; changed → back to the verifier first.
   There is no combined pre-merge check of several PRs: cross-ticket breakage shows
   up here, on the next PR's rebased head.
   Why: each landed PR changes the trunk the next one runs on; checking each against
   the real tip catches what a batch check on a guessed tip misses (pstack
   `autopilot-full.md`).
6. Sends the **after-merge ping**. The coordinator then sets the lane per `/implement`.
   Merge never marks Done.

**Never self-merge,** at any tier: DB migrations, master/Preview promotes, OTA,
auth, Stripe or payments code, shared contracts, data deletion, a failed or missing rung.

A revert of a self-merged PR drops that area one tier and goes through `/correct`.

## Grills

The coordinator prepares the pre-grill gap list (umbrella **Pre-grill**). The
parent runs `/grilling` with the founder, using Context / Choices / Recommend with runner
stories. After the lock: `/to-spec` → `/to-tickets` with the carry fields, then the
area's coordinator picks up the tickets. No spec or ticket approval waits.

## Reuse v1 by name, don't copy

| Need | Skill |
| --- | --- |
| Labels, milestone, house | `/triage` (Board) |
| Interview | `/grilling` (+ `/grill-me` on wayfinder siblings) |
| Spec, tickets | `/to-spec`, `/to-tickets` |
| Build a ticket | `/implement` (child rules, Build loop, Close gate, End of house lanes) |
| Review | `/code-review` (+ `/blast-radius`), `build-verifier` |
| Footgun seams | `/pit-of-success` |
| Module shape | `/codebase-design` |
| Repeat corrections | `/correct` = umbrella **Repeated corrections** |
| Phone | `device-qa-agent` (Mobile QA Engineer), `device-qa-verifier` |
| Fog | `/wayfinder` |
| Next/Parked houses | `/umbrella` (+ `/umbrella-mode`) |
| Explain to the founder | `/how`, `/why`, `/teach`, `/simple-english`, `/wait-what` |

Full table with who runs each skill and when: **Skill map** in `docs/PLAN.md` §6.
