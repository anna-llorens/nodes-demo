# NODES

Temporary, relocatable LiDAR nodes that count people and measure density and flow at street
events in València. This repo holds the operator dashboard and its domain logic. Current
state: prototype with simulated data only. No real sensor is connected yet.

## Language rules

- Code, comments, JSDoc, commit messages, docs, ADRs, test names: English.
- UI strings shown to users come only from i18n files, never hardcoded in components:
  - `apps/site`: Spanish and English (`src/i18n/es.json`, `en.json`, same keys).
  - `apps/web` (demo): Spanish only until its own i18n step. Until then its strings live in
    `apps/web/src/labels/es.ts`, `src/i18n/demo-entry.*.json` or the component that shows them.
- Never mix: no Spanish comments, no English text hardcoded in the UI.
- Site languages (ADR 0004): every page exists at `/es/...` and `/en/...` (Valencian `/va/`
  later, only when translations exist), with `hreflang` for both and `x-default` → `/en/`.
  Page slugs are English in both locales (ADR 0006); Spanish path aliases are not supported.
  Only the root `/` chooses the language: a saved
  choice (cookie `nodes_lang`) first; then Spanish if the browser language is `es`, `ca`, `gl`
  or `eu`; then Spanish if the visit comes from Spain or a Spanish-speaking country (edge only,
  arrives with the deployment); English otherwise. Never redirect other pages.

## Repository layout

```
apps/site              Public website (Astro, static HTML; React islands only where needed).
apps/web               Demo and future dashboard: TanStack Start app (React + Vite,
                       server-rendered). UI only, plus the /admin analytics server functions.
packages/core          Pure TypeScript domain: scenarios, simulator, counts, estimation, alerts.
packages/data-source   DataSource interface + SimulatedSource.
packages/ui            Design tokens (src/tokens.css), shared components and the SVG assets.
docs/design            Approved mockups. Take structure, order, components and colours from
                       them, not spacing or amount of text.
docs/decisions         ADRs. Read the relevant ones before changing an area.
docs/plans             Action plans. The active plan is the source of truth for scope.
docs/sources.md        Sources for real-world figures.
```

Dependency direction: `web → data-source → core`, and `site`/`web` → `ui`. Lint enforces it. `core` must never import
React, DOM APIs or UI text. Web components and routes read data through the hooks in
`apps/web/src/data/hooks.ts`, never by calling the simulator.

## Commands

```
pnpm install
pnpm dev          # run the web app
pnpm test         # vitest in all packages
pnpm typecheck
pnpm lint
pnpm build
pnpm format:check # Prettier; not enforced until the formatting PR lands
```

pnpm 10 (pinned in `packageManager`) and Node 22.23.4 or later 22.x (`.nvmrc`; Astro 7 needs it). Without a global pnpm, use
`corepack enable` or `npx pnpm@10.34.9 <command>`.

Before finishing any task: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` must pass.

## Domain rules (do not break)

- Density is in people/m². Bands: green < 2, yellow 2–4, orange above 4 and below 6,
  red ≥ 6. 6 is the cap: no simulated value may exceed it. Reference critical density 8–10
  is shown only as context.
- Two kinds of counts, never mixed:
  - measured = density × area covered by the node (20 m radius circle, max 1,257 m²).
  - estimated = node density × area of the zone polygon. Always labelled as extrapolated.
- Node rings: 20 m = V1 target zone; 40 m = nominal sensor range (dashed, labelled "nominal").
- Alerts are rule-based and deterministic: one alert per node the first time it enters the
  high band (> 4) and the very high band (≥ 6). No LLM decides alerts or suggestions.
- The simulator is seeded: the same input must always produce the same output.
- Domain functions return data and codes (`level: "high"`, `suggestion: "divert_to_gran_via"`),
  never user-facing text.
- Scenario and node ids (`maraton`, `mascleta`, `m-xativa`, …) are stable: they appear in
  shared links and saved map state, and they seed the noise.

## Content rules for the UI

- Icons and illustrations come from `packages/ui/assets/`, rendered inline so they take the
  token colour. Never cut images out of the mockups; lucide only for small UI glyphs with no
  asset (chevron, arrow, menu, close, check). Colours come from tokens: no raw hex outside
  `packages/ui/src/tokens.css`.

- A "simulation / data not measured" label is visible on every screen while data is simulated.
- No cameras, no photos of people with detection overlays, no "live" labels on simulated data.
- No city-wide attendance totals or official capacities presented as facts.
- Alert and value copy: "helps decide in time". Never "prevents incidents", "danger", "evacuate".
- Figures from the real world must have a source in `docs/sources.md` (e.g. Medio Maratón 2025:
  27,681).

## How to work in this repo

- For anything larger than a small fix: plan first, wait for approval, then implement.
- Stay inside the scope of the active plan in `docs/plans/`. If a change is out of scope or
  would alter visible behaviour unexpectedly, stop and ask.
- Every change to a domain rule needs a test. Refactors must keep the golden test passing
  (`packages/core/test/golden`).
- Small commits, Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `ci:`).
- Record non-trivial decisions as a short ADR (Context · Decision · Consequences · Alternatives).
- Do not add dependencies without saying why; prefer what is already installed.
- Do not edit generated files or lockfiles by hand.

## Architecture notes

- Report aggregation (`aggregateReport` in core) samples once per minute; time in each band
  excludes the end point so durations do not overcount.
- Runner heat samples and their density-linked weights come from `simulateRunnerHeat` in core;
  `apps/web/src/components/nodes/geo.ts` only projects them onto the route.
- Only English route names are supported; Spanish aliases and their redirects are removed (ADR 0006). `/` and `/home` share
  the demo entry screen (`DemoEntry`).
- Map layer visibility is one shared state in the map route, exposed through Capas.
- `DemoHeader` (logo to `PUBLIC_SITE_URL`, simulation badge, "Volver a la web", alerts bell inside
  scenarios) is the single header of every demo screen; `AppShell` and `DemoEntry` render it once.
- Runner heat colours read semantic CSS tokens through canvas colour conversion so MapLibre uses
  the theme palette.
- Share-map URL serialization lives in `apps/web/src/lib/map-share.ts` (browser-safe); saved
  map state is kept per scenario.
- Analytics identify users with anonymous random ids (visitor in localStorage, session in
  sessionStorage) so `/admin` can count users and sessions without personal data.

## Not yet decided (ask before assuming)

- Backend stack and hosting for the API.
- Data format and transport from physical nodes.
- Authentication and user roles.
