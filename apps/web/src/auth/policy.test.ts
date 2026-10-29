import { describe, expect, it } from "vitest";
import { isPublicPath, logoutDestination, safeReturnPath } from "./policy";

describe("page access policy", () => {
  it.each(["/", "/home", "/home/", "/login", "/es/demo/map", "/en/demo/map/"])(
    "allows anonymous access to %s",
    (path) => {
      expect(isPublicPath(path)).toBe(true);
    },
  );
  it.each([
    "/map",
    "/node/meta",
    "/alerts",
    "/reports",
    "/about",
    "/admin",
    "/demo/map",
    "/new-page",
    "/fr/demo/map",
    "/home/private",
  ])("requires authentication for %s", (path) => {
    expect(isPublicPath(path)).toBe(false);
  });
});

describe("login return destinations", () => {
  it.each([
    "/map?scenario=mascleta&time=840#details",
    "/node/m-xativa?t=523",
    "/en/demo/map?scenario=maraton",
    "/reports",
    "/admin",
    "/",
  ])("preserves valid internal destination %s", (path) => {
    expect(safeReturnPath(path)).toBe(path);
  });
  it.each([
    undefined,
    "https://example.com",
    "//example.com/map",
    "/\\example.com",
    "/%2f%2fexample.com",
    "/node/%5cfoo",
    "/login?redirect=/login",
    "/unknown",
    "/fr/demo/map",
    "/map\n",
  ])("rejects unsafe or unknown destination %s", (path) => {
    expect(safeReturnPath(path)).toBe("/home");
  });
});

describe("logout navigation", () => {
  it("keeps the selected scenario and shareable map state while dropping unrelated parameters", () => {
    expect(
      logoutDestination(
        "/map",
        "?scenario=mascleta&time=840&layers=heat,rings&camera=1,2,3,4,5&palette=verde&redirect=/admin",
      ),
    ).toBe(
      "/es/demo/map?scenario=mascleta&layers=heat%2Crings&camera=1%2C2%2C3%2C4%2C5&palette=verde&time=840",
    );
  });
  it("keeps the public map language", () => {
    expect(logoutDestination("/en/demo/map", "?scenario=maraton")).toBe(
      "/en/demo/map?scenario=maraton",
    );
  });
  it("keeps the selected app language when logging out of the private map", () => {
    expect(logoutDestination("/map", "?scenario=mascleta", "en")).toBe(
      "/en/demo/map?scenario=mascleta",
    );
    expect(logoutDestination("/es/demo/map", "?scenario=maraton", "en")).toBe(
      "/es/demo/map?scenario=maraton",
    );
  });
  it.each(["/admin", "/reports", "/node/meta", "/alerts", "/about"])(
    "leaves private page %s for home",
    (path) => {
      expect(logoutDestination(path, "?t=523")).toBe("/home");
    },
  );
  it("stays on either home entry", () => {
    expect(logoutDestination("/", "")).toBe("/");
    expect(logoutDestination("/home", "")).toBe("/home");
  });
});
