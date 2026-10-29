import { ClientOnly, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, Pause, Users, X, ChevronDown, Info, Clock, ChevronRight, Layers, TriangleAlert } from "lucide-react";
import type { LiveScenario as Scenario, Scenario as RawScenario } from "@/scenarios/types";
import { visibleAlerts, simulate, toMin, fmtClock, trafficAt, trafficTimesAt } from "@/sim/engine";
import { setSimClock } from "@/lib/sim-clock";
import { scenarios } from "@/scenarios";
import { ESTIMATE_LABEL, densityLabel, densityLevel } from "@/scenarios/types";
import { SchematicMap } from "./SchematicMap";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayerToggle } from "./AppShell";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { trackNodeClick } from "@/lib/analytics";
import { buildMapShareUrl, writeMapCache, DEFAULT_SPEED, type MapCamera, type MapLayers, type RunnerPalette } from "@/lib/map-share";
import { ShareMapDialog } from "./ShareMapDialog";
import { useFmt, useT } from "@/i18n/useT";
export type { MapLayers, RunnerPalette } from "@/lib/map-share";

const MapView = lazy(() => import("./MapView"));

const PALETTES: RunnerPalette[] = ["termica", "verde", "azul", "terracota", "grafito"];

export const levelDot: Record<string, string> = {
  baja: "bg-dens-low",
  media: "bg-dens-mid",
  alta: "bg-dens-high",
  "muy-alta": "bg-dens-crit",
};

