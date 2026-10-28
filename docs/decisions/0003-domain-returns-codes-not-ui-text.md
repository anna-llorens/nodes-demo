# 0003 · The domain returns codes, not UI text

**Status:** accepted · 2026-10-28

## Context

The prototype mixed Spanish text into the simulator: alert suggestions, node and zone names,
density level names (`"alta"`, `"muy-alta"`). The UI will be translated, and the domain must
run without any UI.

## Decision

- `@nodes/core` returns codes only:
  - density levels `low | medium | high | very_high`;
  - alert levels `high | very_high`;
  - suggestions `divert_to_gran_via | open_side_exit`;
  - node kinds `zone | crossing`.
- Scenario configurations in core hold ids, numbers and codes. Names, descriptions, addresses,
  zone names, road-closure names, taglines and the source label of figures move to
  `apps/web/src/labels/es.ts`; site photos map by node id in `apps/web/src/scenarios/images.ts`.
- `apps/web` turns codes into text with plain maps for now (`densityLabel`, `suggestionLabel`,
  `scenarioCopy`, …); the i18n step replaces those maps with message catalogues.
- The golden baseline is stored in this coded schema.

## Consequences

- The rendered text is unchanged; this was checked screen by screen and on the exported CSV
  against the `v0-lovable-demo` tag.
- Adding a suggestion or a scenario means adding a code in core and its text in
  `apps/web/src/labels/`.
- Alert ids in URLs change from `meta-muy-alta` to `meta-very_high`. Old links still open the
  node page at the right time; they just do not show the suggestion box.
- Street names inside the open-data traffic set (`valencia-traffic.json`) stay as published
  data; the UI does not show them.

## Alternatives considered

- **Keep Spanish in core and translate later**: every rule change would have to touch UI text,
  and the domain could not be shared with a backend.
- **Introduce i18n now**: out of scope for this step (Step 2 of the plan).
