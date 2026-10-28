import type { Scenario } from "./types";
import { densityLevel } from "./density";
import { simulate } from "./counts";
import { toMin, type EventTime } from "./time";

/** Totals of the selected nodes at one minute. */
export interface ReportSample { minute: EventTime; people: number; estimated: number; runners: number; spectators: number }

/** Per-node summary over the report interval. */
export interface ReportZone { id: string; peak: number; peakEstimated: number; peakMinute: EventTime; orange: number; red: number }

/**
 * Aggregates a scenario over `[start, end]` with one-minute samples. Time in each band
 * excludes the end point so durations do not overcount. `nodeId` limits it to one node.
 */
export function buildReport(scenario: Scenario, start: EventTime, end: EventTime, nodeId = "all") {
  const from = Math.max(toMin(scenario.schedule.start), start);
  const to = Math.min(toMin(scenario.schedule.end), end);
  const nodes = scenario.nodes.filter((node) => nodeId === "all" || node.id === nodeId);
  const ids = new Set(nodes.map((node) => node.id));
  const zones: ReportZone[] = nodes.map((node) => ({ id: node.id, peak: 0, peakEstimated: 0, peakMinute: from, orange: 0, red: 0 }));
  const series: ReportSample[] = [];
  for (let minute = from; minute <= to; minute++) {
    const states = simulate(scenario, minute).filter((state) => ids.has(state.id));
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
  const first = series[0];
  const peak = first ? series.reduce((best, sample) => sample.people > best.people ? sample : best, first) : undefined;
  const peakEstimated = first ? series.reduce((best, sample) => sample.estimated > best.estimated ? sample : best, first) : undefined;
  const busiest = [...zones].sort((a, b) => b.peak - a.peak)[0];
  return { series, zones, peak, peakEstimated, busiest };
}

/** Result of {@link buildReport}. */
export type Report = ReturnType<typeof buildReport>;
