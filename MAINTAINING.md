# Maintaining this pack

For people who edit this repo. Installers can ignore this file. Same layout as the umbrella-skills `MAINTAINING.md`.

## Private remote vs public snapshot

Day-to-day work stays on the **private** GitHub remote (name ends in `-private`). Keep the local folder name `umbrella-swarm` so `sync-workspace.mjs` in umbrella-skills finds it as a sibling. The public repo of the same short name is a rebuilt snapshot only: each publish is one new commit on top of public `main` whose tree is the private tree. Never push private history there.

Re-publish with `scripts/publish-public.sh` from a clean checkout of private `main`, after `check:public-safe` passes. It needs the private denylist (`PUBLIC_SAFE_DENYLIST` or a sibling `*/public-safe/denylist.txt`), gitleaks, and push access to the public repo.

Installer commands that say `SmokedMeats/umbrella-swarm` correctly mean the **public** pack.

## One copy of each rule

This pack is a layer on umbrella-skills (v1). It calls v1 skills by name and copies none of them (`swarm-mode` non-negotiable 8).

- A rule v1 already has stays in v1: the heavy-check gate, test scope, kill handling (`umbrella/BUILD-STANDING.md`); the memory check, sibling contract and merge recheck (`umbrella/DELEGATION.md`); review depth and the receipt fields (`build-verifier`). Swarm skills name the section; they don't restate the rule or invent their own keys or lock files for it.
- Only swarm-level rules live here: areas, coordinators, Dispatch tiers, per-area and total worker caps, docs last, verifier fan-out.
- `project.example.yml` is the same file in both packs. Change it in umbrella-skills first, then copy it here byte for byte. Swarm-only settings go in `areas.example.yml`.

Everything an installed agent must read lives under `skills/` (sync copies only `skills/*`): the skill map is `skills/swarm/SKILL-MAP.md`, the templates are `skills/swarm/templates/`. Link to them from skills with relative paths; never from a skill to `README.md` or `docs/`.

When one issue changes both packs (an umbrella-skills issue with a swarm companion), land the v1 part first, then point the swarm skills at it.

## Before pushing

See README **Before pushing** (`check:public-safe`).
