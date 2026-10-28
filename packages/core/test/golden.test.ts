import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { estimateAreas, scenarioAlerts, scenarios, simulate, simulateRunnerHeat, toMin, trafficAt, trafficTimesAt, densityLevel, zoneAssignments } from "../src";

// Numbers are rounded to 10 significant digits before hashing: Math.sin/Math.pow can differ in the
// last bit between CPUs (Apple arm64 locally, x64 Linux in CI), which is not a behaviour change.
const stable = (_key: string, value: unknown) => (typeof value === "number" ? Number(value.toPrecision(10)) : value);
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value, stable)).digest("hex");

/** Recomputes every scenario in the baseline's schema. */
function compute() {
  const out: Record<string, unknown> = {};
  for (const s of scenarios) {
    const minutes = [];
    for (let m = toMin(s.schedule.start); m <= toMin(s.schedule.end); m++) {
      const nodes = simulate(s, m).map(({ id, ...state }) => ({ id, level: densityLevel(state.density), ...state }));
      minutes.push({
        minute: m,
        nodes,
        trafficHash: hash({ traffic: trafficAt(s, m), times: trafficTimesAt(s, m) }),
        runnerHeatHash: hash(simulateRunnerHeat(s, m)),
      });
    }
    out[s.id] = {
      zoneAssignments: Object.fromEntries(zoneAssignments(s)),
      estimateAreas: Object.fromEntries(estimateAreas(s)),
      alerts: scenarioAlerts(s).map(({ id: _id, ...alert }) => alert),
      minutes,
    };
  }
  return JSON.parse(JSON.stringify({ version: 1, scenarios: out })) as unknown;
}

describe("golden baseline", () => {
  it("matches the pre-refactor simulator output exactly", () => {
    const baseline = JSON.parse(readFileSync(resolve(__dirname, "golden/baseline.json"), "utf8")) as unknown;
    expect(compute()).toEqual(baseline);
  });
});
