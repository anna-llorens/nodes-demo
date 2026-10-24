import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/nodes/AppShell";

export const Route = createFileRoute("/mas")({
  head: () => ({
    meta: [
      { title: "Más — NODES" },
      { name: "description", content: "Más del prototipo NODES (simulación)." },
      { property: "og:title", content: "Más — NODES" },
      { property: "og:description", content: "Más del prototipo NODES (simulación)." },
    ],
  }),
  component: () => (
    <AppShell>
      <ComingSoon title="Más" phase={4} />
    </AppShell>
  ),
});
