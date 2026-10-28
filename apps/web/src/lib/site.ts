/** Public website URL (PUBLIC_SITE_URL, shared with apps/site). Unset until the site is deployed. */
export const siteUrl: string | undefined = import.meta.env["PUBLIC_SITE_URL"]?.trim() || undefined;
