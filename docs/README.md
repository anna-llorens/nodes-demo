# Documentation

This directory is organized by the kind of reference:

| Directory or file | Purpose |
|---|---|
| [`TODO.md`](./TODO.md) | Prioritized follow-up checklist with references to plans, decisions and change records. |
| [`authentication.md`](./authentication.md) | Temporary login, public/private pages, session configuration and navigation behavior. |
| [`design/`](./design/README.md) | Approved mockups and rules for using design assets. |
| [`decisions/`](./decisions/) | Accepted architecture and product decisions (ADRs). |
| [`plans/`](./plans/) | Implementation plans; follow the active plan for scope. |
| [`sources.md`](./sources.md) | Sources for real-world figures used in the product. |
| [`changes/`](./changes/) | Feature change records with decisions, rationale, implementation and validation. |

The [authentication, language and privacy change record](changes/2026-10-29-auth-language-privacy.md)
documents the complete 69-path staged snapshot reviewed on 2026-10-29.

Use plans to understand intended scope, ADRs to understand decisions already made, and the
design references for approved page structure and visual direction. Change summaries describe
what was implemented; they do not replace the relevant plans, ADRs, or source references.

Keep updating a feature's existing change record while its changes are uncommitted, including
follow-up fixes. Capture decisions and their reasons together; do not create a new record for
every completed task or date. See the [repository working rules](../CLAUDE.md).
