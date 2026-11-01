# Research comments and hearts: moderation and setup

Research articles have hearts and comments (ADR 0012). Comments are **published immediately**.
To moderate, delete rows. Every new comment also arrives by email with its id and the exact
delete command.

Data lives in the D1 database `nodes-contact` (binding `DB`), tables:

- `comments` (`id`, `article_key`, `locale`, `name`, `body`, `created_at`, `ip_hash`)
- `reactions` (`article_key`, `hearts`)
- `rate_log` (`ip_hash`, `action`, `created_at`): rate limiting; rows older than 7 days are
  deleted automatically. For hearts `ip_hash` holds `<ip_hash>:<browser id>` (one heart per
  browser per article per day).

`article_key` is the article's frontmatter `card` (for example `lidar`), shared by the ES and EN
versions.

## From the Cloudflare dashboard

1. Workers & Pages → D1 SQL Database → `nodes-contact` → **Console**.
2. List the latest comments:
   ```sql
   SELECT id, article_key, locale, name, body, created_at FROM comments ORDER BY id DESC LIMIT 50;
   ```
3. Delete one: `DELETE FROM comments WHERE id = 123;`

## With wrangler

Run these from `apps/site`:

```bash
npx wrangler d1 execute nodes-contact --remote --command "SELECT id, article_key, name, body, created_at FROM comments ORDER BY id DESC LIMIT 50"
```

```bash
npx wrangler d1 execute nodes-contact --remote --command "DELETE FROM comments WHERE id = 123"
```

Other useful commands:

- Remove every comment from one IP (use the `ip_hash` of a spam comment):
  `DELETE FROM comments WHERE ip_hash = '<hash>'`
- Reset an article's hearts: `UPDATE reactions SET hearts = 0 WHERE article_key = 'lidar'`

## Setup

Apply the migration once per environment:

```bash
npx wrangler d1 migrations apply nodes-contact --remote
```

Create a Turnstile widget (Cloudflare dashboard → Turnstile) for the site's hostname. Then set:

| Name | Kind | Where |
| --- | --- | --- |
| `TURNSTILE_SECRET` | Worker secret | `npx wrangler secret put TURNSTILE_SECRET` |
| `IP_SALT` | Worker secret (long random string; never change it casually, rate limits reset) | `npx wrangler secret put IP_SALT` |
| `PUBLIC_TURNSTILE_SITE_KEY` | Build variable (public) | `.env` / build environment of `apps/site` |

The existing `CONTACT_SENDER`, `CONTACT_INBOX` and the `EMAIL` binding are reused for the
notification email.

Without `PUBLIC_TURNSTILE_SITE_KEY` the comment form is hidden. Without `TURNSTILE_SECRET`
or `IP_SALT` the POST endpoints answer 503 (reading still works).

For local testing (`pnpm --filter @nodes/site preview`), put Cloudflare's always-pass test keys
in `apps/site/.dev.vars` (`TURNSTILE_SECRET=1x0000000000000000000000000000000AA`, any `IP_SALT`)
and `.env` (`PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`), and apply the migration with
`--local`.
