import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/nodo/$id")({
  validateSearch: (search: Record<string, unknown>) => ({ t: typeof search.t === "number" ? search.t : undefined }),
  beforeLoad: ({ params, search }) => { throw redirect({ to: "/node/$id", params, search: { t: typeof search.t === "number" ? search.t : undefined }, replace: true, statusCode: 301 }); },
});
