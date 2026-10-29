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
  as cards), name*, email*, organization, message*, consent*, and the privacy info text. Copy comes
  from `contact.form.*`; field errors, the required mark, "sending" and the privacy info reuse
  `collab.form.*`. The send error shows `contact.form.errorText` plus the contact email when set.
- Side card: `contact.direct.*`, the `PUBLIC_CONTACT_EMAIL` link and `contact.status.*`.

Validation: site typecheck, tests (37) and build pass.

## Contact email delivery

> Superseded: messages are now saved in D1 by the site Worker (ADR 0010, see
> [site-deploy.md](site-deploy.md)).

- `PUBLIC_CONTACT_ENDPOINT` is a Formspree form that emails each message to the project inbox
  (ADR [0009](../decisions/0009-contact-form-email-service.md)). `submitContact` now sends
  `Accept: application/json`; [.env.example](../../apps/site/.env.example) documents the URL.
- Needs the Formspree form to be created and its URL set in `apps/site/.env.local` (and the host's
  build settings). The privacy text must name Formspree before going public.

Validation: site typecheck, tests and build pass; a real submission is not yet verified.

## Remaining

- Old `collab.form.*` keys no longer used (title, lead, type, typePlaceholder, errorText) can be
  dropped in a later i18n cleanup.
- `nodes-site-v2-pack/` is still untracked; its contents are copied into place.
