import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Map, FileBarChart, MoreHorizontal, Layers, Bell } from "lucide-react";
import type { ReactNode } from "react";
import { Logo, SimBadge } from "./Logo";
import { cn } from "@/lib/utils";
import { getScenario } from "@/scenarios";
import { visibleAlerts } from "@/sim/engine";
import { useSimClock } from "@/lib/sim-clock";
import { useLang, useT } from "@/i18n/useT";

export const navItems = [
  { to: "/home", key: "home", icon: Home },
  { to: "/map", key: "map", icon: Map },
  { to: "/alerts", key: "alerts", icon: Bell },
  { to: "/reports", key: "reports", icon: FileBarChart },
  { to: "/about", key: "about", icon: MoreHorizontal },
] as const;

export function AppShell({ children, sidebarExtra }: { children: ReactNode; sidebarExtra?: ReactNode }) {
  const t = useT();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const clock = useSimClock();
  const alertCount = visibleAlerts(getScenario(clock.scenarioId), clock.minute).length;
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* Barra lateral (ordenador) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex 2xl:w-72">
        <div className="px-6 pb-4 pt-6">
          <Logo className="text-3xl" />
          <p className="mt-1 text-xs text-muted-foreground">{t.shell.tagline}</p>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((it) => {
            const active = it.to === "/home" ? path === "/" || path === "/home" : path.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-muted",
                )}
              >
                <it.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                {t.shell.nav[it.key]}
                {it.to === "/alerts" && <CountDot count={alertCount} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>
        {sidebarExtra && (
          <div className="mt-6 flex-1 overflow-y-auto border-t border-sidebar-border px-5 pt-5">{sidebarExtra}</div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div aria-label={t.shell.dataStatus} className="flex shrink-0 items-center justify-end gap-3 border-b border-border bg-card px-4 py-2 sm:px-6">
          <LangSwitch />
          <SimBadge />
          <Link to="/alerts" aria-label={`${t.shell.nav.alerts}: ${alertCount}`} className="relative grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted">
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
            <CountDot count={alertCount} className="absolute -right-0.5 -top-0.5" />
          </Link>
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>

        {/* Barra inferior (móvil y tablet) */}
        <nav className="grid shrink-0 grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
          {navItems.map((it) => {
            const active = it.to === "/home" ? path === "/" || path === "/home" : path.startsWith(it.to);
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
                  {it.to === "/alerts" && <CountDot count={alertCount} className="absolute -right-2.5 -top-1.5" />}
                </span>
                {t.shell.nav[it.key]}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/** ES / EN: stays on the same page and only toggles `?lang=en`. */
function LangSwitch() {
  const t = useT();
  const lang = useLang();
  const item = (active: boolean) =>
    cn(
      "px-1.5 py-0.5 rounded-full",
      active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
    );
  return (
    <span
      aria-label={t.shell.language}
      className="inline-flex items-center rounded-full border border-border px-1 py-0.5 text-[11px] font-bold uppercase tracking-wide"
    >
      <Link
        to="."
        search={(prev) => ({ ...prev, lang: undefined })}
        hrefLang="es"
        className={item(lang === "es")}
      >
        ES
      </Link>
      <Link
        to="."
        search={(prev) => ({ ...prev, lang: "en" })}
        hrefLang="en"
        className={item(lang === "en")}
      >
        EN
      </Link>
    </span>
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
