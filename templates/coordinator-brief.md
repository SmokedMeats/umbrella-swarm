<!--
Area brief issue body. One issue per Active or paused area.
Title: "Swarm area: <slug>, <area name>"
Labels: swarm:state, area:<slug>   Milestone: Continuous   Project Status: In Progress
The coordinator rewrites this body every cycle. Cycle notes go in comments.
GitHub wins when this body disagrees with labels, milestones, or PRs.
No secrets. No chat dumps.
-->

# Area: <slug>, <area name>

**Status:** Active | paused | Next | Parked | Retired · **Merge tier:** 0 | 1 | 2 · **Last cycle:** <YYYY-MM-DD HH:MM CT>

## Area goal (layer 1)

<End-user story: "A user can … and sees …">

**Why it matters:** <why line from areas.yml>

**Done when:** <done-signal from areas.yml>
**How close:** <e.g. 2 of 5 milestones Hit; 8 live tickets left>

## Milestones (layer 2)

| Milestone | Goal line | Open live | State |
| --- | --- | --- | --- |
| [<title>](<url>) | Ships …; done when … Why: … | <n> | building / waiting on grill / Hit |

## Houses (layer 3): work house by house

**In focus:** `<house slug>` (a second one only if files don't overlap)

| House | Milestone | Goal + done-check | Open live | Done-check result |
| --- | --- | --- | --- | --- |
| `<slug>` | <milestone> | <outcome>; done when <numbers> | <n> | not run / PASS <date, evidence> / FAIL → #<gap ticket> |

Next house: `<slug>`, because <how it moves the milestone goal most>.

## Task list

Order is the plan: the house in focus first. Tickets that share files run one after another, not side by side.

| # | Ticket | House | Blocked by | Likely files | State |
| --- | --- | --- | --- | --- | --- |
| 1 | #<n> <title> | `<house>` | — | <globs> | in flight / queued / Ready to merge / lane=<lane> |

## In flight

| Ticket | PR | Agent | Highest rung passed | Notes |
| --- | --- | --- | --- | --- |
| #<n> | #<pr> | <agent id> | R<k> | |

## Ready to merge (with Dispatch)

- #<pr> · receipt complete · pr-ready PASS on <tip sha> · overlaps: <paths or none>

## Leases

- Held: <path> for #<pr> since <date>
- Waiting on: <path> (held by <area>)

## Waiting on the founder

- <grill / merge approval / migration approval / opt-in>, in end-user words

## Decisions

| When | Ticket | Decision | Why |
| --- | --- | --- | --- |

## Corrections this area

- none | <class> → encoded as <lint | test | skill line> (<commit or PR>)

## Findings buffer

<link to this area's findings buffer issue> · last reviewed <date>

## Next

<The first thing the next cycle does>
