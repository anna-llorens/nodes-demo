import type { AlertLevel, Scenario, SuggestionCode } from "./types";
import { densityLevel } from "./density";
import { scenarioNodeState } from "./counts";
import { toMin, type EventTime } from "./time";

/** A density alert: the first minute a node enters a band. Carries codes only, no text. */
export interface DensityAlert {
  /** `${nodeId}-${level}`: one alert per node and band. */
  id: string;
  minute: EventTime;
  nodeId: string;
  level: AlertLevel;
  /** Node density at that minute (people/m², rounded as displayed). */
  density: number;
  /** Change over 10 minutes as a fraction. */
  variation10: number;
  suggestion?: SuggestionCode;
}

const alertCache = new WeakMap<Scenario, DensityAlert[]>();
/**
 * Density alerts of a scenario: walks every node minute by minute and raises an alert the
 * first time its density enters each band (high, very high). Deterministic and cached.
 */
export function scenarioAlerts(s: Scenario): DensityAlert[] {
  const cached = alertCache.get(s);
  if (cached) return cached;
  const out: DensityAlert[] = [];
  const start = toMin(s.schedule.start);
  const end = toMin(s.schedule.end);
  for (const node of s.nodes) {
    const entered = new Set<AlertLevel>();
    for (let m = start; m <= end; m++) {
      const state = scenarioNodeState(s, node, m);
      const level = densityLevel(state.density);
      const bands: AlertLevel[] = level === "very_high" ? ["high", "very_high"] : level === "high" ? ["high"] : [];
      for (const band of bands) {
        if (entered.has(band)) continue;
        entered.add(band);
        const suggestion = node.suggestions?.[band];
        out.push({
          id: `${node.id}-${band}`,
          minute: m,
          nodeId: node.id,
          level: band,
          density: state.density,
          variation10: state.variation10,
          ...(suggestion ? { suggestion } : {}),
        });
      }
    }
  }
  out.sort((a, b) => a.minute - b.minute || (a.level === "high" ? -1 : 1));
  alertCache.set(s, out);
  return out;
}

/** Alerts that have already happened at `minute`, most recent first. */
export function visibleAlerts(s: Scenario, minute: EventTime) {
  return scenarioAlerts(s).filter((a) => a.minute <= minute).reverse();
}
