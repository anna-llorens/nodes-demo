/**
 * @nodes/data-source — the read contract between the UI and wherever node data comes from.
 * `SimulatedSource` is the only implementation today; a live source will implement the same
 * interface.
 */
export { canPeek, type DataSource, type NodeId, type NodeSeries, type ScenarioId, type ScenarioSummary, type Snapshot, type SyncReads, type TrafficOverlay, type Unsubscribe } from "./data-source";
export { SimulatedSource } from "./simulated-source";
