import { describe, expect, it } from "vitest";
import en from "../i18n/en.json";
import es from "../i18n/es.json";
import { team } from "./team";

describe("team config", () => {
  it("has name, role and text in both languages for every member", () => {
    for (const { id } of team)
      for (const field of ["name", "role", "text"])
        for (const strings of [es, en]) expect(strings).toHaveProperty([`team.${id}.${field}`]);
  });
  it("uses https links only", () => {
    for (const { linkedinUrl } of team) if (linkedinUrl) expect(linkedinUrl).toMatch(/^https:\/\//);
  });
});
