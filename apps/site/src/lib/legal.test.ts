import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { locales } from "../i18n";
import { legalPages, legalSlug } from "./legal";

const dir = join(import.meta.dirname, "../content/legal");

describe("legal content", () => {
  it.each(locales.flatMap((locale) => legalPages.map((page) => [locale, page] as const)))(
    "has %s/%s with a draft flag",
    (locale, page) => {
      const file = join(dir, locale, `${legalSlug(page)}.md`);
      expect(existsSync(file)).toBe(true);
      expect(readFileSync(file, "utf8")).toMatch(/^---\ndraft: (true|false)\n/);
    },
  );
});
