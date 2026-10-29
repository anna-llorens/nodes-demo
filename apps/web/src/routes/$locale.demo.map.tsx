import { Routes } from "@/lib/routes";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ScenarioMap } from "./map";
import { getScenario } from "@/scenarios";
import { validateMapSearch } from "@/lib/map-share";
import { isMapLocale, mapText } from "@/i18n/map";

export const Route = createFileRoute("/$locale/demo/map")({
  validateSearch: validateMapSearch,
  beforeLoad: ({ params, search }) => {
    if (!isMapLocale(params.locale)) {
      throw redirect({ to: Routes.demoMap, search, replace: true });
    }
  },
  head: ({ params, match }) => {
    const locale = isMapLocale(params.locale) ? params.locale : "es";
    const scenario = getScenario(match.search.scenario, locale);
    return {
      meta: [
        { title: mapText(locale, "meta.title", { scenario: scenario.name }) },
        { name: "description", content: mapText(locale, "meta.description", { scenario: scenario.name }) },
      ],
    };
  },
  component: DemoMapPage,
});

function DemoMapPage() {
  const { locale: localeParam } = Route.useParams();
  const search = Route.useSearch();
  const locale = isMapLocale(localeParam) ? localeParam : "es";
  const scenario = getScenario(search.scenario, locale);
  return <ScenarioMap key={scenario.id} scenario={scenario} search={search} mapOnlyNavigation locale={locale} />;
}
