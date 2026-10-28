export type Lang = "es" | "en";

/** Spanish is the source of truth: texts are copied verbatim from the screens. */
const es = {
  meta: {
    description: "NODES · simulación de densidad en exteriores",
  },
};

export type Dictionary = typeof es;

/** Typed as Dictionary so a missing English key fails the type check. */
const en: Dictionary = {
  meta: {
    description: "NODES · outdoor crowd density simulation",
  },
};

export const dictionaries: Record<Lang, Dictionary> = { es, en };
