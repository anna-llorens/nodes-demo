import { useContext } from "react";
import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import { canPeek, type DataSource, type NodeSeries, type SyncReads } from "@nodes/data-source";
import type { DensityAlert, EventTime } from "@nodes/core";
import { DataSourceContext } from "./context";

export const useDataSource = () => useContext(DataSourceContext);

/**
 * Query options for one read. Sources with synchronous reads seed the query with them, so
 * the first render and every playback tick have data without a loading state; other sources
 * suspend until the promise resolves.
 */
function readOptions<T>(source: DataSource, key: unknown[], read: (s: DataSource) => Promise<T>, peek: (s: DataSource & SyncReads) => T) {
  return {
    queryKey: ["data-source", ...key],
    queryFn: () => read(source),
    staleTime: Infinity,
    ...(canPeek(source) ? { initialData: () => peek(source) } : {}),
  };
}

/** Every node of a scenario at an event time. */
export function useSnapshot(id: string, at: EventTime) {
  const source = useDataSource();
  return useSuspenseQuery(readOptions(source, ["snapshot", id, at], (s) => s.getSnapshot(id, at), (s) => s.peekSnapshot(id, at))).data;
}

/** One node's values for the whole schedule. */
export function useNodeSeries(id: string, nodeId: string) {
  const source = useDataSource();
  return useSuspenseQuery(readOptions(source, ["series", id, nodeId], (s) => s.getNodeSeries(id, nodeId), (s) => s.peekNodeSeries(id, nodeId))).data;
}

/** Several nodes' series, in the given order. */
export function useNodeSeriesList(id: string, nodeIds: string[]): NodeSeries[] {
  const source = useDataSource();
  return useSuspenseQueries({
    queries: nodeIds.map((nodeId) => readOptions(source, ["series", id, nodeId], (s) => s.getNodeSeries(id, nodeId), (s) => s.peekNodeSeries(id, nodeId))),
  }).map((result) => result.data);
}

/** Alerts raised up to `until`, most recent first. */
export function useAlerts(id: string, until: EventTime): DensityAlert[] {
  const source = useDataSource();
  return useSuspenseQuery(readOptions(source, ["alerts", id, until], (s) => s.getAlerts(id, until), (s) => s.peekAlerts(id, until))).data;
}
