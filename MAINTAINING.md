# Maintaining this pack

For people who edit this repo. Installers can ignore this file. Same layout as the umbrella-skills `MAINTAINING.md`.

## Private remote vs public snapshot

Day-to-day work stays on the **private** GitHub remote (name ends in `-private`). Keep the local folder name `umbrella-swarm` so `sync-workspace.mjs` in umbrella-skills finds it as a sibling. The public repo of the same short name is a rebuilt snapshot only: each publish is one new commit on top of public `main` whose tree is the private tree. Never push private history there.

Re-publish with `scripts/publish-public.sh` from a clean checkout of private `main`, after `check:public-safe` passes. It needs the private denylist (`PUBLIC_SAFE_DENYLIST` or a sibling `*/public-safe/denylist.txt`), gitleaks, and push access to the public repo.

Installer commands that say `SmokedMeats/umbrella-swarm` correctly mean the **public** pack.

## One copy of each rule

This pack is a layer on umbrella-skills (v1). It calls v1 skills by name and copies none of them (`swarm-mode` non-negotiable 8).

- A rule v1 already has stays in v1: the heavy-check gate, test scope, kill handling (`umbrella/BUILD-STANDING.md`); the memory check and sibling contract (`umbrella/DELEGATION.md`). The merge gate is `verify-own-work` **Scripted gate** (the product `commands.pr_ready` script). Swarm skills name that section; they don't restate risk paths, database-test rules, or a second verifier.
- Only swarm-level rules live here: areas, coordinators, Dispatch for land order and hot-file conflicts, per-area and total worker caps, docs last. The merge gate is `verify-own-work` **Scripted gate**. Do not add a default extra verifier.
- `project.example.yml` is the same file in both packs. Change it in umbrella-skills first, then copy it here byte for byte. Swarm-only settings go in `areas.example.yml`.

Everything an installed agent must read lives under `skills/` (sync copies only `skills/*`): the skill map is `skills/swarmy/SKILL-MAP.md`, the templates are `skills/swarmy/templates/`. Link to them from skills with relative paths; never from a skill to `README.md` or `docs/`.

When one issue changes both packs (an umbrella-skills issue with a swarm companion), land the v1 part first, then point the swarm skills at it.

## Before pushing

See README **Before pushing** (`check:public-safe`, and `node scripts/check-pr-ready.mjs` for the PR line).
