---
name: verify-own-work
description: >
  Scripted merge gate and verification ladder for a product PR. Follow
  umbrella CONVENTIONS Land gate: pr-ready step 1 (a WAIT that only waits on
  review is enough), Tech Lead first when required, then one Build Verifier on
  a different agent (same model is fine), the author reruns pr-ready for the
  final PASS, the pre-merge check, then the author may squash-merge. Use when a coding agent
  finishes a ticket, or a coordinator checks a PR. Real-Postgres proof lives in this skill.
---

# Verify own work

Bindings: `project.yml` keys, `<dev-branch>`-style placeholders, `areas.yml`, and `standing-product-rules.md` resolve per umbrella-skills [PROJECT-CONFIG.md](../umbrella/PROJECT-CONFIG.md). `areas.yml` and the goal docs live in the private overlay and sync to `docs/swarm/` in the primary product repo (template: `areas.example.yml` in this pack).

The author runs the rungs its area lists (`verify_rungs` in `areas.yml`) and pastes a receipt under `## Verification`. The verdict is the **Scripted gate**. Deterministic checks stay in the product script. The one independent check is the high-risk Build Verifier.

## Scripted gate

Follow umbrella-skills CONVENTIONS.md **Land gate**. `commands.pr_ready` prints `risk: low` or `risk: high`. Step 1 may print a WAIT that only waits on review; the merge requires the script's final PASS on this same SHA after TL and BV, when required. Risk paths live in that script. Do not restate them here.

1. Run `commands.pr_ready` on the exact head that will merge. This classifies risk and must clear the static and diff gates. A `check:pr-ready WAIT` result that only waits on review is enough for this step; it is not a merge PASS. Paste the real output. On high-risk work (or when `risk:` is missing), the PR body needs `author-agent: <name>` for the writing agent. Declared identity is self-asserted, not authenticated. Proof in the GATE comment is the real check: pr-ready only verifies that an Evidence block exists, is non-empty, and cites the same 40-char SHA; it cannot verify the evidence is true.
2. Tech Lead (`tech-lead-review`) first when the land gate is high (or the output has no `risk:` field) and the diff touches money, auth, permissions, entitlements, paid tiers, XP/economy/tokens, migrations, or write routes. Deps, config, native, and locking stay Build Verifier only. `risk: low` does not run it.
3. Then one Build Verifier (`build-verifier`) that did not write the PR, a different agent than the author (the same model is fine), not a subagent of the author, and not inline in the writer's session, when the output says `risk: high` or has no `risk:` field. `risk: low` does not run it. Reviewers post `GATE: (BV|TL) (PASS|FAIL) <40-sha> agent: <name>` on this SHA (own unquoted line, exact 40-char SHA), plus an `## Evidence` block in the same comment that names the commands or checks run and their results, the files or areas reviewed, and that same 40-char SHA. A FAIL also lists its findings. A PASS with no shaped evidence block does not count. A FAIL still wins with no evidence. Review proof is that `GATE:` comment, not an `independent-review:` body line. A present `independent-review:` line is optional; if it names a subagent, pr-ready fails.
4. The author reruns `commands.pr_ready` and pastes the final PASS line for this same SHA.
5. The author runs the Land gate pre-merge check itself: every verdict is on the current SHA; the body has no `do not merge` or `MERGE HOLD`; there is no merge freeze; the PR does not target a held branch (`branches.held`); the diff has no migration, data deletion, deploy-config, or workflow-file change (those wait for the founder).
6. Then the author session may squash-merge its own PR. promotes to held branches (`branches.held`), OTA app updates, migrations, data deletion, deploy config, workflow files, and anything that spends money still wait for the founder.
7. If the head moved, rerun the stale gates on the new head first.

A pass on an older SHA is not this gate.

**Small PRs.** Split above ~800 real added lines; a backfill or data script ships alone with its dry-run output.

Do not add a default extra verifier. High risk is the one Build Verifier (R4). `caps.verifier_fanout` does not stack another pass on top of that.

## What a verifier checks first

Read the ticket: `So that:` and `## Acceptance criteria`. Every AC is PASS / PARTIAL / FAIL with proof. A ticket with no ACs fails closed. On `risk: high` the Build Verifier reads that table. On `risk: low` the receipt still has it. A change that passes every rung and misses the `So that` line is a Spec finding.

## The ladder

