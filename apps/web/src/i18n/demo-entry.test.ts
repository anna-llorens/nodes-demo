import { maraton, mascleta } from "@nodes/core";
import { describe, expect, it } from "vitest";
import { demoEntryHead, demoText } from "./demo-entry";
import en from "./demo-entry.en.json";
import es from "./demo-entry.es.json";

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("demo entry copy", () => {
  it("has the same keys in Spanish and English, none empty, with the same placeholders", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
    for (const [key, text] of Object.entries(es)) {
      expect(text.trim(), key).not.toBe("");
      expect(en[key as keyof typeof en].trim(), key).not.toBe("");
      expect(placeholders(en[key as keyof typeof en]), key).toEqual(placeholders(text));
    }
  });

  it("shows each scenario's real schedule", () => {
    for (const [lang, copy] of [
      ["es", es],
      ["en", en],
    ] as const) {
      expect(copy["demoEntry.halfMarathon.time"], lang).toBe(
        `${maraton.schedule.start}–${maraton.schedule.end}`,
      );
      expect(copy["demoEntry.mascleta.time"], lang).toBe(
        `${mascleta.schedule.start}–${mascleta.schedule.end}`,
      );
    }
  });

  it("fills placeholders", () => {
    expect(demoText("demoEntry.halfMarathon.nodes", { count: 8 })).toBe("8 nodos");
  });
  it("renders the entry and its metadata in the incoming language", () => {
    expect(demoText("demoEntry.halfMarathon.nodes", { count: 8 }, "en")).toBe("8 nodes");
    expect(demoEntryHead("en").meta).toContainEqual({ title: `${en["demoEntry.title"]} — NODES` });
    expect(demoEntryHead("es").meta).toContainEqual({
      name: "description",
      content: es["demoEntry.lead"],
    });
  });
});
