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

## Remaining

- Home, Technology, Applications, Demo, Research and Contact content: steps S2–S6.
- `nodes-site-v2-pack/` is still untracked; its contents are copied into place.
