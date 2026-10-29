import { describe, expect, it, vi } from "vitest";
import {
  interestFromQuery,
  parseContactRequest,
  submitContact,
  toPayload,
  validateContact,
  type ContactFields,
} from "./contact";

const valid: ContactFields = {
  name: " Ana ",
  email: " ana@example.org ",
  organization: " UPV ",
  interest: "research",
  message: " Hola ",
  consent: true,
};
const payload = toPayload(valid, "es");

describe("validateContact", () => {
  it("accepts a complete form, with or without an organization", () => {
    expect(validateContact(valid)).toEqual([]);
    expect(validateContact({ ...valid, organization: "" })).toEqual([]);
  });
  it("lists every invalid field in form order", () => {
    expect(validateContact({ ...valid, name: " ", email: "ana@", message: "", consent: false })).toEqual([
      "name",
      "email",
      "message",
      "consent",
    ]);
  });
  it("rejects emails without a domain or with spaces", () => {
    for (const email of ["ana", "ana@example", "ana @example.org", "@example.org"])
      expect(validateContact({ ...valid, email })).toEqual(["email"]);
  });
});

describe("toPayload", () => {
  it("trims the fields and adds the locale", () => {
    expect(payload).toEqual({
      name: "Ana",
      email: "ana@example.org",
      organization: "UPV",
      interest: "research",
      message: "Hola",
      locale: "es",
    });
  });
  it("sends an unknown interest as the default", () => {
    expect(toPayload({ ...valid, interest: "unlisted" }, "en").interest).toBe("general");
  });
});

describe("interestFromQuery", () => {
  it("keeps a known interest", () => {
    expect(interestFromQuery("pilot")).toBe("pilot");
  });
  it("falls back to general when missing or unknown", () => {
    expect(interestFromQuery(null)).toBe("general");
    expect(interestFromQuery("funding")).toBe("general");
  });
});

describe("parseContactRequest", () => {
  const body = { name: " Ana ", email: "ana@example.org", organization: "", interest: "pilot", message: "Hola", locale: "es" };
  it("returns the trimmed payload for a valid body", () => {
    expect(parseContactRequest(body)).toEqual({ ok: true, payload: { ...body, name: "Ana" } });
  });
  it("rejects missing fields, bad emails, unknown codes and long values", () => {
    for (const bad of [
      null,
      { ...body, name: "" },
      { ...body, email: "ana@" },
      { ...body, interest: "funding" },
      { ...body, locale: "fr" },
      { ...body, message: "x".repeat(2001) },
    ])
      expect(parseContactRequest(bad)).toEqual({ ok: false, reason: "invalid" });
  });
  it("flags a filled honeypot as spam", () => {
    expect(parseContactRequest({ ...body, website: "https://spam.example" })).toEqual({ ok: false, reason: "spam" });
  });
});

describe("submitContact", () => {
  it("fails without calling fetch when no endpoint is configured", async () => {
    const fetch = vi.fn();
    expect(await submitContact(payload, { endpoint: undefined, fetch })).toEqual({ ok: false, reason: "no_endpoint" });
    expect(fetch).not.toHaveBeenCalled();
  });
  it("posts the payload as JSON", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    expect(await submitContact(payload, { endpoint: "https://api.example/contact", fetch })).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith("https://api.example/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
  });
  it("reports an HTTP error", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    expect(await submitContact(payload, { endpoint: "https://api.example/contact", fetch })).toEqual({ ok: false, reason: "http" });
  });
  it("reports a network error", async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await submitContact(payload, { endpoint: "https://api.example/contact", fetch })).toEqual({ ok: false, reason: "network" });
  });
});
