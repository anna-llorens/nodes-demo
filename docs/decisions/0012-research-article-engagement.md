# 0012 · Research article hearts and comments in D1

**Status:** accepted · 2026-11-01

## Context

Research articles needed a share button, a heart reaction and public comments, without user
accounts and without new providers. The site Worker already stores contact messages in D1 and
sends email through the `send_email` binding (ADR 0010).

## Decision

- Same Worker, database (`nodes-contact`, binding `DB`) and email binding. Routes
  `GET /api/research/:key/engagement`, `POST .../heart`, `POST .../comments`
  (`apps/site/worker/engagement.ts`); validation shared with the page in
  `apps/site/src/lib/engagement.ts`.
- Rows are keyed by the frontmatter `card`, so the ES and EN versions share hearts and comments.
  The build writes the published keys to `/research-keys.json`; the Worker rejects other keys.
- Comments are published at once; moderation is deleting rows (`docs/comments.md`). Each new
  comment is emailed with its id and the delete command; a failed send keeps the comment.
- Abuse limits without accounts: Cloudflare Turnstile (verified server-side), a honeypot, 3
  comments per hour and 1 heart per article per 24 h for the same `ip_hash`
  (SHA-256 of IP + secret `IP_SALT`; the raw IP is never stored). `rate_log` rows older than 7
  days are deleted on every write, so no cron trigger is needed.
- Comments are plain text, rendered with `textContent`.
- Sharing uses `navigator.share`; without it, a copy-link button. LinkedIn and X share links are
  always shown, since native share sheets often lack them. Nothing is stored.

## Consequences

- The Turnstile script is the site's first third-party script. It loads only when the comment
  form nears the viewport, and the form is hidden when `PUBLIC_TURNSTILE_SITE_KEY` is unset.
- The endpoints only exist under the Worker (`preview`, deploy). Under `astro dev` the block shows
  its load error and the article is unaffected.
- No edit or delete for authors; any change goes through the D1 console or wrangler.

## Alternatives

- Third-party comments (Disqus, Giscus): new provider, tracking or GitHub accounts.
- Approval queue before publishing: rejected by the owner; deletion after the fact is enough.
- Cron trigger to prune `rate_log`: extra config for a table that stays tiny.
