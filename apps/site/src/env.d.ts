interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_DEMO_URL?: string;
  readonly PUBLIC_CONTACT_EMAIL?: string;
  readonly PUBLIC_LINKEDIN_URL?: string;
  readonly PUBLIC_X_URL?: string;
  readonly PUBLIC_CONTACT_ENDPOINT?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
