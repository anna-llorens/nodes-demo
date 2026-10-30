import { EmailMessage } from "cloudflare:email";
import { LOCALE_COOKIE, pickLocale } from "../src/i18n/pick-locale";
import { parseContactRequest, type ContactPayload } from "../src/lib/contact";

/**
 * Site Worker. `/` redirects to `/es/` or `/en/` at the edge (ADR 0004: saved choice, browser
 * language, then country); `POST /api/contact` saves a contact message in D1 (ADR 0010); every
 * other request is served from the static build. The client-side
 * redirect in `src/pages/index.astro` stays as a fallback for `astro dev` and other hosts.
 */
export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      const locale = pickLocale({
        cookie: readCookie(request.headers.get("Cookie"), LOCALE_COOKIE),
        languages: parseAcceptLanguage(request.headers.get("Accept-Language")),
        country: typeof request.cf?.country === "string" ? request.cf.country : null,
      });
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/${locale}/${url.search}`,
          "Cache-Control": "private, no-store",
          Vary: "Cookie, Accept-Language",
        },
      });
    }
    if (url.pathname === "/api/contact") return handleContact(request, url, env);
    if (url.pathname.startsWith("/api/")) return json({ ok: false, error: "not_found" }, 404);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

/**
 * Same-origin JSON endpoint, so no CORS headers. 400 for an invalid body; a filled honeypot gets
 * `{ ok: true }` without saving. The insert is a prepared statement. After saving, a plain-text
 * copy goes to the project inbox (plan D5); a failed send is only logged, the row is already in D1.
 */
async function handleContact(request: Request, url: URL, env: Env): Promise<Response> {
  if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405, { Allow: "POST" });
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) return json({ ok: false, error: "forbidden" }, 403);
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json"))
    return json({ ok: false, error: "unsupported_media_type" }, 415);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }
  const parsed = parseContactRequest(body);
  if (!parsed.ok) return parsed.reason === "spam" ? json({ ok: true }) : json({ ok: false, error: "invalid" }, 400);

  const { name, email, organization, interest, message, locale } = parsed.payload;
  await env.DB.prepare(
    "INSERT INTO contact_messages (name, email, organization, interest, message, locale) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(name, email, organization || null, interest, message, locale)
    .run();
  try {
    const raw = contactEmail(env.CONTACT_SENDER, env.CONTACT_INBOX, parsed.payload);
    await env.EMAIL.send(new EmailMessage(env.CONTACT_SENDER, env.CONTACT_INBOX, raw));
  } catch (error) {
    console.error("contact email failed", error);
  }
  return json({ ok: true });
}

/** Raw MIME for the inbox copy. Reply-To is the sender, so a reply from Gmail goes straight back. */
function contactEmail(from: string, to: string, payload: ContactPayload): string {
  const { name, email, organization, interest, message, locale } = payload;
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Organization: ${organization || "-"}`,
    `Interest: ${interest}`,
    `Locale: ${locale}`,
    "",
    message,
  ].join("\r\n");
  return [
    `From: NODES web <${from}>`,
    `To: ${to}`,
    `Reply-To: ${headerValue(email)}`,
    `Subject: ${encodeHeader(`NODES · contacto · ${interest} · ${name}`)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${from.split("@")[1]}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64Utf8(body).replace(/.{76}/g, "$&\r\n"),
  ].join("\r\n");
}

/** Strips line breaks so user input cannot add headers. */
function headerValue(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/** RFC 2047 encoded word, so accents and "·" survive in the subject. */
function encodeHeader(value: string): string {
  return `=?UTF-8?B?${base64Utf8(headerValue(value))}?=`;
}

function base64Utf8(value: string): string {
  let binary = "";
  for (const byte of new TextEncoder().encode(value)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** Value of one cookie from a `Cookie` header, or null. */
function readCookie(header: string | null, name: string): string | null {
  for (const part of header?.split(";") ?? []) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

/** Language tags from `Accept-Language`, highest quality first (`es-ES,en;q=0.8` → es-ES, en). */
function parseAcceptLanguage(header: string | null): string[] {
  return (header ?? "")
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = Number(params.find((param) => param.trim().startsWith("q="))?.trim().slice(2) ?? 1);
      return { tag: tag.trim(), q: Number.isNaN(q) ? 0 : q, index };
    })
    .filter((item) => item.tag && item.tag !== "*" && item.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)
    .map((item) => item.tag);
}
