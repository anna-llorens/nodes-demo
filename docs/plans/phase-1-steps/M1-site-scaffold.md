# M1 · Site scaffold

**Goal:** an empty but complete site skeleton that builds and looks right.

Spec sections: 4 (constraints), 5 (structure), 6 (layout rules), 10 (language), plus the
tokens and assets.

- Create `apps/site` (Astro) as `@nodes/site` in the workspace; root scripts build it.
- `packages/ui`: export `tokens.css`; copy the density colour values found in M0 into
  `--color-density-*`; an `<Svg>` helper that renders an asset inline.
- Inter via `@fontsource/inter`.
- `Base.astro` layout with header (desktop and mobile menu), footer, `hreflang`, language
  switcher, `.env.example` with the variables of section 5.
- i18n helper `t(locale, key, params)` with typed keys; a test that `es.json` and `en.json`
  have the same keys.
- `pickLocale({ cookie, languages, country })` as a pure tested function (section 10) and the
  client-side root redirect.
- Placeholder pages for every route of section 5 showing their title and
  `placeholder.comingSoon`. A 404.
- CI: the site is typechecked, linted, tested and built.

**Not in M1:** any page content beyond placeholders.

**Done when:** `/es/` and `/en/` placeholders render with header and footer at both sizes,
the menu works by keyboard, tests pass.

## Rules for every step

- Do **only** this step. Do not start the next one, even if it looks quick.
- Plan mode first: propose what you will do and wait for approval before writing code.
- Branch `feat/move-from-lovable`. Never merge into `main`.
- The full spec is `docs/plans/phase-1-public-site.md`; this file says which parts apply now.
- Before reporting: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` pass; commit with
  Conventional Commits, in English.
- Report back: what you did, screenshots at 375 px and 1440 px (when there is UI), anything
  you decided differently and why, open questions. Then stop.
