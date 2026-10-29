import type { AlertLevel, Scenario, ScenarioNode } from "@/scenarios/types";
import { useLang } from "./useT";
import type { Lang } from "./dictionary";

type NodeText = Partial<Pick<ScenarioNode, "name" | "description" | "address">> & {
  suggestions?: Partial<Record<AlertLevel, string>>;
};
type ScenarioText = Partial<Pick<Scenario, "name" | "shortName" | "tagline" | "participantsBasis" | "zonesLabel">> & {
  nodes?: Record<string, NodeText>;
};

/**
 * English texts for the scenario data, keyed by scenario and node id. The scenario files stay the
 * Spanish source of truth; anything missing here falls back to it. Street names stay as they are.
 */
const en: Record<string, ScenarioText> = {
  maraton: {
    name: "València Half Marathon",
    shortName: "Half Marathon",
    participantsBasis: "2025 edition",
    tagline: "hypothetical deployment for a major event",
    zonesLabel: "approximate zones",
    nodes: {
      salida: { name: "Start", address: "Start of the course", description: "Start corrals and companions." },
      ayuntamiento: { description: "Passage through the centre with many cheering spectators." },
      animacion: {
        name: "Cheering point",
        address: "Course, approx. km 10",
        description: "Music and cheering zone on the course.",
      },
      meta: {
        name: "Finish · meeting point",
        address: "City of Arts and Sciences",
        description: "Runners arriving and meeting their families.",
        suggestions: { "muy-alta": "open a side exit" },
      },
      cruce1: {
        address: "Underground passage at the Xàtiva metro stop.",
        description: "Underground passage at the Xàtiva metro stop.",
      },
      cruce3: { address: "C/ Colón at Puerta del Mar.", description: "C/ Colón at Puerta del Mar." },
      cruce4: {
        address:
          "Avda. de los Naranjos (Av. Tarongers), before the Cactus roundabout (corner with C/ Lluís Peixó, next to the Tanatorio).",
        description:
          "Avda. de los Naranjos (Av. Tarongers), before the Cactus roundabout (corner with C/ Lluís Peixó, next to the Tanatorio).",
      },
    },
  },
  mascleta: {
    name: "Mascletà · Plaza del Ayuntamiento · simulation",
    zonesLabel: "approximate zones",
    nodes: {
      "m-plaza": { description: "Spectators around the fenced firing zone." },
      "m-xativa": {
        name: "Xàtiva Street",
        description: "Main access and exit towards the south and east.",
        suggestions: { "muy-alta": "divert the flow towards Gran Vía" },
      },
      "m-estacion": { name: "North Station", description: "Exit towards the station and the Xàtiva metro." },
      "m-plaza-sur": {
        name: "Plaza del Ayuntamiento · south",
        address: "Plaça de l'Ajuntament · south sector",
        description: "South sector of the square, next to the fenced firing zone.",
      },
    },
  },
};

const overlays: Record<Exclude<Lang, "es">, Record<string, ScenarioText>> = { en };
const cache = new WeakMap<Scenario, Scenario>();

/** Same scenario with its texts in `lang`. Spanish returns the original object untouched. */
export function localizeScenario<S extends Scenario>(s: S, lang: Lang): S {
  if (lang === "es") return s;
  const text = overlays[lang][s.id];
  if (!text) return s;
  const hit = cache.get(s);
  if (hit) return hit as S;
  const { nodes: nodeText, ...fields } = text;
  const out: S = {
    ...s,
    ...fields,
    nodes: s.nodes.map((n) => {
      const t = nodeText?.[n.id];
      return t ? { ...n, ...t, suggestions: { ...n.suggestions, ...t.suggestions } } : n;
    }),
  };
  // Stable object per scenario so engine caches (WeakMap by scenario) and memos keep working.
  cache.set(s, out);
  return out;
}

export function useLocalizeScenario() {
  const lang = useLang();
  return <S extends Scenario>(s: S) => localizeScenario(s, lang);
}
