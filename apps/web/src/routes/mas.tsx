import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mas")({
  beforeLoad: () => { throw redirect({ to: "/about", replace: true, statusCode: 301 }); },
});
