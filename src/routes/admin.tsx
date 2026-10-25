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

function AdminPage() {
  const data = Route.useLoaderData();
  return (
    <AppShell>
      <div className="mx-auto max-w-md px-5 py-10">
        {data.authorized ? <Dashboard connected={data.analyticsConnected} /> : <Login />}
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

function Dashboard({ connected }: { connected: boolean }) {
  const router = useRouter();
  const logout = useServerFn(adminLogout);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-brand-ink">Analíticas</h1>
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
      <div className="rounded-2xl bg-card p-5 shadow-card text-sm">
        {connected ? (
          <p>Google Analytics activo (G-ZQHGE29VD1). Registra visitas por página y clics en nodos (evento <b>node_click</b>). Consulta las cifras en <a className="underline" href="https://analytics.google.com/" target="_blank" rel="noreferrer">Google Analytics</a> → Informes → Tiempo real / Eventos.</p>
        ) : (
          <p className="text-muted-foreground">
            Google Analytics aún no está conectado. Cuando tengas el ID de medición (G-…), lo conectamos y aquí verás
            las visitas y los clics en los nodos.
          </p>
        )}
      </div>
    </div>
  );
}
