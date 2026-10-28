import type { Scenario } from "./types";
import { MAX_DENSITY } from "./density";
import { nodeState } from "./counts";
import { toMin, type EventTime } from "./time";

/** One representative runner: position along the route and heat weight. */
export interface RunnerHeatSample {
  /** Fraction of the route covered, in (0, 1). */
  progress: number;
  weight: number;
  offsetLngM: number;
  offsetLatM: number;
}

/**
 * Fixed-seed representative runners at a minute. Each starts in a wave (0–35 min) and takes
 * 70–165 min; the weight follows the density of the surrounding zone nodes.
 */
export function simulateRunnerHeat(s: Scenario, minute: EventTime): RunnerHeatSample[] {
  const zones = s.nodes.filter((node) => node.kind !== "crossing");
  const states = zones.map((node) => nodeState(node, minute));
  const start = toMin(s.schedule.start);
  const samples: RunnerHeatSample[] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) {
    const fraction = rnd();
    const offsetLngM = (rnd() - 0.5) * 16;
    const offsetLatM = (rnd() - 0.5) * 10;
    const progress = (minute - start - fraction * 35) / (70 + fraction * 95);
    if (progress <= 0 || progress >= 1) continue;
    const position = progress * Math.max(0, states.length - 1);
    const left = states[Math.floor(position)];
    const right = states[Math.min(states.length - 1, Math.floor(position) + 1)];
    const blend = position % 1;
    const density = (left?.density ?? 0) * (1 - blend) + (right?.density ?? 0) * blend;
    const pack = 0.6 + 0.4 * Math.sin(progress * Math.PI);
    const weight = Math.pow(density / MAX_DENSITY, 1.6) * 0.22 * pack;
    samples.push({ progress, weight, offsetLngM, offsetLatM });
  }
  return samples;
}