| Rung | Run | PASS means |
| --- | --- | --- |
| **R0 static** | Worker: package `verify` for each touched package. Add `commands.governance` when governed files changed. The merge gate is **Scripted gate**. | `verify` green, and the Scripted gate is met (step 1 may WAIT; the merge needs the script's final PASS on this head after TL and BV, when required). Local scripts; no paid GitHub Actions. |
| **R1 seam tests** | The changed seam's colocated test (create one if missing, per `/implement`), then direct callers, one file at a time (BUILD-STANDING **Tests: touched files and direct callers**), then the spec's **Rule card** harness (v1 `/to-spec`). | Green. No mock of the module under test. No tautological test. Harness summary line is in the receipt. |
| **R2 backend integration** | `pnpm --dir backend test:integration` and the relevant `*.postgresOnly.test.ts` against a throwaway test database (for example an ephemeral database branch). Never Preview or Production. See **Database test lanes**. | Green on a database built from current migrations, with the required PostgreSQL cases executed. A skip is not this pass. |
| **R3 web smoke** | Expo web build (`<mobile-pkg>`, `web` script) + Playwright smoke flows through the shared verification CLI. Extend the CLI. Do not write a one-off script. | Flows for the touched screens pass; screenshots attached. Native-only paths (GPS, BLE, HealthKit, Health Connect, watch) → N/A with the reason. |
| **R4 review** | Build Verifier only when `commands.pr_ready` prints `risk: high`. | `GATE: BV (PASS|FAIL) <40-sha> agent: <name>` from that one verifier, or N/A when risk is low. |
| **R5 fuzz** | Optional. Not a default extra verifier. | N/A unless a fuzz pass was asked for, and then no new regression left in this PR. |
| **R6 emulator** | Optional, later: cloud Android emulator + Maestro, reusing `.maestro` flows. | Flows pass, or N/A. |
| **R7 real phone** | Not per PR. Mobile QA Engineer's sampled Desk device crawl, then `device-qa-verifier`. | Per `device-qa-verifier`. Phone-visible tickets stay open on Desk device until then. Field is outdoor, GPS, or on-wrist proof only. R2 and other non-device proof are not Desk device or Field. |

If the R3 CLI doesn't exist yet, mark R3 `N/A: not built yet`. Do not count that N/A as a pass toward merge.

**Query-loop probe (before pr-ready).** Any new effect, invalidate, or refetch driven by query data needs a fetch-count and render-count probe before pr-ready. The probe uses a real QueryClient whose fetcher returns a new Date on every answer (superjson-style). Both counts must settle at a small bound. (#2633: raw `useMutation()` object as an effect dep, 302 renders; Date-unequal refetch, 139 fetches/s. #2658: unbounded invalidate on superjson Date data, 8,501 fetches in 1 s.)

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
- **Gate waivers:** when a gate has a waiver, reason line, or exemption list, test it against junk input (empty, TBD variants, bracketed placeholders, the gate's own hint text, zero-width and fullwidth characters) and show that a real violation still is not excused. Prove the wiring by running the real command end to end, with no skip flags and no regex over source text.
- **Date bucketing:** any day, week, or month bucketing must be tested in several zones, including at least one east of UTC (for example Asia/Tokyo) plus America/Chicago, on both DST-start and DST-end days. (#2639→#2644, #2647→#2648, #2649→#2653.)

## Fix loop

A FAIL goes back to the same ticket (`/implement` **Build loop**). Fix it, re-run that rung and every rung after it, then run **Scripted gate** on the new head.

## Receipt

Use [verification-receipt.md](../swarmy/templates/verification-receipt.md). Paste it under `## Verification`. A merge waits until every listed rung is PASS or N/A with a reason, and the script's final PASS line names the current head (after TL and BV, when required). On `risk: high` the receipt also has a `GATE:` line from the Build Verifier (and from Tech Lead when required).

Before the script, grep tests and gate scripts for every new or renamed table, column, cron service, route, or export the diff touches, and run those suites. Database proof is **Database test lanes**.

## Standing rules kept

Migrations need the founder (a test-database migrate is fine; production is not). Database proof is **Database test lanes**. Phone-visible tickets stay open on Desk device. Field is outdoor, GPS, or on-wrist only. Real-phone QA is sampled, not skipped. Tick a fitted Pipeline box only for a gate this receipt shows.
