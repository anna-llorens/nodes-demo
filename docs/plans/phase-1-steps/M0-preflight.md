# M0 · Preflight

**Goal:** a clean starting point. No new features.

1. Report the status of `docs/plans/phase-0-step-1-monorepo.md`: steps done and pending, and
   whether install, typecheck, lint, test and build pass. If it is not finished, stop here and
   report: we finish it before anything else.
2. The pack was unzipped at the repo root (`docs/plans/phase-1-public-site.md`,
   `docs/plans/phase-1-steps/`, ADR 0004, `docs/design/`, i18n files for `apps/site` and the demo
   entry, legal drafts, `packages/ui/src/tokens.css`, `packages/ui/assets/`). Check for conflicts
   with existing files; list them instead of overwriting. Commit the pack as one `docs:` commit.
3. Update `CLAUDE.md`: add `apps/site` and `packages/ui` to the layout, the language rule from
   ADR 0004, and "icons and illustrations come from `packages/ui/assets/`".
4. Find where `apps/web` defines the density colours (legend and heat map) and report the
   exact values. Do not change anything yet.

**Done when:** pack committed, `CLAUDE.md` updated, density colours reported.

## Rules for every step

- Do **only** this step. Do not start the next one, even if it looks quick.
- Plan mode first: propose what you will do and wait for approval before writing code.
- Branch `feat/move-from-lovable`. Never merge into `main`.
- The full spec is `docs/plans/phase-1-public-site.md`; this file says which parts apply now.
- Before reporting: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` pass; commit with
  Conventional Commits, in English.
- Report back: what you did, screenshots at 375 px and 1440 px (when there is UI), anything
  you decided differently and why, open questions. Then stop.
