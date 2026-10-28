import { describe, expect, it } from "vitest";
import { getScenario } from "@/scenarios";
import { toMin } from "@/sim/engine";
import { runnerHeatPoints } from "./geo";

const maraton = getScenario("maraton");

describe("runner heat projection", () => {
  it("is deterministic and empty outside the race", () => {
    expect(runnerHeatPoints(maraton, toMin("09:30"))).toEqual(runnerHeatPoints(maraton, toMin("09:30")));
    expect(runnerHeatPoints(maraton, toMin("09:30")).features.length).toBeGreaterThan(0);
    expect(runnerHeatPoints(maraton, toMin("07:00")).features).toHaveLength(0);
    expect(runnerHeatPoints(maraton, toMin("12:00")).features).toHaveLength(0);
  });
});
