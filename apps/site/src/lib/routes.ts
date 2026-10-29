import type { Key, Locale } from "../i18n";

/** Pages of the site. Slugs are English in every locale (ADR 0006). */
export const pages = {
  home: { path: "", titleKey: "nav.home" },
  technology: { path: "technology", titleKey: "nav.technology" },
  about: { path: "about", titleKey: "nav.about" },
  collaborate: { path: "collaborate", titleKey: "nav.collaborate" },
  contact: { path: "contact", titleKey: "collaborate.contact" },
  legalNotice: { path: "legal/legal-notice", titleKey: "legal.legalNotice.title" },
  privacy: { path: "legal/privacy", titleKey: "legal.privacy.title" },
  cookies: { path: "legal/cookies", titleKey: "legal.cookies.title" },
} as const satisfies Record<string, { path: string; titleKey: Key }>;

export type PageId = keyof typeof pages;

/** Site-relative URL of a page in a locale, e.g. `/en/collaborate`. */
export const pagePath = (locale: Locale, page: PageId) => `/${locale}/${pages[page].path}`;

/** Main navigation, in order. The external "Demo" link goes after `technology`. */
export const mainNav: PageId[] = ["home", "technology", "about", "collaborate"];

/** Footer legal links, with their labels. */
export const legalNav = [
  { page: "legalNotice", labelKey: "footer.legal" },
  { page: "privacy", labelKey: "footer.privacy" },
  { page: "cookies", labelKey: "footer.cookies" },
] as const satisfies readonly { page: PageId; labelKey: Key }[];
