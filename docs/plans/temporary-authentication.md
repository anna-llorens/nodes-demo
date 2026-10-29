# Temporary application authentication

**Status:** implemented · 2026-10-29

This is the active plan for the approved temporary login. It supersedes the earlier TODO for a
public `/demo/app`: the existing `/es/demo/map` and `/en/demo/map` remain the public map URLs.

## Scope

- Reuse the admin login form on a dedicated, unlinked `/login` page.
- Accept the temporary shared credentials `admin` / `admin` on the server.
- Reuse TanStack Start sessions with an eight-hour, sealed HttpOnly cookie.
- Keep `/`, `/home`, `/login`, `/es/demo/map` and `/en/demo/map` public. Require a session for
  every other registered page, and check the session independently in the admin metrics handler.
- Derive full navigation and node-detail access from authentication; remove `mapOnlyNavigation`.
- Link each home scenario to the private map when authenticated and to the localized public map
  otherwise, preserving its actual scenario ID (`maraton` or `mascleta`).
- Show logout in the shared header. Preserve shareable map state and language when returning to
  the public map; return other private pages to home. Keep either home entry on logout.
- Preserve an internal requested destination through login and reject unsafe return URLs.
- Regenerate the route tree, document the design and operating requirements, and update the TODO.

## Acceptance criteria

- [x] Valid login persists across page requests; invalid login reports an accessible error.
- [x] There is no login link in public navigation; `/login` is directly accessible.
- [x] Anonymous direct requests to private pages redirect before rendering private content.
- [x] Public maps work without a session and show full controls to authenticated visitors.
- [x] Home cards retain the selected scenario in both authentication states.
- [x] Logout clears the cookie and cached client data and sends visitors to a public destination.
- [x] Admin metrics reject anonymous direct server-function requests.
- [x] Session, access policy, forms, translation parity and routing tests pass.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm build` pass.

## Verification

The automated suite covers the access policy, unsafe return URLs, session flags and cookie
configuration, credential failures, pending/error/success form states, logout navigation and
translation parity. The existing routing and golden tests also pass.

Twelve live HTTP smoke checks verified anonymous access, all private-page redirects, anonymous
metrics denial, home-card destinations, correct and incorrect login, cookie persistence,
authenticated page navigation, logout, 404 responses and forged-cookie rejection. The tests
ran against the local development server without Supabase configuration.

The in-app browser connection was unavailable, so visual browser QA and an interactive browser
Back-button check were not performed. Component interaction tests and direct HTTP requests
cover the corresponding form operations and rejection of revisited private URLs after logout.

## Boundaries

No user database, external authentication provider, registration, password reset, roles, changes
to domain calculations or changes to the public Astro site. This is a shared prototype login;
the production identity and authorization model remains a separate decision.

References: [authentication guide](../authentication.md),
[ADR 0007](../decisions/0007-temporary-application-session.md),
[route-name decision](../decisions/0006-english-route-names.md).
