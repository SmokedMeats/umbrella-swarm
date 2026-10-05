# House goal line (layer 3 of 4)

Goals go: **area goal** (the why) > **milestone goal** (the slice) > **house goal**
(focused and finishable) > **ticket** (`So that` + ACs).

A house is an `umbrella:<slug>` pack. Its goal is **narrower than its milestone**:
one outcome a user can see, that a coordinator can finish and prove with a check
that uses real numbers. The coordinator works house by house and uses this check to
know the house is done and to pick the next one.

```text
House <slug>: <one user-visible outcome>; done when <check with real numbers>. Why: <milestone goal, the "Ships …" part> (<milestone link>). Area: <area slug>.
```

## When a house is created and retired

- **Create:** the coordinator creates the next house (label + goal line) when the
  current house's done-check passes and the next finishable outcome in the
  milestone has no house. No goal line, no house. The founder doesn't approve each one,
  because the milestone above is already confirmed.
- **Retire:** when its done-check passes, with the evidence recorded in the brief.

## Where it lives

1. **First line of the house's anchor issue**: its `wayfinder:map`, or else its
   `spec` issue.
2. If the house has neither, it goes in the area brief's **Houses** table, and in
   `areas.yml` under `areas[].houses[].goal`.
3. Optional short form in the label description (GitHub caps it at 100 characters).

## Rules

- **One outcome.** If you need "and" to join two unrelated outcomes, it's two
  houses. Board splits the label (new `umbrella:<slug>` on the same milestone).
- **Finishable.** Rule of thumb: one coordinator can finish it in about a week.
- **Real numbers in the done-check:** counts, seconds, thresholds, rates.
  Take them from the tickets. Do not make them up. If the tickets have no numbers,
  write `done when: TBD from #<n> ACs` and ask the founder.
- **The check is something you can run:** a backend test, a contract case, a web
  smoke flow, or the numbers a Desk device crawl reports. "Code is merged" is not a
  done-check.
- **Why names one milestone goal.** One house = one milestone = one area. A house
  that spans two milestones, or two areas, goes to Board first.
- A milestone with no house label is worked as one house. Its milestone line is
  its goal.

## Who writes and checks it

| Who | When |
| --- | --- |
| `/wayfinder` (map issue), `/to-spec` (spec issue) | Propose it when the house is created |
| Chief of Staff | Drafts goals for existing houses when their area goes Active; the founder confirms |
| Board (`/triage`) | Enforces it. A live house with no goal line is a triage hit. Splits oversized houses |
| Area coordinator | Picks the next house by it; runs the done-check when every ticket is merged or laned; records pass or fail in the brief |
| Coding agents | Keep it in view while building (`HOUSE_GOAL` in the packet) |

## Examples (shape only)

```text
House short-cut-charge: a user who cuts a turn short gets charged; done when it's checked on a measured 400 m loop within 1 s. Why: honest scores on every course shape (Quality). Area: example-quality.
```

```text
House lap-count-honest: a user who switches direction every lap gets every lap they ran and no extra; done when alternating direction pays 6 of 6 laps (today 4 of 6) and a one-way run on a narrow loop shows no doubled lap rows. Why: honest scores on every course shape (Quality). Area: example-quality.
```

## Done-check record (in the area brief)

```text
HOUSE <slug> · done-check: <check> · result: PASS | FAIL · evidence: <test / smoke / crawl link> · <YYYY-MM-DD CT>
```

FAIL → the gap becomes a new ticket in the same house. The house stays in focus.
