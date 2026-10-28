import type * as GeoJSON from "geojson";
import type { LiveScenario as Scenario, Scenario as BaseScenario } from "@/scenarios/types";
import { densityLevel } from "@/scenarios/types";
import { circlePolygon, pointAt, routeDistances, zoneAssignments, type RunnerHeatSample } from "@nodes/core";

export { circlePolygon, scenarioBounds } from "@nodes/core";

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

/**
 * Projects runner-heat samples onto the route. Runners not yet started or already finished
 * are not in the samples (the node heat covers them).
 */
export function runnerHeatPoints(s: BaseScenario, samples: RunnerHeatSample[]) {
  const features: GeoJSON.Feature[] = [];
  if (!s.route || s.route.length < 2) return { type: "FeatureCollection", features } as GeoJSON.FeatureCollection;
  const route = s.route;
  const acc = routeDistances(route);
  const total = acc[acc.length - 1] ?? 0;
  for (const { progress, weight, offsetLngM, offsetLatM } of samples) {
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
