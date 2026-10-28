import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/zonas")({
  beforeLoad: () => { throw redirect({ to: "/map", replace: true, statusCode: 301 }); },
});
