# Home solution heading

## Decision and behavior

The solution section title uses an explicit newline between its two sentences, so the intended
display is “Una solucion.” followed by “Multiples aplicaciones.” on the next line. The existing
copy is preserved in both catalogs.

[`SectionHeading.astro`](../../apps/site/src/components/SectionHeading.astro) renders translated
titles as plain text and uses `white-space: pre-line` on headings. This preserves intentional
newlines while still allowing natural wrapping on smaller screens, without embedding HTML in
translation strings. Titles without newlines keep their existing behavior.

The line break is stored in `solution.title` in the
[`Spanish`](../../apps/site/src/i18n/es.json) and
[`English`](../../apps/site/src/i18n/en.json) catalogs. The
[`solution section`](../../apps/site/src/sections/home/Solution.astro) continues using the shared
heading component.

## Validation

`pnpm typecheck`, `pnpm lint`, `pnpm test` (175 tests) and `pnpm build` passed. Existing lint
warnings and the unused-`privacyInfo` Astro hint remain. Inspected the generated Spanish and
English home pages to confirm the title's newline and the generated `white-space: pre-line`
style. Responsive browser layout was not visually inspected.
