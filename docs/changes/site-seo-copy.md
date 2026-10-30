# Site SEO copy

## Goal

Help the public site rank for LiDAR sensors, crowd monitoring, smart cities, IoT and
govtech / public administration, in English and Spanish, on the home, Applications and About
pages. Only copy and one new Applications sector change; page structure, routes and the H1 stay.

## Decisions

- **Home title and description** (`meta.title`, `meta.description`) now lead with the target
  terms. The description is also the Organization JSON-LD description on the home page. The
  Spanish title (73 characters) is longer than Google usually shows; the key terms come first so
  truncation only cuts "ciudades inteligentes".
- **"Technology", not "sensors"**: NODES uses LiDAR sensors but does not build them, so the copy
  says it develops LiDAR and IoT technology.
- **No "real-time" claims**: the prototype runs on simulated data. The new home sentence uses
  the approved "helps them decide in time" wording instead of "real-time crowd data".
- **H1 unchanged**: "Technology for safer, more efficient and more human spaces." is the approved
  mockup heading with a 14ch layout. The keywords go into the hero lead just below it
  (`hero.lead`, "LiDAR and IoT", "smart cities").
- **Fourth sector `cities`** ("Smart cities and public administration" / "Ciudades inteligentes
  y administración pública"): added to [`sectors.ts`](../../apps/site/src/config/sectors.ts), so
  it appears both as an Applications card (anchor `#cities`) and as a home tile linking to it.
  Icon `icons/map` from `packages/ui`. The photo reuses the team's own generated
  `research/prediction-city-map.webp` (recorded in
  [`assets/README.md`](../../apps/site/src/assets/README.md)); `edge-city-network.webp` was
  rejected because it shows a security-camera icon.
- **Layout**: with four sectors, the Applications cards become a 2×2 grid from 768px
  ([`Cards.astro`](../../apps/site/src/sections/applications/Cards.astro)) and the home tiles go
  2 per row on tablets and 4 per row from 1024px
  ([`Sectors.astro`](../../apps/site/src/sections/home/Sectors.astro)). This departs from the
  three-column mockup to avoid an orphan card.
- **About "Innovation"** now mentions urban innovation and govtech partnerships with city
  councils and public administrations.
- Content rules checked: no "danger", "evacuate", "prevents" or "live"; no new real-world
  figures, so `docs/sources.md` is unchanged.

Strings live in [`en.json`](../../apps/site/src/i18n/en.json) and
[`es.json`](../../apps/site/src/i18n/es.json): `meta.title`, `meta.description`, `hero.lead`,
`home.project.paragraph1`, `home.sectors.cities`, `applications.cities.*`,
`about.approach.innovation.text`.

## Validation

Site `typecheck` (0 errors, 0 warnings), site `test` (40 passed), repo `lint` (0 errors; 5
existing warnings in other packages) and site `build` (32 pages) passed. The built home pages
carry the new titles in both locales, and `/en/applications` contains the `#cities` card.

## Limitations and follow-ups

- Inner page titles are still `<nav label> · NODES` (e.g. "Applications · NODES"; About renders
  "About NODES · NODES"). Keyword-bearing per-page titles would need a `metaTitleKey` in
  [`routes.ts`](../../apps/site/src/lib/routes.ts).
- The Applications meta description is still `applications.hero.lead`, which does not mention
  smart cities.
- Responsive layout of the 2×2 grid and four tiles was not inspected in a browser.
