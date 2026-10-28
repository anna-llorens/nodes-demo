import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/zones")({
  beforeLoad: () => { throw redirect({ to: "/map", replace: true, statusCode: 301 }); },
});
