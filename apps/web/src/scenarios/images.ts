import imgSalida from "@/assets/nodes/salida.jpg";
import imgAyto from "@/assets/nodes/ayuntamiento.jpg";
import imgAnim from "@/assets/nodes/animacion.jpg";
import imgMeta from "@/assets/nodes/meta.jpg";
import imgCruce from "@/assets/nodes/cruce.jpg";
import imgPlaza from "@/assets/mascleta.jpg";

/** Site photo per node id. */
export const nodeImages: Record<string, string> = {
  salida: imgSalida,
  ayuntamiento: imgAyto,
  animacion: imgAnim,
  meta: imgMeta,
  cruce1: imgCruce,
  cruce2: imgCruce,
  cruce3: imgCruce,
  cruce4: imgCruce,
  "m-plaza": imgPlaza,
  "m-xativa": imgPlaza,
  "m-estacion": imgPlaza,
  "m-plaza-sur": imgPlaza,
};
