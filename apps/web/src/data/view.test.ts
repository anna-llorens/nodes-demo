import { describe, expect, it } from "vitest";
import { toMin } from "@nodes/core";
import { getScenario } from "@/scenarios";
import { dataSource } from "./source";
import { buildReportView, labelAlert, reportCsv } from "./view";

const maraton = getScenario("maraton");
const series = maraton.nodes.map((node) => dataSource.peekNodeSeries("maraton", node.id));
const report = (start: number, end: number) => buildReportView(maraton, series, start, end);

describe("report CSV", () => {
  it("writes measured and estimated totals with the Spanish header", () => {
    const r = report(toMin("11:00"), toMin("11:00"));
    expect(reportCsv(r)).toContain(`11:00;${r.series[0]?.people};${r.series[0]?.estimated};`);
  });
  it("keeps runners and public in separate columns", () => {
    const r = report(615, 615);
    const row = r.series[0];
    expect(reportCsv(r)).toContain(`10:15;${row?.people};${row?.estimated};${row?.runners};${row?.spectators}`);
    expect(reportCsv(r).split("\n")[0]).toBe("Hora;Personas medidas;Personas estimadas (estimación extrapolada · no medida);Corredores;Público");
  });
  it("names zones for the screens", () => {
    const meta = buildReportView(maraton, [dataSource.peekNodeSeries("maraton", "meta")], toMin("10:15"), toMin("10:25"));
    expect(meta.zones.map((zone) => zone.name)).toEqual(["Meta · reencuentro"]);
  });
});

describe("alert labels", () => {
  it("turns codes into the Spanish text shown on screen", () => {
    const [latest] = dataSource.peekAlerts("maraton", toMin("10:15"));
    expect(labelAlert(maraton, latest!)).toMatchObject({ time: "10:15", node: "Meta · reencuentro", level: "very_high", suggestion: "abrir salida lateral" });
  });
});
