---
name: verify-own-work
description: >
  Verification ladder for a product PR before it goes to Dispatch: `commands.pr_ready`
  on the current <dev-branch> tip, seam tests, backend integration tests on a test
  database, Expo web build + Playwright smoke, build-verifier + code-review, optional
  fuzz and emulator, sampled real-phone QA. Use when a coding agent finishes a
  ticket, or a coordinator checks a PR. Emits a verification receipt.
---

# Verify own work

Bindings: `project.yml` keys, `<dev-branch>`-style placeholders, `areas.yml`, and `standing-product-rules.md` resolve per umbrella-skills [PROJECT-CONFIG.md](../umbrella/PROJECT-CONFIG.md). `areas.yml` and the goal docs live in the private overlay and sync to `docs/swarm/` in the primary product repo (template: `areas.example.yml` in this pack).

The agent that wrote the change runs the rungs its area lists (`verify_rungs` in
`areas.yml`), then pastes a receipt in the PR body under `## Verification`. A
separate verifier agent re-runs the rungs and gives the verdict (**Independent
verdict**); a coordinator can re-run any rung. **A missing rung is a gap, not a
pass.** Each rung is PASS, FAIL, or N/A with a reason.

Lauren Tan's rule: give the agent hands and eyes so it can see what it built
[16:30–17:30], and put the repeatable steps in a script so agents don't reinvent
them [22:00–23:30]. Deterministic steps are scripts. Judgment is agents.

## What a verifier checks first (layer 4: the ticket)

Verifiers read the ticket, the layer above the code: its `So that:` line and its
`## Acceptance criteria`. Every AC gets PASS / PARTIAL / FAIL with proof (a test, a
command, a screenshot, a path). A change that passes every rung but doesn't serve
the `So that` line is a Spec finding for `/code-review`. A ticket with no ACs fails
closed (`build-verifier` rule).

## The ladder

| Rung | Run | PASS means |
| --- | --- | --- |
| **R0 static** | Who runs what is the **Check budget** below. Worker: package `verify` for each touched package. Verifier: package `verify` + `commands.pr_ready` at the verdict SHA (`build-verifier` **Gates at the verdict SHA**). Add `commands.governance` when governed files changed. | Worker: `verify` green. Verifier: the `commands.pr_ready_pass` line names the **current** <dev-branch> tip. Local scripts; no paid GitHub Actions. |
| **R1 seam tests** | The changed seam's colocated test (create one if missing, per `/implement`), then the test files of direct callers, one file at a time (BUILD-STANDING **Tests: touched files and direct callers**), then the harness the spec's **Rule card** names (v1 `/to-spec`). | Green. No mock of the module under test. No tautological test. The harness reports no new failing row and meets the card's bar; its summary line is in the receipt. |
| **R2 backend integration** | `pnpm --dir backend test:integration` and the relevant `*.postgresOnly.test.ts` against a throwaway test database (for example an ephemeral database branch). Never production. | Green on a database built from current migrations. |
| **R3 web smoke** | Expo web build (`<mobile-pkg>`, `web` script) + Playwright smoke flows through the shared verification CLI. Do not write a one-off script; extend the CLI. | Flows for the touched screens pass; screenshots attached. Native-only paths (GPS, BLE, HealthKit, Health Connect, watch) → N/A with the reason. |
| **R4 review** | At the `DEPTH` the verifier brief names (**Review depth**), against the spec's **Rule card**. At most two review rounds (v1 `/implement` **Build loop**); a hard finding after round 2 goes to the parent as a grill question in ESCALATE. | VERDICT pass; no in-scope findings left. |
| **R5 fuzz** | `caps.verifier_fanout` verifier agents click around the web build like a user, looking for regressions outside the ticket. | No new regression, or each one fixed in this PR. |
| **R6 emulator** | Optional, later: cloud Android emulator + Maestro, reusing `.maestro` flows. | Flows pass. |
| **R7 real phone** | Not per PR. Mobile QA Engineer's sampled Desk device crawl, then `device-qa-verifier`. | Per `device-qa-verifier`. Phone-visible tickets stay open on Desk device until then. |

If the R3 CLI or the R2 test database doesn't exist yet, mark the rung
`N/A: not built yet` and say so in the receipt. Do not count it as a pass for
self-merge tiers.

## Running the gates

These rules are v1's. Read them in `umbrella/BUILD-STANDING.md`; don't restate them
in a brief, name them.

- **Heavy checks through the gate** (BUILD-STANDING): type check, package `verify`
  and `commands.pr_ready` run as `heavy <command>`, the slotted gate on
  `/tmp/umbrella-heavy.<i>.lock`, sized by `project.yml` `limits.heavy_gate_slots`
  and `limits.mem_reserve_gb`.
  Why: every agent in one container must share **one** gate. A second gate with
  its own lock files lets both run their full slot count at once, which is the
  2026-10-11 OOM again (about 5 type checks, 7 kills).
- **Tests: touched files and direct callers** (BUILD-STANDING), one file at a
  time, never a directory sweep.
- **Run checks to the end** (BUILD-STANDING): foreground, read the exit code,
  never end a turn waiting. Exit 137/143 is a kill: re-run it through the gate,
  never a FAIL rung. A second kill in a row is a capacity blocker in ESCALATE;
  the rung stays not run.

## Review depth

