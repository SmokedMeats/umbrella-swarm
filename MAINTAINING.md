# Maintaining this pack

For people who edit this repo. Installers can ignore this file. Same layout as the umbrella-skills `MAINTAINING.md`.

## Private remote vs public snapshot

Day-to-day work stays on the **private** GitHub remote (name ends in `-private`). Keep the local folder name `umbrella-swarm` so `sync-workspace.mjs` in umbrella-skills finds it as a sibling. The public repo of the same short name is a rebuilt snapshot only: each publish is one new commit on top of public `main` whose tree is the private tree. Never push private history there.

Re-publish with `scripts/publish-public.sh <topic>` from a clean checkout of private `main`, after `check:public-safe` passes. The commit subject is `Public snapshot refresh: <topic>`, with no private SHA; the PR title matches. It needs the private denylist (`PUBLIC_SAFE_DENYLIST` or a sibling `*/public-safe/denylist.txt`), gitleaks, and push access to the public repo.

Installer commands that say `SmokedMeats/umbrella-swarm` correctly mean the **public** pack.

## One copy of each rule

This pack is a layer on umbrella-skills (v1). It calls v1 skills by name and copies none of them (`swarm-mode` non-negotiable 8).

- A rule v1 already has stays in v1: the heavy-check gate, test scope, kill handling (`umbrella/BUILD-STANDING.md`); the memory check and sibling contract (`umbrella/DELEGATION.md`). The merge gate is `verify-own-work` **Scripted gate** (the product `commands.pr_ready` script). Swarm skills name that section; they don't restate risk paths, database-test rules, or a second verifier.
- Only swarm-level rules live here: areas, coordinators, Dispatch for land order and hot-file conflicts, per-area and total worker caps, docs last. The merge gate is `verify-own-work` **Scripted gate**. Do not add a default extra verifier.
- These files are the same in both packs: `project.example.yml`, `scripts/check-public-safe.mjs` (and its test), `scripts/publish-public.sh` (except the public repo name and temp-dir prefix), `.githooks/pre-push`, and `.gitattributes`. Change them in umbrella-skills first, then copy them here byte for byte. Swarm-only settings go in `areas.example.yml`.
- Fleet rules are the same in both packs; only scale differs. That includes no own-computer work with the Expo / EAS exception, one usage floor (`caps.cloud_usage_floor`), and `OVERFLOW_LOCAL` as a stop receipt (umbrella `CONVENTIONS.md` **No own-computer work**).

## Syncing product repos

Sync is umbrella-skills' `scripts/sync-workspace.mjs` (installers run it through umbrella-skills' `scripts/install.mjs`); this pack has no sync script. Pack pull requests land here as they are ready. The product-repo sync, into the repos listed in `project.yml` `workspace.skill_targets`, runs once per promote, right before it, never mid-day, and never while a pack PR is queued. The designated sync owner is the only agent that runs that sync, so the product branches never get two parallel syncs.

Everything an installed agent must read lives under `skills/` (sync copies only `skills/*`): the skill map is `skills/swarmy/SKILL-MAP.md`, the templates are `skills/swarmy/templates/`. Link to them from skills with relative paths; never from a skill to `README.md` or `docs/`.

When one issue changes both packs (an umbrella-skills issue with a swarm companion), land the v1 part first, then point the swarm skills at it.

## Before pushing

Every push runs a local `check:public-safe` gate (no CI) so private content cannot reach the public snapshot. It runs [gitleaks](https://github.com/gitleaks/gitleaks) over the commits being pushed, then checks every added line, new file path, and commit message against a private denylist.

One-time setup per clone (`sync-workspace.mjs` does this for sibling clones when the private overlay is present):

```bash
git config core.hooksPath .githooks
# gitleaks: brew install gitleaks | winget install gitleaks | scoop install gitleaks | release binary on Linux
# Denylist lookup: $PUBLIC_SAFE_DENYLIST, `git config publicsafe.denylist`,
# or a sibling clone with public-safe/denylist.txt. No denylist = push blocked.
```

Run it by hand (Node 18+; bash, Git Bash, or PowerShell):

```bash
node scripts/check-public-safe.mjs              # origin default branch..HEAD
node scripts/check-public-safe.mjs --base <ref> # <ref>..HEAD, e.g. a stacked PR
node scripts/check-public-safe.mjs --tree       # whole tracked tree at HEAD (audit)
```

A clean run prints one line, e.g. `check:public-safe PASS <repo>@<sha> (gitleaks 0, denylist 0)`.

For a pull request, including a docs-only one, run:

```bash
node scripts/check-pr-ready.mjs
```

Paste the last line in the PR body: `pr-ready: PASS <head sha>`. The older docs-only stand-in — an independent exact-head Build Verifier pass plus a `## Evidence` block — is retired.

