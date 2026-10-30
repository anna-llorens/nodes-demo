# Changes · 2026-10-29 · Authentication, language and privacy

This record covers all **69 staged paths** captured against `HEAD` `7e3b5ab`: 1,461 insertions
and 234 deletions. The cached diff SHA-256 is
`5f71a9192cc3b593dad3e30c8bcb59da6e6c5db1374767517a8d8e98354c1755`.
The inventory below describes the staged contents, including the staged documentation. This
record and its documentation-index link were written after that snapshot and are not part of
the 69-path count. No local environment-file values are included.

## Temporary application login and access

- Added a dedicated `/login` page, accessible directly without a login link in navigation.
  Its reusable form comes from the previous admin-page form and includes labelled fields,
  pending states, rejected-credential feedback and recoverable request errors.
- Added server functions for session lookup, login and logout. The temporary shared credentials
  are `admin` / `admin`, compared on the server. Authentication state is provided to components
  through `AuthContext` and `useAuth()`.
- Reused TanStack Start's sealed sessions with an eight-hour HttpOnly `nodes-app-session` cookie.
  Login clears previous session state before setting the authenticated flag. Anonymous session
  reads do not create a session, and session responses use `Cache-Control: private, no-store`.
- Production requires a server-only `SESSION_SECRET` of at least 32 characters. Development
  generates an in-memory secret when it is unset. The environment template removes `ADMIN_USER`
  and `ADMIN_PASSWORD`, which the shared login no longer uses. Local HTTP uses SameSite=Lax;
  HTTPS uses Secure, SameSite=None and Partitioned for embedded previews.
- The root route loads session state before page loading and redirects anonymous requests for
  private registered pages to `/login`, preserving the requested URL. Return destinations are
  restricted to known internal pages; external URLs, login loops, control characters and
  encoded path separators are rejected. Unknown routes retain the root 404 behavior.

| Page | Anonymous visitor | Authenticated visitor |
| --- | --- | --- |
| `/`, `/home` | Scenario entry | Scenario entry with logout |
| `/login` | Login form | Requested internal destination, or `/home` |
| `/es/demo/map`, `/en/demo/map` | Limited map controls | Full application navigation |
| Other registered pages | Redirect to login | Allow access |

- Removed `mapOnlyNavigation` from the shared map and shell components. The authenticated state
  now controls navigation, the alerts bell and private node-detail links, including on public
  map URLs. The map navigation item remains active on localized map paths.
- Home cards retain the actual selected scenario. Anonymous links target the localized public
  map; authenticated links target `/map`. English private-map links carry `lang=en`.
- Added logout to the shared header. It clears the session and query cache, then replaces the
  document. Map logout retains the current language and the URL's `scenario`, `layers`,
  `camera`, `palette` and `time`; other private pages return to `/home`. Either home entry stays
  on that entry. Login also replaces the document to discard previous routing state.
- Added session revalidation on window focus and a reload when a document is restored from
  browser history.
- The admin page now uses the shared login instead of rendering its own form, and its separate
  logout button is removed. The metrics server function independently checks the app session
  before importing or querying the privileged Supabase client.
- Removed the unused global Supabase bearer-token attachment middleware. App login and the
  simulated maps work without Supabase configuration; analytics still require the existing
  Supabase settings. The existing CSRF middleware remains.
- Added `Routes.login` and regenerated the TanStack route tree for the new route.

Detailed references: [authentication guide](../authentication.md),
[ADR 0007](../decisions/0007-temporary-application-session.md),
[approved implementation plan](../plans/temporary-authentication.md).

## Language preservation and direct demo links

- Added `demoDefaultUrl` for general site demo links. Desktop/mobile header navigation, the
  homepage hero and both “full demo” buttons open the marathon directly at
  `/{locale}/demo/map?scenario=maraton`. A configured app base path is preserved, and links stay
  absent when the demo URL is unset. Scenario-specific cards retain their existing scenario.
- The app resolves language from an explicit locale path first, then a valid `lang` query
  parameter, then the app host's saved `nodes_lang` cookie, with Spanish as the fallback.
  Explicit choices are remembered for one year independently of the authentication cookie.
