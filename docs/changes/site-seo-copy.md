# Site SEO copy

## Goal

Help the public site rank for LiDAR sensors, people counting, crowd monitoring and management,
smart city, IoT, edge computing and govtech / public administration, in English and Spanish.
Copy, one new Applications sector and research-article metadata change; URLs, slugs and routes
stay.

## Decisions

### Site catalogs

- The team supplied the final catalogs ([`en.json`](../../apps/site/src/i18n/en.json),
  [`es.json`](../../apps/site/src/i18n/es.json)); they replace the previous ones with the same
  278 keys per locale, in the same order. They build on the home hero redesign (`hero.title` +
  `hero.titleHighlight`, buttons to Research and Applications), committed separately.
- **Home title and description**: "NODES · LiDAR people counter for the smart city" /
  "NODES · Sensores LiDAR para smart city y control de aforo" (47 / 57 characters), and
  descriptions of 145 / 146 characters. The description is also the Organization JSON-LD
  description on the home page.
- **"smart city" in English in both locales**, replacing "ciudades inteligentes" and "smart
  cities" across the catalogs, the home tile and the Applications sector.
- **No "live" or real-time claims for the product**: the prototype runs on simulated data, and
  the home copy keeps the approved "helps them decide in time" wording. "In real time" appears
  only in the Research page's open questions, phrased as research goals.
- **Fourth sector `cities`** ("Smart city and public administration" / "Smart city y
  administración pública"): in [`sectors.ts`](../../apps/site/src/config/sectors.ts), so it
  appears as an Applications card (anchor `#cities`) and as a home tile. Icon `icons/map`; the
  photo reuses the team's own `research/prediction-city-map.webp` (`edge-city-network.webp` was
  rejected because it shows a security-camera icon).
- **Layout**: Applications cards are a 2×2 grid from 768px
  ([`Cards.astro`](../../apps/site/src/sections/applications/Cards.astro)); home tiles go 2 per
  row on tablets and 4 from 1024px ([`Sectors.astro`](../../apps/site/src/sections/home/Sectors.astro)).

### Research articles

- **Meta description**: the research schema dropped the `description` frontmatter field, so
  articles used `subtitle` as their meta description. `description` is now an optional schema
  field limited to 155 characters
  ([`content.config.ts`](../../apps/site/src/content.config.ts)), and the article page uses it,
  falling back to `subtitle`
  ([`[slug].astro`](../../apps/site/src/pages/[locale]/research/[slug].astro)).
- **Keywords**: each of the six assigned articles, in both locales, got a new description (137–154
  characters), a keyword in the introduction and, where it read naturally, in the subtitle. Data,
  figures, sources and conclusions are unchanged, and NODES is not mentioned.
- **H2 headings unchanged**: their text is the anchor of the table of contents, so renaming them
  would break in-page links.
- **Title length**: page titles are `<title> · NODES` and must stay at 60 characters or fewer.
  The Spanish edge article title became "Edge computing para la monitorización de multitudes"
  (59 with the suffix); its slug is unchanged.
- "Hacia sistemas de apoyo a decisiones" / "Towards decision-support systems" had no assigned
  keywords, but their descriptions were over 155 characters and now fail the schema; they were
  shortened by dropping "what the evidence says".

## Validation

Site `typecheck` (0 errors, 0 warnings), site `test` (40 passed), repo `lint` (0 errors; 5
existing warnings in other packages) and site `build` (32 pages) passed. The built home and
article pages carry the new titles and descriptions in both locales.

## Limitations and follow-ups

- Contact and About meta descriptions come from `contact.hero.lead` (222 / 213 characters) and
  `about.hero.lead` (199 / 159); both are over 155. They are the visible hero leads, so shortening
  them needs either new copy or a separate description key.
- Inner page titles are still `<nav label> · NODES` (About renders "About NODES · NODES").
- The home illustration's source and rights are still marked TODO in
  [`assets/README.md`](../../apps/site/src/assets/README.md); confirm before deploying.
- Responsive layout of the 2×2 grid and four tiles was not inspected in a browser.
