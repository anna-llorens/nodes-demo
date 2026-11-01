# Site SEO: page metadata, articles and redirects

Plan: [`docs/plans/site-seo-metadata.md`](../plans/site-seo-metadata.md). Earlier keyword work on
the copy and research articles is in [`site-seo-copy.md`](site-seo-copy.md).

## S1 · Own title and description per section page

### Decisions

- **New keys** `meta.<page>.title` and `meta.<page>.description` for applications, research, demo,
  about and contact, in [`es.json`](../../apps/site/src/i18n/es.json) and
  [`en.json`](../../apps/site/src/i18n/en.json), with the plan's copy unchanged. `nav.*` and
  `*.hero.lead` stay, because the pages still show them.
- **Label separated from title**: `titleKey` in [`routes.ts`](../../apps/site/src/lib/routes.ts)
  was also the visible label in the header, the footer and the legal page heading. Pointing it at
  `meta.*` would have put the SEO titles in the menu, so each page now has a `navKey` for the
  visible label ([`Header.astro`](../../apps/site/src/components/Header.astro),
  [`Footer.astro`](../../apps/site/src/components/Footer.astro),
  [`LegalPage.astro`](../../apps/site/src/components/LegalPage.astro)), and `titleKey` /
  `descriptionKey` only feed `<title>` and the meta description.
- **Brand suffix**: [`Base.astro`](../../apps/site/src/layouts/Base.astro) appends " · NODES" to a
  catalog page title only when the title does not already contain "NODES". The new titles all
  name the brand, so they are used as written; Technology and the legal pages, which keep their
  label as title, still get the suffix. Home keeps `meta.title`, and articles keep
  `${title} · NODES`.
- **Length test** in [`i18n.test.ts`](../../apps/site/src/i18n/i18n.test.ts): fails when any
  `meta.title` / `meta.<page>.title` is over 60 characters or any `meta.description` /
  `meta.<page>.description` is over 155, in both catalogs. The existing test already fails when a
  key exists in only one language.

### Result (built with `PUBLIC_SITE_URL=https://nodes-data.com`)

| Page | ES title (chars) | ES desc | EN title (chars) | EN desc |
|---|---|---|---|---|
| Applications | Control de aforo y contador de personas para eventos · NODES (60) | 145 | People counter and crowd management for events · NODES (54) | 155 |
| Research | Investigación sobre LiDAR y gestión de multitudes · NODES (57) | 146 | Research on LiDAR and crowd safety · NODES (42) | 146 |
| Demo | Demo: densidad de multitudes en un evento · NODES (49) | 134 | Demo: crowd density at a simulated event · NODES (48) | 120 |
| About | Sobre NODES: LiDAR para entender el movimiento (46) | 147 | About NODES: LiDAR to understand how people move (48) | 132 |
| Contact | Contacto: pilotos y colaboraciones · NODES (42) | 141 | Contact: pilots and collaborations · NODES (42) | 118 |

### Validation

`pnpm --filter @nodes/site typecheck` (0 errors, 0 warnings, 0 hints), `test` (41 passed) and
`build` (32 pages) passed. The header and footer still show the short labels (Home, Research,
Applications, Demo, About NODES, Contact).

### Limitations

- The ES demo title has no "simulado", unlike the EN one. The ES description does say
  "escenario simulado", so the simulation is still stated.

## S2 · Articles as articles

### Decisions

- **Article props in [`Base.astro`](../../apps/site/src/layouts/Base.astro)**: an optional
  `article` (`ArticleMeta`: published, modified, section, tags, image). When set, `og:type` is
  `article` and the page gets `article:published_time`, `article:modified_time`,
  `article:section` and one `article:tag` per non-empty tag. Other pages stay `website`.
- **Share image**: the article page
  ([`[slug].astro`](../../apps/site/src/pages/[locale]/research/[slug].astro)) crops the cover to
  1200×630 JPEG with `getImage` (JPEG because social preview crawlers read it most reliably) and
  passes the absolute URL, size and `coverAlt` to `Base`, which uses them for `og:image`,
  `og:image:width`/`height`, `og:image:alt`, `twitter:image` and `twitter:image:alt`. The image is
  generated once and reused by the JSON-LD. Pages without a cover keep `og-default.jpg`.
- **Section and tags**: `article:section` is the localized category label the page already shows
  (e.g. "LiDAR", "Dinámica de multitudes"); tags are the frontmatter slugs as written.
