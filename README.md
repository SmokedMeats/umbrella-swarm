# umbrella-swarm

> **Draft.** The skills install and run, but the multi-agent way of working they describe is still being tried out. It is not a replacement for solo `/umbrella`.

Run **several AI agents on one product at once**, each owning one product goal, while one human reviews a sample of what lands.

It is an add-on to [umbrella-skills](https://github.com/SmokedMeats/umbrella-skills). With umbrella-skills alone, one agent runs `/umbrella` on one batch of issues (a house) at a time. With this pack, a lead agent (the **Chief of Staff**) starts a few **area coordinators**. Each coordinator owns one goal, runs the umbrella loop for it house by house, and hands coding to worker agents that attach a verification receipt to every change. The shape is borrowed from how [Lauren Tan (poteto)](https://github.com/poteto) runs many agents at once.

**Who it is for:** someone already using umbrella-skills who has more ready work than one agent session can carry, and enough cloud-agent capacity to run 4–6 coordinators.

## Install

This pack installs with umbrella-skills. The umbrella-skills installer clones this repo next to it and installs both, plus the upstream packs they need:

```bash
git clone https://github.com/SmokedMeats/umbrella-skills.git
node umbrella-skills/scripts/install.mjs
```

Already have umbrella-skills? Clone this repo next to it (`git clone https://github.com/SmokedMeats/umbrella-swarm.git`) and run `node umbrella-skills/scripts/install.mjs` again.

## First run

1. Finish the umbrella-skills **First run** (`/setup-matt-pocock-skills`, labels, `docs/agents/project.yml`).
2. Copy [`areas.example.yml`](areas.example.yml) to `docs/swarm/areas.yml` in your main repo (or the path `project.yml` names) and list your areas, each with a goal and a done-signal. Read [docs/PLAN.md](docs/PLAN.md) first: it says what an area plan must cover.
3. Say **`/swarmy-mode`** (or "start the swarm") to your agent. Say **Start** for the next piece of work (`/start-work` picks it), or `/swarmy status`, `pause`, `resume`, `rotate`.

## What's in it

| Path | What |
| --- | --- |
| [skills/swarmy-mode](skills/swarmy-mode/SKILL.md) | Sticky front door, like `umbrella-mode`. The parent agent is the Chief of Staff. |
| [skills/swarmy](skills/swarmy/SKILL.md) | The conductor: start, resume, pause, status, rotate, routing, file leases, merge path. |
| [skills/start-work](skills/start-work/SKILL.md) | Picks what to run next on a bare "Start" (grill-done builds first, then grills). |
| [skills/area-coordinator](skills/area-coordinator/SKILL.md) | What a coordinator does each cycle, house by house. |
| [skills/verify-own-work](skills/verify-own-work/SKILL.md) | The verification ladder (rungs R0–R7) and the receipt a worker attaches. |
| [skills/recall](skills/recall/SKILL.md) | Rebuilds context from GitHub and transcripts after a restart. |
| [skills/swarmy/templates/](skills/swarmy/templates/) | Coordinator brief, findings buffer, receipt, and goal-line templates. |
| [skills/swarmy/SKILL-MAP.md](skills/swarmy/SKILL-MAP.md) | Every skill the swarm uses, who runs it, and when. |
| [docs/PLAN.md](docs/PLAN.md) | What a swarm plan must cover: cap, areas, goals, handoffs, verification, collisions, rotation. |
| [areas.example.yml](areas.example.yml) | Example area map. |
| [project.example.yml](project.example.yml) | Project settings; the same file as umbrella-skills'. |

It needs [umbrella-skills](https://github.com/SmokedMeats/umbrella-skills), [Matt Pocock's skills](https://github.com/mattpocock/skills) and [SimpleEnglish](https://github.com/AminBlg/SimpleEnglish); the installer above puts all of them in place. These skills call those by name and copy none of their rules, so the swarm follows when umbrella-skills changes. `/swarmy` **Start** stops and names any pack that is missing.

## Words used here

| Word | Meaning |
| --- | --- |
| **Founder** | The human who owns the product. Makes the irreversible calls (promotes to held branches, OTA app updates, migrations, data deletion, deploy config, workflow files, and spend). The author session merges a `<dev-branch>` PR after the land gate. |
| **Area** | One product goal (for example "checkout works offline"). Every open milestone belongs to exactly one area. |
| **House** | A named pack of related issues worked as a unit (the `umbrella:…` label from umbrella-skills). Smaller than a milestone. |
| **Area coordinator** | An agent that runs the umbrella loop for one area, house by house. |
| **Chief of Staff** | The lead agent. Talks to the founder, starts and stops coordinators. |
| **Receipt** | A short record of what a worker checked before asking to merge. |

Shared words (house, lane, Ship mode, land gate, ...) are in the umbrella-skills [glossary](https://github.com/SmokedMeats/umbrella-skills/blob/main/docs/GLOSSARY.md).

## Only a few areas run at once

Each area has a status:

- **Active**: a coordinator is running it.
- **Next**: ranked for the next free slot.
- **Parked**: no coordinator for now. The Chief of Staff can still run its houses with `/umbrella` when the founder asks.
- **Retired**: done.

Only a few areas are Active at a time (the example uses 5; typical range 4–6). Why:

1. All workers share the same cloud-agent rate limits and token budget.
2. Every Active area adds landed commits the founder has to sample.
3. Verification is not fully trusted yet, so each miss costs founder time.
4. More parallel areas means more edits to the same files and more rebase churn.

Raise the cap only when receipts are trusted, review stays light, there are no rate-limit stalls or cross-area conflicts, and reverts are rare. The rules live in [PLAN.md](docs/PLAN.md) and `caps` in your `areas.yml`.

Where workers run matters too. On Cursor cloud each worker gets its own VM. On Claude Code, subagents share the coordinator's container, so a coordinator checks free memory before each spawn and sends the overflow to sibling cloud sessions; heavy checks go through umbrella-skills' slotted `heavy` gate, one per container, and tests stay narrow: only the touched files and their direct callers. The merge gate is verify-own-work **Scripted gate** (`commands.pr_ready`). The worker caps count every worker on any runtime. Details: `/swarmy` **Workers by runtime**.

## Every goal has a why

Work is split into four layers. Each one names its goal, its why, and how you know it is done.

1. **Area goal**: the user story, why it matters, and the done-signal. The coordinator steers by it.
2. **Milestone goal**: `Ships <X>; done when <user-visible check with real numbers>. Why: <reason>. Area: <slug>.`
3. **House goal**: `House <slug>: <one user-visible outcome>; done when <check with real numbers>. Why: <milestone goal>. Area: <slug>.`
4. **Ticket**: `So that: <house goal>`, plus the usual acceptance-criteria checkboxes. Verifiers check those boxes.

Why four layers: a milestone is too big to steer by every cycle. A house check can be answered every cycle.

Sub-issues split a ticket; they are not goals. **Nothing is created without its goal line.** The Board role refuses a milestone, house, or ticket that lacks one at triage. Templates: [milestone](skills/swarmy/templates/milestone-goal.md), [house](skills/swarmy/templates/house-goal.md), [ticket](skills/swarmy/templates/ticket-goal.md).

## Roles

| Role | Job |
| --- | --- |
| **Chief of Staff** (parent agent) | Talks to the founder. Owns grills, irreversible gates, and rotation. |
| **Area coordinator** | Runs one Active area's umbrella loop through subagents. |
| **Board** | Triage and intake. Enforces goal lines. |
| **Dispatch** | Land order and hot-file conflicts. The merge gate is the product `check:pr-ready` script. |
| **Founder** (human) | Promotes to held branches, OTA app updates, migrations, data deletion, deploy config, workflow files, and spend. The author session merges a `<dev-branch>` PR after the land gate. |

The names are generic on purpose. Bind the founder's display name and board ids in `project.yml`.

## Project config

This repo ships **no product area map and no product goals**. Keep those private:

1. Copy [`project.example.yml`](project.example.yml) to `project.yml` (or share one private config repo with umbrella-skills).
2. Copy [`areas.example.yml`](areas.example.yml) to `areas.yml` in that private config.
3. Keep goal docs (house goals, milestone goals, ticket goal log, product plan) there too.
4. After the installer (or `sync-workspace.mjs`) runs with the private config present, skills find `areas.yml` at `docs/swarm/` in the primary repo, or at the path set in `project.yml`.

The umbrella-skills README, **Project config**, explains the private config layout.

## Sources

- Matt Pocock × Lauren Tan livestream, "shipping 1,000's of PRs a month", 2026-10-03 (`MN9dGgmLyso`).

Maintainers: [MAINTAINING.md](MAINTAINING.md).

## License

MIT. See [LICENSE](./LICENSE). Portions derived from [mattpocock/skills](https://github.com/mattpocock/skills).
