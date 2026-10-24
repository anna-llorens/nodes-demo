export type DensityLevel = "baja" | "media" | "alta" | "muy-alta";

export interface ScenarioNode {
  id: string;
  name: string;
  short: string;
  lngLat: [number, number];
  /** Área cubierta por la zona, en m² */
  areaM2: number;
  /** Datos fijos de la Fase 1 (sustituidos por el generador en la Fase 2) */
  snapshot: {
    people: number;
    roadway?: number;
    sidewalk?: number;
    density: number; // pers/m², máx. 7
    flowIn: number; // pers/min
    flowOut: number;
    flowBearing: number; // grados, dirección principal del flujo
  };
}

export interface Scenario {
  id: string;
  name: string;
  shortName: string;
  schedule: { start: string; end: string };
  snapshotTime: string;
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
