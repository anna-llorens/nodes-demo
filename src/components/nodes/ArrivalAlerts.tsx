import { Bell, ShieldCheck, TriangleAlert } from "lucide-react";
import type { LiveNode } from "@/scenarios/types";
import { arrivalDensityExceeded } from "@/sim/alerts";
import { cn } from "@/lib/utils";

const fmt = (value: number) => value.toLocaleString("es-ES", { maximumFractionDigits: 2 });

export function ArrivalAlerts({ node, threshold, onThreshold }: {
  node: LiveNode | undefined;
  threshold: number;
  onThreshold: (value: number) => void;
}) {
  const exceeded = arrivalDensityExceeded(node?.snapshot, threshold);
  return <section className="space-y-4" aria-label="Avisos de llegada">
    <h2 className="flex items-center gap-2 font-display text-sm font-bold text-brand-ink"><Bell className="h-4 w-4" />Avisos de llegada</h2>
    <div className={cn("rounded-lg border p-4", exceeded ? "border-destructive bg-destructive/10" : "border-border bg-card")}>
      <p className={cn("flex items-start gap-2 text-sm font-semibold", exceeded ? "text-destructive" : "text-primary")}>
        {exceeded ? <TriangleAlert className="h-5 w-5 shrink-0" /> : <ShieldCheck className="h-5 w-5 shrink-0" />}
        {exceeded ? "Umbral superado en llegada" : "Sin aviso de densidad en llegada"}
      </p>
      <p className="mt-3 font-display text-2xl font-bold tabular-nums">{node ? fmt(node.snapshot.density) : "—"}<span className="ml-1 text-xs font-medium text-muted-foreground">pers/m²</span></p>
      <p className="mt-1 text-xs text-muted-foreground">{node?.name ?? "Llegada"}{node ? ` · ${fmt(node.snapshot.people)} personas` : " · Nodo no disponible"}</p>
    </div>
    <label className="block text-sm font-semibold">
      <span className="flex flex-wrap items-center justify-between gap-2">Umbral de aviso<span className="tabular-nums text-brand-ink">{fmt(threshold)} pers/m²</span></span>
      <input type="range" aria-label="Umbral de aviso en llegada" min={0.5} max={7} step={0.1} value={threshold} onChange={(event) => onThreshold(Number(event.target.value))} className="mt-4 h-2 w-full cursor-pointer accent-primary" />
      <span className="mt-1 flex justify-between text-xs font-normal text-muted-foreground"><span>0,5 pers/m²</span><span>7 pers/m²</span></span>
    </label>
    <p className="text-xs text-muted-foreground">Límite de simulación, no un criterio de seguridad validado.</p>
  </section>;
}