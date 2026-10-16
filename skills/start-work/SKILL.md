---
name: Start work
description: >-
  Use when starting product coding work: pick what to run next (grill-done
  implement first; if only grill left, open grill with the founder) and
  auto-pick Cursor cloud vs local Grok Build from included usage — one Start, no
  mode or ticket choice. Local mid-stops write OVERFLOW_LOCAL progress notes
  matching cloud park shape.
---
# Start work

Single Start router: pick **what** to run (when the founder did not name it) and **where** it runs from Cursor included usage.

Owned by **Chief of Staff** (or whoever parents Start). Quiet on noop after a successful route.

## Inputs

- Optional: ticket(s) or area to Start (issue #s, area slug, or “resume parked”).
- If omitted (bare **Start** / “start a run”): this skill **picks** the next work — do not ask the founder which ticket or area.
- Repo / project binding from standing config (`areas.yml` / umbrella project).

## Steps

1. **Pick the work** (skip if the founder already named ticket(s) or an area).
   - Prefer **Active** areas from swarm:state / `areas.yml` (within `caps.active_coordinators`).
   - **Grill-done first.** Prefer tickets whose house/map already has a **locked grill** (gaps closed) and has advanced past grill — i.e. ready for `/to-spec` → `/to-tickets` → `/implement`, or already has implement tickets with `ready-for-agent` / Project Ready (or equivalent). Do **not** Start coding on open live `wayfinder:grilling` / unlocked-grill work while any grill-done implement-ready ticket exists in Active areas.
   - Among grill-done candidates: not mid-build, not held by another path, not Parked / `wait:seasons-cadence` unless the founder asked to resume parked.
   - Break ties with area **Why it matters**, then Next-list rank on swarm:state, then oldest Ready.
   - Cap to one sensible burst (one house or a few non-overlapping tickets) so you do not dual-start exclusives.
   - **Only grill left:** if no grill-done / implement-ready work remains but open live grilling (or pre-grill) work does, **do not invent build tickets**. Parent runs `/grilling` (or `/grill-me` on wayfinder siblings) with the founder — that is the Start outcome. Report “grilling you next” + which house/ticket.
   - If nothing Ready and nothing to grill: say so in one line (and what is blocked); do not invent scope.
2. **One owner.** If the chosen ticket already has `overflow:local` mid-build, or a live cloud agent / exclusive lease, do not dual-start. Status only; stop. (Grill sessions are founder-facing; they are not dual-started with a coding path on the same house.)
3. **Probe Cursor included usage** the same way `/swarmy` Start gate does (remaining included % and a cloud-agent launch probe). **Skip the usage probe when the picked outcome is a grill session** (no cloud/local coding route yet).
4. **Route** (coding picks only)
   - **At or above `caps.cloud_usage_floor` (default 10%) and probe OK** → cloud path: `/swarmy` Start/Resume for Active areas (Cursor cloud agents). Clear any stale `overflow:local` on tickets you are about to Start only if they are not mid-local.
   - **Under floor or probe fails** → local path: same tickets under `/umbrella` on the local machine (Grok Build). Mark each claimed ticket `overflow:local` (and note on swarm:state if Active). Tell the founder briefly: parked cloud / running local. Never enable on-demand billing yourself.
5. **In-flight rules**
   - Cloud already running may continue toward 0% until launches fail; on fail set `PARKED_CLOUD_USAGE` / `usage_parked` (keeps Active slot) with the swarm park brief (agent ids / PRs / tickets / leases / error).
   - Mid-local finishes local — do not yank to cloud mid-build when usage recovers.
6. **On usage recovery** (existing ~2h CoS probe): auto-resume swarm Starts for open tickets that are **not** mid-local; drop `overflow:local` only when reclaiming for cloud. Prefer cloud for **new** Starts once at or above floor.
7. **Report** one short line: what was picked (ticket/area or grill session), path chosen (cloud|local|grill), and any still-parked or empty-queue items.

## Mid-stop progress notes (local = cloud shape)

Cold restarts read GitHub (`/recall`), so progress must live on issues — not chat — for **both** paths.

**Cloud** (already in `/swarmy`): on usage park, rewrite the area brief `PARKED_CLOUD_USAGE` · timestamp · in flight (agent ids / PRs / tickets) · next tickets · leases · last spawn · error; append findings-buffer comment; set `usage_parked` on swarm:state.

**Local** (required whenever a local `/umbrella` / Grok Build run stops mid-ticket — crash, Window full, handoff, Stop, or Start router parks cloud and continues local):
1. Keep assignee + Project Status **In Progress** (claim stays).
2. Comment on the ticket (and area brief / swarm:state if Active): `OVERFLOW_LOCAL` · timestamp · branch tip / WIP paths · open PR if any · AC / Build-loop remainder · blockers · next concrete step · machine name.
3. Label or note `overflow:local` so bare Start and the usage probe refuse dual-start and will not yank mid-local to cloud.
4. Do not clear `overflow:local` until the local Build loop for that ticket is empty or the founder explicitly reclaims.

## Anti-jobs

- Do not ask the founder to pick the next ticket/area for an ordinary bare Start.
- Do not ask the founder to pick cloud vs local for ordinary Starts.
- Do not skip grill-done implement work to open a new grill while that Ready queue has items.
- Do not invent product scope or implement tickets when only grill work remains; grill the founder instead.
- Do not run the same exclusives on cloud and local at once.
- Do not leave a mid-local stop with only chat memory — write the `OVERFLOW_LOCAL` receipt on GitHub.
- Do not invent product scope; do not merge/OTA/migrate from this skill.
- Do not flip on-demand Cursor billing without an explicit founder yes.
