# Deploy · public site (apps/site) on Cloudflare Workers

Branch: `feat/move-from-lovable`. Only `apps/site` is deployed. The demo stays on Lovable
(main branch); the site links to it through `PUBLIC_DEMO_URL`. Do not touch `apps/web`,
`packages/core` or `packages/data-source`.

## Status

D1–D3 done (see `docs/changes/site-deploy.md`). Domain `nodes-data.com` live on the Worker (D4 done). Next: D5, D7, D6.

## Working rules

- One step at a time: short plan → wait for my OK → implement → short report → stop.
- Git: never commit, stage, push, merge, rebase or reset. End each step with files changed
  (one line each), check results and a suggested Conventional Commit message.
- Checks: `pnpm --filter @nodes/site typecheck` and `build` only. No extra test suites.
- Tokens: read only the files you need, do not print whole files.
- Contradictions: ask me in one or two lines, do not decide silently.
- Secrets never go in `PUBLIC_*` variables or in the repo. Server secrets use `wrangler secret put`.
- Steps that happen in the Cloudflare dashboard are mine: write them as a short checklist for me,
  do not try to run them.

## Target

| Piece | Choice |
|---|---|
| Hosting | One Cloudflare Worker named `nodes-site`: static assets from `apps/site/dist` + a tiny script |
| Script does | `/` → language redirect at the edge; `POST /api/contact` → saves to D1 |
| Database | Cloudflare D1 `nodes-contact` (free, no pausing). Table `contact_messages` |
| URL | `nodes-site.<account>.workers.dev` first; `nodes-data.com` when the domain is bought |
| Deploys | Cloudflare Workers Builds connected to GitHub (dashboard), root `apps/site` |
| Demo | `PUBLIC_DEMO_URL` = the Lovable URL |

Astro stays fully static: no Cloudflare adapter.

## Steps

### D1 · Worker config (code)
- Add `wrangler` as a dev dependency of `@nodes/site`.
- `apps/site/wrangler.jsonc`: `name: "nodes-site"`, `main: "worker/index.ts"`, a current
  `compatibility_date`, `assets: { directory: "./dist", binding: "ASSETS",
  not_found_handling: "404-page", run_worker_first: ["/", "/api/*"] }`.
