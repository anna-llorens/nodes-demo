# 0010 · Contact messages saved in Cloudflare D1

**Status:** accepted · 2026-10-30 · supersedes [0009](0009-contact-form-email-service.md)

## Context

The public site is deployed as one Cloudflare Worker (`nodes-site`) that serves the static Astro
build. The contact form needed a real endpoint; ADR 0009 proposed Formspree, but the Worker can
receive the form itself and keep the messages under our control, with no third party.

## Decision

`POST /api/contact` in the site Worker validates the JSON payload
`{ name, email, organization, interest, message, locale }` with `parseContactRequest`
(`apps/site/src/lib/contact.ts`, shared with the form) and inserts it with a prepared statement
into the D1 table `contact_messages` (database `nodes-contact`, binding `DB`, migrations in
`apps/site/worker/migrations`). It is same-origin only: no CORS headers, and a foreign `Origin` gets
403. Invalid bodies get 400; a filled honeypot gets `{ ok: true }` and is not saved.
`PUBLIC_CONTACT_ENDPOINT=/api/contact`.

## Consequences

- Messages stay in our Cloudflare account; they are read with `wrangler d1 execute`.
- Each saved message is also emailed to the project inbox (D5, Email Routing); a failed send is
  only logged, D1 stays the source of truth.
- The endpoint only exists under the Worker (`preview`, deploy), not under `astro dev`.

## Alternatives

- Formspree (ADR 0009): no code, but a third party holds the data and the free tier is limited.
- Supabase or another backend: more setup for a handful of messages.
