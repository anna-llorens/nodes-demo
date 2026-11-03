# Capacity and density calculator

Public, client-only calculator for the capacity of a space (CTE DB-SI 3) and crowd density at an
event. It has its own page at `/es/capacity-calculator` and `/en/capacity-calculator`, and a
compact version at the end of the home page. Plan: [docs/plans/capacity-calculator.md](../plans/capacity-calculator.md).
Decision: [ADR 0011](../decisions/0011-site-uses-core-capacity.md).

## Decisions

- **Logic in core, shared by both views.** [`packages/core/src/capacity/`](../../packages/core/src/capacity/)
  contains the pure functions (`capacity`, `density`, `exitWidth`, `crowdLevel`,
  `capacityUntil`) and `capacity-data.json`, where every value has a source key. The site imports
  only `@nodes/core/capacity`, and lint allows nothing else from core. Function names are English
  because of the repo's language rule.
- **Separate risk scale.** Standing 2/4/5 and moving 2/3, with the intermediate levels marked
  as a NODES proposal. The simulator's 2/4/6 bands are untouched. New tokens
  `--color-status-ok|warn|risk|critical` in `packages/ui/src/tokens.css`.
- **One component.** [`CapacityCalculator.astro`](../../apps/site/src/components/capacity/CapacityCalculator.astro)
  is used in full on the page and `compact` in [`Tools.astro`](../../apps/site/src/sections/research/Tools.astro).
  The client script is [`capacity-calculator.ts`](../../apps/site/src/components/capacity/capacity-calculator.ts).
  The server HTML already shows the example result, so the page works before JS runs.
- **URL state.** Only the page writes the query string (`?m2=&zona=`, `?personas=&m2=&modo=parado|movimiento`)
  with `replaceState`. The block keeps the home URL clean. Instead, it updates its "Abrir
  calculadora" link with the current values. Zone ids and `modo` values are Spanish, as in the
  prompt, because they are shared link ids.
- **Illustration.** An inline SVG of the 5 × 5 m floor in perspective, with `round(density × 25)`
  faceless figures, capped at 150 (6 people/m²). Placement is seeded so figures do not jump.
- **Privacy.** No requests, cookies or storage. The page says so in the methodology section.
- **CollaborateBand** now takes an optional `text` and a `secondary` link, so the page's
  closing band can link to Applications (button) and Contact (link).
- **Entry points.** «Calculadora de aforo» / «Crowd calculator» is a main navigation item after
  Applications, so the footer, which reuses the main navigation, lists it too. The compact block
  (`Tools.astro`) closes the home page; it is not on Research.
- **Featured research on the page.** The home `Featured` section takes an optional `card`. The
  calculator page passes `selfProtection` («Plan de autoprotección: cómo comprobar el aforo» /
  «Crowd safety plans: checking capacity on the day»). For any card other than the home one, the
  pitch is the article's own subtitle, so it needs no new keys. The Spanish article was a draft; it is now published (`draft: false`, `date: "2026-11-01"`) so the
  Spanish page shows it too.

## Copy decided during implementation (please review)

- Page eyebrow «Herramientas de investigación» / «Research tools» and the lead (ES taken from
  the prototype, EN translated).
- EN translations of the 11 CTE zone names, the level descriptions, the hints and the
  methodology text.
- Compact figure label «Aforo orientativo» / «Indicative capacity», taken from the mockup.
- Privacy line «Todo se calcula en tu navegador: no se envía ningún dato.»
- CTA labels «Ver aplicaciones» / «Contactar» (EN «See applications» / «Get in touch»).
- Section menu label «Herramientas» / «Tools».
- One new sentence linking to the calculator in each of «Del conteo a la predicción de
  congestiones» and «El LiDAR en 10 preguntas» (ES and EN). No figures or conclusions changed.
- Status colour values: green `#2f7d4f`, amber `#95600f`, orange `#b8461f`, red `#a3242f`.

## New i18n keys (es and en)

`meta.capacityCalculator.{title,description}`, `nav.capacityCalculator`,
`capacity.hero.{eyebrow,title,lead}`, `capacity.tabs.{label,capacity,density}`,
`capacity.area.{label,hint}`, `capacity.zone.{label,hint,option}`, `capacity.zone.<id>` ×11,
`capacity.people.label`, `capacity.occupied.{label,hint}`,
`capacity.mode.{label,hint,standing,moving}`, `capacity.example.{capacity,density}`,
`capacity.unit.{m2,people,peopleLong,perM2,m2PerPerson,metres}`,
`capacity.result.{capacity,compactCapacity,appliedDensity,spacePerPerson,exitWidth,density,untilStanding,untilMoving,empty,invalid}`,
`capacity.callout.{title,text}`, `capacity.level.{normal,attention,serious,critical}`,
`capacity.level.standing.{normal,attention,serious,critical}`,
`capacity.level.moving.{normal,attention,critical}`, `capacity.scale.label`,
`capacity.viz.{label,caption,capped}`,
`capacity.method.{title,privacy,disclaimer,sources}`,
`capacity.method.{capacity,exits,levels}.{label,text}`,
`capacity.source.{cte,exits,eiai,hse}`, `capacity.cta.{title,applications,contact}`,
`research.tools.{eyebrow,title,lead,info,open,method,notice}`. No existing keys changed.

## Validation

- `pnpm typecheck`, `pnpm lint` (0 errors), `pnpm test` (7 new core tests) and `pnpm build`
  pass. Both pages and their hreflang/x-default links are built and listed in the sitemap.
- Checked in the browser at 1360 px and 375 px: both tabs, URL loading
  (`?personas=3000&m2=1000&modo=movimiento` gives 3,00 · Crítico), no horizontal scroll, no
  console errors.

## Limitations

- No automated browser test for the client script.
- The prototype's dark theme was not carried over. The site now has its own dark theme
  ([site-dark-mode.md](site-dark-mode.md)); the calculator follows it through the tokens.
