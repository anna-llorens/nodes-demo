import { describe, expect, it } from "vitest";
import { scenarios } from "@/scenarios";
import { mascleta } from "@/scenarios/mascleta";
import { maraton } from "@/scenarios/maraton";
import { MAX_NODE_AREA_M2, densityLevel } from "@/scenarios/types";
import { densityAt, scenarioAlerts, simulate, toMin, visibleAlerts } from "./engine";

const minutes = (s: (typeof scenarios)[number]) => {
  const out: number[] = [];
  for (let m = toMin(s.schedule.start); m <= toMin(s.schedule.end); m++) out.push(m);
  return out;
};
const estimatedTotal = (m: number) => simulate(mascleta, m).reduce((sum, s) => sum + s.estimated, 0);

describe.each(scenarios.map((s) => [s.id, s] as const))("escenario %s, minuto a minuto", (_id, scenario) => {
  it("densidad ≤ 6, medido ≤ densidad × 1.257 + 1 y estimado ≥ medido", () => {
    for (const m of minutes(scenario)) {
      const states = simulate(scenario, m);
      scenario.nodes.forEach((node, i) => {
        const s = states[i]!;
        const density = densityAt(node, m);
        expect(s.density).toBeLessThanOrEqual(6);
        expect(density).toBeLessThanOrEqual(6);
        expect(s.people).toBeLessThanOrEqual(density * MAX_NODE_AREA_M2 + 1);
        expect(s.estimated).toBeGreaterThanOrEqual(s.people);
      });
    }
  });
});

describe("mascletà", () => {
  it("el total estimado en el pico está entre 20.000 y 30.000 y cae dentro de 14:00–14:08", () => {
    const all = minutes(mascleta).map((m) => ({ m, total: estimatedTotal(m) }));
    const peak = all.reduce((best, x) => (x.total > best.total ? x : best));
    expect(peak.total).toBeGreaterThanOrEqual(20000);
    expect(peak.total).toBeLessThanOrEqual(30000);
    expect(peak.m).toBeGreaterThanOrEqual(toMin("14:00"));
    expect(peak.m).toBeLessThanOrEqual(toMin("14:08"));
  });
  it("la plaza está entre 4 y 6 pers/m² de 14:00 a 14:08 y se vacía desde las 14:10", () => {
    for (let m = toMin("14:00"); m <= toMin("14:08"); m++) {
      const plaza = simulate(mascleta, m).find((s) => s.id === "m-plaza")!;
      expect(plaza.density).toBeGreaterThanOrEqual(4);
      expect(plaza.density).toBeLessThanOrEqual(6);
    }
    const at = (t: string) => simulate(mascleta, toMin(t)).find((s) => s.id === "m-plaza")!.people;
    expect(at("14:16")).toBeLessThan(at("14:08") * 0.35);
  });
  it("en el vaciado salen más personas de las que entran por Xàtiva y Estación del Norte", () => {
    for (let m = toMin("14:10"); m <= toMin("14:30"); m++)
      for (const s of simulate(mascleta, m).filter((x) => x.id === "m-xativa" || x.id === "m-estacion"))
        expect(s.flowOut).toBeGreaterThan(s.flowIn);
  });
  it("Calle Xàtiva pasa a muy alta a las 14:12", () => {
    const xativa = (t: string) => simulate(mascleta, toMin(t)).find((s) => s.id === "m-xativa")!;
    expect(densityLevel(xativa("14:11").density)).not.toBe("muy-alta");
    expect(densityLevel(xativa("14:12").density)).toBe("muy-alta");
  });
});

/** Alertas objetivo: [hora, nodo, nivel, densidad, sugerencia]. */
const TARGETS: Record<string, [string, string, "alta" | "muy-alta", number, string?][]> = {
  mascleta: [
    ["13:45", "m-plaza", "alta", 4.3],
    ["13:56", "m-xativa", "alta", 4.1],
    ["14:12", "m-xativa", "muy-alta", 6.0, "desviar flujo hacia Gran Vía"],
    ["14:14", "m-plaza-sur", "alta", 4.2],
  ],
  maraton: [
    ["08:10", "salida", "alta", 4.4],
    ["10:05", "meta", "alta", 4.2],
    ["10:15", "meta", "muy-alta", 6.0, "abrir salida lateral"],
  ],
};

describe.each([mascleta, maraton].map((s) => [s.id, s] as const))("alertas de %s", (id, scenario) => {
  it("son exactamente las objetivo (±2 min, ±0,2 pers/m²) y llevan su sugerencia", () => {
    const alerts = scenarioAlerts(scenario);
    const targets = TARGETS[id]!;
    expect(alerts).toHaveLength(targets.length);
    targets.forEach(([time, nodeId, level, density, suggestion], i) => {
      const a = alerts[i]!;
      expect([a.nodeId, a.level]).toEqual([nodeId, level]);
      expect(Math.abs(a.minute - toMin(time))).toBeLessThanOrEqual(2);
      expect(Math.abs(a.density - density)).toBeLessThanOrEqual(0.2 + 1e-9);
      expect(a.suggestion).toBe(suggestion);
    });
  });
  it("solo son visibles las alertas con hora ≤ la del reproductor", () => {
    const alerts = scenarioAlerts(scenario);
    const second = alerts[1]!;
    expect(visibleAlerts(scenario, second.minute - 1)).toHaveLength(1);
    expect(visibleAlerts(scenario, second.minute).map((a) => a.id)).toEqual([second.id, alerts[0]!.id]);
  });
});
