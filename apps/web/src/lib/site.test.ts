import { describe, expect, it } from "vitest";
import { localizedSiteUrl } from "./site";

describe("localizedSiteUrl", () => {
  it("links back to the public site in the current locale", () => {
    expect(localizedSiteUrl("https://site.example", "en")).toBe("https://site.example/en/");
    expect(localizedSiteUrl("https://site.example/", "es")).toBe("https://site.example/es/");
  });

  it("preserves a configured base path and handles an unset URL", () => {
    expect(localizedSiteUrl("https://example.org/site", "en")).toBe("https://example.org/site/en/");
    expect(localizedSiteUrl(undefined, "es")).toBeUndefined();
  });
});
