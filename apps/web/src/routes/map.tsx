import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/nodes/AppShell";
import { MapStage, type MapLayers } from "@/components/nodes/MapStage";
import { getScenario } from "@/scenarios";
import type { Scenario } from "@/scenarios/types";
import { scenarioBounds } from "@/components/nodes/geo";
import { DEFAULT_SPEED, readMapCache, restoreFromCache, restoreMapState, validateMapSearch, writeMapCache, type MapSearch } from "@/lib/map-share";
import { mapText, type MapLocale } from "@/i18n/map";
import { useAppLocale } from "@/i18n/locale-context";

export const Route = createFileRoute("/map")({
  validateSearch: validateMapSearch,
  head: ({ match }) => {
    const locale = match.context.locale;
    const scenario = getScenario(match.search.scenario, locale);
    return {
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: mapText(locale, "meta.title", { scenario: scenario.name }) },
      { name: "description", content: mapText(locale, "meta.description", { scenario: scenario.name }) },
      { property: "og:title", content: mapText(locale, "meta.title", { scenario: scenario.name }) },
      { property: "og:description", content: mapText(locale, "meta.description", { scenario: scenario.name }) },
    ],
    };
  },
  component: MapaPage,
});

function MapaPage() {
  const locale = useAppLocale();
  const search = Route.useSearch();
  // Resolve shared IDs against the configured scenarios; unknown IDs fall back to the marathon.
  const scenario = getScenario(search.scenario, locale);
  return <ScenarioMap key={scenario.id} scenario={scenario} search={search} locale={locale} />;
}

export function ScenarioMap({
  scenario,
  search,
  locale = "es",
}: {
  scenario: Scenario;
  search: MapSearch;
  locale?: MapLocale;
}) {
  const [initial, setInitial] = useState(() => ({ ...restoreMapState(search, scenario), speed: DEFAULT_SPEED }));
  // Scenarios that ask for it open framing every node and polygon unless a link or the cache brings a camera.
  const [fit, setFit] = useState(Boolean(scenario.fitToZones && !search.camera));
  const [layers, setLayers] = useState<MapLayers>(initial.layers);
  const [restored, setRestored] = useState(false);
  // Shared links win; otherwise resume the browser's cached map state after hydration.
  useEffect(() => {
    const hasLink = [search.layers, search.camera, search.palette, search.time].some((v) => v !== undefined);
    const cache = hasLink ? null : readMapCache(scenario.id);
    if (cache) {
      const next = restoreFromCache(cache, scenario);
      setInitial(next);
      setLayers(next.layers);
      if (cache.camera) setFit(false);
    }
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (restored) writeMapCache({ layers }, scenario.id); }, [layers, restored, scenario.id]);
  const setLayer = (key: keyof MapLayers, value: boolean) => setLayers((current) => ({ ...current, [key]: value }));
  return (
    <AppShell
      sidebarExtra={
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{mapText(locale, "sidebar.scenario")}</p>
            <p className="mt-1 font-display font-semibold text-brand-ink">{scenario.name}</p>
            <p className="text-xs text-muted-foreground">{mapText(locale, "sidebar.simulation")} · {scenario.schedule.start}–{scenario.schedule.end}</p>
          </div>
          {/* Hueco donde MapStage monta el panel de capas en ordenador */}
          <div id="map-layers-slot" />
        </div>
      }
      mapLocale={locale}
    >
      {restored && <MapStage scenario={scenario} layers={layers} onLayerChange={setLayer} initialCamera={initial.camera} {...(fit ? { fitBounds: scenarioBounds(scenario) } : {})} initialPalette={initial.palette} initialMinute={initial.time} initialSpeed={initial.speed} locale={locale} />}
    </AppShell>
  );
}
