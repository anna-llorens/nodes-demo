# 0002 · DataSource abstraction

**Status:** accepted · 2026-10-28

## Context

Every number on screen comes from the seeded simulator today. Real LiDAR nodes will replace it,
pushing readings over the network. Screens should not know which one they are talking to.

## Decision

`@nodes/data-source` defines the contract and `SimulatedSource` implements it over
`@nodes/core`:

```ts
interface DataSource {
  listScenarios(): Promise<ScenarioSummary[]>;
  getScenario(id): Promise<Scenario>;
  getSnapshot(id, at): Promise<Snapshot>;      // every node at an event time
  getNodeSeries(id, nodeId): Promise<NodeSeries>; // one node, every minute of the schedule
  getAlerts(id, until): Promise<DensityAlert[]>;  // raised up to `until`, newest first
  subscribe(id, onSnapshot): Unsubscribe;
}
```

Changes to the original sketch:

- **Optional synchronous reads (`SyncReads`, `peek*`).** Sources that hold data in memory
  expose them; the web hooks seed React Query with them, so the first render and every playback
  tick have data without a loading state (the refactor had to keep the UI identical). Sources
  without them make the hooks suspend instead.
- **Context layers on `Snapshot`.** `traffic` and `runnerHeat` are optional: the simulator
  provides them, a live source may not.
- **Reports from series.** The report is aggregated in core (`aggregateReport`) from node
  series, so it works the same with any source.
- **No clock inside the source.** Playback stays in the web app. `SimulatedSource.setTime`
  lets a clock drive `subscribe`; a live source will push on its own.
- **Stable ids.** Scenario ids (`maraton`, `mascleta`) and node ids are kept as they were:
  they appear in shared map links and saved map state, and they seed the simulator's noise.
  Renaming them would break existing links and change every simulated value. Alert ids are
  `${nodeId}-${level}` with the level codes from ADR 0003.

The web app gets the source from a React context (`DataSourceProvider`), and components and
routes use hooks in `apps/web/src/data/hooks.ts`. Lint forbids them from calling simulator
functions directly.

## Consequences

- A live source only has to implement the interface; screens do not change.
- Scenario configuration is read synchronously when building the Spanish view of each
  scenario, which assumes a source with `peekScenario`. A live source will need either a warm
  cache or an async scenario loader.
- `subscribe` is implemented and tested but not yet used by the UI, which reads snapshots for
  the playback time.

## Alternatives considered

- **Async only, with loading states**: correct for a network source, but it would have added
  visible loading states during playback in a refactor that must not change the UI.
- **Synchronous interface**: simplest today, but it cannot represent a network source.
- **Events only (subscribe) without reads**: node detail, reports and alerts need random access
  to past times.
