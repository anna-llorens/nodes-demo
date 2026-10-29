/** Public website URL (PUBLIC_SITE_URL, shared with apps/site). Unset until the site is deployed. */
export const siteUrl: string | undefined = import.meta.env["PUBLIC_SITE_URL"]?.trim() || undefined;

/** URL of the public website home page in the matching locale. */
export function localizedSiteUrl(baseUrl: string | undefined, locale: "es" | "en"): string | undefined {
  if (!baseUrl) return undefined;
  return new URL(`${locale}/`, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}
