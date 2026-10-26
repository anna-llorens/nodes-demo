import { describe, expect, it } from "vitest";
import { maraton } from "@/scenarios/maraton";
import { MAX_DENSITY, densityAt, fmtClock, simulate, simulateRunnerHeat, toMin, trafficAt } from "./engine";
import { MAX_NODE_AREA_M2, densityLevel, nodeAreaM2 } from "@/scenarios/types";
import { runnerHeatPoints } from "@/components/nodes/geo";

describe("simulador", () => {
  it("la llegada crece hacia el final hasta el tope de densidad", () => {
    const end = simulate(maraton, toMin("11:30")).find((state) => state.id === "meta");
    const earlier = simulate(maraton, toMin("10:00")).find((state) => state.id === "meta");
    expect(end?.density).toBe(MAX_DENSITY);
    expect(end?.people).toBeGreaterThan((earlier?.people ?? 0) * 1.4);
    expect(end?.spectators).toBeGreaterThan(2000);
  });
  it("personas = densidad × área del nodo", () => {
    for (const minute of [toMin("09:10"), toMin("10:15"), toMin("11:30")])
      for (const node of maraton.nodes) {
        const state = simulate(maraton, minute).find((item) => item.id === node.id)!;
        expect(state.people).toBe(Math.round(densityAt(node, minute) * node.areaM2));
      }
  });
  it("el área de cada nodo es como máximo un círculo de 20 m y menor en calles estrechas", () => {
    expect(Math.round(MAX_NODE_AREA_M2)).toBe(1257);
    expect(nodeAreaM2(40)).toBe(1257);
    expect(nodeAreaM2(8)).toBeLessThan(nodeAreaM2(22));
    for (const node of maraton.nodes) expect(node.areaM2).toBeLessThanOrEqual(1257);
    const crossing = maraton.nodes.find((node) => node.id === "cruce1")!;
    expect(crossing.areaM2).toBeLessThan(500);
  });
  it("ningún nodo supera 6 pers/m² ni 6 × área personas", () => {
    for (let m = toMin("08:00"); m <= toMin("11:30"); m += 0.5)
      for (const s of simulate(maraton, m)) {
        const node = maraton.nodes.find((item) => item.id === s.id)!;
        expect(s.density).toBeLessThanOrEqual(6);
        expect(s.people).toBeLessThanOrEqual(Math.round(6 * node.areaM2));
      }
  });
  it("mantiene etapas medias y aumenta la afluencia de animación", () => {
    const medium = simulate(maraton, toMin("10:15")).find((state) => state.id === "animacion");
    expect(densityLevel(medium?.density ?? 0)).toBe("media");
    const peak = simulate(maraton, toMin("09:10")).find((state) => state.id === "animacion");
    expect(densityLevel(peak?.density ?? 0)).toBe("alta");
    expect(peak?.people).toBeGreaterThan(medium?.people ?? 0);
  });
  it("el calor aumenta con la densidad sin cambiar posiciones", () => {
    const low = { ...maraton, nodes: maraton.nodes.map((node) => ({ ...node, curve: [["08:00", 2]] as [string, number][] })) };
    const high = { ...maraton, nodes: maraton.nodes.map((node) => ({ ...node, curve: [["08:00", 6]] as [string, number][] })) };
    const a = simulateRunnerHeat(low, 570);
    const b = simulateRunnerHeat(high, 570);
    expect(a.length).toBeGreaterThan(0);
    expect(a.map((point) => point.progress)).toEqual(b.map((point) => point.progress));
    expect(b.reduce((sum, point) => sum + point.weight, 0)).toBeGreaterThan(a.reduce((sum, point) => sum + point.weight, 0) * 4);
  });
  it("es determinista", () => {
    expect(simulate(maraton, 615.3)).toEqual(simulate(maraton, 615.3));
    expect(trafficAt(maraton, 615.3)).toEqual(trafficAt(maraton, 615.3));
  });
  it("la meta pasa a naranja hacia las 10:15", () => {
    const meta = simulate(maraton, toMin("10:15")).find((s) => s.id === "meta")!;
    expect(densityLevel(meta.density)).toBe("alta");
  });
  it("los corredores contados nunca superan los 30.000 inscritos", () => {
    for (let m = toMin("08:00"); m <= toMin("11:30"); m += 1) {
      const runners = simulate(maraton, m).reduce((a, s) => a + s.runners, 0);
      expect(runners).toBeLessThanOrEqual(30000);
    }
  });
  it("corredores + público = personas", () => {
    for (const s of simulate(maraton, toMin("09:10"))) expect(s.runners + s.spectators).toBe(s.people);
  });
  it("la hora muestra segundos", () => {
    expect(fmtClock(toMin("10:15") + 0.5, true)).toBe("10:15:30");
  });
  it("el calor de corredores es determinista y vacío fuera de carrera", () => {
    expect(runnerHeatPoints(maraton, toMin("09:30"))).toEqual(runnerHeatPoints(maraton, toMin("09:30")));
    expect(runnerHeatPoints(maraton, toMin("09:30")).features.length).toBeGreaterThan(0);
    expect(runnerHeatPoints(maraton, toMin("07:00")).features).toHaveLength(0);
    expect(runnerHeatPoints(maraton, toMin("12:00")).features).toHaveLength(0);
  });
});

describe("trafficTimesAt", () => {
  it("gives every crossing a wait of at least 2 min and longer waits during the closure", async () => {
    const { trafficTimesAt, toMin } = await import("./engine");
    const { maraton } = await import("@/scenarios/maraton");
    const during = trafficTimesAt(maraton, toMin("09:30"));
    const before = trafficTimesAt(maraton, toMin("07:30"));
    expect(during.waits.length).toBe(4);
    expect(during.waits.every((w) => w.wait >= 2)).toBe(true);
    expect(during.maxWait).toBeGreaterThan(before.maxWait);
  });
});
