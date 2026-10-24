export type DensityLevel = "baja" | "media" | "alta" | "muy-alta";

export interface ScenarioNode {
  id: string;
  name: string;
  short: string;
  lngLat: [number, number];
  /** Área cubierta por la zona, en m² */
  areaM2: number;
  /** Curva de densidad (pers/m²) por hora "HH:MM" */
  curve: [string, number][];
  /** Fracción de personas que se renueva cada minuto */
  turnover: number;
  /** Parte en calzada (resto en aceras), estimado por zona */
  roadwayShare?: number;
  /** Dirección principal del flujo en grados */
  flowBearing: number;
}

export interface LiveNode extends ScenarioNode {
  snapshot: import("@/sim/engine").NodeState;
}

export interface Scenario {
  id: string;
  name: string;
  shortName: string;
  schedule: { start: string; end: string };
  center: [number, number];
  zoom: number;
  route?: [number, number][];
  nodes: ScenarioNode[];
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
