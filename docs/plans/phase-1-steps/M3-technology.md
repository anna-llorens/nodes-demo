# M3 · Tecnología

**Goal:** the Tecnología page.

Spec: section 7 "M3 · Tecnología", sections 6, 8, 9.
Reference: `docs/design/reference/technology-approved.png`.

- Hero, how it works (4 steps + privacy card), main features (with the "En la demo" label),
  applications.
- Icons from `packages/ui/assets/` as listed in its README.

**Done when:** page matches the reference with more space; screenshots in `es` at both sizes.

## Rules for every step

- Do **only** this step. Do not start the next one, even if it looks quick.
- Plan mode first: propose what you will do and wait for approval before writing code.
- Branch `chore/monorepo`. Never merge into `main`.
- The full spec is `docs/plans/phase-1-public-site.md`; this file says which parts apply now.
- Before reporting: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` pass; commit with
  Conventional Commits, in English.
- Report back: what you did, screenshots at 375 px and 1440 px (when there is UI), anything
  you decided differently and why, open questions. Then stop.
