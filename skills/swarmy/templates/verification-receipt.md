<!--
Paste under "## Verification" in the PR body (umbrella BUILD-STANDING.md PR briefing).
Every rung the area lists (areas.yml verify_rungs) must be PASS, or N/A with a reason.
A missing rung is a gap, not a pass.
The gate is verify-own-work "Scripted gate": commands.pr_ready prints risk. Step 1 may WAIT; the merge needs the final PASS on this SHA after TL and BV, when required.
On risk high, review proof is the GATE: comments (not the author, and not an independent-review body line). A present independent-review line is optional; if it names a subagent, pr-ready fails. On risk low, the script's final PASS names the head.
Database proof rules: verify-own-work "Database test lanes". Do not restate them here.
-->

## Verification

- `commands.pr_ready` final PASS on `<dev-branch>` `<head sha>` · `risk: low|high` (local script, no paid Actions; step 1 may have been WAIT)
- <one or two more bullets naming the real runs that matter most>

<details><summary>Receipt</summary>

```text
TICKET       #<n> · So that: <house goal> · house:<slug> · area:<slug>
PR           #<pr> · branch <name> · base <dev-branch> @ <tip sha> · files changed <n>
TIER         0 | 1 | 2 (recorded only; does not gate who merges) · author may merge after the land gate
RISK         low | high · author-agent: <name> · final PASS names head <HEAD_SHA>

AC (layer 4)
  - [x] <AC text> · PASS · proof: <test path | command | screenshot>
  - [ ] <AC text> · PARTIAL | FAIL · what is left

RUNGS
  R0 static        package `verify` PASS · packages: <touched packages>
                   commands.pr_ready → step 1 may WAIT; final PASS names <HEAD_SHA> · risk: low|high
                   check:governance: PASS | N/A (no governed files)
  R1 seam tests    PASS · <test files: touched + direct callers, one at a time> · <n> tests · harness: <Rule card summary> | none
  R2 integration   PASS | FAIL | N/A (no database in this change)
                   command: <cmd> · harness: <helper or branch> · executed: <n> · skipped: <n>
                   rules: verify-own-work Database test lanes
  R3 web smoke     PASS | N/A (<reason>) · flows: <names> · screenshots: <links>
  R4 review        N/A (risk low) | GATE: BV (PASS|FAIL) <40-sha> agent: <name>
                   /code-review in-scope findings: 0 · Tech Lead: N/A | GATE: TL (PASS|FAIL) <40-sha> agent: <name>
                   (money, auth, migrations, plus permissions, entitlements/paid tiers, XP/economy/tokens, data-writing routes)
  R5 fuzz          N/A | PASS · regressions found/fixed: <n>
  R6 emulator      N/A | PASS · <maestro flows>
  R7 real phone    not per PR · phone-visible: yes/no · if yes → ticket stays open on Desk device after merge
                   Field only if outdoor / GPS / on-wrist proof remains

MIGRATION    none | <file> · the founder approved: <link> · applied to test DB only
LEASES       none | <paths held>
DOCS LAST    living docs in <commit sha>: <paths> | none
LAND         order/hot-file conflict: none | <what Dispatch is holding>
KILLS        none | <gate> exit 137/143 → re-run through `heavy`: PASS | killed again (capacity blocker, rung not run)

GATE         risk low: script final PASS names <HEAD_SHA>
             risk high: GATE: (BV|TL) (PASS|FAIL) <HEAD_SHA> agent: <name> · not author-agent · declared identity is self-asserted, not authenticated
```

</details>
