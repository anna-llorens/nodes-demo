/** Utilidades para dibujar polígonos aproximados de zona (coordenadas [lng, lat]). */
const M_PER_DEG_LAT = 111320;

/** Desplaza un punto `eastM` metros al este y `northM` metros al norte. */
export function offset([lng, lat]: [number, number], eastM: number, northM: number): [number, number] {
  return [lng + eastM / (M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180)), lat + northM / M_PER_DEG_LAT];
}

/** Rectángulo cerrado de `lengthM` × `widthM` centrado en `center`; el largo sigue el rumbo (grados desde el norte). */
export function rect(center: [number, number], lengthM: number, widthM: number, bearingDeg: number): [number, number][] {
  const b = (bearingDeg * Math.PI) / 180;
  const along = [Math.sin(b), Math.cos(b)] as const;
  const across = [Math.cos(b), -Math.sin(b)] as const;
  const corner = (l: number, w: number) => offset(center, along[0] * l + across[0] * w, along[1] * l + across[1] * w);
  const l = lengthM / 2, w = widthM / 2;
  const ring = [corner(l, w), corner(l, -w), corner(-l, -w), corner(-l, w)];
  return [...ring, ring[0]!];
}

/** Rumbo (grados desde el norte) del recorrido alrededor del punto `i`. */
export function routeBearing(route: [number, number][], i: number, span = 3) {
  const a = route[Math.max(0, i - span)]!;
  const b = route[Math.min(route.length - 1, i + span)]!;
  const east = (b[0] - a[0]) * Math.cos((a[1] * Math.PI) / 180);
  const north = b[1] - a[1];
  return (Math.atan2(east, north) * 180) / Math.PI;
}
