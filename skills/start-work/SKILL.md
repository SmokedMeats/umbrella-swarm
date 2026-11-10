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
   - **Grill-done first.** Prefer tickets whose house/map already has a **locked grill** (gaps closed) and has advanced past grill — i.e. ready for `/to-spec` → `/to-tickets` → `/implement`, or already has implement tickets that pass the **Coding-spawn gate** below. Live status comes from `project.yml` `status_options`. On the example board the coding frontier is **Unclaimed** or **In Progress**. Do **not** Start coding on open live `wayfinder:grilling` / unlocked-grill work while any grill-done ticket that passes that gate exists in Active areas.
   - Among grill-done candidates: not mid-build, not held by another path, not area-roster Parked / `wait:seasons-cadence` unless the founder asked to resume parked, and never `needs:founder` or `needs:spend-approval` (ticket adds or turns on a paid service; Jacob approves first, standing 2026-10-22).
   - **Coding-spawn gate:** read live configured Project Status. Do **not** Start coding when Status is Desk device, Field, Operator, Live Beta, GoLive, or Done, or the issue is closed. Missing/unreadable/conflicting Status → do not Start coding until reconciled (no assign/label/move from this gate). `ready-for-agent`/open alone never enough. Skip when relevant merged implementation evidence covers the ACs, or an active PR/worker already owns the ticket. Project **Parked** remains pre-launch only.
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
6. **On usage recovery** (existing ~2h CoS probe): auto-resume swarm Starts for open tickets that are **not** mid-local only after each ticket passes the **Coding-spawn gate** again. Drop `overflow:local` only when reclaiming for cloud. Prefer cloud for **new** Starts once at or above floor.
7. **Report** one short line: what was picked (ticket/area or grill session), path chosen (cloud|local|grill), and any still-parked or empty-queue items.

## Mid-stop progress notes (local = cloud shape)

Cold restarts read GitHub (`/recall`), so progress must live on issues — not chat — for **both** paths.

**Cloud** (already in `/swarmy`): on usage park, rewrite the area brief `PARKED_CLOUD_USAGE` · timestamp · in flight (agent ids / PRs / tickets) · next tickets · leases · last spawn · error; append findings-buffer comment; set `usage_parked` on swarm:state.

**Local** (required whenever a local `/umbrella` / Grok Build run stops mid-ticket — crash, Window full, handoff, Stop, or Start router parks cloud and continues local):
1. Keep assignee + Project Status **In Progress** (claim stays). Do not move the card to Project **Parked**, Desk device, or Field from this note. Desk device is phone-visible leftover only. Field is outdoor, GPS, or on-wrist proof only. Unclaimed stays unassigned; a structure-only repair (native parent/sub-issues, blocked-by, fitted Pipeline) is not a full triage and does not assign the card. On a fitted Pipeline, tick only a gate you ran, and only with evidence. Status names come from the configured board (`project.yml`). Do not add a Verify Status column.
2. Comment on the ticket (and area brief / swarm:state if Active): `OVERFLOW_LOCAL` · timestamp · branch tip / WIP paths · open PR if any · AC / Build-loop remainder · blockers · next concrete step · machine name. The machine name is the configured runtime, not a hardcoded host.
3. Label or note `overflow:local` so bare Start and the usage probe refuse dual-start and will not yank mid-local to cloud.
4. Do not clear `overflow:local` until the local Build loop for that ticket is empty or the founder explicitly reclaims.

## Pipeline checklist at creation

The later creation rule overrides the earlier sweep: whoever creates a product ticket adds its Pipeline checklist at creation. The board does not sweep for it.

**Code tickets** — fit the template to the ticket; drop steps that do not apply. Tick steps as they clear:

- Spec/grill done
- Code + unit tests
- Rebase + static gates
- Scoped Jest + type-check
- Build Verifier PASS
- Tech Lead (money/locking/migrations, else code review)
- GitGuardian green
- Dispatch GO (head, conflicts, queue order)
- Squash-merge + record SHA
- Preview migrate (if schema changed)
- Lane / Project Status
- Emulator, phone or field test (if applicable)
- Production promote / OTA (only if ticket ships that path, Jacob yes)
- Done / close

**Spec, umbrella and parent tickets** — short list:

- Grill locked
- Spec written
- Child tickets filed
- Close

## Anti-jobs

- Do not ask the founder to pick the next ticket/area for an ordinary bare Start.
- Do not ask the founder to pick cloud vs local for ordinary Starts.
- Do not skip grill-done implement work to open a new grill while that Ready queue has items.
- Do not invent product scope or implement tickets when only grill work remains; grill the founder instead.
- Do not run the same exclusives on cloud and local at once.
- Do not leave a mid-local stop with only chat memory — write the `OVERFLOW_LOCAL` receipt on GitHub.
- Do not invent product scope; do not merge/OTA/migrate from this skill.
- **MESSAGING:** keep messages succinct; DM the 1–2 target bots, never post to a group room.
- Do not flip on-demand Cursor billing without an explicit founder yes.

