# ADR 0011: the site uses the capacity functions of core

## Context

The public site (`apps/site`) depended only on `@nodes/ui`. The capacity and density
calculator needs pure domain functions and sourced values (CTE DB-SI 3 occupancy densities,
crowd risk levels) that must have tests and must not be duplicated between the calculator page
and the Research block.

## Decision

`packages/core` exposes the calculator through a subpath entry, `@nodes/core/capacity`, with no
dependencies. `apps/site` may import that entry and nothing else from core; lint enforces it.
The calculator runs entirely in the browser.

## Consequences

- One tested implementation for the page and the Research block, and later for the dashboard.
- The site's client bundle carries only the capacity module, not the simulator or turf.
- The calculator's risk levels (2/4/5 standing, 2/3 moving) are a separate scale from the
  simulator's density bands (2/4/6), with their own colour tokens (`--color-status-*`).

## Alternatives

- Logic in `apps/site`: no shared tests with the domain package and duplicated if the dashboard
  needs it.
- Logic in `packages/ui`: that package is design tokens and components, not domain rules.
