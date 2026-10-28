# 0001 · Monorepo with pnpm workspaces

**Status:** accepted · 2026-10-28

## Context

NODES started as a single Lovable project: one TanStack Start app with the simulator, the
density and estimation maths, the alert rules and the UI in `src/`. It will become a
production system with real sensors, a backend and a translated UI, so the domain has to be
usable without React and testable on its own.

## Decision

- One repository with pnpm workspaces: `apps/web` (the app) and `packages/*` (`core`,
  `data-source`). Internal packages are consumed as TypeScript source (`exports` points at
  `src/index.ts`), with no build step.
- pnpm 10 pinned in `packageManager`, Node 22 in `.nvmrc`.
- The one-day minimum release age from `bunfig.toml` moves to `pnpm-workspace.yaml`
  (`minimumReleaseAge: 1440`). The new lockfile was generated so that every direct
  dependency resolves to the same version as the old `bun.lock`.
- Shared compiler options in `tsconfig.base.json`; one ESLint config at the root enforces the
  dependency direction `web → data-source → core`.

## Consequences

- Lovable expects the app at the repository root: once this lands on `main`, editing and
  publishing from Lovable stop working. `nodes-demo.lovable.app` keeps the last published
  version, and the tag `v0-lovable-demo` freezes the demo source.
- Domain changes are tested in `packages/core` without a browser.
- Contributors need pnpm (`corepack enable` or `npx pnpm@10.34.9`).

## Alternatives considered

- **Stay single-package** with folders for domain and UI: no enforced boundary, and the domain
  would keep the app's DOM and React setup.
- **npm, Yarn or Bun workspaces**: pnpm's strict `node_modules` catches undeclared imports
  between packages, and it supports the release-age guard.
- **Turborepo or Nx**: unnecessary for three packages; can be added later on top of pnpm.
