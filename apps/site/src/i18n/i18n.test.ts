import { describe, expect, it } from "vitest";
import es from "./es.json";
import en from "./en.json";
import { t } from "./index";

describe("site translations", () => {
  it("have the same keys in es.json and en.json", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
  });
  it("have no empty strings", () => {
    for (const [key, value] of [...Object.entries(es), ...Object.entries(en)]) expect(value.trim(), key).not.toBe("");
  });
  it("use the same placeholders in both languages", () => {
    const params = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const key of Object.keys(es) as (keyof typeof es)[]) expect(params(en[key]), key).toEqual(params(es[key]));
  });
});

describe("t", () => {
  it("returns the text for the locale", () => {
    expect(t("es", "nav.home")).toBe("Inicio");
    expect(t("en", "nav.home")).toBe("Home");
  });
  it("replaces {param} placeholders", () => {
    expect(t("es", "footer.copyright", { year: 2026 })).toBe("© 2026 NODES. Proyecto en desarrollo.");
  });
  it("leaves unknown placeholders untouched", () => {
    expect(t("en", "footer.copyright", {})).toContain("{year}");
  });
});
