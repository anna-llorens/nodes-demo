# Public site redesign (phase 2)

Plan: [phase-2-site-redesign.md](../plans/phase-2-site-redesign.md). Mockups: `docs/design/v2/`.

## Decisions

- Slugs stay English in both locales (ADR 0006), not the plan's Spanish ones: `applications`,
  `technology`, `demo`, `research`, `contact`, `about`.
- `/[locale]/collaborate` redirects to `/[locale]/contact` (static meta-refresh page from
  `Astro.redirect`, noindex, canonical to Contact).
- The header has no separate contact button: Contact is in the main nav. Demo is now the site's
  own `/demo` page, not an external link.

## S1 · Shared

- New i18n files from the design pack replace `es.json` / `en.json`.
- [routes.ts](../../apps/site/src/lib/routes.ts): new pages, `mainNav` (Home · Applications ·
  Technology · Demo · Research · Contact) and `footerNav` (adds About).
- [PageHero](../../apps/site/src/components/PageHero.astro): generic hero (former Colabora hero) used
  by Applications, Demo, Research and Contact, which are hero-only until their steps.
- Removed the old home sections (Solution, How, UseCases, Status, Collaborate), the Colabora Types
  section and the technology How/Cards sections. Team moved to `sections/about/`.
- Contact form moved to `sections/contact/Form.astro`; the type select is removed until the
  interest cards in S6, so the payload sends `type: ""` meanwhile.

Validation: site typecheck, tests (36) and build pass.

## S2 · Home

- [Hero](../../apps/site/src/sections/home/Hero.astro): keeps the current image
  (`png/homePage.png`, confirmed). Two
  buttons, demo → site `/demo` page and contact, then the `hero.status` line.
- [Sectors](../../apps/site/src/sections/home/Sectors.astro): three tiles linking to
  `applications#events|transport|spaces` (ids added in S3). Train and building use lucide (no asset).
- [Project](../../apps/site/src/sections/home/Project.astro): `home.project.*` with
  `skyline-header.svg`; its link goes to About.
- [Research](../../apps/site/src/sections/home/Research.astro): two topic cards on soft-green icon
  panels (`point-cloud`, `chart`), not links; button to Research.

Validation: site typecheck and build pass.

## S3 · Applications

- [config/sectors.ts](../../apps/site/src/config/sectors.ts): the three sectors (id = anchor, icon,
  illustration), shared by the home tiles and the Applications cards.
- [Cards](../../apps/site/src/sections/applications/Cards.astro): one card per sector with an
  illustration on a soft-green panel instead of the mockup photo (`use-case-runner`,
  `use-case-town-hall`; transport has none, so its train icon), icon, title, text and three
  examples. "Ver detalles" is left out: there are no detail pages yet.
- [PilotCta](../../apps/site/src/sections/applications/PilotCta.astro): band linking to
  `contact?interest=pilot` (preselection arrives in S6).

Validation: site typecheck and build pass.

## S4 · Technology

- Hero unchanged (`hero-lidar-valencia.svg`).
- [Workflow](../../apps/site/src/sections/technology/Workflow.astro): four numbered steps, a joined
  row on desktop and a list on mobile.
- [PointCloud](../../apps/site/src/sections/technology/PointCloud.astro): dark panel with the four
  `tech.tabs.*` as static chips (first marked active), the point-cloud icon instead of the mockup
  render, and `tech.pointCloud.*`; its link goes to Research (the plan gives no target).
- [Benefits](../../apps/site/src/sections/technology/Benefits.astro): four tiles (shield,
  lidar-sensor, people-count, chart).

Validation: site typecheck and build pass.

## S5 · Demo and Research

- Shared pieces: [CtaBand](../../apps/site/src/components/CtaBand.astro) (former pilot band, now
  props-driven, used by Applications and Demo); [PageHero](../../apps/site/src/components/PageHero.astro)
  takes an `aside` slot that replaces the skyline; [Base](../../apps/site/src/layouts/Base.astro)
  takes an optional `title` for pages outside the route catalog.
- Demo: hero with the simulation notice, two scenario cards (`maraton` with
  `scene-half-marathon`, `mascleta` with `scene-mascleta`; the mockup's train station is not a
  scenario) opening `demoScenarioUrl` (button hidden without `PUBLIC_DEMO_URL`), and a band to
  Contact.
- Research: static filter chips, six "coming soon" cards on icon panels (not links, no dates)
  and the status note.
- Articles: `research` content collection; ids keep the locale folder, URLs use the frontmatter
  `slug` (`/[locale]/research/[slug]`). Production builds skip drafts; `pnpm dev` serves them
  with `article.draftNote` and noindex for review. Layout: a full-width header (back link, title, subtitle; room for a
  future cover image), then the body and the side column (contents, details) starting level. Content type and topics show the frontmatter
  values as written.
