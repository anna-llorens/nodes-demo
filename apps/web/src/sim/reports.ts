import type { Scenario } from "@/scenarios/types";
import { densityLevel } from "@/scenarios/types";
import { fmtClock, simulate, toMin } from "./engine";

/** One-minute samples; durations exclude the end point to avoid double counting. */
export function buildReport(scenario: Scenario, start: number, end: number, nodeId = "all") {
  const from = Math.max(toMin(scenario.schedule.start), start);
  const to = Math.min(toMin(scenario.schedule.end), end);
  const nodes = scenario.nodes.filter((node) => nodeId === "all" || node.id === nodeId);
  const ids = new Set(nodes.map((node) => node.id));
  const zones = nodes.map((node) => ({ id: node.id, name: node.name, peak: 0, peakEstimated: 0, peakMinute: from, orange: 0, red: 0 }));
  const series = [];
  for (let minute = from; minute <= to; minute++) {
    const states = simulate(scenario, minute).filter((state) => ids.has(state.id));
    const people = states.reduce((sum, state) => sum + state.people, 0);
    const estimated = states.reduce((sum, state) => sum + state.estimated, 0);
    const runners = states.reduce((sum, state) => sum + state.runners, 0);
    series.push({ minute, time: fmtClock(minute), people, estimated, runners, spectators: people - runners });
    for (const state of states) {
      const zone = zones.find((item) => item.id === state.id);
      if (!zone) continue;
      if (state.people > zone.peak) { zone.peak = state.people; zone.peakMinute = minute; }
      zone.peakEstimated = Math.max(zone.peakEstimated, state.estimated);
      if (minute < to) {
        const level = densityLevel(state.density);
        if (level === "alta") zone.orange++;
        if (level === "muy-alta") zone.red++;
      }
    }
  }
  const first = series[0];
  const peak = first ? series.reduce((best, sample) => sample.people > best.people ? sample : best, first) : undefined;
  const peakEstimated = first ? series.reduce((best, sample) => sample.estimated > best.estimated ? sample : best, first) : undefined;
  const busiest = [...zones].sort((a, b) => b.peak - a.peak)[0];
  return { series, zones, peak, peakEstimated, busiest };
}

export function reportCsv(report: ReturnType<typeof buildReport>) {
  return "Hora;Personas medidas;Personas estimadas (estimación extrapolada · no medida);Corredores;Público\n" + report.series.map((sample) => `${sample.time};${sample.people};${sample.estimated};${sample.runners};${sample.spectators}`).join("\n");
}