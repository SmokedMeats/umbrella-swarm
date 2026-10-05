---
name: swarm-mode
description: >
  Sticky front door for running the product as a few goal-based area coordinators
  instead of one house at a time. Use for /swarm-mode, when the founder asks to start,
  resume, pause, or check the swarm, or when work belongs to an active area in
  areas.yml. The parent (Chief of Staff) owns founder gates, grills, the area
  roster, leases, and merge tiers; area coordinators run /area-coordinator.
  Houses in Next or Parked areas still go through /umbrella (v1). Requires
  umbrella-skills and Matt's pack installed alongside.
mode: true
disable-model-invocation: false
---

# Swarm mode

Bindings: `project.yml` keys, `<dev-branch>`-style placeholders, `areas.yml`, and `standing-product-rules.md` resolve per umbrella-skills [PROJECT-CONFIG.md](../umbrella/PROJECT-CONFIG.md). `areas.yml` and the goal docs live in the private overlay and sync to `docs/swarm/` in the primary product repo (template: `areas.example.yml` in this pack).

The parent in this mode is **Chief of Staff**. It talks to the founder. It does not code.
It runs the [/swarm](../swarm/SKILL.md) recipe and keeps area coordinators going.

## Non-negotiables

1. **Two front doors, one per kind of work.** Every open milestone belongs to one
   of the areas in `areas.yml`. A ticket in an **Active** area goes to that area's
   coordinator. A ticket in a **Next** or **Parked** area waits, or the parent runs
   its house with classic `/umbrella` when the founder names it. Do not run `/umbrella`
   and a coordinator on the same house.
   Why: the whole app stays covered, but only a few areas burn agents at once.
2. **Parent owns:** area statuses (Active / Next / Parked), the active cap,
   rotation, leases, merge tiers (all on the swarm state issue), grills with the founder,
   founder gates, and spin-up / pause / retire.
3. **Active cap: `caps.active_coordinators` (start 5, range 4-6).** Why: every
   Active area spends shared cloud-agent rate limits and tokens, adds landed commits
   the founder (the only reviewer) samples next morning, and adds hot-file collisions,
   while verification is not yet trusted. Raise or lower it only by the
   `raise_rule` in `areas.yml`. Lauren runs more than 10 only after her environment
   and verification were in place.
4. **Coordinators own:** their area brief issue, their task list, spawning cloud
   agents, verification receipts, and setting lanes after merge. They read
   [/area-coordinator](../area-coordinator/SKILL.md), never `umbrella/SKILL.md`.
5. **State lives on GitHub.** Brief issues, the swarm state issue, and findings
   buffer issues. Never in chat memory. A cold restart runs [/recall](../recall/SKILL.md).
6. **No irreversible step without the founder.** Merge (unless the founder opted that area
   into a tier), master/Preview promote, OTA, migrations, data deletion.
7. **No poteto install.** This pack borrows Lauren Tan's operating model. It does
   not install poteto-mode or pstack.
8. **v1 skills by name, never copied.** See Prerequisites.
9. **Nothing is created without its goal.** No area, milestone, house or ticket
   without goal + why + done-check (a ticket: `So that` + ACs). The founder approves new
   areas and milestones; coordinators create houses and tickets; anything retires
   when its done-check passes. Board enforces this at triage. See `/swarm`
   **When to create and retire**.
   Why: an item without a done-check can't be finished, verified or retired.

## Prerequisites: v1 installed alongside

This pack is a layer on top of **umbrella-skills** (`SmokedMeats/umbrella-skills`)
and **Matt Pocock's skills pack**. It calls their skills by name and copies none of
them. Before Start, probe the same way `/umbrella` §0 does:

1. Matt's pack: `/setup-matt-pocock-skills`, `/domain-modeling`, `/tdd`,
   `/diagnosing-bugs`, `/codebase-design`, `/prototype`, `/handoff`, `/research`,
   `/simple-english`, `/writing-for-agents`.
2. v1 umbrella-skills: `/umbrella` (+ companions `DELEGATION`, `BUILD-STANDING`,
   `PROJECTS`, `DEVICE-QA`, `CLOSE-PARENTS`, `PARKED-TICKETS`, `CURSOR`),
   `/umbrella-mode`, `/triage`, `/wayfinder`, `/grill-me`, `/grilling`, `/to-spec`,
   `/to-tickets`, `/implement`, `/code-review`, `/blast-radius`, `build-verifier`,
   `device-qa-verifier`, `/how`, `/why`, `/teach`, `/teach-me`, `/principles`.
