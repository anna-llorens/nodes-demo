import type { Curve } from "./types";
import { toMin } from "./time";

/** Linear interpolation of a time curve, clamped to its first and last values. */
export function interp(pts: Curve, min: number) {
  const k = pts as Curve & { 0: [string, number] };
  if (min <= toMin(k[0][0])) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    const a = toMin(k[i - 1]![0]);
    const b = toMin(k[i]![0]);
    if (min <= b) {
      const t = (min - a) / (b - a);
      return k[i - 1]![1] + (k[i]![1] - k[i - 1]![1]) * t;
    }
  }
  return k[k.length - 1]![1];
}
