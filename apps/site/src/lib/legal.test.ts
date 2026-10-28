import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { locales } from "../i18n";
import { legalPages, legalSlug } from "./legal";

// The legal texts are not in the repo yet (pages off until they are final). When they arrive,
// every page must exist in both languages with a draft flag.
const dir = join(import.meta.dirname, "../content/legal");
const filesOf = (locale: string) => (existsSync(join(dir, locale)) ? readdirSync(join(dir, locale)).sort() : []);

describe("legal content", () => {
  it("has the same files in every locale", () => {
    for (const locale of locales) expect(filesOf(locale)).toEqual(filesOf(locales[0]));
  });
  it("uses only known page slugs, each with a draft flag", () => {
    const slugs = legalPages.map((page) => `${legalSlug(page)}.md`);
    for (const locale of locales)
      for (const file of filesOf(locale)) {
        expect(slugs).toContain(file);
        expect(readFileSync(join(dir, locale, file), "utf8")).toMatch(/^---\ndraft: (true|false)\n/);
      }
  });
});
