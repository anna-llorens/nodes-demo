import type { DensityAlert, EventTime, NodeState, RunnerHeatSample, Scenario, SeriesPoint, TrafficLevel, TrafficTimes } from "@nodes/core";

/** Scenario identifier, e.g. `"maraton"`. Stable: it appears in shared links and saved map state. */
export type ScenarioId = string;

/** Node identifier, unique across scenarios. Stable for the same reason as {@link ScenarioId}. */
export type NodeId = string;

/** Minimal description of a scenario, for lists. */
export interface ScenarioSummary {
  id: ScenarioId;
  schedule: { start: string; end: string };
  nodeCount: number;
}

/** Road traffic around the event at one time. */
export interface TrafficOverlay {
  segments: { id: string; level: TrafficLevel }[];
  times: TrafficTimes;
}

/** Every node of a scenario at one event time, plus optional context layers. */
export interface Snapshot {
  scenarioId: ScenarioId;
  at: EventTime;
  nodes: NodeState[];
  /** Road traffic, when the source provides it. */
  traffic?: TrafficOverlay;
  /** Representative runners along the route, when the source provides them. */
  runnerHeat?: RunnerHeatSample[];
}

/** A node's state at every whole minute of the scenario's schedule. */
export interface NodeSeries {
  scenarioId: ScenarioId;
  nodeId: NodeId;
  points: SeriesPoint[];
}

/** Stops a subscription. */
export type Unsubscribe = () => void;

/** Read access to node data, independent of where the data comes from. */
export interface DataSource {
  /** Every scenario the source can serve. */
  listScenarios(): Promise<ScenarioSummary[]>;
  /** Full configuration of a scenario. Rejects for unknown ids. */
  getScenario(id: ScenarioId): Promise<Scenario>;
  /** Snapshot of every node at a given event time. */
  getSnapshot(id: ScenarioId, at: EventTime): Promise<Snapshot>;
  /** One node's values for the whole schedule. */
  getNodeSeries(id: ScenarioId, nodeId: NodeId): Promise<NodeSeries>;
  /** Alerts raised up to `until` (inclusive), most recent first. */
  getAlerts(id: ScenarioId, until: EventTime): Promise<DensityAlert[]>;
  /** Pushes a snapshot whenever the source's time for the scenario advances. */
  subscribe(id: ScenarioId, onSnapshot: (snapshot: Snapshot) => void): Unsubscribe;
}

/**
 * Optional synchronous reads, for sources that already hold the answer in memory (the
 * simulator, or a live source with a warm cache). Screens use them to render the first
 * frame without a loading state; the async methods remain the contract.
 */
export interface SyncReads {
  peekScenarios(): ScenarioSummary[];
  peekScenario(id: ScenarioId): Scenario;
  peekSnapshot(id: ScenarioId, at: EventTime): Snapshot;
  peekNodeSeries(id: ScenarioId, nodeId: NodeId): NodeSeries;
  peekAlerts(id: ScenarioId, until: EventTime): DensityAlert[];
}

/** True when the source also offers {@link SyncReads}. */
export function canPeek(source: DataSource): source is DataSource & SyncReads {
  return typeof (source as Partial<SyncReads>).peekSnapshot === "function";
}
