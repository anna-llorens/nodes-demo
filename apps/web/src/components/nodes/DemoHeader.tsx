import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SiteLogo, SimBadge } from "./Logo";
import { demoText } from "@/i18n/demo-entry";
import { siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Header of every demo screen: logo (to the public site), the simulation badge, "Volver a la web"
 * and, inside scenarios, the alerts bell. On mobile the site link moves into a menu.
 * The site links only render once PUBLIC_SITE_URL is set.
 */
export function DemoHeader({ alertCount, hideLogoOnDesktop = false }: { alertCount?: number; hideLogoOnDesktop?: boolean }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const back = demoText("demoEntry.backToSite");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="relative shrink-0 border-b border-border bg-card">
      <div className="flex min-h-14 items-center gap-3 px-4 py-2 sm:px-6">
        <SiteLogo className={cn("text-2xl sm:text-3xl", hideLogoOnDesktop && "lg:hidden")} />
        <SimBadge className="hidden sm:inline-flex" />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {siteUrl && (
            <a href={siteUrl} className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-primary hover:bg-muted lg:inline-flex">
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              {back}
            </a>
          )}
          {alertCount !== undefined && (
            <Link to="/alerts" aria-label={`Alertas: ${alertCount}`} className="relative grid h-11 w-11 place-items-center rounded-full text-muted-foreground hover:bg-muted">
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
              {alertCount > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-dens-crit px-1 text-[10px] font-bold leading-none text-white">{alertCount}</span>
              )}
            </Link>
          )}
          {siteUrl && (
            <button
              ref={button}
              type="button"
              aria-expanded={open}
              aria-controls="demo-menu"
              aria-label={back}
              onClick={() => setOpen((value) => !value)}
              className="grid h-11 w-11 place-items-center rounded-full text-foreground hover:bg-muted lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>
      {/* Phones: the badge gets its own row so it stays on one line. */}
      <div className="flex justify-center px-4 pb-2 sm:hidden">
        <SimBadge />
      </div>
      {siteUrl && open && (
        <nav id="demo-menu" className="border-t border-border px-4 py-3 lg:hidden">
          <a href={siteUrl} className="flex min-h-11 items-center gap-2 font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {back}
          </a>
        </nav>
      )}
    </header>
  );
}
