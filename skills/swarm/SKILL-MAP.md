# Skill map

Every skill the swarm uses: where it comes from, who runs it, when. The swarm names a skill; the agent reads the installed file. Nothing here is copied from another pack. Install: Matt's pack, umbrella-skills, this pack, and SimpleEnglish (umbrella-skills README **Install**); `sync-workspace.mjs` puts umbrella-skills and this pack in the user roots and in each product repo's `workspace.skill_targets` folders.

A worker that cannot read installed skills (a cloud or sibling session whose checkout lacks the synced folders) gets the named *sections* pasted, never a whole `SKILL.md`: umbrella `DELEGATION.md` **Sibling contract**.

## umbrella-swarm (this pack)

| Skill | Who runs it | When |
| --- | --- | --- |
| `/swarm-mode` | Chief of Staff (parent) | Sticky swarm front door |
| `/swarm` | Chief of Staff | Start, resume, pause, status, rotate, routing, leases, merge path |
| `/area-coordinator` | One coordinator per Active area | Each cycle, house by house |
| `verify-own-work` | Worker, then its verifier | Before a PR goes to Dispatch |
| `/recall` | Chief of Staff, coordinator | Cold restart; rebuild state from GitHub |
| templates (`templates/`) | Coordinator, Board | Brief issue, findings buffer, receipt, goal lines |

## umbrella-skills (v1)

| Skill or companion | Who runs it | When |
| --- | --- | --- |
| `/umbrella`, `/umbrella-mode` | Chief of Staff | A Next or Parked house the founder names (classic loop) |
| umbrella `PRE-GRILL.md` | Coordinator | Gap list before the parent's grill |
| `/grill-me`, `/grilling` | Chief of Staff with the founder | Grill (founder gate) |
| `/wayfinder` | Worker the coordinator spawns | Fog in a milestone |
| `/to-spec`, `/to-tickets` | Worker | After a grill lock (carry fields kept) |
| `/triage` | Board | Every new issue; goal lines |
| `/implement` (child rules, Build loop, End of house) | Worker; coordinator for lanes | Build a ticket; lanes after merge |
| umbrella `BUILD-STANDING.md` | Worker, verifier | Heavy gate, test scope, kill handling |
| umbrella `DELEGATION.md` | Coordinator | Child shape by runtime, sibling contract, recheck at merge |
| umbrella `CONVENTIONS.md` | Coordinator, worker | Repeated corrections (`/correct`), decision trail, comment cleanup, recall brief, DESIGN-IT-TWICE |
| umbrella `PROJECTS.md`, `DEVICE-QA.md`, `CLOSE-PARENTS.md`, `PARKED-TICKETS.md`, `PROJECT-CONFIG.md` | Coordinator | Board status, Device QA lane, closing, parking, config bindings |
| `build-verifier` | Verifier (not the writer) | Every ticket, at the depth the brief names |
| `/code-review`, `/blast-radius` | Verifier | Review rung (R4) |
| `/pit-of-success`, `/zero-tech-debt` | Verifier; `quality_area` coordinator | Footgun seams; rework from the end state |
| `/how`, `/why`, `/teach`, `/teach-me` | Readonly worker; parent with the founder | Questions about the code; explaining |
| `/principles` | Anyone | Mid-task redirect by name |
| `device-qa-agent`, `device-qa-verifier` | Mobile QA Engineer, then verifier | Phone-visible tickets on Desk device (R7) |

## Matt Pocock's pack

| Skill | Who runs it | When |
| --- | --- | --- |
| `/setup-matt-pocock-skills` | Once per repo | Tracker setup |
| `/research` | Worker | Fog that needs primary sources |
| `/domain-modeling` | With `/grilling` | Glossary during a grill |
| `/tdd`, `/prototype`, `/codebase-design` | Worker | Build a ticket |
| `/improve-codebase-architecture` | `quality_area` coordinator | Architecture debt, when in scope |
| `/diagnosing-bugs` | Worker | Repro is the work; batch by root cause |
| `/retro` | Coordinator | After `/code-review` or a bug fix |
| `/pr` | Worker | PR body shape (plus the `pr_ready_pass` line) |
| `/handoff` | Coordinator, parent | Session end (plus the brief issue) |
| `/writing-for-agents` | Anyone editing agent-facing docs | Editing skills or briefs |
| `/wait-what`, `/ask-matt` | Parent with the founder | "That didn't land"; "which skill do I type?" |

## SimpleEnglish ([AminBlg/SimpleEnglish](https://github.com/AminBlg/SimpleEnglish))

| Skill | Who runs it | When |
| --- | --- | --- |
| `/simple-english` | Parent, coordinator | Status to the founder, grill leftovers, ship notes, Waiting: Device QA comments |

## Product-repo workflows (only when installed there)

`/audit`, the promote workflows. Not part of any pack; route to them only when the product repo ships them.
