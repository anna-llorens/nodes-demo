import es from "./es.json";
import en from "./en.json";

/** Site locales, in the order shown by the language switcher. */
export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

/** A translation key; `es.json` is the reference and `en.json` must have the same keys. */
export type Key = keyof typeof es;

const dictionaries: Record<Locale, Record<Key, string>> = { es, en };

/** Translation for `key`, with `{name}` placeholders replaced by `params`. */
export function t(locale: Locale, key: Key, params?: Record<string, string | number>): string {
  const text = dictionaries[locale][key];
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

export const isLocale = (value: unknown): value is Locale => locales.includes(value as Locale);

/** Short code shown by the language switcher, e.g. "ES". */
export const localeCode = (locale: Locale) => locale.toUpperCase();
