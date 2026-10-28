import type { Scenario, ScenarioNode } from "./types";
import { interp } from "./curves";
import { densityAt, nodeArea } from "./density";
import { estimateAreas } from "./estimation";
import { toMin, type EventTime } from "./time";

/** Values of one node at one minute. */
export interface NodeState {
  id: string;
  /** Measured: density × area of the node's circle. */
  people: number;
  /** Extrapolated estimate (not measured): density × area of the node's zone polygons. */
  estimated: number;
  runners: number;
  spectators: number;
  roadway?: number | undefined;
  sidewalk?: number | undefined;
  /** People/m², rounded to one decimal as displayed. */
  density: number;
  /** People per minute entering. */
  flowIn: number;
  /** People per minute leaving. */
  flowOut: number;
  /** Mean walking speed in m/s. */
  speed: number;
  /** Change over 10 minutes as a fraction, e.g. 0.12 = +12 %. */
  variation10: number;
}

/** Measured people = density × node area. */
const peopleAt = (node: ScenarioNode, min: number) => densityAt(node, min) * nodeArea(node);

/** State of a node at a minute, extrapolating over `estimateAreaM2` (defaults to the node's own circle). */
export function nodeState(node: ScenarioNode, min: number, estimateAreaM2 = nodeArea(node)): NodeState {
  const density = densityAt(node, min);
  const people = Math.round(peopleAt(node, min));
  const estimated = Math.max(people, Math.round(density * estimateAreaM2));
  const delta = people - peopleAt(node, min - 1);
  const base = people * node.turnover;
  const exit = node.exitShare ? Math.min(1, Math.max(0, interp(node.exitShare, min))) : 0.5;
  const prev10 = peopleAt(node, min - 10);
  const share = node.runnerShare ? Math.min(1, Math.max(0, interp(node.runnerShare, min))) : 0;
  const runners = Math.round(people * share);
  return {
    id: node.id,
    people,
    estimated,
    runners,
    spectators: people - runners,
    roadway: node.roadwayShare !== undefined ? Math.round(people * node.roadwayShare) : undefined,
    sidewalk: node.roadwayShare !== undefined ? people - Math.round(people * node.roadwayShare) : undefined,
    density: Math.round(density * 10) / 10,
    flowIn: Math.round(2 * base * (1 - exit) + Math.max(delta, 0)),
    flowOut: Math.round(2 * base * exit + Math.max(-delta, 0)),
    speed: Math.round(Math.max(0.1, 1.4 * (1 - density / 7.5)) * 10) / 10,
    variation10: prev10 > 0 ? (people - prev10) / prev10 : 0,
  };
}

/** States of every node of a scenario at a minute. */
export function simulate(s: Scenario, min: number): NodeState[] {
  const areas = estimateAreas(s);
  return s.nodes.map((n) => nodeState(n, min, areas.get(n.id)));
}

/** State of one node using its scenario's extrapolation area. */
export function scenarioNodeState(s: Scenario, node: ScenarioNode, min: number) {
  return nodeState(node, min, estimateAreas(s).get(node.id));
}

/** A node's state at one whole minute of the schedule. */
export interface SeriesPoint extends NodeState {
  minute: EventTime;
}

/** A node's state at every whole minute of its scenario's schedule, start and end included. */
export function nodeSeries(s: Scenario, node: ScenarioNode): SeriesPoint[] {
  const points: SeriesPoint[] = [];
  for (let m = toMin(s.schedule.start); m <= toMin(s.schedule.end); m++) points.push({ minute: m, ...scenarioNodeState(s, node, m) });
  return points;
}
