# M5 · Sobre nosotras, Legal, 404

**Goal:** the remaining public pages, reusing what exists.

Spec: section 7 "M5".

- Sobre nosotras: home team section + values block (`about.*`) + collaborate band. Nothing else.
- Legal: one template rendering `src/content/legal/{locale}/*.md` with the DRAFT banner.
  Do not write legal text: keep the TODO placeholders.
- 404 with `notFound.*`.

**Done when:** all three render in both languages at both sizes.

## Rules for every step

- Do **only** this step. Do not start the next one, even if it looks quick.
- Plan mode first: propose what you will do and wait for approval before writing code.
- Branch `feat/move-from-lovable`. Never merge into `main`.
- The full spec is `docs/plans/phase-1-public-site.md`; this file says which parts apply now.
- Before reporting: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` pass; commit with
  Conventional Commits, in English.
- Report back: what you did, screenshots at 375 px and 1440 px (when there is UI), anything
  you decided differently and why, open questions. Then stop.
