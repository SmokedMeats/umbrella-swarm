<!--
Paste under "## Verification" in the PR body (umbrella BUILD-STANDING.md PR briefing).
Every rung the area lists (areas.yml verify_rungs) must be PASS, or N/A with a reason.
A missing rung is a gap, not a pass. Dispatch refuses an incomplete receipt.
The VERDICT line is written by an agent that didn't write the PR: the verifier, or the coordinator at fan-out 0 (verify-own-work).
-->

## Verification

- pr-ready PASS on <dev-branch> `<tip sha>` (local, no paid Actions)
- <one or two more bullets naming the real runs that matter most>

<details><summary>Receipt</summary>

```text
TICKET       #<n> · So that: <house goal> · house:<slug> · area:<slug>
PR           #<pr> · branch <name> · base <dev-branch> @ <tip sha> · files changed <n>
TIER         0 | 1 | 2 (self-merge eligible: yes/no, why)

AC (layer 4)
  - [x] <AC text> · PASS · proof: <test path | command | screenshot>
  - [ ] <AC text> · PARTIAL | FAIL · what is left

RUNGS
  R0 static        worker: package `verify` PASS · packages: <touched packages>
                   verifier: package `verify` PASS + `commands.pr_ready` → "pr-ready PASS … <tip sha>" at the verdict SHA
                   merge: base unchanged | base moved → `commands.pr_ready` once on <new head sha>: PASS (hook skipped: yes/no)
                   check:governance: PASS | N/A (no governed files)
  R1 seam tests    PASS · <test files: touched + direct callers, one at a time> · <n> tests · harness: <the Rule card harness summary line> | none (card names no harness)
  R2 integration   PASS | N/A (<reason>) · test DB: <name/branch, never production>
  R3 web smoke     PASS | N/A (<reason, e.g. native GPS only / CLI not built yet>) · flows: <names> · screenshots: <links>
  R4 review        DEPTH full | light (why) · build-verifier VERDICT pass · /code-review round <1|2> · in-scope findings: 0 · blast-radius probe (full): <one line + command>
                   red-on-old-code: <test(s) that fail on BASE_SHA, pass on HEAD_SHA> (full: 2+, light: 1)
  R5 fuzz          PASS | N/A · fan-out <0|1|3> · regressions found/fixed: <n>
  R6 emulator      N/A | PASS · <maestro flows>
  R7 real phone    not per PR · phone-visible: yes/no · if yes → ticket stays open on Desk device after merge

MIGRATION    none | <file> · the founder approved: <link> · applied to test DB only
LEASES       none | <paths held>
DOCS LAST    living docs written after rebase in <commit sha>: <paths> | none
OVERLAPS     other Ready PRs sharing paths: <#pr: paths> | none
KILLS        none | <gate> exit 137/143 → re-run through `heavy`: PASS | killed again (capacity blocker, rung not run)

VERDICT      pass | fail · by <verifier agent, not the author> · head <HEAD_SHA> · base <BASE_SHA> · patch-id <PATCH_ID> · depth full | light
             (after a rebase: same patch-id, or a change only in docs/tests/lint config → holds, R0 + CI re-run; code changed → re-verified, new line)
```

</details>
