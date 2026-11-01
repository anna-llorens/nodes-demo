# Site SEO · page metadata, articles and redirects (apps/site)

Branch: work on whatever branch is checked out. Never create, switch or push branches; leave
all changes uncommitted so I can review them and decide where they go. Only `apps/site` changes.
Do not touch `apps/web`, `packages/core` or `packages/data-source`.

## Why

An audit of the built site (32 pages, 1 Nov 2026) found the base is right: every page has a title,
a description, a canonical link, hreflang with `x-default`, Open Graph and Twitter tags and one H1;
the sitemap pairs article translations; robots.txt and `noindex` are correct. What is left:

- Section pages use the nav label as their title (`Research · NODES`, `About NODES · NODES`).
- Their descriptions reuse `*.hero.lead`: Contact 213/222 characters, About 159/199 (cut by
  Google), Demo 77 (too short), Applications and Research carry no keywords.
- Articles are `og:type=website`, with no `article:published_time`, no Article or BreadcrumbList
  JSON-LD, and all pages share `og-default.jpg`.
- `/es/collaborate` and `/en/collaborate` are meta-refresh pages, not real 301s.

## Working rules

- One step at a time: short plan → wait for my OK → implement → short report → stop.
- Git: never commit, stage, push, merge, rebase or reset. End each step with files changed
  (one line each), check results and a suggested Conventional Commit message.
- Checks: `pnpm --filter @nodes/site typecheck`, `test` and `build` (with
  `PUBLIC_SITE_URL=https://nodes-data.com`). No new test suites beyond what a step names.
- Tokens: read only the files you need, do not print whole files.
- Contradictions: ask me in one or two lines, do not decide silently.
- Copy: use the texts below exactly. If one breaks a limit or reads wrong in context, tell me;
  do not rewrite it.
- Limits: titles ≤ 60 characters, descriptions ≤ 155. «smart city» stays in English in both
  languages. Do not change URLs, slugs or routes.
- Do not deploy.
- Record the work in `docs/changes/site-seo.md` (create it in S1, keep updating it), as
  CLAUDE.md describes.

## Steps

### S1 · Own title and description per section page

- In `src/lib/routes.ts`, point each page's `titleKey` and `descriptionKey` at new keys
  `meta.<page>.title` and `meta.<page>.description` (pages: applications, research, demo, about,
  contact). Home keeps `meta.title` / `meta.description`. Legal pages keep their keys.
- In `src/layouts/Base.astro`, use the title as given: the new titles already carry «· NODES» or
  the brand. Do not append «· NODES» again for catalog pages. Articles keep the current
  `${title} · NODES` behaviour.
- Add the keys to `src/i18n/es.json` and `src/i18n/en.json`. Keep `nav.*` and `*.hero.lead`
  unchanged: they are still used on the pages.

| Key | ES | EN |
|---|---|---|
| `meta.applications.title` | Control de aforo y contador de personas para eventos · NODES | People counter and crowd management for events · NODES |
| `meta.applications.description` | Contador de personas LiDAR para control de aforo en eventos, estaciones y espacios públicos. Datos agregados de densidad sin identificar a nadie. | LiDAR people counter and footfall counter for crowd management at events, stations and public spaces. Aggregated crowd density, without identifying anyone. |
| `meta.research.title` | Investigación sobre LiDAR y gestión de multitudes · NODES | Research on LiDAR and crowd safety · NODES |
| `meta.research.description` | Artículos sobre sensores LiDAR, densidad de multitudes, edge computing e IoT: cómo medir y anticipar aglomeraciones en eventos y en la smart city. | Articles on LiDAR sensors, crowd density, edge computing and IoT: how to measure crowds and anticipate congestion at events and in the smart city. |
| `meta.demo.title` | Demo: densidad de multitudes en un evento · NODES | Demo: crowd density at a simulated event · NODES |
| `meta.demo.description` | Prueba la demo de NODES: elige un escenario simulado y mira cómo se verían la densidad de personas y el control de aforo en un evento. | Try the NODES demo: pick a simulated scenario and see how crowd density and people counting data would look at an event. |
| `meta.about.title` | Sobre NODES: LiDAR para entender el movimiento | About NODES: LiDAR to understand how people move |
| `meta.about.description` | NODES es un proyecto de I+D que usa sensores LiDAR, IoT y edge computing para analizar flujos de personas en ciudades, eventos y espacios públicos. | NODES is an R&D project using LiDAR sensors, IoT and edge computing to analyse pedestrian flows in cities, events and public spaces. |
| `meta.contact.title` | Contacto: pilotos y colaboraciones · NODES | Contact: pilots and collaborations · NODES |
| `meta.contact.description` | ¿Gestionas un evento, una estación o un recinto? Habla con NODES sobre pilotos de control de aforo con LiDAR, investigación o colaboraciones. | Run an event, station or venue? Talk to NODES about LiDAR people counting pilots, research projects or collaborations. |