## Boxes ticked before moving forward (Jacob 2:39 CT 2026-10-15)

- Before a product card moves to Ready to merge: every AC line plus Pipeline boxes Spec/grill through Dispatch GO must be ticked. The same rule for the configured product is umbrella `private-bindings.md` **Product card** when that file is installed.
- Before Done: every AC and every Pipeline box must be ticked.
- A step fitted out counts as cleared only when it's marked N/A with a one-line reason (or struck through).
- If anything is unticked, the card goes back with a comment listing the unticked boxes and AC lines by name.
- Exempt: hand-off lanes Operator, Field, Desk device, Live Beta, GoLive (phone, field or founder steps may stay open there).
- Whoever moves the card (area coordinator, Board, Dispatch) checks this first.

## Before any coding Start (including explicitly named tickets)

Refuse **coding** Start when swarm/area-coordinator **Codable ticket** / **Coding-spawn gate** fails: Status is Desk device, Field, Operator, Live Beta, GoLive, or Done; issue closed; Status missing/unreadable/conflicting; `ready-for-agent`/open alone; relevant merged implementation already covers the ACs; or an active PR/live worker already owns the ticket. Applies even when **Pick the work** is skipped because the founder already named ticket(s) or an area. Permitted non-coding Start outcomes — grill with the founder, Desk/Field/Operator QA, BV/verifier-only — are **not** blocked by this gate.

## Start blockers: checklist and native links (Jacob 5:17 AM CT 2026-11-05)

Do not Start a ticket that lacks a fitted Pipeline checklist, or whose parent/blockers exist only in prose (no native sub-issue / Blocked by link). Bounce it to the creator to fix first. Details: area-coordinator `## Tick owners` and `## Native GitHub structure`. Also refuse coding Start that fails swarm/area-coordinator **Codable ticket** / **Coding-spawn gate** (handoff Status, unclear Status, shipped evidence, or duplicate worker).

## Shared full-flow entry (no new skill)

A coding Start that clears the **Coding-spawn gate** runs `/implement` **Build loop** in full. Swarm mode and standalone runtime coding use that same loop. This skill routes into it. When `/start-work` is not installed, standalone coding still enters `/implement` with the AC, claim, and live Status guards intact.

`/implement` **Build loop** is the procedure. This pack does not add a skill folder and does not copy that loop.

Conditional triggers follow the trigger table in umbrella `CONVENTIONS.md` **Shared full-flow entry**. Do not narrow that table. Until that section is installed beside these skills, a conditional trigger stays blocked. Do not invent a trigger. A missing product policy does not clear a trigger that already fired. A locked bug with a repro follows `/diagnosing-bugs` and `/implement` **Build loop**. Leave the existing grill lock as it is.

Tick each fitted Pipeline box when its owner clears that gate, and record proof of the same kinds area-coordinator `## Tick owners` already requires for an AC box: a link, SHA, log, or screenshot. A box whose condition has not happened stays open. A step the ticket does not include is N/A only with the one-line reason in **Boxes ticked before moving forward**. A required skill that is not installed blocks the step that needs it. Do not mark the missing skill N/A.

`verify-own-work` PR Evidence stays the pilot named in area-coordinator `## Self-prove pilot`. Tech Lead scope stays the fitted Pipeline line in **Pipeline checklist at creation**. Patch-id reuse follows `/build-verifier` **Gate by patch, not commit** and **Merge-queue carry-over**, umbrella `DELEGATION.md` **Recheck at merge**, and area-coordinator `## Gate by patch, not commit`. Fast `commands.pr_ready` runs only when those rules say the verdict holds. A code change in the patch goes back to the verifier. Do not copy those procedures, and do not substitute a shorter rerun list.

## Capability-limited handoff (runtime → configured Chief of Staff → owner)

When this runtime cannot finish a required Project Status or Kanban move, or a merged-branch delete, including a Claude board or branch action this process cannot perform, hand the action on. Post on the ticket, and on the area brief / swarm:state when the area is Active:

`CAPABILITY_HANDOFF` · timestamp · action · limit · ticket · PR · desired lane or branch-audit proof · owner · pending status

The configured **Chief of Staff** role (or the configured parent conductor) routes that note to the owner who already has the access. When the owner finishes, they post a completion receipt on the same thread: what changed, the lane or the branch-audit proof, and the SHA or board state.

Keep Status and any completion evidence already earned. Continue only work that does not depend on the blocked action. An in-progress branch stays until that owner deletes it after merge. Review state comes from the review receipt. A board that has not caught up still shows the last known Status.
