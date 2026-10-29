import type { Key, Locale } from "../i18n";

/** Pages of the site. Slugs are English in every locale (ADR 0006). */
export const pages = {
  home: { path: "", titleKey: "nav.home" },
  applications: { path: "applications", titleKey: "nav.applications" },
  technology: { path: "technology", titleKey: "nav.technology" },
  demo: { path: "demo", titleKey: "nav.demo" },
  research: { path: "research", titleKey: "nav.research" },
  contact: { path: "contact", titleKey: "nav.contact" },
  about: { path: "about", titleKey: "nav.about" },
  legalNotice: { path: "legal/legal-notice", titleKey: "legal.legalNotice.title" },
  privacy: { path: "legal/privacy", titleKey: "legal.privacy.title" },
  cookies: { path: "legal/cookies", titleKey: "legal.cookies.title" },
} as const satisfies Record<string, { path: string; titleKey: Key }>;

export type PageId = keyof typeof pages;

/** Site-relative URL of a page in a locale, e.g. `/en/contact`. */
export const pagePath = (locale: Locale, page: PageId) => `/${locale}/${pages[page].path}`;

/** Main navigation, in order. */
export const mainNav: PageId[] = ["home", "applications", "technology", "demo", "research", "contact"];

/** Footer navigation: the main links plus About, which is not in the header. */
export const footerNav: PageId[] = [...mainNav, "about"];

/** Footer legal links, with their labels. */
export const legalNav = [
  { page: "legalNotice", labelKey: "footer.legal" },
  { page: "privacy", labelKey: "footer.privacy" },
  { page: "cookies", labelKey: "footer.cookies" },
] as const satisfies readonly { page: PageId; labelKey: Key }[];
