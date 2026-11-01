import { CROWD_THRESHOLDS, capacity, capacityUntil, crowdLevel, density, exitWidth, findCapacityZone, type CrowdLevel, type CrowdMode } from "@nodes/core/capacity";
import { CROWD_SCALE_MAX, MAX_FIGURES, type CapacityCalculatorText } from "./text";

/**
 * Browser side of CapacityCalculator.astro. Recalculates on every input with the pure functions
 * of @nodes/core/capacity and, on the calculator page, mirrors the values in the query string
 * (`?m2=&zona=` or `?personas=&m2=&modo=`) with history.replaceState. No requests, no storage.
 */

type Band = { id: CrowdLevel; from: number; to: number };
type Tab = "capacity" | "density";
/** URL values of the mode; the stable ids shared in links stay in Spanish like the zone ids. */
const MODE_PARAM: Record<CrowdMode, string> = { standing: "parado", moving: "movimiento" };
const modeFromParam = (value: string | null): CrowdMode => (value === MODE_PARAM.moving ? "moving" : "standing");

const SVG_NS = "http://www.w3.org/2000/svg";
/** Floor of the 5 × 5 m square in perspective: back edge narrower than the front one. */
const FLOOR = { backY: 40, frontY: 190, backHalf: 110, frontHalf: 180, centreX: 200 };
const project = (u: number, v: number) => {
  const half = FLOOR.backHalf + (FLOOR.frontHalf - FLOOR.backHalf) * v;
  return { x: FLOOR.centreX + (u - 0.5) * 2 * half, y: FLOOR.backY + (FLOOR.frontY - FLOOR.backY) * v };
};

/** Seeded generator so the figures keep their places while values change. */
const seeded = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function drawFloor(svg: SVGSVGElement) {
  const corners = [project(0, 0), project(1, 0), project(1, 1), project(0, 1)];
  const floor = document.createElementNS(SVG_NS, "polygon");
  floor.setAttribute("class", "floor");
  floor.setAttribute("points", corners.map((p) => `${p.x},${p.y}`).join(" "));
  const grid = document.createElementNS(SVG_NS, "path");
  grid.setAttribute("class", "grid");
  let d = "";
  for (let k = 1; k < 5; k++) {
    const a = project(k / 5, 0), b = project(k / 5, 1), c = project(0, k / 5), e = project(1, k / 5);
    d += `M${a.x} ${a.y}L${b.x} ${b.y}M${c.x} ${c.y}L${e.x} ${e.y}`;
  }
  grid.setAttribute("d", d);
  const people = document.createElementNS(SVG_NS, "g");
  svg.replaceChildren(floor, grid, people);
  return people;
}

/** Simple faceless figure: a head and a rounded body standing on (x, y), `h` units tall. */
function figure(x: number, y: number, h: number) {
  const g = document.createElementNS(SVG_NS, "g");
  g.setAttribute("class", "person");
  const w = h * 0.3;
  const head = document.createElementNS(SVG_NS, "circle");
  head.setAttribute("cx", String(x));
  head.setAttribute("cy", String(y - h + w * 0.55));
  head.setAttribute("r", String(w * 0.55));
  const body = document.createElementNS(SVG_NS, "path");
  const top = y - h + w * 1.25;
  body.setAttribute("d", `M${x - w / 2} ${y}V${top + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y}Z`);
  g.append(head, body);
  return g;
}

function drawPeople(svg: SVGSVGElement, value: number) {
  const layer = svg.querySelector("g") ?? drawFloor(svg);
  const n = Math.min(Math.round(value * 25), MAX_FIGURES);
  const random = seeded(7);
  const cols = Math.max(1, Math.ceil(Math.sqrt(n)));
  const cells = [...Array(cols * cols).keys()].sort(() => random() - 0.5).slice(0, n);
  const spots = cells.map((cell) => ({
    u: (cell % cols + 0.5 + (random() - 0.5) * 0.5) / cols,
    v: (Math.floor(cell / cols) + 0.5 + (random() - 0.5) * 0.5) / cols,
  }));
  spots.sort((a, b) => a.v - b.v);
  const size = Math.max(14, Math.min(34, 140 / cols));
  layer.replaceChildren(...spots.map(({ u, v }) => {
    const p = project(u, v);
    return figure(p.x, p.y, size * (0.75 + 0.25 * v));
  }));
  return n;
}

