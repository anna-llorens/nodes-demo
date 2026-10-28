import { describe, expect, it, vi } from "vitest";
import { submitContact, toPayload, validateContact, type ContactFields } from "./contact";

const valid: ContactFields = { name: " Ana ", email: " ana@example.org ", type: "research", message: " Hola ", consent: true };
const payload = toPayload(valid, "es");

describe("validateContact", () => {
  it("accepts a complete form, with or without a type", () => {
    expect(validateContact(valid)).toEqual([]);
    expect(validateContact({ ...valid, type: "" })).toEqual([]);
  });
  it("lists every invalid field in form order", () => {
    expect(validateContact({ name: " ", email: "ana@", type: "", message: "", consent: false })).toEqual([
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
    expect(payload).toEqual({ name: "Ana", email: "ana@example.org", type: "research", message: "Hola", locale: "es" });
  });
  it("sends an unknown type as empty", () => {
    expect(toPayload({ ...valid, type: "other" }, "en").type).toBe("");
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
      headers: { "Content-Type": "application/json" },
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
