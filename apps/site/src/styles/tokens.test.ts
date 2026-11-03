import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Dark theme (ADR 0014): every colour token has a dark value, the same in both dark blocks. */
const css = readFileSync(join(import.meta.dirname, "../../../../packages/ui/src/tokens.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

/** The `--color-*` declarations of the first rule whose header matches `header`, as { name: value }. */
const block = (header: RegExp): Record<string, string> => {
  const start = css.search(header);
  if (start < 0) throw new Error(`No block matching ${header}`);
  const open = css.indexOf("{", css.indexOf(":root", start));
  const body = css.slice(open + 1, css.indexOf("}", open));
  return Object.fromEntries([...body.matchAll(/(--color-[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2]!.trim()]));
};

const light = block(/^:root\s*\{/m);
const systemDark = block(/@media \(prefers-color-scheme: dark\)/);
const forcedDark = block(/^:root\[data-theme="dark"\]\s*\{/m);
// Only set in dark: in light each SVG keeps its own baked tint through the var() fallback.
const darkOnly = /^--color-illustration-wash-\d+$/;

describe("colour tokens", () => {
  it("have a dark value for every light colour token", () => {
    expect(Object.keys(light).length).toBeGreaterThan(0);
    expect(Object.keys(light).filter((name) => !(name in systemDark))).toEqual([]);
  });
  it("define no dark token without a light one, except illustration washes", () => {
    expect(Object.keys(systemDark).filter((name) => !(name in light) && !darkOnly.test(name))).toEqual([]);
  });
  it("use the same values for the system and the forced dark theme", () => {
    expect(forcedDark).toEqual(systemDark);
  });
});
