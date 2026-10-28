# M2 · Home

**Goal:** the home page, both sizes, both languages.

Spec: section 7 "M2 · Home", section 6 (spacing), section 8 (assets), section 9 (copy).
Reference: `docs/design/reference/home-desktop-approved.png` and `home-mobile-approved.png`.

- 7 sections in the order of the spec, with the generous spacing of section 6.
- Copy only from `apps/site/src/i18n/*.json`. Do not add text.
- Team: initials avatars. No photos.
- Home hero illustration: use `hero-lidar-valencia.svg` for now (it is listed as missing).

**Done when:** home matches the references in structure, order, components and colour, with
more space; screenshots in `es` at both sizes.

## Rules for every step

- Do **only** this step. Do not start the next one, even if it looks quick.
- Plan mode first: propose what you will do and wait for approval before writing code.
- Branch `chore/monorepo`. Never merge into `main`.
- The full spec is `docs/plans/phase-1-public-site.md`; this file says which parts apply now.
- Before reporting: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` pass; commit with
  Conventional Commits, in English.
- Report back: what you did, screenshots at 375 px and 1440 px (when there is UI), anything
  you decided differently and why, open questions. Then stop.
