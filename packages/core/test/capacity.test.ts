import { describe, expect, it } from "vitest";
import { CAPACITY_SOURCES, CAPACITY_ZONES, CROWD_LEVELS, CROWD_THRESHOLDS, capacity, capacityUntil, crowdLevel, density, exitWidth, findCapacityZone } from "../src/capacity";

describe("capacity calculator", () => {
  it("uses the CTE DB-SI 3 table 2.1 occupancy densities", () => {
    expect(CAPACITY_ZONES.map((zone) => [zone.id, zone.m2PerPerson])).toEqual([
      ["pie", 0.25], ["discoteca", 0.5], ["sentados", 0.5], ["multiple", 1], ["bar-pie", 1], ["bar-sentado", 1.5],
      ["gim-libre", 1.5], ["ferias", 2], ["piscina-estancia", 4], ["gim-aparatos", 5], ["transporte", 10],
    ]);
  });
  it("gives every value a known source", () => {
    const used = [...CAPACITY_ZONES, ...CROWD_LEVELS.standing, ...CROWD_LEVELS.moving].map((item) => item.source);
    for (const source of used) expect(CAPACITY_SOURCES).toHaveProperty(source);
  });
  it("rounds capacity down", () => {
    expect(capacity(1200, 0.25)).toBe(4800);
    expect(capacity(1001, 1.5)).toBe(667);
    expect(capacity(0, 2)).toBe(0);
  });
  it("computes density and exit width", () => {
    expect(density(12000, 4000)).toBe(3);
    expect(density(0, 10)).toBe(0);
    expect(exitWidth(4800)).toBe(24);
  });
  it("classifies standing crowds with exclusive upper limits", () => {
    expect([0, 1.99, 2, 3.99, 4, 4.99, 5, 9].map((d) => crowdLevel(d, "standing")))
      .toEqual(["normal", "normal", "attention", "attention", "serious", "serious", "critical", "critical"]);
  });
  it("classifies moving crowds with a red line at 3", () => {
    expect([1.99, 2, 2.99, 3, 4].map((d) => crowdLevel(d, "moving")))
      .toEqual(["normal", "attention", "attention", "critical", "critical"]);
  });
  it("counts people until the threshold", () => {
    expect(CROWD_THRESHOLDS).toEqual({ standing: 4, moving: 3 });
    expect(capacityUntil(4000, 4)).toBe(16000);
    expect(capacityUntil(10.5, 3)).toBe(31);
    expect(findCapacityZone("pie")?.m2PerPerson).toBe(0.25);
    expect(findCapacityZone("nope")).toBeUndefined();
  });
});
