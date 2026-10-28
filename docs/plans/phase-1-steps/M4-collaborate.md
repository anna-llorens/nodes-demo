# M4 · Colabora

**Goal:** the Colabora page with a working form UI (no backend).

Spec: section 7 "M4 · Colabora" (read the behaviour list carefully), sections 6, 8, 9.
Reference: `docs/design/reference/collaborate-approved.png`.

- Hero (without the close icon), 4 selectable type cards that fill the select and scroll to
  the form, the form, the "contact directly" card.
- Validation, all states (idle, field error, sending, sent, send error), honeypot, first-layer
  data protection text under the button.
- `submitContact()` posts to `PUBLIC_CONTACT_ENDPOINT`; without it, send-error state with the
  email fallback. Unit test with mocked `fetch`.
- Email and LinkedIn rows render only when their variables exist. No response-time promise.

**Done when:** every state can be reached and is shown in screenshots; keyboard-only flow works.

## Rules for every step

- Do **only** this step. Do not start the next one, even if it looks quick.
- Plan mode first: propose what you will do and wait for approval before writing code.
- Branch `chore/monorepo`. Never merge into `main`.
- The full spec is `docs/plans/phase-1-public-site.md`; this file says which parts apply now.
- Before reporting: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` pass; commit with
  Conventional Commits, in English.
- Report back: what you did, screenshots at 375 px and 1440 px (when there is UI), anything
  you decided differently and why, open questions. Then stop.