- Add a test in `src/i18n/i18n.test.ts` (or next to it) that fails when any `meta.*.title` is over
  60 characters or any `meta.*.description` over 155, in both files, and when a key exists in one
  language but not the other.
- Report: the built `<title>` and description length of every section page in both languages.

### S2 · Articles as articles

In `Base.astro`, add optional props for articles (for example `article?: { published?: string;
modified?: string; image?: ImageMetadata; imageAlt?: string; section?: string; tags?: string[] }`)
and pass them from `src/pages/[locale]/research/[slug].astro`.

- `og:type` = `article` when `article` is set; keep `website` elsewhere.
- `article:published_time` (ISO date from the frontmatter `date`), and `article:section` /
  `article:tag` from `category` and `tags`. Skip a tag when its value is empty.
- Preview image: when the article has a `cover`, use it for `og:image` and `twitter:image`,
  generated at 1200×630 with `getImage` from `astro:assets` and turned into an absolute URL with
  `absoluteUrl()`. Set `og:image:width`/`height` to the generated size and add `og:image:alt` from
  `coverAlt`. Without a cover, keep `og-default.jpg`.
- JSON-LD per article, in one `<script type="application/ld+json">`:
  - `BlogPosting` (or `Article`): `headline` (title, ≤ 110 characters), `description`,
    `image` (the absolute cover URL), `datePublished`, `dateModified` (same as published until the
    frontmatter has a modified date), `inLanguage`, `mainEntityOfPage` (canonical URL),
    `author` and `publisher` = Organization NODES with `logo`.
  - `BreadcrumbList`: Home → Research → article, with the localized names and absolute URLs.
- Reuse the home page's Organization data instead of repeating it: move it to a helper in
  `src/lib/` if that keeps it in one place.
- Report: the head of one ES and one EN article, and the result of pasting one built article into
  the Rich Results Test (my checklist: I run it; you give me the file to paste).

### S3 · Real 301 for /collaborate

- Prefer a `_redirects` file in `apps/site/public/` (Workers static assets read it from the assets
  directory): `/es/collaborate /es/contact 301` and `/en/collaborate /en/contact 301`, with and
  without trailing slash. Check in the Cloudflare docs that `_redirects` is supported with the
  current `wrangler.jsonc` assets setup before relying on it; if it is not, handle the two paths in
  `worker/index.ts` and add them to `run_worker_first`.
- Remove `src/pages/[locale]/collaborate.astro` and its exclusion in the sitemap filter in
  `astro.config.mjs` once the redirect works.
- Report: my checklist to check both paths with `pnpm --filter @nodes/site preview`.

### S4 · Small fixes

- Applications images: give the four sector images a short descriptive `alt` (ES and EN, in the
  i18n files) unless they are purely decorative next to a text that says the same; tell me which
  you chose and why.
- Organization JSON-LD on the home page: add `sameAs` only if a public profile URL exists in the
  repo config; if not, list it as an open question in the report. Do not invent URLs.
- Report: the list of strings added.

## Out of scope (do not do)

- Legal notice and cookie pages: they need texts I will provide. Leave `legalNotice` and `cookies`
  as they are and do not link them.
- New pages or landing pages per sector, and new articles.
- Changes to the home page title and description.

## After the last step (my checklist)

- Google Search Console (already verified for `nodes-data.com`): submit `sitemap-index.xml`, then
  request indexing of `/es/`, `/en/` and the published articles. Same in Bing Webmaster Tools.
- Share one article URL in LinkedIn's Post Inspector to check the new preview image.
