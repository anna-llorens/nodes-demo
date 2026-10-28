import { describe, expect, it } from "vitest";
import {
  MAX_DENSITY, MAX_NODE_AREA_M2, densityAt, densityLevel, estimateAreas, fmtClock, maraton, nodeAreaM2,
  simulate, simulateRunnerHeat, toMin, trafficAt, trafficTimesAt, zoneAssignments,
} from "../src";

describe("simulator", () => {
  it("grows towards the finish until the density cap", () => {
    const end = simulate(maraton, toMin("11:30")).find((state) => state.id === "meta");
    const earlier = simulate(maraton, toMin("10:00")).find((state) => state.id === "meta");
    expect(end?.density).toBe(MAX_DENSITY);
    expect(end?.people).toBeGreaterThan((earlier?.people ?? 0) * 1.4);
    expect(end?.spectators).toBeGreaterThan(2000);
  });
  it("counts measured people as density × node area", () => {
    for (const minute of [toMin("09:10"), toMin("10:15"), toMin("11:30")])
      for (const node of maraton.nodes) {
        const state = simulate(maraton, minute).find((item) => item.id === node.id)!;
        expect(state.people).toBe(Math.round(densityAt(node, minute) * node.areaM2));
      }
  });
  it("limits each node to a 20 m circle and to less on narrow streets", () => {
    expect(Math.round(MAX_NODE_AREA_M2)).toBe(1257);
    expect(nodeAreaM2(40)).toBe(1257);
    expect(nodeAreaM2(8)).toBeLessThan(nodeAreaM2(22));
    for (const node of maraton.nodes) expect(node.areaM2).toBeLessThanOrEqual(1257);
    const crossing = maraton.nodes.find((node) => node.id === "cruce1")!;
    expect(crossing.areaM2).toBeLessThan(500);
  });
  it("never exceeds 6 people/m² nor 6 × area people", () => {
    for (let m = toMin("08:00"); m <= toMin("11:30"); m += 0.5)
      for (const s of simulate(maraton, m)) {
        const node = maraton.nodes.find((item) => item.id === s.id)!;
        expect(s.density).toBeLessThanOrEqual(6);
        expect(s.people).toBeLessThanOrEqual(Math.round(6 * node.areaM2));
      }
  });
  it("assigns each marathon polygon to its zone's node and never shrinks below the circle", () => {
    for (const [zone, node] of zoneAssignments(maraton)) expect(zone).toBe(`z-${node}`);
    for (const node of maraton.nodes) expect(estimateAreas(maraton).get(node.id)).toBeGreaterThanOrEqual(node.areaM2);
  });
  it("keeps the estimate coherent: ≥ measured and no more runners than registered", () => {
    for (let m = toMin("08:00"); m <= toMin("11:30"); m++) {
      const states = simulate(maraton, m);
      for (const s of states) expect(s.estimated).toBeGreaterThanOrEqual(s.people);
      const runners = states.reduce((sum, s) => sum + (s.people ? (s.estimated * s.runners) / s.people : 0), 0);
      expect(runners).toBeLessThanOrEqual(maraton.participants ?? 0);
    }
  });
  it("keeps the cheering point at medium density while it fills", () => {
    const medium = simulate(maraton, toMin("10:15")).find((state) => state.id === "animacion");
    expect(densityLevel(medium?.density ?? 0)).toBe("medium");
    const peak = simulate(maraton, toMin("09:10")).find((state) => state.id === "animacion");
    expect(peak?.density).toBeGreaterThanOrEqual(3.5);
    expect(densityLevel(peak?.density ?? 0)).toBe("medium");
    expect(peak?.people).toBeGreaterThan(medium?.people ?? 0);
  });
  it("raises runner heat with density without moving runners", () => {
    const low = { ...maraton, nodes: maraton.nodes.map((node) => ({ ...node, curve: [["08:00", 2]] as [string, number][] })) };
    const high = { ...maraton, nodes: maraton.nodes.map((node) => ({ ...node, curve: [["08:00", 6]] as [string, number][] })) };
    const a = simulateRunnerHeat(low, 570);
    const b = simulateRunnerHeat(high, 570);
    expect(a.length).toBeGreaterThan(0);
    expect(a.map((point) => point.progress)).toEqual(b.map((point) => point.progress));
    expect(b.reduce((sum, point) => sum + point.weight, 0)).toBeGreaterThan(a.reduce((sum, point) => sum + point.weight, 0) * 4);
  });
  it("is deterministic", () => {
    expect(simulate(maraton, 615.3)).toEqual(simulate(maraton, 615.3));
    expect(trafficAt(maraton, 615.3)).toEqual(trafficAt(maraton, 615.3));
  });
  it("turns the finish high around 10:05 and very high at 10:15", () => {
    const meta = (t: string) => simulate(maraton, toMin(t)).find((s) => s.id === "meta")!;
    expect(densityLevel(meta("10:06").density)).toBe("high");
    expect(densityLevel(meta("10:15").density)).toBe("very_high");
  });
  it("never counts more runners than the 27,681 registered", () => {
    for (let m = toMin("08:00"); m <= toMin("11:30"); m += 1) {
      const runners = simulate(maraton, m).reduce((a, s) => a + s.runners, 0);
      expect(runners).toBeLessThanOrEqual(maraton.participants ?? 0);
    }
  });
  it("splits people into runners and public", () => {
    for (const s of simulate(maraton, toMin("09:10"))) expect(s.runners + s.spectators).toBe(s.people);
  });
  it("formats the clock with seconds", () => {
    expect(fmtClock(toMin("10:15") + 0.5, true)).toBe("10:15:30");
  });
  it("keeps runner heat deterministic and empty outside the race", () => {
    expect(simulateRunnerHeat(maraton, toMin("09:30"))).toEqual(simulateRunnerHeat(maraton, toMin("09:30")));
    expect(simulateRunnerHeat(maraton, toMin("09:30")).length).toBeGreaterThan(0);
    expect(simulateRunnerHeat(maraton, toMin("07:00"))).toHaveLength(0);
    expect(simulateRunnerHeat(maraton, toMin("12:00"))).toHaveLength(0);
  });
});

describe("trafficTimesAt", () => {
  it("gives every crossing a wait of at least 2 min and longer waits during the closure", () => {
    const during = trafficTimesAt(maraton, toMin("09:30"));
    const before = trafficTimesAt(maraton, toMin("07:30"));
    expect(during.waits.length).toBe(4);
    expect(during.waits.every((w) => w.wait >= 2)).toBe(true);
    expect(during.maxWait).toBeGreaterThan(before.maxWait);
    expect(during.waits.map((w) => w.id)).toContain(during.busiestId);
  });
});