export function MapStage({ scenario: base, layers, onLayerChange, initialCamera, fitBounds, initialPalette = "termica", initialMinute, initialSpeed = DEFAULT_SPEED }: { scenario: RawScenario; layers: MapLayers; onLayerChange: (key: keyof MapLayers, value: boolean) => void; initialCamera?: MapCamera; fitBounds?: [[number, number], [number, number]]; initialPalette?: RunnerPalette; initialMinute?: number; initialSpeed?: number }) {
  const t = useT();
  const fmt = useFmt();
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
  const scenario: Scenario = useMemo(() => {
    const st = simulate(base, tick);
    return { ...base, nodes: base.nodes.flatMap((n, i) => {
      const snapshot = st[i];
      return snapshot ? [{ ...n, snapshot }] : [];
    }) };
  }, [base, tick]);
  const clock = fmtClock(minute, true);
  const trafficTick = Math.floor(minute);
  const traffic = useMemo(() => trafficAt(base, trafficTick), [base, trafficTick]);
  const showTraffic = Boolean(layers.traffic);
  const jammed = traffic.filter((t) => t.level === 3).length;
  const times = useMemo(() => trafficTimesAt(base, trafficTick, traffic), [base, trafficTick, traffic]);
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
  const alerts = useMemo(() => visibleAlerts(base, tick).filter((a) => {
    const node = scenario.nodes.find((n) => n.id === a.nodeId);
    return a.suggestion && node && densityLevel(node.snapshot.density) === a.level;
  }), [base, tick, scenario]);
  const hasRunners = base.nodes.some((n) => n.runnerShare);
  const runners = scenario.nodes.reduce((s, n) => s + n.snapshot.runners, 0);

  // Panel de capas: se muestra fijo en la barra lateral (ordenador) y en un desplegable (móvil).
  const layersPanel = (
    <>
      <h2 className="mb-2 font-display text-sm font-bold text-brand-ink">{t.map.layers}</h2>
      <LayerToggle label={t.map.layerHeat} checked={layers.heat} onChange={(value) => onLayerChange("heat", value)} />
      {base.route && <LayerToggle label={t.map.layerRunners} checked={layers.runners} onChange={(value) => onLayerChange("runners", value)} />}
      <LayerToggle label={t.map.layerRings} checked={layers.rings} onChange={(value) => onLayerChange("rings", value)} />
      <LayerToggle label={t.map.layerFlow} checked={layers.flow} onChange={(value) => onLayerChange("flow", value)} />
      {base.route && <LayerToggle label={t.map.layerRoute} checked={layers.route} onChange={(value) => onLayerChange("route", value)} />}
      {base.zones?.length ? (
        <LayerToggle label={t.map.layerZones(base.zonesLabel ?? t.map.zonesDefault)} checked={Boolean(layers.zones)} onChange={(value) => onLayerChange("zones", value)} />
      ) : null}
      {base.traffic && (
        <LayerToggle
          label={t.map.layerTraffic}
          checked={showTraffic || Boolean(layers.closures)}
          onChange={(value) => { onLayerChange("traffic", value); onLayerChange("closures", value); }}
        />
      )}
      {showTraffic && base.traffic && (
        <div className="mt-2 border-t border-border pt-2">
          <p className="text-xs font-semibold">{t.map.trafficAt(fmtClock(trafficTick))}</p>
          <div className="mt-1 flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded-full bg-dens-low" />{t.map.trafficFluid}</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded-full bg-dens-mid" />{t.map.trafficDense}</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded-full bg-dens-crit" />{t.map.trafficJammed}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t.map.jammedSummary(jammed, base.closure?.start ?? "", base.closure?.end ?? "")}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            <span className="h-2 w-2 mr-1 inline-block animate-pulse rounded-full bg-dens-crit" />
            {t.map.trafficSpeed(times.avgSpeed, times.delay)}
          </p>
          {times.waits.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-[11px]">
              {times.waits.map((w) => (
                <li key={w.id} className={cn("flex justify-between gap-3", w.name === times.busiest && "font-semibold text-foreground")}>
                  <span className="truncate">{w.name}</span>
                  <span className="tabular-nums">{w.wait} min</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-1 text-[10px] text-muted-foreground">{t.map.crossWait}</p>
        </div>
      )}
      {base.route && <label className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
        {t.map.runnerPalette}
        <select
          aria-label={t.map.runnerPaletteAria}
          value={palette}
          onChange={(e) => setPalette(e.target.value as RunnerPalette)}
          className="max-w-[9.5rem] rounded-lg border border-input bg-card px-2 py-1 text-xs text-foreground"
        >
          {PALETTES.map((p) => <option key={p} value={p}>{t.map.palettes[p]}</option>)}
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
                <button className="flex w-full min-w-0 items-center gap-1.5 text-left" aria-label={t.map.changeScenario}>
                  <h1 className="truncate font-display text-lg font-bold text-brand-ink sm:text-xl">{scenario.name}</h1>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)] p-1.5">
                {scenarios.map((s) => (
                  <Link key={s.id} to="/map" search={{ scenario: s.id }} className={cn("block rounded-lg px-3 py-2 text-sm hover:bg-muted", s.id === base.id && "bg-muted font-semibold")}>
                    {s.name}
                    <span className="block text-xs font-normal text-muted-foreground">{s.schedule.start}–{s.schedule.end} · {t.common.nodes(s.nodes.length)}</span>
                  </Link>
                ))}
              </PopoverContent>
            </Popover>
            <p className="truncate text-xs text-muted-foreground">{t.common.nodes(scenario.nodes.length)}{scenario.tagline ? ` · ${scenario.tagline}` : ""}</p>
            <PeopleSummary measured={total} estimated={estimated} />
          </div>
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <span className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex"><Clock className="h-4 w-4" /> {scenario.schedule.start}–{scenario.schedule.end}</span>
            <ShareMapDialog getUrl={() => buildMapShareUrl(window.location.origin, { scenario: base.id, layers, camera, palette, time: minute })} />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 text-sm font-semibold lg:hidden">
          {(["mapa", "indicadores"] as const).map((tabId) => (
            <Button variant="ghost"
              key={tabId}
              onClick={() => setTab(tabId)}
              className={cn(
                "border-b-2 py-2.5",
                tab === tabId ? "border-primary text-foreground" : "border-transparent text-muted-foreground",
              )}
            >
              {tabId === "mapa" ? t.map.tabMap : t.map.tabNodes}
            </Button>
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Mapa */}
        <section className={cn("relative min-h-[420px] flex-1", tab !== "mapa" && "hidden lg:block")}>
          {fallback ? (
            <SchematicMap scenario={scenario} selectedId={selectedId} onSelect={setSelectedId} />
          ) : (
            <ClientOnly fallback={<SchematicMap scenario={scenario} selectedId={selectedId} onSelect={setSelectedId} />}>
              <Suspense fallback={<div className="absolute inset-0 bg-muted" />}>
                <MapView
                  scenario={scenario}
                  layers={layers}
                  traffic={traffic}
                  minute={tick}
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
                <PopoverTrigger asChild><Button variant={layersOpen ? "default" : "secondary"} size="sm" className="rounded-full bg-card text-foreground shadow-float"><Layers />{t.map.layers}</Button></PopoverTrigger>
                <PopoverContent align="start" aria-label={t.map.layersAria} className="w-72 max-w-[calc(100vw-2rem)]">
                  {layersPanel}
                </PopoverContent>
              </Popover>
            </div>
            {layersSlot && createPortal(
              <div className="flex flex-col">{layersPanel}</div>,
              layersSlot,
            )}
            <div className="hidden rounded-2xl bg-card/95 px-4 py-3 shadow-float backdrop-blur lg:block">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.map.eventTime}</p>
              <p className="font-display text-3xl font-bold tabular-nums text-brand-ink">{clock}</p>
              {hasRunners && <p className="text-xs text-muted-foreground">{t.map.runnersLine(fmt(runners), fmt(total - runners), base.participants ? fmt(base.participants) : undefined, base.participantsBasis)}</p>}
            </div>
          </div>

          {/* Alertas de densidad muy alta con sugerencia */}
          {alerts.length > 0 && (
            <div role="alert" className="absolute right-14 top-3 flex max-w-[min(340px,calc(100%-5rem))] flex-col gap-2 sm:top-4">
              {alerts.map((a) => (
                <button key={a.id} onClick={() => setSelectedId(a.nodeId)} className={cn("flex items-start gap-2 rounded-2xl border bg-card px-3 py-2 text-left text-xs shadow-float", a.level === "muy-alta" ? "border-dens-crit" : "border-dens-high")}>
                  <TriangleAlert className={cn("mt-0.5 h-4 w-4 shrink-0", a.level === "muy-alta" ? "text-dens-crit" : "text-dens-high")} />
                  <span><span className="font-semibold">{a.time} · {a.node}</span> · {densityLabel[a.level]}. {t.common.suggestion}: {a.suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Burbuja del nodo */}
          {selected && (
            <div className="absolute left-1/2 top-16 w-[min(260px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl bg-card p-3.5 shadow-float lg:left-auto lg:right-14 lg:translate-x-0 lg:hidden">
              <NodeBubble minute={minute} node={selected} onClose={() => setSelectedId(null)} />
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
            />
            <Legend />
          </div>
        </section>

        {/* Indicadores en móvil */}
        {tab !== "mapa" && (
          <div className="flex-1 overflow-y-auto p-4 lg:hidden">
            <NodeList scenario={scenario} onSelect={(id) => { setSelectedId(id); setTab("mapa"); }} />
          </div>
        )}

        {/* Panel derecho (ordenador) */}
        <aside className="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-background p-4 lg:flex 2xl:w-96">
          {selected ? (
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <NodeBubble minute={minute} node={selected} onClose={() => setSelectedId(null)} detailed />
            </div>
          ) : (
            <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-card">{t.map.tapNode}</p>
          )}
          <div>
            <h2 className="mb-2 font-display text-sm font-bold text-brand-ink">{t.map.nodesHeading}</h2>
            <NodeList scenario={scenario} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function NodeBubble({ node, onClose, detailed, minute }: { node: Scenario["nodes"][number]; onClose: () => void; detailed?: boolean; minute: number }) {
  const t = useT();
  const fmt = useFmt();
  const lvl = densityLevel(node.snapshot.density);
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
        <button onClick={onClose} aria-label={t.common.close} className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      {detailed && node.description && <p className="mt-1 text-xs text-muted-foreground">{node.description}</p>}
      <p className="mt-1 text-sm">{t.map.measured(fmt(node.snapshot.people))}</p>
      <p className="text-sm">{t.map.estimatedInZone(fmt(node.snapshot.estimated))} <EstimateTag /></p>
      {node.runnerShare && <p className="text-xs text-muted-foreground">{t.common.runnersPublic(fmt(node.snapshot.runners), fmt(node.snapshot.spectators))}</p>}
      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className={cn("h-2.5 w-2.5 rounded-full", levelDot[lvl])} />
        {densityLabel[lvl]} · {fmt(node.snapshot.density)} {t.common.perM2}
      </p>
      {(lvl === "alta" || lvl === "muy-alta") && node.suggestions?.[lvl] && <p className="mt-1 text-xs font-semibold text-dens-crit">{t.common.suggestion}: {node.suggestions[lvl]}</p>}
      {detailed && node.snapshot.roadway !== undefined && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label={t.common.roadway} value={fmt(node.snapshot.roadway)} />
          <Stat label={t.common.sidewalk} value={fmt(node.snapshot.sidewalk ?? 0)} />
          <Stat label={t.common.flowIn} value={`${node.snapshot.flowIn} ${t.common.perMin}`} />
          <Stat label={t.common.flowOut} value={`${node.snapshot.flowOut} ${t.common.perMin}`} />
          <Stat label={t.common.variation10} value={t.common.percent(`${node.snapshot.variation10 >= 0 ? "+" : ""}${Math.round(node.snapshot.variation10 * 100)}`)} />
          <Stat label={t.common.avgSpeed} value={`${fmt(node.snapshot.speed)} m/s`} />
          <p className="col-span-2 text-[11px] text-muted-foreground">{t.map.roadwayNote}</p>
        </div>
      )}
      <Link
        to="/node/$id"
        params={{ id: node.id }}
        search={{ t: Math.round(minute) }}
        className="mt-3 flex items-center justify-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
      >
        {t.map.nodeDetail} <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

/** Medido y estimado del escenario; la estimación siempre lleva su etiqueta. */
function PeopleSummary({ measured, estimated }: { measured: number; estimated: number }) {
  const t = useT();
  const fmt = useFmt();
  return (
    <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 pb-1 text-xs">
      <span><span className="font-semibold tabular-nums text-foreground">{fmt(measured)}</span> <span className="text-muted-foreground">{t.map.measuredCovered}</span></span>
      <span><span className="font-semibold tabular-nums text-foreground">≈ {fmt(estimated)}</span> <span className="text-muted-foreground">{t.map.estimatedArea}</span> <EstimateTag /></span>
    </div>
  );
}

export function EstimateTag() {
  return <span className="ml-1 inline-block whitespace-nowrap rounded-full border border-dashed border-border px-1.5 py-px align-middle text-[10px] font-semibold text-muted-foreground">{ESTIMATE_LABEL}</span>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

function NodeList({ scenario, onSelect, selectedId }: { scenario: Scenario; onSelect: (id: string) => void; selectedId?: string | null }) {
  const t = useT();
  const fmt = useFmt();
  return (
    <ul className="flex flex-col gap-2">
      <li className="text-[11px] text-muted-foreground">{t.map.estimatedKey} <EstimateTag /></li>
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
                <span className="block text-xs text-muted-foreground">{t.map.listLine(fmt(n.snapshot.people), fmt(n.snapshot.estimated), fmt(n.snapshot.density))}</span>
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
  onToggle: () => void; onSeek: (m: number) => void; onSpeed: (s: number) => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-card px-3 py-2.5 shadow-float sm:flex-nowrap sm:gap-3">
      <button onClick={p.onToggle} aria-label={p.playing ? t.map.pause : t.map.play} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        {p.playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
      </button>
      <span className="hidden text-xs text-muted-foreground sm:inline">{fmtClock(p.start)}</span>
      <input
        type="range"
        aria-label={t.map.eventTime}
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


function Legend() {
  const t = useT();
  return (
    <div className="rounded-2xl bg-card/95 px-3 py-2 shadow-card backdrop-blur">
      <div className="flex items-center gap-3 text-xs font-semibold">
        <span>{t.map.low}</span>
        <span className="h-2 flex-1 rounded-full bg-density" />
        <span>{t.map.high}</span>
      </div>
      <p className="mt-1 flex items-start gap-1 text-[10px] leading-tight text-muted-foreground">
        <Info className="mt-px h-3 w-3 shrink-0" />
        {t.map.thresholds}
      </p>
    </div>
  );
}
