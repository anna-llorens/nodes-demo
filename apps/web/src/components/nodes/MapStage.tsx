import { ClientOnly, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, Pause, Users, X, ChevronDown, Info, Clock, ChevronRight, Layers, TriangleAlert } from "lucide-react";
import type { LiveScenario as Scenario, Scenario as RawScenario } from "@/scenarios/types";
import { fmtClock, toMin, type RunnerHeatSample } from "@nodes/core";
import { useAlerts, useSnapshot } from "@/data/hooks";
import { NO_TRAFFIC, labelAlert, labelTrafficTimes } from "@/data/view";
import { setSimClock } from "@/lib/sim-clock";
import { getScenarios } from "@/scenarios";
import { densityLevel } from "@/scenarios/types";
import { mapDensityLabel, mapEstimateLabel, mapRoutePath, mapSuggestionLabel, mapText, type MapLocale } from "@/i18n/map";
import { SchematicMap } from "./SchematicMap";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayerToggle } from "./AppShell";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { trackNodeClick } from "@/lib/analytics";
import { buildMapShareUrl, writeMapCache, DEFAULT_SPEED, type MapCamera, type MapLayers, type RunnerPalette } from "@/lib/map-share";
import { ShareMapDialog } from "./ShareMapDialog";
export type { MapLayers, RunnerPalette } from "@/lib/map-share";

const MapView = lazy(() => import("./MapView"));

const PALETTES: { id: RunnerPalette; key: "palette.thermal" | "palette.forest" | "palette.cobalt" | "palette.terracotta" | "palette.graphite" }[] = [
  { id: "termica", key: "palette.thermal" },
  { id: "verde", key: "palette.forest" },
  { id: "azul", key: "palette.cobalt" },
  { id: "terracota", key: "palette.terracotta" },
  { id: "grafito", key: "palette.graphite" },
];

export const levelDot: Record<string, string> = {
  low: "bg-dens-low",
  medium: "bg-dens-mid",
  high: "bg-dens-high",
  very_high: "bg-dens-crit",
};

const fmt = (n: number, locale: MapLocale) => n.toLocaleString(locale === "en" ? "en-US" : "es-ES");
const NO_RUNNERS: RunnerHeatSample[] = [];

