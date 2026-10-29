import { describe, expect, it } from "vitest";
import es from "./auth.es.json";
import en from "./auth.en.json";
import { authText } from "./auth";

describe("authentication translations", () => {
  it("provides the same keys with nonempty copy in both languages", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
    for (const value of [...Object.values(es), ...Object.values(en)])
      expect(value.trim()).not.toBe("");
  });
  it("localizes the shared header logout action", () => {
    expect(authText("es", "logout")).toBe("Cerrar sesión");
    expect(authText("en", "logout")).toBe("Sign out");
  });
});
