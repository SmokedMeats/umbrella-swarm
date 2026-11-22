## Summary

<what changed>

## pr-ready

`pr-ready: PASS <head sha>`

From `node scripts/check-pr-ready.mjs` on this head. Docs-only pull requests paste that line. The exact-head Build Verifier plus `## Evidence` stand-in is retired.

## Public snapshot pull requests

Title and commit subject: `Public snapshot refresh: <topic>`. Describe the change itself. Evidence may contain only hashes and check output lines from this repository (`check:public-safe PASS` and `pr-ready: PASS <sha>`). Do not include issue links, pack names from another repository, or machine or host labels. Do not add a Refs line.
