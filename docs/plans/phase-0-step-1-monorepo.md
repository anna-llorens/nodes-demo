# Phase 0 · Step 1 — Monorepo and domain extraction

**Status:** implemented on `feat/move-from-lovable` (see the PR for deviations)
**Owner:** Anna Llorens Roig
**Executor:** Claude Code (plan mode first, then implementation)

## 1. Context

NODES started as a Lovable prototype: a single Vite + React SPA where the simulator, the
density/estimation maths, the alert rules and the UI all live together in `src/`.

The app will become the company's production system. Real LiDAR nodes will replace the
simulator, a backend will be added, and the UI will be translated. To get there safely, the
domain logic must be independent of React and of the data origin.

This step restructures the repository. **It must not change anything the user can see.**

## 2. Goals

1. Convert the repo into a pnpm workspaces monorepo.
2. Move the current app to `apps/web` keeping git history.
3. Extract all domain logic into `packages/core` (pure TypeScript, no React, no DOM).
4. Introduce a `DataSource` abstraction in `packages/data-source`, with `SimulatedSource`
   as the only implementation for now.
5. Make the web app read data only through `DataSource`.
6. Prove there is no behaviour change with a golden-file test.
7. Add basic CI (typecheck, lint, test, build) on every push and pull request.
8. Document the decisions (ADRs) and update `CLAUDE.md`.

## 3. Non-goals (do NOT do in this step)

- No i18n library (that is Step 2). Spanish UI strings stay where they are.
- No backend, no deployment changes, no new hosting.
- No UI, styling, copy or data changes.
- No dependency upgrades beyond what the restructure strictly needs.
- No new features.

## 4. Constraints

- All code, comments, JSDoc, commit messages and docs in **English**. Spanish only in UI strings.
- Content rules in `CLAUDE.md` still apply (simulation label, density ≤ 6 pers/m², measured vs
  estimated counts, alert wording).
- Small commits, one per step below, using Conventional Commits (`chore:`, `refactor:`, `test:`,
  `ci:`, `docs:`).
- If something is ambiguous or a step would change visible behaviour, **stop and ask**.

## 5. Target structure

```
nodes/
├── apps/
│   └── web/                  # React + Vite SPA (UI only)
├── packages/
│   ├── core/                 # Pure TS domain: scenarios, simulator, counts, estimation, alerts
│   └── data-source/          # DataSource interface + SimulatedSource
├── docs/
│   ├── decisions/            # ADRs
│   └── plans/                # This file and future plans
├── .github/workflows/ci.yml
├── CLAUDE.md
├── package.json              # Root scripts only
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── .nvmrc
```

Dependency direction (enforced by lint): `web → data-source → core`. `core` imports nothing
from the other two and nothing from React or the DOM.

## 6. Steps

### Step 0 · Preflight

- Confirm the working tree is clean and `npm run build` passes on the current code.
- Create branch `chore/monorepo`.
- Tag the current commit `v0-lovable-demo` and push the tag. It is the frozen demo backup.
- **Golden baseline:** write a temporary script that runs the current simulator for every
  scenario, minute by minute, and saves all node values (density, measured, estimated, in/out
  flow, variation) and all generated alerts to `packages/core/test/golden/baseline.json`.
  Commit it before moving any code.

**Lovable note:** Lovable expects the project at the repo root. After this step, editing and
publishing from Lovable will stop working. `nodes-demo.lovable.app` stays online with the last
published version until hosting moves to Cloudflare (Step 3). Remove `lovable-tagger` from the
Vite config only if it breaks the build; otherwise leave it for Step 3.

### Step 1 · Workspace setup

- Switch to pnpm: add `packageManager` to the root `package.json`, `pnpm-workspace.yaml`
  (`apps/*`, `packages/*`), and `.nvmrc` with the current Node LTS.
- Generate `pnpm-lock.yaml`; remove `package-lock.json` / `bun.lockb` if present.
- Root scripts: `dev`, `build`, `test`, `typecheck`, `lint`, each delegating to workspaces
  (`pnpm -r` or `--filter`).
- `tsconfig.base.json` with the shared compiler options; each package extends it.

**Done when:** `pnpm install` works from the root.

### Step 2 · Move the app

- `git mv` the app into `apps/web` (src, public, index.html, vite config, tailwind/postcss
  config, components.json, its tsconfig files).
- Package name `@nodes/web`. Fix paths and aliases (`@/`).

**Done when:** `pnpm --filter @nodes/web dev` and `build` work and the app looks identical.

### Step 3 · Extract the domain into `packages/core`

