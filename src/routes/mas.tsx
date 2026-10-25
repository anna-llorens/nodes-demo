import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/nodes/AppShell";
import { SimBadge } from "@/components/nodes/Logo";

const features = [
  { t: "Mapa real de València", d: "Mapa abierto (OpenStreetMap / OpenFreeMap) con zoom y desplazamiento." },
  { t: "Recorrido real del Medio Maratón", d: "Trazado GPS de 21 km usado como referencia." },
  { t: "4 zonas con nodos", d: "Salida, Plaza del Ayuntamiento, punto de animación y meta, con anillos de 20 y 40 m." },
  { t: "Simulador reproducible", d: "Play/pausa, deslizador de hora con segundos y velocidades 1×, 10×, 60×, 100× y 200×." },
  { t: "Recuento de personas", d: "Escala de 30.000 corredores más público, separados en cada zona." },
  { t: "Indicadores por zona", d: "Densidad, entradas y salidas por minuto, velocidad, variación a 10 min y calzada/aceras." },
  { t: "Mapa de calor y flechas de flujo", d: "Cambian con la hora; se pueden encender y apagar en el panel de capas." },
  { t: "Botón de tráfico", d: "Tramos reales de calles (datos abiertos de València) en verde, amarillo o rojo según la hora." },
  { t: "Botón de info del nodo", d: "Ficha completa de la zona seleccionada sobre el mapa." },
  { t: "Adaptado a móvil, tablet y ordenador", d: "Barra inferior en móvil y barra lateral en ordenador." },
];

export const Route = createFileRoute("/mas")({
  head: () => ({
    meta: [
      { title: "Acerca de — NODES" },
      { name: "description", content: "Qué hace hoy el prototipo NODES: mapa real, simulador, tráfico y fichas de zona." },
      { property: "og:title", content: "Acerca de — NODES" },
      { property: "og:description", content: "Funcionalidades que ya funcionan en el prototipo NODES." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MasPage,
});

function MasPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-5 py-6 lg:py-10">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-brand-ink">Acerca de NODES</h1>
          <SimBadge className="lg:hidden" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Prototipo de nodos LiDAR temporales para medir densidad y flujo de personas en eventos de calle. Todas las cifras son simuladas.</p>
        <h2 className="mt-8 font-display text-lg font-bold text-brand-ink">Funcionalidades disponibles</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {features.map((f) => (
            <li key={f.t} className="flex gap-3 rounded-2xl bg-card p-4 shadow-card">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">{f.t}</p>
                <p className="text-xs text-muted-foreground">{f.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
