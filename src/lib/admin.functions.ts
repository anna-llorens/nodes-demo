import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { admin?: boolean };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "nodes-admin",
    maxAge: 60 * 60 * 8,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

function same(a: string, b: string) {
  const x = createHash("sha256").update(a, "utf8").digest();
  const y = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(x, y);
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { user: string; password: string }) => ({
    user: String(d.user ?? "").slice(0, 100),
    password: String(d.password ?? "").slice(0, 200),
  }))
  .handler(async ({ data }) => {
    const u = process.env["ADMIN_USER"];
    const p = process.env["ADMIN_PASSWORD"];
    if (!u || !p) return { ok: false as const };
    const ok = same(data.user, u) && same(data.password, p);
    if (!ok) return { ok: false as const };
    const s = await useSession<AdminSession>(sessionConfig());
    await s.update({ admin: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const s = await useSession<AdminSession>(sessionConfig());
  await s.clear();
  return { ok: true as const };
});

export const getAdminMetrics = createServerFn({ method: "GET" }).handler(async () => {
  const s = await useSession<AdminSession>(sessionConfig());
  if (!s.data.admin) return { authorized: false as const };
  return {
    authorized: true as const,
    analyticsConnected: Boolean(process.env["GOOGLE_ANALYTICS_API_KEY"]),
  };
});
