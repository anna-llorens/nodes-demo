# Demo app deployment (apps/web on Cloudflare Workers)

Plan: [`docs/plans/deploy-web.md`](../plans/deploy-web.md).

## W1 · Worker config

- [`apps/web/wrangler.jsonc`](../../apps/web/wrangler.jsonc) sets `name: "nodes-web"` and a fixed
  `compatibility_date`. Nitro 3's `cloudflare-module` preset (with `deployConfig`) finds the
  nearest Wrangler file from `apps/web`, merges it into `.output/server/wrangler.json` and owns
  `main`, `assets` (`ASSETS` binding) and `nodejs_compat`. Chosen over
  `nitro.cloudflare.wrangler` in `vite.config.ts` because it mirrors `apps/site/wrangler.jsonc`
  and is where later bindings go. Without a name, nitro generated
  `anna-llorens-nodes-demo-apps-web`; without a date, it used the build day.
- Nitro also writes `apps/web/.wrangler/deploy/config.json` (gitignored), which redirects
  Wrangler to the generated config. Wrangler must therefore run from `apps/web` after a build.
- Workers Builds deploy command (root `/`, after
  `pnpm install --frozen-lockfile && pnpm --filter @nodes/web build`):
  `pnpm --filter @nodes/web exec wrangler deploy`. `pnpm exec` runs in the package directory.
- [`apps/web/package.json`](../../apps/web/package.json): `wrangler` ^4.155.0 as a dev
  dependency (same version as the site, so no `npx` download); `preview` is now
  `vite build && wrangler dev` (it was `vite preview`, which does not run the Worker) and
  `deploy` is `vite build && wrangler deploy`.
- `preview` runs the production build, so it needs `SESSION_SECRET` (≥ 32 characters) like the
  deployed Worker; only `vite dev` generates a temporary one. Without it, login fails with the
  generic "could not sign in" error. Put it in `apps/web/.dev.vars` (gitignored), e.g.
  `printf 'SESSION_SECRET=%s\n' "$(openssl rand -hex 32)" > apps/web/.dev.vars`. Wrangler reads
  `.dev.vars` instead of `apps/web/.env` when both exist.
- `pnpm install` also refreshed two lockfile entries (`@jridgewell/sourcemap-codec` 1.5.5 →
  1.6.0, and wrangler/miniflare/sharp for `@types/node@22` are no longer `optional`).

Validation: `pnpm --filter @nodes/web exec wrangler deploy --dry-run` from the repo root uses the
redirected config (`.output/server/wrangler.json`, name `nodes-web`, `env.ASSETS`, no warnings).
Under `wrangler dev`: `/`, `/es/demo/map?scenario=maraton` and `/en/demo/map` return 200,
`/login` returns 307 to `/login?redirect=%2Fhome` (normal app behaviour), and a missing page
returns 404. With `SESSION_SECRET` in `.dev.vars`, admin/admin in the browser lands on `/home`
with the logout button (without it, login fails as described above). Repo `typecheck`, `test`
(179 tests) and `build` pass; `lint` shows the 5 existing warnings in `apps/web`. Under
`wrangler dev` the log shows `[Supabase] Missing Supabase environment variable(s)` on every
tracking call; that is W2.

Limitations: the `$schema` path from `wrangler.jsonc` is copied into the generated config, where
it does not resolve; Wrangler ignores it. Supabase tracking without keys is W2.
