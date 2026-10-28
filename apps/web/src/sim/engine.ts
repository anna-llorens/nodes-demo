/**
 * Web adapter over @nodes/core: re-exports the domain functions and turns their codes into
 * the text the screens show (node names, formatted times, suggestion text).
 */
import { fmtClock, trafficTimesAt as coreTrafficTimesAt, visibleAlerts as coreVisibleAlerts, scenarioAlerts as coreScenarioAlerts, type DensityAlert as CoreAlert, type EventTime } from "@nodes/core";
import { suggestionLabel } from "@/labels/es";
import type { Scenario } from "@/scenarios/types";

export { MAX_DENSITY, densityAt, estimateAreas, fmtClock, nodeState, scenarioNodeState, simulate, simulateRunnerHeat, toMin, trafficAt, zoneAssignments, type NodeState, type TrafficLevel } from "@nodes/core";

/** A core alert with the node name, formatted time and suggestion text added. */
export interface DensityAlert extends Omit<CoreAlert, "suggestion"> {
  time: string;
  node: string;
  zone: string;
  suggestion?: string;
}

function withText(s: Scenario, a: CoreAlert): DensityAlert {
  const node = s.nodes.find((n) => n.id === a.nodeId);
  const { suggestion, ...rest } = a;
  return {
    ...rest,
    time: fmtClock(a.minute),
    node: node?.name ?? a.nodeId,
    zone: node?.address ?? node?.name ?? a.nodeId,
    ...(suggestion ? { suggestion: suggestionLabel[suggestion] } : {}),
  };
}

export const scenarioAlerts = (s: Scenario) => coreScenarioAlerts(s).map((a) => withText(s, a));
export const visibleAlerts = (s: Scenario, minute: EventTime) => coreVisibleAlerts(s, minute).map((a) => withText(s, a));

/** Traffic times with crossing names. */
export function trafficTimesAt(s: Scenario, min: EventTime, traffic?: Parameters<typeof coreTrafficTimesAt>[2]) {
  const times = coreTrafficTimesAt(s, min, traffic);
  const name = (id: string | null) => s.nodes.find((n) => n.id === id)?.name ?? null;
  return { ...times, waits: times.waits.map((w) => ({ ...w, name: name(w.id) ?? w.id })), busiest: name(times.busiestId) };
}
