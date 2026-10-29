import { describe, expect, it } from "vitest";
import { demoScenarioUrl } from "./demo";

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