function initCalculator(root: HTMLElement) {
  const text = JSON.parse(root.dataset["text"]!) as CapacityCalculatorText;
  const bands = JSON.parse(root.dataset["levels"]!) as Record<CrowdMode, Band[]>;
  const syncUrl = root.hasAttribute("data-sync-url");
  const nf = (value: number, digits = 0) =>
    value.toLocaleString(text.numberLocale, { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: "always" });
  const panels = { capacity: root.querySelector<HTMLElement>('[data-panel="capacity"]')!, density: root.querySelector<HTMLElement>('[data-panel="density"]')! };
  const tabs = [...root.querySelectorAll<HTMLButtonElement>("[data-tab]")];
  const out = (panel: HTMLElement, name: string) => panel.querySelector<HTMLElement>(`[data-out="${name}"]`);
  const set = (panel: HTMLElement, name: string, value: string) => {
    const el = out(panel, name);
    if (el) el.textContent = value;
  };
  const field = (panel: HTMLElement, name: string) => panel.querySelector<HTMLInputElement & HTMLSelectElement>(`[name="${name}"]`)!;
  const positive = (input: HTMLInputElement) => {
    const value = Number.parseFloat(input.value);
    return Number.isFinite(value) && value > 0 ? value : null;
  };
  let active: Tab = "capacity";

  function paintLevel(el: HTMLElement | null, level: CrowdLevel, mode: CrowdMode) {
    if (!el) return;
    el.dataset["level"] = level;
    el.querySelector('[data-out="level-name"]')!.textContent = text.levels[level];
    el.querySelector('[data-out="level-text"]')!.textContent = (text.levelText[mode] as Record<string, string>)[level] ?? "";
  }

  function paintScale(scale: HTMLElement, mode: CrowdMode, value: number | null) {
    const bar = scale.querySelector(".bar")!;
    const list = scale.querySelector(".bands")!;
    if (scale.dataset["mode"] !== mode) {
      scale.dataset["mode"] = mode;
      const segments = bands[mode].map((band) => {
        const i = document.createElement("i");
        i.dataset["level"] = band.id;
        i.style.width = `${((band.to - band.from) / CROWD_SCALE_MAX) * 100}%`;
        return i;
      });
      const marker = document.createElement("span");
      marker.className = "marker";
      bar.replaceChildren(...segments, marker);
      list.replaceChildren(...bands[mode].map((band, index, all) => {
        const li = document.createElement("li");
        li.style.width = `${((band.to - band.from) / CROWD_SCALE_MAX) * 100}%`;
        const range = document.createElement("span");
        range.textContent = index === 0 ? `< ${nf(band.to)}` : index === all.length - 1 ? `≥ ${nf(band.from)}` : `${nf(band.from)}–${nf(band.to)}`;
        const name = document.createElement("span");
        name.textContent = text.levels[band.id];
        li.dataset["band"] = band.id;
        li.append(range, name);
        return li;
      }));
    }
    const marker = bar.querySelector<HTMLElement>(".marker")!;
    marker.hidden = value === null;
    if (value === null) return;
    marker.style.left = `${(Math.min(value, CROWD_SCALE_MAX) / CROWD_SCALE_MAX) * 100}%`;
    const level = crowdLevel(value, mode);
    for (const li of list.querySelectorAll<HTMLElement>("li")) li.setAttribute("aria-current", String(li.dataset["band"] === level));
  }

  function paintViz(panel: HTMLElement, value: number) {
    const svg = panel.querySelector<SVGSVGElement>("[data-viz]")!;
    const n = drawPeople(svg, value);
    const count = `${nf(n)} ${text.peopleLong}`;
    svg.setAttribute("aria-label", text.vizLabel.replace("{count}", nf(n)));
    const caption = out(panel, "viz-caption");
    if (caption) caption.textContent = text.vizCaption.replace("{count}", count) + (value * 25 > MAX_FIGURES ? ` ${text.vizCapped}` : "");
  }

  function calcCapacity() {
    const panel = panels.capacity;
    const m2 = positive(field(panel, "m2"));
    const zone = findCapacityZone(field(panel, "zona").value);
    const live = panel.querySelector<HTMLElement>(".live")!;
    live.dataset["empty"] = String(!m2 || !zone);
    if (!m2 || !zone) {
      set(panel, "capacity", "—");
      set(panel, "capacity-unit", text.empty);
      return;
    }
    const people = capacity(m2, zone.m2PerPerson);
    const value = 1 / zone.m2PerPerson;
    set(panel, "capacity", nf(people));
    set(panel, "capacity-unit", text.peopleLong);
    set(panel, "applied-density", nf(value, 2));
    set(panel, "zone-ratio", nf(zone.m2PerPerson, 2));
    set(panel, "exit-width", nf(exitWidth(people), 1));
    paintLevel(out(panel, "capacity-level"), crowdLevel(value, "standing"), "standing");
    const callout = out(panel, "callout");
    if (callout) callout.hidden = value < CROWD_THRESHOLDS.standing;
    paintScale(panel.querySelector(".scale")!, "standing", value);
    paintViz(panel, value);
  }

  function densityMode(): CrowdMode {
    return modeFromParam(panels.density.querySelector<HTMLInputElement>('[name="modo"]:checked')?.value ?? null);
  }

  function calcDensity() {
    const panel = panels.density;
    const people = Number.parseFloat(field(panel, "personas").value);
    const m2 = positive(field(panel, "m2"));
    const mode = densityMode();
    const scale = panel.querySelector<HTMLElement>(".scale")!;
    if (!(people >= 0) || !m2) {
      set(panel, "density", "—");
      set(panel, "density-unit", text.invalid);
      paintScale(scale, mode, null);
      return;
    }
    const value = density(people, m2);
    set(panel, "density", nf(value, 2));
    set(panel, "density-unit", text.perM2);
    paintLevel(out(panel, "density-level"), crowdLevel(value, mode), mode);
    set(panel, "density-ratio", value > 0 ? nf(1 / value, 2) : "—");
    set(panel, "until", nf(capacityUntil(m2, CROWD_THRESHOLDS[mode])));
    set(panel, "until-label", mode === "standing" ? text.untilStanding : text.untilMoving);
    paintScale(scale, mode, value);
    paintViz(panel, value);
  }

  /** Query string of the active tab's values; also used by the Research block's link. */
  function params() {
    const query = new URLSearchParams();
    if (active === "capacity") {
      query.set("m2", field(panels.capacity, "m2").value);
      query.set("zona", field(panels.capacity, "zona").value);
    } else {
      query.set("personas", field(panels.density, "personas").value);
      query.set("m2", field(panels.density, "m2").value);
      query.set("modo", MODE_PARAM[densityMode()]);
    }
    return query;
  }

  function changed() {
    for (const example of root.querySelectorAll<HTMLElement>("[data-example]")) example.hidden = true;
    const query = params();
    if (syncUrl) history.replaceState(history.state, "", `${location.pathname}?${query}${location.hash}`);
    root.dispatchEvent(new CustomEvent("capacity-change", { bubbles: true, detail: query.toString() }));
  }

  function select(tab: Tab, focus = false) {
    active = tab;
    for (const button of tabs) {
      const on = button.dataset["tab"] === tab;
      button.setAttribute("aria-selected", String(on));
      button.tabIndex = on ? 0 : -1;
      if (on && focus) button.focus();
    }
    panels.capacity.hidden = tab !== "capacity";
    panels.density.hidden = tab !== "density";
    if (tab === "density") calcDensity();
    else calcCapacity();
  }

  for (const button of tabs) {
    button.addEventListener("click", () => {
      select(button.dataset["tab"] as Tab);
      changed();
    });
    // Arrow keys move between tabs (WAI-ARIA tabs pattern).
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      select(active === "capacity" ? "density" : "capacity", true);
      changed();
    });
  }
  for (const form of root.querySelectorAll("form")) form.addEventListener("submit", (event) => event.preventDefault());
  panels.capacity.addEventListener("input", () => { calcCapacity(); changed(); });
  panels.density.addEventListener("input", () => { calcDensity(); changed(); });
  panels.density.addEventListener("change", () => { calcDensity(); changed(); });

  // Shared links: ?personas= opens the density tab; ?m2= alone or with ?zona= the capacity tab.
  if (syncUrl) {
    const query = new URLSearchParams(location.search);
    if (query.has("personas")) {
      field(panels.density, "personas").value = query.get("personas") ?? "";
      if (query.has("m2")) field(panels.density, "m2").value = query.get("m2") ?? "";
      const mode = modeFromParam(query.get("modo"));
      for (const radio of panels.density.querySelectorAll<HTMLInputElement>('[name="modo"]')) radio.checked = radio.value === MODE_PARAM[mode];
      for (const example of root.querySelectorAll<HTMLElement>("[data-example]")) example.hidden = true;
      calcCapacity();
      select("density");
      return;
    }
    if (query.has("m2") || query.has("zona")) {
      if (query.has("m2")) field(panels.capacity, "m2").value = query.get("m2") ?? "";
      const zone = query.get("zona");
      if (zone && findCapacityZone(zone)) field(panels.capacity, "zona").value = zone;
      for (const example of root.querySelectorAll<HTMLElement>("[data-example]")) example.hidden = true;
    }
  }
  calcDensity();
  select("capacity");
}

export function initCapacityCalculators() {
  for (const root of document.querySelectorAll<HTMLElement>("[data-capacity-calculator]")) initCalculator(root);
}
