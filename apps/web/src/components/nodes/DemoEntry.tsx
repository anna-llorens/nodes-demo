import { Routes } from "@/lib/routes";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import calendarSvg from "@nodes/ui/assets/icons/calendar.svg?raw";
import nodeSvg from "@nodes/ui/assets/icons/lidar-sensor.svg?raw";
import mapSvg from "@nodes/ui/assets/icons/map.svg?raw";
import skylineSvg from "@nodes/ui/assets/illustrations/skyline-footer.svg?raw";
import halfMarathonSvg from "@nodes/ui/assets/illustrations/scene-half-marathon.svg?raw";
import mascletaSvg from "@nodes/ui/assets/illustrations/scene-mascleta.svg?raw";
import { DemoHeader } from "./DemoHeader";
import { InlineSvg } from "./InlineSvg";
import { demoText, type DemoEntryKey } from "@/i18n/demo-entry";
import { getScenario } from "@/scenarios";

/** Demo entry (/ and /home): pick a scenario. No sidebar, no alerts bell. */
export function DemoEntry() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <DemoHeader />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-5xl px-5 pb-10 pt-12 text-center sm:px-8 lg:pt-20">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{demoText("demoEntry.eyebrow")}</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-brand-ink sm:text-4xl lg:text-5xl">{demoText("demoEntry.title")}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">{demoText("demoEntry.lead")}</p>

          <ul className="mt-10 grid gap-5 text-left md:grid-cols-2 lg:mt-14 lg:gap-6">
            <ScenarioCard id="maraton" copy="halfMarathon" scene={halfMarathonSvg} />
            <ScenarioCard id="mascleta" copy="mascleta" scene={mascletaSvg} />
          </ul>
        </div>
        <InlineSvg svg={skylineSvg} className="mt-auto block w-full text-primary/40 [&>svg]:h-auto" />
      </main>
    </div>
  );
}

function ScenarioCard({ id, copy, scene }: { id: "maraton" | "mascleta"; copy: "halfMarathon" | "mascleta"; scene: string }) {
  const scenario = getScenario(id);
  const key = (field: string) => `demoEntry.${copy}.${field}` as DemoEntryKey;
  const title = demoText(key("title"));
  return (
    <li className="flex">
      <Link
        to={Routes.map}
        search={id === "maraton" ? {} : { scenario: id }}
        aria-label={demoText("demoEntry.open", { name: title })}
        className="group flex w-full flex-col overflow-hidden rounded-3xl bg-card shadow-card ring-primary transition-shadow hover:ring-2 focus-visible:ring-2"
      >
        <div className="bg-gradient-to-br from-secondary to-accent text-primary">
          <InlineSvg svg={scene} className="block aspect-[900/340] w-full" />
        </div>
        <div className="flex flex-1 items-end justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold leading-tight text-brand-ink sm:text-2xl">{title}</h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <Meta icon={calendarSvg}>{demoText(key("time"))}</Meta>
              <Meta icon={mapSvg}>{demoText(key("place"))}</Meta>
              <Meta icon={nodeSvg}>{demoText(key("nodes"), { count: scenario.nodes.length })}</Meta>
            </ul>
          </div>
          <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-0.5">
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>
      </Link>
    </li>
  );
}

function Meta({ icon, children }: { icon: string; children: string }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <InlineSvg svg={icon} className="h-4 w-4 text-primary" />
      {children}
    </li>
  );
}
