# M7 · QA

**Goal:** check everything together. Fix only what this check finds; no new features.

- Every page in `es` and `en`, at 375 px and 1440 px: screenshots.
- Lighthouse mobile on Home, Tecnología and Colabora: Accessibility ≥ 95, Performance ≥ 90.
- Definition of done of `docs/plans/phase-1-public-site.md` (section 11), item by item.
- No hardcoded UI text, no raw hex outside `tokens.css`, no photos of people, no claims of
  measured or real-time data.
- Final report: the full list of section 12 of the spec.

**Done when:** every item of section 11 is checked or explained.

## Rules for every step

- Do **only** this step. Do not start the next one, even if it looks quick.
- Plan mode first: propose what you will do and wait for approval before writing code.
- Branch `feat/move-from-lovable`. Never merge into `main`.
- The full spec is `docs/plans/phase-1-public-site.md`; this file says which parts apply now.
- Before reporting: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` pass; commit with
  Conventional Commits, in English.
- Report back: what you did, screenshots at 375 px and 1440 px (when there is UI), anything
  you decided differently and why, open questions. Then stop.
