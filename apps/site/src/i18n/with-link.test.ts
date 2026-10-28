import { describe, expect, it } from "vitest";
import en from "./en.json";
import es from "./es.json";
import { withLink } from "./with-link";

describe("withLink", () => {
  it("splits around the placeholder", () => {
    expect(withLink("I accept the {link}.")).toEqual({ before: "I accept the ", after: ".", hasLink: true });
  });
  it("returns text without a placeholder whole", () => {
    expect(withLink("No link")).toEqual({ before: "No link", after: "", hasLink: false });
  });
  it("finds the placeholder in the consent and privacy texts of both languages", () => {
    for (const strings of [es, en])
      for (const key of ["collab.form.consent", "collab.form.privacyInfo"] as const) expect(withLink(strings[key]).hasLink).toBe(true);
  });
});
