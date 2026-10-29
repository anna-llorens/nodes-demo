export type AppLocale = "es" | "en";
export interface AppLanguageSearch {
  lang?: AppLocale;
}

/** Explicit locale paths take priority over a language passed between app hosts. */
export function requestedLocale(pathname: string, lang: unknown): AppLocale | undefined {
  const prefix = pathname.split("/")[1];
  if (prefix === "es" || prefix === "en") return prefix;
  return lang === "es" || lang === "en" ? lang : undefined;
}

export function validateLanguageSearch(search: Record<string, unknown>): AppLanguageSearch {
  const lang = requestedLocale("/", search["lang"]);
  return lang ? { lang } : {};
}
