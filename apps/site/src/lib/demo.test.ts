import { describe, expect, it } from "vitest";
import { demoDefaultUrl, demoScenarioUrl } from "./demo";

describe("demoDefaultUrl", () => {
  it("opens the marathon map directly in the site's locale", () => {
    expect(demoDefaultUrl("https://demo.example", "en")).toBe("https://demo.example/en/demo/map?scenario=maraton");
    expect(demoDefaultUrl("https://demo.example/", "es")).toBe("https://demo.example/es/demo/map?scenario=maraton");
  });
  it("preserves a configured app base path", () => {
    expect(demoDefaultUrl("https://example.org/app", "en"))
      .toBe("https://example.org/app/en/demo/map?scenario=maraton");
  });
  it("keeps the link absent when the demo URL is unset", () => {
    expect(demoDefaultUrl(undefined, "en")).toBeUndefined();
  });
});

describe("demoScenarioUrl", () => {
  it("links to the scenario on the map in the selected language", () => {
    expect(demoScenarioUrl("https://demo.example/", "maraton", "es")).toBe("https://demo.example/es/demo/map?scenario=maraton");
    expect(demoScenarioUrl("https://demo.example", "mascleta", "en")).toBe("https://demo.example/en/demo/map?scenario=mascleta");
  });
  it("keeps a base path", () => {
    expect(demoScenarioUrl("https://example.org/demo", "maraton", "en")).toBe("https://example.org/demo/en/demo/map?scenario=maraton");
  });
  it("returns undefined without a demo URL", () => {
    expect(demoScenarioUrl(undefined, "maraton", "es")).toBeUndefined();
  });
});
