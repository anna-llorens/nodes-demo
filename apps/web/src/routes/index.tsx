import { createFileRoute } from "@tanstack/react-router";
import { DemoEntry } from "@/components/nodes/DemoEntry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "NODES — Datos para decidir a tiempo en eventos de exterior" },
      { name: "description", content: "Prototipo de nodos LiDAR temporales para medir densidad y flujo en eventos en el exterior de València. Simulación." },
      { property: "og:title", content: "NODES — Datos para decidir a tiempo en eventos de exterior" },
      { property: "og:description", content: "Nodos LiDAR anónimos que cuentan personas por zona. Simulación para eventos de València." },
    ],
  }),
  component: DemoEntry,
});

