# 0014 · Dark theme for the public site

**Status:** accepted · 2026-11-03

## Context

The public site (`apps/site`) only had a light theme, so visitors with a dark system theme got a
bright page. All site colours already come from `packages/ui/src/tokens.css` (the `no-raw-hex`
test enforces it), so a dark theme can be a second set of token values. The site is static Astro:
no server can read a preference, so the theme must be applied in the browser before first paint.
There is no approved dark mockup; the palette is derived from the light tokens: the green brand
for primary, and dark blue-teal neutrals (around `#0e161a`) chosen by the team over the
green-tinted ones first planned.

## Decision

- **Tokens only.** Each colour token gets a dark value in `tokens.css`. Components keep reading
  the same tokens; a few rules that misused a token for a dark band were fixed instead of adding
  per-component dark styles. The one exception is the home hero, whose photo has a light haze on
  its left edge: in dark its mask fades further.
- **Activation.** The page follows `prefers-color-scheme`. `data-theme="light" | "dark"` on
  `<html>` forces a theme. The dark values live in two blocks with identical declarations:
  `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` and
  `:root[data-theme="dark"]`. A test checks that both blocks have the same values and that every
  light colour token has a dark one. Each theme sets `color-scheme`, so native controls match.
- **Control and storage.** A single sun/moon button in the header (`ThemeToggle`, next to the
  language links) switches to the other theme and saves it in `localStorage` under `nodes-theme`.
  Until it is used the site follows the system; there is no separate "System" option. An inline
  script at the top of `<head>` (`Base.astro`) applies the saved choice before paint. The button
  has a stable label ("Dark theme" / "Tema oscuro") and `aria-pressed` while dark shows.
- **Without JavaScript** the site still follows the system theme through the media query; the
  button does nothing.
- **New token `--color-on-primary`** for text and icons on primary fills. In dark,
  `--color-primary` is a light green so it can be used as link and text colour (61 rules use it
  that way) at ≥ 4.5:1; white text on it would fail, so fills use `--color-on-primary` (white in
  light, the dark page colour in dark).
- **Shared SVG tints** become `style="fill: var(--color-illustration-wash-N, <original hex>)"`.
  The wash tokens are only set in dark, so the light site, the demo and `<img>` use keep the exact
  original colours through the fallback.
- **Site only.** The demo (`apps/web`) does not import `tokens.css` and keeps its own behaviour;
  the site's choice does not carry over (different origins).

## Consequences

- Every new colour token needs a dark value in both dark blocks, or `tokens.test.ts` fails.
- Text on a primary fill must use `--color-on-primary`, not `--color-text-inverse` (which stays
  the text colour of dark bands).
- New SVG assets with light tints follow the wash-token pattern (see `packages/ui/assets/README.md`).
- Raster illustrations drawn on white (research areas, About context) show as light panels in
  dark. Changing them is an illustration redesign, out of scope.

## Alternatives considered

- **`light-dark()` per token**: one declaration per token instead of two dark blocks, but
  browsers without support (Safari before 17.5) would get no colours at all.
- **Keep `--color-primary` dark with white text on it**: dark links and eyebrows would reach at
  most ~3.9:1 on the dark page, failing WCAG AA.
- **A separate text token for primary used as text**: same result, but 61 rules in ~25 files
  instead of ~8 fill rules.
- **Three-way control (light / dark / system)**: more UI for little gain; following the system
  until the button is used covers it.
- **Cookie instead of `localStorage`**: no server reads it on a static site.
