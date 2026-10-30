import { readdirSync, readFileSync } from "node:fs";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

// Local builds read apps/site/.env; in CI (Cloudflare) the variable comes from the environment,
// which wins over the file. `vite` is not a direct dependency, so it must not be imported here.
try {
  process.loadEnvFile();
} catch {
  // No .env file: fine in CI.
}
const siteUrl = process.env.PUBLIC_SITE_URL?.trim();
const site = siteUrl ? siteUrl.replace(/\/+$/, "") : undefined;

/**
 * Research article paths grouped by their `card` frontmatter, so the sitemap can pair the
 * translations (their slugs differ, so the sitemap's own i18n matching cannot). Reads the
 * Markdown frontmatter directly because `astro:content` is not available in the config.
 */
function researchTranslations() {
  const base = new URL("./src/content/research/", import.meta.url);
  const byCard = new Map();
  for (const locale of readdirSync(base)) {
    for (const file of readdirSync(new URL(`${locale}/`, base)).filter((name) => name.endsWith(".md"))) {
      const text = readFileSync(new URL(`${locale}/${file}`, base), "utf8").split(/^---$/m)[1] ?? "";
      const field = (name) => text.match(new RegExp(`^${name}:\\s*"?([^"\\n]*)"?\\s*$`, "m"))?.[1];
      const card = field("card");
      if (!card || field("draft") !== "false") continue;
      byCard.set(card, [...(byCard.get(card) ?? []), { lang: locale, path: `/${locale}/research/${field("slug")}` }]);
    }
  }
  const byPath = new Map();
  for (const group of byCard.values()) for (const item of group) byPath.set(item.path, group);
  return byPath;
}
const articleTranslations = researchTranslations();

// Static public website (ADR 0004). Routes are /es/... and /en/...; only the root page picks
// the language (src/pages/index.astro), so Astro must not redirect on its own.
export default defineConfig({
  output: "static",
  site,
  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es",
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    // Needs `site`; without PUBLIC_SITE_URL no sitemap is written (plan D7).
    sitemap({
      i18n: { defaultLocale: "es", locales: { es: "es", en: "en" } },
      // Leaves out the root language redirect, the 404, the old /collaborate redirect and the
      // legal pages, which are drafts until the final legal texts land. Draft articles are never built.
      filter: (page) => {
        const path = new URL(page).pathname;
        return (
          path !== "/" && !path.startsWith("/404") && !path.includes("/legal/") && !/^\/\w+\/collaborate\/?$/.test(path)
        );
      },
      // Same URL form as the canonical links: no trailing slash except the locale roots (/en/).
      // Research articles get their translations as alternates.
      serialize: (item) => {
        const trim = (url) => url.replace(/^(.+\/\w{2}\/.+?)\/$/, "$1");
        const url = trim(item.url);
        const article = articleTranslations.get(new URL(url).pathname);
        const links = article
          ? article.map(({ lang, path }) => ({ lang, url: new URL(path, url).href }))
          : item.links?.map((link) => ({ ...link, url: trim(link.url) }));
        return { ...item, url, links };
      },
    }),
  ],
});
