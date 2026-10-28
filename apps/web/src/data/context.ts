import { createContext } from "react";
import type { DataSource } from "@nodes/data-source";
import { dataSource } from "./source";

/** The data source the screens read from; `DataSourceProvider` can replace it (e.g. in tests). */
export const DataSourceContext = createContext<DataSource>(dataSource);
