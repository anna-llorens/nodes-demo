import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { Play, Users, X, ChevronDown, Info, Bell, Clock } from "lucide-react";
import type { LiveScenario as Scenario } from "@/scenarios/types";
import { densityLabel, densityLevel } from "@/scenarios/types";
import { SimBadge } from "./Logo";
import { SchematicMap } from "./SchematicMap";
import { cn } from "@/lib/utils";

const MapView = lazy(() => import("./MapView"));

export interface MapLayers {
  heat: boolean;
  rings: boolean;
  flow: boolean;
  route: boolean;
}

export const levelDot: Record<string, string> = {
  baja: "bg-dens-low",
  media: "bg-dens-mid",
  alta: "bg-dens-high",
  "muy-alta": "bg-dens-crit",
};

const fmt = (n: number) => n.toLocaleString("es-ES");

export function MapStage({ scenario, layers }: { scenario: Scenario; layers: MapLayers }) {
  const [selectedId, setSelectedId] = useState<string | null>("meta");
  const [fallback, setFallback] = useState(false);
  const [tab, setTab] = useState<"mapa" | "indicadores" | "alertas">("mapa");
  const selected = scenario.nodes.find((n) => n.id === selectedId) ?? null;
  const total = scenario.nodes.reduce((s, n) => s + n.snapshot.people, 0);

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
                  layers={layers}
                  selectedId={selectedId}
                  onSelect={(id) => setSelectedId(id)}
                  onError={() => setFallback(true)}
                />
              </Suspense>
            </ClientOnly>
          )}

          {/* Hora del evento (ordenador) */}
          <div className="absolute left-4 top-4 hidden rounded-2xl bg-card/95 px-4 py-3 shadow-float backdrop-blur lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Hora del evento</p>
            <p className="font-display text-3xl font-bold text-brand-ink">{scenario.snapshotTime}</p>
            <p className="text-xs text-muted-foreground">{fmt(total)} personas detectadas en zonas cubiertas</p>
          </div>

          {/* Burbuja del nodo */}
          {selected && (
            <div className="absolute left-1/2 top-4 w-[min(260px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl bg-card p-3.5 shadow-float lg:left-auto lg:right-14 lg:translate-x-0 xl:hidden">
              <NodeBubble node={selected} onClose={() => setSelectedId(null)} />
            </div>
          )}

          {/* Reproductor + leyenda */}
          <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2 sm:inset-x-6 sm:bottom-6 lg:left-1/2 lg:right-auto lg:w-[min(640px,calc(100%-3rem))] lg:-translate-x-1/2">
            <Player scenario={scenario} />
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
              <NodeBubble node={selected} onClose={() => setSelectedId(null)} detailed />
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

function NodeBubble({ node, onClose, detailed }: { node: Scenario["nodes"][number]; onClose: () => void; detailed?: boolean }) {
  const lvl = densityLevel(node.snapshot.density);
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground">{node.short}</p>
          <p className="truncate font-display font-semibold text-brand-ink">{node.name}</p>
        </div>
        <button onClick={onClose} aria-label="Cerrar" className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1 text-sm">{fmt(node.snapshot.people)} personas</p>
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
          <p className="col-span-2 text-[11px] text-muted-foreground">Calzada / aceras: estimado por zona</p>
        </div>
      )}
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

function Player({ scenario }: { scenario: Scenario }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card px-3 py-2.5 shadow-float">
      <button aria-label="Reproducir" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        <Play className="h-4 w-4 fill-current" />
      </button>
      <span className="hidden text-xs text-muted-foreground sm:inline">{scenario.schedule.start}</span>
      <div className="relative h-1.5 min-w-0 flex-1 rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 w-[64%] rounded-full bg-primary" />
        <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-primary bg-card" style={{ left: "calc(64% - 8px)" }} />
      </div>
      <span className="hidden text-xs text-muted-foreground sm:inline">{scenario.schedule.end}</span>
      <span className="shrink-0 font-display text-sm font-bold">{scenario.snapshotTime}</span>
      <div className="hidden shrink-0 rounded-full bg-muted p-0.5 text-xs font-semibold sm:flex">
        {["1×", "10×", "60×"].map((s, i) => (
          <span key={s} className={cn("rounded-full px-2 py-1", i === 0 ? "bg-card shadow-card" : "text-muted-foreground")}>{s}</span>
        ))}
      </div>
    </div>
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
