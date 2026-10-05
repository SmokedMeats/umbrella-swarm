# umbrella-swarm

**Status: draft.** Nothing here is installed or synced anywhere yet.

umbrella-swarm is a second way to drive the [umbrella-skills](https://github.com/SmokedMeats/umbrella-skills) skills: **area coordinators** each run the umbrella loop on their own goal while the founder reviews on a cadence. umbrella-skills stays the solo `/umbrella` loop. Requires umbrella-skills and Matt Pocock skills installed.

This pack adds a **swarm mode** on top of [umbrella-skills](https://github.com/SmokedMeats/umbrella-skills) (v1), which sits on top of [Matt Pocock's skills](https://github.com/mattpocock/skills). It is modeled on how Lauren Tan (poteto) runs many agents: area coordinators ("chiefs of staff"), each owning a goal, keeping a task list, and spawning cloud agents to do the coding. Verification receipts let agents carry more of the merge path, and the human samples after merge.

It does not replace `/umbrella`. Houses in areas that aren't Active still run through `/umbrella` exactly as they do today.

Read the plan shape first: [docs/PLAN.md](docs/PLAN.md). Product-specific area maps and goal docs live in a **private overlay** (see [Project config](#project-config)).

## Requires v1 alongside

umbrella-swarm **depends on umbrella-skills and Matt's pack being installed alongside it.** Its skills call v1 and Matt skills **by name** (`/triage`, `/implement`, `/code-review`, …) and copy none of them. `/swarm` Start probes for both packs the same way `/umbrella` §0 does, and stops if one is missing.
Why: one copy of each rule. If v1 changes, umbrella-swarm follows without a sync.

## What's in it

| Path | What |
| --- | --- |
| [docs/PLAN.md](docs/PLAN.md) | Plan *shape*: cap, layered goals, handoffs, verification, collisions, rotation |
| [areas.example.yml](areas.example.yml) | Example area map — copy into your private overlay as `areas.yml` |
| [project.example.yml](project.example.yml) | Shared project bindings schema (with umbrella-skills) |
| [skills/swarm-mode](skills/swarm-mode/SKILL.md) | Sticky front door, like `umbrella-mode`. Chief of Staff is the parent. |
| [skills/swarm](skills/swarm/SKILL.md) | Conductor recipe: start, resume, pause, status, rotate, routing, leases, merge path |
| [skills/area-coordinator](skills/area-coordinator/SKILL.md) | What a coordinator does each cycle, house by house |
| [skills/verify-own-work](skills/verify-own-work/SKILL.md) | Verification ladder R0–R7 and the receipt |
| [skills/recall](skills/recall/SKILL.md) | Rebuild context from GitHub and transcripts on restart |
| [templates/](templates/) | Brief, findings buffer, verification receipt, goal-line templates |

## Areas and the active cap

Every open milestone maps to exactly one **goal-based area**. Nothing sits on a shelf. Each area is **Active** (a coordinator runs it), **Next** (ranked for the next free slot), **Parked** (no coordinator for now; Chief of Staff can still run its houses with `/umbrella` when the founder asks), or **Retired**.

**Only a few areas run at once** (example range 4–6). Why:

1. Each coordinator's workers draw on the same cloud-agent rate limits and tokens.
2. Each Active area adds landed commits that the founder samples on a review cadence.
3. Verification isn't trusted yet, so each failure that slips through costs founder time.
4. More parallel areas means more hot-file collisions and rebase churn.

Raise the cap only after trusted receipts, a light review load, no rate-limit stalls, no cross-area rebase conflicts, and a low revert rate. Full rules: [PLAN.md](docs/PLAN.md) and `caps` in your private `areas.yml`.

## Layered goals

Four layers, each with a why:

1. **Area goal** (the why): end-user story, *Why it matters*, done-signal. The coordinator reads it.
2. **Milestone goal** (the slice): `Ships <X>; done when <user-visible check with real numbers>. Why: <reason>. Area: <slug>.`
3. **House goal** (focused, finishable): `House <slug>: <one user-visible outcome>; done when <check with real numbers>. Why: <milestone goal>. Area: <slug>.`
4. **Ticket**: `So that: <house goal>` (its why) plus the existing AC checkboxes. Verifiers check the ACs.

Sub-issues split a ticket; they are not goals. Board enforces layers 2–4 at triage.
Why: a milestone is too big to steer by each cycle. A house check can be answered every cycle.

## Nothing is created without its goal

Board refuses a new milestone, house, or ticket that lacks its goal line / `So that`. Templates: [templates/milestone-goal.md](templates/milestone-goal.md), [templates/house-goal.md](templates/house-goal.md), [templates/ticket-goal.md](templates/ticket-goal.md).

## Roles

| Role | Job |
| --- | --- |
| **Chief of Staff** (parent) | Talks to the founder; owns grills, irreversible gates, rotation |
| **Area coordinator** | Runs one Active area's umbrella loop via subagents |
| **Board** | Triage / intake; enforces goal lines |
| **Dispatch** | Merge-path checks |
| **Founder** | Merges (unless an area opted into a higher tier), promotes held branches, migrates |

Generic role names are intentional. Bind founder display name and board ids in `project.yml`.

## Project config

Public umbrella-swarm ships **no product area map** and **no milestone/house goal SSOT**.

1. Copy [`project.example.yml`](project.example.yml) → `project.yml` (or use the shared private overlay with umbrella-skills).
2. Copy [`areas.example.yml`](areas.example.yml) → `areas.yml` in that private overlay.
3. Keep goal docs (`house-goals.md`, `milestone-goals.md`, `ticket-goals-log.md`, product `PLAN.md`) in the private overlay only.
4. After `umbrella-skills` `scripts/sync-workspace.mjs` runs with the private overlay present, skills resolve `areas.yml` from `docs/swarm/` (primary repo) or the overlay path configured in `project.yml`.

See also umbrella-skills README **Project config** and the private overlay README for the layering plan.

## Skill map (high level)

| Skill | Who | When |
| --- | --- | --- |
| `/swarm-mode` | Parent (Chief of Staff) | Sticky swarm front door |
| `/swarm` | Parent | Start / resume / pause / status / rotate |
| `/area-coordinator` | Per Active area | Each cycle, house by house |
| `/verify-own-work` | Worker / coordinator | Before merge autonomy rises |
| `/recall` | Parent on restart | Rebuild from GitHub + transcripts |
| `/umbrella` (v1) | Parent | Any house in Next/Parked when the founder names it |
| `/grill-me` (v1) | Parent with founder | Live grilling (founder gate) |

## Before pushing

This repo is (or will be) public. Every push runs a local `check:public-safe` gate (no CI minutes): [gitleaks](https://github.com/gitleaks/gitleaks) over the commits being pushed, then a private denylist over every added line, new file path, and commit message in those commits.

One-time setup per clone:

```bash
git config core.hooksPath .githooks
# gitleaks: brew install gitleaks | winget install gitleaks | scoop install gitleaks | release binary on Linux
# The private denylist is found via $PUBLIC_SAFE_DENYLIST, `git config publicsafe.denylist`,
# or a sibling clone carrying public-safe/denylist.txt. Missing denylist = push blocked.
```

Run it by hand (needs Node 18+; works in bash, Git Bash, and PowerShell):

```bash
node scripts/check-public-safe.mjs              # origin default branch..HEAD
node scripts/check-public-safe.mjs --base <ref> # <ref>..HEAD, e.g. a stacked PR
node scripts/check-public-safe.mjs --tree       # whole tracked tree at HEAD (audit)
```

A clean run prints one line, e.g. `check:public-safe PASS <repo>@<sha> (gitleaks 0, denylist 0)`. Paste that line in the PR body.

## Sources

- Matt Pocock × Lauren Tan livestream, "shipping 1,000's of PRs a month", 2026-10-03 (`MN9dGgmLyso`).

## License

MIT. See [LICENSE](./LICENSE). Portions derived from [mattpocock/skills](https://github.com/mattpocock/skills).
