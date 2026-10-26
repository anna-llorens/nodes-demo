import type { Scenario } from "./types";
import { nodeAreaM2 } from "./types";
import { rect } from "./shapes";
import imgPlaza from "@/assets/mascleta.jpg";

/**
 * Mascletà en la plaza del Ayuntamiento · simulación con el mismo motor.
 * Polígonos dibujados a mano sobre el plano (aproximados); la ocupación indica
 * qué parte de cada polígono está a la densidad que mide su nodo.
 */
export const mascleta: Scenario = {
  id: "mascleta",
  name: "Mascletà · plaza del Ayuntamiento · simulación",
  shortName: "Mascletà",
  schedule: { start: "12:30", end: "15:30" },
  defaultTime: "14:10",
  fitToZones: true,
  center: [-0.37625, 39.4685],
  zoom: 15.6,
  nodes: [
    {
      id: "m-plaza",
      kind: "zona",
      image: imgPlaza,
      address: "Plaça de l'Ajuntament",
      name: "Plaza del Ayuntamiento",
      short: "M01",
      lngLat: [-0.37635, 39.46986],
      areaM2: nodeAreaM2(40), // plaza: círculo completo
      roadwayShare: 0.7,
      flowBearing: 190,
      turnover: 0.06,
      description: "Público alrededor de la zona de disparo vallada.",
      curve: [["12:30", 0.3], ["13:00", 0.8], ["13:30", 2.0], ["13:50", 3.6], ["14:00", 4.7], ["14:04", 4.9], ["14:08", 4.8], ["14:10", 3.9], ["14:12", 2.6], ["14:16", 1.4], ["14:30", 0.6], ["15:30", 0.2]],
    },
    {
      id: "m-xativa",
      kind: "zona",
      image: imgPlaza,
      address: "Carrer de Xàtiva",
      name: "Calle Xàtiva",
      short: "M02",
      lngLat: [-0.375, 39.4671],
      areaM2: nodeAreaM2(30),
      roadwayShare: 0.6,
      flowBearing: 100,
      turnover: 0.2,
      description: "Acceso y salida principal hacia el sur y el este.",
      redAlert: "Sugerencia: desviar flujo hacia Gran Vía",
      curve: [["12:30", 0.2], ["13:30", 1.4], ["14:00", 2.8], ["14:08", 3.0], ["14:10", 4.4], ["14:12", 5.8], ["14:15", 5.2], ["14:20", 3.2], ["14:30", 1.5], ["15:00", 0.6], ["15:30", 0.3]],
      exitShare: [["12:30", 0.3], ["14:08", 0.35], ["14:10", 0.85], ["15:00", 0.8], ["15:30", 0.6]],
    },
    {
      id: "m-estacion",
      kind: "zona",
      image: imgPlaza,
      address: "Estació del Nord · Carrer de Xàtiva",
      name: "Estación del Norte",
      short: "M03",
      lngLat: [-0.3775, 39.4664],
      areaM2: nodeAreaM2(40),
      roadwayShare: 0.55,
      flowBearing: 200,
      turnover: 0.2,
      description: "Salida hacia la estación y el metro Xàtiva.",
      curve: [["12:30", 0.2], ["13:30", 1.2], ["14:00", 2.4], ["14:08", 2.6], ["14:12", 3.4], ["14:16", 3.6], ["14:25", 2.0], ["14:40", 0.8], ["15:30", 0.3]],
      exitShare: [["12:30", 0.3], ["14:08", 0.35], ["14:10", 0.85], ["15:00", 0.8], ["15:30", 0.6]],
    },
    {
      id: "m-granvia",
      kind: "zona",
      image: imgPlaza,
      address: "Gran Via de les Germanies · Russafa",
      name: "Gran Vía de les Germanies",
      short: "M04",
      lngLat: [-0.374, 39.4632],
      areaM2: nodeAreaM2(50),
      roadwayShare: 0.5,
      flowBearing: 90,
      turnover: 0.15,
      description: "Avenida amplia; ruta alternativa de salida.",
      curve: [["12:30", 0.1], ["13:30", 0.8], ["14:00", 1.6], ["14:08", 1.7], ["14:14", 2.4], ["14:20", 2.8], ["14:30", 1.8], ["15:00", 0.6], ["15:30", 0.2]],
      exitShare: [["12:30", 0.3], ["14:08", 0.35], ["14:10", 0.7], ["15:30", 0.6]],
    },
  ],
  zonesLabel: "zonas aproximadas",
  zones: [
    // Plaza sin la zona de disparo vallada (hueco interior).
    { id: "plaza", name: "Plaza del Ayuntamiento", occupancy: 0.2, polygon: [rect([-0.3763, 39.46975], 200, 80, 15), rect([-0.3764, 39.4695], 120, 50, 15).reverse()] },
    { id: "san-vicente", name: "San Vicente hasta calle de la Paz", occupancy: 0.1, polygon: [rect([-0.37625, 39.4725], 340, 10, 16)] },
    { id: "maria-cristina", name: "Av. María Cristina", occupancy: 0.1, polygon: [rect([-0.3779, 39.4715], 250, 18, 335)] },
    { id: "correos", name: "Frente a Correos", occupancy: 0.2, polygon: [rect([-0.3753, 39.4699], 110, 20, 15)] },
    { id: "marques-sotelo", name: "Av. Marqués de Sotelo", occupancy: 0.15, polygon: [rect([-0.3768, 39.46775], 140, 30, 10)] },
    { id: "san-pablo", name: "Calle San Pablo", occupancy: 0.1, polygon: [rect([-0.376, 39.468], 100, 10, 0)] },
    { id: "ribera", name: "Calle Ribera", occupancy: 0.1, polygon: [rect([-0.3752, 39.468], 180, 10, 150)] },
    { id: "ruzafa", name: "Inicio de Ruzafa", occupancy: 0.1, polygon: [rect([-0.3744, 39.4661], 120, 12, 175)] },
    { id: "acceso-xativa", name: "Acceso Xàtiva", occupancy: 0.12, polygon: [rect([-0.3758, 39.4671], 260, 25, 80)] },
    { id: "acceso-estacion", name: "Acceso Estación del Norte", occupancy: 0.25, polygon: [rect([-0.3779, 39.4661], 120, 30, 170)] },
    { id: "acceso-gran-via", name: "Acceso Gran Vía", occupancy: 0.15, polygon: [rect([-0.3735, 39.463], 200, 50, 80)] },
  ],
};
