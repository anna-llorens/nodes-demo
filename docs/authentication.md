# Application authentication

The web app currently has a temporary shared login: **username `admin`, password `admin`**.
Open `/login` directly on the demo/app host. There is no login button in the public navigation.
Authentication runs in `apps/web`; the separate public website in `apps/site` stays public.

Site-to-app links preserve the selected language: general demo links open
`/es/demo/map?scenario=maraton` or `/en/demo/map?scenario=maraton` directly. Scenario-specific
cards retain their selected scenario on the same localized map routes. Root/home entry pages
remain available and accept `?lang=es|en`. Explicit map
locale paths take precedence over `lang`, followed by the app host's saved `nodes_lang` cookie,
then Spanish. The preference lasts one year and is independent of the authentication cookie,
so login/logout and subsequent internal navigation keep it. The demo entry, map and login UI
use that locale; the remaining dashboard screens still have their existing Spanish copy.

## Access and navigation

| Page                           | Anonymous visitor     | Authenticated visitor                      |
| ------------------------------ | --------------------- | ------------------------------------------ |
| `/`, `/home`                   | Scenario entry        | Scenario entry with logout                 |
| `/login`                       | Login form            | Redirect to the requested page, or `/home` |
| `/es/demo/map`, `/en/demo/map` | Limited demo controls | Full navigation and private node links     |
| Every other registered page    | Redirect to `/login`  | Full access                                |
| Unknown route                  | 404                   | 404                                        |

Private pages include `/map`, `/node/$id`, `/alerts`, `/reports`, `/about`, `/admin` and the
`/demo/map` redirect. Only Spanish and English localized maps are public. The login URL can
carry `?redirect=…`; only known internal destinations are accepted.

Home cards always retain their scenario:

| Card          | Anonymous destination                  | Authenticated destination |
| ------------- | -------------------------------------- | ------------------------- |
| Medio Maratón | `/{locale}/demo/map?scenario=maraton`  | `/map?scenario=maraton`   |
| Mascletà      | `/{locale}/demo/map?scenario=mascleta` | `/map?scenario=mascleta`  |

For English entry-card links and shared private maps, `lang=en` is also included in the private
map URL so opening the link in another browser preserves the language.

Logout appears in the shared top header on every authenticated screen, including home. From
the map, logout opens its public version and retains `scenario`, `layers`, `camera`, `palette`
and `time` when present in the URL. English public and private maps return to the English public
map. Other private pages
return to `/home`; either home entry stays on that entry. Login and logout replace the document
so previous route context and loaders are discarded; logout also clears the query cache.

## Configuration

Set **`SESSION_SECRET`** to a server-only random value of at least 32 characters in production.
Generate one with `openssl rand -hex 32` and put it in the hosting environment or an ignored
local environment file. Do not expose it with a `VITE_` or `PUBLIC_` prefix or commit it.

For local `pnpm dev`, an unset secret is generated in memory. It changes after a server restart
or module reload, which can sign out existing sessions. A configured secret must satisfy the
minimum length in every environment. `ADMIN_USER` and `ADMIN_PASSWORD` are no longer used.

Sessions last eight hours and use a sealed HttpOnly `nodes-app-session` cookie. Local HTTP uses
SameSite=Lax. HTTPS uses Secure, SameSite=None and Partitioned to support embedded previews.
Session-dependent responses are private and must not be cached by a shared CDN.

Supabase is not required for the simulated maps or temporary login. The analytics dashboard
still requires its existing server-side Supabase settings. Anonymous tracking remains a public
server function; reading admin metrics verifies the app session before touching Supabase.

## Implementation map

- [`auth/session.server.ts`](../apps/web/src/auth/session.server.ts): credentials, cookie
  configuration and session read/write/clear operations.
- [`auth/functions.ts`](../apps/web/src/auth/functions.ts): login/logout/session server functions.
- [`auth/policy.ts`](../apps/web/src/auth/policy.ts): public-page allowlist, validated return URLs
  and logout destinations.
- [`routes/__root.tsx`](../apps/web/src/routes/__root.tsx): session loading and shared page guard.
- [`auth/context.ts`](../apps/web/src/auth/context.ts): session state for components. Use
  `useAuth().isAuthenticated` instead of the removed `mapOnlyNavigation` prop.
- [`auth/LoginForm.tsx`](../apps/web/src/auth/LoginForm.tsx) and
  [`auth/LogoutButton.tsx`](../apps/web/src/auth/LogoutButton.tsx): shared form and header action.
- [`lib/admin.functions.ts`](../apps/web/src/lib/admin.functions.ts): independent metrics guard.

New registered pages are private by default. Add exceptions explicitly to `isPublicPath` and
test them. Add page names to the typed `Routes` catalog as usual; let TanStack regenerate
`routeTree.gen.ts`.

The shared credentials are a prototype feature. Individual accounts, roles, password recovery
and a production authentication provider are outside this implementation.

## Verification

The implementation includes policy, server-session and form interaction tests. Live local HTTP
checks also verified anonymous metrics denial, session persistence, authenticated and anonymous
home links, full navigation on both localized maps, private-page redirects, logout and forged
cookie rejection. Typecheck, lint, tests (including the golden baseline) and both app builds
pass. Existing lint/build warnings remain. Visual browser QA was unavailable in this session;
see the [implementation plan](plans/temporary-authentication.md) for the validation boundary.

The language-handoff follow-up also verified 30 rendered site-to-app links and 11 live HTTP
checks covering English entry, saved preferences, conflicting URL locales, login, private maps,
return links and logout. See [ADR 0008](decisions/0008-site-app-language-handoff.md).

References: [approved plan](plans/temporary-authentication.md),
[session decision](decisions/0007-temporary-application-session.md).
