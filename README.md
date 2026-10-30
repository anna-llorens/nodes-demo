# NODES

## Run locally

Requires Node.js 22.23.4 or later and pnpm 10. The repository pins pnpm 10.34.9 in
`package.json` and the Node.js version in `.nvmrc`. With [nvm](https://github.com/nvm-sh/nvm),
run the following setup commands from the repository root (`nodes-demo/`) to install and
activate the required Node.js version, then enable the pinned pnpm version:

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

## Site database (contact messages)

The contact form saves messages in the Cloudflare D1 database `nodes-contact` (binding `DB`,
table `contact_messages`; schema in `apps/site/worker/migrations`, see ADR 0010). Wrangler is a
dependency of `@nodes/site`, so commands from the repository root (`nodes-demo/`) must include
`pnpm --filter @nodes/site exec`. This also runs Wrangler in `apps/site`, where its configuration
and migrations live.

From the repository root, log in to the Cloudflare account that owns the database:

```bash
pnpm --filter @nodes/site exec wrangler login
```

From the repository root, read the latest 20 messages from the deployed database:

```bash
pnpm --filter @nodes/site exec wrangler d1 execute nodes-contact --remote --command "SELECT id, created_at, name, email, organization, interest, message FROM contact_messages ORDER BY id DESC LIMIT 20"
```

From the repository root, apply pending schema migrations to the deployed database:

```bash
pnpm --filter @nodes/site exec wrangler d1 migrations apply nodes-contact --remote
```

If your terminal is already in `apps/site/`, use `pnpm exec wrangler ...` instead of
`pnpm --filter @nodes/site exec wrangler ...` for each command above.

`--remote` targets the deployed database. Replace it with `--local` to target the local copy used
by the site preview, started from the repository root with `pnpm --filter @nodes/site preview`.

You can also browse the table in the Cloudflare dashboard: Storage & Databases → D1 →
`nodes-contact` → Console. The messages contain personal data: do not export or share them
outside the team.


## Layout

- `apps/web` — the dashboard (TanStack Start, React, MapLibre). Spanish UI.
- `apps/site` — the public website (Astro), available in Spanish and English.
- `packages/core` — pure TypeScript domain: scenarios, seeded simulator, measured and
  estimated counts, alerts, reports.
- `packages/data-source` — the `DataSource` interface and `SimulatedSource`.
- `docs/` — see [`docs/README.md`](docs/README.md) for the documentation index, including
  design references, decisions, plans, sources and dated change summaries.


## Test

Run these checks from the repository root (`nodes-demo/`):

```
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`pnpm test` runs vitest in every package, including the golden test in
`packages/core/test/golden` that proves the simulator output has not changed.
