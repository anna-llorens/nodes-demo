import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/nodes/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "NODES — Datos para decidir a tiempo en eventos de calle" },
      { name: "description", content: "Prototipo de nodos LiDAR temporales para medir densidad y flujo en eventos de calle de València. Simulación." },
      { property: "og:title", content: "NODES — Datos para decidir a tiempo en eventos de calle" },
      { property: "og:description", content: "Nodos LiDAR anónimos que cuentan personas por zona. Simulación para eventos de València." },
    ],
  }),
  component: HomePage,
});

