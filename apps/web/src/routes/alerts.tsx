import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { ChevronRight, TriangleAlert, X } from "lucide-react";
import { AppShell } from "@/components/nodes/AppShell";
import { getScenario, scenarios } from "@/scenarios";
import { densityLabel } from "@/scenarios/types";
import { fmtClock, visibleAlerts, type DensityAlert } from "@/sim/engine";
import { selectSimScenario, useSimClock } from "@/lib/sim-clock";
import { cn } from "@/lib/utils";

const AlertsMap = lazy(() => import("@/components/nodes/AlertsMap"));

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alertas de densidad · NODES" },
      { name: "description", content: "Alertas de densidad alta y muy alta por nodo, según la hora del reproductor de la simulación." },
      { property: "og:title", content: "Alertas de densidad · NODES" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AlertsPage,
});

type Filter = "todas" | "very_high" | "high";
const pct = (v: number) => `${v >= 0 ? "+" : ""}${Math.round(v * 100)} %`;
const dens = (d: number) => d.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const tone = (a: DensityAlert) => (a.level === "very_high" ? "bg-dens-crit" : "bg-dens-high");

function AlertsPage() {
  const clock = useSimClock();
  const scenario = getScenario(clock.scenarioId);
  const alerts = useMemo(() => visibleAlerts(scenario, clock.minute), [scenario, clock.minute]);
  const [filter, setFilter] = useState<Filter>("todas");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const shown = filter === "todas" ? alerts : alerts.filter((a) => a.level === filter);
  const selected = alerts.find((a) => a.id === selectedId) ?? null;
  const count = (level: Filter) => (level === "todas" ? alerts.length : alerts.filter((a) => a.level === level).length);

  return (
    <AppShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-brand-ink">Alertas</h1>
            <p className="text-sm text-muted-foreground">Hasta las {fmtClock(clock.minute)} · hora del reproductor del mapa</p>
          </div>
          <select
            aria-label="Escenario de las alertas"
            value={scenario.id}
            onChange={(e) => { setSelectedId(null); selectSimScenario(e.target.value); }}
            className="h-10 max-w-full rounded-lg border border-input bg-card px-3 text-sm font-semibold"
          >
            {scenarios.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </header>

        {!mapFailed && (
          <section className="relative h-64 overflow-hidden rounded-2xl bg-muted shadow-card sm:h-80">
            <ClientOnly fallback={null}>
              <Suspense fallback={null}>
                <AlertsMap scenario={scenario} alerts={alerts} selectedId={selectedId} onSelect={setSelectedId} onError={() => setMapFailed(true)} />
              </Suspense>
            </ClientOnly>
            {selected && (
              <div className="absolute left-3 top-3 w-[min(260px,calc(100%-4rem))] rounded-2xl bg-card p-3 shadow-float">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-brand-ink">{densityLabel[selected.level]}</p>
                    <p className="truncate text-xs text-muted-foreground">{selected.node} · {selected.time}</p>
                  </div>
                  <button onClick={() => setSelectedId(null)} aria-label="Cerrar" className="rounded-full p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
                </div>
                <Link to="/node/$id" params={{ id: selected.nodeId }} search={{ t: selected.minute, alert: selected.id }} className="mt-2 flex items-center justify-between rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                  Abrir el nodo <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </section>
        )}

        <div role="tablist" aria-label="Filtrar alertas" className="flex flex-wrap gap-2">
          {(["todas", "very_high", "high"] as const).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn("rounded-full border px-3 py-1.5 text-sm font-semibold", filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground")}
            >
              {f === "todas" ? "Todas" : f === "very_high" ? "Muy alta" : "Alta"} ({count(f)})
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="rounded-2xl bg-card p-5 text-sm text-muted-foreground shadow-card">Sin alertas hasta las {fmtClock(clock.minute)}. Avanza el reproductor en el mapa para ver las siguientes.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {shown.map((a) => (
              <li key={a.id}>
                <Link
                  to="/node/$id"
                  params={{ id: a.nodeId }}
                  search={{ t: a.minute, alert: a.id }}
                  className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card hover:bg-muted/60"
                >
                  <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full text-white", tone(a))}>
                    <TriangleAlert className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{densityLabel[a.level]}</span>
                    <span className="block truncate text-sm text-muted-foreground">{a.node}</span>
                    <span className="block text-xs text-muted-foreground">Densidad: {dens(a.density)} pers/m² ({pct(a.variation10)})</span>
                  </span>
                  <span className="shrink-0 font-display text-sm font-bold tabular-nums">{a.time}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
