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
      serialize: (item) => {
        const trim = (url) => url.replace(/^(.+\/\w{2}\/.+?)\/$/, "$1");
        return { ...item, url: trim(item.url), links: item.links?.map((link) => ({ ...link, url: trim(link.url) })) };
      },
    }),
  ],
});
