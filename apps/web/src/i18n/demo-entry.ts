import es from "./demo-entry.es.json";
import en from "./demo-entry.en.json";
import type { AppLocale } from "./locale";

/**
 * Localized copy for the demo entry screen and shared header.
 */
export type DemoEntryKey = keyof typeof es;

export function demoText(
  key: DemoEntryKey,
  params?: Record<string, string | number>,
  locale: AppLocale = "es",
): string {
  const text = (locale === "en" ? en : es)[key];
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** Matching localized metadata for both demo entry URLs. */
export function demoEntryHead(locale: AppLocale) {
  const title = `${demoText("demoEntry.title", undefined, locale)} — NODES`;
  const description = demoText("demoEntry.lead", undefined, locale);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}
