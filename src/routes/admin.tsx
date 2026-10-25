import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/nodes/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminLogin, adminLogout, getAdminMetrics } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  loader: () => getAdminMetrics(),
  head: () => ({
    meta: [
      { title: "Administración — NODES" },
      { name: "description", content: "Panel privado de analíticas de NODES." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Administración — NODES" },
      { property: "og:description", content: "Panel privado de analíticas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Metrics = Extract<Awaited<ReturnType<typeof getAdminMetrics>>, { authorized: true }>;

function AdminPage() {
  const data = Route.useLoaderData();
  return (
    <AppShell>
      <div className={data.authorized ? "mx-auto max-w-4xl px-5 py-8" : "mx-auto max-w-md px-5 py-10"}>
        {data.authorized ? <Dashboard m={data} /> : <Login />}
      </div>
    </AppShell>
  );
}

function Login() {
  const router = useRouter();
  const login = useServerFn(adminLogin);
  const [error, setError] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await login({ data: { user: String(f.get("user")), password: String(f.get("password")) } });
    if (r.ok) await router.invalidate();
    else setError(true);
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-2xl bg-card p-6 shadow-card">
      <h1 className="font-display text-xl font-bold text-brand-ink">Acceso administrador</h1>
      <Input name="user" placeholder="Usuario" autoComplete="username" required />
      <Input name="password" type="password" placeholder="Contraseña" autoComplete="current-password" required />
      {error && <p className="text-sm text-destructive">Usuario o contraseña incorrectos</p>}
      <Button type="submit">Entrar</Button>
    </form>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold text-brand-ink">{value}</p>
    </div>
  );
}

function Bars({ title, rows, empty }: { title: string; rows: { label: string; value: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="rounded-2xl bg-card p-5 shadow-card">
      <h2 className="mb-3 font-display font-semibold text-brand-ink">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.label} className="text-sm">
              <div className="flex justify-between gap-2">
                <span className="truncate">{r.label}</span>
                <span className="font-semibold">{r.value}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted">
                <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Dashboard({ m }: { m: Metrics }) {
  const router = useRouter();
  const logout = useServerFn(adminLogout);
  const maxDay = Math.max(1, ...m.days.map((d) => d.value));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-brand-ink">Analíticas</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.invalidate()}>Actualizar</Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await logout();
              await router.invalidate();
            }}
          >
            Salir
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Usuarios hoy" value={m.usersToday} />
        <Kpi label="Usuarios 7 días" value={m.users7d} />
        <Kpi label="Usuarios 30 días" value={m.users30d} />
        <Kpi label="Sesiones 7 días" value={m.sessions7d} />
        <Kpi label="Visitas hoy" value={m.viewsToday} />
        <Kpi label="Visitas 7 días" value={m.views7d} />
        <Kpi label="Visitas totales" value={m.viewsTotal} />
        <Kpi label="Clics en nodos (30 d)" value={m.clicks30d} />
        <Kpi label="Desde móvil" value={`${m.mobileShare}%`} />
      </div>
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <h2 className="mb-3 font-display font-semibold text-brand-ink">Visitas por día (14 días)</h2>
        <div className="flex h-32 items-end gap-1">
          {m.days.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-1" title={`${d.label}: ${d.value} visitas · ${d.users} usuarios`}>
              <div className="w-full rounded-t bg-primary" style={{ height: `${(d.value / maxDay) * 100}%`, minHeight: d.value ? 2 : 0 }} />
              <span className="text-[9px] text-muted-foreground">{d.label.slice(3)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Bars title="Nodos más consultados (mapa)" rows={m.nodes} empty="Aún no hay clics en nodos." />
        <Bars title="Vistas de fichas de nodo (/node/…)" rows={m.nodePages} empty="Aún no hay vistas de fichas." />
        <Bars title="Páginas más visitadas" rows={m.pages} empty="Aún no hay visitas." />
        <Bars title={`Clics por página (${m.uiClicks30d})`} rows={m.clicksByPage} empty="Aún no hay clics." />
        <Bars title="Botones y enlaces más pulsados" rows={m.topClicks} empty="Aún no hay clics." />
      </div>
      <p className="text-xs text-muted-foreground">
        Seguimiento interno anónimo. Google Analytics (G-ZQHGE29VD1) sigue activo en paralelo.
      </p>
    </div>
  );
}
