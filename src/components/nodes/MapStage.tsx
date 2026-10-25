import { ClientOnly, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { Play, Pause, Users, X, ChevronDown, Info, Bell, Clock, Car, ChevronRight } from "lucide-react";
import type { LiveScenario as Scenario, Scenario as RawScenario } from "@/scenarios/types";
import { simulate, toMin, fmtClock, trafficAt } from "@/sim/engine";
import { densityLabel, densityLevel } from "@/scenarios/types";
import { SimBadge } from "./Logo";
import { SchematicMap } from "./SchematicMap";
import { cn } from "@/lib/utils";

const MapView = lazy(() => import("./MapView"));

export interface MapLayers {
  heat: boolean;
  runners: boolean;
  rings: boolean;
  flow: boolean;
  route: boolean;
  traffic?: boolean;
}

export const levelDot: Record<string, string> = {
  baja: "bg-dens-low",
  media: "bg-dens-mid",
  alta: "bg-dens-high",
  "muy-alta": "bg-dens-crit",
};

const fmt = (n: number) => n.toLocaleString("es-ES");

export function MapStage({ scenario: base, layers }: { scenario: RawScenario; layers: MapLayers }) {
  const start = toMin(base.schedule.start);
  const end = toMin(base.schedule.end);
  const [minute, setMinute] = useState(base.id === "maraton" ? toMin("10:15") : start);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(10);
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
    return { ...base, nodes: base.nodes.map((n, i) => ({ ...n, snapshot: st[i]! })) };
  }, [base, tick]);
  const clock = fmtClock(minute, true);
  const trafficTick = Math.floor(minute);
  const traffic = useMemo(() => trafficAt(base, trafficTick), [base, trafficTick]);
  const [showTraffic, setShowTraffic] = useState(false);
  const mapLayers = { ...layers, traffic: showTraffic };
  const jammed = traffic.filter((t) => t.level === 3).length;
  const [selectedId, setSelectedId] = useState<string | null>("meta");
  const [fallback, setFallback] = useState(false);
  const [tab, setTab] = useState<"mapa" | "indicadores" | "alertas">("mapa");
  const selected = scenario.nodes.find((n) => n.id === selectedId) ?? null;
  const total = scenario.nodes.reduce((s, n) => s + n.snapshot.people, 0);
  const runners = scenario.nodes.reduce((s, n) => s + n.snapshot.runners, 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Cabecera */}
      <header className="shrink-0 border-b border-border bg-card px-4 pt-3 sm:px-6">
        <div className="flex flex-col-reverse items-start gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3">
          <button className="flex w-full min-w-0 items-center gap-1.5 text-left">
            <h1 className="truncate font-display text-lg font-bold text-brand-ink sm:text-xl">{scenario.name}</h1>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
          <SimBadge className="lg:hidden" />
          <span className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
            <Clock className="h-4 w-4" /> {scenario.schedule.start}–{scenario.schedule.end}
          </span>
        </div>
        <div className="mt-2 grid grid-cols-3 text-sm font-semibold lg:hidden">
          {(["mapa", "indicadores", "alertas"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "border-b-2 py-2.5 capitalize",
                tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground",
              )}
            >
              {t}
            </button>
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
                  layers={mapLayers}
                  traffic={traffic}
                  minute={tick}
                  selectedId={selectedId}
                  onSelect={(id) => setSelectedId(id)}
                  onError={() => setFallback(true)}
                />
              </Suspense>
            </ClientOnly>
          )}

          {/* Controles + hora del evento */}
          <div className="absolute left-3 top-3 flex max-w-[calc(100%-4.5rem)] flex-col items-start gap-2 sm:left-4 sm:top-4">
            <div className="flex flex-wrap gap-2">
              <MapButton active={showTraffic} onClick={() => setShowTraffic((v) => !v)} icon={<Car className="h-4 w-4" />} label="Tráfico" />
            </div>
            {showTraffic && (
              <div className="rounded-xl bg-card/95 px-3 py-2 text-xs shadow-card backdrop-blur">
                <div className="flex items-center gap-3 font-semibold">
                  <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded-full bg-dens-low" />Fluido</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded-full bg-dens-mid" />Denso</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded-full bg-dens-crit" />Congestionado</span>
                </div>
                <p className="mt-1 text-muted-foreground">{jammed} tramos congestionados · calles cortadas {base.closure?.start}–{base.closure?.end}</p>
              </div>
            )}
            <div className="hidden rounded-2xl bg-card/95 px-4 py-3 shadow-float backdrop-blur lg:block">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Hora del evento</p>
              <p className="font-display text-3xl font-bold tabular-nums text-brand-ink">{clock}</p>
              <p className="text-xs text-muted-foreground">{fmt(total)} personas en zonas cubiertas</p>
              <p className="text-xs text-muted-foreground">{fmt(runners)} corredores · {fmt(total - runners)} público{base.participants ? ` · ${fmt(base.participants)} inscritos` : ""}</p>
            </div>
          </div>

          {/* Burbuja del nodo */}
          {selected && (
            <div className="absolute left-1/2 top-16 w-[min(260px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl bg-card p-3.5 shadow-float lg:left-auto lg:right-14 lg:translate-x-0 xl:hidden">
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

        {/* Indicadores / alertas en móvil */}
        {tab !== "mapa" && (
          <div className="flex-1 overflow-y-auto p-4 lg:hidden">
            {tab === "indicadores" ? <ZoneList scenario={scenario} onSelect={(id) => { setSelectedId(id); setTab("mapa"); }} /> : <AlertsPlaceholder />}
          </div>
        )}

        {/* Panel derecho (ordenador) */}
        <aside className="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-background p-4 xl:flex 2xl:w-96">
          {selected ? (
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <NodeBubble minute={minute} node={selected} onClose={() => setSelectedId(null)} detailed />
            </div>
          ) : (
            <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-card">Toca un nodo del mapa para ver su zona.</p>
          )}
          <div>
            <h2 className="mb-2 font-display text-sm font-bold text-brand-ink">Zonas</h2>
            <ZoneList scenario={scenario} onSelect={setSelectedId} selectedId={selectedId} />
          </div>
          <AlertsPlaceholder />
        </aside>
      </div>
    </div>
  );
}

