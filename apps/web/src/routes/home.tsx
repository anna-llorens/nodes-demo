import { createFileRoute } from "@tanstack/react-router";
import { DemoEntry } from "@/components/nodes/DemoEntry";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [
    { title: "Inicio · Eventos de València — NODES" },
    { name: "description", content: "Escenarios de afluencia de NODES para eventos en el exterior de València." },
    { property: "og:title", content: "Inicio · Eventos de València — NODES" },
    { property: "og:description", content: "Medio Maratón de València y escenarios de simulación de personas por zona." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: DemoEntry,
});