- Package name `@nodes/core`. Internal package consumed as TypeScript source
  (`"exports": { ".": "./src/index.ts" }`), no build step for now.
- First, **list** the files and functions you plan to move and wait for confirmation.
  Expected candidates: scenario configs, seeded generator, density × area counting, polygon
  area estimation (`@turf/area`), alert rules, shared types.
- Domain functions return data and **codes**, not UI text. Example: an alert returns
  `{ level: "high", nodeId: "xativa", suggestion: "divert_to_gran_via" }`. The Spanish text
  for each code lives in `apps/web` (a plain map for now; Step 2 replaces it with i18n).
  The rendered text must stay exactly the same.
- Move existing domain tests (vitest) into `packages/core`.
- Add a golden test that recomputes every scenario and compares it with `baseline.json`
  (exact match). Delete the temporary script from Step 0.

**Done when:** core tests and the golden test pass; `core` has no React/DOM imports.

### Step 4 · `DataSource` abstraction

- Package `@nodes/data-source` with the interface and `SimulatedSource`.
- Design it for the future live source: async reads plus a subscription. Starting sketch
  (propose improvements in the ADR):

```ts
/** Read access to node data, independent of where the data comes from. */
export interface DataSource {
  listScenarios(): Promise<ScenarioSummary[]>;
  getScenario(id: ScenarioId): Promise<Scenario>;
  /** Snapshot of every node at a given event time. */
  getSnapshot(id: ScenarioId, at: EventTime): Promise<Snapshot>;
  getNodeSeries(id: ScenarioId, nodeId: NodeId): Promise<NodeSeries>;
  getAlerts(id: ScenarioId, until: EventTime): Promise<Alert[]>;
  /** Push updates; the simulator drives it from the playback clock. */
  subscribe(id: ScenarioId, onSnapshot: (s: Snapshot) => void): Unsubscribe;
}
```

- `SimulatedSource` wraps `@nodes/core`. No other implementation yet.

**Done when:** the interface has JSDoc, `SimulatedSource` has unit tests.

### Step 5 · Web reads through `DataSource`

- A React context provides the `DataSource` instance (`SimulatedSource` today).
- Components and hooks stop importing the simulator or domain functions for data; they use
  hooks backed by the context. Pure helpers such as formatting may still import types from core.
- Playback (play/pause/speed/slider) keeps working as today.

**Done when:** a search finds no direct simulator imports in `apps/web/src/components`,
and the app behaves identically (check both scenarios, map, node detail, alerts, report, CSV).

### Step 6 · Tooling and boundaries

- ESLint at the root with `no-restricted-imports` (or `eslint-plugin-boundaries`) enforcing
  `web → data-source → core` and banning `react` / DOM globals in `core`.
- Prettier with the existing style. Do not reformat unrelated code in this step beyond what
  moving files requires.

**Done when:** `pnpm lint` and `pnpm typecheck` pass from the root.

### Step 7 · CI

- `.github/workflows/ci.yml` on push and pull request: setup pnpm and Node from `.nvmrc`,
  `pnpm install --frozen-lockfile`, then `typecheck`, `lint`, `test`, `build`.
- No deployment in this workflow.

**Done when:** the workflow is green on the branch.

### Step 8 · Documentation

- `docs/decisions/0001-monorepo-with-pnpm-workspaces.md`
- `docs/decisions/0002-datasource-abstraction.md`
- `docs/decisions/0003-domain-returns-codes-not-ui-text.md`
- ADR format: Context · Decision · Consequences · Alternatives considered. Short.
- Update the root `CLAUDE.md`: language rules, structure, dependency direction, commands.
- Add a short `CLAUDE.md` in `packages/core` (pure TS, no UI text, tests required for every
  rule change).
- `README.md`: what NODES is (one paragraph), how to run, how to test.
- Move this plan to `docs/plans/`.

## 7. Definition of done

- [ ] `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm build` pass from root
- [ ] Golden test passes: simulator output identical to the pre-refactor baseline
- [ ] The app looks and behaves exactly as before (both scenarios, all screens, CSV)
- [ ] `core` has no React/DOM imports; boundaries enforced by lint
- [ ] CI green on the pull request
- [ ] Three ADRs, updated `CLAUDE.md`, README
- [ ] Tag `v0-lovable-demo` exists
- [ ] One commit per step, all in English

## 8. Report back

When finished, reply with:
1. The final tree (two levels deep).
2. The list of moved domain modules and their new paths.
3. Anything you could not do, or decided differently, and why.
4. Suggested follow-ups for Step 2 (i18n with Lingui).