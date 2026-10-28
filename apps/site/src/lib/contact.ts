/**
 * Contact form logic, shared by the Colabora page script and the tests. Browser-safe: no
 * Astro or DOM APIs. Returns codes, never user-facing text.
 */
import type { Locale } from "../i18n";

/** Collaboration types, in the order of the cards; keys of `collab.types.*` in i18n. */
export const contactTypes = ["events", "ideas", "research", "funding"] as const;
export type ContactType = (typeof contactTypes)[number];

export interface ContactFields {
  name: string;
  email: string;
  type: string;
  message: string;
  consent: boolean;
}

export type ContactField = "name" | "email" | "message" | "consent";

/** What `submitContact` sends, as JSON. `type` is empty when none was chosen. */
export interface ContactPayload {
  name: string;
  email: string;
  type: ContactType | "";
  message: string;
  locale: Locale;
}

export type SubmitResult = { ok: true } | { ok: false; reason: "no_endpoint" | "http" | "network" };

// Deliberately loose: something@something.tld, no spaces. The server must validate again.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isContactType = (value: string): value is ContactType => contactTypes.includes(value as ContactType);

/** Fields that fail validation, in form order (the first one gets focus). */
export function validateContact(fields: ContactFields): ContactField[] {
  const invalid: ContactField[] = [];
  if (!fields.name.trim()) invalid.push("name");
  if (!EMAIL.test(fields.email.trim())) invalid.push("email");
  if (!fields.message.trim()) invalid.push("message");
  if (!fields.consent) invalid.push("consent");
  return invalid;
}

/** Trimmed payload for valid fields; an unknown type is sent as "". */
export function toPayload(fields: ContactFields, locale: Locale): ContactPayload {
  return {
    name: fields.name.trim(),
    email: fields.email.trim(),
    type: isContactType(fields.type) ? fields.type : "",
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
