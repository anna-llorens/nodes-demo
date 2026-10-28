# NODES

NODES uses temporary, relocatable LiDAR nodes to count people and measure density and flow at
street events in València, so the people running an event can decide in time. This repository
holds the operator dashboard and its domain logic. It is a prototype: all data is simulated
and no real sensor is connected yet.

## Layout

- `apps/web` — the dashboard (TanStack Start, React, MapLibre). Spanish UI.
- `packages/core` — pure TypeScript domain: scenarios, seeded simulator, measured and
  estimated counts, alerts, reports.
- `packages/data-source` — the `DataSource` interface and `SimulatedSource`.
- `docs/` — decisions (ADRs), plans and sources for real-world figures.

## Run

Requires Node 22.23.4 or later 22.x (`.nvmrc`; Astro 7 needs it) and pnpm 10 (`corepack enable`, or prefix commands with
`npx pnpm@10.34.9`).

```
pnpm install
pnpm dev
```

## Test

```
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`pnpm test` runs vitest in every package, including the golden test in
`packages/core/test/golden` that proves the simulator output has not changed.