3. Box workflows when present: `device-qa-agent`, `/audit`, `/pit-of-success`,
   `/zero-tech-debt`, the promote workflows.

Missing pack → stop and name the install, the same as `/umbrella` §0. Do not paste
a v1 skill's text into this pack. If v1 changes, umbrella-swarm follows.
Why: one copy of each rule. Two copies drift.

Who runs each v1 skill in the swarm, and when, is the **Skill map** in
`docs/PLAN.md` §6 and the README. No v1 skill is dropped. Anything without a swarm
home (`/teach`, `/teach-me`, `/ask-matt`) stays available through the parent or
`/umbrella`.

## Layered goals

Four layers: area goal (why) > milestone goal (slice) > house goal (focused,
finishable) > ticket. Each agent reads the layer above it.

| Layer | Text | Read by |
| --- | --- | --- |
| Area goal | End-user story + **Why it matters** + done-signal (`areas.yml`, brief issue) | Area coordinator |
| Milestone goal | `Ships <X>; done when <user-visible check with real numbers>. Why: <reason>. Area: <slug>.` | Coding agents |
| House goal | `House <slug>: <one user-visible outcome>; done when <check with real numbers>. Why: <milestone goal> (<link>). Area: <slug>.` | Coordinator (finish line), coding agents |
| Ticket | `So that: <house goal>` (or milestone goal if unhoused) + link (its why) + `## Acceptance criteria` | Verifiers |

A house (`umbrella:<house>`) has its own focused goal, narrower than its milestone
([house-goal.md](../../templates/house-goal.md)). Coordinators work house by house
and use the house done-check to know they're finished and to pick the next. One
house = one milestone = one area. No fifth layer: sub-issues split a ticket.
Why: a milestone is too big to steer by every cycle; a house check can be answered
each cycle.

## What the founder can say

| the founder says | Do |
| --- | --- |
| "start the swarm" / `/swarm-mode` | `/swarm` **Start** |
| "resume" / a new session | `/swarm` **Resume** |
| "pause <area>" / "pause everything" | `/swarm` **Pause** |
| "status" | `/swarm` **Status**: one line per area, then anything waiting on the founder |
| "work on <house>" for a house in a Next or Parked area | `/umbrella` (classic, v1), parent stays Chief of Staff |
| "rotate" / "activate <area>" / "park <area>" | `/swarm` **Rotate** |
| "raise the cap" / "lower the cap" | Check `raise_rule` in `areas.yml`, report the numbers, change it only if the founder confirms |
| "opt <area> into Tier 1" | Write it on the swarm state issue. Dispatch enforces it. |
| "make <milestone> part of <area>" | Update the milestone's `Area:` line and areas.yml; Board relabels |

## Standing rules this mode keeps

Repeat these to every coordinator packet:

- Every agent brief starts with the same opening block: standing rules, then the rule card; the changing part (ticket, files, findings) goes last so briefs within the hour share a cached prefix.
- Every product issue has a milestone and is on the configured Project board with a Status.
- Triage stays on Board (`/triage`). Board also enforces the milestone goal line, the house goal line and the ticket `So that:` line.
- Merge does not mark Done. The lane after merge is Desk device, Field, Operator, or Done (`/implement` **End of house** table).
- Phone-visible issues stay open on Desk device for Device QA.
- Every PR into `<dev-branch>` carries a `commands.pr_ready_pass` line naming the current `<dev-branch>` tip. It's a local script with no paid GitHub Actions.
- Dispatch sends the before-merge and after-merge pings.
- Grills use Context / Choices / Recommend with end-user stories (`/grilling`), run by the parent with the founder.
- Grill lock → `/to-spec` → `/to-tickets` keep `CARRY_FROM_GRILL` / `CARRY_FROM_SPEC`.
- `/correct` (umbrella **Repeated corrections**) turns a repeat correction into lint rule > test > skill line.
- master and Preview promote only when the founder says so. DB migrations need the founder's approval.
- the founder approves each merge unless he opted that area into a higher tier.

## Return contract (coordinator → parent)

Each coordinator's cycle comment on its brief issue includes STATUS, IN_FLIGHT,
READY_FOR_MERGE, LEASES, ESCALATE[], NEXT. The parent re-reads GitHub. It does not
trust NEXT for routing.
