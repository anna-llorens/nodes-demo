import type { LngLat, Scenario } from "../types";
import { nodeAreaM2 } from "../density";
import { move, rect } from "../geometry";

/** Centre and axis of the square; the fenced firing area spans -89 m to +31 m along the axis. */
const PLAZA: LngLat = [-0.3763, 39.46975];
const AXIS = 15;

/**
 * Mascletà at the plaza del Ayuntamiento, simulated with the same engine.
 * Polygons are hand-drawn approximations; occupancy is the share of each polygon at the
 * density its node measures.
 */
export const mascleta: Scenario = {
  id: "mascleta",
  schedule: { start: "12:30", end: "15:30" },
  defaultTime: "14:10",
  fitToZones: true,
  center: [-0.37625, 39.4685],
  zoom: 15.6,
  nodes: [
    {
      id: "m-plaza",
      kind: "zone",
      short: "M01",
      lngLat: [-0.37635, 39.46986],
      areaM2: nodeAreaM2(40), // square: full circle
      roadwayShare: 0.7,
      flowBearing: 190,
      turnover: 0.06,
      curve: [["12:30", 0.3], ["13:00", 1.0], ["13:35", 3.36], ["13:44", 3.8], ["13:45", 4.3], ["14:00", 4.6], ["14:04", 4.8], ["14:08", 4.7], ["14:10", 3.6], ["14:12", 2.6], ["14:16", 1.4], ["14:30", 0.6], ["15:30", 0.2]],
    },
    {
      id: "m-xativa",
      kind: "zone",
      short: "M02",
      lngLat: [-0.376361, 39.467407],
      areaM2: nodeAreaM2(30),
      roadwayShare: 0.6,
      flowBearing: 100,
      turnover: 0.2,
      suggestions: { very_high: "divert_to_gran_via" },
      curve: [["12:30", 0.2], ["13:30", 2.2], ["13:46", 3.04], ["13:55", 3.8], ["13:56", 4.15], ["14:02", 4.15], ["14:05", 4.6], ["14:08", 4.8], ["14:10", 5.0], ["14:11", 5.5], ["14:12", 6.3], ["14:15", 5.6], ["14:20", 3.6], ["14:30", 1.8], ["15:00", 0.6], ["15:30", 0.3]],
      exitShare: [["12:30", 0.3], ["14:08", 0.35], ["14:10", 0.85], ["15:00", 0.8], ["15:30", 0.6]],
    },
    {
      id: "m-estacion",
      kind: "zone",
      short: "M03",
      lngLat: [-0.377371, 39.467686],
      areaM2: nodeAreaM2(40),
      roadwayShare: 0.55,
      flowBearing: 200,
      turnover: 0.2,
      curve: [["12:30", 0.2], ["13:30", 1.8], ["14:00", 3.6], ["14:05", 3.8], ["14:12", 3.8], ["14:16", 3.6], ["14:25", 2.0], ["14:40", 0.8], ["15:30", 0.3]],
      exitShare: [["12:30", 0.3], ["14:08", 0.35], ["14:10", 0.85], ["15:00", 0.8], ["15:30", 0.6]],
    },
    {
      id: "m-plaza-sur",
      kind: "zone",
      short: "M04",
      lngLat: [-0.376648, 39.469222],
      areaM2: nodeAreaM2(40), // square: full circle
      roadwayShare: 0.7,
      flowBearing: 190,
      turnover: 0.06,
      curve: [["12:30", 0.2], ["13:30", 1.5], ["14:00", 2.6], ["14:04", 2.76], ["14:10", 3.2], ["14:13", 3.8], ["14:14", 4.25], ["14:18", 4.0], ["14:25", 2.5], ["14:40", 0.8], ["15:30", 0.2]],
    },
  ],
  zones: [
    // Square without the fenced firing area (inner hole), split into north and south halves.
    { id: "plaza-norte", occupancy: 0.22, polygon: [rect(move(PLAZA, AXIS, 50), 100, 80, AXIS), rect(move(PLAZA, AXIS, 16), 30, 50, AXIS).reverse()] },
    { id: "plaza-sur", occupancy: 0.36, polygon: [rect(move(PLAZA, AXIS, -50), 100, 80, AXIS), rect(move(PLAZA, AXIS, -45), 88, 50, AXIS).reverse()] },
    { id: "san-vicente", occupancy: 0.06, polygon: [rect([-0.37625, 39.4725], 340, 10, 16)] },
    { id: "maria-cristina", occupancy: 0.06, polygon: [rect([-0.3779, 39.4715], 250, 18, 335)] },
    { id: "correos", occupancy: 0.15, polygon: [rect([-0.3753, 39.4699], 110, 20, 15)] },
    { id: "marques-sotelo", occupancy: 0.15, polygon: [rect([-0.3768, 39.46775], 140, 30, 10)] },
    { id: "san-pablo", occupancy: 0.1, polygon: [rect([-0.376, 39.468], 100, 10, 0)] },
    { id: "ribera", occupancy: 0.1, polygon: [rect([-0.3752, 39.468], 180, 10, 150)] },
    { id: "ruzafa", occupancy: 0.1, polygon: [rect([-0.3744, 39.4661], 120, 12, 175)] },
    { id: "acceso-xativa", occupancy: 0.08, polygon: [rect([-0.3758, 39.4671], 260, 25, 80)] },
    { id: "acceso-estacion", occupancy: 0.22, polygon: [rect([-0.3779, 39.4661], 120, 30, 170)] },
    { id: "acceso-gran-via", occupancy: 0.03, polygon: [rect([-0.3735, 39.463], 200, 50, 80)] },
  ],
};
