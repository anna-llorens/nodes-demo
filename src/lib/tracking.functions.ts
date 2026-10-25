import { createServerFn } from "@tanstack/react-start";

// Public endpoint: anonymous internal tracking (no cookies, no personal data).
export const trackEvent = createServerFn({ method: "POST" })
  .inputValidator((d: { kind: string; path?: string; nodeId?: string; nodeName?: string; device?: string }) => {
    const kind = d.kind === "node_click" ? "node_click" : "page_view";
    const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : null);
    return {
      kind,
      path: clip(d.path, 200),
      node_id: clip(d.nodeId, 60),
      node_name: clip(d.nodeName, 120),
      device: d.device === "mobile" ? "mobile" : "desktop",
    };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("analytics_events").insert(data);
    return { ok: true };
  });
