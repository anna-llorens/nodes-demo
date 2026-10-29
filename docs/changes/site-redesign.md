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

## Remaining

- Technology, Demo, Research and Contact content: steps S4–S6.
- `nodes-site-v2-pack/` is still untracked; its contents are copied into place.
