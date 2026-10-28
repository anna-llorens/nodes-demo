/**
 * Pure helpers that turn data-source results (codes, minutes, ids) into what the screens
 * show: node names, formatted times and Spanish text.
 */
import { aggregateReport, fmtClock, type DensityAlert as CoreAlert, type EventTime, type TrafficTimes } from "@nodes/core";
import type { NodeSeries } from "@nodes/data-source";
import { CSV_HEADER, suggestionLabel } from "@/labels/es";
import type { Scenario } from "@/scenarios/types";

/** An alert with the node name, formatted time and suggestion text. */
export interface DensityAlert extends Omit<CoreAlert, "suggestion"> {
  time: string;
  node: string;
  zone: string;
  suggestion?: string;
}

export function labelAlert(s: Scenario, a: CoreAlert): DensityAlert {
  const node = s.nodes.find((n) => n.id === a.nodeId);
  const { suggestion, ...rest } = a;
  return {
    ...rest,
    time: fmtClock(a.minute),
    node: node?.name ?? a.nodeId,
    zone: node?.address ?? node?.name ?? a.nodeId,
    ...(suggestion ? { suggestion: suggestionLabel[suggestion] } : {}),
  };
}

/** Traffic times when a scenario has no traffic data. */
export const NO_TRAFFIC: TrafficTimes = { waits: [], maxWait: 0, busiestId: null, avgSpeed: 0, delay: 0 };

/** Traffic times with crossing names. */
export function labelTrafficTimes(s: Scenario, times: TrafficTimes) {
  const name = (id: string | null) => s.nodes.find((n) => n.id === id)?.name ?? null;
  return { ...times, waits: times.waits.map((w) => ({ ...w, name: name(w.id) ?? w.id })), busiest: name(times.busiestId) };
}

/** Report over `[start, end]` from node series, with zone names and formatted times. */
export function buildReportView(s: Scenario, series: NodeSeries[], start: EventTime, end: EventTime) {
  const report = aggregateReport(s.schedule, series, start, end);
  const name = (id: string) => s.nodes.find((n) => n.id === id)?.name ?? id;
  const zones = report.zones.map((zone) => ({ ...zone, name: name(zone.id) }));
  return {
    ...report,
    series: report.series.map((sample) => ({ ...sample, time: fmtClock(sample.minute) })),
    zones,
    busiest: report.busiest ? zones.find((zone) => zone.id === report.busiest!.id) : undefined,
  };
}

export type ReportView = ReturnType<typeof buildReportView>;

export function reportCsv(report: ReportView) {
  return `${CSV_HEADER}\n` + report.series.map((sample) => `${sample.time};${sample.people};${sample.estimated};${sample.runners};${sample.spectators}`).join("\n");
}
