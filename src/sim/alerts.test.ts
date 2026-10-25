import { describe, expect, it } from "vitest";
import { arrivalDensityExceeded } from "./alerts";
import { simulate, toMin } from "./engine";
import { maraton } from "@/scenarios/maraton";

describe("avisos de densidad en llegada", () => {
  it("avisa solo cuando la densidad supera el umbral configurable", () => {
    expect(arrivalDensityExceeded({ density: 6 }, 6)).toBe(false);
    expect(arrivalDensityExceeded({ density: 6.1 }, 6)).toBe(true);
    expect(arrivalDensityExceeded({ density: 6.1 }, 6.5)).toBe(false);
    expect(arrivalDensityExceeded(undefined, 6)).toBe(false);
  });
  it("activa y desactiva el aviso al cambiar la hora o el umbral con datos de llegada", () => {
    const early = simulate(maraton, toMin("08:00")).find((state) => state.id === "meta");
    const finish = simulate(maraton, toMin("11:30")).find((state) => state.id === "meta");
    expect(arrivalDensityExceeded(early, 6)).toBe(false);
    expect(arrivalDensityExceeded(finish, 6)).toBe(true);
    expect(arrivalDensityExceeded(finish, 7)).toBe(false);
  });
});