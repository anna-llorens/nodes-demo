import type { Key, Locale } from "../i18n";

/** Pages of the site. Slugs stay in Spanish in both locales (ADR 0004). */
export const pages = {
  home: { path: "", titleKey: "nav.home" },
  technology: { path: "tecnologia", titleKey: "nav.technology" },
  about: { path: "sobre-nosotras", titleKey: "nav.about" },
  collaborate: { path: "colabora", titleKey: "nav.collaborate" },
  contact: { path: "contacto", titleKey: "collaborate.contact" },
  legalNotice: { path: "legal/aviso-legal", titleKey: "legal.legalNotice.title" },
  privacy: { path: "legal/privacidad", titleKey: "legal.privacy.title" },
  cookies: { path: "legal/cookies", titleKey: "legal.cookies.title" },
} as const satisfies Record<string, { path: string; titleKey: Key }>;

export type PageId = keyof typeof pages;

/** Site-relative URL of a page in a locale, e.g. `/en/colabora`. */
export const pagePath = (locale: Locale, page: PageId) => `/${locale}/${pages[page].path}`;

/** Main navigation, in order. The external "Demo" link goes after `technology`. */
export const mainNav: PageId[] = ["home", "technology", "about", "collaborate"];

/** Footer legal links, with their labels. */
export const legalNav: { page: PageId; labelKey: Key }[] = [
  { page: "legalNotice", labelKey: "footer.legal" },
  { page: "privacy", labelKey: "footer.privacy" },
  { page: "cookies", labelKey: "footer.cookies" },
];
