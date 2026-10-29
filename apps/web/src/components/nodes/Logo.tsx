import { useAppLocale } from "@/i18n/locale-context";
import { Routes } from "@/lib/routes";
import { logoSvg } from "@nodes/ui/logo";
import { useRouterState } from "@tanstack/react-router";
import { demoText } from "@/i18n/demo-entry";
import { localizedSiteUrl, siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { mapLocales, mapRoutePath } from "@/i18n/map";

const svg = logoSvg({ className: "nodes-logo" });

/** Official NODES wordmark in the demo's colours. Height follows the font size (text-* classes). */
export function Logo({ className }: { className?: string | undefined }) {
  return <span className={cn("inline-flex text-brand-ink", className)} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** Links to the public website from the dedicated map route, and to the demo home elsewhere. */
export function SiteLogo({ className }: { className?: string | undefined }) {
  const path = useRouterState({ select: (router) => router.location.pathname });
  const appLocale = useAppLocale();
  const locale = mapLocales.find((item) => path === mapRoutePath(item));
  const href = locale ? localizedSiteUrl(siteUrl, locale) : path === Routes.demoMap ? localizedSiteUrl(siteUrl, appLocale) ?? Routes.root : Routes.root;
  return (
    <a href={href} className="inline-flex rounded-md">
      <Logo className={className} />
    </a>
  );
}

/** "Simulación · datos no medidos": shown on every demo screen while the data is simulated. */
export function SimBadge({ className, label }: { className?: string; label?: string | undefined }) {
  const locale = useAppLocale();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-warning bg-warning/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-warning-foreground",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning-foreground" />
      {label ?? demoText("demoEntry.simulationBadge", undefined, locale)}
    </span>
  );
}
