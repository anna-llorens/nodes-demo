import type { Locale } from "../i18n";
import { pages } from "./routes";

/** Legal pages, rendered from `src/content/legal/{locale}/{slug}.md`. */
export const legalPages = ["legalNotice", "privacy", "cookies"] as const;
export type LegalPage = (typeof legalPages)[number];

/** File slug of a legal page: the last part of its path, e.g. "privacidad". */
export const legalSlug = (page: LegalPage) => pages[page].path.replace("legal/", "");

/** Content collection id of a legal page in a locale, e.g. "es/privacidad". */
export const legalEntryId = (locale: Locale, page: LegalPage) => `${locale}/${legalSlug(page)}`;
