# NODES visual assets

Vector recreations made from the approved mockups (not exact extractions). Already normalised:

- The three brand greens the sources used (#2F9E7A, #159B78, #168B68) are `currentColor`, so
  each asset takes the colour of its CSS context. Set `color: var(--color-primary)` (icons) or
  `var(--color-primary-decor)` (illustrations).
- Light tints (backgrounds of illustrations and of the status icons) are kept as they came.
- Icons and social icons have no fixed width/height: size them with CSS.
- `illustrations/use-case-town-hall.svg` had a missing `</g>`; fixed.

Use them **inline** (Astro: import the file with `?raw` and render with `set:html`, or a small
`<Svg name>` component) so `currentColor` works. Add `aria-hidden="true"` to decorative ones;
the ones that carry meaning get a label from i18n.

## Logo

`logo/source/` holds the official files untouched. Do not render them directly: use
`src/Logo.astro`, which recolours them with tokens (`variant="dark"` for dark backgrounds).
The site favicons (`apps/site/public/`) are the "O" of the light file in `--color-primary`.

## Where each asset goes

| Asset | Used in |
|---|---|
| `icons/lidar-sensor.svg` | Home · solution "Nodos temporales"; Tecnología · step 1 |
| `icons/chart.svg` | Home · solution "Panel"; Tecnología · step 4 |
| `icons/report.svg` | Home · solution "Informes"; Tecnología · feature "Informes" |
| `icons/point-cloud.svg` | Home · how step 2; Tecnología · step 2 and privacy card |
| `icons/people-count.svg` | Tecnología · step 3 |
| `icons/lock.svg` | Tecnología · privacy card |
| `icons/map.svg`, `icons/bell.svg`, `icons/timeline-clock.svg` | Tecnología · features |
| `icons/runner.svg`, `icons/palm.svg`, `icons/people-group.svg`, `icons/shield.svg` | Tecnología · applications |
| `icons/status-simulation.svg`, `status-next.svg`, `status-future.svg` | Home · project status |
| `icons/calendar.svg`, `lightbulb.svg`, `graduation-cap.svg`, `handshake.svg` | Colabora · collaboration types |
| `icons/mail.svg` | Colabora · "contact directly" card (contact is by email only) |
| `icons/linkedin.svg`, `icons/clock.svg` | Not used (no LinkedIn row or response-time promise on Colabora) |
| `social/linkedin.svg`, `social/x.svg` | Footer (only when the URL env variable is set) |
| `illustrations/use-case-runner.svg`, `use-case-town-hall.svg` | Home · use-case cards |
| `illustrations/scene-half-marathon.svg`, `scene-mascleta.svg` | Demo app entry cards (instead of photos) |
| `png/maraton.jpg`, `png/mascleta.jpg` | Site · Demo page scenario cards (decorative photos) |
| `illustrations/hero-lidar-valencia.svg` | Tecnología · hero; Home · hero until its own illustration exists |
| `illustrations/skyline-header.svg` | Colabora · hero; Home · collaborate band |
| `illustrations/skyline-footer.svg` | Home · use cases (small); bottom of demo entry |
| `_unused/flask-wide.svg` | Not used (duplicate of `status-simulation`) |

## Still missing (build a simple version and list it in the report)

- Home hero: the node on a pole emitting a point cone over the skyline with silhouettes
  (see the hero of `docs/design/reference/home-desktop-approved.png`). Until then, use
  `hero-lidar-valencia.svg`.
- Home "how it works" step 3 laptop with map dots: `icons/chart.svg` is an acceptable stand-in.
