import { useSyncExternalStore } from "react";
import { getScenario } from "@/scenarios";
import { toMin } from "@nodes/core";
import { readMapCache } from "./map-share";

/** Escenario y hora del reproductor del mapa, compartidos con la campana y la pestaña Alertas. */
export interface SimClock { scenarioId: string; minute: number }

const KEY = "nodes-active-scenario";
const defaultMinute = (id: string) => {
  const s = getScenario(id);
  return toMin(s.defaultTime ?? s.schedule.start);
};
const SERVER: SimClock = { scenarioId: "maraton", minute: defaultMinute("maraton") };
let state: SimClock | null = null;
const listeners = new Set<() => void>();

function initial(): SimClock {
  let id = "maraton";
  try { id = getScenario(localStorage.getItem(KEY) ?? undefined).id; } catch { /* sin almacenamiento: maratón */ }
  const cached = readMapCache(id)?.time;
  return { scenarioId: id, minute: typeof cached === "number" ? cached : defaultMinute(id) };
}

export function getSimClock() {
  return (state ??= initial());
}

export function setSimClock(next: SimClock) {
  const current = getSimClock();
  if (current.scenarioId === next.scenarioId && current.minute === next.minute) return;
  state = next;
  try { localStorage.setItem(KEY, next.scenarioId); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

/** Cambia de escenario recuperando la última hora guardada de su mapa. */
export function selectSimScenario(id: string) {
  const cached = readMapCache(id)?.time;
  setSimClock({ scenarioId: id, minute: typeof cached === "number" ? cached : defaultMinute(id) });
}

export function useSimClock() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    getSimClock,
    () => SERVER,
  );
}
