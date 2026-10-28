# @nodes/core

Pure TypeScript domain logic. Everything here must run in Node and in the browser.

- No React, no DOM, no fetch, no timers, no `Date.now()`: time is always passed in.
- No user-facing text. Return codes; `apps/web` turns them into Spanish labels.
- Deterministic: seeded generator, no `Math.random()`.
- Every rule change ships with a unit test. Do not update the golden baseline to make a test
  pass unless the behaviour change is intended and approved; say so in the commit message.
- Public API only through `src/index.ts`. Document exported functions and types with JSDoc.