- Added shared locale validation, server-side preference handling and `useAppLocale()`.
  The root session lookup also returns the resolved locale, the root provides it to components,
  and the document's `lang` follows that locale.
- Enabled both existing demo-entry catalogs and centralized entry metadata in `demoEntryHead`,
  shared by `/` and `/home`. Scenario cards, login, map display copy and shared header labels
  follow the chosen language.
- The private `/map` route now localizes its scenario and metadata. English private-map sharing
  includes `lang=en`, and logout can return a private English map to `/en/demo/map`.
- `/demo/map` remains private and redirects authenticated visitors to the localized map using
  the resolved language. The localized route uses `notFound()` for an unsupported locale when
  its route-level locale check runs.
- Site-return URLs and logo handling retain the app language. The return-link copy changes to
  “Ir a la web” / “Go to the website” in both entry and map catalogs and in the related plans.
- Other dashboard screens retain their existing Spanish copy; this is scoped localization.

Reference: [ADR 0008](../decisions/0008-site-app-language-handoff.md).

## Privacy pages and legal navigation

- Added the supplied Spanish privacy policy and an English translation, dated 29 October 2026.
  They identify Anna Llorens and the supplied contact email; that email also replaces the
  rights-request email placeholder. Both retain the providers/international-transfer placeholder.
- Added `/es/legal/privacy` and `/en/legal/privacy` using the existing `LegalPage` template.
  Both entries remain `draft: true`, so the template displays its draft banner and `noindex`.
- Re-enabled footer legal navigation for entries that exist in the content collection. Privacy
  is linked in each locale; legal notice and cookie-policy links remain absent because their
  content is not available. `legalNav` now preserves literal page types with `as const satisfies`.
- The contact-form consent checkbox now links to the matching privacy page.
- Updated the Spanish and English first-layer privacy strings to identify Anna Llorens (NODES)
  and describe enquiries and collaboration proposals. **The staged contact component removes
  the paragraph that rendered those strings below the form buttons**, so that summary is not
  displayed in this snapshot. Its computed value and styling remain in the component.
- Updated the legal-content README, the legal test's description and the publishing backlog to
  distinguish the restored privacy draft from the remaining legal content.

Reference: [legal content status](../../apps/site/src/content/legal/README.md).

## Map marker and header presentation

- Replaced the hardcoded closed-underpass marker with `traffic.underpassClosed` in both map
  catalogs: Spanish `Paso inferior\ncerrado`, English `Underpass\nclosed`. The marker uses
  `mapText(locale, ...)` and `whitespace-pre-line` to preserve its two-line layout.
- The staged header comments out its default simulation-badge fallback. Badges remain in the
  site-return layout and mobile row, but screens without a site-return link can lack a visible
  badge at larger widths. This is a change in the staged source, separate from the translation.

Reference: [focused underpass change record](2026-10-29-underpass-label.md).

## Documentation and automated coverage

- Updated `CLAUDE.md` with temporary authentication, scoped localization, language persistence
  and default site-to-map navigation. Production identity and roles remain undecided.
- Added the authentication guide, ADRs 0007/0008, the approved implementation plan and the
  underpass record. Added the guide to the documentation index.
- Updated the TODO to replace the earlier `/demo/app` idea with the existing localized public
  maps and defer individual accounts/roles to a later production-authentication task.
- Added tests for session configuration, valid/invalid credentials, cookie/session operations,
  missing/short secrets, public-page policy, safe return URLs, logout destinations, form
  pending/error/success states, English form copy and authentication translation parity.
- Added tests for locale precedence, saved language, HTTPS preference cookies and localized
  entry metadata; extended site URL tests for the direct marathon destination and base paths.
- The existing legal tests now validate the supplied bilingual content and draft flags. The
  existing map-catalog parity test covers the new underpass key. No domain packages, package
  manifests or dependency lockfiles are staged in this snapshot.

## Verification and review points

Earlier live HTTP checks covered authentication, language persistence and privacy-page
responses. They predate the staged removal of the first-layer privacy paragraph and should not
be read as verifying that paragraph in this snapshot. Visual browser QA was unavailable because
the in-app browser connection could not be established. Documentation references and inventory
coverage were checked separately; the staged whitespace check has the finding listed below.

