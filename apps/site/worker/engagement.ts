import { EmailMessage } from "cloudflare:email";
import {
  COMMENT_LIST_LIMIT,
  COMMENTS_PER_HOUR,
  isArticleKey,
  parseCommentRequest,
  type CommentPayload,
  type Engagement,
} from "../src/lib/engagement";
import { base64Utf8, encodeHeader, json } from "./http";

/** Secrets set with `wrangler secret put` (docs/comments.md); not in wrangler.jsonc. */
type EngagementEnv = Env & { TURNSTILE_SECRET?: string; IP_SALT?: string };

/** D1 database name from wrangler.jsonc, for the delete command in the notification email. */
const DATABASE_NAME = "nodes-contact";
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/**
 * Hearts and comments of research articles (ADR 0012), keyed by the frontmatter `card`:
 * - GET  /api/research/:key/engagement → hearts + latest comments (never ip_hash)
 * - POST /api/research/:key/heart      → +1, ignored if the same ip_hash hearted it in 24 h
 * - POST /api/research/:key/comments   → honeypot, validation, Turnstile, 3/hour, insert, email
 * Unknown keys get 404. All SQL uses prepared statements.
 */
export async function handleEngagement(request: Request, url: URL, env: EngagementEnv): Promise<Response> {
  const match = /^\/api\/research\/([^/]+)\/(engagement|heart|comments)$/.exec(url.pathname);
  const key = match?.[1] ?? "";
  const action = match?.[2];
  if (!action || !isArticleKey(key) || !(await knownKeys(env, url)).has(key))
    return json({ ok: false, error: "not_found" }, 404);

  if (action === "engagement") {
    if (request.method !== "GET") return json({ ok: false, error: "method_not_allowed" }, 405, { Allow: "GET" });
    return json({ ok: true, ...(await readEngagement(env, key)) });
  }

  if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405, { Allow: "POST" });
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) return json({ ok: false, error: "forbidden" }, 403);
  if (!env.IP_SALT) {
    console.error("engagement: IP_SALT is not set");
    return json({ ok: false, error: "unavailable" }, 503);
  }
  const ipHash = await hashIp(request.headers.get("CF-Connecting-IP") ?? "", env.IP_SALT);
  return action === "heart" ? heart(env, key, ipHash) : comment(request, url, env, key, ipHash);
}

async function readEngagement(env: Env, key: string): Promise<Engagement> {
  const [reaction, comments] = await env.DB.batch<Record<string, unknown>>([
    env.DB.prepare("SELECT hearts FROM reactions WHERE article_key = ?").bind(key),
    env.DB.prepare(
      "SELECT name, body, created_at, locale FROM comments WHERE article_key = ? ORDER BY created_at DESC, id DESC LIMIT ?",
    ).bind(key, COMMENT_LIST_LIMIT),
  ]);
  return {
    hearts: Number(reaction?.results[0]?.["hearts"] ?? 0),
    comments: (comments?.results ?? []) as unknown as Engagement["comments"],
  };
}

/** One heart per ip_hash per article in 24 h; a repeat answers OK with the unchanged count. */
async function heart(env: Env, key: string, ipHash: string): Promise<Response> {
  const action = `heart:${key}`;
  const recent = await env.DB.prepare(
    "SELECT 1 FROM rate_log WHERE ip_hash = ? AND action = ? AND created_at > ? LIMIT 1",
  )
    .bind(ipHash, action, since(DAY))
    .first();
  if (!recent) {
    await env.DB.batch([
      env.DB.prepare(
        "INSERT INTO reactions (article_key, hearts) VALUES (?, 1) ON CONFLICT (article_key) DO UPDATE SET hearts = hearts + 1",
      ).bind(key),
      logAction(env, ipHash, action),
      pruneRateLog(env),
    ]);
  }
  const row = await env.DB.prepare("SELECT hearts FROM reactions WHERE article_key = ?").bind(key).first<{ hearts: number }>();
  return json({ ok: true, hearts: row?.hearts ?? 0, counted: !recent });
}

