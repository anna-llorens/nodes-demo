import type { Scenario } from "./types";
import { densityLevel } from "./density";
import { nodeSeries, type SeriesPoint } from "./counts";
import { toMin, type EventTime } from "./time";

/** Totals of the selected nodes at one minute. */
export interface ReportSample { minute: EventTime; people: number; estimated: number; runners: number; spectators: number }

/** Per-node summary over the report interval. */
export interface ReportZone { id: string; peak: number; peakEstimated: number; peakMinute: EventTime; orange: number; red: number }

/** One node's minute-by-minute series, as returned by `nodeSeries` or a data source. */
export interface ReportSeries { nodeId: string; points: SeriesPoint[] }

/**
 * Aggregates node series over `[start, end]` with one-minute samples. Time in each band
 * excludes the end point so durations do not overcount. Series must cover the schedule.
 */
export function aggregateReport(schedule: Scenario["schedule"], nodes: ReportSeries[], start: EventTime, end: EventTime) {
  const first = toMin(schedule.start);
  const from = Math.max(first, start);
  const to = Math.min(toMin(schedule.end), end);
  const zones: ReportZone[] = nodes.map((node) => ({ id: node.nodeId, peak: 0, peakEstimated: 0, peakMinute: from, orange: 0, red: 0 }));
  const series: ReportSample[] = [];
  for (let minute = from; minute <= to; minute++) {
    const states = nodes.flatMap((node) => node.points[minute - first] ?? []);
    const people = states.reduce((sum, state) => sum + state.people, 0);
    const estimated = states.reduce((sum, state) => sum + state.estimated, 0);
    const runners = states.reduce((sum, state) => sum + state.runners, 0);
    series.push({ minute, people, estimated, runners, spectators: people - runners });
    for (const state of states) {
      const zone = zones.find((item) => item.id === state.id);
      if (!zone) continue;
      if (state.people > zone.peak) { zone.peak = state.people; zone.peakMinute = minute; }
      zone.peakEstimated = Math.max(zone.peakEstimated, state.estimated);
      if (minute < to) {
        const level = densityLevel(state.density);
        if (level === "high") zone.orange++;
        if (level === "very_high") zone.red++;
      }
    }
  }
  const head = series[0];
  const peak = head ? series.reduce((best, sample) => sample.people > best.people ? sample : best, head) : undefined;
  const peakEstimated = head ? series.reduce((best, sample) => sample.estimated > best.estimated ? sample : best, head) : undefined;
  const busiest = [...zones].sort((a, b) => b.peak - a.peak)[0];
  return { series, zones, peak, peakEstimated, busiest };
}

/** Report of a simulated scenario; `nodeId` limits it to one node. See {@link aggregateReport}. */
export function buildReport(scenario: Scenario, start: EventTime, end: EventTime, nodeId = "all") {
  const nodes = scenario.nodes.filter((node) => nodeId === "all" || node.id === nodeId);
  return aggregateReport(scenario.schedule, nodes.map((node) => ({ nodeId: node.id, points: nodeSeries(scenario, node) })), start, end);
}

/** Result of {@link aggregateReport}. */
export type Report = ReturnType<typeof aggregateReport>;
