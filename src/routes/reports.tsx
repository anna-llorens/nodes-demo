import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Users, Clock, MapPin, Radio, Download } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/nodes/AppShell";
import { Button } from "@/components/ui/button";
import { getScenario, scenarios } from "@/scenarios";
import { fmtClock, toMin } from "@/sim/engine";
import { buildReport, reportCsv } from "@/sim/reports";
import { tFor, useFmt, useT } from "@/i18n/useT";
import { useLocalizeScenario } from "@/i18n/scenarios";

export const Route = createFileRoute("/reports")({
  head: ({ match }) => {
    const t = tFor(match.search.lang).reports;
    return { meta: [
    { title: t.title },
    { name: "description", content: t.description },
    { property: "og:title", content: t.title },
    { property: "og:description", content: t.ogDescription },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] };
  },
  component: ReportsPage,
});

const tabs = ["summary", "compare", "density", "downloads"] as const;
const tooltipStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" };

function ReportsPage() {
  const t = useT();
  const fmt = useFmt();
  const ESTIMATE_LABEL = t.common.estimateLabel;
  const localize = useLocalizeScenario();
  const [tab, setTab] = useState<(typeof tabs)[number]>("summary");
  const [scenarioId, setScenarioId] = useState("maraton");
  const scenario = localize(getScenario(scenarioId));
  const [nodeId, setNodeId] = useState("all");
  const [start, setStart] = useState(scenario.schedule.start);
  const [end, setEnd] = useState(scenario.schedule.end);
  const selectScenario = (id: string) => {
    const next = getScenario(id);
    setScenarioId(next.id); setNodeId("all"); setStart(next.schedule.start); setEnd(next.schedule.end);
  };
  const hasRunners = scenario.nodes.some((node) => node.runnerShare);
  const [metric, setMetric] = useState("peak");
  const valid = toMin(start) < toMin(end);
  const report = useMemo(() => buildReport(scenario, toMin(start), toMin(end), nodeId), [scenario, start, end, nodeId]);
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob(["\uFEFF" + reportCsv(report)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `nodes-${scenario.id}-${start.replace(":", "")}-${end.replace(":", "")}.csv`;
    link.click(); URL.revokeObjectURL(url);
  };
  return <AppShell>
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-brand-ink">{t.reports.heading}</h1>
      </header>
      <label className="mt-2 grid max-w-md gap-1 text-xs font-semibold text-muted-foreground">{t.reports.scenario}
        <select aria-label={t.reports.scenarioAria} value={scenario.id} onChange={(event) => selectScenario(event.target.value)} className="h-10 min-w-0 rounded-lg border border-input bg-card px-3 text-sm font-semibold text-foreground">
          {scenarios.map(localize).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <div role="tablist" aria-label={t.reports.tabsAria} className="mt-5 grid grid-cols-4 border-b border-border">
        {tabs.map((item) => <Button key={item} role="tab" aria-selected={tab === item} variant="ghost" onClick={() => setTab(item)} className={`rounded-none border-b-2 px-1 text-xs sm:text-sm ${tab === item ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{t.reports.tabs[item]}</Button>)}
      </div>
      <div className="my-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="grid gap-1 text-xs font-semibold text-muted-foreground">{t.reports.zone}
          <select aria-label={t.reports.zoneAria} value={nodeId} onChange={(event) => setNodeId(event.target.value)} className="h-10 min-w-0 rounded-lg border border-input bg-card px-3 text-sm text-foreground">
            <option value="all">{t.reports.allZones}</option>{scenario.nodes.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-muted-foreground">{t.reports.from}<input type="time" aria-label={t.reports.from} min={scenario.schedule.start} max={scenario.schedule.end} value={start} onChange={(event) => setStart(event.target.value || scenario.schedule.start)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground" /></label>
        <label className="grid gap-1 text-xs font-semibold text-muted-foreground">{t.reports.to}<input type="time" aria-label={t.reports.to} min={scenario.schedule.start} max={scenario.schedule.end} value={end} onChange={(event) => setEnd(event.target.value || scenario.schedule.end)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground" /></label>
      </div>
      {!valid ? <p role="alert" className="text-destructive">{t.reports.invalid}</p> : <div role="tabpanel" aria-label={t.reports.tabs[tab]}>
        {tab === "summary" && <>
          <h2 className="mb-3 font-display text-sm font-bold">{t.reports.summaryHeading}</h2>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
            <Kpi icon={Users} label={t.reports.kpiMeasuredPeak} value={fmt(report.peak?.people ?? 0)} />
            <Kpi icon={Users} label={t.reports.kpiEstimatedPeak(fmtClock(report.peakEstimated?.minute ?? toMin(start)), ESTIMATE_LABEL)} value={`≈ ${fmt(report.peakEstimated?.estimated ?? 0)}`} />
            <Kpi icon={Clock} label={t.reports.kpiPeakTime} value={fmtClock(report.peak?.minute ?? toMin(start))} />
            <Kpi icon={MapPin} label={t.reports.kpiBusiest} value={report.busiest?.name ?? "—"} />
            <Kpi icon={Radio} label={t.reports.kpiNodes} value={`${report.zones.length} / ${scenario.nodes.length}`} />
          </div>
          <section className="mt-7">
            <h2 className="font-display text-sm font-bold">{t.reports.overTime}</h2>
            <div className="mt-3 h-72 w-full min-w-0 sm:h-80">
              <ResponsiveContainer width="100%" height="100%"><AreaChart data={report.series} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="time" minTickGap={40} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} /><YAxis width={48} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => fmt(value)} /><Legend />
                <Area type="monotone" dataKey="estimated" name={t.reports.seriesEstimated(ESTIMATE_LABEL)} stroke="var(--brand-ink)" fill="none" strokeDasharray="4 4" strokeWidth={1.5} />
                <Area type="monotone" dataKey="people" name={t.reports.seriesMeasured} stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.14} strokeWidth={2} />
                {hasRunners && <Area type="monotone" dataKey="runners" name={t.reports.seriesRunners} stroke="var(--dens-high)" fill="var(--dens-mid)" fillOpacity={0.12} strokeWidth={2} />}
              </AreaChart></ResponsiveContainer>
            </div>
          </section>
          <Comparison zones={report.zones} metric={metric} onMetric={setMetric} />
        </>}
        {tab === "compare" && <Comparison zones={report.zones} metric={metric} onMetric={setMetric} />}
        {tab === "density" && <section>
          <h2 className="font-display text-sm font-bold">{t.reports.densityHeading}</h2>
          <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-xs text-muted-foreground"><tr><th className="py-3 pr-4">{t.reports.zone}</th><th className="px-3">{t.reports.colPeakMeasured}</th><th className="px-3">{t.reports.colPeakEstimated}</th><th className="px-3">{t.reports.colTime}</th><th className="px-3">{t.reports.colHigh}</th><th className="px-3">{t.reports.colVeryHigh}</th></tr></thead><tbody>{report.zones.map((zone) => <tr key={zone.id} className="border-b border-border"><th className="py-4 pr-4 font-semibold">{zone.name}</th><td className="px-3 tabular-nums">{fmt(zone.peak)}</td><td className="px-3 tabular-nums">≈ {fmt(zone.peakEstimated)}</td><td className="px-3 tabular-nums">{fmtClock(zone.peakMinute)}</td><td className="px-3 tabular-nums text-dens-high">{zone.orange}</td><td className="px-3 tabular-nums text-dens-crit">{zone.red}</td></tr>)}</tbody></table></div>
          <p className="mt-2 text-xs text-muted-foreground">{t.reports.densityFootnote(ESTIMATE_LABEL)}</p>
        </section>}
        {tab === "downloads" && <section className="border-y border-border py-6">
          <h2 className="font-display text-lg font-bold">{t.reports.dataHeading}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.reports.dataMeta(start, end, report.zones.length, report.series.length)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t.reports.columns(ESTIMATE_LABEL)}</p>
          <Button onClick={exportCsv} className="mt-4"><Download />{t.reports.exportCsv}</Button>
        </section>}
      </div>}
    </div>
  </AppShell>;
}

function Kpi({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return <div className="flex min-w-0 flex-col items-start gap-2 rounded-lg bg-card p-4 shadow-card sm:flex-row sm:gap-3"><Icon className="mt-1 h-5 w-5 shrink-0 text-primary" /><div className="min-w-0"><p className="font-display text-base font-bold leading-snug sm:text-lg">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div></div>;
}

function Comparison({ zones, metric, onMetric }: { zones: ReturnType<typeof buildReport>["zones"]; metric: string; onMetric: (value: string) => void }) {
  const t = useT();
  return <section className="mt-7">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-sm font-bold">{t.reports.compareHeading}</h2><select aria-label={t.reports.metricAria} value={metric} onChange={(event) => onMetric(event.target.value)} className="h-9 rounded-lg border border-input bg-card px-3 text-xs"><option value="peak">{t.reports.metricPeak}</option><option value="density">{t.reports.metricDensity}</option></select></div>
    <div className="mt-3 h-80 w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={zones} layout="vertical" margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
      <CartesianGrid horizontal={false} stroke="var(--border)" /><XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} /><YAxis type="category" dataKey="name" width={115} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} /><Tooltip contentStyle={tooltipStyle} />
      {metric === "peak" ? <Bar dataKey="peak" name={t.reports.barPeak} fill="var(--primary)" radius={[0, 4, 4, 0]} /> : <><Bar dataKey="orange" name={t.reports.colHigh} stackId="density" fill="var(--dens-high)" /><Bar dataKey="red" name={t.reports.colVeryHigh} stackId="density" fill="var(--dens-crit)" /><Legend /></>}
    </BarChart></ResponsiveContainer></div>
  </section>;
}
