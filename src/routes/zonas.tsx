import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/zonas")({
  beforeLoad: () => { throw redirect({ to: "/zones", replace: true, statusCode: 301 }); },
});
