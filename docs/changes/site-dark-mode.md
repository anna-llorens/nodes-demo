# Site dark mode

## Decisions

See [ADR 0014](../decisions/0014-site-dark-theme.md). In short: dark values for every colour token,
following the system theme by default, a header button that forces light or dark and saves the
choice in `localStorage` (`nodes-theme`), applied before paint by an inline script. Site only.

- **Palette.** Dark blue-teal neutrals around `#0e161a` (hue 200°), with the green brand for
  primary. The plan asked for green-tinted neutrals (hue ~160°, around `#0e1a17`); after seeing
  them the team chose a bluer background from three hue steps (180°, 190°, 200°), keeping each
  token's lightness and saturation, so contrast barely moved. Dark bands
  (`--color-surface-inverse`, `#1d2a30`) are a step lighter than the page so they still read as bands. Every dark value has a contrast
  comment from a computed WCAG check.
- **`--color-on-primary`** (new). In dark, primary is a light green (`#5cc39c`, 8.5:1 on the page)
  because the site uses it as link and text colour. White text on such a green would fail, so text
  on primary fills (buttons, step numbers, active chips and tabs, the article contents number,
  the research card arrow) uses `--color-on-primary`: white in light (no visible change), the
  page colour in dark. This replaces the plan's "white text on primary" rule, which can't meet
  AA together with primary links on a dark page.
- **Illustration washes.** The light tints baked into the six shared SVGs are now
  `var(--color-illustration-wash-1|2|3, <original hex>)`. The tokens are only set in dark;
  anywhere else the original hex applies, so `apps/web` renders exactly as before.
- **Turnstile** gets `theme` from the forced theme, or `auto` (follows the system like the page).
- **Toggle label.** One stable label ("Dark theme" / "Tema oscuro", key `theme.dark`) with
  `aria-pressed`, rather than a label that changes ("Switch to dark/light theme"), because a
  changing label plus a pressed state reads contradictorily in screen readers.

## Behavior

- First visit: the page follows the system theme, also without JavaScript.
- The sun/moon button (44 px, header, next to ES · EN, desktop and mobile) switches to the other
  theme and remembers it in this browser. Other open tabs follow. If storage is blocked, the choice
  lasts until the next page.
- The saved theme is applied in `<head>` before any stylesheet, so there is no flash on load.
- The root redirect page (`/`) declares `color-scheme: light dark`, so it does not flash white in
  dark either.
- Fixes for rules that would read wrong when flipped:
  - The technology PointCloud band used `--color-text` as its background and its hover text; it now
    uses `--color-surface-inverse`, like the other dark bands. In light the band changes from
    `#0b0d17` to `#0e1a17`, practically the same. The section is not linked from the nav at the moment.
  - Home hero: in dark, the photo's light left edge fades out further (mask 15% → 55%) so the
    light text over it stays legible. Light is unchanged.

## Files

- [packages/ui/src/tokens.css](../../packages/ui/src/tokens.css): dark blocks, `--color-on-primary`, wash tokens.
- [apps/site/src/styles/tokens.test.ts](../../apps/site/src/styles/tokens.test.ts): every colour token has a dark value; both dark blocks are identical.
- [apps/site/src/layouts/Base.astro](../../apps/site/src/layouts/Base.astro): pre-paint script, `color-scheme` meta.
- [apps/site/src/components/ThemeToggle.astro](../../apps/site/src/components/ThemeToggle.astro), [Header.astro](../../apps/site/src/components/Header.astro), `theme.dark` in [es.json](../../apps/site/src/i18n/es.json) and [en.json](../../apps/site/src/i18n/en.json).
- Primary fills: [global.css](../../apps/site/src/styles/global.css), [research/Cards.astro](../../apps/site/src/sections/research/Cards.astro), [demo/Scenarios.astro](../../apps/site/src/sections/demo/Scenarios.astro), [technology/Workflow.astro](../../apps/site/src/sections/technology/Workflow.astro), [CapacityCalculator.astro](../../apps/site/src/components/capacity/CapacityCalculator.astro), [research/[slug].astro](../../apps/site/src/pages/[locale]/research/[slug].astro).
- [technology/PointCloud.astro](../../apps/site/src/sections/technology/PointCloud.astro), [home/Hero.astro](../../apps/site/src/sections/home/Hero.astro), [pages/index.astro](../../apps/site/src/pages/index.astro), [ArticleEngagement.astro](../../apps/site/src/components/ArticleEngagement.astro).
- SVGs: `packages/ui/assets/illustrations/{hero-lidar-valencia,scene-half-marathon,scene-mascleta,skyline-header,skyline-footer}.svg`, `packages/ui/assets/icons/status-{future,next,simulation}.svg`; [assets README](../../packages/ui/assets/README.md).

## Validation

- `pnpm --filter @nodes/site test` (44 tests, including the new token test), `typecheck`, `build`
  (38 pages); `pnpm lint` (no errors; 5 existing warnings in `apps/web`); `pnpm --filter @nodes/web build`.
- Browser (local dev server): a script measured the text contrast of every rendered element on
  home (ES, EN), research, an article (ES, EN), applications, capacity calculator, demo, contact,
  about, privacy and 404. It ran with a dark system theme, with forced dark and with forced light.
  Dark: no text below AA. Light: only the failures that already existed (primary on primary-soft
  4.49:1 in eyebrow badges and research status labels; contact interest text 4.38:1).
- Visual checks at 1360 px and 375 px: header and toggle, dark bands, calculator, contact form,
  article header, footer; no horizontal scroll on mobile.
- Toggle: switches and saves; a saved "light" holds against a dark system across reloads; the
  inline script runs before any stylesheet.

## Limitations

- Turnstile's `theme` option was not seen in the browser: the widget did not load on the local
  dev server. Changing the theme after the widget renders does not restyle it.
- Raster illustrations drawn on white (research-area cards, About context image) show as light
  panels in dark. Redrawing them is out of scope.
- The light-theme contrast failures listed above are unchanged.
- The demo app has no dark theme, and the site's choice does not carry over to it.
- Open Graph images, favicons and e-mail templates are unchanged.
