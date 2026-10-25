import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/inicio")({
  beforeLoad: () => { throw redirect({ to: "/home", replace: true, statusCode: 301 }); },
});
