import { logoSvg } from "@nodes/ui/logo";
import { demoText } from "@/i18n/demo-entry";
import { siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const svg = logoSvg({ className: "nodes-logo" });

/** Official NODES wordmark in the demo's colours. Height follows the font size (text-* classes). */
export function Logo({ className }: { className?: string | undefined }) {
  return <span className={cn("inline-flex text-brand-ink", className)} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** The logo linking to the public website, or the plain logo while PUBLIC_SITE_URL is unset. */
export function SiteLogo({ className }: { className?: string | undefined }) {
  if (!siteUrl) return <Logo className={className} />;
  return (
    <a href={siteUrl} className="inline-flex rounded-md">
      <Logo className={className} />
    </a>
  );
}

/** "Simulación · datos no medidos": shown on every demo screen while the data is simulated. */
export function SimBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-warning bg-warning/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-warning-foreground",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning-foreground" />
      {demoText("demoEntry.simulationBadge")}
    </span>
  );
}
