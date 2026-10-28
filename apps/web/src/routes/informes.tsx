import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/informes")({
  beforeLoad: () => { throw redirect({ to: "/reports", replace: true, statusCode: 301 }); },
});
