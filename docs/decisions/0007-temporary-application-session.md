# 0007 · Temporary application session

**Status:** accepted · 2026-10-29

## Context

The app used `mapOnlyNavigation` to restrict public demo controls, while `/admin` had a separate
environment-configured login. The approved requirement is one temporary `admin` / `admin` login,
a dedicated hidden-entry login page, public demo maps and authenticated dashboard pages.

## Decision

- Reuse TanStack Start's sealed cookie sessions with a single application authentication flag
  and an eight-hour lifetime. Validate the temporary credentials only in a `.server.ts` module.
- Keep `/login` accessible directly without advertising it in navigation. Extract the admin
  form for that route and remove the separate admin login and dashboard logout button.
- Load the current session in the root route's `beforeLoad`. Allow only the explicit public
  pages without authentication, and redirect anonymous requests for other registered pages to
  `/login` with a validated internal return destination. Unknown routes retain the 404 response.
- Verify the same session inside `getAdminMetrics` before importing or querying the privileged
  Supabase client. Page guards do not replace endpoint authorization.
- Let session state determine full navigation and private links on all map routes. Preserve the
  public map URLs and their content language, independently of authentication.
- After login and logout, replace the document to discard previous router context and loaders.
  Clear the query cache on logout. Revalidate on window focus and reload restored history pages.
- Remove the unused global Supabase bearer-token attachment middleware: no current application
  function uses that identity, and application sessions must work without Supabase configuration.
  Keep the existing CSRF middleware and generated integration files.

## Consequences

- The shared prototype account grants the full application, including analytics when its
  existing Supabase configuration is available. There are no distinct users or roles.
- Production requires `SESSION_SECRET` with at least 32 characters. Development can generate a
  process-local secret, so restarting the development server can invalidate sessions.
- The `nodes-app-session` cookie replaces the older admin cookie. HTTPS uses Secure,
  SameSite=None and Partitioned for embedded previews; local HTTP uses SameSite=Lax.
- Scenario IDs, simulation data and existing English route names are unchanged. `/demo/map`
  is private under the default policy and remains a redirect for authenticated users.

## Alternatives considered

- Client-only stored authentication: would not authorize server functions or initial SSR.
- A separate admin session: would require a second login for the same temporary user.
- A production identity provider: deferred until real accounts and authorization are specified.
