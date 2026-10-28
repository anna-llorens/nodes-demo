import { SimulatedSource } from "@nodes/data-source";

/** The app's data source. Simulated until a live source exists. */
export const dataSource = new SimulatedSource();