- `apps/site/worker/index.ts`: on `/`, read the locale cookie, `Accept-Language` and
  `request.cf.country`, call the existing `pickLocale()` (import it, don't copy it), and return a 302
  to `/es/` or `/en/`. On every other request, `return env.ASSETS.fetch(request)`.
- Scripts in `apps/site/package.json`: `preview` (build + `wrangler dev`) and `deploy` (build +
  `wrangler deploy`). If the root redirect page used client-side detection, keep it as a fallback.
- Report: my checklist to run `pnpm --filter @nodes/site preview` and open `/`, `/es/`, `/en/` and
  a missing page.

### D2 · Contact endpoint + D1 (code + my checklist)
- `apps/site/worker/migrations/0001_contact_messages.sql`: `id` integer PK, `created_at` default
  now, `name`, `email`, `organization` (nullable), `interest`, `message`, `locale`,
  `source` default `'site'`.
- Add a `d1_databases` binding `DB` to `wrangler.jsonc` (I paste the `database_id`).
- `POST /api/contact`: accept only JSON with the payload `{ name, email, organization, interest,
  message, locale }`. Return 400 for an invalid email or for missing required fields or values
  over 2,000 characters. If the honeypot field is filled, return 200 and save nothing. Use a
  prepared insert and respond `{ ok: true }`. Same-origin only, so no CORS headers.
- `PUBLIC_CONTACT_ENDPOINT=/api/contact` in `.env.example`.
- My checklist: `wrangler d1 create nodes-contact`, then `wrangler d1 migrations apply
  nodes-contact --remote`, then read the rows with `wrangler d1 execute nodes-contact --remote
  --command "select * from contact_messages order by id desc limit 20"`.

### D3 · First deploy (only my checklist, no code unless something fails)
- Workers & Pages → Create → Import a repository → `nodes-demo`.
- Root directory `apps/site`. Build command
  `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @nodes/site build`. Deploy
  command `npx wrangler deploy`.
- Production branch `feat/move-from-lovable` for now. Builds only when `apps/site/**` or
  `packages/ui/**` change.
- Build variables: `PUBLIC_DEMO_URL` (Lovable URL), `PUBLIC_CONTACT_EMAIL`, `PUBLIC_LINKEDIN_URL`,
  `PUBLIC_CONTACT_ENDPOINT=/api/contact`, `PUBLIC_SITE_URL` = the workers.dev URL.
- Leave the site out of search engines until the domain and the legal texts are final: add
  `noindex` when `PUBLIC_SITE_URL` contains `workers.dev`.

### D4 · Domain (later, my checklist + one env change)
- Buy `nodes-data.com` in Cloudflare Registrar. On the Worker, add the custom domains
  `nodes-data.com` and `www` (redirect www to the root).
- Set `PUBLIC_SITE_URL=https://nodes-data.com` and redeploy. With that, `noindex` goes away and
  hreflang and canonical use the real domain.

### D5 · Email notification (code + my checklist, after D4)
Every contact message must also arrive at `nodes.data.contact@gmail.com`.
- My checklist: in the `nodes-data.com` zone, enable Email Routing and verify
  `nodes.data.contact@gmail.com` as a destination address (Gmail sends a confirmation link).
  Do NOT use Email Service → Email Sending: it needs Workers Paid. Sending to a verified
  Email Routing destination is free on Workers Free.
- `wrangler.jsonc`: `send_email: [{ name: "EMAIL", allowed_destination_addresses:
  ["nodes.data.contact@gmail.com"] }]`.
- In `POST /api/contact`, after the D1 insert, send a plain-text email from
  `web@nodes-data.com` to that address. Subject: `NODES · contacto · {interest} · {name}`.
  Body: every field plus the locale. Set `Reply-To` to the sender's email so I can answer
  straight from Gmail.
- If sending fails, log it and still return `{ ok: true }`: the message is already in D1.
- The destination address goes in `wrangler.jsonc`, never in a `PUBLIC_*` variable.

### D6 · Cloudflare Web Analytics (code + my checklist)
No cookies or local storage, so no consent banner is needed.
- My checklist: Analytics & Logs → Web Analytics → Add a site → the site's hostname → copy the
  token from the snippet. Set it as the build variable `PUBLIC_CF_ANALYTICS_TOKEN`.
- In `Base.astro` (and the root redirect page), only when the token is set, add the beacon:
  `<script defer src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token":"…"}'></script>`. Add the variable to `.env.example` and `env.ts`.
- Cookie policy draft (es/en): one line saying the site measures visits with Cloudflare Web
  Analytics, which sets no cookies and does not identify visitors.

### D7 · SEO basics (code only; it starts to count after D4)
- `@astrojs/sitemap` with `site` = `PUBLIC_SITE_URL`, i18n alternates for es/en. Exclude legal
  drafts, 404 and redirect pages.
- `robots.txt` generated at build time: `Disallow: /` on a workers.dev host, otherwise `Allow: /`
  plus the sitemap URL.
- On every page: unique `<title>` and meta description from i18n (report any page missing
  them), Open Graph and Twitter tags, and one default OG image (1200×630, from existing assets).
- JSON-LD `Organization` on the home page (name, url, logo, email, LinkedIn).
- No new copy beyond the missing meta descriptions; list any you add so I can review them.
- One canonical host: in the Worker, 301-redirect `www.nodes-data.com` and the `*.workers.dev` host
  to `https://nodes-data.com` with the same path and query (before the `/` language redirect).
- Report: the sitemap URL to submit in Google Search Console.

Out of scope: deploying `apps/web`, Supabase, Google Analytics, final legal texts.
