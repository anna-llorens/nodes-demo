import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/nodes/AppShell";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Informes — NODES" },
      { name: "description", content: "Informes del prototipo NODES (simulación)." },
      { property: "og:title", content: "Informes — NODES" },
      { property: "og:description", content: "Informes del prototipo NODES (simulación)." },
    ],
  }),
  component: () => (
    <AppShell>
      <ComingSoon title="Informes" phase={6} />
    </AppShell>
  ),
});
