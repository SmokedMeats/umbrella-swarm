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
coordinator or verifier agent can re-run any rung. **A missing rung is a gap, not a
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
| **R0 static** | Rebase on `origin/<dev-branch>`, then `project.yml` `commands.pr_ready`. Add `project.yml` `commands.governance` when governed files changed. | The output's `commands.pr_ready_pass` line names the **current** <dev-branch> tip. Local script; no paid GitHub Actions. |
| **R1 seam tests** | The changed seam's colocated test (create one if missing, per `/implement`), then the touched package's tests, then the harness the spec's **Rule card** names (v1 `/to-spec`). | Green. No mock of the module under test. No tautological test. The harness reports no new failing row and meets the card's bar; its summary line is in the receipt. |
| **R2 backend integration** | `pnpm --dir backend test:integration` and the relevant `*.postgresOnly.test.ts` against a throwaway test database (for example an ephemeral database branch). Never production. | Green on a database built from current migrations. |
| **R3 web smoke** | Expo web build (`<mobile-pkg>`, `web` script) + Playwright smoke flows through the shared verification CLI. Do not write a one-off script; extend the CLI. | Flows for the touched screens pass; screenshots attached. Native-only paths (GPS, BLE, HealthKit, Health Connect, watch) → N/A with the reason. |
| **R4 review** | `build-verifier` (readonly) and `/code-review` two-axis with `/blast-radius`, against the spec's **Rule card**. At most two review rounds (v1 `/implement` **Build loop**); a hard finding after round 2 goes to the parent as a grill question in ESCALATE. | VERDICT pass; no in-scope findings left. |
| **R5 fuzz** | `caps.verifier_fanout` verifier agents click around the web build like a user, looking for regressions outside the ticket. | No new regression, or each one fixed in this PR. |
| **R6 emulator** | Optional, later: cloud Android emulator + Maestro, reusing `.maestro` flows. | Flows pass. |
| **R7 real phone** | Not per PR. Mobile QA Engineer's sampled Desk device crawl, then `device-qa-verifier`. | Per `device-qa-verifier`. Phone-visible tickets stay open on Desk device until then. |

If the R3 CLI or the R2 test database doesn't exist yet, mark the rung
`N/A: not built yet` and say so in the receipt. Do not count it as a pass for
self-merge tiers.

## Fan-out (cost knob)

- `0`: the coding agent verifies itself. Cheapest.
- `1` (default): one separate verifier agent re-runs R0–R3 and does R5 lightly.
- `3`: for risky PRs (grading math, money, shared contracts). Lauren tunes the
  same knob down from 10 to 1 when tokens matter [53:30].

## Fix loop

A FAIL goes back to the same ticket (`/implement` **Build loop**). Fix it, then
re-run that rung and every rung after it. After Development moves, R0 runs again,
plus the rungs the diff needs.

## Receipt

Use [verification-receipt.md](../../templates/verification-receipt.md). Paste it
under `## Verification` in the PR body (umbrella `BUILD-STANDING.md` **PR briefing**).
Dispatch refuses a PR whose receipt lacks a rung its area lists.

## Standing rules kept

`commands.pr_ready_pass` naming the current <dev-branch> tip on every PR, run locally
with no paid Actions · migrations need the founder (a test DB migrate is fine; production
is not) · phone-visible tickets stay open on Desk device · real-phone QA is sampled,
not skipped.