Review the following concrete outstanding items before publishing:

- Complete the privacy policy's provider/transfer information and review the translated draft.
  Legal notice and cookie-policy pages remain pending.
- Resolve the mismatch between the removed first-layer privacy paragraph and the existing
  contact-form requirement in the Phase 1 plan.
- Review the commented simulation-badge fallback against the repository's visible-simulation-label
  rule.
- `git diff --cached --check` reports trailing whitespace in
  `apps/site/src/sections/collaborate/Contact.astro:90`. This documentation task leaves the
  staged implementation and index unchanged.

## Staged file inventory

Every path in the captured index diff is listed below. `A` means added and `M` means modified.

### Repository guidance · 1 paths

- `M` [CLAUDE.md](../../CLAUDE.md)

### Public website · 15 paths

- `M` [apps/site/src/components/Footer.astro](../../apps/site/src/components/Footer.astro)
- `M` [apps/site/src/components/Header.astro](../../apps/site/src/components/Header.astro)
- `M` [apps/site/src/content/legal/README.md](../../apps/site/src/content/legal/README.md)
- `A` [apps/site/src/content/legal/en/privacy.md](../../apps/site/src/content/legal/en/privacy.md)
- `A` [apps/site/src/content/legal/es/privacy.md](../../apps/site/src/content/legal/es/privacy.md)
- `M` [apps/site/src/i18n/en.json](../../apps/site/src/i18n/en.json)
- `M` [apps/site/src/i18n/es.json](../../apps/site/src/i18n/es.json)
- `M` [apps/site/src/lib/demo.test.ts](../../apps/site/src/lib/demo.test.ts)
- `M` [apps/site/src/lib/demo.ts](../../apps/site/src/lib/demo.ts)
- `M` [apps/site/src/lib/legal.test.ts](../../apps/site/src/lib/legal.test.ts)
- `M` [apps/site/src/lib/routes.ts](../../apps/site/src/lib/routes.ts)
- `A` [apps/site/src/pages/[locale]/legal/privacy.astro](../../apps/site/src/pages/%5Blocale%5D/legal/privacy.astro)
- `M` [apps/site/src/sections/collaborate/Contact.astro](../../apps/site/src/sections/collaborate/Contact.astro)
- `M` [apps/site/src/sections/home/Hero.astro](../../apps/site/src/sections/home/Hero.astro)
- `M` [apps/site/src/sections/home/UseCases.astro](../../apps/site/src/sections/home/UseCases.astro)

### React application · 43 paths

