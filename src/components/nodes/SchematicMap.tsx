import type { LiveScenario as Scenario } from "@/scenarios/types";
import { densityLevel } from "@/scenarios/types";
import { cn } from "@/lib/utils";

const fillCls: Record<string, string> = {
  baja: "fill-dens-low",
  media: "fill-dens-mid",
  alta: "fill-dens-high",
  "muy-alta": "fill-dens-crit",
};

/** Plano esquemático SVG cuando el mapa base no está disponible. */
export function SchematicMap({ scenario, selectedId, onSelect }: { scenario: Scenario; selectedId: string | null; onSelect: (id: string) => void }) {
  const pts = [...(scenario.route ?? []), ...scenario.nodes.map((n) => n.lngLat)];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const W = 1000, H = 700, pad = 80;
  const sx = (x: number) => pad + ((x - minX) / (maxX - minX || 1)) * (W - pad * 2);
  const sy = (y: number) => H - pad - ((y - minY) / (maxY - minY || 1)) * (H - pad * 2);
  return (
    <div className="absolute inset-0 bg-muted">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {scenario.route && (
          <polyline
            points={scenario.route.map((p) => `${sx(p[0])},${sy(p[1])}`).join(" ")}
            className="fill-none stroke-brand-ink"
            strokeWidth={4}
            strokeDasharray="12 9"
            opacity={0.6}
          />
        )}
        {scenario.nodes.map((n) => {
          const x = sx(n.lngLat[0]), y = sy(n.lngLat[1]);
          return (
            <g key={n.id} onClick={() => onSelect(n.id)} className="cursor-pointer">
              <circle cx={x} cy={y} r={60} className={cn(fillCls[densityLevel(n.snapshot.density)])} opacity={0.35} />
              <circle cx={x} cy={y} r={44} className="fill-none stroke-primary" strokeWidth={2} strokeDasharray="6 6" />
              <circle cx={x} cy={y} r={24} className="fill-none stroke-primary" strokeWidth={2.5} />
              <circle cx={x} cy={y} r={11} className={cn("fill-primary stroke-card", selectedId === n.id && "stroke-brand-ink")} strokeWidth={4} />
              <text x={x} y={y + 82} textAnchor="middle" className="fill-foreground text-[22px] font-semibold">{n.name}</text>
            </g>
          );
        })}
      </svg>
      <p className="absolute left-4 top-4 rounded-full bg-card px-3 py-1 text-xs text-muted-foreground shadow-card lg:left-auto lg:right-4">
        Plano esquemático · recorrido aproximado
      </p>
    </div>
  );
}
