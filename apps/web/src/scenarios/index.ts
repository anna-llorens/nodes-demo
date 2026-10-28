import { scenarios as coreScenarios, type Scenario as CoreScenario } from "@nodes/core";
import { scenarioCopy } from "@/labels/es";
import { nodeImages } from "./images";
import type { Scenario } from "./types";

/** Adds the Spanish copy and images to a core scenario; numbers and codes stay untouched. */
function withCopy(s: CoreScenario): Scenario {
  const copy = scenarioCopy[s.id]!;
  const { nodes, zones, roadClosures, ...rest } = s;
  return {
    ...rest,
    name: copy.name,
    shortName: copy.shortName,
    ...(copy.tagline ? { tagline: copy.tagline } : {}),
    ...(copy.participantsBasis ? { participantsBasis: copy.participantsBasis } : {}),
    ...(copy.zonesLabel ? { zonesLabel: copy.zonesLabel } : {}),
    nodes: nodes.map((n) => {
      const c = copy.nodes[n.id]!;
      const image = nodeImages[n.id];
      return {
        ...n,
        name: c.name,
        ...(c.description ? { description: c.description } : {}),
        ...(c.address ? { address: c.address } : {}),
        ...(image ? { image } : {}),
      };
    }),
    ...(zones ? { zones: zones.map((z) => ({ ...z, name: copy.zones[z.id] ?? z.id })) } : {}),
    ...(roadClosures ? { roadClosures: roadClosures.map((c) => ({ ...c, name: copy.roadClosures[c.id] ?? c.id })) } : {}),
  };
}

/** Configured scenarios with their UI copy; all use the same engine and screens. */
export const scenarios: Scenario[] = coreScenarios.map(withCopy);

export const getScenario = (id?: string) => scenarios.find((s) => s.id === id) ?? scenarios[0]!;

/** Scenario and node for a node id (node ids are unique across scenarios). */
export function findNode(id: string) {
  for (const scenario of scenarios) {
    const node = scenario.nodes.find((n) => n.id === id);
    if (node) return { scenario, node };
  }
  return null;
}
