import { describe, expect, it } from "vitest";
import { buildReport, densityAt, maraton, simulate, toMin } from "../src";

describe("simulation reports", () => {
  it("reads the selected node and interval from the engine", () => {
    const minute = toMin("10:15");
    const report = buildReport(maraton, minute, minute + 10, "meta");
    const state = simulate(maraton, minute).find((item) => item.id === "meta");
    expect(report.series).toHaveLength(11);
    expect(report.series[0]?.people).toBe(state?.people);
    expect(report.zones.map((zone) => zone.id)).toEqual(["meta"]);
    expect(report.zones[0]?.orange).toBeLessThanOrEqual(10);
  });
  it("sums density × area over covered zones", () => {
    const minute = toMin("11:00");
    const report = buildReport(maraton, minute, minute);
    const expected = maraton.nodes.reduce((sum, node) => sum + Math.round(densityAt(node, minute) * node.areaM2), 0);
    expect(report.series[0]?.people).toBe(expected);
    expect(expected).toBeLessThanOrEqual(maraton.nodes.reduce((sum, node) => sum + 6 * node.areaM2, 0));
  });
  it("keeps runners and public separate", () => {
    const row = buildReport(maraton, 615, 615).series[0];
    expect(row?.people).toBe((row?.runners ?? 0) + (row?.spectators ?? 0));
  });
});

describe("aggregateReport", () => {
  it("gives the same report from node series as from the simulator", async () => {
    const { aggregateReport, nodeSeries } = await import("../src");
    const series = maraton.nodes.map((node) => ({ nodeId: node.id, points: nodeSeries(maraton, node) }));
    expect(aggregateReport(maraton.schedule, series, toMin("09:00"), toMin("10:30"))).toEqual(buildReport(maraton, toMin("09:00"), toMin("10:30")));
  });
  it("covers every whole minute of the schedule in a node series", async () => {
    const { nodeSeries } = await import("../src");
    const points = nodeSeries(maraton, maraton.nodes[0]!);
    expect(points).toHaveLength(toMin("11:30") - toMin("08:00") + 1);
    expect(points[15]).toEqual({ minute: toMin("08:15"), ...simulate(maraton, toMin("08:15"))[0] });
  });
});
