import type { Scenario, ScenarioNode } from "../types";
import { maraton } from "./maraton";
import { mascleta } from "./mascleta";

/** Configured scenarios; all share the same engine. */
export const scenarios: Scenario[] = [maraton, mascleta];

/** Scenario by id; unknown ids fall back to the marathon. */
export const getScenario = (id?: string): Scenario => scenarios.find((s) => s.id === id) ?? maraton;

/** Scenario and node for a node id (node ids are unique across scenarios). */
export function findNode(id: string): { scenario: Scenario; node: ScenarioNode } | null {
  for (const scenario of scenarios) {
    const node = scenario.nodes.find((n) => n.id === id);
    if (node) return { scenario, node };
  }
  return null;
}

export { maraton, mascleta };
