import type { LngLat, Scenario } from "./types";

const M_PER_DEG_LAT = 111320;

/** Moves a point `eastM` metres east and `northM` metres north. */
export function offset([lng, lat]: LngLat, eastM: number, northM: number): LngLat {
  return [lng + eastM / (M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180)), lat + northM / M_PER_DEG_LAT];
}

/** Closed `lengthM` × `widthM` rectangle centred on `center`; its length follows `bearingDeg` (degrees from north). */
export function rect(center: LngLat, lengthM: number, widthM: number, bearingDeg: number): LngLat[] {
  const b = (bearingDeg * Math.PI) / 180;
  const along = [Math.sin(b), Math.cos(b)] as const;
  const across = [Math.cos(b), -Math.sin(b)] as const;
  const corner = (l: number, w: number) => offset(center, along[0] * l + across[0] * w, along[1] * l + across[1] * w);
  const l = lengthM / 2, w = widthM / 2;
  const ring = [corner(l, w), corner(l, -w), corner(-l, -w), corner(-l, w)];
  return [...ring, ring[0]!];
}

/** Bearing (degrees from north) of the route around point `i`. */
export function routeBearing(route: LngLat[], i: number, span = 3) {
  const a = route[Math.max(0, i - span)]!;
  const b = route[Math.min(route.length - 1, i + span)]!;
  const east = (b[0] - a[0]) * Math.cos((a[1] * Math.PI) / 180);
  const north = b[1] - a[1];
  return (Math.atan2(east, north) * 180) / Math.PI;
}

/** Point `m` metres from `p` along `bearingDeg` (degrees from north; negative `m` goes backwards). */
export function move(p: LngLat, bearingDeg: number, m: number): LngLat {
  const b = (bearingDeg * Math.PI) / 180;
  return offset(p, m * Math.sin(b), m * Math.cos(b));
}

/** Closed ring approximating a circle of `radiusM` metres around a point. */
export function circlePolygon([lng, lat]: LngLat, radiusM: number, steps = 64): LngLat[] {
  const out: LngLat[] = [];
  const dLat = radiusM / 111320;
  const dLng = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    out.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return out;
}

/** Bounding box `[[west, south], [east, north]]` containing every node and zone polygon. */
export function scenarioBounds(s: Pick<Scenario, "nodes" | "zones">): [LngLat, LngLat] {
  const pts = [...s.nodes.map((n) => n.lngLat), ...(s.zones ?? []).flatMap((z) => z.polygon[0] ?? [])];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]];
}

/** Cumulative distance in metres along a route, one entry per point. */
export function routeDistances(route: LngLat[]) {
  const acc: number[] = [0];
  for (let i = 1; i < route.length; i++) {
    const previous = route[i - 1];
    const current = route[i];
    if (!previous || !current) continue;
    const [x1, y1] = previous;
    const [x2, y2] = current;
    const dx = (x2 - x1) * 111320 * Math.cos((y1 * Math.PI) / 180);
    const dy = (y2 - y1) * 111320;
    acc.push((acc[i - 1] ?? 0) + Math.hypot(dx, dy));
  }
  return acc;
}

/** Point on the route `d` metres from its start, given its {@link routeDistances}. */
export function pointAt(route: LngLat[], acc: number[], d: number): LngLat {
  const total = acc[acc.length - 1] ?? 0;
  const target = Math.max(0, Math.min(total, d));
  let i = 1;
  while (i < acc.length - 1 && (acc[i] ?? 0) < target) i++;
  const a = acc[i - 1] ?? 0;
  const b = acc[i] ?? 0;
  const t = b > a ? (target - a) / (b - a) : 0;
  const [x1, y1] = route[i - 1] ?? [0, 0];
  const [x2, y2] = route[i] ?? [x1, y1];
  return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
}
