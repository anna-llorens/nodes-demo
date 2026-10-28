import { defineConfig } from "astro/config";

// Static public website (ADR 0004). Routes are /es/... and /en/...; only the root page picks
// the language (src/pages/index.astro), so Astro must not redirect on its own.
export default defineConfig({
  output: "static",
  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es",
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