- `M` [apps/web/.env.example](../../apps/web/.env.example)
- `A` [apps/web/src/auth/LoginForm.tsx](../../apps/web/src/auth/LoginForm.tsx)
- `A` [apps/web/src/auth/LogoutButton.tsx](../../apps/web/src/auth/LogoutButton.tsx)
- `A` [apps/web/src/auth/context.ts](../../apps/web/src/auth/context.ts)
- `A` [apps/web/src/auth/forms.test.tsx](../../apps/web/src/auth/forms.test.tsx)
- `A` [apps/web/src/auth/functions.ts](../../apps/web/src/auth/functions.ts)
- `A` [apps/web/src/auth/policy.test.ts](../../apps/web/src/auth/policy.test.ts)
- `A` [apps/web/src/auth/policy.ts](../../apps/web/src/auth/policy.ts)
- `A` [apps/web/src/auth/session.server.test.ts](../../apps/web/src/auth/session.server.test.ts)
- `A` [apps/web/src/auth/session.server.ts](../../apps/web/src/auth/session.server.ts)
- `M` [apps/web/src/components/nodes/AppShell.tsx](../../apps/web/src/components/nodes/AppShell.tsx)
- `M` [apps/web/src/components/nodes/DemoEntry.tsx](../../apps/web/src/components/nodes/DemoEntry.tsx)
- `M` [apps/web/src/components/nodes/DemoHeader.tsx](../../apps/web/src/components/nodes/DemoHeader.tsx)
- `M` [apps/web/src/components/nodes/Logo.tsx](../../apps/web/src/components/nodes/Logo.tsx)
- `M` [apps/web/src/components/nodes/MapStage.tsx](../../apps/web/src/components/nodes/MapStage.tsx)
- `M` [apps/web/src/components/nodes/MapView.tsx](../../apps/web/src/components/nodes/MapView.tsx)
- `A` [apps/web/src/i18n/auth.en.json](../../apps/web/src/i18n/auth.en.json)
- `A` [apps/web/src/i18n/auth.es.json](../../apps/web/src/i18n/auth.es.json)
- `A` [apps/web/src/i18n/auth.test.ts](../../apps/web/src/i18n/auth.test.ts)
- `A` [apps/web/src/i18n/auth.ts](../../apps/web/src/i18n/auth.ts)
- `M` [apps/web/src/i18n/demo-entry.en.json](../../apps/web/src/i18n/demo-entry.en.json)
- `M` [apps/web/src/i18n/demo-entry.es.json](../../apps/web/src/i18n/demo-entry.es.json)
- `M` [apps/web/src/i18n/demo-entry.test.ts](../../apps/web/src/i18n/demo-entry.test.ts)
- `M` [apps/web/src/i18n/demo-entry.ts](../../apps/web/src/i18n/demo-entry.ts)
- `A` [apps/web/src/i18n/locale-context.ts](../../apps/web/src/i18n/locale-context.ts)
- `A` [apps/web/src/i18n/locale.server.test.ts](../../apps/web/src/i18n/locale.server.test.ts)
- `A` [apps/web/src/i18n/locale.server.ts](../../apps/web/src/i18n/locale.server.ts)
- `A` [apps/web/src/i18n/locale.test.ts](../../apps/web/src/i18n/locale.test.ts)
- `A` [apps/web/src/i18n/locale.ts](../../apps/web/src/i18n/locale.ts)
- `M` [apps/web/src/i18n/map.en.json](../../apps/web/src/i18n/map.en.json)
- `M` [apps/web/src/i18n/map.es.json](../../apps/web/src/i18n/map.es.json)
- `M` [apps/web/src/lib/admin.functions.ts](../../apps/web/src/lib/admin.functions.ts)
- `M` [apps/web/src/lib/routes.ts](../../apps/web/src/lib/routes.ts)
- `M` [apps/web/src/routeTree.gen.ts](../../apps/web/src/routeTree.gen.ts)
- `M` [apps/web/src/routes/$locale.demo.map.tsx](../../apps/web/src/routes/$locale.demo.map.tsx)
- `M` [apps/web/src/routes/__root.tsx](../../apps/web/src/routes/__root.tsx)
- `M` [apps/web/src/routes/admin.tsx](../../apps/web/src/routes/admin.tsx)
- `M` [apps/web/src/routes/demo.map.tsx](../../apps/web/src/routes/demo.map.tsx)
- `M` [apps/web/src/routes/home.tsx](../../apps/web/src/routes/home.tsx)
- `M` [apps/web/src/routes/index.tsx](../../apps/web/src/routes/index.tsx)
- `A` [apps/web/src/routes/login.tsx](../../apps/web/src/routes/login.tsx)
- `M` [apps/web/src/routes/map.tsx](../../apps/web/src/routes/map.tsx)
- `M` [apps/web/src/start.ts](../../apps/web/src/start.ts)

### Documentation · 10 paths

- `M` [docs/README.md](../../docs/README.md)
- `M` [docs/TODO.md](../../docs/TODO.md)
- `A` [docs/authentication.md](../../docs/authentication.md)
- `A` [docs/changes/2026-10-29-underpass-label.md](../../docs/changes/2026-10-29-underpass-label.md)
- `A` [docs/decisions/0007-temporary-application-session.md](../../docs/decisions/0007-temporary-application-session.md)
- `A` [docs/decisions/0008-site-app-language-handoff.md](../../docs/decisions/0008-site-app-language-handoff.md)
- `M` [docs/plans/phase-0-follow-ups.md](../../docs/plans/phase-0-follow-ups.md)
- `M` [docs/plans/phase-1-public-site.md](../../docs/plans/phase-1-public-site.md)
- `M` [docs/plans/phase-1-steps/M6-demo-entry.md](../../docs/plans/phase-1-steps/M6-demo-entry.md)
- `A` [docs/plans/temporary-authentication.md](../../docs/plans/temporary-authentication.md)