function NodeBubble({ node, onClose, detailed, minute }: { node: Scenario["nodes"][number]; onClose: () => void; detailed?: boolean; minute: number }) {
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
        <button onClick={onClose} aria-label="Cerrar" className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      {detailed && node.description && <p className="mt-1 text-xs text-muted-foreground">{node.description}</p>}
      <p className="mt-1 text-sm">{fmt(node.snapshot.people)} personas</p>
      <p className="text-xs text-muted-foreground">{fmt(node.snapshot.runners)} corredores · {fmt(node.snapshot.spectators)} público</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className={cn("h-2.5 w-2.5 rounded-full", levelDot[lvl])} />
        {densityLabel[lvl]} · {node.snapshot.density.toLocaleString("es-ES")} pers/m²
      </p>
      {detailed && node.snapshot.roadway !== undefined && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="En calzada" value={fmt(node.snapshot.roadway)} />
          <Stat label="En aceras" value={fmt(node.snapshot.sidewalk ?? 0)} />
          <Stat label="Entrada" value={`${node.snapshot.flowIn} pers/min`} />
          <Stat label="Salida" value={`${node.snapshot.flowOut} pers/min`} />
          <Stat label="Variación 10 min" value={`${node.snapshot.variation10 >= 0 ? "+" : ""}${Math.round(node.snapshot.variation10 * 100)} %`} />
          <Stat label="Velocidad media" value={`${node.snapshot.speed.toLocaleString("es-ES")} m/s`} />
          <p className="col-span-2 text-[11px] text-muted-foreground">Calzada / aceras: estimado por zona</p>
        </div>
      )}
      <Link
        to="/node/$id"
        params={{ id: node.id }}
        search={{ t: Math.round(minute) }}
        className="mt-3 flex items-center justify-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
      >
        Ver detalle del nodo <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

function ZoneList({ scenario, onSelect, selectedId }: { scenario: Scenario; onSelect: (id: string) => void; selectedId?: string | null }) {
  return (
    <ul className="flex flex-col gap-2">
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
                <span className="block text-xs text-muted-foreground">{fmt(n.snapshot.people)} personas · {n.snapshot.density.toLocaleString("es-ES")} pers/m²</span>
              </span>
              <span className={cn("h-3 w-3 shrink-0 rounded-full", levelDot[lvl])} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function AlertsPlaceholder() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/60 p-4">
      <p className="flex items-center gap-2 font-display text-sm font-bold text-brand-ink"><Bell className="h-4 w-4" /> Alertas activas</p>
      <p className="mt-1 text-xs text-muted-foreground">Las alertas llegan en la fase 4.</p>
    </div>
  );
}

function Player(p: {
  start: number; end: number; minute: number; clock: string; playing: boolean; speed: number;
  onToggle: () => void; onSeek: (m: number) => void; onSpeed: (s: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-card px-3 py-2.5 shadow-float sm:flex-nowrap sm:gap-3">
      <button onClick={p.onToggle} aria-label={p.playing ? "Pausar" : "Reproducir"} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        {p.playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
      </button>
      <span className="hidden text-xs text-muted-foreground sm:inline">{fmtClock(p.start)}</span>
      <input
        type="range"
        aria-label="Hora del evento"
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

function MapButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold shadow-float transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Legend() {
  return (
    <div className="rounded-2xl bg-card/95 px-3 py-2 shadow-card backdrop-blur">
      <div className="flex items-center gap-3 text-xs font-semibold">
        <span>Baja</span>
        <span className="h-2 flex-1 rounded-full bg-density" />
        <span>Alta</span>
      </div>
      <p className="mt-1 flex items-start gap-1 text-[10px] leading-tight text-muted-foreground">
        <Info className="mt-px h-3 w-3 shrink-0" />
        Umbrales propuestos (supuesto). Densidad crítica de referencia: 8–10 pers/m². Anillos: 20 m zona objetivo V1 · 40 m alcance nominal.
      </p>
    </div>
  );
}
