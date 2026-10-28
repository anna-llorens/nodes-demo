import type { Curve, LngLat, Scenario, TrafficSegment } from "../types";
import { nodeAreaM2 } from "../density";
import { offset, rect, routeBearing } from "../geometry";
import route from "./data/maraton-route.json";
import traffic from "./data/valencia-traffic.json";

const r = route as LngLat[];
const last = r.length - 1;
/** Point `m` metres from `p` along `bearing`. */
const ahead = (p: LngLat, bearing: number, m: number) =>
  offset(p, m * Math.sin((bearing * Math.PI) / 180), m * Math.cos((bearing * Math.PI) / 180));

/**
 * Medio Maratón de València, simulated (reference: 2025 edition).
 * Real GPS route and traffic segments from the València open data portal (reference only).
 */
export const maraton: Scenario = {
  id: "maraton",
  schedule: { start: "08:00", end: "11:30" },
  defaultTime: "08:43",
  center: [-0.3726364867191023, 39.47338819057936],
  zoom: 14.353430624087817,
  route: r,
  participants: 27681,
  closure: { start: "08:15", end: "11:15" },
  roadClosures: [
    { id: "c1", lngLat: [-0.3795, 39.4888], underpass: true },
    { id: "c2", lngLat: [-0.3612, 39.4938] },
    { id: "c3", lngLat: [-0.3702, 39.4868] },
    { id: "c4", lngLat: [-0.3712, 39.4808] },
    { id: "c5", lngLat: [-0.3636, 39.4800] },
    { id: "c6", lngLat: [-0.3485, 39.4806] },
    { id: "c7", lngLat: [-0.3530, 39.4790] },
    { id: "c8", lngLat: [-0.3655, 39.4745] },
    { id: "c9", lngLat: [-0.3608, 39.4660] },
    { id: "c10", lngLat: [-0.3585, 39.4618] },
    { id: "c11", lngLat: [-0.3640, 39.4592] },
    { id: "c12", lngLat: [-0.3745, 39.4630] },
    { id: "c13", lngLat: [-0.3790, 39.4648] },
    { id: "c14", lngLat: [-0.3850, 39.4752], underpass: true },
    { id: "c15", lngLat: [-0.3925, 39.4735], underpass: true },
    { id: "c16", lngLat: [-0.3880, 39.4810] },
    { id: "c17", lngLat: [-0.3510, 39.4535] },
  ],
  traffic: traffic as TrafficSegment[],
  nodes: [
    {
      id: "salida",
      kind: "zone",
      short: "S01",
      lngLat: r[0]!,
      areaM2: nodeAreaM2(40), // wide avenue: full circle
      roadwayShare: 0.78,
      flowBearing: 290,
      turnover: 0.08,
      curve: [["08:00", 3.67], ["08:09", 3.8], ["08:10", 4.4], ["08:25", 5.2], ["08:40", 3.2], ["09:00", 1.5], ["10:00", 0.7], ["11:30", 0.3]],
      runnerShare: [["08:00", 0.8], ["08:30", 0.74], ["08:45", 0.2], ["09:00", 0.02]],
    },
    {
      id: "ayuntamiento",
      kind: "zone",
      short: "S02",
      lngLat: [-0.37635, 39.46986],
      areaM2: nodeAreaM2(40), // square: full circle
      roadwayShare: 0.62,
      flowBearing: 200,
      turnover: 0.1,
      curve: [["08:00", 1.2], ["08:30", 2.4], ["08:50", 3.2], ["09:15", 3.8], ["09:40", 3.0], ["10:10", 2.3], ["11:00", 1.2], ["11:30", 0.5]],
      runnerShare: [["08:00", 0], ["08:40", 0.55], ["09:15", 0.5], ["09:45", 0.25], ["10:15", 0.05]],
    },
    {
      id: "animacion",
      kind: "zone",
      short: "S03",
      lngLat: r[300]!,
      areaM2: nodeAreaM2(30), // ~30 m street
      roadwayShare: 0.58,
      flowBearing: 250,
      turnover: 0.08,
      curve: [["08:00", 0.8], ["08:45", 2.2], ["09:10", 3.8], ["09:40", 3.1], ["10:15", 2.6], ["11:00", 1.1], ["11:30", 0.3]],
      runnerShare: [["08:00", 0], ["09:00", 0.4], ["09:40", 0.35], ["10:20", 0.1], ["11:00", 0]],
    },
    {
      id: "meta",
      kind: "zone",
      short: "S04",
      lngLat: r[r.length - 1]!,
      areaM2: nodeAreaM2(40), // finish esplanade: full circle
      roadwayShare: 0.66,
      flowBearing: 95,
      turnover: 0.08,
      suggestions: { very_high: "open_side_exit" },
      curve: [["08:00", 1.0], ["09:00", 1.8], ["09:30", 2.8], ["09:55", 3.2], ["10:04", 3.85], ["10:05", 4.3], ["10:14", 5.6], ["10:15", 6.3], ["10:35", 6.5], ["11:00", 6.6], ["11:30", 6.8]],
      runnerShare: [["08:00", 0], ["09:05", 0.2], ["10:00", 0.5], ["10:35", 0.55], ["11:30", 0.7]],
    },
    // Pedestrian crossings; the number is the street width in metres.
    ...([
      ["cruce1", "C01", [-0.377624, 39.467814], 8, [["08:00", 0.4], ["08:35", 2.4], ["09:00", 2.9], ["09:40", 1.8], ["10:30", 0.9], ["11:30", 0.5]]],
      ["cruce2", "C02", [-0.374165, 39.467301], 22, [["08:00", 0.5], ["08:40", 2.2], ["09:05", 3.1], ["09:45", 2.0], ["10:30", 1.0], ["11:30", 0.6]]],
      ["cruce3", "C03", [-0.369185, 39.471505], 30, [["08:00", 0.4], ["08:45", 1.9], ["09:10", 2.7], ["09:50", 1.7], ["10:40", 0.8], ["11:30", 0.4]]],
      ["cruce4", "C04", [-0.331446, 39.475964], 35, [["08:00", 0.2], ["09:00", 0.9], ["09:30", 2.3], ["10:05", 2.6], ["10:40", 1.2], ["11:30", 0.4]]],
    ] as [string, string, LngLat, number, Curve][]).map(([id, short, lngLat, streetWidthM, curve]) => ({
      id, short, lngLat, curve,
      kind: "crossing" as const,
      areaM2: nodeAreaM2(streetWidthM),
      roadwayShare: 0.35,
      flowBearing: 0,
      turnover: 0.2,
      runnerShare: [["08:00", 0], ["08:30", 0.3], ["10:30", 0.2], ["11:30", 0]] as Curve,
    })),
  ],
  // Approximate zone polygons (public space around each node) for the extrapolated estimate.
  zones: [
    { id: "z-salida", polygon: [rect(ahead(r[0]!, routeBearing(r, 0, 5), -85), 170, 28, routeBearing(r, 0, 5))] },
    { id: "z-ayuntamiento", polygon: [rect(r[335]!, 180, 18, routeBearing(r, 335))] },
    { id: "z-animacion", polygon: [rect(r[300]!, 120, 20, routeBearing(r, 300))] },
    { id: "z-meta", polygon: [rect(ahead(r[last]!, routeBearing(r, last, 5), -50), 200, 30, routeBearing(r, last, 5))] },
    { id: "z-cruce1", polygon: [rect([-0.377624, 39.467814], 60, 8, 80)] },
    { id: "z-cruce2", polygon: [rect([-0.374165, 39.467301], 80, 22, 43)] },
    { id: "z-cruce3", polygon: [rect([-0.369185, 39.471505], 80, 30, 43)] },
    { id: "z-cruce4", polygon: [rect([-0.331446, 39.475964], 100, 35, 80)] },
  ],
};
