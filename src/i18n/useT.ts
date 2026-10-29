import { useSearch } from "@tanstack/react-router";
import { dictionaries, type Lang } from "./dictionary";

/** Only `?lang=en` switches language; anything else (or no param) stays Spanish. */
export function parseLang(value: unknown): Lang {
  return value === "en" ? "en" : "es";
}

export function useLang(): Lang {
  return useSearch({ strict: false, select: (s) => parseLang(s.lang) });
}

export function useT() {
  return dictionaries[useLang()];
}

/** For route `head()`, which has no hooks: pass `match.search.lang`. */
export function tFor(lang: unknown) {
  return dictionaries[parseLang(lang)];
}

const numberLocale: Record<Lang, string> = { es: "es-ES", en: "en-GB" };

export function fmtNum(lang: Lang, value: number, options?: Intl.NumberFormatOptions) {
  return value.toLocaleString(numberLocale[lang], options);
}

export function useFmt() {
  const lang = useLang();
  return (value: number, options?: Intl.NumberFormatOptions) => fmtNum(lang, value, options);
}
