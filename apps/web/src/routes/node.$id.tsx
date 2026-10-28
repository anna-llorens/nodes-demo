import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Users, UsersRound, MapPin, TrendingUp, TrendingDown, LogIn, LogOut, Gauge, Route as RouteIcon, Footprints, TriangleAlert, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/nodes/AppShell";
import { EstimateTag, levelDot } from "@/components/nodes/MapStage";
import { findNode } from "@/scenarios";
import { kindLabel } from "@/labels/es";
import { ESTIMATE_LABEL, densityLabel, densityLevel, type DensityLevel } from "@/scenarios/types";
import { toMin, fmtClock } from "@nodes/core";
import { useAlerts, useNodeSeries, useSnapshot } from "@/data/hooks";
import { labelAlert } from "@/data/view";
import { cn } from "@/lib/utils";

const fmt = (n: number) => n.toLocaleString("es-ES");

export const Route = createFileRoute("/node/$id")({
  validateSearch: (s: Record<string, unknown>): { t?: number | undefined; alert?: string | undefined } => ({
    ...(typeof s["t"] === "number" ? { t: s["t"] } : {}),
    ...(typeof s["alert"] === "string" ? { alert: s["alert"] } : {}),
  }),
  loader: ({ params }) => {
    const found = findNode(params.id);
    if (!found) throw notFound();
    return { name: found.node.name, scenario: found.scenario.shortName };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Nodo"} · ${loaderData?.scenario ?? "Simulación"} — NODES` },
      { name: "description", content: `Afluencia y densidad simuladas en ${loaderData?.name ?? "el nodo"} (${loaderData?.scenario ?? "simulación"}).` },
      { property: "og:title", content: `${loaderData?.name ?? "Nodo"} · NODES` },
      { property: "og:description", content: "Evolución de la afluencia y distribución de la densidad por nodo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  notFoundComponent: () => <div className="p-8">Nodo no encontrado. <Link to="/map" className="text-primary underline">Volver al mapa</Link></div>,
  component: NodePage,
});

const LEVELS: DensityLevel[] = ["low", "medium", "high", "very_high"];

function NodePage() {
  const { id } = Route.useParams();
  const { t, alert: alertId } = Route.useSearch();
  const { scenario, node } = findNode(id)!;
  const start = toMin(scenario.schedule.start);
  const end = toMin(scenario.schedule.end);
  const [minute, setMinute] = useState(Math.round(t ?? toMin(scenario.defaultTime ?? scenario.schedule.start)));
  const st = useSnapshot(scenario.id, minute).nodes.find((n) => n.id === node.id)!;
  const raised = useAlerts(scenario.id, end).find((a) => a.id === alertId && a.nodeId === node.id);
  const fromAlert = alertId && raised ? labelAlert(scenario, raised) : undefined;
  const nodeSeries = useNodeSeries(scenario.id, node.id);
  const lvl = densityLevel(st.density);

  const series = useMemo(
    () => nodeSeries.points.map((s) => ({ m: s.minute, people: s.people, estimated: s.estimated, runners: s.runners, density: s.density })),
    [nodeSeries],
  );
  const dist = useMemo(() => {
    const c: Record<DensityLevel, number> = { low: 0, medium: 0, high: 0, very_high: 0 };
    series.forEach((p) => c[densityLevel(p.density)]++);
    return LEVELS.map((l) => ({ l, min: c[l], pct: c[l] / series.length }));
  }, [series]);
  const peak = series.reduce((a, b) => (b.people > a.people ? b : a), series[0]!);

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="relative">
          {node.image && (
            <img src={node.image} alt={node.name} width={1024} height={640} className="h-48 w-full object-cover sm:h-64 lg:h-72" />
          )}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 sm:p-4">
            <Link to="/map" search={scenario.id === "maraton" ? {} : { scenario: scenario.id }} className="flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-2 text-sm font-semibold shadow-float backdrop-blur hover:bg-card">
              <ArrowLeft className="h-4 w-4" /> Volver al mapa
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">{node.short} · {kindLabel[node.kind ?? "zone"]}</p>
            <h1 className="font-display text-2xl font-bold text-brand-ink sm:text-3xl">{node.name}</h1>
            {node.address && <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{node.address}</p>}
            {node.description && node.description !== node.address && <p className="mt-1 text-sm text-muted-foreground">{node.description}</p>}
          </div>

          {fromAlert && (
            <div className={cn("rounded-2xl border bg-card px-4 py-3 shadow-card", fromAlert.level === "very_high" ? "border-dens-crit" : "border-dens-high")}>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <TriangleAlert className={cn("h-4 w-4 shrink-0", fromAlert.level === "very_high" ? "text-dens-crit" : "text-dens-high")} />
                {densityLabel[fromAlert.level]} · {fromAlert.time} · {fromAlert.density.toLocaleString("es-ES", { minimumFractionDigits: 1 })} pers/m²
              </p>
              {fromAlert.suggestion && (
                <>
                  <p className="mt-1 text-sm">Sugerencia: {fromAlert.suggestion}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Basada en umbrales propuestos. La decisión es del responsable del dispositivo.</p>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-card">
            <span className="font-display text-lg font-bold tabular-nums">{fmtClock(minute)}</span>
            <input type="range" aria-label="Hora" min={start} max={end} step={1} value={minute} onChange={(e) => setMinute(Number(e.target.value))} className="h-1.5 flex-1 accent-primary" />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            <Kpi icon={Users} tone={TONE.green} label="Personas medidas" value={fmt(st.people)} sub={node.runnerShare ? `${fmt(st.runners)} corredores · ${fmt(st.spectators)} público` : "Densidad × área del círculo del nodo"} />
            <Kpi icon={Users} tone={TONE.slate} label="Estimadas en su zona" value={`≈ ${fmt(st.estimated)}`} sub={ESTIMATE_LABEL} />
            <Kpi icon={UsersRound} tone={TONE[lvl]} label="Densidad" value={`${st.density.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} pers/m²`} sub={densityLabel[lvl]} />
            <Kpi icon={st.variation10 > 0 ? TrendingUp : TrendingDown} tone={st.variation10 > 0 ? TONE.red : TONE.green} label="Variación 10 min" value={`${st.variation10 >= 0 ? "+" : ""}${Math.round(st.variation10 * 100)} %`} />
            <Kpi icon={LogIn} tone={TONE.green} label="Entrada" value={`${fmt(st.flowIn)} pers/min`} />
            <Kpi icon={LogOut} tone={TONE.softRed} label="Salida" value={`${fmt(st.flowOut)} pers/min`} />
            <Kpi icon={Gauge} tone={TONE.blue} label="Velocidad media" value={`${st.speed.toLocaleString("es-ES")} m/s`} />
            {st.roadway !== undefined && <Kpi icon={RouteIcon} tone={TONE.slate} label="En calzada" value={fmt(st.roadway)} sub="Estimado por zona" />}
            {st.sidewalk !== undefined && <Kpi icon={Footprints} tone={TONE.slate} label="En aceras" value={fmt(st.sidewalk)} sub="Estimado por zona" />}
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section className="rounded-2xl bg-card p-4 shadow-card">
              <h2 className="font-display font-bold text-brand-ink">Evolución de la afluencia</h2>
              <p className="text-xs text-muted-foreground">Pico: {fmt(peak.people)} personas medidas (≈ {fmt(peak.estimated)} estimadas) a las {fmtClock(peak.m)}</p>
              <FlowChart series={series} minute={minute} start={start} end={end} runners={Boolean(node.runnerShare)} />
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-primary" />Medidas</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-brand-ink" />Estimadas <EstimateTag /></span>
                {node.runnerShare && <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-dens-mid" />Corredores</span>}
              </div>
            </section>
            <section className="rounded-2xl bg-card p-4 shadow-card">
              <h2 className="font-display font-bold text-brand-ink">Distribución de la densidad</h2>
              <p className="text-xs text-muted-foreground">Tiempo en cada nivel ({scenario.schedule.start}–{scenario.schedule.end})</p>
              <ul className="mt-4 space-y-3">
                {dist.map((d) => (
                  <li key={d.l}>
                    <div className="flex justify-between text-sm"><span>{densityLabel[d.l]}</span><span className="font-semibold tabular-nums">{d.min} min</span></div>
                    <div className="mt-1 h-2.5 rounded-full bg-muted"><div className={cn("h-full rounded-full", levelDot[d.l])} style={{ width: `${d.pct * 100}%` }} /></div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/** Círculo de color suave (fondo al 15 %) con el icono en el color pleno. */
const TONE = {
  green: "bg-dens-low/15 text-dens-low",
  low: "bg-dens-low/15 text-dens-low",
  medium: "bg-dens-mid/15 text-dens-mid",
  high: "bg-dens-high/15 text-dens-high",
  very_high: "bg-dens-crit/15 text-dens-crit",
  red: "bg-dens-crit/15 text-dens-crit",
  softRed: "bg-red-400/15 text-red-400",
  blue: "bg-blue-500/15 text-blue-500",
  slate: "bg-slate-500/15 text-slate-500",
} as const;

function Kpi({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub?: React.ReactNode; icon: LucideIcon; tone: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-card p-3 shadow-card">
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", tone)}><Icon className="h-[18px] w-[18px]" strokeWidth={2} /></span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-display text-lg font-bold tabular-nums">{value}</p>
        {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

function FlowChart({ series, minute, start, end, runners }: { series: { m: number; people: number; estimated: number; runners: number }[]; minute: number; start: number; end: number; runners: boolean }) {
  const W = 600, H = 200;
  const max = Math.max(1, ...series.map((p) => p.estimated)) * 1.1;
  const x = (m: number) => ((m - start) / (end - start)) * W;
  const y = (v: number) => H - (v / max) * H;
  const line = (k: "people" | "estimated" | "runners") => series.map((p, i) => `${i ? "L" : "M"}${x(p.m).toFixed(1)},${y(p[k]).toFixed(1)}`).join(" ");
  const area = `${line("people")} L${W},${H} L0,${H} Z`;
  const ticks = [];
  for (let m = Math.ceil(start / 30) * 30; m <= end; m += 30) ticks.push(m);
  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="mt-3 w-full" role="img" aria-label="Evolución de la afluencia">
      <path d={area} className="fill-primary/15" />
      <path d={line("people")} className="fill-none stroke-primary" strokeWidth={2.5} />
      {runners && <path d={line("runners")} className="fill-none stroke-dens-mid" strokeWidth={2} strokeDasharray="5 4" />}
      <path d={line("estimated")} className="fill-none stroke-brand-ink" strokeWidth={1.5} strokeDasharray="2 4" />
      <line x1={x(minute)} x2={x(minute)} y1={0} y2={H} className="stroke-foreground" strokeWidth={1} strokeDasharray="3 3" />
      {ticks.map((m) => (
        <text key={m} x={x(m)} y={H + 15} textAnchor="middle" className="fill-muted-foreground text-[11px]">{fmtClock(m)}</text>
      ))}
    </svg>
  );
}
