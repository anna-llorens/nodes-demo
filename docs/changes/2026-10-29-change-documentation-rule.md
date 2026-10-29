# Changes · 2026-10-29 · Change documentation rule

The workflow rule in [`CLAUDE.md`](../../CLAUDE.md) requires English documentation organized
by feature under `docs/changes/`. Reuse an existing feature record; create `<feature>.md` only
when the feature has no record. While its changes remain uncommitted, update that same file
across tasks and follow-up fixes instead of creating a file for every completion or date.

The record captures decisions taken, their rationale and trade-offs, resulting behavior,
affected-file links, actual validation and remaining limitations. Revise it as scope changes
so it describes the final feature rather than preserving a task-by-task transcript. This
avoids fragmented documentation for one feature and keeps its decisions together.

The rule also requires affected guides, plans, TODOs and ADRs to stay consistent with the
implementation. Staged-change summaries must inspect the cached diff and distinguish it from
unstaged work. This makes the implementation record available outside the chat.

Verification: checked the documentation diff for whitespace issues and verified the local
reference. This task changes documentation only; runtime checks were not rerun.
