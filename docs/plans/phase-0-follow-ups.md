# Phase 0 · Follow-ups

Collected while doing Step 1 (monorepo and domain extraction). Not in scope there.

- [ ] **Formatting pass** as a separate PR: run `pnpm format` once, then add `pnpm format:check`
      to CI.
- [ ] **Check the origin and licence of all photos** (`apps/web/src/assets`).
- [ ] **Photos of people**: the marathon and node photos may show people; content rules allow
      none with detection overlays and prefer none at all. Replace or crop as needed.
- [ ] **40 m ring label**: the map draws the 40 m nominal-range ring dashed but only the legend
      names it ("alcance nominal"); the content rules want it labelled "nominal" on the map.
- [ ] **Spanish code comments** remain in `apps/web` files that the refactor did not rewrite
      (language rule: English only).
- [ ] **Lint warnings**: two `react-refresh/only-export-components` (`AppShell.tsx`,
      `MapStage.tsx`) and one `react-hooks/exhaustive-deps` (`MapStage.tsx`).
- [ ] **`.env` is tracked** in `apps/web`. Checked 2026-10-28: it holds no secrets (Supabase URL,
      project id and `sb_publishable_` keys, and a GA4 measurement id, all public by design; the
      real secrets come from the hosting environment). Decide whether it stays in git when
      hosting moves.
- [ ] **Density colours differ between the demo's legend and its heat map.** Legend, node dots and
      alert icons use the OKLCH tokens in `apps/web/src/styles.css` (`--dens-*`); the MapLibre heat
      map and zone polygons use hard-coded hex in `apps/web/src/components/nodes/MapView.tsx`
      (`#2bb673`/`rgba(76,190,120,…)`, `#f2d14b`, `#f08a3c`, `#e0453a`). `packages/ui` copies the
      legend values; align the map with them (MapLibre needs literal colours, so convert the
      tokens like the runner heat already does).
- [ ] **i18n (Step 2)**: replace `apps/web/src/labels/es.ts` and inline strings with Lingui
      catalogues.
- [ ] **Hosting (Step 3)**: Lovable can no longer edit or publish once this lands on `main`.
