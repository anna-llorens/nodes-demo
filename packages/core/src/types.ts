/** Density band of a node, from people per m². See {@link densityLevel}. */
export type DensityLevel = "low" | "medium" | "high" | "very_high";

/** Bands that raise an alert: high (> 4 people/m²) and very high (≥ 6, the cap). */
export type AlertLevel = "high" | "very_high";

/** Code of a suggestion attached to an alert. `apps/web` maps each code to its text. */
export type SuggestionCode = "divert_to_gran_via" | "open_side_exit";

/** Node role: a crowd zone, or a pedestrian crossing over the route. */
export type NodeKind = "zone" | "crossing";

/** `[longitude, latitude]` in WGS84 degrees. */
export type LngLat = [number, number];

/** A time-of-day curve: `["HH:MM", value]` points, linearly interpolated. */
export type Curve = [string, number][];

/** Configuration of one sensor node. Ids are unique across scenarios and seed the noise. */
export interface ScenarioNode {
  id: string;
  /** Short reference code shown next to the node, e.g. `"S01"`. */
  short: string;
  kind?: NodeKind;
  lngLat: LngLat;
  /** Area covered by the node in m² (at most a 20 m radius circle; see `nodeAreaM2`). */
  areaM2: number;
  /** Density curve in people/m². */
  curve: Curve;
  /** Fraction of the people in the node renewed every minute. */
  turnover: number;
  /** Fraction on the roadway (the rest is on sidewalks), estimated per zone. */
  roadwayShare?: number;
  /** Main flow direction in degrees from north. */
  flowBearing: number;
  /** Fraction of runners (the rest is public). */
  runnerShare?: Curve;
  /** Fraction of the through-flow moving away from the event (exits); defaults to 0.5. */
  exitShare?: Curve;
  /** Suggestion attached to the node's alert when it enters each band. */
  suggestions?: Partial<Record<AlertLevel, SuggestionCode>>;
}

/** Approximate zone polygon used for the extrapolated estimate. */
export interface ScenarioZone {
  id: string;
  /** GeoJSON rings `[lng, lat]`: the first is the outline, the rest are holes (e.g. a fenced area). */
  polygon: LngLat[][];
  /** Fraction of the polygon at the node's density (the node measures the densest spot); defaults to 1. */
  occupancy?: number;
}

/** Road traffic segment from the València open data portal (reference only). */
export interface TrafficSegment {
  id: string;
  /** Street name as published in the open data set. */
  name: string;
  /** Mean vehicle intensity (vehicles/h). */
  imv: number;
  coords: LngLat[];
}

/** Possible road closure (approximate position from the city's official map). */
export interface RoadClosure {
  id: string;
  lngLat: LngLat;
  underpass?: boolean;
}

/** Scenario configuration: nodes, curves, zones and schedule. Contains no user-facing text. */
export interface Scenario {
  id: string;
  schedule: { start: string; end: string };
  /** Time the map opens at, `"HH:MM"` (defaults to the start). */
  defaultTime?: string;
  /** Open the map framing every node and polygon instead of using center/zoom. */
  fitToZones?: boolean;
  center: LngLat;
  zoom: number;
  route?: LngLat[];
  /** Registered runners (real-world figure; its source is documented in `docs/`). */
  participants?: number;
  /** Window with streets closed for the event. */
  closure?: { start: string; end: string };
  roadClosures?: RoadClosure[];
  traffic?: TrafficSegment[];
  nodes: ScenarioNode[];
  /** Zone polygons; each is assigned to its nearest node to extrapolate that node's density. */
  zones?: ScenarioZone[];
}
