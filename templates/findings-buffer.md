<!--
Findings buffer issue. One per area. Append-only: one finding per comment.
Title: "Findings buffer: <slug>"
Labels: swarm:state, area:<slug>   Milestone: Continuous   Project Status: In Progress

Lauren Tan's gardening routines "append it to a document" instead of fixing each
finding at once, and she reviews it every couple of days for patterns [47:30-48:30].
Comments on an issue never cause merge conflicts, so the buffer lives here, not in a repo file.
-->

# Findings buffer: <slug>

**Review cadence:** every 2-3 days, by Chief of Staff with the founder, or the `areas.yml` `quality_area` coordinator.
**Last review:** <YYYY-MM-DD> · **Open findings:** <n>

## How to add a finding (one comment each)

```text
FOUND      <YYYY-MM-DD HH:MM CT> by <coordinator / routine / agent>
WHERE      <path:line or screen or ticket>
WHAT       <one or two sentences, plain words>
SEEN       <how many times / which PRs or runs>
GUESS      <suspected root cause, or "unknown">
KIND       footgun | repeat mistake | flaky test | perf | dead code | doc drift | other
```

Do not fix it in the same breath unless it blocks the current ticket.

## Review (edit this body at each review)

Group the findings since the last review. For each group, pick one:

| Group | Findings (comment links) | Decision | Result |
| --- | --- | --- | --- |
| <pattern> | <links> | `/correct` (lint rule > test > skill line) · ticket (milestone + `So that` line, via Board) · drop (reason) | <PR / issue / none> |

A pattern seen twice is a `/correct` candidate. Apply `/pit-of-success` for footgun
seams and `/codebase-design` for structure.
