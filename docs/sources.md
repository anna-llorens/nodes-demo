# Sources for real-world figures

Every real-world figure shown in the app needs an entry here.

| Figure | Value | Used in | Source |
|---|---|---|---|
| Registered runners, Medio Maratón de València 2025 | 27,681 | `packages/core/src/scenarios/maraton.ts` (`participants`), shown on the map as "inscritos (base: edición 2025)" | Ivie, via Última Hora, 3 Mar 2026 — [Maratón y Medio Maratón de Valencia impulsan el gasto turístico (2025)](https://www.ultimahora.es/noticias/comunidades/2026/03/03/2581349/maraton-medio-maraton-valencia-impulsan-gasto-turistico-millones-euros-2025.html) |

Not sourced (simulation inputs, not presented as facts): density curves, zone polygons and
occupancies, traffic levels and crossing waits. The route and traffic segments are reference
data from the València open data portal.
| Occupancy densities by type of area (m²/person): standing spectators 0.25; nightclub audience 0.5; seated spectators without assigned seats 0.5; multi-purpose halls 1; standing customers in bars and cafés 1; seated customers in bars and restaurants 1.5; gyms without equipment 1.5; museums, fairs and exhibitions 2; lounging at outdoor pools 4; gyms with equipment 5; transport terminals 10 | see figure | `packages/core/src/capacity/capacity-data.json` (`zones`), capacity calculator | CTE DB-SI 3, table 2.1 — [Sección SI 3 Evacuación de ocupantes](https://normatia.com/es/normativa/cte-db-si/2025/seccion-si-3-evacuacion-de-ocupantes) |
| Total exit width | A ≥ P/200 m | `exitWidth` in `packages/core/src/capacity/capacity.ts` | [Cálculo de aforo y anchura de evacuación (DB-SI 3)](https://normatia.com/es/blog/calculo-aforo-locales-comerciales-db-si-3/) |
| Crowd red lines | 5 people/m² standing, 3 people/m² moving | `capacity-data.json` (`levels`), capacity calculator | EIAI — [Crowd risk analysis and crowd safety](https://eiai.ie/crowd-risk-analysis-and-crowd-safety/) |
| Start of serious risk | about 4 people/m² | `capacity-data.json` (`levels.standing`, `thresholds.standing`) | HSE Blog — [Crowd crush prevention](https://www.hseblog.com/crowd-crush-prevention/) |
| Intermediate level ("attention" from 2 people/m²) | 2 people/m² | `capacity-data.json` (`levels`) | NODES proposal, to be validated (no external source) |
