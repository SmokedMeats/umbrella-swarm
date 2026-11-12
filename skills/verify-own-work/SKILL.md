---
name: verify-own-work
description: >
  Scripted merge gate and verification ladder for a product PR. Run
  `commands.pr_ready` (`pnpm run check:pr-ready`): it prints `risk: low|high`
  and a pass line naming the head SHA. Low risk merges on that pass. High risk
  adds one Build Verifier on a different model. Use when a coding agent finishes
  a ticket, or a coordinator checks a PR. Real-Postgres proof lives in this skill.
---

# Verify own work

Bindings: `project.yml` keys, `<dev-branch>`-style placeholders, `areas.yml`, and `standing-product-rules.md` resolve per umbrella-skills [PROJECT-CONFIG.md](../umbrella/PROJECT-CONFIG.md). `areas.yml` and the goal docs live in the private overlay and sync to `docs/swarm/` in the primary product repo (template: `areas.example.yml` in this pack).

The author runs the rungs its area lists (`verify_rungs` in `areas.yml`) and pastes a receipt under `## Verification`. The verdict is the **Scripted gate**. Deterministic checks stay in the product script. The one independent check is the high-risk Build Verifier.

## Scripted gate

> Pending the product repo change that makes `commands.pr_ready` print `risk: low|high` and a pass line naming the head SHA. Until that change lands, do not invent a risk class in prose.

Run `commands.pr_ready`. It prints `risk: low` or `risk: high` and a pass line that names the head SHA. Risk paths live in that script.

- Pass line names the **current** head and `risk: low` → merge. No Build Verifier, no Tech Lead, no Dispatch turn.
- Pass line names the **current** head and `risk: high` → one Build Verifier (`build-verifier`) that did not write the PR, on a different model than the author. Tech Lead only for money, auth, or migrations. Then merge.
- Dispatch only for land order and hot-file conflicts.

A pass on an older SHA is not this gate. After the head moves, run the script on the new head.

**Small PRs.** Split above ~800 real added lines; a backfill or data script ships alone with its dry-run output.

Do not add a default extra verifier. High risk is the one Build Verifier (R4). `caps.verifier_fanout` does not stack another pass on top of that.

## What a verifier checks first

Read the ticket: `So that:` and `## Acceptance criteria`. Every AC is PASS / PARTIAL / FAIL with proof. A ticket with no ACs fails closed. On `risk: high` the Build Verifier reads that table. On `risk: low` the receipt still has it. A change that passes every rung and misses the `So that` line is a Spec finding.

## The ladder

| Rung | Run | PASS means |
| --- | --- | --- |
| **R0 static** | Worker: package `verify` for each touched package. Add `commands.governance` when governed files changed. The merge gate is **Scripted gate**. | `verify` green, and the script's pass line names the current `<dev-branch>` tip. Local scripts; no paid GitHub Actions. |
| **R1 seam tests** | The changed seam's colocated test (create one if missing, per `/implement`), then direct callers, one file at a time (BUILD-STANDING **Tests: touched files and direct callers**), then the spec's **Rule card** harness (v1 `/to-spec`). | Green. No mock of the module under test. No tautological test. Harness summary line is in the receipt. |
| **R2 backend integration** | `pnpm --dir backend test:integration` and the relevant `*.postgresOnly.test.ts` against a throwaway test database (for example an ephemeral database branch). Never Preview or Production. See **Database test lanes**. | Green on a database built from current migrations, with the required PostgreSQL cases executed. A skip is not this pass. |
| **R3 web smoke** | Expo web build (`<mobile-pkg>`, `web` script) + Playwright smoke flows through the shared verification CLI. Extend the CLI. Do not write a one-off script. | Flows for the touched screens pass; screenshots attached. Native-only paths (GPS, BLE, HealthKit, Health Connect, watch) → N/A with the reason. |
| **R4 review** | Build Verifier only when `commands.pr_ready` prints `risk: high`. | VERDICT pass from that one verifier, or N/A when risk is low. |
| **R5 fuzz** | Optional. Not a default extra verifier. | N/A unless a fuzz pass was asked for, and then no new regression left in this PR. |
| **R6 emulator** | Optional, later: cloud Android emulator + Maestro, reusing `.maestro` flows. | Flows pass, or N/A. |
| **R7 real phone** | Not per PR. Mobile QA Engineer's sampled Desk device crawl, then `device-qa-verifier`. | Per `device-qa-verifier`. Phone-visible tickets stay open on Desk device until then. Field is outdoor, GPS, or on-wrist proof only. R2 and other non-device proof are not Desk device or Field. |

If the R3 CLI doesn't exist yet, mark R3 `N/A: not built yet`. Do not count that N/A as a pass for self-merge tiers.

## Database test lanes

Single home for real-database proof. Do not copy these rules into another skill. Do not weaken a required lane.

1. **Database-only unit tests:** where the repository uses `openTestPostgres()`, use that shared helper and its existing `TEST_PG_URL`/local-socket contract. Gate optional no-database runs with `describePg = TEST_PG ? describe : describe.skip`, or the existing fake/pg backend list. When `REQUIRE_TEST_PG=1`, a missing database must fail at load, never silently skip. Do not add a missing-database `beforeAll` throw to an optional run.
2. **Receipts / R2:** skipped database tests never count as a real-database or R2 pass. Required PostgreSQL cases must actually execute and pass; R2 also requires its configured integration checks. Record the command, database harness and executed/skipped results. An optional local green run is not proof that required database checks passed.
3. **Harness boundaries:** follow the repository's configured separation: disposable unit PostgreSQL; isolated integration databases such as throwaway Neon branches or Testcontainers, never shared Preview/Production integration targets; and shared Preview-app end-to-end tests. Use existing helpers and safety gates, not per-file connection logic. Do not claim a database check ran merely because a particular assistant or editor was used.

## Running the gates

Rules marked (BUILD-STANDING) are v1's. Name them. Do not restate them.

- **Heavy checks through the gate** (BUILD-STANDING): type check, package `verify`, and `commands.pr_ready` run as `heavy <command>`.
- **Tests: touched files and direct callers** (BUILD-STANDING), one file at a time.
- **Run checks to the end** (BUILD-STANDING). Exit 137/143 is a kill: re-run it through the gate. A second kill in a row is a capacity blocker in ESCALATE; the rung stays not run.
- **Gate fixtures:** when a scan or ratchet gate changes, add fixtures for the spellings it should catch, including SQL case, multiline joins, ORM/Drizzle reads, and service-entry paths, and prove the gate fails on a real past violation.

## Fix loop

A FAIL goes back to the same ticket (`/implement` **Build loop**). Fix it, re-run that rung and every rung after it, then run **Scripted gate** on the new head.

## Receipt

Use [verification-receipt.md](../swarmy/templates/verification-receipt.md). Paste it under `## Verification`. A merge waits until every listed rung is PASS or N/A with a reason, and the script's pass line names the current head. On `risk: high` the receipt also has a VERDICT line from the Build Verifier.

Before the script, grep tests and gate scripts for every new or renamed table, column, cron service, route, or export the diff touches, and run those suites. Database proof is **Database test lanes**.

## Standing rules kept

Migrations need the founder (a test-database migrate is fine; production is not). Database proof is **Database test lanes**. Phone-visible tickets stay open on Desk device. Field is outdoor, GPS, or on-wrist only. Real-phone QA is sampled, not skipped. Tick a fitted Pipeline box only for a gate this receipt shows.
