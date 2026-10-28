import es from "./demo-entry.es.json";

/**
 * Copy for the demo entry screen and the demo header. Spanish only until the demo gets its own
 * i18n step; demo-entry.en.json is kept in sync (tested) for that step.
 */
export type DemoEntryKey = keyof typeof es;

export function demoText(key: DemoEntryKey, params?: Record<string, string | number>): string {
  const text = es[key];
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}
