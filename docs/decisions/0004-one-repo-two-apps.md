# 0004 · One repository, two apps

**Status:** accepted · 2026-10-28

**Routing update:** [ADR 0006](0006-english-route-names.md) supersedes the Spanish-slug decision
below. Current page slugs are English in both locales.

## Context

NODES needs a public website (company, technology, team, collaboration) and keeps the existing
dashboard as a demo with simulated data, which will later become the real client dashboard.
The two have different needs: the website must be indexable and shareable (SEO, link previews),
mostly static text; the dashboard is a heavy interactive SPA (map, charts) that will get login
and live data.

## Decision

- Keep a single repository (pnpm monorepo) with two apps:
  - `apps/site`: public website in **Astro** (static HTML, React islands only where needed).
  - `apps/web`: demo and future dashboard in **Vite + React**.
- Shared packages: `packages/core` (domain), `packages/data-source`, `packages/ui`
  (design tokens and shared components).
- Each app deploys on its own (separate Cloudflare projects), triggered only by changes in its
  folder or in the packages it uses.
- Languages: `/es/` and `/en/` routes in the site from the start (Valencian later). The root `/`
  picks the language: a saved choice first; then Spanish if the browser language is `es`, `ca`,
  `gl` or `eu`, or if the visit comes from Spain or a Spanish-speaking country; English
  otherwise. The country comes from the edge (Cloudflare), so that rule arrives with the
  deployment. Page slugs stay in Spanish for now.

## Consequences

- One CI, one `CLAUDE.md`, one way of working: the model for the company's other repos.
- Design changes happen once in `packages/ui` and reach both apps.
- The i18n choice must work for both apps: Astro i18n routing for the site, Lingui for the demo,
  shared strings in a common package if needed.
- The root language redirect is client-side for now; move it to a Cloudflare edge function when
  the site has its own domain.

## Alternatives considered

- **Two repositories:** cleaner permissions, but duplicated design system, CI and rules. Worth it
  only if another team owns the site or one part must be open-sourced.
- **One app with routes:** simplest, but an SPA serves near-empty HTML to crawlers and link
  previews, which hurts the public website.
- **Geolocation by IP alone:** unreliable with VPNs and travel. It is used only as a third rule,
  after the saved choice and the browser language, which reflect the person's choice better.
