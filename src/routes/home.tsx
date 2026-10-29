import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/nodes/HomePage";
import { tFor } from "@/i18n/useT";

export const Route = createFileRoute("/home")({
  head: ({ match }) => {
    const t = tFor(match.search.lang).home;
    return { meta: [
    { title: t.title },
    { name: "description", content: t.description },
    { property: "og:title", content: t.title },
    { property: "og:description", content: t.ogDescription },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] };
  },
  component: HomePage,
});