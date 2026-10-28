/**
 * @nodes/core — pure TypeScript domain logic for NODES: scenarios, the seeded simulator,
 * measured and estimated counts, alerts and reports. No React, DOM or user-facing text.
 */
export type { AlertLevel, Curve, DensityLevel, LngLat, NodeKind, RoadClosure, Scenario, ScenarioNode, ScenarioZone, SuggestionCode, TrafficSegment } from "./types";
export { fmtClock, toMin, type EventTime } from "./time";
export { ALERT_THRESHOLDS, MAX_DENSITY, MAX_NODE_AREA_M2, NODE_RADIUS_M, densityAt, densityLevel, nodeArea, nodeAreaM2 } from "./density";
export { estimateAreas, zoneAssignments } from "./estimation";
export { nodeSeries, nodeState, scenarioNodeState, simulate, type NodeState, type SeriesPoint } from "./counts";
export { scenarioAlerts, visibleAlerts, type DensityAlert } from "./alerts";
export { simulateRunnerHeat, type RunnerHeatSample } from "./runner-heat";
export { trafficAt, trafficTimesAt, type CrossingWait, type TrafficLevel, type TrafficTimes } from "./traffic";
export { aggregateReport, buildReport, type Report, type ReportSample, type ReportSeries, type ReportZone } from "./reports";
export { circlePolygon, move, offset, pointAt, rect, routeBearing, routeDistances, scenarioBounds } from "./geometry";
export { findNode, getScenario, maraton, mascleta, scenarios } from "./scenarios";
