import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { resolveAppLocale } from "./locale.server";

vi.mock("@tanstack/react-start/server", () => ({
  getCookie: vi.fn(),
  getRequest: vi.fn(),
  setCookie: vi.fn(),
}));
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getRequest).mockReturnValue(new Request("http://localhost:5173/"));
});

describe("saved app language", () => {
  it("defaults to Spanish without creating a preference for an unspecified visit", () => {
    expect(resolveAppLocale(undefined)).toBe("es");
    expect(setCookie).not.toHaveBeenCalled();
  });
  it("remembers the incoming English locale on the app host", () => {
    expect(resolveAppLocale("en")).toBe("en");
    expect(setCookie).toHaveBeenCalledWith(
      "nodes_lang",
      "en",
      expect.objectContaining({ path: "/", maxAge: 31536000, sameSite: "lax" }),
    );
  });
  it("uses the saved language on subsequent home, login and private-page requests", () => {
    vi.mocked(getCookie).mockReturnValue("en");
    expect(resolveAppLocale(undefined)).toBe("en");
    expect(setCookie).not.toHaveBeenCalled();
  });
  it("lets explicit Spanish URLs replace an English preference", () => {
    vi.mocked(getCookie).mockReturnValue("en");
    expect(resolveAppLocale("es")).toBe("es");
    expect(setCookie).toHaveBeenCalledWith("nodes_lang", "es", expect.any(Object));
  });
  it("allows the preference in embedded HTTPS previews", () => {
    vi.mocked(getRequest).mockReturnValue(new Request("https://preview.example/?lang=en"));
    resolveAppLocale("en");
    expect(setCookie).toHaveBeenCalledWith(
      "nodes_lang",
      "en",
      expect.objectContaining({ secure: true, sameSite: "none", partitioned: true }),
    );
  });
});
