import area from "@turf/area";
import type { Scenario, ScenarioNode, TrafficSegment } from "@/scenarios/types";
import { MAX_NODE_AREA_M2, densityLevel } from "@/scenarios/types";

/** Densidad máxima permitida en cualquier momento (pers/m²). */
export const MAX_DENSITY = 6;

export interface NodeState {
  id: string;
  /** Medido: densidad × área del círculo del nodo */
  people: number;
  /** Estimación extrapolada (no medida): densidad × área de los polígonos de su zona */
  estimated: number;
  runners: number;
  spectators: number;
  roadway?: number | undefined;
  sidewalk?: number | undefined;
  density: number;
  flowIn: number;
  flowOut: number;
  speed: number; // m/s
  variation10: number; // fracción, p. ej. 0.12 = +12 %
}

export const toMin = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fmtClock = (min: number, seconds = false) => {
  const total = Math.floor(min * 60 + 1e-6);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const hm = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return seconds ? `${hm}:${String(sec).padStart(2, "0")}` : hm;
};

// Ruido determinista: hash entero -> [-1, 1]
function hash(str: string, i: number) {
  let h = 2166136261 ^ i;
  for (let k = 0; k < str.length; k++) h = Math.imul(h ^ str.charCodeAt(k), 16777619);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h ^= h >>> 13;
  return ((h >>> 0) / 4294967295) * 2 - 1;
}
function noise(id: string, min: number) {
  const i = Math.floor(min);
  const f = min - i;
  const s = f * f * (3 - 2 * f);
  return hash(id, i) * (1 - s) + hash(id, i + 1) * s;
}

function curve(node: ScenarioNode, min: number) {
  return interp(node.curve, min);
}

function interp(pts: [string, number][], min: number) {
  const k = pts as [string, number][] & { 0: [string, number] };
  if (min <= toMin(k[0][0])) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    const a = toMin(k[i - 1]![0]);
    const b = toMin(k[i]![0]);
    if (min <= b) {
      const t = (min - a) / (b - a);
      return k[i - 1]![1] + (k[i]![1] - k[i - 1]![1]) * t;
    }
  }
  return k[k.length - 1]![1];
}

export function densityAt(node: ScenarioNode, min: number) {
  const d = curve(node, min) * (1 + 0.04 * noise(node.id, min));
  return Math.min(MAX_DENSITY, Math.max(0, d));
}

/** Área efectiva del nodo: nunca mayor que el círculo de 20 m de radio. */
export const nodeArea = (node: ScenarioNode) => Math.min(MAX_NODE_AREA_M2, Math.max(0, node.areaM2));

/** personas = densidad × área de la zona */
const peopleAt = (node: ScenarioNode, min: number) => densityAt(node, min) * nodeArea(node);

const centroid = (ring: [number, number][]) => {
  const pts = ring.slice(0, -1);
  return [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length] as [number, number];
};
const distM = (a: [number, number], b: [number, number]) =>
  Math.hypot((b[0] - a[0]) * 111320 * Math.cos((a[1] * Math.PI) / 180), (b[1] - a[1]) * 111320);

const assignCache = new WeakMap<Scenario, Map<string, string>>();
/** Asigna cada polígono de zona al nodo más cercano a su centroide (id de zona → id de nodo). */
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
/** Área de extrapolación por nodo (m², @turf/area): suma de sus polígonos × ocupación, nunca menor que el círculo medido. */
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

export function nodeState(node: ScenarioNode, min: number, estimateAreaM2 = nodeArea(node)): NodeState {
  const density = densityAt(node, min);
  const people = Math.round(peopleAt(node, min));
  const estimated = Math.max(people, Math.round(density * estimateAreaM2));
  const delta = people - peopleAt(node, min - 1);
  const base = people * node.turnover;
  const exit = node.exitShare ? Math.min(1, Math.max(0, interp(node.exitShare, min))) : 0.5;
  const prev10 = peopleAt(node, min - 10);
  const share = node.runnerShare ? Math.min(1, Math.max(0, interp(node.runnerShare, min))) : 0;
  const runners = Math.round(people * share);
  return {
    id: node.id,
    people,
    estimated,
    runners,
    spectators: people - runners,
    roadway: node.roadwayShare !== undefined ? Math.round(people * node.roadwayShare) : undefined,
    sidewalk: node.roadwayShare !== undefined ? people - Math.round(people * node.roadwayShare) : undefined,
    density: Math.round(density * 10) / 10,
    flowIn: Math.round(2 * base * (1 - exit) + Math.max(delta, 0)),
    flowOut: Math.round(2 * base * exit + Math.max(-delta, 0)),
    speed: Math.round(Math.max(0.1, 1.4 * (1 - density / 7.5)) * 10) / 10,
    variation10: prev10 > 0 ? (people - prev10) / prev10 : 0,
  };
}

