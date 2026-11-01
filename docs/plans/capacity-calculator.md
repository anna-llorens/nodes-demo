# Plan: capacity and density calculator (apps/site)

Status: implemented (uncommitted).

## Scope

A page `/{es,en}/capacity-calculator` and a compact block on the Research page, both using one
set of Astro components and one client script. All calculations run in the browser: no
requests, no cookies. Values come from a JSON file in `packages/core` with a source for each
one. The prototype (`Calculadora de aforo NODES.html`) supplies the logic, copy, sources and
levels. The site's own components and tokens supply the styling.

## Steps

1. **Core (`packages/core/src/capacity/`)**
   - `capacity-data.json`: 11 CTE DB-SI 3 table 2.1 zones (`id`, `m2PerPerson`, `source`) and
     levels per mode (`standing`: 2/4/5, `moving`: 2/3) with sources (EIAI, HSE Blog). A comment
     in `capacity.ts` marks the intermediate thresholds as a NODES proposal (JSON has no
     comments).
   - `capacity.ts`: pure functions with English names, following the repo's language rule:
     `capacity(m2, m2PerPerson)` = floor, `density(people, m2)`, `exitWidth(people)` = P/200,
     `crowdLevel(density, "standing" | "moving")` → code (`normal | attention | serious |
     critical`), `capacityUntil(m2, threshold)` = floor(m2 × threshold).
   - Unit tests for edge values: thresholds 2, 3, 4 and 5; zero and invalid inputs.
   - Kept separate from the simulator's density bands (green < 2 … red ≥ 6). Those bands still
     apply to the demo and are unchanged.
   - Zone ids stay the prototype's (`pie`, `discoteca`, …) because they appear in shared URLs.
2. **Site wiring.** Allow `@nodes/core` in `apps/site` (an eslint rule change plus a workspace
   dependency, no new libraries). Add the route to `lib/routes.ts`, the sitemap and hreflang.
3. **Components (`apps/site/src/components/capacity/`)**: `CapacityCalculator.astro` (tabs,
   fields, big figure, facts, level, scale, illustration) with a `compact` variant, plus a
   `capacity-calculator.ts` client script that reads and writes the URL parameters (`?m2=&zona=`
   and `?personas=&m2=&modo=`). The illustration is an inline SVG of a 5 × 5 m square in
   perspective with simple faceless figures: `round(density × 25)` figures, capped at 150, with
   seeded placement.
4. **Page**: title and description, H1, both tabs, a "Cómo se calcula" section with
   `id="metodologia"`, linked sources and the disclaimer, and a closing NODES band linking to
   Applications and Contact.
5. **Research block** after the header: eyebrow, title, lead, the compact calculator, and a
   footer with the button, the methodology link and the notice.
6. **Other entry points**: a footer link (new key, added to the footer list) and one sentence in
   each of the two articles (ES and EN), only where it fits naturally.
7. **i18n**: new `capacity.*` and `researchTools.*` keys in `es.json` and `en.json`.
8. **Docs**: sources in `docs/sources.md`, `docs/changes/capacity-calculator.md`, and a short ADR
   that lets the site use core.
9. **Checks**: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, then desktop and
   mobile screenshots of the page and the block in the preview.

## Git

Per CLAUDE.md, no branch, commit or PR. Changes stay uncommitted on the current branch. At the
end there is a proposed commit message and a PR description (new keys, screenshots, decisions)
in `docs/changes/capacity-calculator.md`.
