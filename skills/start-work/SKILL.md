---
name: Start work
description: >-
  Use when starting product coding work: pick what to run next (grill-done
  implement first; if only grill left, open grill with the founder). When
  remaining included Cursor usage is below `caps.cloud_usage_floor`, park
  (usage_parked) and never route a new Start to a local machine. One Start,
  no mode or ticket choice. OVERFLOW_LOCAL is a stop receipt only.
---
# Start work

Single Start router: pick **what** to run (when the founder did not name it). A coding Start runs on Cursor cloud, or parks when remaining included Cursor usage is below `caps.cloud_usage_floor`.

**Fleet rule (founder, 2026-11-21).** Do not let bots use their own computer (founder 11:43 AM CT 2026-11-21: "do not let bots use their own computer. it takes too much space. cloud agents for most things"). Only minimal things on a bot's computer, and only if necessary (founder 11:44 AM CT 2026-11-21: "only minimal things on computer. and only if necessary."). No cloning, building, testing or installing on the founder's laptop (founder 2026-11-21 10:39 AM CT: "what is making my computer slow? nothing better be running on it"). Device QA and the founder's own sessions there stay allowed. Expo / EAS is the exception (founder 4:20 PM CT 2026-11-21: "Allow own computers for expo stuff" / "That is an exception"): an EAS build uploads from a clone, and the EAS CLI may run on a bot's own computer. The GitHub-trigger path is not used for the private repo. Everything else heavy stays on cloud agents or the local runner, and the founder's laptop stays off-limits.

Owned by **Chief of Staff** (or whoever parents Start). Quiet on noop after a successful route.

## Inputs

