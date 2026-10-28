import { describe, expect, it, vi } from "vitest";
import { maraton, mascleta, nodeSeries, simulate, simulateRunnerHeat, toMin, trafficAt, visibleAlerts } from "@nodes/core";
import { SimulatedSource, canPeek, type Snapshot } from "../src";

describe("SimulatedSource", () => {
  it("lists every configured scenario", async () => {
    const source = new SimulatedSource();
    expect(await source.listScenarios()).toEqual([
      { id: "maraton", schedule: maraton.schedule, nodeCount: 8 },
      { id: "mascleta", schedule: mascleta.schedule, nodeCount: 4 },
    ]);
  });
  it("returns configurations and rejects unknown ids", async () => {
    const source = new SimulatedSource();
    expect(await source.getScenario("mascleta")).toBe(mascleta);
    await expect(source.getScenario("nope")).rejects.toThrow("Unknown scenario: nope");
  });
  it("reads snapshots from the simulator, with traffic and runner heat only where configured", async () => {
    const source = new SimulatedSource();
    const at = toMin("10:15");
    const snapshot = await source.getSnapshot("maraton", at);
    expect(snapshot.nodes).toEqual(simulate(maraton, at));
    expect(snapshot.traffic?.segments).toEqual(trafficAt(maraton, at));
    expect(snapshot.runnerHeat).toEqual(simulateRunnerHeat(maraton, at));
    const mascletaSnapshot = await source.getSnapshot("mascleta", toMin("14:05"));
    expect(mascletaSnapshot.traffic).toBeUndefined();
    expect(mascletaSnapshot.runnerHeat).toBeUndefined();
  });
  it("serves node series and caches them", async () => {
    const source = new SimulatedSource();
    const series = await source.getNodeSeries("maraton", "meta");
    expect(series.points).toEqual(nodeSeries(maraton, maraton.nodes.find((n) => n.id === "meta")!));
    expect(await source.getNodeSeries("maraton", "meta")).toBe(series);
    await expect(source.getNodeSeries("maraton", "nope")).rejects.toThrow("Unknown node");
  });
  it("returns the alerts raised up to a time, most recent first", async () => {
    const source = new SimulatedSource();
    expect(await source.getAlerts("mascleta", toMin("14:12"))).toEqual(visibleAlerts(mascleta, toMin("14:12")));
    expect((await source.getAlerts("mascleta", toMin("13:00"))).length).toBe(0);
  });
  it("pushes snapshots to subscribers when the playback time moves", () => {
    const source = new SimulatedSource();
    const received: Snapshot[] = [];
    const stop = source.subscribe("maraton", (s) => received.push(s));
    source.setTime("maraton", 600);
    source.setTime("maraton", 600);
    source.setTime("mascleta", 850);
    expect(received.map((s) => [s.scenarioId, s.at])).toEqual([["maraton", 600]]);
    stop();
    source.setTime("maraton", 601);
    expect(received).toHaveLength(1);
  });
  it("sends the current snapshot at once to late subscribers", () => {
    const source = new SimulatedSource();
    source.setTime("mascleta", 852);
    const listener = vi.fn();
    source.subscribe("mascleta", listener);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ scenarioId: "mascleta", at: 852 }));
  });
  it("offers synchronous reads that match the async ones", async () => {
    const source = new SimulatedSource();
    expect(canPeek(source)).toBe(true);
    expect(source.peekSnapshot("maraton", 615)).toEqual(await source.getSnapshot("maraton", 615));
  });
});
