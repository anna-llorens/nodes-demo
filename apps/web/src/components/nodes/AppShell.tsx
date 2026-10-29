import { Routes } from "@/lib/routes";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Map, FileBarChart, MoreHorizontal, Layers, Bell } from "lucide-react";
import type { ReactNode } from "react";
import { DemoHeader } from "./DemoHeader";
import { SiteLogo } from "./Logo";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/data/hooks";
import { useSimClock } from "@/lib/sim-clock";
import { mapRoutePath, mapText, type MapLocale } from "@/i18n/map";

export const navItems = [
  { to: Routes.home, label: "Inicio", icon: Home },
  { to: Routes.map, label: "Mapa", icon: Map },
  { to: Routes.alerts, label: "Alertas", icon: Bell },
  { to: Routes.reports, label: "Informes", icon: FileBarChart },
  { to: Routes.about, label: "Más", icon: MoreHorizontal },
] as const;

export function AppShell({
  children,
  sidebarExtra,
  mapOnlyNavigation = false,
  mapLocale = "es",
}: {
  children: ReactNode;
  sidebarExtra?: ReactNode;
  mapOnlyNavigation?: boolean;
  mapLocale?: MapLocale;
}) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const clock = useSimClock();
  const alertCount = useAlerts(clock.scenarioId, clock.minute).length;
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* Barra lateral (ordenador) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex 2xl:w-72">
        <div className="px-6 pb-4 pt-6">
          <SiteLogo className="text-3xl" />
          <p className="mt-1 text-xs text-muted-foreground">
            {mapOnlyNavigation ? mapText(mapLocale, "sidebar.tagline") : "Datos para decidir a tiempo"}
          </p>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {mapOnlyNavigation ? (
            <a
              href={mapRoutePath(mapLocale)}
              aria-current={path === mapRoutePath(mapLocale) ? "page" : undefined}
              className="flex items-center gap-3 rounded-xl bg-sidebar-accent px-3 py-2.5 text-sm font-semibold text-sidebar-accent-foreground"
            >
              <Map className="h-[18px] w-[18px]" strokeWidth={1.8} />
              {mapText(mapLocale, "nav.map")}
            </a>
          ) : navItems.map((navItem) => {
            const active = navItem.to === Routes.home ? path === Routes.root || path === Routes.home : path.startsWith(navItem.to);
            return (
              <Link
                key={navItem.to}
                to={navItem.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-muted",
                )}
              >
                <navItem.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                {navItem.label}
                {navItem.to === Routes.alerts && <CountDot count={alertCount} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>
        {sidebarExtra && (
          <div className="mt-6 flex-1 overflow-y-auto border-t border-sidebar-border px-5 pt-5">{sidebarExtra}</div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <DemoHeader
          {...(mapOnlyNavigation ? {} : { alertCount })}
          {...(mapOnlyNavigation ? { mapLocale } : {})}
          hideLogoOnDesktop
        />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>

        {/* Barra inferior (móvil y tablet) */}
        <nav
          className={cn(
            "grid shrink-0 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden",
            mapOnlyNavigation ? "grid-cols-1" : "grid-cols-5",
          )}
        >
          {mapOnlyNavigation ? (
            <a
              href={mapRoutePath(mapLocale)}
              aria-current={path === mapRoutePath(mapLocale) ? "page" : undefined}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-primary"
            >
              <Map className="h-5 w-5" strokeWidth={2.2} />
              {mapText(mapLocale, "nav.map")}
            </a>
          ) : navItems.map((it) => {
            const active = it.to === Routes.home ? path === Routes.root || path === Routes.home : path.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span className="relative">
                  <it.icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.6} />
                  {it.to === Routes.alerts && <CountDot count={alertCount} className="absolute -right-2.5 -top-1.5" />}
                </span>
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/** Punto rojo con el número de alertas visibles (no se muestra si no hay ninguna). */
function CountDot({ count, className }: { count: number; className?: string }) {
  if (!count) return null;
  return <span className={cn("grid h-4 min-w-4 place-items-center rounded-full bg-dens-crit px-1 text-[10px] font-bold leading-none text-white", className)}>{count}</span>;
}

export function LayerToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm">
      <span className="flex items-center gap-2 text-foreground">
        <Layers className="h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary"
      />
    </label>
  );
}

export function ComingSoon({ title, phase }: { title: string; phase: number }) {
  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col px-5 py-6 lg:py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-brand-ink">{title}</h1>
      </div>
      <div className="mt-8 rounded-2xl bg-card p-8 text-center shadow-card">
        <p className="font-display text-lg font-semibold">Disponible en la fase {phase}</p>
        <p className="mt-2 text-sm text-muted-foreground">Esta pantalla forma parte del prototipo y se construirá más adelante.</p>
      </div>
    </div>
  );
}
