# NODES · TODO

Updated: 2026-10-29. Work through the groups below in order. Unchecked items need verification
or completion; older backlog entries may already be resolved. This list tracks follow-up work;
implementation scope and approval remain governed by the relevant plan and
[`CLAUDE.md`](../CLAUDE.md).

## 1. Reconcile documentation and implementation

- [ ] Compare the code with the Phase 0 and Phase 1 plans, record completed milestones and
      deviations, and update their status and definition-of-done checklists.
      References: [Phase 0 plan](plans/phase-0-step-1-monorepo.md),
      [Phase 1 plan](plans/phase-1-public-site.md), [milestone index](plans/phase-1-steps/README.md).
- [ ] Reconcile the older follow-up list with current code and the latest change record,
      including the contact page, localized map, homepage design and environment-file handling.
      References: [Phase 0 follow-ups](plans/phase-0-follow-ups.md),
      [2026-10-29 changes](changes/2026-10-29.md),
      [localized-map decision](decisions/0005-localized-demo-map.md),
      [design references](design/README.md).
- [ ] Identify the active implementation plan and give each remaining task concrete acceptance
      criteria before implementation.
      References: [working rules](../CLAUDE.md), [documentation index](README.md).

## 2. Complete Phase 1 · M7 QA

- [ ] Capture and review every current public page in Spanish and English at 375 px and
      1440 px, including the added contact page; include the demo entry and localized map in
      the review. Record approved design deviations.
      References: [M7 QA](plans/phase-1-steps/M7-qa.md),
      [Phase 1 sections 6, 11 and 12](plans/phase-1-public-site.md),
      [design references](design/README.md), [recent additions](changes/2026-10-29.md).
- [ ] Verify locale routing, root language selection, language switching, `hreflang`, contact
      links, scenario links, map sharing and preserved map state.
      References: [Phase 1 sections 10 and 11](plans/phase-1-public-site.md),
      [two-app decision](decisions/0004-one-repo-two-apps.md),
      [localized-map decision](decisions/0005-localized-demo-map.md).
- [ ] Check keyboard navigation, visible focus, mobile menus, reduced motion, and every contact
      form state, including validation, submission errors and email fallback.
      References: [Phase 1 sections 4 and 7](plans/phase-1-public-site.md),
      [M4 contact-form scope](plans/phase-1-steps/M4-collaborate.md).
- [ ] Run mobile Lighthouse on Home, Tecnología and Colabora; record Accessibility ≥ 95 and
      Performance ≥ 90, or document and resolve failures.
      Reference: [M7 QA](plans/phase-1-steps/M7-qa.md).
- [ ] Audit UI translations, token colours, image use and simulation claims; check real-world
      figures against their sources.
      References: [Phase 1 section 11](plans/phase-1-public-site.md),
      [content rules](../CLAUDE.md), [figure sources](sources.md).
- [ ] Run `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm build`; confirm the golden test
      passes and record the final QA report with every definition-of-done item checked or
      explained.
      References: [M7 QA](plans/phase-1-steps/M7-qa.md),
      [Phase 1 sections 11 and 12](plans/phase-1-public-site.md).

## 3. Resolve publishing blockers

- [ ] Obtain team-written and reviewed legal texts in Spanish and English, including confirmed
      company information; restore the legal content and routes, footer links, contact consent
      checkbox and first-layer privacy text with its policy link.
      References: [legal publishing blocker](plans/phase-0-follow-ups.md),
      [legal content location](../apps/site/src/content/legal/README.md),
      [Phase 1 legal and contact requirements](plans/phase-1-public-site.md).
- [ ] Confirm public contact details, domain, social links and any remaining logo or image-rights
      questions; distinguish optional content from launch requirements.
      References: [Phase 1 sections 5, 8 and 12](plans/phase-1-public-site.md),
      [design references](design/README.md).

## 4. Prepare a separate deployment plan

- [ ] Specify separate site and demo deployments, hosting compatibility, domains, build commands,
      deployment triggers, environment variables and a rollback procedure.
      References: [two-app decision](decisions/0004-one-repo-two-apps.md),
      [Phase 1 deployment boundary](plans/phase-1-public-site.md),
      [site configuration template](../apps/site/.env.example),
      [demo configuration template](../apps/web/.env.example).
- [ ] Decide and document the contact submission backend and configure the endpoint; verify the
      form against it before launch.
      References: [Phase 1 contact contract](plans/phase-1-public-site.md),
      [undecided backend choices](../CLAUDE.md).
- [ ] Plan the edge implementation of root language selection, reusing the shared locale logic
      and adding the country rule while preserving saved-language precedence.
      References: [Phase 1 section 10](plans/phase-1-public-site.md),
      [two-app decision](decisions/0004-one-repo-two-apps.md).
- [ ] Document the Lovable transition and release sequence, reconcile the existing restriction
      on merging to `main`, and preserve published Git history.
      References: [Lovable instructions](../AGENTS.md),
      [Phase 1 branch restriction](plans/phase-1-public-site.md),
      [Phase 0 hosting notes](plans/phase-0-step-1-monorepo.md).

## 5. Verify and prioritize remaining improvements

Use the [Phase 0 follow-up list](plans/phase-0-follow-ups.md) as the original reference for
every item below. Confirm each item is still outstanding before scheduling changes.

- [ ] Plan the separate formatting pass and add `pnpm format:check` to CI afterward.
- [ ] Audit photo origins and licences, review photos showing people, and remove the unused
      `maraton.jpg` asset if it remains unused.
- [ ] Verify the 40 m dashed ring is labelled "nominal" on the map.
- [ ] Check density colour consistency across legends, node dots, alerts, heat maps and polygons.
- [ ] Replace remaining Spanish code comments with English and resolve outstanding lint warnings.
- [ ] Review tracked environment files and move deployment configuration into the hosting
      environment where appropriate. Account for the changes already recorded in the
      [environment-file update](changes/2026-10-29.md).
- [ ] Revisit the `@emnapi/runtime` pin when its upstream compatibility issue is resolved, and
      review the ignored `sharp` build script if Astro image optimization is introduced.
- [ ] Plan localization of the remaining dashboard screens and confirm the app-wide i18n
      approach, accounting for the existing map-scoped catalogs.
      Additional references: [two-app decision](decisions/0004-one-repo-two-apps.md),
      [localized-map decision](decisions/0005-localized-demo-map.md).
- [ ] Plan a public `/demo/app` route and private access for the other web-app routes, as
      requested on 2026-10-29. Confirm how this entry relates to the current localized demo map,
      then decide authentication and roles in a separate plan before implementing access control.
      References: [current demo-map routes](decisions/0005-localized-demo-map.md),
      [undecided authentication and roles](../CLAUDE.md).
