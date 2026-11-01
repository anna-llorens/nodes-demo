import type { APIRoute } from "astro";
import { publishedArticles } from "../lib/research";

/**
 * Card keys of the published research articles. The site Worker reads this file from the static
 * build to reject engagement requests (hearts, comments) for unknown articles.
 */
export const GET: APIRoute = async () => {
  const keys = [...new Set((await publishedArticles()).map((entry) => entry.data.card).filter(Boolean))].sort();
  return new Response(JSON.stringify(keys), { headers: { "Content-Type": "application/json; charset=utf-8" } });
};
