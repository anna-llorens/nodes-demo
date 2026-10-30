import { getCollection, type CollectionEntry } from "astro:content";
import { locales, type Locale } from "../i18n";

export type Article = CollectionEntry<"research">;

/** Locale of an article, from its folder ("es/lidar-flujos-peatonales" → es). */
export const articleLocale = (entry: Article) => entry.id.split("/")[0] as Locale;

/** Site-relative URL of an article, e.g. `/en/research/lidar-pedestrian-flows`. */
export const articlePath = (entry: Article) => `/${articleLocale(entry)}/research/${entry.data.slug}`;

/** Published articles only; drafts never get a card link, an alternate or a sitemap entry. */
export const publishedArticles = () => getCollection("research", (entry) => !entry.data.draft);

/** The published article for a Research card in one locale, if it exists. */
export async function articleFor(card: string, locale: Locale): Promise<Article | undefined> {
  return (await publishedArticles()).find((entry) => entry.data.card === card && articleLocale(entry) === locale);
}

/** Published translations of an article (itself included), one per locale, paired by `card`. */
export async function translationsOf(entry: Article): Promise<{ locale: Locale; path: string }[]> {
  const { card } = entry.data;
  if (!card) return [{ locale: articleLocale(entry), path: articlePath(entry) }];
  const published = await publishedArticles();
  return locales.flatMap((locale) => {
    const match =
      articleLocale(entry) === locale
        ? entry
        : published.find((item) => item.data.card === card && articleLocale(item) === locale);
    return match ? [{ locale, path: articlePath(match) }] : [];
  });
}

/** Publication date as shown on the card and the article ("30 de octubre de 2026"). */
export const formatArticleDate = (date: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(date));
