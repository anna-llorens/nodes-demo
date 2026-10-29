import type { FileRoutesByPath } from "@tanstack/react-router";

/** Named navigation destinations. File-route declarations keep generator-managed literals. */
export const Routes = {
  root: "/",
  home: "/home",
  login: "/login",
  map: "/map",
  alerts: "/alerts",
  reports: "/reports",
  about: "/about",
  admin: "/admin",
  node: "/node/$id",
  demoMap: "/demo/map",
  localizedDemoMap: "/$locale/demo/map",
} as const satisfies Record<string, keyof FileRoutesByPath>;

export type AppRoutePath = (typeof Routes)[keyof typeof Routes];

/** Concrete URL for the localized demo-map route. */
export const localizedDemoMapPath = (locale: "es" | "en") => `/${locale}${Routes.demoMap}` as const;
