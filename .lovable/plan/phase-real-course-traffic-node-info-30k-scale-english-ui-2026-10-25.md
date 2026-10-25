# Phase: real course, traffic, node info, 30k scale (English UI)

## What changes
1. **Spanish UI** – keep all visible text (nav, map, panels, badges, home, placeholder pages) in Spanish.
2. **Simulation badge** – shows only "Simulation" (no "datos no medidos").
3. **Clock with seconds** – event time shown as HH:MM:SS in the player and panels.
4. **200× speed** – added next to 1× / 10× / 60× / 100×.
5. **30,000 participants** – zone counts scaled to 30k runners plus spectators/fans along the course, counted separately (runners vs public) at each zone (start peak, finish/reunion peak).
6. **Real course** – replace the approximate route with the real 21K Valencia GPS course from the uploaded Nodes.html (used as reference only), on the existing open-source Valencia map.
7. **Reference points** – nodes placed on the points marked in the file, including **Plaza del Ayuntamiento** as a new zone.
8. **Traffic button (top-left of map)** – toggles traffic lines on the map: green / amber / red street segments near the course, changing with event time.
9. **Node info button** – opens an info card for the selected node (Plaza del Ayuntamiento style from mock 3): name, people, density, flow in/out, speed, 10-min change, road/sidewalk split.
10. **About (Más page)** – "Features" section listing what currently works.

Layout stays as it is (sidebar / bottom bar, map center, right panel).

## Technical details
- Extract waypoints and points from `Nodes.html` into `src/scenarios/maraton.ts`; add Plaza del Ayuntamiento node with its own curve; tune `areaM2`/curves so peak people sum ~30k.
- Traffic segments defined per scenario (`traffic` field in types) with a congestion curve evaluated by `src/sim/engine.ts` (deterministic); rendered as a maplibre line layer colored by level; `traffic` added to `MapLayers`.
- `fmtClock` gets seconds; player speeds array gains 200.
- Node info: button in MapStage opens a sheet/card fed by `simulate()` snapshot.
- Update engine tests: max density, determinism, meta orange at 10:15, total people at peak within 30k bound, traffic deterministic.
