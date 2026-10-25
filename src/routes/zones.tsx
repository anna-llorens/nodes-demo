import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/nodes/AppShell";

export const Route = createFileRoute("/zones")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Zonas — NODES" },
      { name: "description", content: "Zonas del prototipo NODES (simulación)." },
      { property: "og:title", content: "Zonas — NODES" },
      { property: "og:description", content: "Zonas del prototipo NODES (simulación)." },
    ],
  }),
  component: () => (
    <AppShell>
      <ComingSoon title="Zonas" phase={3} />
    </AppShell>
  ),
});
