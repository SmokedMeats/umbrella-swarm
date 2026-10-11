# umbrella-swarm

> **Status: draft.** "Draft" means the multi-agent swarm *workflow* is experimental: the skills can be read and installed, but the way of working they describe is still being tried out. It is not a finished replacement for solo `/umbrella`.

## What it is

umbrella-swarm lets **several AI agents work on one product at the same time**, each on its own goal, while one human reviews their output on a schedule.

It is an add-on to [umbrella-skills](https://github.com/SmokedMeats/umbrella-skills). With umbrella-skills alone, one agent runs `/umbrella` and works through one pack of issues at a time. With umbrella-swarm, a lead agent starts a few **area coordinators**. Each coordinator owns one product goal, runs the same umbrella loop for that goal, and hands coding to worker agents. Workers attach a **verification receipt** to each change, so agents can carry more of the merge path. The human checks a sample of the work after it lands.

The multi-agent shape is borrowed from how [Lauren Tan (poteto)](https://github.com/poteto) runs many agents at once: coordinators ("chiefs of staff"), each owning a goal, keeping a task list, and spawning cloud agents to write the code.

## What it is not

- **Not a replacement for `/umbrella`.** Solo `/umbrella` keeps working as before. Work outside the running areas still goes through `/umbrella`.
- **Not standalone.** It calls umbrella-skills and Matt Pocock's skills by name and copies none of them. See [Depends on](#depends-on).
- **Not tied to one product.** This repo ships no real area map, goals, or product rules. You keep those in your own private config. See [Project config](#project-config).

## Words used here

| Word | Meaning |
| --- | --- |
| **Founder** | The human who owns the product. Reviews, merges, and makes the irreversible calls. |
| **Area** | One product goal (for example "checkout works offline"). Every open milestone belongs to exactly one area. |
| **House** | A named pack of related issues worked as a unit (the `umbrella:…` label from umbrella-skills). Smaller than a milestone. |
| **Area coordinator** | An agent that runs the umbrella loop for one area, house by house. |
| **Chief of Staff** | The lead agent. Talks to the founder, starts and stops coordinators. |
| **Receipt** | A short record of what a worker checked before asking to merge. |

## Depends on

Install in this order. Later packs call earlier ones by name.

| # | Pack | Why it is needed |
| --- | --- | --- |
| 1 | [mattpocock/skills](https://github.com/mattpocock/skills) (v1.3.1) | The base skills that do the work: `/grill-me`, `/to-spec`, `/to-tickets`, `/implement`, `/tdd`, … |
| 1b | [AminBlg/SimpleEnglish](https://github.com/AminBlg/SimpleEnglish) | `/simple-english` for status, ship notes and grill leftovers |
| 2 | [SmokedMeats/umbrella-skills](https://github.com/SmokedMeats/umbrella-skills) | `/umbrella`, `/triage`, `/code-review`, the verifiers, and the house rules this pack drives |
| 3 | [SmokedMeats/umbrella-swarm](https://github.com/SmokedMeats/umbrella-swarm) (this repo) | Swarm mode on top of the two above |

`/swarm` **Start** checks that packs 1, 1b and 2 are installed, the same way `/umbrella` does. If one is missing, it stops and tells you what to install.

Why by name, not copied: this pack's skills say "run `/implement`", they don't restate `/implement`'s rules, so there is one copy of each rule and the swarm follows when umbrella-skills changes. That is about the *text of the rules*. Real files still get copied on install: the sync script writes each pack into every agent's skills folder and into your product repos, and the private umbrella-skills clone keeps pinned backups of Matt's pack, SimpleEnglish, and pstack in `vendor/` so an outside repo going away never breaks an install (umbrella-skills README **Where skills live**).

## Install

The simplest path is to clone this repo **next to** your umbrella-skills clone and run umbrella-skills' sync script. It installs both packs. From the private umbrella-skills clone it also installs the pinned Matt pack and SimpleEnglish from `vendor/`, so step 1 is only for public clones.

```bash
# 1. Matt's pack + SimpleEnglish (public clones only), then run /setup-matt-pocock-skills in each repo
npx skills@latest add mattpocock/skills
npx skills@latest add https://github.com/AminBlg/SimpleEnglish --skill simple-english

# 2 + 3. umbrella-skills and umbrella-swarm as sibling folders
git clone https://github.com/SmokedMeats/umbrella-skills.git
git clone https://github.com/SmokedMeats/umbrella-swarm.git
cd umbrella-skills
node scripts/sync-workspace.mjs
```

When a sibling `umbrella-swarm` folder exists, `sync-workspace.mjs` copies its `skills/*` into the same skill roots as umbrella-skills: `~/.grok`, `~/.cursor`, `~/.claude`, `~/.agents`, `~/.copilot` (VS Code reads the last three), each product repo's `workspace.skill_targets` folders, and `--box` / `--dest` roots. Commit those product-repo folders so cloud agents see them, and re-run sync after a pack changes; never edit the installed copies. Use `--no-swarm` to skip the swarm pack. Details: the umbrella-skills README, **Install**.

Then say `/swarm-mode` (or "start the swarm") in your agent.

## What's in it

| Path | What |
| --- | --- |
| [docs/PLAN.md](docs/PLAN.md) | What a swarm plan must cover: cap, areas, goals, handoffs, verification, collisions, rotation. Read this first. |
| [skills/swarm-mode](skills/swarm-mode/SKILL.md) | Sticky front door, like `umbrella-mode`. The Chief of Staff is the parent agent. |
| [skills/swarm](skills/swarm/SKILL.md) | The conductor: start, resume, pause, status, rotate, routing, file leases, merge path. |
| [skills/area-coordinator](skills/area-coordinator/SKILL.md) | What a coordinator does each cycle, house by house. |
| [skills/verify-own-work](skills/verify-own-work/SKILL.md) | The verification ladder (rungs R0–R7) and the receipt. |
| [skills/recall](skills/recall/SKILL.md) | Rebuilds context from GitHub and transcripts after a restart. |
| [skills/swarm/templates/](skills/swarm/templates/) | Coordinator brief, findings buffer, receipt, and goal-line templates. |
| [areas.example.yml](areas.example.yml) | Example area map. Copy to `areas.yml` in your private config. |
| [project.example.yml](project.example.yml) | Project settings (repo, branches, boards, `limits`). The same file as umbrella-skills'; change it there first. |
| [MAINTAINING.md](MAINTAINING.md) | For maintainers: private vs public snapshot, `scripts/publish-public.sh`, and the one-copy rule with umbrella-skills. |

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

Where workers run matters too. On Cursor cloud each worker gets its own VM. On Claude Code, subagents share the coordinator's container, so a coordinator checks free memory before each spawn and sends the overflow to sibling cloud sessions; heavy checks (type check, `pr_ready`) go through umbrella-skills' slotted `heavy` gate, one per container, and tests stay narrow: only the touched files and their direct callers. Each ticket gets about three full type-check rounds: the worker's package `verify`, the verifier's `verify` + `pr_ready`, and one `pr_ready` at merge only if the base moved (verify-own-work **Check budget per ticket**). The worker caps count every worker on any runtime. Details: `/swarm` **Workers by runtime**.

## Every goal has a why

Work is split into four layers. Each one names its goal, its why, and how you know it is done.

1. **Area goal**: the user story, why it matters, and the done-signal. The coordinator steers by it.
2. **Milestone goal**: `Ships <X>; done when <user-visible check with real numbers>. Why: <reason>. Area: <slug>.`
3. **House goal**: `House <slug>: <one user-visible outcome>; done when <check with real numbers>. Why: <milestone goal>. Area: <slug>.`
4. **Ticket**: `So that: <house goal>`, plus the usual acceptance-criteria checkboxes. Verifiers check those boxes.

Why four layers: a milestone is too big to steer by every cycle. A house check can be answered every cycle.

Sub-issues split a ticket; they are not goals. **Nothing is created without its goal line.** The Board role refuses a milestone, house, or ticket that lacks one at triage. Templates: [milestone](templates/milestone-goal.md), [house](templates/house-goal.md), [ticket](templates/ticket-goal.md).

## Roles

| Role | Job |
| --- | --- |
| **Chief of Staff** (parent agent) | Talks to the founder. Owns grills, irreversible gates, and rotation. |
| **Area coordinator** | Runs one Active area's umbrella loop through subagents. |
| **Board** | Triage and intake. Enforces goal lines. |
| **Dispatch** | Merge-path checks. |
| **Founder** (human) | Merges (unless an area earned a higher autonomy tier), promotes held branches, runs migrations. |

The names are generic on purpose. Bind the founder's display name and board ids in `project.yml`.

## Project config

This repo ships **no product area map and no product goals**. Keep those private:

1. Copy [`project.example.yml`](project.example.yml) to `project.yml` (or share one private config repo with umbrella-skills).
2. Copy [`areas.example.yml`](areas.example.yml) to `areas.yml` in that private config.
3. Keep goal docs (house goals, milestone goals, ticket goal log, product plan) there too.
4. After `sync-workspace.mjs` runs with the private config present, skills find `areas.yml` at `docs/swarm/` in the primary repo, or at the path set in `project.yml`.

The umbrella-skills README, **Project config**, explains the private config layout.

## Skill map

[skills/swarm/SKILL-MAP.md](skills/swarm/SKILL-MAP.md): every skill the swarm uses (this pack, umbrella-skills, Matt's pack, SimpleEnglish), who runs it, and when. It ships inside the `swarm` skill so installed agents can read it.

## Before pushing

Every push runs a local `check:public-safe` gate (no CI) so private content cannot reach the public snapshot. It runs [gitleaks](https://github.com/gitleaks/gitleaks) over the commits being pushed, then checks every added line, new file path, and commit message against a private denylist.

One-time setup per clone (`sync-workspace.mjs` does this for sibling clones):

```bash
git config core.hooksPath .githooks
# gitleaks: brew install gitleaks | winget install gitleaks | scoop install gitleaks | release binary on Linux
# Denylist lookup: $PUBLIC_SAFE_DENYLIST, `git config publicsafe.denylist`,
# or a sibling clone with public-safe/denylist.txt. No denylist = push blocked.
```

Run it by hand (Node 18+; bash, Git Bash, or PowerShell):

```bash
node scripts/check-public-safe.mjs              # origin default branch..HEAD
node scripts/check-public-safe.mjs --base <ref> # <ref>..HEAD, e.g. a stacked PR
node scripts/check-public-safe.mjs --tree       # whole tracked tree at HEAD (audit)
```

A clean run prints one line, e.g. `check:public-safe PASS <repo>@<sha> (gitleaks 0, denylist 0)`. Paste it in the PR body.

## Sources

- Matt Pocock × Lauren Tan livestream, "shipping 1,000's of PRs a month", 2026-10-03 (`MN9dGgmLyso`).

## License

MIT. See [LICENSE](./LICENSE). Portions derived from [mattpocock/skills](https://github.com/mattpocock/skills).
