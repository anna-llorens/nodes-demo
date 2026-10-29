import type { Scenario as CoreScenario } from "@nodes/core";
import { dataSource } from "@/data/source";
import { scenarioCopy } from "@/labels/es";
import { scenarioCopy as englishScenarioCopy } from "@/labels/en";
import type { MapLocale } from "@/i18n/map";
import { nodeImages } from "./images";
import type { Scenario } from "./types";

/** Adds localized copy and images to a core scenario; numbers and codes stay untouched. */
function withCopy(s: CoreScenario, locale: MapLocale = "es"): Scenario {
  const copy = (locale === "en" ? englishScenarioCopy : scenarioCopy)[s.id]!;
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
export const scenarios: Scenario[] = dataSource.peekScenarios().map((summary) => withCopy(dataSource.peekScenario(summary.id)));
export const getScenarios = (locale: MapLocale = "es") =>
  locale === "es" ? scenarios : dataSource.peekScenarios().map((summary) => withCopy(dataSource.peekScenario(summary.id), locale));

export const getScenario = (id?: string, locale: MapLocale = "es") =>
  locale === "es" ? scenarios.find((s) => s.id === id) ?? scenarios[0]! : getScenarios(locale).find((s) => s.id === id) ?? getScenarios(locale)[0]!;

/** Scenario and node for a node id (node ids are unique across scenarios). */
export function findNode(id: string) {
  for (const scenario of scenarios) {
    const node = scenario.nodes.find((n) => n.id === id);
    if (node) return { scenario, node };
  }
  return null;
}
