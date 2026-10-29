import es from "./auth.es.json";
import en from "./auth.en.json";

export type AuthTextKey = keyof typeof es;
const dictionaries = { es, en };
export const authText = (locale: "es" | "en", key: AuthTextKey): string =>
  dictionaries[locale][key];
