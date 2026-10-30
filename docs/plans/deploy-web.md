# Deploy · demo app (apps/web) on Cloudflare Workers

Branch: `feat/move-from-lovable`. Goal: serve `apps/web` (TanStack Start, SSR) from Cloudflare at
`https://demo.nodes-data.com` and point the public site's demo links there instead of
`nodes-demo.lovable.app`. The site deployment (`docs/plans/deploy-site.md`) stays as it is.

## Working rules

Same as `deploy-site.md`: one step at a time (short plan → my OK → implement → short report →
stop); never commit, stage, push, merge, rebase or reset; end each step with files changed,
check results and a suggested Conventional Commit message. Checks: `pnpm --filter @nodes/web
typecheck`, `test` and `build`. Secrets never in `VITE_*`/`PUBLIC_*` variables or in the repo.
Dashboard steps are mine: write them as a short checklist.

## What we already know (verify, do not assume)

- `pnpm --filter @nodes/web build` already uses nitro's `cloudflare-module` preset
  (`apps/web/.output/nitro.json`) and writes `.output/server/wrangler.json` with
  `nodejs_compat` and an `ASSETS` binding. The generated Worker name is
  `anna-llorens-nodes-demo-apps-web`: it must become `nodes-web`.
- Server-only variables: `SESSION_SECRET` (required in production, ≥ 32 chars),
  `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `LOVABLE_CRON_SECRET(_PREVIOUS)`. Public: `PUBLIC_SITE_URL`, `VITE_SUPABASE_*`.
- Supabase (`project_id fcggvrsoqyeeivohcpgu`, Lovable Cloud) is only used for the internal
  `analytics_events` tracking (`src/lib/tracking.functions.ts`, `src/lib/admin.functions.ts`).
  We do not have its keys outside Lovable.

## Steps

### W1 · Worker config (code)
- Name the Worker `nodes-web` and keep the generated config (nitro `cloudflare` options or an
  `apps/web/wrangler.jsonc` that nitro merges; pick the one nitro 3 supports and say which).
- Find the exact deploy command for Workers Builds after a monorepo build (nitro's redirected
  config or `.output`) and test it locally with `wrangler deploy --dry-run`.
- Scripts in `apps/web/package.json`: `preview` (build + `wrangler dev`) and `deploy`.
- Report: my checklist to run the preview and open `/`, `/es/demo/map?scenario=maraton`,
  `/en/demo/map`, `/login` (admin/admin) and a missing page.
- Done: `apps/web/wrangler.jsonc` (nitro merges it); deploy command
  `pnpm --filter @nodes/web exec wrangler deploy`. See `docs/changes/web-deploy.md`.

### W2 · Run without Supabase (code)
- If the Supabase server variables are unset, `trackEvent` returns `{ ok: true }` without
  writing, and the admin metrics show an empty state with one line saying tracking is off.
  No errors in the console or logs. Do not delete the Supabase code.
- `.env.example`: mark the Supabase and `LOVABLE_CRON_*` values as optional.
- Moving the tracking to D1 is a later, separate step. Do not do it now.

### W3 · First deploy (my checklist, no code unless something fails)
- Workers & Pages → Create → Import a repository → `nodes-demo`, Worker name `nodes-web`.
- Production branch `feat/move-from-lovable`, root directory `/`, build command
  `pnpm install --frozen-lockfile && pnpm --filter @nodes/web build`, deploy command from W1.
- Build watch paths: include `apps/web/**`, `packages/**`, `pnpm-lock.yaml`.
- Build variable `PUBLIC_SITE_URL=https://nodes-data.com`.
- Runtime secret `SESSION_SECRET` (Settings → Variables and Secrets → Secret), generated with
  `openssl rand -hex 32`. Never in the repo or chat.

### W4 · Domain and site links (my checklist + docs)
- `nodes-web` → Settings → Domains & Routes → Custom domain `demo.nodes-data.com`.
- Site Worker: build variable `PUBLIC_DEMO_URL=https://demo.nodes-data.com/`, then redeploy.
  Site build watch paths: include `apps/site/**`, `packages/ui/**`, `pnpm-lock.yaml`.
- Update `docs/plans/deploy-site.md`, `docs/authentication.md` and README where they say the
  demo lives on Lovable. Use `demo.nodes-data.com` in the map-share test fixtures.
- Check: every demo link on the site (home, `/[locale]/demo`, scenario cards) opens
  `demo.nodes-data.com` in the right language, and the demo's logo returns to `nodes-data.com`.

### W5 · Search engines (code)
- The demo is an app, not content: send `X-Robots-Tag: noindex` on every response (or
  `<meta name="robots" content="noindex">`), so Google only indexes `nodes-data.com`.

Out of scope: moving tracking to D1, real authentication, unpublishing the Lovable project.
