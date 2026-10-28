/** Deterministic integer hash of `(str, i)` mapped to [-1, 1]. */
function hash(str: string, i: number) {
  let h = 2166136261 ^ i;
  for (let k = 0; k < str.length; k++) h = Math.imul(h ^ str.charCodeAt(k), 16777619);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h ^= h >>> 13;
  return ((h >>> 0) / 4294967295) * 2 - 1;
}

/** Smooth deterministic noise in [-1, 1], seeded by `id`, varying continuously with `min`. */
export function noise(id: string, min: number) {
  const i = Math.floor(min);
  const f = min - i;
  const s = f * f * (3 - 2 * f);
  return hash(id, i) * (1 - s) + hash(id, i + 1) * s;
}
