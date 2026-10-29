import { describe, expect, it } from "vitest";
import { requestedLocale, validateLanguageSearch } from "./locale";

describe("cross-app language selection", () => {
  it("reads language explicitly passed from the site to the app entry", () => {
    expect(requestedLocale("/", "en")).toBe("en");
    expect(requestedLocale("/home", "es")).toBe("es");
    expect(validateLanguageSearch({ lang: "en", unrelated: "ignored" })).toEqual({ lang: "en" });
  });
  it("gives locale-prefixed map URLs priority over a conflicting language parameter", () => {
    expect(requestedLocale("/es/demo/map", "en")).toBe("es");
    expect(requestedLocale("/en/demo/map", "es")).toBe("en");
  });
  it("leaves missing or unsupported choices to the saved preference", () => {
    expect(requestedLocale("/home", undefined)).toBeUndefined();
    expect(requestedLocale("/map", "fr")).toBeUndefined();
    expect(validateLanguageSearch({ lang: ["en"] })).toEqual({});
  });
});
