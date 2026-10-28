/**
 * Spanish UI text for domain codes and scenario content. Plain maps for now; the i18n
 * step replaces them with message catalogues. Rendered text must stay identical.
 */
import type { DensityLevel, SuggestionCode } from "@nodes/core";

/** Required label next to any estimated figure. */
export const ESTIMATE_LABEL = "Estimación extrapolada · no medida";

export const densityLabel: Record<DensityLevel, string> = {
  low: "Densidad baja",
  medium: "Densidad media",
  high: "Densidad alta",
  very_high: "Densidad muy alta",
};

/** Suggestion text without the "Sugerencia:" prefix. */
export const suggestionLabel: Record<SuggestionCode, string> = {
  divert_to_gran_via: "desviar flujo hacia Gran Vía",
  open_side_exit: "abrir salida lateral",
};

export const kindLabel = { zone: "Zona de control", crossing: "Punto de cruce" } as const;

export const CSV_HEADER = "Hora;Personas medidas;Personas estimadas (estimación extrapolada · no medida);Corredores;Público";

interface NodeCopy { name: string; description?: string; address?: string }
export interface ScenarioCopy {
  name: string;
  shortName: string;
  tagline?: string;
  /** Source of the registered runners figure. */
  participantsBasis?: string;
  zonesLabel?: string;
  nodes: Record<string, NodeCopy>;
  zones: Record<string, string>;
  roadClosures: Record<string, string>;
}

const crossing = (name: string, description: string): NodeCopy => ({ name, description, address: description });

export const scenarioCopy: Record<string, ScenarioCopy> = {
  maraton: {
    name: "Medio Maratón de València",
    shortName: "Medio Maratón",
    tagline: "despliegue hipotético de un gran evento",
    participantsBasis: "edición 2025",
    zonesLabel: "zonas aproximadas",
    nodes: {
      salida: { name: "Salida", description: "Cajones de salida y acompañantes.", address: "Inicio del recorrido" },
      ayuntamiento: { name: "Plaza del Ayuntamiento", description: "Paso por el centro con mucho público animando.", address: "Plaza del Ayuntamiento, Ciutat Vella" },
      animacion: { name: "Punto de animación", description: "Zona de música y animación en el recorrido.", address: "Recorrido, km 10 aprox." },
      meta: { name: "Meta · reencuentro", description: "Llegada de corredores y reencuentro con familias.", address: "Ciudad de las Artes y las Ciencias" },
      cruce1: crossing("Metro Xàtiva", "Paso subterráneo en la parada de metro Xàtiva."),
      cruce2: crossing("C/ Colón nº 8", "C/ Colón nº 8."),
      cruce3: crossing("Colón · Puerta del Mar", "C/ Colón con Puerta del Mar."),
      cruce4: crossing("Av. Tarongers", "Avda. de los Naranjos (Av. Tarongers), antes de la rotonda de los Cactus (esquina con C/ Lluís Peixó, a la altura del Tanatorio)."),
    },
    zones: {
      "z-salida": "Cajones de salida",
      "z-ayuntamiento": "Paso por la plaza del Ayuntamiento",
      "z-animacion": "Tramo de animación",
      "z-meta": "Recta de meta y reencuentro",
      "z-cruce1": "Acceso metro Xàtiva",
      "z-cruce2": "C/ Colón nº 8",
      "z-cruce3": "Colón · Puerta del Mar",
      "z-cruce4": "Av. Tarongers",
    },
    roadClosures: {
      c1: "Av. Constitució · paso inferior",
      c2: "Sant Vicent de Paül",
      c3: "Av. Primat Reig · Alfauir",
      c4: "Almassora",
      c5: "Jardí Botànic · Cabanilles",
      c6: "Av. dels Tarongers · V-21",
      c7: "Av. Catalunya",
      c8: "Passeig de l'Albereda",
      c9: "Nova Albereda",
      c10: "Av. Eduard Boscà",
      c11: "Alcalde Reig",
      c12: "Germanies · Russafa",
      c13: "C/ Xàtiva · Sant Vicent",
      c14: "Guillem de Castro · paso inferior",
      c15: "Av. Pérez Galdós · paso inferior",
      c16: "Pius XII · Ballester",
      c17: "Av. de França · Dr. Waksman",
    },
  },
  mascleta: {
    name: "Mascletà · plaza del Ayuntamiento · simulación",
    shortName: "Mascletà",
    zonesLabel: "zonas aproximadas",
    nodes: {
      "m-plaza": { name: "Plaza del Ayuntamiento", description: "Público alrededor de la zona de disparo vallada.", address: "Plaça de l'Ajuntament" },
      "m-xativa": { name: "Calle Xàtiva", description: "Acceso y salida principal hacia el sur y el este.", address: "Carrer de Xàtiva" },
      "m-estacion": { name: "Estación del Norte", description: "Salida hacia la estación y el metro Xàtiva.", address: "Estació del Nord · Carrer de Xàtiva" },
      "m-plaza-sur": { name: "Plaza del Ayuntamiento · sur", description: "Sector sur de la plaza, junto a la zona de disparo vallada.", address: "Plaça de l'Ajuntament · sector sur" },
    },
    zones: {
      "plaza-norte": "Plaza del Ayuntamiento · norte",
      "plaza-sur": "Plaza del Ayuntamiento · sur",
      "san-vicente": "San Vicente hasta calle de la Paz",
      "maria-cristina": "Av. María Cristina",
      correos: "Frente a Correos",
      "marques-sotelo": "Av. Marqués de Sotelo",
      "san-pablo": "Calle San Pablo",
      ribera: "Calle Ribera",
      ruzafa: "Inicio de Ruzafa",
      "acceso-xativa": "Acceso Xàtiva",
      "acceso-estacion": "Acceso Estación del Norte",
      "acceso-gran-via": "Acceso Gran Vía",
    },
    roadClosures: {},
  },
};
