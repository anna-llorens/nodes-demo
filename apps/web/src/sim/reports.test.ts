import { describe, expect, it } from "vitest";
import { getScenario } from "@/scenarios";
import { toMin } from "./engine";
import { buildReport, reportCsv } from "./reports";

const maraton = getScenario("maraton");

describe("report CSV", () => {
  it("writes measured and estimated totals with the Spanish header", () => {
    const report = buildReport(maraton, toMin("11:00"), toMin("11:00"));
    expect(reportCsv(report)).toContain(`11:00;${report.series[0]?.people};${report.series[0]?.estimated};`);
  });
  it("keeps runners and public in separate columns", () => {
    const report = buildReport(maraton, 615, 615);
    const row = report.series[0];
    expect(reportCsv(report)).toContain(`10:15;${row?.people};${row?.estimated};${row?.runners};${row?.spectators}`);
    expect(reportCsv(report).split("\n")[0]).toBe("Hora;Personas medidas;Personas estimadas (estimación extrapolada · no medida);Corredores;Público");
  });
  it("names zones for the screens", () => {
    const report = buildReport(maraton, toMin("10:15"), toMin("10:25"), "meta");
    expect(report.zones.map((zone) => zone.name)).toEqual(["Meta · reencuentro"]);
  });
});
