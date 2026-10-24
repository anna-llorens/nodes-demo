import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("font-display font-bold tracking-tight text-brand-ink", className)} aria-label="NODES">
      N<span className="text-primary">O</span>DES
    </span>
  );
}

export function SimBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-warning bg-warning/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-warning-foreground",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-warning-foreground" />
      Simulación · datos no medidos
    </span>
  );
}
