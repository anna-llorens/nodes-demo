import { describe, expect, it } from "vitest";
import { maraton } from "@/scenarios/maraton";
import { MAX_DENSITY, fmtClock, simulate, toMin, trafficAt } from "./engine";
import { densityLevel } from "@/scenarios/types";
import { runnerHeatPoints } from "@/components/nodes/geo";

describe("simulador", () => {
  it("nunca supera 7 pers/m²", () => {
    for (let m = toMin("08:00"); m <= toMin("11:30"); m += 0.5)
      for (const s of simulate(maraton, m)) expect(s.density).toBeLessThanOrEqual(MAX_DENSITY);
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
