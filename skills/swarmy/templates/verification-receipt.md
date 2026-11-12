<!--
Paste under "## Verification" in the PR body (umbrella BUILD-STANDING.md PR briefing).
Every rung the area lists (areas.yml verify_rungs) must be PASS, or N/A with a reason.
A missing rung is a gap, not a pass.
The gate is verify-own-work "Scripted gate": commands.pr_ready prints risk and a pass line naming the head SHA.
On risk high, the VERDICT line is the one Build Verifier (not the author). On risk low, the pass line is the verdict.
Database proof rules: verify-own-work "Database test lanes". Do not restate them here.
-->

## Verification

- `commands.pr_ready` pass on `<dev-branch>` `<head sha>` · `risk: low|high` (local script, no paid Actions)
- <one or two more bullets naming the real runs that matter most>

<details><summary>Receipt</summary>

```text
TICKET       #<n> · So that: <house goal> · house:<slug> · area:<slug>
PR           #<pr> · branch <name> · base <dev-branch> @ <tip sha> · files changed <n>
TIER         0 | 1 | 2 (self-merge eligible: yes/no, why)
RISK         low | high · script pass names head <HEAD_SHA>

AC (layer 4)
  - [x] <AC text> · PASS · proof: <test path | command | screenshot>
  - [ ] <AC text> · PARTIAL | FAIL · what is left

RUNGS
  R0 static        package `verify` PASS · packages: <touched packages>
                   commands.pr_ready → pass line names <HEAD_SHA> · risk: low|high
                   check:governance: PASS | N/A (no governed files)
  R1 seam tests    PASS · <test files: touched + direct callers, one at a time> · <n> tests · harness: <Rule card summary> | none
  R2 integration   PASS | FAIL | N/A (no database in this change)
                   command: <cmd> · harness: <helper or branch> · executed: <n> · skipped: <n>
                   rules: verify-own-work Database test lanes
  R3 web smoke     PASS | N/A (<reason>) · flows: <names> · screenshots: <links>
  R4 review        N/A (risk low) | VERDICT pass · build-verifier <agent, not the author, other model>
                   /code-review in-scope findings: 0 · Tech Lead: N/A | pass (money/auth/migrations)
  R5 fuzz          N/A | PASS · regressions found/fixed: <n>
  R6 emulator      N/A | PASS · <maestro flows>
  R7 real phone    not per PR · phone-visible: yes/no · if yes → ticket stays open on Desk device after merge
                   Field only if outdoor / GPS / on-wrist proof remains

MIGRATION    none | <file> · the founder approved: <link> · applied to test DB only
LEASES       none | <paths held>
DOCS LAST    living docs in <commit sha>: <paths> | none
LAND         order/hot-file conflict: none | <what Dispatch is holding>
KILLS        none | <gate> exit 137/143 → re-run through `heavy`: PASS | killed again (capacity blocker, rung not run)

VERDICT      risk low: script pass names <HEAD_SHA>
             risk high: pass | fail · by <Build Verifier, not the author> · head <HEAD_SHA> · base <BASE_SHA>
```

</details>
