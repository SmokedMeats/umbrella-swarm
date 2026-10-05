# Swarm plan (template)

The **product-specific** swarm plan (area map, collision matrix, bot wiring,
rollout for a named app) lives in the private overlay repo, not here.

This public pack keeps:

- Skills: `swarm-mode`, `swarm`, `area-coordinator`, `verify-own-work`, `recall`
- Templates under `templates/`
- `areas.example.yml` and `project.example.yml`

## What a plan must cover

1. **Active cap** — how many area coordinators run at once, and why.
2. **Areas** — every open milestone maps to exactly one area; statuses Active / Next / Parked / Retired.
3. **Layered goals** — Area → Milestone → House → Ticket (each with a why + done-check).
4. **Handoffs** — Board (intake), Dispatch (merge path), founder gates (promote / migrate / irreversible).
5. **Verification ladder** — receipt rungs before merge autonomy rises.
6. **Collisions** — `usually_touches` + hot-file leases.
7. **Rotation** — when an Active slot frees and who takes it.

Fill `areas.yml` from `areas.example.yml` in your private overlay. Point skills at it via `project.yml` / `docs/swarm/areas.yml` after sync.
