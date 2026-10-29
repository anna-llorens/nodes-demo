import { Routes } from "@/lib/routes";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { validateMapSearch } from "@/lib/map-share";

export const Route = createFileRoute("/demo/map")({
  validateSearch: validateMapSearch,
  beforeLoad: ({ search, context }) => {
    throw redirect({
      to: Routes.localizedDemoMap,
      params: { locale: context.locale },
      search,
      replace: true,
    });
  },
});
