# Phase 1 · Public website and demo entry

**Routing update (2026-10-29):** [ADR 0006](../decisions/0006-english-route-names.md) supersedes
the Spanish page slugs in this original specification. Use `technology`, `about`, `collaborate`,
`contact`, `legal/legal-notice` and `legal/privacy` in both locales; legal content filenames use
the same English slugs. Spanish route aliases and redirects are removed.

**Status:** proposed
**Owner:** Anna Llorens Roig
**Executor:** Claude Code. Plan mode first; one milestone at a time; stop and report after each.
**Branch:** keep working on `feat/move-from-lovable`. **Do not merge into `main` and do not open a
merge**: `main` still feeds the published Lovable demo until the new deployment is ready.

## 1. Context

NODES needs a public website to present the company. The existing app (`apps/web`) becomes the
"Demo" section (ADR 0004). Approved designs, desktop and mobile, are in `docs/design/reference/`:

| File | Screen |
|---|---|
| `home-desktop-approved.png`, `home-mobile-approved.png` | Home (7 sections) |
| `technology-approved.png` | Tecnología (desktop + mobile) |
| `collaborate-approved.png` | Colabora (desktop + mobile) |
| `demo-entry-approved.png` | Demo entry, in `apps/web` (desktop + mobile) |

**All mockups are compressed to fit one screenshot.** Take structure, order, components and
colours from them, **not** the spacing or the amount of text. Sections must breathe much more
(section 6) and the copy is the reviewed version in the i18n files (section 9), which is shorter
and corrected. If a mockup and the i18n files disagree, the i18n files win.

Icons and illustrations are provided as SVG in `packages/ui/assets/` (section 8). The mockups
are images: never cut assets out of them.

## 2. Milestones (stop and report after each)

| # | Milestone | App |
|---|---|---|
| M0 | Preflight: monorepo status, commit this pack, update `CLAUDE.md` | repo |
| M1 | Site scaffold: Astro, tokens, font, layout (header, mobile menu, footer), i18n routing, placeholder pages, CI | site |
| M2 | Home | site |
| M3 | Tecnología | site |
| M4 | Colabora (form UI, validation, states; submission is pluggable) | site |
| M5 | Sobre nosotras, Legal (template), 404 | site |
| M6 | Demo entry screen and demo header | web |
| M7 | QA: both languages, both sizes, accessibility, screenshots | both |

Deployment is **not** in this plan (separate plan: Cloudflare, domain, contact backend).

## 3. Non-goals

- Contact form backend (M4 only prepares the call; see section 7).
- Valencian (`/va/`): the route appears only when translations exist.
- Any change to the demo's map, node detail, alerts or reports. In `apps/web`, only the new
  entry screen and the header (M6). The golden test must keep passing.
- The "problem in 3 figures" block: the site promotes the company, not incident data.
- New illustrations or photos not in the mockups.

## 4. Constraints

- Follow `CLAUDE.md` (language rules, content rules, workflow).
- English for code, comments, commits and docs. UI text only from the i18n files.
- No photos of real or fictional people (the faces in the mockups are fictional); team cards
  use an initials avatar. Silhouettes in illustrations are fine.
- Accessibility: WCAG AA (tokens already checked), one `h1` per page, alt text from i18n,
  keyboard-usable menu and form, visible focus, `prefers-reduced-motion` respected.
- Performance: static HTML; client JS only for the menu, the language switcher and the form.
- Inter, self-hosted with `@fontsource/inter` (no requests to Google).
- No dependency without saying why. Prefer Astro built-ins. Icons and illustrations come from
  `packages/ui/assets/`; lucide only for small UI glyphs with no asset (chevron, arrow, menu,
  close, check).

## 5. Structure

```
apps/site/
├── astro.config.mjs            # i18n: locales ['es','en'], defaultLocale 'es', prefixDefaultLocale true
├── src/
│   ├── i18n/es.json, en.json   # provided; index.ts = typed t(locale, key) with {param} support
│   ├── layouts/Base.astro      # <html lang>, meta, hreflang + x-default, header, footer
│   ├── components/             # Header, MobileMenu, Footer, LanguageSwitcher, Button, Eyebrow,
│   │                           # Card, IconCard, Avatar, StatusLabel, Field, Checkbox, Select
│   ├── components/illustrations/  # inline SVG (section 8)
│   ├── sections/home/, sections/technology/, sections/collaborate/
│   └── pages/
│       ├── index.astro                     # root language redirect (section 7)
│       ├── 404.astro
│       └── [locale]/index.astro, tecnologia.astro, colabora.astro, sobre-nosotras.astro,
│           legal/aviso-legal.astro, legal/privacidad.astro, legal/cookies.astro
packages/ui/src/tokens.css      # provided
```

Slugs stay in Spanish in both locales for now (`/en/colabora`).

Environment variables (with `.env.example`): `PUBLIC_DEMO_URL`, `PUBLIC_CONTACT_EMAIL`,
`PUBLIC_LINKEDIN_URL`, `PUBLIC_X_URL`, `PUBLIC_CONTACT_ENDPOINT`. Social icons and the email
row render only when their variable is set.
The contact email is a temporary address for now: never hardcode an address or a domain
(the mockups show `hola@nodes.es`, which is not ours); `.env.example` leaves it empty.

