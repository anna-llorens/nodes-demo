import type * as GeoJSON from "geojson";
import type { LiveScenario as Scenario } from "@/scenarios/types";

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
        properties: { w: n.snapshot.density / 7 },
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
    const [x1, y1] = route[i - 1]!;
    const [x2, y2] = route[i]!;
    const dx = (x2 - x1) * 111320 * Math.cos((y1 * Math.PI) / 180);
    const dy = (y2 - y1) * 111320;
    acc.push(acc[i - 1]! + Math.hypot(dx, dy));
  }
  return acc;
}

/** Punto del recorrido a una distancia dada (m) desde la salida. */
function pointAt(route: [number, number][], acc: number[], d: number): [number, number] {
  const total = acc[acc.length - 1]!;
  const target = Math.max(0, Math.min(total, d));
  let i = 1;
  while (i < acc.length - 1 && acc[i]! < target) i++;
  const a = acc[i - 1]!;
  const b = acc[i]!;
  const t = b > a ? (target - a) / (b - a) : 0;
  const [x1, y1] = route[i - 1]!;
  const [x2, y2] = route[i]!;
  return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
}

/**
 * Calor de los corredores sobre el recorrido en un minuto dado (determinista).
 * Cada corredor sale en una oleada (0–35 min) y tarda 70–165 min; los que aún
 * no han salido o ya han llegado no se dibujan (los cubre el calor de los nodos).
 */
export function runnerHeatPoints(s: Scenario, minute: number) {
  const features: GeoJSON.Feature[] = [];
  if (!s.route || s.route.length < 2) return { type: "FeatureCollection", features } as GeoJSON.FeatureCollection;
  const route = s.route;
  const acc = routeDistances(route);
  const total = acc[acc.length - 1]!;
  const startMin = 8 * 60; // salida 08:00
  const N = 900;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < N; i++) {
    const frac = rnd();
    const startDelay = frac * 35;
    const runTime = 70 + frac * 95;
    const progress = (minute - startMin - startDelay) / runTime;
    if (progress <= 0 || progress >= 1) continue;
    const [lng, lat] = pointAt(route, acc, progress * total);
    // Más peso en el pelotón central que en cabeza o cola
    const w = Math.max(0.15, 0.35 + 0.65 * (1 - Math.abs(progress - 0.45) * 1.4));
    const off = (rnd() - 0.5) * 16; // dispersión lateral ±8 m
    const offLat = (rnd() - 0.5) * 10;
    features.push({
      type: "Feature",
      properties: { w },
      geometry: {
        type: "Point",
        coordinates: [
          lng + off / (111320 * Math.cos((lat * Math.PI) / 180)),
          lat + offLat / 111320,
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
