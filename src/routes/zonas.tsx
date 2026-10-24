import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/nodes/AppShell";

export const Route = createFileRoute("/zonas")({
  head: () => ({
    meta: [
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
