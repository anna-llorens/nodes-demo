# Changes · 2026-10-29 · Localized underpass marker

The map's closed-underpass marker now uses the selected map language. Its label previously
always displayed Spanish text directly in the component.

## Implementation

- Replaced the hardcoded label in
  [`MapView.tsx`](../../apps/web/src/components/nodes/MapView.tsx) with
  `mapText(locale, "traffic.underpassClosed")`.
- Added `traffic.underpassClosed` to both map catalogs:
  [`Spanish`](../../apps/web/src/i18n/map.es.json) uses `Paso inferior\ncerrado`;
  [`English`](../../apps/web/src/i18n/map.en.json) uses `Underpass\nclosed`.
- Preserved the two-line display with `whitespace-pre-line`, using the newline from the
  translated string instead of a hardcoded `<br />`.

## Verification

The implementation passed `pnpm typecheck`, `pnpm lint`, `pnpm test` (175 tests, including
the existing map-catalog parity and domain golden tests) and `pnpm build`. The three existing
lint warnings in `AppShell.tsx` and `MapStage.tsx` remain. `git diff --check` also passed.

This record covers the underpass-label change separately from the earlier
[43-path staged-state review](2026-10-29.md).
