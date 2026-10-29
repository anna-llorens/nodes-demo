import { createServerFn } from "@tanstack/react-start";

// Public endpoint: stores a contact message. Limits mirror the CHECKs in contact_messages.
export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; email: string; message: string; lang?: string; website?: string }) => {
    const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    return {
      name: text(d.name),
      email: text(d.email),
      message: text(d.message),
      lang: d.lang === "en" ? "en" : "es",
      // Honeypot: hidden field that people never fill in.
      website: text(d.website),
    };
  })
  .handler(async ({ data }) => {
    const { website, ...row } = data;
    if (website) return { ok: true as const };
    const valid =
      row.name.length >= 1 &&
      row.name.length <= 100 &&
      row.email.length >= 3 &&
      row.email.length <= 200 &&
      row.email.indexOf("@") > 0 &&
      row.message.length >= 1 &&
      row.message.length <= 2000;
    if (!valid) return { ok: false as const, reason: "invalid" as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert(row);
    if (error) {
      console.error("contact insert failed", error.message);
      return { ok: false as const, reason: "error" as const };
    }
    return { ok: true as const };
  });
