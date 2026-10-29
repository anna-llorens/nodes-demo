# 0008 · Preserve language between site and app

**Status:** accepted · 2026-10-29

## Context

The site's scenario links already carried a map locale, but general demo links opened the app
without one. The app entry always used Spanish copy and anonymous scenario cards hardcoded the
Spanish map. Authentication changes also meant the unprefixed private map could lose a visitor's
chosen language.

## Decision

- Route every general site-to-app demo link through `demoDefaultUrl`, opening
  `/{locale}/demo/map?scenario=maraton` directly. Preserve the configured app base path. This
  follows the requested default destination and replaces the initial entry-page handoff.
- Keep scenario links on the existing locale-prefixed public map paths.
- Choose the app language in this order: explicit locale path, valid `lang` query parameter,
  saved app-host `nodes_lang` cookie, Spanish fallback. Store explicit choices for one year,
  independently of the authentication cookie.
- Provide the resolved language through the root route and `useAppLocale`. Render the entry,
  metadata, login, map and shared header with their existing Spanish/English catalogs.
- Preserve language for scenario links, private-map sharing, logout destinations and return links
  to the site. English private-map links include `lang=en` for other browsers.

## Consequences

- Language passes between separate hosts without relying on a shared cross-domain cookie.
- Login and logout do not reset the language preference. A direct locale-prefixed URL always
  wins over a conflicting query parameter or saved preference.
- Existing root/home routes and public/private access rules are unchanged.
- Other dashboard screens retain their current Spanish copy; full dashboard localization remains
  a separate task.

## Alternatives considered

- Open the scenario entry first: superseded by the requested direct marathon-map destination;
  root/home entries remain available independently with optional `lang=es|en` parameters.
- Add locale-prefixed entry routes: unnecessary for this fix and would expand the public-route
  contract.
- Rely on the site's cookie: host-only cookies cannot transfer a choice between deployments.
