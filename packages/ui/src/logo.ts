/**
 * The NODES wordmark as an SVG string, recoloured for the UI: the official file
 * (assets/logo/source, kept untouched) has fixed fills; here the letters N, D, E, S get the class
 * `nodes-logo-letters` and the "O" `nodes-logo-o`, so each app colours them with its own tokens.
 * Pure string work: used by Logo.astro (site) and the demo's React logo.
 */
import source from "../assets/logo/source/NODES_sin_eslogan_fondo_claro.svg?raw";

const LETTERS_FILL = 'fill="#082D2A"';
const O_FILL = 'fill="#00615F"';

const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** The logo SVG with `className` on the root, labelled for screen readers (default "NODES"). */
export function logoSvg({ className = "", label = "NODES" }: { className?: string; label?: string } = {}): string {
  if (!source.includes(LETTERS_FILL) || !source.includes(O_FILL)) {
    throw new Error("Logo source colours changed: update the fills in packages/ui/src/logo.ts");
  }
  return source
    .slice(source.indexOf("<svg"))
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/\s(width|height|role|aria-label)="[^"]*"/g, "")
    .replace("<svg", `<svg class="${escape(className)}" role="img" aria-label="${escape(label)}" focusable="false"`)
    .replace(LETTERS_FILL, 'class="nodes-logo-letters"')
    .replace(O_FILL, 'class="nodes-logo-o"');
}
