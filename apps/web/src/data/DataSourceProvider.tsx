import type { ReactNode } from "react";
import type { DataSource } from "@nodes/data-source";
import { DataSourceContext } from "./context";
import { dataSource } from "./source";

/** Provides the data source to every screen. */
export function DataSourceProvider({ source = dataSource, children }: { source?: DataSource; children: ReactNode }) {
  return <DataSourceContext.Provider value={source}>{children}</DataSourceContext.Provider>;
}
