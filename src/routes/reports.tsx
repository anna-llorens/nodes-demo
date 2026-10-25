import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Users, Clock, MapPin, Radio, Download } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/nodes/AppShell";
import { SimBadge } from "@/components/nodes/Logo";
import { Button } from "@/components/ui/button";
import { maraton } from "@/scenarios/maraton";
import { fmtClock, toMin } from "@/sim/engine";
import { buildReport, reportCsv } from "@/sim/reports";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [
    { title: "Informes de afluencia · NODES" },
    { name: "description", content: "Resumen del Medio Maratón de València: picos de afluencia, comparación de zonas y descarga de datos simulados." },
    { property: "og:title", content: "Informes de afluencia · NODES" },
    { property: "og:description", content: "Evolución de corredores y público, densidad por zona y descarga CSV del evento simulado." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ReportsPage,
});

const tabs = ["Resumen", "Comparativa", "Zonas", "Descargas"] as const;
const fmt = (value: number) => value.toLocaleString("es-ES");
const tooltipStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" };

function ReportsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Resumen");
  const [nodeId, setNodeId] = useState("all");
  const [start, setStart] = useState(maraton.schedule.start);
  const [end, setEnd] = useState(maraton.schedule.end);
  const [metric, setMetric] = useState("peak");
  const valid = toMin(start) < toMin(end);
  const report = useMemo(() => buildReport(maraton, toMin(start), toMin(end), nodeId), [start, end, nodeId]);
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob(["\uFEFF" + reportCsv(report)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `nodes-maraton-${start.replace(":", "")}-${end.replace(":", "")}.csv`;
    link.click(); URL.revokeObjectURL(url);
  };
  return <AppShell>
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-brand-ink">Informes</h1>
        <SimBadge />
      </header>
      <p className="mt-2 text-sm font-semibold">{maraton.name}</p>
      <div role="tablist" aria-label="Informes" className="mt-5 grid grid-cols-4 border-b border-border">
        {tabs.map((item) => <Button key={item} role="tab" aria-selected={tab === item} variant="ghost" onClick={() => setTab(item)} className={`rounded-none border-b-2 px-1 text-xs sm:text-sm ${tab === item ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{item}</Button>)}
      </div>
      <div className="my-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Zona
          <select aria-label="Zona del informe" value={nodeId} onChange={(event) => setNodeId(event.target.value)} className="h-10 min-w-0 rounded-lg border border-input bg-card px-3 text-sm text-foreground">
            <option value="all">Todas las zonas</option>{maraton.nodes.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Desde<input type="time" aria-label="Desde" min={maraton.schedule.start} max={maraton.schedule.end} value={start} onChange={(event) => setStart(event.target.value || maraton.schedule.start)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground" /></label>
        <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Hasta<input type="time" aria-label="Hasta" min={maraton.schedule.start} max={maraton.schedule.end} value={end} onChange={(event) => setEnd(event.target.value || maraton.schedule.end)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground" /></label>
      </div>
      {!valid ? <p role="alert" className="text-destructive">La hora final debe ser posterior a la inicial.</p> : <div role="tabpanel" aria-label={tab}>
        {tab === "Resumen" && <>
          <h2 className="mb-3 font-display text-sm font-bold">Resumen del evento</h2>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Kpi icon={Users} label="Personas en zonas · pico" value={fmt(report.peak?.people ?? 0)} />
            <Kpi icon={Clock} label="Hora del pico" value={fmtClock(report.peak?.minute ?? toMin(start))} />
            <Kpi icon={MapPin} label="Zona más concurrida" value={report.busiest?.name ?? "—"} />
            <Kpi icon={Radio} label="Nodos incluidos" value={`${report.zones.length} / ${maraton.nodes.length}`} />
          </div>
          <section className="mt-7">
            <h2 className="font-display text-sm font-bold">Afluencia a lo largo del tiempo</h2>
            <div className="mt-3 h-72 w-full min-w-0 sm:h-80">
              <ResponsiveContainer width="100%" height="100%"><AreaChart data={report.series} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="time" minTickGap={40} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} /><YAxis width={48} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => fmt(value)} /><Legend />
                <Area type="monotone" dataKey="people" name="Personas" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.14} strokeWidth={2} />
                <Area type="monotone" dataKey="runners" name="Corredores" stroke="var(--dens-high)" fill="var(--dens-mid)" fillOpacity={0.12} strokeWidth={2} />
              </AreaChart></ResponsiveContainer>
            </div>
          </section>
          <Comparison zones={report.zones} metric={metric} onMetric={setMetric} />
        </>}
        {tab === "Comparativa" && <Comparison zones={report.zones} metric={metric} onMetric={setMetric} />}
        {tab === "Zonas" && <section>
          <h2 className="font-display text-sm font-bold">Densidad por zona</h2>
          <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs text-muted-foreground"><tr><th className="py-3 pr-4">Zona</th><th className="px-3">Pico</th><th className="px-3">Hora</th><th className="px-3">Alta · min</th><th className="px-3">Muy alta · min</th></tr></thead><tbody>{report.zones.map((zone) => <tr key={zone.id} className="border-b border-border"><th className="py-4 pr-4 font-semibold">{zone.name}</th><td className="px-3 tabular-nums">{fmt(zone.peak)}</td><td className="px-3 tabular-nums">{fmtClock(zone.peakMinute)}</td><td className="px-3 tabular-nums text-dens-high">{zone.orange}</td><td className="px-3 tabular-nums text-dens-crit">{zone.red}</td></tr>)}</tbody></table></div>
        </section>}
        {tab === "Descargas" && <section className="border-y border-border py-6">
          <h2 className="font-display text-lg font-bold">Datos del evento</h2>
          <p className="mt-2 text-sm text-muted-foreground">{start}–{end} · {report.zones.length} zonas · {report.series.length} registros · Simulación</p>
          <Button onClick={exportCsv} className="mt-4"><Download />Exportar CSV</Button>
        </section>}
      </div>}
    </div>
  </AppShell>;
}

function Kpi({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return <div className="flex min-w-0 flex-col items-start gap-2 rounded-lg bg-card p-4 shadow-card sm:flex-row sm:gap-3"><Icon className="mt-1 h-5 w-5 shrink-0 text-primary" /><div className="min-w-0"><p className="font-display text-base font-bold leading-snug sm:text-lg">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div></div>;
}

function Comparison({ zones, metric, onMetric }: { zones: ReturnType<typeof buildReport>["zones"]; metric: string; onMetric: (value: string) => void }) {
  return <section className="mt-7">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-sm font-bold">Comparación de zonas</h2><select aria-label="Métrica de comparación" value={metric} onChange={(event) => onMetric(event.target.value)} className="h-9 rounded-lg border border-input bg-card px-3 text-xs"><option value="peak">Afluencia máxima</option><option value="density">Tiempo en densidad alta</option></select></div>
    <div className="mt-3 h-80 w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={zones} layout="vertical" margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
      <CartesianGrid horizontal={false} stroke="var(--border)" /><XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} /><YAxis type="category" dataKey="name" width={115} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} /><Tooltip contentStyle={tooltipStyle} />
      {metric === "peak" ? <Bar dataKey="peak" name="Personas · pico" fill="var(--primary)" radius={[0, 4, 4, 0]} /> : <><Bar dataKey="orange" name="Alta · min" stackId="density" fill="var(--dens-high)" /><Bar dataKey="red" name="Muy alta · min" stackId="density" fill="var(--dens-crit)" /><Legend /></>}
    </BarChart></ResponsiveContainer></div>
  </section>;
}
