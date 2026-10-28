import type * as GeoJSON from "geojson";
import type { LiveScenario as Scenario, Scenario as BaseScenario } from "@/scenarios/types";
import { densityLevel } from "@/scenarios/types";
import { simulateRunnerHeat, zoneAssignments } from "@/sim/engine";

export function circlePolygon([lng, lat]: [number, number], radiusM: number, steps = 64): [number, number][] {
  const out: [number, number][] = [];
  const dLat = radiusM / 111320;
  const dLng = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    out.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return out;
}

/** Puntos deterministas alrededor de cada nodo para el mapa de calor (semilla fija). */
export function heatPoints(s: Scenario) {
  let seed = 42;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const features: GeoJSON.Feature[] = [];
  for (const n of s.nodes) {
    for (let i = 0; i < 40; i++) {
      const r = Math.sqrt(rnd()) * 45;
      const a = rnd() * Math.PI * 2;
      const [lng, lat] = n.lngLat;
      features.push({
        type: "Feature",
        properties: { w: Math.pow(n.snapshot.density / 7, 1.6) * 0.4 },
        geometry: {
          type: "Point",
          coordinates: [
            lng + (r * Math.cos(a)) / (111320 * Math.cos((lat * Math.PI) / 180)),
            lat + (r * Math.sin(a)) / 111320,
          ],
        },
      });
    }
  }
  return { type: "FeatureCollection", features } as GeoJSON.FeatureCollection;
}

/** Distancia acumulada (m) a lo largo del recorrido. */
function routeDistances(route: [number, number][]) {
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

/** Punto del recorrido a una distancia dada (m) desde la salida. */
function pointAt(route: [number, number][], acc: number[], d: number): [number, number] {
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

/**
 * Calor de los corredores sobre el recorrido en un minuto dado (determinista).
 * Cada corredor sale en una oleada (0–35 min) y tarda 70–165 min; los que aún
 * no han salido o ya han llegado no se dibujan (los cubre el calor de los nodos).
 */
export function runnerHeatPoints(s: BaseScenario, minute: number) {
  const features: GeoJSON.Feature[] = [];
  if (!s.route || s.route.length < 2) return { type: "FeatureCollection", features } as GeoJSON.FeatureCollection;
  const route = s.route;
  const acc = routeDistances(route);
  const total = acc[acc.length - 1] ?? 0;
  for (const { progress, weight, offsetLngM, offsetLatM } of simulateRunnerHeat(s, minute)) {
    const [lng, lat] = pointAt(route, acc, progress * total);
    features.push({
      type: "Feature",
      properties: { w: weight },
      geometry: {
        type: "Point",
        coordinates: [
          lng + offsetLngM / (111320 * Math.cos((lat * Math.PI) / 180)),
          lat + offsetLatM / 111320,
        ],
      },
    });
  }
  return { type: "FeatureCollection", features } as GeoJSON.FeatureCollection;
}

export function ringsGeo(s: Scenario, radius: number) {
  return {
    type: "FeatureCollection",
    features: s.nodes.map((n) => ({
      type: "Feature",
      properties: { id: n.id },
      geometry: { type: "LineString", coordinates: circlePolygon(n.lngLat, radius) },
    })),
  } as GeoJSON.FeatureCollection;
}

/** Polígonos de zona con el nivel de densidad del nodo al que están asignados. */
export function zonesGeo(s: Scenario) {
  const assigned = zoneAssignments(s);
  const byId = new Map(s.nodes.map((n) => [n.id, n]));
  return {
    type: "FeatureCollection",
    features: (s.zones ?? []).map((zone) => {
      const node = byId.get(assigned.get(zone.id) ?? "");
      return {
        type: "Feature",
        properties: { id: zone.id, name: zone.name, node: node?.id ?? "", level: densityLevel(node?.snapshot.density ?? 0) },
        geometry: { type: "Polygon", coordinates: zone.polygon },
      };
    }),
  } as GeoJSON.FeatureCollection;
}

/** Recuadro [[oeste, sur], [este, norte]] que contiene todos los nodos y polígonos del escenario. */
export function scenarioBounds(s: BaseScenario): [[number, number], [number, number]] {
  const pts = [...s.nodes.map((n) => n.lngLat), ...(s.zones ?? []).flatMap((z) => z.polygon[0] ?? [])];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]];
}

export function trafficGeo(s: Scenario, levels: { id: string; level: number }[]) {
  const byId = new Map(levels.map((l) => [l.id, l.level]));
  return {
    type: "FeatureCollection",
    features: (s.traffic ?? []).filter((seg) => byId.has(seg.id)).map((seg) => ({
      type: "Feature",
      properties: { id: seg.id, name: seg.name, level: byId.get(seg.id) ?? 1 },
      geometry: { type: "LineString", coordinates: seg.coords },
    })),
  } as GeoJSON.FeatureCollection;
}
