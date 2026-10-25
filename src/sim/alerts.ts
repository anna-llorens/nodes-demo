import type { NodeState } from "./engine";

export const DEFAULT_ARRIVAL_THRESHOLD = 6;

/** Arrival warnings use the same simulated snapshot as the map, strictly above the limit. */
export function arrivalDensityExceeded(state: Pick<NodeState, "density"> | undefined, threshold: number) {
  return Boolean(state && Number.isFinite(threshold) && state.density > threshold);
}