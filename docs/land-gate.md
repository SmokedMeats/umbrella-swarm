# The land gate

Every runtime follows the same merge path, whether a reviewer fleet is on or a solo session in Cursor, Claude Code, VS Code, or Grok runs the gates itself. Both modes use the same skills.

The canonical wording lives in umbrella-skills [CONVENTIONS.md](https://github.com/SmokedMeats/umbrella-skills/blob/main/skills/umbrella/CONVENTIONS.md) **Land gate**, and this pack restates the same order in [`/verify-own-work`](../skills/verify-own-work/SKILL.md). This page is a user guide to that flow.

## With a reviewer fleet (bots on)

Tech Lead and Build Verifier run as their own sessions, loaded with `/tech-lead-review` and `/build-verifier` from umbrella-skills. They post their verdicts on the pull request.

Dispatch only orders land and names hot-file conflicts ([`/swarmy` Merge path](../skills/swarmy/SKILL.md)). It pings the owner who is next. It does not replace the author's pre-merge check, and it does not re-run the ladder.

The author session still runs `pr-ready`, the pre-merge check, and squash-merges its own pull request once every required gate has passed.

## Without a reviewer fleet (bots off)

Declare bots-off at the start of the session. There is no mid-session switch, and there is no label or marker on the pull request. `pr-ready` does not look for one.

The same land gate still runs. The author starts Tech Lead and Build Verifier as **separate agents** — a new chat or a cloud agent loaded with that skill — never as a subagent of the session that wrote the code, and never as an inline receipt in the writer's session. Each reviewer posts its own `GATE:` verdict with an Evidence block on the exact commit it reviewed. The same model is fine; the reviewer must be a different agent than the declared `author-agent:`.

Do not add swarm, Chief of Staff, or Dispatch routing in a bots-off session. Protected workflow files and deploy config still go on a branch and a pull request. A rare, narrow exception to the pull-request flow is described under **Bots off** in umbrella-skills `/umbrella-mode`. That path still starts those separate reviewer agents.

## The order

1. Run `pr-ready` on the exact head that will merge (`commands.pr_ready` in a product repo, or `node scripts/check-pr-ready.mjs` in this public snapshot). This classifies risk and must clear the static and diff gates. A `WAIT` that only waits on review is enough for this step; it is not a merge PASS. Paste the real output. High-risk work needs `author-agent: <name>` in the pull request body. Declared identity is self-asserted, not authenticated.

2. Tech Lead first, when required: the land gate is high (or `risk:` is missing) **and** the diff touches money, auth, permissions, entitlements, paid tiers, XP/economy/tokens, migrations, or write routes. `risk: low` skips this review. Deps, config, native, and locking stay Build Verifier only.

3. Build Verifier when `risk: high` or `risk:` is missing. `risk: low` skips this turn.

4. Each verdict is a comment whose first line is exactly one of:

   ```
   GATE: TL PASS <40-char-sha> agent: <name>
   GATE: TL FAIL <40-char-sha> agent: <name>
   GATE: BV PASS <40-char-sha> agent: <name>
   GATE: BV FAIL <40-char-sha> agent: <name>
   ```

   The same comment includes an `## Evidence` block that names the commands or checks run and their results, the files or areas reviewed, and that same 40-character SHA. A FAIL also lists its findings. A PASS with no shaped Evidence block does not count. A FAIL still wins with no evidence. `pr-ready` only checks that the block exists, is non-empty, and cites the same SHA as the GATE line; it cannot verify the evidence is true. The writer does not write a Tech Lead, Build Verifier, or `pr-ready` PASS line for someone else.

5. The author reruns `pr-ready` and pastes the final PASS line for this same SHA (the review `GATE:` lines are now on it).

6. The author runs the pre-merge check itself: every verdict is on the current SHA; the body has no `do not merge` or `MERGE HOLD`; there is no merge freeze; the pull request does not target a held branch (`branches.held` in `project.yml`); the diff has no migration, data deletion, deploy-config, or workflow-file change (those wait for the human owner). Then the author session may squash-merge its own pull request.

7. If the head moved, rerun the stale gates on the new head before that merge. A high-risk code change after the Build Verifier verdict needs a fresh Build Verifier run. The squash SHA need not equal the review SHA.

## What always waits for the human owner

Never push a held branch (`branches.held`). These stay with the human owner, and are never unattended:

- promotes to held branches
- OTA
- migrations
- data deletion
- deploy config
- workflow files
- spend

## Risk

`pr-ready` prints `risk: low` or `risk: high`. A pass line with no `risk:` field is not low. A `risk: low` skip is not a blanket skip of every check.

## Pack pull requests

In this public snapshot, run:

```bash
node scripts/check-pr-ready.mjs
```

This pack has no `--public` flag. Paste the last line, `pr-ready: PASS <sha>`, in the pull request body. A docs-only pull request to this pack merges on that line.
