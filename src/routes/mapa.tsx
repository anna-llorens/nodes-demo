import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, LayerToggle } from "@/components/nodes/AppShell";
import { MapStage, type MapLayers } from "@/components/nodes/MapStage";
import { maraton } from "@/scenarios/maraton";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa · Medio Maratón de València — NODES" },
      { name: "description", content: "Mapa simulado de densidad y flujo por zonas cubiertas con nodos LiDAR en el Medio Maratón de València." },
      { property: "og:title", content: "Mapa · Medio Maratón de València — NODES" },
      { property: "og:description", content: "Simulación de densidad por zona con nodos LiDAR anónimos." },
    ],
  }),
  component: MapaPage,
});

function MapaPage() {
  const [layers, setLayers] = useState<MapLayers>({ heat: true, rings: true, flow: true, route: true });
  const set = (k: keyof MapLayers) => (v: boolean) => setLayers((l) => ({ ...l, [k]: v }));
  return (
    <AppShell
      sidebarExtra={
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Escenario</p>
          <p className="mt-1 font-display font-semibold text-brand-ink">{maraton.name}</p>
          <p className="text-xs text-muted-foreground">Simulación · {maraton.schedule.start}–{maraton.schedule.end}</p>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Capas</p>
          <div className="mt-1">
            <LayerToggle label="Mapa de calor" checked={layers.heat} onChange={set("heat")} />
            <LayerToggle label="Anillos de nodo" checked={layers.rings} onChange={set("rings")} />
            <LayerToggle label="Flechas de flujo" checked={layers.flow} onChange={set("flow")} />
            <LayerToggle label="Recorrido aproximado" checked={layers.route} onChange={set("route")} />
          </div>
        </div>
      }
    >
      <MapStage scenario={maraton} layers={layers} />
    </AppShell>
  );
}
