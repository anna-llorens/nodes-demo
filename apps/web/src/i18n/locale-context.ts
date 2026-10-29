import { createContext, useContext } from "react";
import type { MapLocale } from "./map";

export const AppLocaleContext = createContext<MapLocale>("es");
export const useAppLocale = () => useContext(AppLocaleContext);
