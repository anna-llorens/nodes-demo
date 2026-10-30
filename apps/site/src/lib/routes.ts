import type { Key, Locale } from "../i18n";

/** Pages of the site. Slugs are English in every locale (ADR 0006); each has its own meta description. */
export const pages = {
  home: { path: "", titleKey: "nav.home", descriptionKey: "meta.description" },
  applications: { path: "applications", titleKey: "nav.applications", descriptionKey: "applications.hero.lead" },
  technology: { path: "technology", titleKey: "nav.technology", descriptionKey: "tech.hero.lead" },
  demo: { path: "demo", titleKey: "nav.demo", descriptionKey: "demo.hero.lead" },
  research: { path: "research", titleKey: "nav.research", descriptionKey: "research.hero.lead" },
  contact: { path: "contact", titleKey: "nav.contact", descriptionKey: "contact.hero.lead" },
  about: { path: "about", titleKey: "nav.about", descriptionKey: "about.hero.lead" },
  legalNotice: { path: "legal/legal-notice", titleKey: "legal.legalNotice.title", descriptionKey: "legal.legalNotice.description" },
  privacy: { path: "legal/privacy", titleKey: "legal.privacy.title", descriptionKey: "legal.privacy.description" },
  cookies: { path: "legal/cookies", titleKey: "legal.cookies.title", descriptionKey: "legal.cookies.description" },
} as const satisfies Record<string, { path: string; titleKey: Key; descriptionKey: Key }>;

export type PageId = keyof typeof pages;

/** Site-relative URL of a page in a locale, e.g. `/en/contact`. */
export const pagePath = (locale: Locale, page: PageId) => `/${locale}/${pages[page].path}`;

/**
 * Main navigation, in order. Technology is hidden for now (its page is not built); restore it
 * after "research" together with its `getStaticPaths`.
 */
export const mainNav: PageId[] = ["home", "applications", "research", /* "technology", */ "demo", "about", "contact"];

/** Footer navigation: the same links as the header. */
export const footerNav: PageId[] = mainNav;

/** Footer legal links, with their labels. */
export const legalNav = [
  { page: "legalNotice", labelKey: "footer.legal" },
  { page: "privacy", labelKey: "footer.privacy" },
  { page: "cookies", labelKey: "footer.cookies" },
] as const satisfies readonly { page: PageId; labelKey: Key }[];