export function simulate(s: Scenario, min: number): NodeState[] {
  const areas = estimateAreas(s);
  return s.nodes.map((n) => nodeState(n, min, areas.get(n.id)));
}

/** Estado de un nodo con el área de extrapolación de su escenario. */
export function scenarioNodeState(s: Scenario, node: ScenarioNode, min: number) {
  return nodeState(node, min, estimateAreas(s).get(node.id));
}

/** Fixed-seed representative runners; heat responds to stage density, not just location. */
export function simulateRunnerHeat(s: Scenario, minute: number) {
  const zones = s.nodes.filter((node) => node.kind !== "cruce");
  const states = zones.map((node) => nodeState(node, minute));
  const start = toMin(s.schedule.start);
  const samples: { progress: number; weight: number; offsetLngM: number; offsetLatM: number }[] = [];
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

export interface NodeAlert { id: string; name: string; message: string }

/** Alertas activas: nodos con sugerencia configurada que están en densidad muy alta (rojo). */
export function alertsAt(s: Scenario, min: number, states = simulate(s, min)): NodeAlert[] {
  return s.nodes.flatMap((node, i) => {
    const state = states[i];
    return node.redAlert && state && densityLevel(state.density) === "muy-alta" ? [{ id: node.id, name: node.name, message: node.redAlert }] : [];
  });
}

export type TrafficLevel = 1 | 2 | 3;

const nearCache = new WeakMap<TrafficSegment, boolean>();
/** ¿El tramo está a menos de ~150 m del recorrido? */
function nearRoute(seg: TrafficSegment, route: [number, number][]) {
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
/** ¿El tramo forma parte del recorrido (mayoría de puntos a < 30 m)? */
function onRoute(seg: TrafficSegment, route: [number, number][]) {
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

/** Nivel de tráfico por tramo: 1 fluido · 2 denso · 3 congestionado (determinista).
 *  Los tramos del recorrido (calles cortadas) no se devuelven. */
export function trafficAt(s: Scenario, min: number): { id: string; level: TrafficLevel }[] {
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

export interface CrossingWait { id: string; name: string; wait: number }
export interface TrafficTimes { waits: CrossingWait[]; maxWait: number; busiest: string | null; avgSpeed: number; delay: number }

/** Tiempos de tráfico simulados: espera en cruces peatonales y velocidad/retraso medio del tráfico rodado. */
export function trafficTimesAt(s: Scenario, min: number, traffic = trafficAt(s, min)): TrafficTimes {
  const closed = s.closure ? min >= toMin(s.closure.start) && min <= toMin(s.closure.end) : false;
  const waits = s.nodes.filter((n) => n.kind === "cruce").map((n, i) => {
    const baseWait: number = [14, 11, 18, 9][i % 4] ?? 12;
    const wave = Math.sin((min + (i + 1) * 33) / 22) * 6;
    const wait = Math.max(2, Math.round(baseWait * (closed ? 1.35 : 0.5) + wave + 2 * noise(n.id, min / 5)));
    return { id: n.id, name: n.name, wait };
  });
  const max = waits.reduce<CrossingWait | null>((a, b) => (!a || b.wait > a.wait ? b : a), null);
  const speedOf = { 1: 38, 2: 22, 3: 9 } as const;
  const avgSpeed = traffic.length ? Math.round(traffic.reduce((t, x) => t + speedOf[x.level], 0) / traffic.length) : 0;
  const delay = avgSpeed ? Math.max(0, Math.round((5 / avgSpeed - 5 / 38) * 60)) : 0; // min extra en 5 km
  return { waits, maxWait: max?.wait ?? 0, busiest: max?.name ?? null, avgSpeed, delay };
}
