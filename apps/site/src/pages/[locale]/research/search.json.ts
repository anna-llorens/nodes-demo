import type { APIRoute } from "astro";
import { isLocale } from "../../../i18n";
import { articleLocale, publishedArticles } from "../../../lib/research";
import { localePaths } from "../../../lib/static-paths";

export const getStaticPaths = localePaths;

/** Markdown to plain text, enough for word matching: drops images, URLs, code and markup. */
const plainText = (markdown: string) =>
  markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*_>`|~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Search index of the Research page, one file per locale: each published article's card key and
 * its text (title, subtitle, description, tags and body). The page fetches it on the first search.
 */
export const GET: APIRoute = async ({ params }) => {
  const { locale } = params;
  if (!isLocale(locale)) throw new Error(`Unknown locale: ${locale}`);
  const articles = (await publishedArticles()).filter((entry) => articleLocale(entry) === locale && entry.data.card);
  const index = articles.map((entry) => {
    const { card, title, subtitle, description, tags } = entry.data;
    return { card, text: plainText([title, subtitle, description, ...tags, entry.body ?? ""].join(" ")) };
  });
  return new Response(JSON.stringify(index), { headers: { "Content-Type": "application/json; charset=utf-8" } });
};