export function MapStage({ scenario: base, layers, onLayerChange, initialCamera, fitBounds, initialPalette = "termica", initialMinute, initialSpeed = DEFAULT_SPEED, locale = "es", mapOnlyNavigation = false }: { scenario: RawScenario; layers: MapLayers; onLayerChange: (key: keyof MapLayers, value: boolean) => void; initialCamera?: MapCamera; fitBounds?: [[number, number], [number, number]]; initialPalette?: RunnerPalette; initialMinute?: number; initialSpeed?: number; locale?: MapLocale; mapOnlyNavigation?: boolean }) {
  const densityLabels = mapDensityLabel(locale);
  const suggestionLabels = mapSuggestionLabel(locale);
  const localizedScenarios = useMemo(() => getScenarios(locale), [locale]);
  const start = toMin(base.schedule.start);
  const end = toMin(base.schedule.end);
  const [minute, setMinute] = useState(initialMinute ?? toMin(base.defaultTime ?? base.schedule.start));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setMinute((m) => {
        const next = m + (speed * 0.2) / 60;
        if (next >= end) { setPlaying(false); return end; }
        return next;
      });
    }, 200);
    return () => clearInterval(id);
  }, [playing, speed, end]);
  const tick = Math.floor(minute * 6) / 6; // recalcula cada 10 s simulados
  const snapshot = useSnapshot(base.id, tick);
  const scenario: Scenario = useMemo(() => {
    const st = snapshot.nodes;
    return { ...base, nodes: base.nodes.flatMap((n, i) => {
      const nodeSnapshot = st[i];
      return nodeSnapshot ? [{ ...n, snapshot: nodeSnapshot }] : [];
    }) };
  }, [base, snapshot]);
  const clock = fmtClock(minute, true);
  const trafficTick = Math.floor(minute);
  const trafficSnapshot = useSnapshot(base.id, trafficTick);
  const traffic = useMemo(() => trafficSnapshot.traffic?.segments ?? [], [trafficSnapshot]);
  const showTraffic = Boolean(layers.traffic);
  const jammed = traffic.filter((t) => t.level === 3).length;
  const times = useMemo(() => labelTrafficTimes(base, trafficSnapshot.traffic?.times ?? NO_TRAFFIC), [base, trafficSnapshot]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedId) return;
    const n = base.nodes.find((x) => x.id === selectedId);
    trackNodeClick(selectedId, n?.name ?? selectedId);
  }, [selectedId]);
  const [fallback, setFallback] = useState(false);
  const [tab, setTab] = useState<"mapa" | "indicadores">("mapa");
  const [layersOpen, setLayersOpen] = useState(false);
  const [palette, setPalette] = useState<RunnerPalette>(initialPalette);
  const [camera, setCamera] = useState<MapCamera>(initialCamera ?? { lng: base.center[0], lat: base.center[1], zoom: base.zoom, bearing: 0, pitch: 0 });
  // Persist simulation view so returning to the map resumes where the user left it.
  const savedTick = Math.floor(minute * 6) / 6;
  useEffect(() => { writeMapCache({ time: savedTick, speed, palette, camera }, base.id); }, [savedTick, speed, palette, camera, base.id]);
  const minuteRef = useRef(minute);
  minuteRef.current = minute;
  useEffect(() => () => writeMapCache({ time: minuteRef.current }, base.id), [base.id]);
  const [layersSlot, setLayersSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setLayersSlot(document.getElementById("map-layers-slot"));
  }, []);
  const selected = scenario.nodes.find((n) => n.id === selectedId) ?? null;
  const total = scenario.nodes.reduce((s, n) => s + n.snapshot.people, 0);
  const estimated = scenario.nodes.reduce((s, n) => s + n.snapshot.estimated, 0);
  useEffect(() => { setSimClock({ scenarioId: base.id, minute: tick }); }, [base.id, tick]);
  // Aviso sobre el mapa: alertas con sugerencia cuyo nodo sigue en esa banda.
  const raised = useAlerts(base.id, tick);
  const alerts = useMemo(() => raised.map((a) => labelAlert(base, a, locale)).filter((a) => {
    const node = scenario.nodes.find((n) => n.id === a.nodeId);
    return a.suggestion && node && densityLevel(node.snapshot.density) === a.level;
  }), [base, raised, scenario, locale]);
  const hasRunners = base.nodes.some((n) => n.runnerShare);
  const runners = scenario.nodes.reduce((s, n) => s + n.snapshot.runners, 0);

  // Panel de capas: se muestra fijo en la barra lateral (ordenador) y en un desplegable (móvil).
  const layersPanel = (
    <>
      <h2 className="mb-2 font-display text-sm font-bold text-brand-ink">{mapText(locale, "layers.title")}</h2>
      <LayerToggle label={mapText(locale, "layers.heat")} checked={layers.heat} onChange={(value) => onLayerChange("heat", value)} />
      {base.route && <LayerToggle label={mapText(locale, "layers.runners")} checked={layers.runners} onChange={(value) => onLayerChange("runners", value)} />}
      <LayerToggle label={mapText(locale, "layers.rings")} checked={layers.rings} onChange={(value) => onLayerChange("rings", value)} />
      <LayerToggle label={mapText(locale, "layers.flow")} checked={layers.flow} onChange={(value) => onLayerChange("flow", value)} />
      {base.route && <LayerToggle label={mapText(locale, "layers.route")} checked={layers.route} onChange={(value) => onLayerChange("route", value)} />}
      {base.zones?.length ? (
        <LayerToggle label={mapText(locale, "layers.zones", { zones: base.zonesLabel ?? mapText(locale, "layers.defaultZones") })} checked={Boolean(layers.zones)} onChange={(value) => onLayerChange("zones", value)} />
      ) : null}
      {base.traffic && (
        <LayerToggle
          label={mapText(locale, "layers.trafficClosures")}
          checked={showTraffic || Boolean(layers.closures)}
          onChange={(value) => { onLayerChange("traffic", value); onLayerChange("closures", value); }}
        />
      )}
      {showTraffic && base.traffic && (
        <div className="mt-2 border-t border-border pt-2">
          <p className="text-xs font-semibold">{mapText(locale, "layers.trafficClosures")} · {fmtClock(trafficTick)}</p>
          <div className="mt-1 flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded-full bg-dens-low" />{mapText(locale, "traffic.fluid")}</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded-full bg-dens-mid" />{mapText(locale, "traffic.dense")}</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded-full bg-dens-crit" />{mapText(locale, "traffic.congested")}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {mapText(locale, "traffic.jammed", { count: jammed })} · {mapText(locale, "traffic.roadsClosed")} {base.closure?.start}–{base.closure?.end}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            <span className="h-2 w-2 mr-1 inline-block animate-pulse rounded-full bg-dens-crit" />
            {mapText(locale, "traffic.averageSpeed")} {times.avgSpeed} km/h · {mapText(locale, "traffic.delay", { minutes: times.delay })}
          </p>
          {times.waits.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-[11px]">
              {times.waits.map((w) => (
                <li key={w.id} className={cn("flex justify-between gap-3", w.name === times.busiest && "font-semibold text-foreground")}>
                  <span className="truncate">{w.name}</span>
                  <span className="tabular-nums">{mapText(locale, "traffic.minutes", { count: w.wait })}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-1 text-[10px] text-muted-foreground">{mapText(locale, "traffic.waitToCross")}</p>
        </div>
      )}
      {base.route && <label className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
        {mapText(locale, "palette.label")}
        <select
          aria-label={mapText(locale, "palette.aria")}
          value={palette}
          onChange={(e) => setPalette(e.target.value as RunnerPalette)}
          className="max-w-[9.5rem] rounded-lg border border-input bg-card px-2 py-1 text-xs text-foreground"
        >
          {PALETTES.map((p) => <option key={p.id} value={p.id}>{mapText(locale, p.key)}</option>)}
        </select>
      </label>}
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Cabecera */}
      <header className="shrink-0 border-b border-border bg-card px-4 pt-3 sm:px-6">
        <div className="flex flex-col-reverse items-start gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3">
          <div className="w-full min-w-0">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex w-full min-w-0 items-center gap-1.5 text-left" aria-label={mapText(locale, "scenario.change")}>
                  <h1 className="truncate font-display text-lg font-bold text-brand-ink sm:text-xl">{scenario.name}</h1>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)] p-1.5">
                {localizedScenarios.map((s) => (
                  <Link
                    key={s.id}
                    to={mapOnlyNavigation ? "/$locale/demo/map" : "/map"}
                    {...(mapOnlyNavigation ? { params: { locale } } : {})}
                    search={{ scenario: s.id }}
                    className={cn("block rounded-lg px-3 py-2 text-sm hover:bg-muted", s.id === base.id && "bg-muted font-semibold")}
                  >
                    {s.name}
                    <span className="block text-xs font-normal text-muted-foreground">{s.schedule.start}–{s.schedule.end} · {mapText(locale, "unit.nodes", { count: s.nodes.length })}</span>
                  </Link>
                ))}
              </PopoverContent>
            </Popover>
            <p className="truncate text-xs text-muted-foreground">{mapText(locale, "unit.nodes", { count: scenario.nodes.length })}{scenario.tagline ? ` · ${scenario.tagline}` : ""}</p>
            <PeopleSummary measured={total} estimated={estimated} locale={locale} />
          </div>
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <span className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex"><Clock className="h-4 w-4" /> {scenario.schedule.start}–{scenario.schedule.end}</span>
            <ShareMapDialog
              locale={locale}
              getUrl={() => buildMapShareUrl(window.location.origin, { scenario: base.id, layers, camera, palette, time: minute }, mapOnlyNavigation ? mapRoutePath(locale) : "/map")}
            />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 text-sm font-semibold lg:hidden">
          {(["mapa", "indicadores"] as const).map((t) => (
            <Button variant="ghost"
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "border-b-2 py-2.5",
                tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground",
              )}
            >
              {t === "mapa" ? mapText(locale, "scenario.tabMap") : mapText(locale, "scenario.tabNodes")}
            </Button>
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Mapa */}
        <section className={cn("relative min-h-[420px] flex-1", tab !== "mapa" && "hidden lg:block")}>
          {fallback ? (
            <SchematicMap scenario={scenario} selectedId={selectedId} onSelect={setSelectedId} locale={locale} />
          ) : (
            <ClientOnly fallback={<SchematicMap scenario={scenario} selectedId={selectedId} onSelect={setSelectedId} locale={locale} />}>
              <Suspense fallback={<div className="absolute inset-0 bg-muted" />}>
                <MapView
                  scenario={scenario}
                  locale={locale}
                  layers={layers}
                  traffic={traffic}
                  runnerHeat={snapshot.runnerHeat ?? NO_RUNNERS}
                  palette={palette}
                  {...(initialCamera ? { initialCamera } : {})}
                  {...(fitBounds ? { fitBounds } : {})}
                  onCameraChange={setCamera}
                  selectedId={selectedId}
                  onSelect={(id) => setSelectedId(id)}
                  onError={() => setFallback(true)}
                />
              </Suspense>
            </ClientOnly>
          )}

          {/* Controles + hora del evento */}
          <div className="absolute left-3 top-3 flex max-w-[calc(100%-4.5rem)] flex-col items-start gap-2 sm:left-4 sm:top-4">
            {/* El botón Capas solo flota sobre el mapa en móvil y tablet; en ordenador vive en la barra lateral */}
            <div className="flex flex-wrap gap-2 lg:hidden">
              <Popover open={layersOpen} onOpenChange={setLayersOpen}>
                <PopoverTrigger asChild><Button variant={layersOpen ? "default" : "secondary"} size="sm" className="rounded-full bg-card text-foreground shadow-float"><Layers />{mapText(locale, "scenario.mobileLayers")}</Button></PopoverTrigger>
                <PopoverContent align="start" aria-label={mapText(locale, "layers.title")} className="w-72 max-w-[calc(100vw-2rem)]">
                  {layersPanel}
                </PopoverContent>
              </Popover>
            </div>
            {layersSlot && createPortal(
              <div className="flex flex-col">{layersPanel}</div>,
              layersSlot,
            )}
            <div className="hidden rounded-2xl bg-card/95 px-4 py-3 shadow-float backdrop-blur lg:block">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{mapText(locale, "scenario.eventTime")}</p>
              <p className="font-display text-3xl font-bold tabular-nums text-brand-ink">{clock}</p>
              {hasRunners && <p className="text-xs text-muted-foreground">{mapText(locale, "scenario.runners", { runners: fmt(runners, locale), spectators: fmt(total - runners, locale) })}{base.participants ? ` · ${mapText(locale, "scenario.registered", { count: fmt(base.participants, locale) })}${base.participantsBasis ? ` ${mapText(locale, "scenario.basis", { basis: base.participantsBasis })}` : ""}` : ""}</p>}
            </div>
          </div>

          {/* Alertas de densidad muy alta con sugerencia */}
          {alerts.length > 0 && (
            <div role="alert" className="absolute right-14 top-3 flex max-w-[min(340px,calc(100%-5rem))] flex-col gap-2 sm:top-4">
              {alerts.map((a) => (
                <button key={a.id} onClick={() => setSelectedId(a.nodeId)} className={cn("flex items-start gap-2 rounded-2xl border bg-card px-3 py-2 text-left text-xs shadow-float", a.level === "very_high" ? "border-dens-crit" : "border-dens-high")}>
                  <TriangleAlert className={cn("mt-0.5 h-4 w-4 shrink-0", a.level === "very_high" ? "text-dens-crit" : "text-dens-high")} />
                  <span><span className="font-semibold">{a.time} · {a.node}</span> · {densityLabels[a.level]}. {mapText(locale, "scenario.alertSuggestion", { suggestion: a.suggestion ?? "" })}</span>
                </button>
              ))}
            </div>
          )}

          {/* Burbuja del nodo */}
          {selected && (
            <div className="absolute left-1/2 top-16 w-[min(260px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl bg-card p-3.5 shadow-float lg:left-auto lg:right-14 lg:translate-x-0 lg:hidden">
              <NodeBubble minute={minute} node={selected} onClose={() => setSelectedId(null)} locale={locale} mapOnlyNavigation={mapOnlyNavigation} />
            </div>
          )}

          {/* Reproductor + leyenda */}
          <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2 sm:inset-x-6 sm:bottom-6 lg:left-1/2 lg:right-auto lg:w-[min(640px,calc(100%-3rem))] lg:-translate-x-1/2">
            <Player
              start={start}
              end={end}
              minute={minute}
              clock={clock}
              playing={playing}
              speed={speed}
              onToggle={() => { if (minute >= end) setMinute(start); setPlaying((p) => !p); }}
              onSeek={(m) => setMinute(m)}
              onSpeed={setSpeed}
              locale={locale}
            />
            <Legend locale={locale} />
          </div>
        </section>

        {/* Indicadores en móvil */}
        {tab !== "mapa" && (
          <div className="flex-1 overflow-y-auto p-4 lg:hidden">
            <NodeList scenario={scenario} onSelect={(id) => { setSelectedId(id); setTab("mapa"); }} locale={locale} />
          </div>
        )}

        {/* Panel derecho (ordenador) */}
        <aside className="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-background p-4 lg:flex 2xl:w-96">
          {selected ? (
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <NodeBubble minute={minute} node={selected} onClose={() => setSelectedId(null)} detailed locale={locale} mapOnlyNavigation={mapOnlyNavigation} />
            </div>
          ) : (
            <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-card">{mapText(locale, "scenario.noNodeSelected")}</p>
          )}
          <div>
            <h2 className="mb-2 font-display text-sm font-bold text-brand-ink">{mapText(locale, "scenario.tabNodes")}</h2>
            <NodeList scenario={scenario} selectedId={selectedId} onSelect={setSelectedId} locale={locale} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function NodeBubble({ node, onClose, detailed, minute, locale, mapOnlyNavigation }: { node: Scenario["nodes"][number]; onClose: () => void; detailed?: boolean; minute: number; locale: MapLocale; mapOnlyNavigation: boolean }) {
  const lvl = densityLevel(node.snapshot.density);
  const densityLabels = mapDensityLabel(locale);
  const suggestionLabels = mapSuggestionLabel(locale);
  return (
    <div>
      {node.image && (
        <img src={node.image} alt={node.name} width={1024} height={640} loading="lazy" className="mb-2 h-24 w-full rounded-xl object-cover" />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground">{node.short}</p>
          <p className="truncate font-display font-semibold text-brand-ink">{node.name}</p>
        </div>
        <button onClick={onClose} aria-label={mapText(locale, "node.close")} className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      {detailed && node.description && <p className="mt-1 text-xs text-muted-foreground">{node.description}</p>}
      <p className="mt-1 text-sm">{mapText(locale, "node.measured", { count: fmt(node.snapshot.people, locale) })}</p>
      <p className="text-sm">{mapText(locale, "node.estimated", { count: fmt(node.snapshot.estimated, locale) })} <EstimateTag locale={locale} /></p>
      {node.runnerShare && <p className="text-xs text-muted-foreground">{mapText(locale, "node.runnerSplit", { runners: fmt(node.snapshot.runners, locale), spectators: fmt(node.snapshot.spectators, locale) })}</p>}
      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className={cn("h-2.5 w-2.5 rounded-full", levelDot[lvl])} />
        {mapText(locale, "node.density", { level: densityLabels[lvl], value: node.snapshot.density.toLocaleString(locale === "en" ? "en-US" : "es-ES") })}
      </p>
      {(lvl === "high" || lvl === "very_high") && node.suggestions?.[lvl] && <p className="mt-1 text-xs font-semibold text-dens-crit">{mapText(locale, "scenario.alertSuggestion", { suggestion: suggestionLabels[node.suggestions[lvl]] })}</p>}
      {detailed && node.snapshot.roadway !== undefined && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label={mapText(locale, "node.roadway")} value={fmt(node.snapshot.roadway, locale)} />
          <Stat label={mapText(locale, "node.sidewalks")} value={fmt(node.snapshot.sidewalk ?? 0, locale)} />
          <Stat label={mapText(locale, "node.entry")} value={`${node.snapshot.flowIn} ${mapText(locale, "node.perMinute")}`} />
          <Stat label={mapText(locale, "node.exit")} value={`${node.snapshot.flowOut} ${mapText(locale, "node.perMinute")}`} />
          <Stat label={mapText(locale, "node.variation")} value={`${node.snapshot.variation10 >= 0 ? "+" : ""}${Math.round(node.snapshot.variation10 * 100)} %`} />
          <Stat label={mapText(locale, "node.averageSpeed")} value={`${node.snapshot.speed.toLocaleString(locale === "en" ? "en-US" : "es-ES")} ${mapText(locale, "node.metersPerSecond")}`} />
          <p className="col-span-2 text-[11px] text-muted-foreground">{mapText(locale, "node.estimatedByZone")}</p>
        </div>
      )}
      {!mapOnlyNavigation && <Link
        to="/node/$id"
        params={{ id: node.id }}
        search={{ t: Math.round(minute) }}
        className="mt-3 flex items-center justify-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
      >
        {mapText(locale, "node.details")} <ChevronRight className="h-3.5 w-3.5" />
      </Link>}
    </div>
  );
}

/** Medido y estimado del escenario; la estimación siempre lleva su etiqueta. */
function PeopleSummary({ measured, estimated, locale }: { measured: number; estimated: number; locale: MapLocale }) {
  return (
    <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 pb-1 text-xs">
      <span><span className="font-semibold tabular-nums text-foreground">{fmt(measured, locale)}</span> <span className="text-muted-foreground">{mapText(locale, "people.measuredCoveredZones")}</span></span>
      <span><span className="font-semibold tabular-nums text-foreground">≈ {fmt(estimated, locale)}</span> <span className="text-muted-foreground">{mapText(locale, "people.estimatedEventArea")}</span> <EstimateTag locale={locale} /></span>
    </div>
  );
}

export function EstimateTag({ locale = "es" }: { locale?: MapLocale }) {
  return <span className="ml-1 inline-block whitespace-nowrap rounded-full border border-dashed border-border px-1.5 py-px align-middle text-[10px] font-semibold text-muted-foreground">{mapEstimateLabel(locale)}</span>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

function NodeList({ scenario, onSelect, selectedId, locale }: { scenario: Scenario; onSelect: (id: string) => void; selectedId?: string | null; locale: MapLocale }) {
  return (
    <ul className="flex flex-col gap-2">
      <li className="text-[11px] text-muted-foreground">{mapText(locale, "people.estimatedShort")} <EstimateTag locale={locale} /></li>
      {scenario.nodes.map((n) => {
        const lvl = densityLevel(n.snapshot.density);
        return (
          <li key={n.id}>
            <button
              onClick={() => onSelect(n.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-card transition-colors",
                selectedId === n.id && "ring-2 ring-primary",
              )}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Users className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{n.name}</span>
                <span className="block text-xs text-muted-foreground">{fmt(n.snapshot.people, locale)} {mapText(locale, "people.measuredShort")} · ≈ {fmt(n.snapshot.estimated, locale)} {mapText(locale, "people.estimatedShortValue")} · {n.snapshot.density.toLocaleString(locale === "en" ? "en-US" : "es-ES")} {locale === "en" ? "people/m²" : "pers/m²"}</span>
              </span>
              <span className={cn("h-3 w-3 shrink-0 rounded-full", levelDot[lvl])} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Player(p: {
  start: number; end: number; minute: number; clock: string; playing: boolean; speed: number;
  onToggle: () => void; onSeek: (m: number) => void; onSpeed: (s: number) => void; locale: MapLocale;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-card px-3 py-2.5 shadow-float sm:flex-nowrap sm:gap-3">
      <button onClick={p.onToggle} aria-label={mapText(p.locale, p.playing ? "player.pause" : "player.play")} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        {p.playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
      </button>
      <span className="hidden text-xs text-muted-foreground sm:inline">{fmtClock(p.start)}</span>
      <input
        type="range"
        aria-label={mapText(p.locale, "player.eventTime")}
        min={p.start}
        max={p.end}
        step={1}
        value={p.minute}
        onChange={(e) => p.onSeek(Number(e.target.value))}
        className="order-last h-1.5 w-full min-w-0 cursor-pointer accent-primary sm:order-none sm:w-auto sm:flex-1"
      />
      <span className="hidden text-xs text-muted-foreground sm:inline">{fmtClock(p.end)}</span>
      <span className="w-[4.2rem] shrink-0 font-display text-sm font-bold tabular-nums">{p.clock}</span>
      <div className="flex shrink-0 rounded-full bg-muted p-0.5 text-xs font-semibold">
        {[1, 10, 60, 100, 200].map((s) => (
          <button key={s} onClick={() => p.onSpeed(s)} className={cn("rounded-full px-2 py-1", p.speed === s ? "bg-card shadow-card" : "text-muted-foreground")}>{s}×</button>
        ))}
      </div>
    </div>
  );
}


function Legend({ locale }: { locale: MapLocale }) {
  return (
    <div className="rounded-2xl bg-card/95 px-3 py-2 shadow-card backdrop-blur">
      <div className="flex items-center gap-3 text-xs font-semibold">
        <span>{mapText(locale, "legend.low")}</span>
        <span className="h-2 flex-1 rounded-full bg-density" />
        <span>{mapText(locale, "legend.high")}</span>
      </div>
      <p className="mt-1 flex items-start gap-1 text-[10px] leading-tight text-muted-foreground">
        <Info className="mt-px h-3 w-3 shrink-0" />
        {mapText(locale, "legend.reference")}
      </p>
    </div>
  );
}
