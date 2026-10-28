import { describe, expect, it } from "vitest";
import { toMin } from "@nodes/core";
import { getScenario } from "@/scenarios";
import { dataSource } from "@/data/source";
import { runnerHeatPoints } from "./geo";

const maraton = getScenario("maraton");
const points = (t: string) => runnerHeatPoints(maraton, dataSource.peekSnapshot("maraton", toMin(t)).runnerHeat ?? []);

describe("runner heat projection", () => {
  it("is deterministic and empty outside the race", () => {
    expect(points("09:30")).toEqual(points("09:30"));
    expect(points("09:30").features.length).toBeGreaterThan(0);
    expect(points("07:00").features).toHaveLength(0);
    expect(points("12:00").features).toHaveLength(0);
  });
});
