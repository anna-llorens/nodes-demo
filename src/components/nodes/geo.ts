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
    features: (s.traffic ?? []).map((seg) => ({
      type: "Feature",
      properties: { id: seg.id, name: seg.name, level: byId.get(seg.id) ?? 1 },
      geometry: { type: "LineString", coordinates: seg.coords },
    })),
  } as GeoJSON.FeatureCollection;
}
