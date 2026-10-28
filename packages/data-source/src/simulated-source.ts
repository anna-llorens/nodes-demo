import {
  nodeSeries, scenarios as defaultScenarios, simulate, simulateRunnerHeat, trafficAt, trafficTimesAt, visibleAlerts,
  type DensityAlert, type EventTime, type Scenario,
} from "@nodes/core";
import type { DataSource, NodeId, NodeSeries, ScenarioId, ScenarioSummary, Snapshot, SyncReads, Unsubscribe } from "./data-source";

/**
 * Data source backed by the seeded simulator in `@nodes/core`. Deterministic: the same
 * scenario and time always give the same values. It has no clock of its own; the playback
 * clock calls {@link SimulatedSource.setTime} and subscribers receive the new snapshot.
 */
export class SimulatedSource implements DataSource, SyncReads {
  private readonly series = new Map<string, NodeSeries>();
  private readonly listeners = new Map<ScenarioId, Set<(snapshot: Snapshot) => void>>();
  private readonly times = new Map<ScenarioId, EventTime>();

  constructor(private readonly scenarios: readonly Scenario[] = defaultScenarios) {}

  peekScenarios(): ScenarioSummary[] {
    return this.scenarios.map((s) => ({ id: s.id, schedule: s.schedule, nodeCount: s.nodes.length }));
  }

  peekScenario(id: ScenarioId): Scenario {
    const scenario = this.scenarios.find((s) => s.id === id);
    if (!scenario) throw new Error(`Unknown scenario: ${id}`);
    return scenario;
  }

  peekSnapshot(id: ScenarioId, at: EventTime): Snapshot {
    const s = this.peekScenario(id);
    const segments = trafficAt(s, at);
    return {
      scenarioId: id,
      at,
      nodes: simulate(s, at),
      ...(s.traffic ? { traffic: { segments, times: trafficTimesAt(s, at, segments) } } : {}),
      ...(s.route ? { runnerHeat: simulateRunnerHeat(s, at) } : {}),
    };
  }

  peekNodeSeries(id: ScenarioId, nodeId: NodeId): NodeSeries {
    const key = `${id}/${nodeId}`;
    const cached = this.series.get(key);
    if (cached) return cached;
    const s = this.peekScenario(id);
    const node = s.nodes.find((n) => n.id === nodeId);
    if (!node) throw new Error(`Unknown node: ${nodeId} in ${id}`);
    const result = { scenarioId: id, nodeId, points: nodeSeries(s, node) };
    this.series.set(key, result);
    return result;
  }

  peekAlerts(id: ScenarioId, until: EventTime): DensityAlert[] {
    return visibleAlerts(this.peekScenario(id), until);
  }

  async listScenarios() { return this.peekScenarios(); }
  async getScenario(id: ScenarioId) { return this.peekScenario(id); }
  async getSnapshot(id: ScenarioId, at: EventTime) { return this.peekSnapshot(id, at); }
  async getNodeSeries(id: ScenarioId, nodeId: NodeId) { return this.peekNodeSeries(id, nodeId); }
  async getAlerts(id: ScenarioId, until: EventTime) { return this.peekAlerts(id, until); }

  /** Moves the scenario's playback time and notifies its subscribers. */
  setTime(id: ScenarioId, at: EventTime): void {
    if (this.times.get(id) === at) return;
    this.times.set(id, at);
    const listeners = this.listeners.get(id);
    if (!listeners?.size) return;
    const snapshot = this.peekSnapshot(id, at);
    listeners.forEach((listener) => listener(snapshot));
  }

  /** Subscribes to snapshots; if the scenario already has a time, the current snapshot is sent at once. */
  subscribe(id: ScenarioId, onSnapshot: (snapshot: Snapshot) => void): Unsubscribe {
    this.peekScenario(id);
    const set = this.listeners.get(id) ?? new Set();
    set.add(onSnapshot);
    this.listeners.set(id, set);
    const at = this.times.get(id);
    if (at !== undefined) onSnapshot(this.peekSnapshot(id, at));
    return () => { set.delete(onSnapshot); };
  }
}
