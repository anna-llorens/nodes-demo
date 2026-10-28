import { describe, expect, it } from "vitest";
import { pickLocale } from "./pick-locale";

describe("pickLocale", () => {
  it("rule 1: a saved choice always wins", () => {
    expect(pickLocale({ cookie: "en", languages: ["es-ES"], country: "ES" })).toBe("en");
    expect(pickLocale({ cookie: "es", languages: ["en-US"], country: "US" })).toBe("es");
  });
  it("ignores an invalid saved choice", () => {
    expect(pickLocale({ cookie: "fr", languages: ["en-GB"] })).toBe("en");
  });
  it("rule 2: Spanish for es, ca, gl or eu browser languages, at any position", () => {
    for (const language of ["es", "es-MX", "ca-ES", "gl", "eu-ES", "CA"]) expect(pickLocale({ languages: [language] })).toBe("es");
    expect(pickLocale({ languages: ["en-US", "ca"] })).toBe("es");
  });
  it("rule 3: Spanish for Spain and Spanish-speaking countries", () => {
    expect(pickLocale({ languages: ["en-US"], country: "MX" })).toBe("es");
    expect(pickLocale({ languages: ["de-DE"], country: "es" })).toBe("es");
  });
  it("rule 4: English otherwise", () => {
    expect(pickLocale({})).toBe("en");
    expect(pickLocale({ languages: ["fr-FR", "en"], country: "FR" })).toBe("en");
    expect(pickLocale({ languages: ["fr-FR"], country: "US" })).toBe("en");
  });
});
