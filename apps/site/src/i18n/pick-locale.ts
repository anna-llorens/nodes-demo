import type { Locale } from "./index";
import { SPANISH_SPEAKING_COUNTRIES } from "./spanish-speaking-countries";

/** Name of the cookie that stores the visitor's language choice. */
export const LOCALE_COOKIE = "nodes_lang";

/** Browser languages that get the Spanish site: Spanish, Catalan/Valencian, Galician, Basque. */
const SPANISH_LANGUAGES = ["es", "ca", "gl", "eu"];

export interface LocaleSignals {
  /** Value of the `nodes_lang` cookie, if any. */
  cookie?: string | null | undefined;
  /** Browser languages in preference order (`navigator.languages`). */
  languages?: readonly string[] | undefined;
  /** ISO country of the visit; only known at the edge. */
  country?: string | null | undefined;
}

/**
 * Language for the root page (ADR 0004): a saved choice first; then Spanish if any browser
 * language is es, ca, gl or eu; then Spanish if the visit comes from a Spanish-speaking
 * country; English otherwise. Pure, so the edge function can reuse it.
 */
export function pickLocale({ cookie, languages, country }: LocaleSignals): Locale {
  if (cookie === "es" || cookie === "en") return cookie;
  const primary = (tag: string) => tag.toLowerCase().split("-")[0] ?? "";
  if (languages?.some((tag) => SPANISH_LANGUAGES.includes(primary(tag)))) return "es";
  if (country && SPANISH_SPEAKING_COUNTRIES.includes(country.toUpperCase())) return "es";
  return "en";
}
