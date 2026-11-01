# Research articles: share, hearts and comments

## Decisions

See [ADR 0012](../decisions/0012-research-article-engagement.md). In short: same Worker, D1
database and email binding as the contact form. Keyed by the frontmatter `card` (shared by ES/EN).
Comments are published at once and moderated by deleting rows. Turnstile + honeypot + per-`ip_hash`
limits (3 comments/hour, 1 heart/article/24 h). The `ip_hash` is a salted SHA-256 of the IP.

## Behavior

- Below the article text (before the related articles on mobile; the related list stays in the
  desktop aside): share button (native share, or copy link when unsupported) plus LinkedIn and X links, always
  shown because native share sheets often lack them, heart button with count
  (the like is remembered in localStorage), comment list (newest 50) and the form with a privacy
  note.
- The heart button is always visible; its count fills in once the API answers.
- The block loads its data after the page; if the API fails it shows a short error and the article
  is unaffected. Without JS only the LinkedIn/X links show.
- The Turnstile script loads only when the form nears the viewport. The form is hidden while
  `PUBLIC_TURNSTILE_SITE_KEY` is unset.
- Each comment emails the inbox with article key, page, name, text, id and the delete command.
- Drafts have no block.

## Files

- [worker/migrations/0002_research_engagement.sql](../../apps/site/worker/migrations/0002_research_engagement.sql)
- [worker/engagement.ts](../../apps/site/worker/engagement.ts),
  [worker/http.ts](../../apps/site/worker/http.ts) (helpers moved out of `index.ts`),
  [worker/index.ts](../../apps/site/worker/index.ts)
- [src/lib/engagement.ts](../../apps/site/src/lib/engagement.ts) (shared validation and codes)
- [src/pages/research-keys.json.ts](../../apps/site/src/pages/research-keys.json.ts)
- [src/components/ArticleEngagement.astro](../../apps/site/src/components/ArticleEngagement.astro),
  [research/[slug].astro](../../apps/site/src/pages/[locale]/research/[slug].astro)
- `src/i18n/es.json`, `en.json` (`article.engagement.*`), `src/lib/env.ts`, `src/env.d.ts`,
  `.env.example`, `wrangler.jsonc`
- [docs/comments.md](../comments.md)

## Validation

- `pnpm typecheck` and `pnpm build` in `apps/site` pass. The build writes `research-keys.json`
  with the 9 published keys.
- `wrangler d1 migrations apply nodes-contact --local` applied `0002` successfully.
- Under `pnpm --filter @nodes/site preview` (Worker on :8787, launch config `site-preview`) with
  Cloudflare's always-pass Turnstile test keys: hearts counted (0 → 1), a comment was posted and
  listed, and the notification email was written by wrangler's local `send_email`.
- Under `astro dev` there is no Worker: the block only shows the share links and "could not be
  loaded", and the form is hidden without `PUBLIC_TURNSTILE_SITE_KEY`. Use the preview to see it.
- There are no unit tests for `src/lib/engagement.ts` yet.

## Limitations

- The privacy policy does not yet mention comments, hearts, `ip_hash` or Turnstile.
- The heart's 24 h repeat check and insert are not one transaction; two simultaneous clicks
  from the same IP could both count.
- Comments show the newest 50 only; there is no pagination.