- Optional: ticket(s) or area to Start (issue #s, area slug, or “resume parked”).
- If omitted (bare **Start** / “start a run”): this skill **picks** the next work — do not ask the founder which ticket or area.
- Repo / project binding from standing config (`areas.yml` / umbrella project).

## Steps

1. **Fresh checkout.** In the primary product repo root, run `node scripts/check-fresh.mjs`; stop if it exits non-zero. If that file isn't there, run `git fetch --prune origin` and stop if the fetch fails, or if `git status -sb` shows any of: no upstream (`## <branch>` with no `...origin/…`; a never-pushed branch, so suggest `git push -u origin HEAD`), `[gone]` (the upstream was deleted), `## HEAD (no branch)` (detached HEAD), or `behind`. Ahead only is fine. Only fetch here: never pull, reset, stash, or switch branches (the founder may have work in progress). When you stop, tell the founder one line: the repo, the branch, the state (behind N / diverged / no upstream / upstream gone / detached / fetch failed), and that the checkout was left as it was.
2. **Pick the work** (skip if the founder already named ticket(s) or an area).
   - Prefer **Active** areas from swarm:state / `areas.yml` (within `caps.active_coordinators`).
   - **Grill-done first.** Prefer tickets whose house/map already has a **locked grill** (gaps closed) and has advanced past grill — i.e. ready for `/to-spec` → `/to-tickets` → `/implement`, or already has implement tickets that pass the **Coding-spawn gate** below. Live status comes from `project.yml` `status_options`. On the example board the coding frontier is **Unclaimed** or **In Progress**. Do **not** Start coding on open live `wayfinder:grilling` / unlocked-grill work while any grill-done ticket that passes that gate exists in Active areas.
   - Among grill-done candidates: not mid-build, not held by another path, not area-roster Parked / `wait:seasons-cadence` unless the founder asked to resume parked, and never `needs:founder` or `needs:spend-approval` (ticket adds or turns on a paid service; Jacob approves first, standing 2026-10-22).
   - **Coding-spawn gate:** [area-coordinator](../area-coordinator/SKILL.md) **Codable ticket**. Do not restate it.
   - Break ties with area **Why it matters**, then Next-list rank on swarm:state, then oldest Ready.
   - Cap to one sensible burst (one house or a few non-overlapping tickets) so you do not dual-start exclusives.
   - **Only grill left:** if no grill-done / implement-ready work remains but open live grilling (or pre-grill) work does, **do not invent build tickets**. Parent runs `/grilling` (or `/grill-me` on wayfinder siblings) with the founder — that is the Start outcome. Report “grilling you next” + which house/ticket.
   - If nothing Ready and nothing to grill: say so in one line (and what is blocked); do not invent scope.
3. **One owner.** If the chosen ticket already has `overflow:local`, park it (`usage_parked`). The local build does not keep going. If it has a live cloud agent or an exclusive lease, do not dual-start. Status only; stop. (Grill sessions are founder-facing; they are not dual-started with a coding path on the same house.)
4. **Probe Cursor included usage** the same way `/swarmy` Start gate does (remaining included % and a cloud-agent launch probe). **Skip the usage probe when the picked outcome is a grill session** (no cloud coding route yet).
5. **Route** (coding picks only)
   - **When remaining included Cursor usage is at or above `caps.cloud_usage_floor` (default 10%) and the probe is OK** → cloud path: `/swarmy` Start/Resume for Active areas (Cursor cloud agents). Clear `overflow:local` when this cloud Start reclaims the ticket.
   - **When remaining included Cursor usage is below `caps.cloud_usage_floor`, or the probe fails** → park. Mark `usage_parked` (keeps the Active slot) the same way `/swarmy` **Park for usage** does. Do not route to a local Grok Build or any local machine. Do not mark `overflow:local` on a new Start. Tell the founder briefly: parked, floor. Never enable on-demand billing yourself. Founder 12:54 PM CT 2026-11-21: "Below the floor, Starts wait for cloud usage. No local builds."
6. **In-flight rules**
   - Cloud already running may continue toward 0% until launches fail; on fail set `PARKED_CLOUD_USAGE` / `usage_parked` (keeps Active slot) with the swarm park brief (agent ids / PRs / tickets / leases / error).
   - An in-flight local run stops, writes the OVERFLOW_LOCAL stop receipt, and parks (`usage_parked`). Founder 12:54 PM CT 2026-11-21: "Below the floor, Starts wait for cloud usage. No local builds."
7. **On usage recovery** (existing ~2h CoS probe): auto-resume swarm Starts for open tickets only after each ticket passes the **Coding-spawn gate** again. Clear `overflow:local` on that park or when reclaiming the ticket for cloud. New Starts go to cloud when remaining included Cursor usage is at or above `caps.cloud_usage_floor`.
8. **Report** one short line: what was picked (ticket/area or grill session), path chosen (cloud|parked|grill), and any still-parked or empty-queue items.

## Mid-stop progress notes

Cold restarts read GitHub (`/recall`), so a usage park lives on issues, not chat.

**Cloud** (already in `/swarmy`): on usage park, rewrite the area brief `PARKED_CLOUD_USAGE` · timestamp · in flight (agent ids / PRs / tickets) · next tickets · leases · last spawn · error; append findings-buffer comment; set `usage_parked` on swarm:state.

**OVERFLOW_LOCAL is a stop receipt only.** A new Start never begins a local run. An in-flight local run stops. A ticket left with `overflow:local` parks (`usage_parked`). The local build does not keep going.
1. Keep assignee + Project Status **In Progress**. Do not move the card to Project **Parked** or a handoff lane from this note. Lane names and who may be coded stay [area-coordinator](../area-coordinator/SKILL.md) **Codable ticket**. On a fitted Pipeline, tick only a gate you ran.
2. Comment on the ticket (and area brief / swarm:state if Active): `OVERFLOW_LOCAL` · timestamp · branch tip / WIP paths · open PR if any · AC / Build-loop remainder · blockers · next concrete step · parked `usage_parked` · machine name. The machine name is the configured runtime, not a hardcoded host. This receipt records the stop.
3. Clear `overflow:local` when the ticket parks (`usage_parked`) or when a cloud Start reclaims it.
4. Do not wait for the local Build loop to empty before clearing `overflow:local`.

## Pipeline checklist at creation

Whoever creates a product ticket adds this checklist at creation. The board does not sweep for it. Fit it to the ticket. Tick a box only when that gate ran and the receipt shows it. A `risk: low` merge does not wait on Build Verifier or Tech Lead. It still needs the Land gate pre-merge check. Handoff lanes (Operator, Field, Desk device, Live Beta, GoLive) may stay open. Real-phone QA stays sampled. N/A is a one-line reason. The gate is [verify-own-work](../verify-own-work/SKILL.md) **Scripted gate**, which follows umbrella CONVENTIONS **Land gate**. When umbrella `private-bindings.md` **Product card** is installed, follow that file for the configured product.

**Code tickets**

- Spec/grill done
- Code + unit tests
- `commands.pr_ready` step 1 on the current head (`risk:` from the script; a WAIT that only waits on review is enough here)
- Tech Lead — for money, auth, permissions, entitlements, paid tiers, XP/economy/tokens, migrations, or write routes, when the land gate is high or `risk:` is missing. Deps, config, native, and locking stay Build Verifier only
- Build Verifier — only when the script prints `risk: high` or has no `risk:` field
- `commands.pr_ready` final PASS on the same SHA
- GitGuardian green
- Pre-merge check — every verdict is on the current SHA; no `do not merge` / `MERGE HOLD`; no freeze; not Preview/master; no migration, data deletion, Railway, or workflow change
- Squash-merge + record SHA
- Preview migrate (if schema changed) — founder
- Lane / Project Status
- Emulator, phone, or field test (if applicable). Real-phone QA stays sampled
- Production promote / OTA (only if this ticket ships that path; founder yes)
- Done / close

**Spec, umbrella and parent tickets**

- Grill locked
- Spec written
- Child tickets filed
- Close

## Anti-jobs

- Do not ask the founder to pick the next ticket/area for an ordinary bare Start.
- Do not route a new Start to a local Grok Build or any local machine when remaining included Cursor usage is below `caps.cloud_usage_floor`. Park (`usage_parked`).
- Do not skip grill-done implement work to open a new grill while that Ready queue has items.
- Do not invent product scope or implement tickets when only grill work remains; grill the founder instead.
- Do not let a local build keep going. An in-flight local run stops, writes the `OVERFLOW_LOCAL` stop receipt, and parks (`usage_parked`).
- Do not leave that stop with only chat memory — write the `OVERFLOW_LOCAL` receipt on GitHub.
- Do not invent product scope; do not merge/OTA/migrate from this skill.
- **MESSAGING:** keep messages succinct; DM the 1–2 target bots, never post to a group room.
- Do not flip on-demand Cursor billing without an explicit founder yes.

## Before any coding Start (including explicitly named tickets)

Refuse coding Start when [area-coordinator](../area-coordinator/SKILL.md) **Codable ticket** fails, including when the founder named the ticket. A grill, Desk / Field / Operator QA, and a high-risk Build Verifier are not coding Starts.

## Start blockers

Do not Start a ticket that lacks a fitted Pipeline checklist or native sub-issue / Blocked by links ([area-coordinator](../area-coordinator/SKILL.md) **Native GitHub structure**).

## Shared full-flow entry (no new skill)

A coding Start that clears the **Coding-spawn gate** runs `/implement` **Build loop** in full. Swarm mode and standalone runtime coding use that same loop. This skill routes into it. When `/start-work` is not installed, standalone coding still enters `/implement` with the AC, claim, and live Status guards intact.

`/implement` **Build loop** is the procedure. This pack does not add a skill folder and does not copy that loop.

Conditional triggers follow the trigger table in umbrella `CONVENTIONS.md` **Shared full-flow entry**. Do not narrow that table. Until that section is installed beside these skills, a conditional trigger stays blocked. Do not invent a trigger. A missing product policy does not clear a trigger that already fired. A locked bug with a repro follows `/diagnosing-bugs` and `/implement` **Build loop**. Leave the existing grill lock as it is.

Tick each fitted box when its owner clears that gate, with a link, SHA, log, or screenshot in the receipt. A box whose condition has not happened stays open. A required skill that is not installed blocks the step that needs it.

The merge gate is [verify-own-work](../verify-own-work/SKILL.md) **Scripted gate**. Tech Lead scope is the Tech Lead line in **Pipeline checklist at creation**. Do not paste a second chain.

## Capability-limited handoff (runtime → configured Chief of Staff → owner)

When this runtime cannot finish a required Project Status or Kanban move, or a merged-branch delete, including a Claude board or branch action this process cannot perform, hand the action on. Post on the ticket, and on the area brief / swarm:state when the area is Active:

`CAPABILITY_HANDOFF` · timestamp · action · limit · ticket · PR · desired lane or branch-audit proof · owner · pending status

The configured **Chief of Staff** role (or the configured parent conductor) routes that note to the owner who already has the access. When the owner finishes, they post a completion receipt on the same thread: what changed, the lane or the branch-audit proof, and the SHA or board state.

Keep Status and any completion evidence already earned. Continue only work that does not depend on the blocked action. An in-progress branch stays until that owner deletes it after merge. Review state comes from the review receipt. A board that has not caught up still shows the last known Status.
