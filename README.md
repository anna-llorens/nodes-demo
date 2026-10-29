# NODES

## Run locally

Requires Node.js 22.23.4 or later and pnpm 10. The repository pins pnpm 10.34.9 in
`package.json` and the Node.js version in `.nvmrc`. With [nvm](https://github.com/nvm-sh/nvm),
install and activate the required Node.js version, then enable the pinned pnpm version:

```
nvm install 22.23.4
nvm use 22.23.4
corepack enable
corepack prepare pnpm@10.34.9 --activate
```

From the repository root, install dependencies once:

```
pnpm install
```

Start either app from the repository root. Each command runs a local development server; open
the localhost URL printed in that terminal:

```
# Operator dashboard (apps/web)
pnpm dev

# Public website (apps/site)
pnpm dev:site
```

To run both apps at the same time, start each command in a separate terminal. Stop a server with
Ctrl+C.

The dashboard prototype uses simulated data and does not require a physical sensor. Supabase
environment variables are needed only for features that connect to Supabase; keep local secrets
in an ignored `.env` file and never commit them. The public website can run without
`PUBLIC_SITE_URL` locally; that variable is for canonical URLs when deployed.


## Layout

- `apps/web` — the dashboard (TanStack Start, React, MapLibre). Spanish UI.
- `apps/site` — the public website (Astro), available in Spanish and English.
- `packages/core` — pure TypeScript domain: scenarios, seeded simulator, measured and
  estimated counts, alerts, reports.
- `packages/data-source` — the `DataSource` interface and `SimulatedSource`.
- `docs/` — see [`docs/README.md`](docs/README.md) for the documentation index, including
  design references, decisions, plans, sources and dated change summaries.


## Test

```
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`pnpm test` runs vitest in every package, including the golden test in
`packages/core/test/golden` that proves the simulator output has not changed.
