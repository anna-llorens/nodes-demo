import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Legal texts, one Markdown file per page and locale: `content/legal/{locale}/{slug}.md`, with
 * the slug of the page path (aviso-legal, privacidad, cookies). Written by the team, not by code.
 */
const legal = defineCollection({
  loader: glob({ pattern: "*/*.md", base: "./src/content/legal" }),
  schema: z.object({
    /** While true the page shows the draft banner and is kept out of search results. */
    draft: z.boolean(),
  }),
});

export const collections = { legal };
