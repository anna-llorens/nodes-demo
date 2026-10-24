import { describe, expect, it } from "vitest";
import { maraton } from "@/scenarios/maraton";
import { MAX_DENSITY, simulate, toMin } from "./engine";
import { densityLevel } from "@/scenarios/types";

describe("simulador", () => {
  it("nunca supera 7 pers/m²", () => {
    for (let m = toMin("08:00"); m <= toMin("11:30"); m += 0.5)
      for (const s of simulate(maraton, m)) expect(s.density).toBeLessThanOrEqual(MAX_DENSITY);
  });
  it("es determinista", () => {
    expect(simulate(maraton, 615.3)).toEqual(simulate(maraton, 615.3));
  });
  it("la meta pasa a naranja hacia las 10:15", () => {
    const meta = simulate(maraton, toMin("10:15")).find((s) => s.id === "meta")!;
    expect(densityLevel(meta.density)).toBe("alta");
  });
});
