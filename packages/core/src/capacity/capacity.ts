/**
 * Capacity and crowd density calculator: CTE DB-SI 3 occupancy capacity, exit width and
 * crowd risk levels. Pure functions; values and their sources live in capacity-data.json.
 *
 * These levels are a separate scale from the simulator's density bands (density.ts).
 * Red lines come from EIAI (5 people/m² standing, 3 moving) and HSE Blog (serious risk from
 * about 4). The intermediate thresholds (2 in both modes) are a NODES proposal to validate.
 */
import data from "./capacity-data.json";

export type CrowdMode = "standing" | "moving";
export type CrowdLevel = "normal" | "attention" | "serious" | "critical";
export type CapacityZone = { id: string; m2PerPerson: number; source: string };
export type CrowdLevelBand = { id: CrowdLevel; below: number | null; source: string };

export const CAPACITY_ZONES: readonly CapacityZone[] = data.zones;
export const CROWD_LEVELS: Readonly<Record<CrowdMode, readonly CrowdLevelBand[]>> = data.levels as Record<CrowdMode, CrowdLevelBand[]>;
/** Density used for "people until the threshold": serious risk standing, red line moving. */
export const CROWD_THRESHOLDS: Readonly<Record<CrowdMode, number>> = data.thresholds;
export const CAPACITY_SOURCES: Readonly<Record<string, string | null>> = data.sources;
/** Exit width rule A ≥ P / 200, in metres. */
export const PEOPLE_PER_EXIT_METRE = 200;

export const findCapacityZone = (id: string): CapacityZone | undefined => CAPACITY_ZONES.find((zone) => zone.id === id);

/** Maximum occupants of `m2` at the given occupancy density (m² per person), rounded down. */
export const capacity = (m2: number, m2PerPerson: number): number => Math.floor(m2 / m2PerPerson);

/** People per m². */
export const density = (people: number, m2: number): number => people / m2;

/** Total exit width in metres for `people` occupants (P / 200). */
export const exitWidth = (people: number): number => people / PEOPLE_PER_EXIT_METRE;

/** Risk level code for a density; each band's upper limit is exclusive. */
export const crowdLevel = (value: number, mode: CrowdMode): CrowdLevel =>
  CROWD_LEVELS[mode].find((band) => band.below === null || value < band.below)!.id;

/** People that fit in `m2` before reaching `threshold` people/m², rounded down. */
export const capacityUntil = (m2: number, threshold: number): number => Math.floor(m2 * threshold);