## 6. Layout rules (all pages)

**Header (desktop):** logo left · nav centred, active page underlined · language select (ES/EN)
and primary button "Contacta con nosotras" right · sticky, white, thin bottom border.
**Header (mobile):** logo · language select · hamburger. The menu holds the nav and the button.
**Footer:** logo · nav · social icons · legal links and `© {year}` computed at build time.

**Spacing:** every section uses `--section-padding` top and bottom (72 px mobile, 128 px
desktop) and a thin divider or background change between sections. Inside a section,
`--section-gap-inner` between the heading block and the content. Text columns max 60 characters.
Headings max 2 lines on desktop, 3 on mobile; leads max 2 lines on desktop; card and step texts
one short line. If a layout looks empty, use space or the illustration, never more words.

**Colour:** tokens only, no raw hex in components. Buttons use `--color-primary` (#237A5D);
the lighter greens in the mockups fail AA with white text and are for illustrations only.
Density colours: copy the exact values the demo uses today (legend and heat map in `apps/web`)
into `--color-density-*`, and report where they came from.

## 7. Pages

### M2 · Home (`/[locale]/`)

| # | id | Desktop layout | Content keys |
|---|---|---|---|
| 1 | `hero` | text + 3 buttons left (~45 %), illustration right bleeding to the edge, ~80 % of viewport height | `hero.*` |
| 2 | `solution` | heading block left, 3 cards right | `solution.*` |
| 3 | `how` | heading block left, 3 steps right, numbered circles joined by arrows, illustration under each | `how.*` |
| 4 | `use-cases` | heading block + "full demo" button left, 2 image cards right, each linking to its demo scenario | `useCases.*` |
| 5 | `status` | heading block left, 3 icon items right (no card background) | `status.*` |
| 6 | `team` | heading block left, 2 member cards right (initials avatar, name, role, one line, LinkedIn if set), link to Sobre nosotras | `team.*` |
| 7 | `collaborate` | full-width soft-green band, rounded, text + 2 buttons left, skyline right | `collaborate.*` |

Mobile: same order, one column, cards stacked.

### M3 · Tecnología (`/[locale]/tecnologia`)

| # | Section | Layout | Keys |
|---|---|---|---|
| 1 | Hero | text left, illustration right (node on a pole + point lines + skyline with silhouettes) | `tech.hero.*` |
| 2 | How it works | heading + 4 steps in a row joined by arrows (left ~65 %); privacy card right with a point-cloud people illustration | `tech.how.*`, `tech.privacy.*` |
| 3 | Main features | heading + 4 icon cards in a row, each with a `StatusLabel` "En la demo" | `tech.features.*` |
| 4 | Applications | heading + 4 icon cards in a row | `tech.applications.*` |

Mobile: steps become a vertical list (number, icon, title, text), privacy card under the steps,
cards stacked. Icons: the assets listed for Tecnología in `packages/ui/assets/README.md`.

### M4 · Colabora (`/[locale]/colabora`)

| # | Section | Layout | Keys |
|---|---|---|---|
| 1 | Hero | text left, skyline illustration right (no close "×" icon from the mockup) | `collab.hero.*` |
| 2 | How you can collaborate | heading + 4 selectable cards (desktop: a row; mobile: list rows with an arrow) | `collab.types.*` |
| 3 | Form | left ~60 %: name*, email*, collaboration type (select), message*, privacy checkbox*, submit; right: "contact directly" card (email, LinkedIn, note) | `collab.form.*`, `collab.direct.*` |

Behaviour:
- Clicking a type card selects it (visible selected state, `aria-pressed`), sets the select to
  that type and scrolls to the form. The select can still be changed by hand.
- Client-side validation with messages from i18n; errors announced (`aria-live`), first invalid
  field focused.
- States to implement: idle, field error, sending (button disabled with spinner), sent (success
  panel replacing the form), send error (message + the email address as fallback).
- Under the submit button, the first-layer data protection text (`collab.form.privacyInfo`)
  linking to `legal/privacidad`. Required by Spanish/EU law; do not remove.
- Honeypot field (hidden input) to reduce spam. No captcha in this phase.
- **Submission is pluggable:** `submitContact(data)` posts JSON to `PUBLIC_CONTACT_ENDPOINT`.
  If the variable is not set, the form shows the send-error state with the email fallback, and
  the build prints a warning. Write the function with a typed payload
  `{ name, email, type, message, locale }` and a unit test with a mocked `fetch`.

### M5 · Sobre nosotras, Legal, 404

- **Sobre nosotras:** no mockup. Reuse the home `team` section plus a short block of values
  (`about.*`) and the collaborate band. Nothing else.
- **Legal:** one long-text template (headings, paragraphs, lists) for `aviso-legal`,
  `privacidad`, `cookies`, rendering Markdown files from `src/content/legal/{locale}/`. Create
  the three files with a clear **DRAFT banner** and `TODO` placeholders for the company data
  (holder, tax id, address, email). The content must be written and reviewed by the team; do not
  invent legal text beyond headings and placeholders.
- **404:** message and link to home (`notFound.*`).

### M6 · Demo entry and header (`apps/web`)

- New entry route at the demo's root: eyebrow, title, lead and 2 scenario cards with photo,
  title, time range, place and node count, linking to each scenario. Copy in
  `apps/web/src/i18n/demo-entry.es.json` and `.en.json` (provided; Spanish only shown until the
  demo gets its own i18n step).
- Header for every demo screen: logo (links to the public site `PUBLIC_SITE_URL`), the existing
  simulation badge, a "Ir a la web" link and the hamburger on mobile. **No alerts bell on
  the entry screen**; inside a scenario, keep the existing alerts behaviour.
- Card photos: the mockup photos are generated images. Use them only if the team provides the
  original files with rights to use them; until then, a soft-green gradient with the scenario
  icon. Never show identifiable people.
- Map, node detail, alerts and reports: unchanged. The golden test must pass.

## 8. Icons and illustrations

**Use the SVG assets in `packages/ui/assets/`** (33 files, already normalised to
`currentColor`). `packages/ui/assets/README.md` says where each one goes. Do not redraw them,
do not use lucide for anything that has an asset here, and never cut images out of the
mockups. Render them inline so they take the token colour. Only the assets listed as
"still missing" in that README may be built new, as simple placeholders.

For the demo entry cards, use `scene-half-marathon.svg` and `scene-mascleta.svg` on a soft
green background instead of the generated photos.

Logo: official SVG files will be added to `packages/ui/assets/logo/`. Until then, render
"NODES" as text with the O in `--color-primary`.

## 9. Content corrections (already applied in the i18n files; keep them)

- Hero badge: "Prototipo · demo con datos simulados" (the site is real; only the demo is
  simulated).
- No installation time promised ("en pocas horas" removed: not measured yet).
- "Dos escenarios reales" → "Dos escenarios de València" (they are simulated).
- Demo entry: "cómo se visualiza la información en un evento real" → "…en un evento simulado".
- Technology: "Algoritmos de IA detectan y cuentan personas en tiempo real" → counting by zone
  on the node, without claiming AI or real-time results that are not built yet.
- Privacy: "El LiDAR no captura imágenes ni datos personales" → it captures no images; the point
  cloud is processed on the node and discarded; only counts leave it. Never claim the data is
  not personal data.
- Applications: "gestión más segura" → "planificar y decidir a tiempo".
- Features carry the label "En la demo".
- Team: Sarolta is CEO with an ADE background, not an engineer (confirmed).
- Colabora: no response-time promise (removed by the team).
- Footer year computed at build time (mockups say 2024).

## 10. Language behaviour

- Every page exists at `/es/...` and `/en/...`, with `hreflang` for both and `x-default` → `/en/`.
- Only `/` decides, in this order:
  1. A saved choice (cookie `nodes_lang`) always wins.
  2. Spanish if the browser language is `es*`, `ca*`, `gl*` or `eu*`.
  3. Spanish if the visit comes from Spain or a Spanish-speaking country (country list in
     `apps/site/src/i18n/spanish-speaking-countries.ts`: ES, MX, AR, CO, CL, PE, VE, EC, GT,
     CU, BO, DO, HN, PY, SV, NI, CR, PA, UY, PR, GQ).
  4. English otherwise.
- The country is only known at the edge (Cloudflare `request.cf.country`). In this phase,
  implement rules 1, 2 and 4 client-side in `index.astro` (reads `navigator.languages`) with a
  `<noscript>` link to both, and write the shared decision as a pure, tested function
  `pickLocale({ cookie, languages, country })` so the edge function in the deployment plan
  reuses it and adds rule 3.
- The switcher links to the same page in the other locale and sets the cookie.
- Never redirect other pages; never treat crawlers differently.

## 11. Definition of done

- [ ] `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm build` pass from root
- [ ] Golden test in `packages/core` still passes
- [ ] Each page at 375 px and 1440 px follows its mockup in structure, order, components and
      colours, with the spacing of section 6
- [ ] `/es/` and `/en/` render for every page; `hreflang` present; root redirect as in section 10
- [ ] Test: `es.json` and `en.json` have the same keys (site and demo-entry files)
- [ ] No UI text hardcoded in components; no raw hex outside `tokens.css`
- [ ] Form: all states reachable; keyboard-only flow works; honeypot present
- [ ] Lighthouse mobile on Home, Tecnología and Colabora: Accessibility ≥ 95, Performance ≥ 90
- [ ] No photos of people; no claims of measured or real-time data
- [ ] CI runs for `apps/site`; ADR 0004 and updated `CLAUDE.md` committed
- [ ] Every milestone in its own commit(s), Conventional Commits, in English

## 12. Report back (after each milestone, and in full at the end)

1. Screenshots at 375 px and 1440 px of what the milestone built, in `es` (and `en` at M7).
2. Illustrations built and any that need a designer.
3. The density colour values copied from the demo, and their source file.
4. Open questions (logo files, contact email and domain, social links, demo photos, legal data).
