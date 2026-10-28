export type DensityLevel = "baja" | "media" | "alta" | "muy-alta";
/** Bandas que generan alerta: alta (> 4 pers/m²) y muy alta (≥ 6, el tope). */
export type AlertLevel = "alta" | "muy-alta";

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
  /** Fracción del flujo de paso que se aleja del evento (salidas) por hora "HH:MM"; por defecto 0,5 */
  exitShare?: [string, number][];
  /** Sugerencia que acompaña a la alerta del nodo al entrar en cada banda (texto sin el prefijo "Sugerencia:") */
  suggestions?: Partial<Record<AlertLevel, string>>;
  /** Descripción breve de la zona */
  description?: string;
  /** Tipo de nodo: zona de control o punto de cruce peatonal */
  kind?: "zona" | "cruce";
  /** Ubicación legible */
  address?: string;
  /** Foto del sitio (asset importado) */
  image?: string;
}

/** Polígono aproximado de zona para la estimación extrapolada. */
export interface ScenarioZone {
  id: string;
  name: string;
  /** Anillos GeoJSON [lng, lat]: el primero es el contorno y los siguientes, huecos (p. ej. zona vallada) */
  polygon: [number, number][][];
  /** Fracción del polígono ocupada a la densidad del nodo (el nodo mide el punto más denso); por defecto 1 */
  occupancy?: number;
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
  /** Hora con la que se abre el mapa "HH:MM" (por defecto, el inicio) */
  defaultTime?: string;
  /** Abrir el mapa encuadrando todos los nodos y polígonos en lugar de usar center/zoom */
  fitToZones?: boolean;
  center: [number, number];
  zoom: number;
  route?: [number, number][];
  /** Corredores inscritos */
  participants?: number;
  /** Fuente de la cifra de inscritos, p. ej. "edición 2025" */
  participantsBasis?: string;
  /** Descripción breve del despliegue, mostrada bajo el título junto al número de nodos */
  tagline?: string;
  /** Ventana con calles cortadas por la carrera */
  closure?: { start: string; end: string };
  /** Posibles cortes de tráfico (referencia: plano oficial del Ayuntamiento; posiciones aproximadas). */
  roadClosures?: { id: string; name: string; lngLat: [number, number]; underpass?: boolean }[];
  traffic?: TrafficSegment[];
  nodes: ScenarioNode[];
  /** Polígonos de zona; cada uno se asigna al nodo más cercano para extrapolar su densidad */
  zones?: ScenarioZone[];
  /** Etiqueta de los polígonos en el mapa, p. ej. "zonas aproximadas" */
  zonesLabel?: string;
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

/** Umbrales propuestos: alta por encima de 4 pers/m²; muy alta al llegar al tope de 6 (nunca se supera). */
export const ALERT_THRESHOLDS = { alta: 4, "muy-alta": 6 } as const;

export function densityLevel(d: number): DensityLevel {
  if (d < 2) return "baja";
  if (d <= ALERT_THRESHOLDS.alta) return "media";
  if (d < ALERT_THRESHOLDS["muy-alta"]) return "alta";
  return "muy-alta";
}

/** Etiqueta obligatoria junto a cualquier cifra estimada. */
export const ESTIMATE_LABEL = "Estimación extrapolada · no medida";

export const densityLabel: Record<DensityLevel, string> = {
  baja: "Densidad baja",
  media: "Densidad media",
  alta: "Densidad alta",
  "muy-alta": "Densidad muy alta",
};

export type LiveScenario = Omit<Scenario, "nodes"> & { nodes: LiveNode[] };
