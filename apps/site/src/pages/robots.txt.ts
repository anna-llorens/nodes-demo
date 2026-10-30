import type { APIRoute } from "astro";
import { env, isPreviewHost } from "../lib/env";

/** Built at build time: blocks everything on workers.dev, otherwise allows all and names the sitemap. */
export const GET: APIRoute = () => {
  const lines = isPreviewHost
    ? ["User-agent: *", "Disallow: /"]
    : ["User-agent: *", "Allow: /", ...(env.siteUrl ? ["", `Sitemap: ${env.siteUrl}/sitemap-index.xml`] : [])];
  return new Response(`${lines.join("\n")}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
