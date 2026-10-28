import { cn } from "@/lib/utils";

/**
 * Renders an SVG asset from @nodes/ui (imported with `?raw`) inline, so it takes the CSS colour
 * (assets use currentColor). Decorative: hidden from screen readers.
 */
export function InlineSvg({ svg, className }: { svg: string; className?: string }) {
  const markup = svg.slice(svg.indexOf("<svg")).replace(/<title>[\s\S]*?<\/title>/g, "");
  return <span aria-hidden="true" className={cn("inline-block [&>svg]:h-full [&>svg]:w-full", className)} dangerouslySetInnerHTML={{ __html: markup }} />;
}
