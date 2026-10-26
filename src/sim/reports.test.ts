import { describe, expect, it } from "vitest";
import { maraton } from "@/scenarios/maraton";
import { densityAt, simulate, toMin } from "./engine";
import { buildReport, reportCsv } from "./reports";

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
  it("totals and CSV sum density × area over covered zones", () => {
    const minute = toMin("11:00");
    const report = buildReport(maraton, minute, minute);
    const expected = maraton.nodes.reduce((sum, node) => sum + Math.round(densityAt(node, minute) * node.areaM2), 0);
    expect(report.series[0]?.people).toBe(expected);
    expect(expected).toBeLessThanOrEqual(maraton.nodes.reduce((sum, node) => sum + 6 * node.areaM2, 0));
    expect(reportCsv(report)).toContain(`11:00;${expected};`);
  });
  it("exports counts with runners and public kept separate", () => {
    const report = buildReport(maraton, 615, 615);
    const row = report.series[0];
    expect(row?.people).toBe((row?.runners ?? 0) + (row?.spectators ?? 0));
    expect(reportCsv(report)).toContain(`10:15;${row?.people};${row?.runners};${row?.spectators}`);
  });
});