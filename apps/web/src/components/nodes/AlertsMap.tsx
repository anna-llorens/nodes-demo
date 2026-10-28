import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Scenario } from "@/scenarios/types";
import type { DensityAlert } from "@/data/view";
import { scenarioBounds } from "./geo";

maplibregl.setWorkerUrl(workerUrl);

/** Mapa de la pestaña Alertas: un marcador "!" por alerta visible (rojo muy alta, naranja alta). */
export default function AlertsMap({ scenario, alerts, selectedId, onSelect, onError }: {
  scenario: Scenario;
  alerts: DensityAlert[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onError: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!ref.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://tiles.openfreemap.org/styles/positron",
      bounds: scenarioBounds({ ...scenario, zones: [] }),
      fitBoundsOptions: { padding: 60, maxZoom: 16.5 },
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    const timer = setTimeout(() => { if (!map.isStyleLoaded()) onError(); }, 9000);
    map.on("load", () => clearTimeout(timer));
    map.on("click", () => onSelectRef.current(null));
    return () => { clearTimeout(timer); map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id]);

  const key = alerts.map((a) => a.id).join(",");
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    const perNode = new Map<string, number>();
    markersRef.current = alerts.map((a) => {
      const node = scenario.nodes.find((n) => n.id === a.nodeId)!;
      const i = perNode.get(a.nodeId) ?? 0;
      perNode.set(a.nodeId, i + 1);
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", `${a.level === "very_high" ? "Densidad muy alta" : "Densidad alta"} · ${a.node}`);
      el.className = `grid h-7 w-7 place-items-center rounded-full border-2 border-card text-sm font-bold text-white shadow-float ${a.level === "very_high" ? "bg-dens-crit" : "bg-dens-high"}`;
      el.textContent = "!";
      el.addEventListener("click", (ev) => { ev.stopPropagation(); onSelectRef.current(a.id); });
      return new maplibregl.Marker({ element: el, offset: [i * 18, -i * 6] }).setLngLat(node.lngLat).addTo(map);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, scenario.id]);

  useEffect(() => {
    const a = alerts.find((x) => x.id === selectedId);
    const node = a && scenario.nodes.find((n) => n.id === a.nodeId);
    if (node) mapRef.current?.easeTo({ center: node.lngLat, duration: 400 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return (
    <div className="absolute inset-0">
      <div ref={ref} className="h-full w-full" />
    </div>
  );
}
