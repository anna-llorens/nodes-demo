# 0013 · One slug per research article in both locales

**Status:** accepted · 2026-11-02

## Context

Research articles had a Spanish slug in `/es/` and an English slug in `/en/`
(`/es/research/medir-personas-sin-mirarlas`, `/en/research/measuring-people-without-looking`).
The team prefers translations whose URLs differ only in the locale prefix, which is easier to
manage and to track per language in search tools.

## Decision

- New research articles use one English slug, the same in both locales:
  `/es/research/<slug>` and `/en/research/<slug>`. The Markdown file has that name in both locale
  folders. The first one is `wifi-bluetooth-count-phones-not-people`.
- Translations are still paired by `card`, and `hreflang` alternates come from that pairing.
- Existing articles keep their current URLs; they are not renamed.

## Consequences

- The site uses two slug styles until (and unless) the older Spanish slugs are migrated, which
  would need redirects to keep shared links working.
- No code change: the route already takes the slug from the frontmatter per locale.

## Alternatives considered

- Translated slugs per locale (previous practice): rejected for new articles by preference.
- Rename existing articles now: out of scope; breaks shared links without redirects.
