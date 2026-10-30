/** Public settings from .env (see .env.example). Empty strings count as unset. */
const read = (value: string | undefined) => value?.trim() || undefined;

export const env = {
  siteUrl: read(import.meta.env.PUBLIC_SITE_URL)?.replace(/\/+$/, ""),
  demoUrl: read(import.meta.env.PUBLIC_DEMO_URL),
  contactEmail: read(import.meta.env.PUBLIC_CONTACT_EMAIL),
  linkedinUrl: read(import.meta.env.PUBLIC_LINKEDIN_URL),
  xUrl: read(import.meta.env.PUBLIC_X_URL),
  contactEndpoint: read(import.meta.env.PUBLIC_CONTACT_ENDPOINT),
};

/**
 * True while the site lives on its temporary workers.dev URL: every page gets `noindex` until the
 * domain and legal texts are final (PUBLIC_SITE_URL then points to nodes-data.com).
 */
export const isPreviewHost = Boolean(env.siteUrl?.includes("workers.dev"));

let warned = false;

/**
 * Absolute URL for canonical and hreflang links. Relative while PUBLIC_SITE_URL is unset,
 * which is expected in dev; a production build warns once.
 */
export function absoluteUrl(path: string) {
  if (!env.siteUrl && import.meta.env.PROD && !warned) {
    warned = true;
    console.warn("[site] PUBLIC_SITE_URL is not set: canonical and hreflang URLs are relative.");
  }
  return `${env.siteUrl ?? ""}${path}`;
}

let warnedEndpoint = false;

/** Contact form endpoint. Unset means every send fails with the email fallback; a production build warns once. */
export function contactEndpoint() {
  if (!env.contactEndpoint && import.meta.env.PROD && !warnedEndpoint) {
    warnedEndpoint = true;
    console.warn("[site] PUBLIC_CONTACT_ENDPOINT is not set: the contact form will show the email fallback.");
  }
  return env.contactEndpoint;
}
