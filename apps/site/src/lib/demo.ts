/** Scenarios of the demo (apps/web) that the site links to. Ids are stable (see CLAUDE.md). */
export type DemoScenario = "maraton" | "mascleta";

/**
 * Link to a demo scenario, or undefined when the demo URL is not configured. Points at the
 * demo's map until the demo entry screen (M6) exists.
 */
export function demoScenarioUrl(demoUrl: string | undefined, scenario: DemoScenario): string | undefined {
  if (!demoUrl) return undefined;
  const url = new URL("map", demoUrl.endsWith("/") ? demoUrl : `${demoUrl}/`);
  url.searchParams.set("scenario", scenario);
  return url.toString();
}
