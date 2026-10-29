import { describe, expect, it } from "vitest";
import en from "./map.en.json";
import es from "./map.es.json";
import { mapRoutePath, mapText } from "./map";
import { getScenario, getScenarios } from "@/scenarios";
import { scenarioCopy } from "@/labels/es";
import { scenarioCopy as englishScenarioCopy } from "@/labels/en";

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe("map translations", () => {
  it("keeps Spanish and English keys and placeholders in sync", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
    for (const [key, spanish] of Object.entries(es)) {
      const english = en[key as keyof typeof en];
      expect(spanish.trim(), key).not.toBe("");
      expect(english.trim(), key).not.toBe("");
      expect(placeholders(english), key).toEqual(placeholders(spanish));
    }
  });

  it("formats translated copy and localized scenario names", () => {
    expect(mapText("es", "unit.nodes", { count: 3 })).toBe("3 nodos");
    expect(mapText("en", "unit.nodes", { count: 3 })).toBe("3 nodes");
    expect(getScenario("maraton", "en").name).toBe("València Half Marathon");
    expect(getScenario("maraton", "es").name).toBe("Medio Maratón de València");
  });

  it("provides English copy for every scenario, node, zone, and road closure", () => {
    expect(Object.keys(englishScenarioCopy).sort()).toEqual(Object.keys(scenarioCopy).sort());
    for (const id of Object.keys(scenarioCopy)) {
      expect(Object.keys(englishScenarioCopy[id]!.nodes).sort()).toEqual(Object.keys(scenarioCopy[id]!.nodes).sort());
      expect(Object.keys(englishScenarioCopy[id]!.zones).sort()).toEqual(Object.keys(scenarioCopy[id]!.zones).sort());
      expect(Object.keys(englishScenarioCopy[id]!.roadClosures).sort()).toEqual(Object.keys(scenarioCopy[id]!.roadClosures).sort());
    }
    for (const scenario of getScenarios("en")) {
      expect(scenario.name).not.toBe(getScenario(scenario.id, "es").name);
      expect(scenario.nodes.every((node) => node.name.length > 0)).toBe(true);
    }
  });

  it("uses explicit locale paths for the map", () => {
    expect(mapRoutePath("es")).toBe("/es/demo/map");
    expect(mapRoutePath("en")).toBe("/en/demo/map");
  });
});
