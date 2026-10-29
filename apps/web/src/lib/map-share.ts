import type { Scenario } from '@/scenarios/types';

export interface MapLayers {
  heat: boolean;
  runners: boolean;
  rings: boolean;
  flow: boolean;
  route: boolean;
  zones?: boolean;
  traffic?: boolean;
  closures?: boolean;
}
export type RunnerPalette = 'termica' | 'verde' | 'azul' | 'terracota' | 'grafito';
export interface MapCamera { lng: number; lat: number; zoom: number; bearing: number; pitch: number }
const layerKeys = ['heat', 'runners', 'rings', 'flow', 'route', 'zones', 'traffic', 'closures'] as const;
const palettes: RunnerPalette[] = ['termica', 'verde', 'azul', 'terracota', 'grafito'];
export const defaultLayers: MapLayers = { heat: true, runners: true, rings: true, flow: false, route: true, zones: true, traffic: false, closures: false };
export interface MapSearch { scenario?: string | undefined; layers?: string | undefined; camera?: string | undefined; palette?: string | undefined; time?: number | undefined }
export function validateMapSearch(raw: Record<string, unknown>): MapSearch {
  return {
    scenario: typeof raw['scenario'] === 'string' ? raw['scenario'] : undefined,
    layers: typeof raw['layers'] === 'string' ? raw['layers'] : undefined,
    camera: typeof raw['camera'] === 'string' ? raw['camera'] : undefined,
    palette: typeof raw['palette'] === 'string' ? raw['palette'] : undefined,
    time: typeof raw['time'] === 'number' && Number.isFinite(raw['time']) ? raw['time'] : undefined,
  };
}
export function restoreMapState(search: ReturnType<typeof validateMapSearch>, scenario: Scenario) {
  const active = search.layers?.split(',');
  const layers = active === undefined ? { ...defaultLayers } : Object.fromEntries(layerKeys.map(k => [k, active.includes(k)])) as unknown as MapLayers;
  const parts = search.camera?.split(',').map(Number);
  const valid = parts?.length === 5 && parts.every(Number.isFinite) && Math.abs(parts[0] ?? 181) <= 180 && Math.abs(parts[1] ?? 91) <= 85.051129;
  const camera: MapCamera = valid && parts ? {
    lng: parts[0] ?? scenario.center[0], lat: parts[1] ?? scenario.center[1],
    zoom: Math.max(0, Math.min(22, parts[2] ?? scenario.zoom)),
    bearing: (parts[3] ?? 0) % 360, pitch: Math.max(0, Math.min(60, parts[4] ?? 0)),
  } : { lng: scenario.center[0], lat: scenario.center[1], zoom: scenario.zoom, bearing: 0, pitch: 0 };
  const palette = palettes.find(p => p === search.palette) ?? 'termica';
  const minutes = (clock: string) => { const [h, m] = clock.split(':').map(Number); return (h ?? 0) * 60 + (m ?? 0); };
  const time = Math.max(minutes(scenario.schedule.start), Math.min(minutes(scenario.schedule.end), search.time ?? minutes(scenario.defaultTime ?? scenario.schedule.start)));
  return { layers, camera, palette, time };
}
/** Default event time for the marathon map (08:43, its scenario defaultTime). */
export const DEFAULT_MARATHON_MINUTE = 523;
export const DEFAULT_SPEED = 100;
const CACHE_KEY = 'nodes-map-state-v1';
export interface MapCache { layers?: MapLayers; camera?: MapCamera; palette?: RunnerPalette; time?: number; speed?: number }
/** One cache per scenario; the marathon keeps the original key so existing visitors resume as before. */
const cacheKey = (scenarioId = 'maraton') => scenarioId === 'maraton' ? CACHE_KEY : `${CACHE_KEY}:${scenarioId}`;
export function readMapCache(scenarioId?: string): MapCache | null {
  try { const raw = localStorage.getItem(cacheKey(scenarioId)); return raw ? JSON.parse(raw) as MapCache : null; } catch { return null; }
}
export function writeMapCache(patch: MapCache, scenarioId?: string) {
  try { localStorage.setItem(cacheKey(scenarioId), JSON.stringify({ ...(readMapCache(scenarioId) ?? {}), ...patch })); } catch { /* ignore */ }
}
/** Validates cached values through the same rules as shared links. */
export function restoreFromCache(cache: MapCache, scenario: Scenario) {
  const c = cache.camera;
  const search: MapSearch = {
    layers: cache.layers ? layerKeys.filter(k => cache.layers?.[k]).join(',') : undefined,
    camera: c ? [c.lng, c.lat, c.zoom, c.bearing, c.pitch].join(',') : undefined,
    palette: cache.palette, time: typeof cache.time === 'number' ? cache.time : undefined,
  };
  const speed = typeof cache.speed === 'number' && cache.speed > 0 ? cache.speed : DEFAULT_SPEED;
  return { ...restoreMapState(search, scenario), speed };
}
export function buildMapShareUrl(origin: string, state: { scenario: string; layers: MapLayers; camera: MapCamera; palette: RunnerPalette; time: number }, path = "/map") {
  const url = new URL(path, origin);
  url.searchParams.set('scenario', state.scenario);
  url.searchParams.set('layers', layerKeys.filter(k => state.layers[k]).join(','));
  url.searchParams.set('camera', [state.camera.lng, state.camera.lat, state.camera.zoom, state.camera.bearing, state.camera.pitch].join(','));
  url.searchParams.set('palette', state.palette);
  url.searchParams.set('time', String(state.time));
  return url.href;
}
