import type { Scenario, ScenarioNode } from "@/scenarios/types";

/** Densidad máxima permitida en cualquier momento (pers/m²). */
export const MAX_DENSITY = 7;

export interface NodeState {
  id: string;
  people: number;
  roadway?: number | undefined;
  sidewalk?: number | undefined;
  density: number;
  flowIn: number;
  flowOut: number;
  speed: number; // m/s
  variation10: number; // fracción, p. ej. 0.12 = +12 %
}

export const toMin = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fmtClock = (min: number) => {
  const h = Math.floor(min / 60);
  const m = Math.floor(min % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Ruido determinista: hash entero -> [-1, 1]
function hash(str: string, i: number) {
  let h = 2166136261 ^ i;
  for (let k = 0; k < str.length; k++) h = Math.imul(h ^ str.charCodeAt(k), 16777619);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h ^= h >>> 13;
  return ((h >>> 0) / 4294967295) * 2 - 1;
}
function noise(id: string, min: number) {
  const i = Math.floor(min);
  const f = min - i;
  const s = f * f * (3 - 2 * f);
  return hash(id, i) * (1 - s) + hash(id, i + 1) * s;
}

function curve(node: ScenarioNode, min: number) {
  const k = node.curve as [string, number][] & { 0: [string, number] };
  if (min <= toMin(k[0][0])) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    const a = toMin(k[i - 1]![0]);
    const b = toMin(k[i]![0]);
    if (min <= b) {
      const t = (min - a) / (b - a);
      return k[i - 1]![1] + (k[i]![1] - k[i - 1]![1]) * t;
    }
  }
  return k[k.length - 1]![1];
}

export function densityAt(node: ScenarioNode, min: number) {
  const d = curve(node, min) * (1 + 0.04 * noise(node.id, min));
  return Math.min(MAX_DENSITY, Math.max(0, d));
}

const peopleAt = (node: ScenarioNode, min: number) => densityAt(node, min) * node.areaM2;

export function nodeState(node: ScenarioNode, min: number): NodeState {
  const density = densityAt(node, min);
  const people = Math.round(density * node.areaM2);
  const delta = people - peopleAt(node, min - 1);
  const base = people * node.turnover;
  const prev10 = peopleAt(node, min - 10);
  return {
    id: node.id,
    people,
    roadway: node.roadwayShare !== undefined ? Math.round(people * node.roadwayShare) : undefined,
    sidewalk: node.roadwayShare !== undefined ? people - Math.round(people * node.roadwayShare) : undefined,
    density: Math.round(density * 10) / 10,
    flowIn: Math.round(base + Math.max(delta, 0)),
    flowOut: Math.round(base + Math.max(-delta, 0)),
    speed: Math.round(Math.max(0.1, 1.4 * (1 - density / 7.5)) * 10) / 10,
    variation10: prev10 > 0 ? (people - prev10) / prev10 : 0,
  };
}

export function simulate(s: Scenario, min: number): NodeState[] {
  return s.nodes.map((n) => nodeState(n, min));
}
