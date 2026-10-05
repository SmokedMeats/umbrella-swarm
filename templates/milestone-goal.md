# Milestone goal line (layer 2 of 4)

Goals go: area goal (the why) > **milestone goal (the slice)** > house goal
(focused, finishable; [house-goal.md](house-goal.md)) > ticket (`So that` + ACs).

Put this as the **first line** of the milestone description. Ticket lists and notes
can follow it.

```text
Ships <what a user gets>; done when <a check a user can see, with real numbers>. Why: <why it matters to a user>. Area: <slug>.
```

## Rules

- One line. End-user words (`project.yml` `product.end_user`), not code words.
- `Ships <noun phrase>` or `Ships: <user story>` both work. Keep product drafts in
  your private overlay (e.g. `docs/swarm/milestone-goals.md`), not in this public pack.
- **Real numbers** in the done-check: counts, seconds, thresholds, rates.
  Take them from the tickets. Do not make them up.
- The check is something a user, a test, or a smoke can see. "Code is clean"
  is not a done-check.
- **`Why:`** says why a user cares, in one clause. It should serve the area's *Why it matters*.
- `Area: <slug>` must match `areas.yml` (private overlay / `docs/swarm/areas.yml`).
  Every milestone has an area (status Active, Next or Parked). There is no shelf.
- Continuous queues (Continuous, Device QA, Live Beta, Go Live) still get a line.
  Their done-check describes a healthy queue, and they are never Hit.

## When a milestone is created and retired

- **Create:** only for a slice of an area goal that no milestone covers, proposed by
  a coordinator or Chief of Staff, and **approved by the founder**. No goal line, no
  milestone.
- **Retire:** when its done-check passes: mark it Hit, close it, and record the proof.
  Continuous queues are never Hit.

## Who writes and checks it

| Who | When |
| --- | --- |
| `/wayfinder`, `/to-spec` | Propose the line when they create a milestone |
| Board (`/triage`) | Enforces it, the same as the milestone rule. Missing line → triage hit |
| Chief of Staff | Drafts lines for existing milestones; the founder confirms |
| Coding agents | Read it while building any ticket in the milestone |

## Examples (shape only)

```text
Ships honest scores on every course shape; done when direction-switching pays 6 of 6 laps (today 4 of 6), an out-and-back on a 1 km loop adds no false penalty, and a short-cut turn is charged. Why: users stop trusting the product when a lap they ran goes unpaid. Area: example-quality.
```

```text
Ships a <dev-branch> that is always safe to start from; done when governance and pr-ready checks both pass on the tip and the baseline debt count only goes down. Why: a red <dev-branch> blocks every agent. Area: example-quality.
```

## Set it

```text
gh api repos/<org>/<primary-repo>/milestones/<number> -X PATCH -f description="<goal line>

<existing description>"
```
