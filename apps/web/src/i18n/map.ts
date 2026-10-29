import { localizedDemoMapPath } from "@/lib/routes";
import en from "./map.en.json";
import es from "./map.es.json";
import type { DensityLevel, SuggestionCode } from "@nodes/core";

export const mapLocales = ["es", "en"] as const;
export type MapLocale = (typeof mapLocales)[number];
export type MapTextKey = keyof typeof es;

const dictionaries: Record<MapLocale, Record<MapTextKey, string>> = { es, en };

export function isMapLocale(value: unknown): value is MapLocale {
  return typeof value === "string" && mapLocales.includes(value as MapLocale);
}

export const mapRoutePath = localizedDemoMapPath;

export const mapDensityLabel = (locale: MapLocale): Record<DensityLevel, string> => ({
  low: mapText(locale, "density.low"),
  medium: mapText(locale, "density.medium"),
  high: mapText(locale, "density.high"),
  very_high: mapText(locale, "density.veryHigh"),
});

export const mapSuggestionLabel = (locale: MapLocale): Record<SuggestionCode, string> => ({
  divert_to_gran_via: mapText(locale, "suggestion.divert"),
  open_side_exit: mapText(locale, "suggestion.exit"),
});

export const mapEstimateLabel = (locale: MapLocale) => mapText(locale, "estimate.label");

export function mapText(locale: MapLocale, key: MapTextKey, params?: Record<string, string | number>): string {
  const text = dictionaries[locale][key];
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}
