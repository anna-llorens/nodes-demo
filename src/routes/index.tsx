import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/nodes/HomePage";
import { tFor } from "@/i18n/useT";

export const Route = createFileRoute("/")({
  head: ({ match }) => {
    const t = tFor(match.search.lang).index;
    return {
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: t.title },
      { name: "description", content: t.description },
      { property: "og:title", content: t.title },
      { property: "og:description", content: t.ogDescription },
    ],
    };
  },
  component: HomePage,
});