- Sector tiles/cards use lucide `Building` (`Building2` is deprecated).

Validation: site typecheck and build pass (no article page is built while the only one is a draft).

## S6 · Contact

- [contact.ts](../../apps/site/src/lib/contact.ts): `type` replaced by `interest`
  (`pilot | research | general`) and an optional `organization`. Payload
  `{ name, email, organization, interest, message, locale }`; validation, honeypot, states and
  `submitContact()` → `PUBLIC_CONTACT_ENDPOINT` unchanged. `interestFromQuery` reads
  `?interest=`; a missing or unknown value selects `general`, so one interest is always chosen and
  no interest error message is needed. Tests updated.
- [Form](../../apps/site/src/sections/contact/Form.astro): three interest cards (radio inputs styled
  as cards), name*, email*, organization, message*, and consent* linked to the privacy page. The
  separate privacy info paragraph has been removed. Copy comes
  from `contact.form.*`; field errors, the required mark, "sending" and the privacy info reuse
  `collab.form.*`. The send error shows `contact.form.errorText` plus the contact email when set.
- Side card (`contact.direct.*`, the `PUBLIC_CONTACT_EMAIL` link and `contact.status.*`) is
  temporarily disabled using an Astro `{/* ... */}` comment. Shell-style `#` prefixes are not
  valid comments in an Astro template: they caused `Invalid Character` at `Form.astro:134:5`.
  Email splitting stays inside the disabled markup so there is no unused frontmatter helper.
- The contact layout now uses one centered column capped at 48rem, replacing the desktop
  two-column grid that reserved space for the disabled sidebar. It fits the available width
  on mobile and centers the form, submission errors and success confirmation together.

Validation: site typecheck, tests (37) and build pass.
Disabled-card fix: reproduced the compiler error with the site build before the change;
repository typecheck, lint, 179 tests and both app builds pass after the fix. Lint reports five
warnings in generated Worker types and existing web components. Built Spanish and English
contact pages contain the form and consent checkbox, without the disabled side card.
`git diff --check` passes. Browser interaction and real contact submissions were not tested.
Centered-layout validation: repository typecheck, lint, 179 tests and both app builds pass;
lint reports the same five warnings. Built contact CSS contains the centered 48rem column and
no longer contains the old desktop columns. `git diff --check` passes. Visual verification was
unavailable because the browser connection failed before opening a page.

## Contact email delivery

> Superseded: messages are now saved in D1 by the site Worker (ADR 0010, see
> [site-deploy.md](site-deploy.md)).

- `PUBLIC_CONTACT_ENDPOINT` is a Formspree form that emails each message to the project inbox
  (ADR [0009](../decisions/0009-contact-form-email-service.md)). `submitContact` now sends
  `Accept: application/json`; [.env.example](../../apps/site/.env.example) documents the URL.
- Needs the Formspree form to be created and its URL set in `apps/site/.env.local` (and the host's
  build settings). The privacy text must name Formspree before going public.

Validation: site typecheck, tests and build pass; a real submission is not yet verified.

## Published research articles

The LiDAR article is published in es and en. Decisions:

- The research schema has an optional `card` field ([content.config.ts](../../apps/site/src/content.config.ts)).
  It pairs an article's translations (slugs differ by locale) and its Research card. Both LiDAR
  articles use `card: "lidar"`. Lookups live in [research.ts](../../apps/site/src/lib/research.ts);
  only published articles count.
- [Cards](../../apps/site/src/sections/research/Cards.astro): a card with a published article in
  the current locale links to it. The title link stretches over the card, so the markup and look
  stay; hover and keyboard focus outline the card. The date replaces "coming soon" in the same pill.
- Article pages pass their translations to [Base](../../apps/site/src/layouts/Base.astro):
  canonical, `hreflang` es/en and `x-default` (English). The language switcher goes to the other
  translation, or to that locale's Research index when there is none.
- The sitemap reads the research frontmatter with `fs` in
  [astro.config.mjs](../../apps/site/astro.config.mjs) (`astro:content` is not available there)
  and gives each article its translations as alternates.
- `research.statusNote` now says articles are published once finished; the rest are in preparation.

Validation: site typecheck and build pass. With `PUBLIC_SITE_URL=https://nodes-data.com`, both
articles have canonical, es/en and x-default alternates, the switcher links to the other article,
the cards link with the date, and the sitemap lists both articles with their alternates.

## Remaining

- Old `collab.form.*` keys no longer used (title, lead, type, typePlaceholder, errorText) can be
  dropped in a later i18n cleanup.
- `nodes-site-v2-pack/` is still untracked; its contents are copied into place.
