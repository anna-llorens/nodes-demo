import { createFileRoute, redirect } from "@tanstack/react-router";
import { validateMapSearch } from "@/lib/map-share";

export const Route = createFileRoute("/demo/map")({
  validateSearch: validateMapSearch,
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/$locale/demo/map",
      params: { locale: "es" },
      search,
      replace: true,
    });
  },
});
