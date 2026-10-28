import type { LngLat, Scenario, TrafficSegment } from "./types";
import { noise } from "./random";
import { toMin, type EventTime } from "./time";

/** Traffic level of a segment: 1 flowing · 2 dense · 3 congested. */
export type TrafficLevel = 1 | 2 | 3;

const nearCache = new WeakMap<TrafficSegment, boolean>();
/** Is the segment within ~150 m of the route? */
function nearRoute(seg: TrafficSegment, route: LngLat[]) {
  const c = nearCache.get(seg);
  if (c !== undefined) return c;
  const lim = 150 / 111320;
  const near = seg.coords.some(([x, y]) =>
    route.some(([rx, ry]) => Math.abs(rx - x) * 0.77 < lim && Math.abs(ry - y) < lim),
  );
  nearCache.set(seg, near);
  return near;
}

const onCache = new WeakMap<TrafficSegment, boolean>();
/** Is the segment part of the route (most of its points within ~30 m)? */
function onRoute(seg: TrafficSegment, route: LngLat[]) {
  const c = onCache.get(seg);
  if (c !== undefined) return c;
  const lim = 40 / 111320;
  const hits = seg.coords.filter(([x, y]) =>
    route.some(([rx, ry]) => Math.abs(rx - x) * 0.77 < lim && Math.abs(ry - y) < lim),
  ).length;
  const on = hits / Math.max(1, seg.coords.length) >= 0.5;
  onCache.set(seg, on);
  return on;
}

/** Deterministic traffic level per segment. Segments on the route (closed streets) are left out. */
export function trafficAt(s: Scenario, min: EventTime): { id: string; level: TrafficLevel }[] {
  if (!s.traffic) return [];
  const closed = s.closure ? min >= toMin(s.closure.start) && min <= toMin(s.closure.end) : false;
  return s.traffic.filter((seg) => !(s.route && onRoute(seg, s.route))).map((seg) => {
    let load = seg.imv > 0 ? seg.imv / 3000 : 0.32;
    if (closed && s.route && nearRoute(seg, s.route)) load += 0.65;
    else if (closed) load += 0.12;
    load += 0.06 * noise(seg.id, min / 6);
    const level: TrafficLevel = load >= 0.9 ? 3 : load >= 0.58 ? 2 : 1;
    return { id: seg.id, level };
  });
}

/** Simulated wait, in minutes, to cross the route at a crossing node. */
export interface CrossingWait { id: string; wait: number }

/** Simulated traffic times: crossing waits and mean road speed and delay. */
export interface TrafficTimes {
  waits: CrossingWait[];
  maxWait: number;
  /** Crossing node with the longest wait. */
  busiestId: string | null;
  /** Mean road speed in km/h. */
  avgSpeed: number;
  /** Extra minutes over 5 km compared with free flow. */
  delay: number;
}

/** Simulated traffic times at a minute. */
export function trafficTimesAt(s: Scenario, min: EventTime, traffic = trafficAt(s, min)): TrafficTimes {
  const closed = s.closure ? min >= toMin(s.closure.start) && min <= toMin(s.closure.end) : false;
  const waits = s.nodes.filter((n) => n.kind === "crossing").map((n, i) => {
    const baseWait: number = [14, 11, 18, 9][i % 4] ?? 12;
    const wave = Math.sin((min + (i + 1) * 33) / 22) * 6;
    const wait = Math.max(2, Math.round(baseWait * (closed ? 1.35 : 0.5) + wave + 2 * noise(n.id, min / 5)));
    return { id: n.id, wait };
  });
  const max = waits.reduce<CrossingWait | null>((a, b) => (!a || b.wait > a.wait ? b : a), null);
  const speedOf = { 1: 38, 2: 22, 3: 9 } as const;
  const avgSpeed = traffic.length ? Math.round(traffic.reduce((t, x) => t + speedOf[x.level], 0) / traffic.length) : 0;
  const delay = avgSpeed ? Math.max(0, Math.round((5 / avgSpeed - 5 / 38) * 60)) : 0;
  return { waits, maxWait: max?.wait ?? 0, busiestId: max?.id ?? null, avgSpeed, delay };
}
