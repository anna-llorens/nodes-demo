import { locales } from "../i18n";

/** One static page per locale, for routes under src/pages/[locale]/. */
export const localePaths = () => locales.map((locale) => ({ params: { locale } }));
