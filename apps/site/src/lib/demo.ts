/** Scenarios of the demo (apps/web) that the site links to. Ids are stable (see CLAUDE.md). */
export type DemoScenario = "maraton" | "mascleta";

/**
 * Link to a localized demo scenario, or undefined when the demo URL is not configured.
 */
export function demoScenarioUrl(
  demoUrl: string | undefined,
  scenario: DemoScenario,
  locale: "es" | "en",
): string | undefined {
  if (!demoUrl) return undefined;
  const url = new URL(`${locale}/demo/map`, demoUrl.endsWith("/") ? demoUrl : `${demoUrl}/`);
  url.searchParams.set("scenario", scenario);
  return url.toString();
}
