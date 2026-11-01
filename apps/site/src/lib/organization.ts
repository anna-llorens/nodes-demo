import { t, type Locale } from "../i18n";
import { absoluteUrl, env } from "./env";

/**
 * NODES as a schema.org Organization: the home page's structured data and the publisher of every
 * article. Email and LinkedIn only when their variables are set.
 */
export const organization = (locale: Locale) => ({
  "@type": "Organization",
  name: "NODES",
  url: absoluteUrl(`/${locale}/`),
  logo: absoluteUrl("/apple-touch-icon.png"),
  description: t(locale, "meta.description"),
  ...(env.contactEmail && { email: env.contactEmail }),
  ...(env.linkedinUrl && { sameAs: [env.linkedinUrl] }),
});

/** JSON-LD for an inline `<script type="application/ld+json">`, with `<` escaped. */
export const jsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
