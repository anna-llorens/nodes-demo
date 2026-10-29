import { Routes } from "@/lib/routes";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Bell } from "lucide-react";
import { SiteLogo, SimBadge } from "./Logo";
import { demoText } from "@/i18n/demo-entry";
import { localizedSiteUrl, siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { mapRoutePath, mapText, type MapLocale } from "@/i18n/map";

/**
 * Header of every demo screen: logo (to the public site), the simulation badge, "Volver a la web"
 * and, inside scenarios, the alerts bell. On mobile the site link moves into a menu.
 * The site links only render once PUBLIC_SITE_URL is set.
 */
export function DemoHeader({ alertCount, hideLogoOnDesktop = false, mapLocale }: { alertCount?: number; hideLogoOnDesktop?: boolean; mapLocale?: MapLocale }) {
  const path = useRouterState({ select: (router) => router.location.pathname });
  const searchStr = useRouterState({ select: (router) => router.location.searchStr });
  const showSiteLink = Boolean(siteUrl && (path === Routes.demoMap || (mapLocale && path === mapRoutePath(mapLocale))));
  const back = mapLocale ? mapText(mapLocale, "demo.backToSite") : demoText("demoEntry.backToSite");
  const badgeLabel = mapLocale ? mapText(mapLocale, "demo.simulationBadge") : undefined;
  const siteHref = localizedSiteUrl(siteUrl, mapLocale ?? "es");
  return (
    <header className="relative shrink-0 border-b border-border bg-card">
      <div className="flex min-h-14 items-center gap-3 px-4 py-2 sm:px-6">
        <SiteLogo className={cn("text-2xl sm:text-3xl", hideLogoOnDesktop && "lg:hidden")} />
        {showSiteLink && siteUrl ? (
          <>
            <a href={siteHref} className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-primary hover:bg-muted lg:inline-flex">
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              {back}
            </a>
            <SimBadge className="hidden sm:inline-flex lg:hidden" label={badgeLabel} />
          </>
        ) : (
          <SimBadge className="hidden sm:inline-flex" label={badgeLabel} />
        )}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {mapLocale && (
            <nav aria-label={mapText(mapLocale, "language.label")} className="flex items-center gap-1 text-sm font-semibold">
              <a
                href={`${mapRoutePath("es")}${searchStr}`}
                lang="es"
                aria-current={mapLocale === "es" ? "page" : undefined}
                className={cn("rounded px-1.5 py-1", mapLocale === "es" ? "text-primary" : "text-muted-foreground hover:text-foreground")}
              >ES</a>
              <span aria-hidden="true" className="text-muted-foreground">·</span>
              <a
                href={`${mapRoutePath("en")}${searchStr}`}
                lang="en"
                aria-current={mapLocale === "en" ? "page" : undefined}
                className={cn("rounded px-1.5 py-1", mapLocale === "en" ? "text-primary" : "text-muted-foreground hover:text-foreground")}
              >EN</a>
            </nav>
          )}
          {showSiteLink && <SimBadge className="hidden lg:inline-flex" label={badgeLabel} />}
          {alertCount !== undefined && (
            <Link to={Routes.alerts} aria-label={`Alertas: ${alertCount}`} className="relative grid h-11 w-11 place-items-center rounded-full text-muted-foreground hover:bg-muted">
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
              {alertCount > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-dens-crit px-1 text-[10px] font-bold leading-none text-white">{alertCount}</span>
              )}
            </Link>
          )}
        </div>
      </div>
      {/* Phones: the badge gets its own row so it stays on one line. */}
      <div className="flex justify-center px-4 pb-2 sm:hidden">
        <SimBadge label={badgeLabel} />
      </div>
      {showSiteLink && siteUrl && (
        <nav id="demo-menu" className="border-t border-border px-4 py-3 lg:hidden">
          <a href={siteHref} className="flex min-h-11 items-center gap-2 font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {back}
          </a>
        </nav>
      )}
    </header>
  );
}
