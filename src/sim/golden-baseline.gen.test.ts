/**
 * TEMPORARY (Phase 0 · Step 0): writes the golden baseline used to prove the monorepo
 * refactor does not change simulator output. Run with GOLDEN_WRITE=1. Deleted in Step 3.
 *
 * Output uses the post-refactor schema: density levels and alert suggestions are stored as
 * codes, and user-facing text (names, formatted times) is left out.
 */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { it } from "vitest";
import { scenarios } from "@/scenarios";
import { densityLevel } from "@/scenarios/types";
import { estimateAreas, scenarioAlerts, simulate, simulateRunnerHeat, toMin, trafficAt, trafficTimesAt, zoneAssignments } from "./engine";

const LEVEL = { baja: "low", media: "medium", alta: "high", "muy-alta": "very_high" } as const;
const SUGGESTION: Record<string, string> = {
  "desviar flujo hacia Gran Vía": "divert_to_gran_via",
  "abrir salida lateral": "open_side_exit",
};
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

it.skipIf(!process.env["GOLDEN_WRITE"])("writes the golden baseline", () => {
  const out: Record<string, unknown> = {};
  for (const s of scenarios) {
    const minutes = [];
    for (let m = toMin(s.schedule.start); m <= toMin(s.schedule.end); m++) {
      const nodes = simulate(s, m).map(({ id, ...state }) => ({ id, level: LEVEL[densityLevel(state.density)], ...state }));
      const times = trafficTimesAt(s, m);
      minutes.push({
        minute: m,
        nodes,
        trafficHash: hash({
          traffic: trafficAt(s, m),
          times: {
            waits: times.waits.map((w) => ({ id: w.id, wait: w.wait })),
            maxWait: times.maxWait,
            busiestId: times.waits.find((w) => w.name === times.busiest)?.id ?? null,
            avgSpeed: times.avgSpeed,
            delay: times.delay,
          },
        }),
        runnerHeatHash: hash(simulateRunnerHeat(s, m)),
      });
    }
    out[s.id] = {
      zoneAssignments: Object.fromEntries(zoneAssignments(s)),
      estimateAreas: Object.fromEntries(estimateAreas(s)),
      alerts: scenarioAlerts(s).map((a) => ({
        minute: a.minute,
        nodeId: a.nodeId,
        level: LEVEL[a.level],
        density: a.density,
        variation10: a.variation10,
        ...(a.suggestion ? { suggestion: SUGGESTION[a.suggestion] ?? `UNMAPPED:${a.suggestion}` } : {}),
      })),
      minutes,
    };
  }
  writeFileSync(resolve(__dirname, "../../packages/core/test/golden/baseline.json"), JSON.stringify({ version: 1, scenarios: out }, null, 1) + "\n");
});