`build-verifier` **Depth by risk** decides it (v1): `full` for an area
`standing-product-rules.md` locks or a grant, entitlement or money write (adds a
`/blast-radius` probe and 2+ red-on-old-code tests); `light` for every other ticket
(1 red-on-old-code test; the ticket's own `/code-review` covers the rest). The
verifier brief names `DEPTH`; empty means `full`.

## Check budget per ticket

A full type-check round is the expensive part. Each ticket gets about three, each
with one owner (pstack `shipping.md` / `autopilot-full.md`). The source rules are
v1: BUILD-STANDING (worker), `build-verifier` **Gates at the verdict SHA**
(verifier), DELEGATION **Recheck at merge** (merge). This table is the swarm view:

| Step | Runs | Not |
| --- | --- | --- |
| **Worker** | package `verify` for each touched package, plus the tests for touched files and direct callers, on the committed head | `commands.pr_ready`: that is the merge-time gate |
| **Verifier** | package `verify` + `commands.pr_ready` at the verdict SHA, independent of the writer; records head SHA, base SHA, patch-id | |
| **Merge** (Dispatch) | Base unchanged since the verdict → nothing new. Base moved → merge or rebase `<dev-branch>` in, run `commands.pr_ready` **once** on the new head (it is the CI for `<dev-branch>` PRs), then push with the pre-push hook off (`HUSKY=0`; the hook would re-run that identical check). Patch changed in code → back to the verifier (patch-id rule) | a second `pr_ready` from the hook |
| **Batch** | Nothing per ticket or per merge, and no batch gate in the pack. The consuming repo's own scheduled heavy check covers the merged tip; a red run goes to the `quality_area` coordinator | a combined check before merge |

Why: the old path ran about six rounds per ticket (worker verify + pr_ready,
verifier verify + pr_ready, conductor pr_ready + the hook re-running it). Half of
them repeated a check that had just passed on the same patch. Three rounds keep the
coverage, since each check has one owner and runs once, and cut the type-check load
that filled the shared container on 2026-10-11.

At fan-out `0` the coordinator is the verifier: it runs `commands.pr_ready` at the
verdict SHA.

## Independent verdict

The author runs the rungs and writes the receipt. The **verdict** comes from a
different agent, one per ticket, that didn't write it (the coordinator, for a
fan-out `0` ticket). Green CI or a bot review is
not a verdict. Verify each ticket on its own; there is no combined check across
tickets (cross-ticket breakage is caught at merge, `/swarm` **Merge path**).
Why: pstack `shipping.md`; a writer grading itself passes what it misread.

The verifier records one line in the receipt, with the same fields as the
`build-verifier` receipt (`HEAD_SHA`, `BASE_SHA`, `PATCH_ID`, `DEPTH`):

```text
VERDICT  pass | fail · by <verifier agent> · head <HEAD_SHA> · base <BASE_SHA> · patch-id <PATCH_ID> · depth full | light
```

`PATCH_ID` is computed exactly as `build-verifier` does:
`git diff <BASE_SHA> <HEAD_SHA> | git patch-id --stable` (first field).

### Verdict across a rebase (patch-id rule)

The rule is v1 DELEGATION **Recheck at merge**. After any merge or rebase of
`<dev-branch>` into the PR (docs last, Dispatch's merge-time update), recompute the
patch-id on the new head against its new base:

- **Unchanged** → the verdict holds. Run `commands.pr_ready` once on the new head
  (**Check budget**, Merge row) and check mergeability. Nothing else.
- **Changed only in docs, tests or lint config** (for example the docs-last commit)
  → the code verdict holds; the same single `commands.pr_ready` run and
  mergeability check on the new head.
- **Changed in code** (a conflict was resolved, code was added) → the verifier
  re-verifies the rungs the change touches and writes a new VERDICT line.

The docs/tests/lint-config case is a swarm addition for the docs-last commit
(pstack `shipping.md`); v1 re-verifies on any patch change.

Never accept a matching commit message or a green check from an older SHA instead.

Why: pstack `autopilot-full.md`; a rebase that didn't change the patch didn't change
what was verified, and one that did must be looked at again.

## Fan-out (cost knob)

Scale verification to the ticket (pstack `orchestrate.md` **Verification**):

- `0`: only when the whole check is one cheap command (docs-only, config, a
  copy change). The worker runs it and reports the output; the coordinator
  spot-checks the receipt and writes the VERDICT. Still not the author.
- `1` (default, and the floor for any behavior change): one separate verifier
  agent re-runs R0–R3, does R5 lightly, and writes the VERDICT.
- `3`: for risky PRs (grading math, money, shared contracts). Lauren tunes the
  same knob down from 10 to 1 when tokens matter [53:30].

Run the verifier on a different model family from the worker when you can.
Why: a verifier agent whose whole job is re-running one command is ceremony; one
that shares the worker's model shares its blind spots (pstack `orchestrate.md`).

## Fix loop

A FAIL goes back to the same ticket (`/implement` **Build loop**). Fix it, then
re-run that rung and every rung after it, and the verifier writes a new VERDICT.
After <dev-branch> moves, apply the patch-id rule and the **Check budget** Merge
row: one `commands.pr_ready` on the new head, plus the rungs a changed patch needs.

## Receipt

Use [verification-receipt.md](../../templates/verification-receipt.md). Paste it
under `## Verification` in the PR body (umbrella `BUILD-STANDING.md` **PR briefing**).
Dispatch refuses a PR whose receipt lacks a rung its area lists or a VERDICT line.

## Standing rules kept

`commands.pr_ready_pass` naming the current <dev-branch> tip on every PR, run locally
with no paid Actions · migrations need the founder (a test DB migrate is fine; production
is not) · phone-visible tickets stay open on Desk device · real-phone QA is sampled,
not skipped.
