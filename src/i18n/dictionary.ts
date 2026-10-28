export type Lang = "es" | "en";

/** Spanish is the source of truth: texts are copied verbatim from the screens. */
const es = {
  meta: {
    description: "NODES · simulación de densidad en exteriores",
  },
  shell: {
    nav: {
      home: "Inicio",
      map: "Mapa",
      alerts: "Alertas",
      reports: "Informes",
      about: "Más",
    },
    tagline: "Datos para decidir a tiempo",
    dataStatus: "Estado de los datos",
    simulation: "Simulación",
    language: "Idioma",
  },
};

export type Dictionary = typeof es;

/** Typed as Dictionary so a missing English key fails the type check. */
const en: Dictionary = {
  meta: {
    description: "NODES · outdoor crowd density simulation",
  },
  shell: {
    nav: {
      home: "Home",
      map: "Map",
      alerts: "Alerts",
      reports: "Reports",
      about: "More",
    },
    tagline: "Data to decide in time",
    dataStatus: "Data status",
    simulation: "Simulation",
    language: "Language",
  },
};

export const dictionaries: Record<Lang, Dictionary> = { es, en };
