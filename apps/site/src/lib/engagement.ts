/**
 * Research article engagement (hearts and comments, ADR 0012), shared by the article page script,
 * the site Worker (`/api/research/:key/*`) and the tests. Browser- and Worker-safe: no Astro or DOM
 * APIs. Returns codes, never user-facing text.
 */
import type { Locale } from "../i18n";

/** Same-origin base path of the engagement API; served by the site Worker. */
export const ENGAGEMENT_API = "/api/research";

export const COMMENT_NAME = { min: 2, max: 60 } as const;
export const COMMENT_BODY = { min: 2, max: 2000 } as const;
/** Comments returned by GET engagement, newest first. */
export const COMMENT_LIST_LIMIT = 50;
/** Comments allowed per ip_hash in a rolling hour. */
export const COMMENTS_PER_HOUR = 3;

/** Hearts allowed per ip_hash per article in 24 h, across browsers (caps scripted fake ids). */
export const HEARTS_PER_IP_PER_DAY = 20;

/** Shape of a browser id sent with a heart (`crypto.randomUUID()`). */
export const isBrowserId = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);

/** Shape of an article key (frontmatter `card`); the Worker also checks it against the build. */
export const isArticleKey = (value: string) => /^[A-Za-z0-9_-]{1,64}$/.test(value);

/** A published comment as the API returns it (never the ip_hash). */
export interface PublicComment {
  name: string;
  body: string;
  created_at: string;
  locale: Locale;
}

export interface Engagement {
  hearts: number;
  comments: PublicComment[];
}

export interface CommentPayload {
  name: string;
  body: string;
  locale: Locale;
}

export type CommentField = "name" | "body";

/** Error codes of POST comments, mapped to copy by the page. */
export type CommentError = "invalid" | "captcha" | "rate_limited" | "unavailable" | "network";

/** Fields outside their trimmed length range, in form order. */
export function validateComment(fields: { name: string; body: string }): CommentField[] {
  const invalid: CommentField[] = [];
  const inRange = (value: string, range: { min: number; max: number }) =>
    value.trim().length >= range.min && value.trim().length <= range.max;
  if (!inRange(fields.name, COMMENT_NAME)) invalid.push("name");
  if (!inRange(fields.body, COMMENT_BODY)) invalid.push("body");
  return invalid;
}

/**
 * Server check of a posted comment. `spam` when the honeypot `website` is filled (answer OK, save
 * nothing); `invalid` for a bad length or locale. Otherwise the trimmed payload and the Turnstile
 * token (possibly empty; the Worker verifies it).
 */
export function parseCommentRequest(
  body: unknown,
): { ok: true; payload: CommentPayload; token: string } | { ok: false; reason: "invalid" | "spam" } {
  if (typeof body !== "object" || body === null) return { ok: false, reason: "invalid" };
  const value = (key: string) => {
    const field = (body as Record<string, unknown>)[key];
    return typeof field === "string" ? field : "";
  };
  if (value("website")) return { ok: false, reason: "spam" };
  const name = value("name");
  const text = value("body");
  const locale = value("locale");
  if (validateComment({ name, body: text }).length > 0 || (locale !== "es" && locale !== "en"))
    return { ok: false, reason: "invalid" };
  return { ok: true, payload: { name: name.trim(), body: text.trim(), locale }, token: value("token") };
}