async function comment(request: Request, url: URL, env: EngagementEnv, key: string, ipHash: string): Promise<Response> {
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json"))
    return json({ ok: false, error: "unsupported_media_type" }, 415);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }
  const parsed = parseCommentRequest(body);
  if (!parsed.ok) return parsed.reason === "spam" ? json({ ok: true }) : json({ ok: false, error: "invalid" }, 400);

  if (!env.TURNSTILE_SECRET) {
    console.error("engagement: TURNSTILE_SECRET is not set");
    return json({ ok: false, error: "unavailable" }, 503);
  }
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET, parsed.token, request.headers.get("CF-Connecting-IP"))))
    return json({ ok: false, error: "captcha" }, 403);

  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM rate_log WHERE ip_hash = ? AND action = 'comment' AND created_at > ?",
  )
    .bind(ipHash, since(HOUR))
    .first<{ n: number }>();
  if ((recent?.n ?? 0) >= COMMENTS_PER_HOUR) return json({ ok: false, error: "rate_limited" }, 429);

  const { name, body: text, locale } = parsed.payload;
  const [inserted] = await env.DB.batch<{ id: number; created_at: string }>([
    env.DB.prepare(
      "INSERT INTO comments (article_key, locale, name, body, ip_hash) VALUES (?, ?, ?, ?, ?) RETURNING id, created_at",
    ).bind(key, locale, name, text, ipHash),
    logAction(env, ipHash, "comment"),
    pruneRateLog(env),
  ]);
  const saved = inserted?.results[0];
  if (saved) {
    try {
      const page = sameOriginReferer(request, url);
      const raw = commentEmail(env.CONTACT_SENDER, env.CONTACT_INBOX, key, saved.id, page, parsed.payload);
      await env.EMAIL.send(new EmailMessage(env.CONTACT_SENDER, env.CONTACT_INBOX, raw));
    } catch (error) {
      console.error("comment email failed", error);
    }
  }
  return json({ ok: true, comment: { name, body: text, locale, created_at: saved?.created_at ?? new Date().toISOString() } });
}

/** Article keys of the static build (`/research-keys.json`), cached per isolate once loaded. */
let keysCache: Set<string> | undefined;
async function knownKeys(env: Env, url: URL): Promise<Set<string>> {
  if (keysCache) return keysCache;
  try {
    const response = await env.ASSETS.fetch(new URL("/research-keys.json", url));
    if (!response.ok) return new Set();
    keysCache = new Set((await response.json()) as string[]);
    return keysCache;
  } catch {
    return new Set();
  }
}

async function verifyTurnstile(secret: string, token: string, ip: string | null): Promise<boolean> {
  if (!token) return false;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error("turnstile verify failed", error);
    return false;
  }
}

/** Hex SHA-256 of IP + salt; the raw IP never leaves this function. */
async function hashIp(ip: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip + salt));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** ISO timestamp `ms` ago, in the same format as the `created_at` defaults, so strings compare. */
const since = (ms: number) => new Date(Date.now() - ms).toISOString();

const logAction = (env: Env, ipHash: string, action: string) =>
  env.DB.prepare("INSERT INTO rate_log (ip_hash, action) VALUES (?, ?)").bind(ipHash, action);

const pruneRateLog = (env: Env) => env.DB.prepare("DELETE FROM rate_log WHERE created_at < ?").bind(since(7 * DAY));

function sameOriginReferer(request: Request, url: URL): string | undefined {
  const referer = request.headers.get("Referer");
  try {
    return referer && new URL(referer).origin === url.origin ? referer : undefined;
  } catch {
    return undefined;
  }
}

/** Plain-text notification with the exact command to delete the comment. */
function commentEmail(
  from: string,
  to: string,
  key: string,
  id: number,
  page: string | undefined,
  payload: CommentPayload,
): string {
  const body = [
    `Article: ${key}`,
    `Page: ${page ?? "-"}`,
    `Locale: ${payload.locale}`,
    `Comment id: ${id}`,
    `Name: ${payload.name}`,
    "",
    payload.body,
    "",
    "Delete it with:",
    `npx wrangler d1 execute ${DATABASE_NAME} --remote --command "DELETE FROM comments WHERE id = ${id}"`,
  ].join("\r\n");
  return [
    `From: NODES web <${from}>`,
    `To: ${to}`,
    `Subject: ${encodeHeader(`NODES · comentario · ${key} · ${payload.name}`)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${from.split("@")[1]}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64Utf8(body).replace(/.{76}/g, "$&\r\n"),
  ].join("\r\n");
}
