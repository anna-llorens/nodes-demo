import { demoEntryHead } from "@/i18n/demo-entry";
import { createFileRoute } from "@tanstack/react-router";
import { DemoEntry } from "@/components/nodes/DemoEntry";

export const Route = createFileRoute("/home")({
  head: ({ match }) => demoEntryHead(match.context.locale),
  component: DemoEntry,
});