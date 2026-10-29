/**
 * Contact form logic, shared by the Contact page script and the tests. Browser-safe: no
 * Astro or DOM APIs. Returns codes, never user-facing text.
 */
import type { Locale } from "../i18n";

/** What the visitor is interested in; keys of `contact.interests.*` in i18n. */
export const contactInterests = ["pilot", "research", "general"] as const;
export type ContactInterest = (typeof contactInterests)[number];

/** Chosen when the URL names no interest (or an unknown one), so one is always selected. */
export const defaultInterest: ContactInterest = "general";

export interface ContactFields {
  name: string;
  email: string;
  organization: string;
  interest: string;
  message: string;
  consent: boolean;
}

export type ContactField = "name" | "email" | "message" | "consent";

/** What `submitContact` sends, as JSON. `organization` is empty when not given. */
export interface ContactPayload {
  name: string;
  email: string;
  organization: string;
  interest: ContactInterest;
  message: string;
  locale: Locale;
}

export type SubmitResult = { ok: true } | { ok: false; reason: "no_endpoint" | "http" | "network" };

// Deliberately loose: something@something.tld, no spaces. The server must validate again.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isContactInterest = (value: string | null): value is ContactInterest =>
  contactInterests.includes(value as ContactInterest);

/** Interest preselected from `?interest=`; the default when missing or unknown. */
export const interestFromQuery = (value: string | null): ContactInterest =>
  isContactInterest(value) ? value : defaultInterest;

/** Fields that fail validation, in form order (the first one gets focus). */
export function validateContact(fields: ContactFields): ContactField[] {
  const invalid: ContactField[] = [];
  if (!fields.name.trim()) invalid.push("name");
  if (!EMAIL.test(fields.email.trim())) invalid.push("email");
  if (!fields.message.trim()) invalid.push("message");
  if (!fields.consent) invalid.push("consent");
  return invalid;
}

/** Trimmed payload for valid fields; an unknown interest is sent as the default. */
export function toPayload(fields: ContactFields, locale: Locale): ContactPayload {
  return {
    name: fields.name.trim(),
    email: fields.email.trim(),
    organization: fields.organization.trim(),
    interest: interestFromQuery(fields.interest),
    message: fields.message.trim(),
    locale,
  };
}

/** Posts the payload as JSON to the configured endpoint (PUBLIC_CONTACT_ENDPOINT). */
export async function submitContact(
  payload: ContactPayload,
  { endpoint, fetch: fetchFn = fetch }: { endpoint: string | undefined; fetch?: typeof fetch },
): Promise<SubmitResult> {
  if (!endpoint) return { ok: false, reason: "no_endpoint" };
  try {
    const response = await fetchFn(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.ok ? { ok: true } : { ok: false, reason: "http" };
  } catch {
    return { ok: false, reason: "network" };
  }
}
