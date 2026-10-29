# 0009 · Contact form sends email through Formspree

**Status:** superseded by [0010](0010-contact-messages-in-d1.md) · 2026-10-30

## Context

The public site is static and the backend stack and hosting are not decided. The contact form
already posts JSON `{ name, email, organization, interest, message, locale }` to
`PUBLIC_CONTACT_ENDPOINT`, but there was no endpoint, so messages went nowhere. Messages should
reach the project inbox (the Gmail address set as `PUBLIC_CONTACT_EMAIL`).

## Decision

Use a Formspree form as `PUBLIC_CONTACT_ENDPOINT`. Formspree receives the JSON post and emails it
to the form owner's address; the visitor's `email` becomes the reply-to. `submitContact` sends
`Accept: application/json` so Formspree returns a status instead of an HTML redirect. The form URL
is not a secret and lives in `.env.local` and the host's build settings, never in code.

## Consequences

- No server code or secret in the repo; validation, honeypot and form states are unchanged.
- A third party processes the visitor's personal data: the privacy text must name Formspree
  before the site is public.
- Free tier limit (50 submissions per month); spam filtering is Formspree's plus our honeypot.
- Replacing it later only means pointing `PUBLIC_CONTACT_ENDPOINT` at our own endpoint that
  accepts the same payload.

## Alternatives

- Own endpoint in `apps/web` sending through an email API: needs hosting, CORS and a secret key.
- Serverless function on a specific host: ties the site to a host that is not chosen yet.
- Other form services (e.g. Web3Forms): require an access key inside the payload.
