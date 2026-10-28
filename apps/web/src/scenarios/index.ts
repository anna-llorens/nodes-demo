import { maraton } from "./maraton";
import { mascleta } from "./mascleta";

/** Escenarios configurados; todos usan el mismo motor y las mismas pantallas. */
export const scenarios = [maraton, mascleta];

export const getScenario = (id?: string) => scenarios.find((s) => s.id === id) ?? maraton;

/** Escenario y nodo para un id de nodo (los ids son únicos entre escenarios). */
export function findNode(id: string) {
  for (const scenario of scenarios) {
    const node = scenario.nodes.find((n) => n.id === id);
    if (node) return { scenario, node };
  }
  return null;
}
