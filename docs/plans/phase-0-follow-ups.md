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
- [ ] **`.env` is tracked** in `apps/web` (Supabase publishable keys, Lovable analytics key):
      decide whether it stays in git when hosting moves.
- [ ] **i18n (Step 2)**: replace `apps/web/src/labels/es.ts` and inline strings with Lingui
      catalogues.
- [ ] **Hosting (Step 3)**: Lovable can no longer edit or publish once this lands on `main`.
