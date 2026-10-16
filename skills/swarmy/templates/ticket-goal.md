# Ticket goal snippet (layer 4 of 4)

Goals go: area goal (the why) > milestone goal (the slice) > house goal (focused,
finishable) > **ticket**. The `So that:` line **is the ticket's why**: it names the
house goal the ticket serves (or the milestone goal if the ticket has no house).

Paste at the top of the ticket body, above `## Parent` and `## Acceptance criteria`.

```markdown
So that: <house goal, the outcome part> (house `<slug>`, [<milestone title>](https://github.com/<org>/<primary-repo>/milestone/<n>))

## Acceptance criteria

- [ ] <user-visible done-look, with the number from the house done-check where it applies>
- [ ] <second checkable box>
```

## Rules

- **No `So that` line and ≥ 2 AC boxes, no ticket.** Coordinators and `/to-tickets`
  refuse to create one without them; Board treats a missing part as a triage hit.
- **Create:** the coordinator splits a house into tickets. **Retire:** every AC is
  checked with proof and the lane is Done.

- One `So that:` line per ticket, pointing at its house goal (or the milestone goal
  if the ticket has no house). It is the ticket's why, not a new goal.
- The `## Acceptance criteria` checkboxes are the proof. At least two real boxes on
  live implement tickets (`/to-tickets` rule). No placeholders.
- Sub-issues split the work. They carry ACs but no `So that:` line of their own.
  The parent ticket's line covers them.
- `/to-tickets` writes the line when it publishes. Board enforces it at triage. A
  live ticket missing it is a triage hit, the same as a missing milestone.

## Example

```markdown
So that: a user who completes the happy path sees the expected result within the house done-check numbers (house `example-happy-path`, [Quality milestone](https://github.com/<org>/<primary-repo>/milestone/<n>))

## Acceptance criteria

- [ ] Happy path completes end-to-end with the house done-check numbers (today: failing case documented)
- [ ] The matching contract / integration case passes in CI
```
