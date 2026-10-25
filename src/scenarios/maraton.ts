import type { Scenario, TrafficSegment } from "./types";
import route from "./data/maraton-route.json";
import traffic from "./data/valencia-traffic.json";
import imgSalida from "@/assets/nodes/salida.jpg";
import imgAyto from "@/assets/nodes/ayuntamiento.jpg";
import imgAnim from "@/assets/nodes/animacion.jpg";
import imgMeta from "@/assets/nodes/meta.jpg";
import imgCruce from "@/assets/nodes/cruce.jpg";

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
      kind: "zona",
      image: imgSalida,
      address: "Inicio del recorrido",
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
      kind: "zona",
      image: imgAyto,
      address: "Plaza del Ayuntamiento, Ciutat Vella",
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
      kind: "zona",
      image: imgAnim,
      address: "Recorrido, km 10 aprox.",
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
      kind: "zona",
      image: imgMeta,
      address: "Ciudad de las Artes y las Ciencias",
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
    // Puntos de cruce peatonal (referencia: Nodes.html)
    ...([
      ["cruce1", "C01", "Metro Xàtiva", [-0.377624, 39.467814], "Paso subterráneo en la parada de metro Xàtiva.", [["08:00", 0.4], ["08:35", 2.4], ["09:00", 2.9], ["09:40", 1.8], ["10:30", 0.9], ["11:30", 0.5]]],
      ["cruce2", "C02", "C/ Colón nº 8", [-0.374165, 39.467301], "C/ Colón nº 8.", [["08:00", 0.5], ["08:40", 2.2], ["09:05", 3.1], ["09:45", 2.0], ["10:30", 1.0], ["11:30", 0.6]]],
      ["cruce3", "C03", "Colón · Puerta del Mar", [-0.369185, 39.471505], "C/ Colón con Puerta del Mar.", [["08:00", 0.4], ["08:45", 1.9], ["09:10", 2.7], ["09:50", 1.7], ["10:40", 0.8], ["11:30", 0.4]]],
      ["cruce4", "C04", "Av. Tarongers", [-0.331446, 39.475964], "Avda. de los Naranjos (Av. Tarongers), antes de la rotonda de los Cactus (esquina con C/ Lluís Peixó, a la altura del Tanatorio).", [["08:00", 0.2], ["09:00", 0.9], ["09:30", 2.3], ["10:05", 2.6], ["10:40", 1.2], ["11:30", 0.4]]],
    ] as [string, string, string, [number, number], string, [string, number][]][]).map(([id, short, name, lngLat, description, curve]) => ({
      id, short, name, lngLat, description, curve,
      kind: "cruce" as const,
      image: imgCruce,
      address: description,
      areaM2: 400,
      roadwayShare: 0.35,
      flowBearing: 0,
      turnover: 0.2,
      runnerShare: [["08:00", 0], ["08:30", 0.3], ["10:30", 0.2], ["11:30", 0]] as [string, number][],
    })),
  ],
};
