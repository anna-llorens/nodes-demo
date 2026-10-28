import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/** Colours come from tokens (packages/ui/src/tokens.css): no raw hex in site sources. */
const root = join(import.meta.dirname, "..");
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(astro|css|ts)$/.test(name) && !name.endsWith(".test.ts") ? [path] : [];
  });
// A hex colour in CSS or markup; in-page anchors like href="#main" are not colours.
const HEX = /(?<![\w&/"'=])#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi;

describe("site sources", () => {
  it("use no raw hex colours", () => {
    const found = files(root).flatMap((path) =>
      (readFileSync(path, "utf8").match(HEX) ?? []).map((hex) => `${relative(root, path)}: ${hex}`),
    );
    expect(found).toEqual([]);
  });
});
