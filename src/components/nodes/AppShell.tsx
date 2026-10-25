import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Map, FileBarChart, MoreHorizontal, Layers } from "lucide-react";
import type { ReactNode } from "react";
import { Logo, SimBadge } from "./Logo";
import { cn } from "@/lib/utils";

export const navItems = [
  { to: "/home", label: "Inicio", icon: Home },
  { to: "/map", label: "Mapa", icon: Map },
  { to: "/reports", label: "Informes", icon: FileBarChart },
  { to: "/about", label: "Más", icon: MoreHorizontal },
] as const;

export function AppShell({ children, sidebarExtra }: { children: ReactNode; sidebarExtra?: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* Barra lateral (ordenador) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex 2xl:w-72">
        <div className="px-6 pb-4 pt-6">
          <Logo className="text-3xl" />
          <p className="mt-1 text-xs text-muted-foreground">Datos para decidir a tiempo</p>
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
                {it.label}
              </Link>
            );
          })}
        </nav>
        {sidebarExtra && (
          <div className="mt-6 flex-1 overflow-y-auto border-t border-sidebar-border px-5 pt-5">{sidebarExtra}</div>
        )}
        <div className="mt-auto p-5">
          <SimBadge />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>

        {/* Barra inferior (móvil y tablet) */}
        <nav className="grid shrink-0 grid-cols-4 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
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
                <it.icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.6} />
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
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
        <SimBadge className="lg:hidden" />
      </div>
      <div className="mt-8 rounded-2xl bg-card p-8 text-center shadow-card">
        <p className="font-display text-lg font-semibold">Disponible en la fase {phase}</p>
        <p className="mt-2 text-sm text-muted-foreground">Esta pantalla forma parte del prototipo y se construirá más adelante.</p>
      </div>
    </div>
  );
}
