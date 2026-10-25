import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { admin?: boolean };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "nodes-admin",
    maxAge: 60 * 60 * 8,
    // sameSite "none" so the login also works inside the embedded editor preview.
    cookie: { httpOnly: true, secure: true, sameSite: "none" as const, partitioned: true, path: "/" },
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
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: rows } = await supabaseAdmin
    .from("analytics_events")
    .select("kind,path,node_id,node_name,device,label,created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);
  const { count: totalViews } = await supabaseAdmin
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("kind", "page_view");
  const list = rows ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const week = Date.now() - 7 * 86400000;
  const views = list.filter((r) => r.kind === "page_view");
  const clicks = list.filter((r) => r.kind === "node_click");
  const uiClicks = list.filter((r) => r.kind === "click");
  const tally = (arr: typeof list, key: (r: (typeof list)[number]) => string) => {
    const m = new Map<string, number>();
    for (const r of arr) m.set(key(r), (m.get(key(r)) ?? 0) + 1);
    return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  };
  const days: { label: string; value: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    days.push({ label: d.slice(5), value: views.filter((r) => r.created_at.startsWith(d)).length });
  }
  return {
    authorized: true as const,
    viewsToday: views.filter((r) => r.created_at.startsWith(today)).length,
    views7d: views.filter((r) => new Date(r.created_at).getTime() >= week).length,
    viewsTotal: totalViews ?? 0,
    clicks30d: clicks.length,
    uiClicks30d: uiClicks.length,
    mobileShare: views.length ? Math.round((views.filter((r) => r.device === "mobile").length / views.length) * 100) : 0,
    pages: tally(views, (r) => r.path ?? "/").slice(0, 10),
    nodePages: tally(views.filter((r) => (r.path ?? "").startsWith("/node/")), (r) => (r.path ?? "").replace("/node/", "")).slice(0, 10),
    nodes: tally(clicks, (r) => r.node_name ?? r.node_id ?? "?").slice(0, 10),
    clicksByPage: tally(uiClicks, (r) => r.path ?? "/").slice(0, 10),
    topClicks: tally(uiClicks, (r) => `${r.label ?? "?"} · ${r.path ?? "/"}`).slice(0, 10),
    days,
  };
});
