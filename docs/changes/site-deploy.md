# Public site deploy on Cloudflare Workers

Only `apps/site` is deployed, as one Worker `nodes-site`: static assets from `apps/site/dist`
plus a small script. Astro stays fully static (no Cloudflare adapter). The demo stays on Lovable,
linked through `PUBLIC_DEMO_URL`.

## D1 · Worker config

- [wrangler.jsonc](../../apps/site/wrangler.jsonc): `main: worker/index.ts`, assets binding
  `ASSETS` from `./dist`, `404-page` not-found handling, and the script runs first only for `/`
  and `/api/*`.
- [worker/index.ts](../../apps/site/worker/index.ts): `/` answers a 302 to `/es/` or `/en/` using the
  shared `pickLocale()` with the `nodes_lang` cookie, `Accept-Language` and `request.cf.country`
  (the country rule of ADR 0004 now works). `Vary: Cookie, Accept-Language`, not cached. Other
  requests go to `env.ASSETS`. `src/pages/index.astro` keeps its client-side redirect as a fallback.
- Types: `wrangler types` generates `worker/worker-configuration.d.ts` (gitignored); the site
  `typecheck` script now also runs it and `tsc -p worker`.
- Scripts: `preview` = build + `wrangler dev`; `deploy` = build + `wrangler deploy`
  (replaces `astro preview`).
- `wrangler` is a dev dependency; `workerd` is allowed to run its install script in
  `pnpm-workspace.yaml`.

Validation: site typecheck (Astro + Worker), build and `wrangler deploy --dry-run` pass. Not yet
run with `wrangler dev`.

## D2 · Contact endpoint and D1

- [Migration 0001](../../apps/site/worker/migrations/0001_contact_messages.sql): table
  `contact_messages` (`id`, `created_at` ISO UTC, `name`, `email`, `organization` nullable,
  `interest`, `message`, `locale`, `source` default `site`).
- `wrangler.jsonc`: D1 binding `DB` → `nodes-contact`, `migrations_dir: worker/migrations`.
- [`parseContactRequest`](../../apps/site/src/lib/contact.ts): server check reusing
  `validateContact` and `toPayload`; also rejects unknown interest/locale and values over 2,000
  characters, and flags the `website` honeypot. Unit tests added.
- `POST /api/contact` in the Worker: 405 for other methods, 403 for a foreign `Origin`, 415 for
  non-JSON, 400 for invalid bodies, 200 `{ ok: true }` after the prepared insert (or for spam,
  without saving). Other `/api/*` paths return 404. ADR 0010 supersedes the Formspree ADR 0009.
- `.env.example`: `PUBLIC_CONTACT_ENDPOINT=/api/contact`.

Validation: site typecheck, tests (40) and build pass. Under `wrangler dev` with a local D1: root
redirect 302, missing page 404, valid post saved, bad email 400, honeypot 200 and not saved, GET
405, foreign origin 403. The remote database is not migrated yet.

