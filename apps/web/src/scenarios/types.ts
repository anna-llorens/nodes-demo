/** View types: core scenario configuration plus the Spanish copy and images the UI shows. */
import type { NodeState, RoadClosure, Scenario as CoreScenario, ScenarioNode, ScenarioZone } from "@nodes/core";

export { densityLevel, type DensityLevel, type AlertLevel } from "@nodes/core";
export { ESTIMATE_LABEL, densityLabel } from "@/labels/es";

export interface NodeView extends ScenarioNode {
  name: string;
  description?: string;
  address?: string;
  image?: string;
}

export interface ZoneView extends ScenarioZone { name: string }
export interface RoadClosureView extends RoadClosure { name: string }

export interface Scenario extends CoreScenario {
  name: string;
  shortName: string;
  tagline?: string;
  participantsBasis?: string;
  zonesLabel?: string;
  nodes: NodeView[];
  zones?: ZoneView[];
  roadClosures?: RoadClosureView[];
}

export interface LiveNode extends NodeView {
  snapshot: NodeState;
}

export type LiveScenario = Omit<Scenario, "nodes"> & { nodes: LiveNode[] };
