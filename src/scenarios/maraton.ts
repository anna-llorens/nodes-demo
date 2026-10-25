import type { Scenario, TrafficSegment } from "./types";
import route from "./data/maraton-route.json";
import traffic from "./data/valencia-traffic.json";

const r = route as [number, number][];

/**
 * Medio Maratón de València · simulación (referencia edición 2025).
 * Recorrido GPS real y tramos de tráfico del portal de datos abiertos de València (solo referencia).
 */
export const maraton: Scenario = {
  id: "maraton",
  name: "Medio Maratón de València",
  shortName: "Medio Maratón",
  schedule: { start: "08:00", end: "11:30" },
  center: [-0.358, 39.472],
  zoom: 13,
  route: r,
  participants: 30000,
  closure: { start: "08:15", end: "11:15" },
  traffic: traffic as TrafficSegment[],
  nodes: [
    {
      id: "salida",
      name: "Salida",
      short: "S01",
      lngLat: r[0]!,
      areaM2: 6000,
      roadwayShare: 0.78,
      flowBearing: 290,
      turnover: 0.08,
      description: "Cajones de salida y acompañantes.",
      curve: [["08:00", 3.0], ["08:25", 5.4], ["08:40", 2.2], ["09:00", 0.7], ["10:00", 0.4], ["11:30", 0.3]],
      runnerShare: [["08:00", 0.85], ["08:30", 0.8], ["08:45", 0.2], ["09:00", 0.02]],
    },
    {
      id: "ayuntamiento",
      name: "Plaza del Ayuntamiento",
      short: "S02",
      lngLat: [-0.37635, 39.46986],
      areaM2: 3000,
      roadwayShare: 0.62,
      flowBearing: 200,
      turnover: 0.1,
      description: "Paso por el centro con mucho público animando.",
      curve: [["08:00", 0.6], ["08:30", 1.2], ["08:50", 3.6], ["09:15", 4.0], ["09:40", 2.6], ["10:10", 1.4], ["11:00", 0.7], ["11:30", 0.5]],
      runnerShare: [["08:00", 0], ["08:40", 0.55], ["09:15", 0.5], ["09:45", 0.25], ["10:15", 0.05]],
    },
    {
      id: "animacion",
      name: "Punto de animación",
      short: "S03",
      lngLat: r[300]!,
      areaM2: 2500,
      roadwayShare: 0.58,
      flowBearing: 250,
      turnover: 0.08,
      description: "Zona de música y animación en el recorrido.",
      curve: [["08:00", 0.4], ["08:45", 1.4], ["09:10", 3.2], ["09:40", 2.7], ["10:15", 1.7], ["11:00", 0.6], ["11:30", 0.3]],
      runnerShare: [["08:00", 0], ["09:00", 0.4], ["09:40", 0.35], ["10:20", 0.1], ["11:00", 0]],
    },
    {
      id: "meta",
      name: "Meta · reencuentro",
      short: "S04",
      lngLat: r[r.length - 1]!,
      areaM2: 6000,
      roadwayShare: 0.66,
      flowBearing: 95,
      turnover: 0.08,
      description: "Llegada de corredores y reencuentro con familias.",
      curve: [["08:00", 0.5], ["09:00", 1.1], ["09:30", 2.1], ["10:00", 3.4], ["10:12", 4.4], ["10:35", 5.6], ["11:00", 3.6], ["11:30", 1.5]],
      runnerShare: [["08:00", 0], ["09:05", 0.2], ["10:00", 0.55], ["10:35", 0.6], ["11:30", 0.4]],
    },
  ],
};
