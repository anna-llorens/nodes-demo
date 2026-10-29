# M6 · Demo entry and header (apps/web)

**Goal:** the demo gets an entry screen and a header that links back to the site. Nothing else
in the demo changes.

Spec: section 7 "M6".
Reference: `docs/design/reference/demo-entry-approved.png`.

- Entry screen at the demo root with the two scenario cards (`scene-half-marathon.svg`,
  `scene-mascleta.svg` instead of photos), copy from `apps/web/src/i18n/demo-entry.*.json`.
- Demo header: logo linking to `PUBLIC_SITE_URL`, the simulation badge, "Ir a la web".
  No alerts bell on the entry screen; inside a scenario keep the current alerts behaviour.
- Map, node detail, alerts and reports: untouched.

**Done when:** golden test passes; the entry and both scenarios work; screenshots at both sizes.

## Rules for every step

- Do **only** this step. Do not start the next one, even if it looks quick.
- Plan mode first: propose what you will do and wait for approval before writing code.
- Branch `feat/move-from-lovable`. Never merge into `main`.
- The full spec is `docs/plans/phase-1-public-site.md`; this file says which parts apply now.
- Before reporting: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` pass; commit with
  Conventional Commits, in English.
- Report back: what you did, screenshots at 375 px and 1440 px (when there is UI), anything
  you decided differently and why, open questions. Then stop.
