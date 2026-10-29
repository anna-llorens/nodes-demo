import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/nodes/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/lib/contact.functions";
import { tFor, useLang, useT } from "@/i18n/useT";

export const Route = createFileRoute("/contact")({
  head: ({ match }) => {
    const t = tFor(match.search.lang).contact;
    return {
      meta: [
        { title: t.title },
        { name: "description", content: t.description },
        { property: "og:title", content: t.title },
        { property: "og:description", content: t.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ContactPage,
});

type Status = "idle" | "sending" | "sent" | "error" | "invalid";

function ContactPage() {
  const t = useT().contact;
  const lang = useLang();
  const send = useServerFn(submitContact);
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setStatus("sending");
    try {
      const r = await send({
        data: {
          name: String(f.get("name") ?? ""),
          email: String(f.get("email") ?? ""),
          message: String(f.get("message") ?? ""),
          website: String(f.get("website") ?? ""),
          lang,
        },
      });
      if (r.ok) {
        form.reset();
        setStatus("sent");
      } else setStatus(r.reason);
    } catch {
      setStatus("error");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-5 py-6 lg:py-10">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.eyebrow}</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-brand-ink sm:text-3xl">{t.heading}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t.intro}</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-card sm:p-6">
          <div className="grid gap-1.5">
            <Label htmlFor="contact-name">{t.name}</Label>
            <Input id="contact-name" name="name" autoComplete="name" maxLength={100} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contact-email">{t.email}</Label>
            <Input id="contact-email" name="email" type="email" autoComplete="email" maxLength={200} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contact-message">{t.message}</Label>
            <Textarea id="contact-message" name="message" rows={6} maxLength={2000} required />
          </div>
          {/* Honeypot: hidden from people and screen readers; bots tend to fill it in. */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <p className="text-xs text-muted-foreground">{t.privacy}</p>
          <Button type="submit" disabled={status === "sending"} className="self-start">
            {status === "sending" ? t.sending : t.send}
          </Button>
          <p role="status" className={status === "sent" ? "text-sm text-primary" : "text-sm text-destructive"}>
            {status === "sent" ? t.sent : status === "error" ? t.error : status === "invalid" ? t.invalid : ""}
          </p>
        </form>
      </div>
    </AppShell>
  );
}
