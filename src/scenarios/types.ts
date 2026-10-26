export type DensityLevel = "baja" | "media" | "alta" | "muy-alta";

export interface ScenarioNode {
  id: string;
  name: string;
  short: string;
  lngLat: [number, number];
  /** Área cubierta por el nodo, en m² (máx. círculo de 20 m de radio; ver nodeAreaM2) */
  areaM2: number;
  /** Curva de densidad (pers/m²) por hora "HH:MM" */
  curve: [string, number][];
  /** Fracción de personas que se renueva cada minuto */
  turnover: number;
  /** Parte en calzada (resto en aceras), estimado por zona */
  roadwayShare?: number;
  /** Dirección principal del flujo en grados */
  flowBearing: number;
  /** Fracción de corredores (resto público) por hora "HH:MM" */
  runnerShare?: [string, number][];
  /** Descripción breve de la zona */
  description?: string;
  /** Tipo de nodo: zona de control o punto de cruce peatonal */
  kind?: "zona" | "cruce";
  /** Ubicación legible */
  address?: string;
  /** Foto del sitio (asset importado) */
  image?: string;
}

export interface LiveNode extends ScenarioNode {
  snapshot: import("@/sim/engine").NodeState;
}

export interface TrafficSegment {
  id: string;
  name: string;
  /** Intensidad media de vehículos (veh/h) del portal de datos abiertos */
  imv: number;
  coords: [number, number][];
}

export interface Scenario {
  id: string;
  name: string;
  shortName: string;
  schedule: { start: string; end: string };
  center: [number, number];
  zoom: number;
  route?: [number, number][];
  /** Corredores inscritos */
  participants?: number;
  /** Ventana con calles cortadas por la carrera */
  closure?: { start: string; end: string };
  /** Posibles cortes de tráfico (referencia: plano oficial del Ayuntamiento; posiciones aproximadas). */
  roadClosures?: { id: string; name: string; lngLat: [number, number]; underpass?: boolean }[];
  traffic?: TrafficSegment[];
  nodes: ScenarioNode[];
}

/** Radio máximo de cobertura de un nodo (m). */
export const NODE_RADIUS_M = 20;
/** Área máxima de un nodo: círculo de 20 m de radio ≈ 1.257 m². */
export const MAX_NODE_AREA_M2 = Math.round(Math.PI * NODE_RADIUS_M ** 2);

/** Área del círculo de cobertura recortado a una calle de `streetWidthM` metros centrada en el nodo. */
export function nodeAreaM2(streetWidthM: number) {
  const r = NODE_RADIUS_M;
  const h = Math.min(r, Math.max(0, streetWidthM / 2));
  return Math.round(2 * (r * r * Math.asin(h / r) + h * Math.sqrt(r * r - h * h)));
}

export function densityLevel(d: number): DensityLevel {
  if (d < 2) return "baja";
  if (d < 4) return "media";
  if (d <= 6) return "alta";
  return "muy-alta";
}

export const densityLabel: Record<DensityLevel, string> = {
  baja: "Densidad baja",
  media: "Densidad media",
  alta: "Densidad alta",
  "muy-alta": "Densidad muy alta",
};

export type LiveScenario = Omit<Scenario, "nodes"> & { nodes: LiveNode[] };
