<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Simulation data comes only from src/sim/engine.ts (deterministic, fixed seed) driven by per-scenario curves in src/scenarios/*.ts; screens never hardcode figures, so the demo is reproducible and new scenarios reuse the same engine.
- Report aggregation in src/sim/reports.ts samples the engine once per minute; interval durations exclude the endpoint so totals do not overcount.
- Runner movement samples and density-linked weights come from simulateRunnerHeat in the simulation engine; geo.ts only projects these samples onto the route.
- English content routes are canonical; Spanish legacy URLs redirect to them to preserve existing links, and / and /home share a browser-safe HomePage component.
- Map layer visibility is controlled by one shared state in the map route and exposed through Capas to avoid duplicate controls.
- Home displays the marathon node count directly from the configured scenario so it stays aligned with the map.
- AppShell owns the single simulation status strip outside the scrollable content so every page keeps it visible without duplicates.
- Runner heat paint reads semantic CSS tokens through browser canvas color conversion so MapLibre uses the shared theme palette.

- Share-map URL serialization lives in a browser-safe module; MapLibre reports its camera and the route validates saved state so shared links restore the configured scenario, layers, palette and paused simulation time without browser-storage dependencies.
- Internal analytics identify users with anonymous random IDs (visitor in localStorage, session in sessionStorage) so /admin can count distinct users and sessions without personal data.

## Minimal-change mode (production app on main)

The app on `main` is published from Lovable. Changes here must be small and safe.

- Change only what the task asks. Do not refactor, rename, reformat or move code you do not need to touch.
- No new dependencies unless the task cannot be done without one; ask first and say why.
- Do not change build config (vite, tsconfig, eslint, package manager) or Lovable files (`.lovable/`).
- Do not change existing Spanish texts, styles, routes or behaviour. In Spanish the app must look exactly as before.
- Reuse existing components and styles; do not add a new UI kit or design tokens.
- Database: every Supabase change is a new SQL migration, shown to me before applying. RLS on every new table.
- One small commit per step; plan first, wait for approval, stop after each step.
- Report: files changed (with a one-line reason each) and anything you chose not to do.
