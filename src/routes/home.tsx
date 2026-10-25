import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/nodes/HomePage";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [
    { title: "Inicio · Eventos de València — NODES" },
    { name: "description", content: "Escenarios de afluencia de NODES para eventos de calle de València." },
    { property: "og:title", content: "Inicio · Eventos de València — NODES" },
    { property: "og:description", content: "Medio Maratón de València y escenarios de simulación de personas por zona." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: HomePage,
});