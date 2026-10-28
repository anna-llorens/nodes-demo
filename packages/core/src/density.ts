import type { DensityLevel, ScenarioNode } from "./types";
import { interp } from "./curves";
import { noise } from "./random";

/** Maximum radius covered by a node, in metres. */
export const NODE_RADIUS_M = 20;

/** Maximum node area: a 20 m radius circle ≈ 1,257 m². */
export const MAX_NODE_AREA_M2 = Math.round(Math.PI * NODE_RADIUS_M ** 2);

/** Area of the node's coverage circle clipped to a street `streetWidthM` metres wide centred on the node. */
export function nodeAreaM2(streetWidthM: number) {
  const r = NODE_RADIUS_M;
  const h = Math.min(r, Math.max(0, streetWidthM / 2));
  return Math.round(2 * (r * r * Math.asin(h / r) + h * Math.sqrt(r * r - h * h)));
}

/** Maximum simulated density at any time (people/m²). */
export const MAX_DENSITY = 6;

/** Proposed thresholds: high above 4 people/m²; very high on reaching the cap of 6 (never exceeded). */
export const ALERT_THRESHOLDS = { high: 4, very_high: 6 } as const;

/** Density band for a density in people/m². */
export function densityLevel(d: number): DensityLevel {
  if (d < 2) return "low";
  if (d <= ALERT_THRESHOLDS.high) return "medium";
  if (d < ALERT_THRESHOLDS.very_high) return "high";
  return "very_high";
}

/** Simulated density of a node at a given minute (people/m²), with seeded noise, capped at 6. */
export function densityAt(node: ScenarioNode, min: number) {
  const d = interp(node.curve, min) * (1 + 0.04 * noise(node.id, min));
  return Math.min(MAX_DENSITY, Math.max(0, d));
}

/** Effective node area: never larger than the 20 m radius circle. */
export const nodeArea = (node: ScenarioNode) => Math.min(MAX_NODE_AREA_M2, Math.max(0, node.areaM2));
