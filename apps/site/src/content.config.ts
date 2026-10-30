import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * Legal texts, one Markdown file per page and locale: `content/legal/{locale}/{slug}.md`, with
 * the slug of the page path (legal-notice, privacy, cookies). Written by the team, not by code.
 */
const legal = defineCollection({
  loader: glob({ pattern: "*/*.md", base: "./src/content/legal" }),
  schema: z.object({
    /** While true the page shows the draft banner and is kept out of search results. */
    draft: z.boolean(),
  }),
});

/**
 * Research articles: `content/research/{locale}/{file}.md`. Entry ids keep the locale folder
 * ("es/lidar-flujos-peatonales"); the URL uses the frontmatter `slug`. Drafts are never built.
 */
const research = defineCollection({
  loader: glob({
    pattern: "*/*.md",
    base: "./src/content/research",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        subtitle: z.string(),
        slug: z.string(),
        /** ISO date; empty while the article is a draft. */
        date: z.string(),
        type: z.string(),
        category: z.string(),
        tags: z.array(z.string()),
        author: z.string(),
        draft: z.boolean(),
        /** Research card key ("lidar"): pairs the translations of an article and links its card. */
        card: z.string().optional(),
        /** Header image; the article keeps its own copy in the body. Needs `coverAlt`. */
        cover: image().optional(),
        coverAlt: z.string().optional(),
      })
      .refine((data) => !data.cover || data.coverAlt, {
        message: "cover needs coverAlt",
        path: ["coverAlt"],
      }),
});

export const collections = { legal, research };
