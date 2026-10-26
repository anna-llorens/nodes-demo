import { describe, expect, it } from "vitest";
import { scenarios } from "@/scenarios";
import { mascleta } from "@/scenarios/mascleta";
import { MAX_NODE_AREA_M2, densityLevel } from "@/scenarios/types";
import { alertsAt, densityAt, simulate, toMin } from "./engine";

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
  it("Calle Xàtiva pasa a rojo a las 14:12 con la sugerencia de desviar hacia Gran Vía", () => {
    const xativa = (t: string) => simulate(mascleta, toMin(t)).find((s) => s.id === "m-xativa")!;
    expect(densityLevel(xativa("14:11").density)).not.toBe("muy-alta");
    expect(densityLevel(xativa("14:12").density)).toBe("muy-alta");
    expect(alertsAt(mascleta, toMin("14:11"))).toEqual([]);
    expect(alertsAt(mascleta, toMin("14:12"))).toEqual([{ id: "m-xativa", name: "Calle Xàtiva", message: "Sugerencia: desviar flujo hacia Gran Vía" }]);
  });
});
