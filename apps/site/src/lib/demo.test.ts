import { describe, expect, it } from "vitest";
import { demoScenarioUrl } from "./demo";

describe("demoScenarioUrl", () => {
  it("links to the scenario on the demo map", () => {
    expect(demoScenarioUrl("https://demo.example/", "maraton")).toBe("https://demo.example/map?scenario=maraton");
    expect(demoScenarioUrl("https://demo.example", "mascleta")).toBe("https://demo.example/map?scenario=mascleta");
  });
  it("keeps a base path", () => {
    expect(demoScenarioUrl("https://example.org/demo", "maraton")).toBe("https://example.org/demo/map?scenario=maraton");
  });
  it("returns undefined without a demo URL", () => {
    expect(demoScenarioUrl(undefined, "maraton")).toBeUndefined();
  });
});
