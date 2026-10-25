import { describe, expect, it } from 'vitest';
import { maraton } from '@/scenarios/maraton';
import { buildMapShareUrl, restoreMapState, validateMapSearch, defaultLayers, restoreFromCache, DEFAULT_SPEED } from './map-share';

describe('shared map state', () => {
  it('preserves scenario, every layer, camera, palette and event time in a reopened link', () => {
    const state = { scenario: 'maraton', layers: { heat: false, runners: true, rings: false, flow: true, route: true, traffic: true, closures: true }, camera: { lng: -0.37651, lat: 39.46975, zoom: 15.25, bearing: 24, pitch: 30 }, palette: 'verde' as const, time: 633.5 };
    const url = new URL(buildMapShareUrl('https://nodes-demo.lovable.app', state));
    const raw = Object.fromEntries(url.searchParams);
    const search = validateMapSearch({ ...raw, time: Number(raw['time']) });
    expect(search.scenario).toBe('maraton');
    expect(restoreMapState(search, maraton)).toEqual({ layers: state.layers, camera: state.camera, palette: state.palette, time: state.time });
  });
  it('preserves an explicitly empty layer selection', () => {
    const restored = restoreMapState(validateMapSearch({ layers: '' }), maraton);
    expect(Object.values(restored.layers)).toEqual([false, false, false, false, false, false, false]);
  });
  it('uses existing defaults for an ordinary map visit', () => {
    const restored = restoreMapState(validateMapSearch({}), maraton);
    expect(restored.layers).toEqual(defaultLayers);
    expect(restored.palette).toBe('termica');
    expect(restored.camera).toEqual({ lng: maraton.center[0], lat: maraton.center[1], zoom: maraton.zoom, bearing: 0, pitch: 0 });
  });
  it('rejects invalid coordinates and constrains event time', () => {
    const restored = restoreMapState(validateMapSearch({ camera: '999,90,NaN,0,0', time: 99999, palette: 'unknown' }), maraton);
    expect(restored.camera.lng).toBe(maraton.center[0]);
    const [h, m] = maraton.schedule.end.split(':').map(Number);
    expect(restored.time).toBe((h ?? 0) * 60 + (m ?? 0));
    expect(restored.palette).toBe('termica');
  });
});

describe('default and cached map view', () => {
  it('opens a fresh browser at 08:43 on the agreed camera without traffic', () => {
    const r = restoreMapState(validateMapSearch({}), maraton);
    expect(r.time).toBe(523);
    expect(r.camera.zoom).toBeCloseTo(14.3534, 3);
    expect(r.camera.lng).toBeCloseTo(-0.37264, 4);
    expect(r.layers.traffic).toBe(false);
    expect(DEFAULT_SPEED).toBe(100);
  });
  it('restores cached minute, layers, palette and speed', () => {
    const layers = { heat: false, runners: true, rings: true, flow: false, route: true, traffic: true, closures: true };
    const r = restoreFromCache({ time: 600, layers, palette: 'azul', speed: 200 }, maraton);
    expect(r.time).toBe(600);
    expect(r.layers).toEqual(layers);
    expect(r.palette).toBe('azul');
    expect(r.speed).toBe(200);
  });
});
