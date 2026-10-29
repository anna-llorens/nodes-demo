# Phase 2 · Public site redesign (apps/site)

Branch: `feat/move-from-lovable`. This is a test site that may change again soon: keep it simple,
reuse what exists, and spend as few tokens as possible.

## Working rules (read first)

- One step at a time. Short plan → wait for my OK → implement → short report → stop.
- **Git:** never commit, stage, push, merge, rebase or reset. End each step with: files changed
  (one line each), check results, and a suggested Conventional Commit message.
- **Checks:** only `pnpm --filter @nodes/site typecheck` and `build` at the end of each step.
  No screenshots, Lighthouse, e2e or extra test suites unless I ask. I review in `pnpm dev`.
- **Tokens:** read only the files you need, never re-read a file you already read in this
  session, do not print whole files, do not explore unrelated folders.
- **Contradictions:** if the code, this plan or a mockup disagree, ask me in one or two lines
  instead of investigating at length. Do not decide silently.
- Do not touch `apps/web` (demo), `packages/core` or `packages/data-source`.

## What stays as it is

- Logo, colours (`packages/ui/src/tokens.css`), font, header/footer style, cards, buttons.
- Home hero image: the current one (`packages/ui/assets/png/homePage.png`).
- Language routing (`/es/`, `/en/`, root redirect, switcher), legal drafts, 404.
- Icons and illustrations: only from `packages/ui/assets/`. Where a mockup shows a photo, use
  the closest existing SVG on a soft-green panel; if none fits, the section icon on that panel.
  Lucide only for an icon that has no asset (e.g. train, building).

## Inputs (already in the repo after unzipping)

- `docs/design/v2/*.png`: page mockups (home, applications, technology, demo, research,
  contact). Take structure and order from them, not spacing or exact copy.
- `apps/site/src/i18n/es.json` and `en.json`: final copy, 220 keys each, already translated.
  They replace the current files. Unused old keys were removed.
- `apps/site/src/content/research/es/lidar-flujos-peatonales.md`: a draft article (draft: true).

## Navigation

Header: Inicio · Aplicaciones · Tecnología · Demo · Investigación · Contacto (+ ES/EN).
Footer: same links + "Sobre NODES" (`nav.about`) + legal links.

| Route | Page | Status |
|---|---|---|
| `/[locale]/` | Home | rebuild |
| `/[locale]/aplicaciones` | Applications | new |
| `/[locale]/tecnologia` | Technology | rework |
| `/[locale]/demo` | Demo entry (site page) | new; links to the two scenarios on `PUBLIC_DEMO_URL` |
| `/[locale]/investigacion` | Research index | new |
| `/[locale]/investigacion/[slug]` | Article template | new; builds only non-draft articles |
| `/[locale]/contacto` | Contact | replaces Colabora |
| `/[locale]/colabora` | → redirect to `contacto` | |
| `/[locale]/sobre-nosotras` | About + team | keep, footer link only |

Delete page sections and i18n usages that no longer exist (old home sections, Colabora page).

## Steps

### S0 · Inventory (no code)
List: components to reuse, components to delete, new components needed, and any contradiction
with this plan. Max ~20 lines.

### S1 · Shared
Replace both i18n files, new nav and footer, new routes as empty pages with their hero, redirect
`colabora → contacto`, remove dead sections and their keys usage. Key test still passes.

### S2 · Home (`home.*`, `hero.*`)
Hero (current image, two CTAs, `hero.status` line) → 3 sector tiles linking to the matching
Applications section → project block (`home.project.*`, image: `skyline-header.svg`) →
"Lo que estamos investigando": 2 cards from `home.research.*` (icon panels), not links to
articles; button to Research.

### S3 · Applications (`applications.*`)
Hero → 3 cards (events, transport, spaces) with icon, text, 3 bullets; each card has an id for
the home tiles; "Ver detalles" scrolls to the card or is removed if there is no detail → pilot
CTA band linking to `contacto?interest=pilot`.

### S4 · Technology (`tech.hero.*`, `tech.workflow.*`, `tech.pointCloud.*`, `tech.tabs.*`, `tech.benefits.*`)
Keep the current hero image. 4-step workflow row → dark panel with the point-cloud icon and
`tech.pointCloud.*`; the four `tech.tabs.*` are shown as topic chips (not interactive, there is
content only for the first) → 4 benefit tiles.

### S5 · Demo page and Research
- Demo (`demo.*`): hero + simulation notice box → 2 cards: `demo.events` (Medio Maratón
  scenario, `scene-half-marathon.svg`) and `demo.mascleta` (`scene-mascleta.svg`), each opening
  its scenario → "after the demo" band to Contact.
- Research (`research.*`): hero, filter chips (static), 6 cards from `research.cards.*` with
  a "Próximamente" label (`research.comingSoon`), no dates, not clickable; `research.statusNote`
  below. Article template from a content collection (frontmatter as in the draft); drafts are
  never built. Labels from `article.*`.

### S6 · Contact (`contact.*`, reuse `collab.form.*` for errors, states and privacy text)
Adapt the existing Colabora form, do not rewrite it: 3 selectable interest cards (required,
preselected from `?interest=`), name*, email*, organization (optional), message*, consent*.
Payload `{ name, email, organization, interest, message, locale }`; same validation, states,
honeypot and `submitContact()` → `PUBLIC_CONTACT_ENDPOINT`. Side card with
`PUBLIC_CONTACT_EMAIL` and `contact.status.*`. No new backend.

Out of scope: analytics, SEO beyond what exists, deployment, final legal texts, QA pass.
