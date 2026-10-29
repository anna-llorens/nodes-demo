import type { DensityLevel, SuggestionCode } from "@nodes/core";
import type { ScenarioCopy } from "./es";

export const ESTIMATE_LABEL = "Extrapolated estimate · not measured";

export const densityLabel: Record<DensityLevel, string> = {
  low: "Low density",
  medium: "Medium density",
  high: "High density",
  very_high: "Very high density",
};

export const suggestionLabel: Record<SuggestionCode, string> = {
  divert_to_gran_via: "redirect flow towards Gran Vía",
  open_side_exit: "open a side exit",
};

export const kindLabel = { zone: "Control zone", crossing: "Crossing point" } as const;

export const scenarioCopy: Record<string, ScenarioCopy> = {
  maraton: {
    name: "València Half Marathon",
    shortName: "Half Marathon",
    tagline: "hypothetical large-event deployment",
    participantsBasis: "2025 edition",
    zonesLabel: "approximate zones",
    nodes: {
      salida: { name: "Start", description: "Starting corrals and accompanying spectators.", address: "Route start" },
      ayuntamiento: { name: "Town Hall Square", description: "A busy central section with many spectators.", address: "Town Hall Square, Ciutat Vella" },
      animacion: { name: "Entertainment point", description: "Music and entertainment area along the route.", address: "Route, approx. km 10" },
      meta: { name: "Finish · meeting point", description: "Runners finish and meet up with family.", address: "City of Arts and Sciences" },
      cruce1: { name: "Xàtiva Metro", description: "Underpass at Xàtiva metro station.", address: "Underpass at Xàtiva metro station." },
      cruce2: { name: "8 Colón St", description: "8 Colón St.", address: "8 Colón St." },
      cruce3: { name: "Colón · Puerta del Mar", description: "Colón St at Puerta del Mar.", address: "Colón St at Puerta del Mar." },
      cruce4: { name: "Tarongers Ave", description: "Tarongers Ave, before the Cactus roundabout (Lluís Peixó St corner, by the funeral home).", address: "Tarongers Ave, before the Cactus roundabout (Lluís Peixó St corner, by the funeral home)." },
    },
    zones: {
      "z-salida": "Starting corrals",
      "z-ayuntamiento": "Town Hall Square passage",
      "z-animacion": "Entertainment section",
      "z-meta": "Finish straight and meeting point",
      "z-cruce1": "Xàtiva Metro access",
      "z-cruce2": "8 Colón St",
      "z-cruce3": "Colón · Puerta del Mar",
      "z-cruce4": "Tarongers Ave",
    },
    roadClosures: {
      c1: "Constitució Ave · underpass",
      c2: "Sant Vicent de Paül",
      c3: "Primat Reig Ave · Alfauir",
      c4: "Almassora",
      c5: "Botanical Garden · Cabanilles",
      c6: "Tarongers Ave · V-21",
      c7: "Catalunya Ave",
      c8: "Albereda Promenade",
      c9: "Nova Albereda",
      c10: "Eduard Boscà Ave",
      c11: "Alcalde Reig",
      c12: "Germanies · Russafa",
      c13: "Xàtiva St · Sant Vicent",
      c14: "Guillem de Castro · underpass",
      c15: "Pérez Galdós Ave · underpass",
      c16: "Pius XII · Ballester",
      c17: "França Ave · Dr Waksman",
    },
  },
  mascleta: {
    name: "Mascletà · Town Hall Square · simulation",
    shortName: "Mascletà",
    zonesLabel: "approximate zones",
    nodes: {
      "m-plaza": { name: "Town Hall Square", description: "Crowds around the fenced firing area.", address: "Plaça de l'Ajuntament" },
      "m-xativa": { name: "Xàtiva Street", description: "Main access and exit to the south and east.", address: "Carrer de Xàtiva" },
      "m-estacion": { name: "North Station", description: "Exit towards the station and Xàtiva metro.", address: "Estació del Nord · Carrer de Xàtiva" },
      "m-plaza-sur": { name: "Town Hall Square · south", description: "Southern section of the square, next to the fenced firing area.", address: "Plaça de l'Ajuntament · sector sud" },
    },
    zones: {
      "plaza-norte": "Town Hall Square · north",
      "plaza-sur": "Town Hall Square · south",
      "san-vicente": "San Vicente to Calle de la Paz",
      "maria-cristina": "María Cristina Ave",
      correos: "Opposite the post office",
      "marques-sotelo": "Marqués de Sotelo Ave",
      "san-pablo": "San Pablo Street",
      ribera: "Ribera Street",
      ruzafa: "Start of Ruzafa",
      "acceso-xativa": "Xàtiva access",
      "acceso-estacion": "North Station access",
      "acceso-gran-via": "Gran Vía access",
    },
    roadClosures: {},
  },
};
