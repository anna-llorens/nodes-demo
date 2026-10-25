import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/nodes/AppShell";
import { MapStage, type MapLayers } from "@/components/nodes/MapStage";
import { maraton } from "@/scenarios/maraton";
import { DEFAULT_SPEED, readMapCache, restoreFromCache, restoreMapState, validateMapSearch, writeMapCache } from "@/lib/map-share";

export const Route = createFileRoute("/map")({
  validateSearch: validateMapSearch,
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Mapa · Medio Maratón de València — NODES" },
      { name: "description", content: "Mapa simulado de densidad y flujo por zonas cubiertas con nodos LiDAR en el Medio Maratón de València." },
      { property: "og:title", content: "Mapa · Medio Maratón de València — NODES" },
      { property: "og:description", content: "Simulación de densidad por zona con nodos LiDAR anónimos." },
    ],
  }),
  component: MapaPage,
});

function MapaPage() {
  const search = Route.useSearch();
  // Resolve shared IDs against the configured scenarios; currently only marathon is available.
  const scenario = maraton;
  const [initial, setInitial] = useState(() => ({ ...restoreMapState(search, scenario), speed: DEFAULT_SPEED }));
  const [layers, setLayers] = useState<MapLayers>(initial.layers);
  const [restored, setRestored] = useState(false);
  // Shared links win; otherwise resume the browser's cached map state after hydration.
  useEffect(() => {
    const hasLink = Object.values(search).some((v) => v !== undefined);
    const cache = hasLink ? null : readMapCache();
    if (cache) {
      const next = restoreFromCache(cache, scenario);
      setInitial(next);
      setLayers(next.layers);
    }
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (restored) writeMapCache({ layers }); }, [layers, restored]);
  const setLayer = (key: keyof MapLayers, value: boolean) => setLayers((current) => ({ ...current, [key]: value }));
  return (
    <AppShell
      sidebarExtra={
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Escenario</p>
            <p className="mt-1 font-display font-semibold text-brand-ink">{maraton.name}</p>
            <p className="text-xs text-muted-foreground">Simulación · {maraton.schedule.start}–{maraton.schedule.end}</p>
          </div>
          {/* Hueco donde MapStage monta el panel de capas en ordenador */}
          <div id="map-layers-slot" />
        </div>
      }
    >
      <MapStage scenario={scenario} layers={layers} onLayerChange={setLayer} initialCamera={initial.camera} initialPalette={initial.palette} initialMinute={initial.time} />
    </AppShell>
  );
}
