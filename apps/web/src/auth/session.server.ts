import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import {
  getCookie,
  getRequest,
  setResponseHeader,
  useSession as getCookieSession,
} from "@tanstack/react-start/server";
import type { AuthState } from "./policy";

export const SESSION_COOKIE = "nodes-app-session";
type AppSession = { authenticated?: boolean };
let developmentSecret: string | undefined;

function sessionConfig() {
  let password = process.env["SESSION_SECRET"];
  if (!password && import.meta.env.DEV) {
    developmentSecret ??= randomBytes(32).toString("hex");
    password = developmentSecret;
  }
  if (!password || password.length < 32)
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  const secure = new URL(getRequest().url).protocol === "https:";
  return {
    password,
    name: SESSION_COOKIE,
    maxAge: 60 * 60 * 8,
    // HTTPS previews are embedded cross-site. Local HTTP uses a first-party cookie.
    cookie: {
      httpOnly: true,
      secure,
      sameSite: secure ? ("none" as const) : ("lax" as const),
      partitioned: secure,
      path: "/",
    },
  };
}

/** Read a sealed session, without creating one for anonymous visits. */
export async function readAuth(): Promise<AuthState> {
  setResponseHeader("Cache-Control", "private, no-store");
  if (!getCookie(SESSION_COOKIE)) return { isAuthenticated: false };
  const session = await getCookieSession<AppSession>(sessionConfig());
  return { isAuthenticated: session.data.authenticated === true };
}

function same(a: string, b: string): boolean {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}

/** Temporary shared credentials, checked exclusively on the server. */
export async function signIn(user: string, password: string): Promise<{ ok: boolean }> {
  setResponseHeader("Cache-Control", "private, no-store");
  const userMatches = same(user, "admin");
  const passwordMatches = same(password, "admin");
  if (!userMatches || !passwordMatches) return { ok: false };
  const session = await getCookieSession<AppSession>(sessionConfig());
  await session.clear();
  await session.update({ authenticated: true });
  return { ok: true };
}

export async function signOut(): Promise<void> {
  setResponseHeader("Cache-Control", "private, no-store");
  if (!getCookie(SESSION_COOKIE)) return;
  const session = await getCookieSession<AppSession>(sessionConfig());
  await session.clear();
}
