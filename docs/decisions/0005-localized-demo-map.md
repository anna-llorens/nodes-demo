# 0005 · Localized demo map

**Status:** accepted · 2026-10-29

## Context

The public site already uses locale-prefixed URLs, while the demo remains Spanish-only under
ADR 0004's broader plan to adopt Lingui. The map-only demo route needs Spanish and English
without changing the existing dashboard or adding a dependency.

## Decision

- Add `/es/demo/map` and `/en/demo/map`; keep `/demo/map` as a redirect to Spanish.
- Keep the locale in the URL and preserve map-search state when switching languages or sharing.
- Use map-scoped JSON catalogs and localized scenario display copy. Add parity tests for catalog
  keys, placeholders, and scenario content.
- Treat this as a scoped implementation, not a replacement for the app-wide Lingui decision in
  ADR 0004.

## Consequences

- Map links are directly shareable and language switching does not discard scenario or camera
  state.
- The same simulation/domain data is reused; only presentation copy changes.
- Extending localization to the rest of the demo remains a separate decision and may use Lingui.
