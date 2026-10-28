import { buildReport as coreBuildReport, fmtClock, type EventTime } from "@nodes/core";
import { CSV_HEADER } from "@/labels/es";
import type { Scenario } from "@/scenarios/types";

/** Core report with zone names and formatted times for the screens and the CSV. */
export function buildReport(scenario: Scenario, start: EventTime, end: EventTime, nodeId = "all") {
  const report = coreBuildReport(scenario, start, end, nodeId);
  const name = (id: string) => scenario.nodes.find((n) => n.id === id)?.name ?? id;
  const zones = report.zones.map((zone) => ({ ...zone, name: name(zone.id) }));
  return {
    ...report,
    series: report.series.map((sample) => ({ ...sample, time: fmtClock(sample.minute) })),
    zones,
    busiest: report.busiest ? zones.find((zone) => zone.id === report.busiest!.id) : undefined,
  };
}

export function reportCsv(report: ReturnType<typeof buildReport>) {
  return `${CSV_HEADER}\n` + report.series.map((sample) => `${sample.time};${sample.people};${sample.estimated};${sample.runners};${sample.spectators}`).join("\n");
}
