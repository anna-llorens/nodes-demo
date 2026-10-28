import area from "@turf/area";
import type { LngLat, Scenario } from "./types";
import { nodeArea } from "./density";

const centroid = (ring: LngLat[]) => {
  const pts = ring.slice(0, -1);
  return [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length] as LngLat;
};
const distM = (a: LngLat, b: LngLat) =>
  Math.hypot((b[0] - a[0]) * 111320 * Math.cos((a[1] * Math.PI) / 180), (b[1] - a[1]) * 111320);

const assignCache = new WeakMap<Scenario, Map<string, string>>();
/** Assigns each zone polygon to the node nearest its centroid (zone id → node id). */
export function zoneAssignments(s: Scenario) {
  const cached = assignCache.get(s);
  if (cached) return cached;
  const out = new Map<string, string>();
  for (const zone of s.zones ?? []) {
    const c = centroid(zone.polygon[0] ?? []);
    const nearest = s.nodes.reduce((best, n) => (distM(c, n.lngLat) < distM(c, best.lngLat) ? n : best));
    out.set(zone.id, nearest.id);
  }
  assignCache.set(s, out);
  return out;
}

const areaCache = new WeakMap<Scenario, Map<string, number>>();
/**
 * Extrapolation area per node (m², via `@turf/area`): the sum of its polygons × occupancy,
 * never smaller than the measured circle.
 */
export function estimateAreas(s: Scenario) {
  const cached = areaCache.get(s);
  if (cached) return cached;
  const assigned = zoneAssignments(s);
  const sums = new Map<string, number>();
  for (const zone of s.zones ?? []) {
    const id = assigned.get(zone.id)!;
    sums.set(id, (sums.get(id) ?? 0) + area({ type: "Polygon", coordinates: zone.polygon }) * (zone.occupancy ?? 1));
  }
  const out = new Map(s.nodes.map((n) => [n.id, Math.max(nodeArea(n), sums.get(n.id) ?? 0)]));
  areaCache.set(s, out);
  return out;
}
