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
- Map layer visibility is controlled by one shared state in the map route; the Tráfico shortcut and Capas checkbox update the same value to stay synchronized.
- Home displays marathon node counts and names directly from the configured scenario so it stays aligned with the map.
