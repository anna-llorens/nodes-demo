import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/nodes/AppShell";
import { Logo } from "@/components/nodes/Logo";
import { tFor, useT } from "@/i18n/useT";

export const Route = createFileRoute("/about")({
  head: ({ match }) => {
    const t = tFor(match.search.lang).about;
    return {
    meta: [
      { title: t.title },
      {
        name: "description",
        content: t.description,
      },
      { property: "og:title", content: t.title },
      { property: "og:description", content: t.ogDescription },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    };
  },
  component: MasPage,
});

function MasPage() {
  const t = useT();
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-5 py-6 lg:py-10">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.about.eyebrow}</p>
            <h1 className="mt-1 leading-none">
              <Logo className="text-4xl sm:text-5xl" />
            </h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {t.about.intro}
        </p>
        <h2 className="mt-8 font-display text-lg font-bold text-brand-ink">{t.about.featuresHeading}</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {t.about.features.map((f) => (
            <li key={f.t} className="flex gap-3 rounded-2xl bg-card p-4 shadow-card">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">{f.t}</p>
                <p className="text-xs text-muted-foreground">{f.d}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link to="/contact" className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-card p-4 text-sm font-semibold text-primary shadow-card hover:bg-muted/60">
          {t.contact.aboutLink}
          <ChevronRight className="h-4 w-4 shrink-0" />
        </Link>
      </div>
    </AppShell>
  );
}
