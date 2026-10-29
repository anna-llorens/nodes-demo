# 0006 · English route names

**Status:** accepted · 2026-10-29

## Context

The demo had Spanish aliases redirecting to English routes. The public site used Spanish
slugs in both locales. The requested routing policy is to support English route names only
and remove the legacy redirects, including the Spanish home alias.

## Decision

- Remove the demo's six Spanish alias routes and their redirects. Keep its English routes,
  including `/home`, `/map`, `/node/$id`, `/alerts`, `/reports` and `/about`.
- Use `technology`, `about`, `collaborate` and `contact` as public-site page slugs. Reserved
  legal slugs become `legal/legal-notice`, `legal/privacy` and `legal/cookies`.
- Keep `/es/` and `/en/` locale prefixes and translated UI labels. Route names do not determine
  the content language. This supersedes ADR 0004's Spanish-slug decision.
- Keep `/` and `/home` as demo entry pages. Keep the site's root locale selection and the
  existing English demo-map redirect. Remove the unused `/zones` alias and its redirect.
- Preserve scenario and node identifiers, query parameters and simulation behaviour.

## Consequences

- Old Spanish paths are no longer registered and return the application's not-found response.
  Previously shared links to those paths need to be updated.
- Navigation, language switching, canonical URLs and alternate-language links use English
  slugs through the shared site route definitions.
- When legal pages return, their Markdown filenames must match the new English slugs.

## Alternatives considered

- Keep redirects for old links: rejected because the request explicitly removes Spanish-route
  support.
- Remove the Spanish locale: not required by a route-name change; the site and map retain
  their existing Spanish and English content.