- **JSON-LD**: one `@graph` per article with a `BlogPosting` (headline, description = the meta
  description, image, `datePublished`, `dateModified` equal to the publication date until the
  frontmatter has a modified date, `inLanguage`, `mainEntityOfPage` = canonical URL) and a
  `BreadcrumbList` (Home → Research → article, localized names, absolute URLs).
- **Author is the person** from the frontmatter (`Person`, "Anna Llorens Roig"), as shown on the
  page and as Google recommends; NODES is the `publisher`. The plan proposed the Organization as
  author; the user chose the person.
- **One Organization**: [`lib/organization.ts`](../../apps/site/src/lib/organization.ts) holds
  the Organization data and a `jsonLd()` serializer; the home page
  ([`index.astro`](../../apps/site/src/pages/[locale]/index.astro)) and the article publisher use
  it.

### Validation

`typecheck` (0 errors), `test` (41 passed) and `build` (34 pages, with
`PUBLIC_SITE_URL=https://nodes-data.com`) passed. Every built article has `og:type=article`, a
1200×630 JPEG share image with alt text and the `BlogPosting` + `BreadcrumbList` JSON-LD; section
pages keep `website` and `og-default.jpg`; the home page keeps its Organization JSON-LD. Not yet
run through Google's Rich Results Test.

### Limitations

- `dateModified` equals `datePublished` until articles get a modified date in their frontmatter.
- `author` has no URL or profile link.

## S3 · Real 301 for /collaborate

### Decisions

- **`_redirects` file** in [`apps/site/public/_redirects`](../../apps/site/public/_redirects),
  copied to `dist/` by the build. Workers static assets apply it to requests served from assets;
  `run_worker_first` only covers `/` and `/api/*` in
  [`wrangler.jsonc`](../../apps/site/wrangler.jsonc), so `/es/collaborate` and `/en/collaborate`
  reach the asset layer and no Worker code is needed. Each path is listed with and without the
  trailing slash, as Cloudflare's examples do, and redirects to the slash-less contact URL used by
  the canonical links.
- **Old page removed**: `src/pages/[locale]/collaborate.astro` (a meta-refresh page in the static
  build) is deleted, and its exclusion is gone from the sitemap filter in
  [`astro.config.mjs`](../../apps/site/astro.config.mjs).

### Validation

`typecheck` (0 errors), `test` (41 passed) and `build` (32 pages) passed. `dist/_redirects` has
the four rules, `dist/es` and `dist/en` have no `collaborate` folder, and the sitemap does not
list it. The 301s themselves were not checked against `wrangler dev`; see the checklist below.

### Checklist (user)

With `pnpm --filter @nodes/site preview`, `curl -I` each of `/es/collaborate`,
`/es/collaborate/`, `/en/collaborate` and `/en/collaborate/`: expect `301` and
`Location: /es/contact` or `/en/contact`. `/es/contact` and `/en/contact` still answer 200.

## S4 · Small fixes

### Decisions

- **Applications images get alt text** instead of `alt=""`. Each photo shows something the card
  title does not say (a concert crowd, an iron-and-glass station, a stadium, a map on the
  paving), so it is not purely decorative, and the description helps image search. New keys
  `applications.<id>.imageAlt` (events, transport, spaces, cities) in both catalogs, read by
  [`Cards.astro`](../../apps/site/src/sections/applications/Cards.astro). The `cities` text matches
  the cover alt of the congestion article, which uses the same image.
- **Organization `sameAs` unchanged**: [`organization.ts`](../../apps/site/src/lib/organization.ts)
  already adds `sameAs` when `PUBLIC_LINKEDIN_URL` is set, but it is empty in `.env` and
  `.env.example`. The only public profile in the repo is a team member's personal LinkedIn
  (`src/config/team.ts`), which does not represent NODES, so no URL was added.

### Validation

`typecheck` (0 errors), `test` (41 passed), repo `lint` (0 errors; 5 existing warnings in other
packages) and `build` (32 pages) passed. The built `/es/applications` and `/en/applications`
carry the four alt texts.

### Open questions

- Does NODES have a public LinkedIn or X page? If so, set `PUBLIC_LINKEDIN_URL` /
  `PUBLIC_X_URL` in the deployment environment and `sameAs` (and the footer link) appear.
- The person's LinkedIn could become `sameAs` on the article author; not done without a request.
- `applications/events-crowd.jpg` (recognisable faces) and `transport-station.webp` still have
  source and rights marked TODO in [`assets/README.md`](../../apps/site/src/assets/README.md).
