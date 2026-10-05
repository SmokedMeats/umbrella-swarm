---
name: recall
description: >
  Rebuild working context before acting, from durable records instead of chat
  memory: the area brief issue, recent cycle comments, area PRs and merges, the
  findings buffer, and saved transcripts or handoff notes. Use when a coordinator
  starts or restarts, after a pause, or when a new session picks up swarm or
  umbrella work. Writes a short resume note.
---

# Recall

Bindings: `project.yml` keys, `<dev-branch>`-style placeholders, `areas.yml`, and `standing-product-rules.md` resolve per umbrella-skills [PROJECT-CONFIG.md](../umbrella/PROJECT-CONFIG.md). `areas.yml` and the goal docs live in the private overlay and sync to `docs/swarm/` in the primary product repo (template: `areas.example.yml` in this pack).

Lauren Tan's `recall` skill mines past transcripts so a new chat starts with the
last one's context, without writing a long prompt each time [01:03:00].
Ours does the same from GitHub first, then transcripts.

This extends the umbrella **Recall** brief (which v1 kept as a section, not a skill).
For classic `/umbrella` sessions the brief in `project.yml` `paths.umbrella_cursor`
still works; this skill reads it too.

## Sources, in order

Stop as soon as you can fill the resume note.

1. **Area brief issue** body (or `paths.umbrella_cursor` for a classic `/umbrella` house in a Next or Parked area).
2. Its **last 5 cycle comments**.
3. **Swarm state issue:** your status (active/paused), merge tier, leases.
4. **GitHub truth:** open PRs and tickets with `area:<slug>`; Ready to merge cards;
   `git log origin/<dev-branch>` since the brief's last cycle (who merged what, and
   did it touch your files).
5. **Findings buffer:** entries since the last review.
6. **Transcripts and handoffs:** saved agent transcripts, `/handoff` notes, and PR
   or issue comments by earlier agents on your in-flight tickets. Look for decisions,
   dead ends, and repros. Don't replay them.

## Resume note

Post it as the first cycle comment after a restart, and keep it short:

```text
RESUMED    <date time CT> from <sources used>
GOAL       <area goal> · done-signal <met? no / how close>
IN_FLIGHT  #ticket → PR · state · rung reached
READY      PRs waiting on Dispatch or the founder
BLOCKED    ticket · why · who
LEASES     held / waiting
CHANGED    merges since last cycle that touch our files
DECISIONS  new since last cycle (or none)
NEXT       first action
```

If GitHub disagrees with the brief, say which one you trusted (GitHub) and fix the brief.

## Rules

- No secrets in the note.
- Recall does not start new work by itself. The coordinator's cycle does.
- A brief older than three cycles with in-flight PRs: re-check every PR before trusting it.
