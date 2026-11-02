import type { Key, Locale } from "../i18n";

/**
 * Pages of the site. Slugs are English in every locale (ADR 0006). `navKey` is the visible label
 * (menu, footer, legal heading); `titleKey` and `descriptionKey` feed <title> and the meta
 * description. Section pages have their own `meta.<page>.*` keys; the others reuse their label
 * and lead.
 */
export const pages = {
  home: { path: "", navKey: "nav.home", titleKey: "nav.home", descriptionKey: "meta.description" },
  applications: { path: "applications", navKey: "nav.applications", titleKey: "meta.applications.title", descriptionKey: "meta.applications.description" },
  technology: { path: "technology", navKey: "nav.technology", titleKey: "nav.technology", descriptionKey: "tech.hero.lead" },
  demo: { path: "demo", navKey: "nav.demo", titleKey: "meta.demo.title", descriptionKey: "meta.demo.description" },
  research: { path: "research", navKey: "nav.research", titleKey: "meta.research.title", descriptionKey: "meta.research.description" },
  contact: { path: "contact", navKey: "nav.contact", titleKey: "meta.contact.title", descriptionKey: "meta.contact.description" },
  about: { path: "about", navKey: "nav.about", titleKey: "meta.about.title", descriptionKey: "meta.about.description" },
  capacityCalculator: { path: "capacity-calculator", navKey: "nav.capacityCalculator", titleKey: "meta.capacityCalculator.title", descriptionKey: "meta.capacityCalculator.description" },
  legalNotice: { path: "legal/legal-notice", navKey: "legal.legalNotice.title", titleKey: "legal.legalNotice.title", descriptionKey: "legal.legalNotice.description" },
  privacy: { path: "legal/privacy", navKey: "legal.privacy.title", titleKey: "legal.privacy.title", descriptionKey: "legal.privacy.description" },
  cookies: { path: "legal/cookies", navKey: "legal.cookies.title", titleKey: "legal.cookies.title", descriptionKey: "legal.cookies.description" },
} as const satisfies Record<string, { path: string; navKey: Key; titleKey: Key; descriptionKey: Key }>;

export type PageId = keyof typeof pages;

/** Site-relative URL of a page in a locale, e.g. `/en/contact`. */
export const pagePath = (locale: Locale, page: PageId) => `/${locale}/${pages[page].path}`;

/**
 * Main (header) navigation, in order. Technology is hidden for now (its page is not
 * built); restore it at the commented position together with its `getStaticPaths`.
 */
export const mainNav: PageId[] = ["home", "research", "applications", "capacityCalculator", /* "technology", */ "demo", "contact"];

/** Footer navigation: the header links plus About, which lives only in the footer. */
export const footerNav: PageId[] = ["home", "research", "applications", "capacityCalculator", "demo", "about", "contact"];

/** Footer legal links, with their labels. */
export const legalNav = [
  { page: "legalNotice", labelKey: "footer.legal" },
  { page: "privacy", labelKey: "footer.privacy" },
  { page: "cookies", labelKey: "footer.cookies" },
] as const satisfies readonly { page: PageId; labelKey: Key }[];
