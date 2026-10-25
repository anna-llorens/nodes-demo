import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { createRoot } from "react-dom/client";
import { ArrowUp } from "lucide-react";
import type { LiveScenario as Scenario } from "@/scenarios/types";
import { heatPoints, ringsGeo, runnerHeatPoints, trafficGeo } from "./geo";
import type { TrafficLevel } from "@/sim/engine";
import type { MapLayers } from "./MapStage";

// maplibre necesita colores literales en su paint (no lee variables CSS)
const C = {
  primary: "#2F9E7A",
  ink: "#1d4a45",
  low: "rgba(76,190,120,0)",
  mid: "#f2d14b",
  high: "#f08a3c",
  crit: "#e0453a",
};

maplibregl.setWorkerUrl(workerUrl);

export default function MapView({
  scenario,
  layers,
  selectedId,
  onSelect,
  onError,
  traffic,
  minute,
}: {
  traffic: { id: string; level: TrafficLevel }[];
  minute: number;
  scenario: Scenario;
  layers: MapLayers;
  selectedId: string | null;
  onSelect: (id: string | null, point?: { x: number; y: number }) => void;
  onError: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const trafficRef = useRef(traffic);
  trafficRef.current = traffic;

  useEffect(() => {
    if (!ref.current) return;
    // Canvas resolves CSS theme colors to MapLibre-compatible RGB values.
    const paletteCanvas = document.createElement("canvas");
    paletteCanvas.width = paletteCanvas.height = 1;
    const paletteContext = paletteCanvas.getContext("2d");
    if (!paletteContext) { onError(); return; }
    const theme = getComputedStyle(document.documentElement);
    const runnerColor = (token: string, alpha = 1) => {
      paletteContext.clearRect(0, 0, 1, 1);
      paletteContext.fillStyle = theme.getPropertyValue(token).trim();
      paletteContext.fillRect(0, 0, 1, 1);
      const [r, g, b] = paletteContext.getImageData(0, 0, 1, 1).data;
      return `rgba(${r},${g},${b},${alpha})`;
    };
    let failed = false;
    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://tiles.openfreemap.org/styles/positron",
      center: scenario.center,
      zoom: scenario.zoom,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    const timer = setTimeout(() => {
      if (!map.loaded() && !map.isStyleLoaded()) {
        failed = true;
        onError();
      }
    }, 9000);
    map.on("error", (e: { error?: unknown }) => {
      if (!map.isStyleLoaded() && !failed) {
        failed = true;
        console.warn("Mapa no disponible", e.error);
        onError();
      }
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      clearTimeout(timer);
      if (scenario.route) {
        map.addSource("route", {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: scenario.route } },
        });
        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: { "line-color": C.ink, "line-width": 3, "line-dasharray": [2, 1.6], "line-opacity": 0.75 },
        });
      }
      if (scenario.traffic) {
        map.addSource("traffic", { type: "geojson", data: trafficGeo(scenario, trafficRef.current) });
        map.addLayer({
          id: "traffic",
          type: "line",
          source: "traffic",
          layout: { "line-cap": "round", visibility: "none" },
          paint: {
            "line-width": ["interpolate", ["linear"], ["zoom"], 12, 2, 16, 5],
            "line-opacity": 0.85,
            "line-color": ["match", ["get", "level"], 3, C.crit, 2, C.mid, "#2bb673"],
          },
        });
      }
      map.addSource("runners", { type: "geojson", data: runnerHeatPoints(scenario, 0) });
      map.addLayer({
        id: "runners",
        type: "heatmap",
        source: "runners",
        paint: {
          "heatmap-weight": ["get", "w"],
           "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 12, 2.5, 17, 4],
           "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 12, 14, 17, 38],
           "heatmap-opacity": 0.9,
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, runnerColor("--runner-heat-low", 0),
            0.08, runnerColor("--runner-heat-low", 0.45),
            0.3, runnerColor("--runner-heat-mid"),
            0.6, runnerColor("--runner-heat-high"),
            0.9, runnerColor("--runner-heat-peak"),
            1, runnerColor("--runner-heat-peak"),
          ],
        },
      });
      map.addSource("heat", { type: "geojson", data: heatPoints(scenario) });
      map.addLayer({
        id: "heat",
        type: "heatmap",
        source: "heat",
        paint: {
          "heatmap-weight": ["get", "w"],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 12, 0.6, 17, 2],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 12, 14, 17, 60],
          "heatmap-opacity": 0.8,
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, C.low, 0.2, "rgba(76,190,120,0.6)", 0.45, C.mid, 0.7, C.high, 1, C.crit,
          ],
        },
      });
      map.addSource("r40", { type: "geojson", data: ringsGeo(scenario, 40) });
      map.addSource("r20", { type: "geojson", data: ringsGeo(scenario, 20) });
      map.addLayer({ id: "r40", type: "line", source: "r40", paint: { "line-color": C.primary, "line-width": 1.5, "line-dasharray": [2, 2] } });
      map.addLayer({ id: "r20", type: "line", source: "r20", paint: { "line-color": C.primary, "line-width": 2 } });

      for (const n of scenario.nodes) {
        const el = document.createElement("button");
        el.type = "button";
        el.setAttribute("aria-label", n.name);
         el.className = "node-marker grid h-8 w-8 place-items-center rounded-full";
         el.innerHTML = '<span class="h-3 w-3 rounded-full border-2 border-card bg-primary shadow-card"></span>';
        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          onSelectRef.current(n.id);
        });
        new maplibregl.Marker({ element: el }).setLngLat(n.lngLat).addTo(map);

        const arrow = document.createElement("div");
        arrow.className = "flow-arrow pointer-events-none";
        createRoot(arrow).render(
          <div className="grid h-6 w-6 place-items-center rounded-full bg-card text-primary shadow-card" style={{ transform: `rotate(${n.flowBearing}deg)` }}>
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </div>,
        );
        new maplibregl.Marker({ element: arrow, offset: [26, -26] }).setLngLat(n.lngLat).addTo(map);
      }
      map.on("click", () => onSelectRef.current(null));
      setReady(true);
    });

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id]);

  // Actualiza el mapa de calor con los datos simulados
  useEffect(() => {
    const src = mapRef.current?.getSource("heat") as maplibregl.GeoJSONSource | undefined;
    if (ready && src) src.setData(heatPoints(scenario));
  }, [scenario, ready]);

  // Actualiza el calor de corredores según la hora simulada
  useEffect(() => {
    const src = mapRef.current?.getSource("runners") as maplibregl.GeoJSONSource | undefined;
    if (ready && src) src.setData(runnerHeatPoints(scenario, minute));
  }, [scenario, minute, ready]);

  useEffect(() => {
    const src = mapRef.current?.getSource("traffic") as maplibregl.GeoJSONSource | undefined;
    if (ready && src) src.setData(trafficGeo(scenario, traffic));
  }, [traffic, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // Capas visibles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const vis = (id: string, on: boolean) => map.getLayer(id) && map.setLayoutProperty(id, "visibility", on ? "visible" : "none");
    vis("heat", layers.heat);
    vis("runners", layers.runners);
    vis("r20", layers.rings);
    vis("r40", layers.rings);
    vis("route", layers.route);
    vis("traffic", !!layers.traffic);
    map.getContainer().querySelectorAll<HTMLElement>(".flow-arrow").forEach((el: HTMLElement) => (el.style.display = layers.flow ? "" : "none"));
  }, [layers, ready]);

  // Centrar el nodo seleccionado
  useEffect(() => {
    const map = mapRef.current;
    const n = scenario.nodes.find((x) => x.id === selectedId);
    if (map && ready && n) map.easeTo({ center: n.lngLat, duration: 500 });
  }, [selectedId, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="absolute inset-0">
      <div ref={ref} className="h-full w-full" />
    </div>
  );
}
