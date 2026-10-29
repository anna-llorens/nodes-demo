import { Routes, localizedDemoMapPath } from "@/lib/routes";

export interface AuthState {
  isAuthenticated: boolean;
}

const normalizePath = (path: string) => path.replace(/\/+$/, "") || Routes.root;

/** Only these concrete page URLs are public. Login is accessible without a session. */
export function isPublicPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return [
    Routes.root,
    Routes.home,
    Routes.login,
    localizedDemoMapPath("es"),
    localizedDemoMapPath("en"),
  ].some((item) => item === path);
}

/** Accept known internal page destinations, retaining their query and fragment. */
export function safeReturnPath(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    [...value].some((char) => char.charCodeAt(0) <= 32)
  )
    return Routes.home;
  try {
    const url = new URL(value, "https://nodes.invalid");
    if (url.origin !== "https://nodes.invalid" || /%2f|%5c/i.test(url.pathname)) return Routes.home;
    const path = normalizePath(url.pathname);
    if (path === Routes.login) return Routes.home;
    const segments = path.split("/");
    const known = Object.values(Routes).some((route) => {
      const template = route.split("/");
      return (
        template.length === segments.length &&
        template.every((part, index) =>
          part === "$locale"
            ? segments[index] === "es" || segments[index] === "en"
            : part.startsWith("$")
              ? Boolean(segments[index])
              : part === segments[index],
        )
      );
    });
    return known ? `${path}${url.search}${url.hash}` : Routes.home;
  } catch {
    return Routes.home;
  }
}

/** Leave private pages on logout; map URLs retain only their shareable state. */
export function logoutDestination(
  pathname: string,
  searchStr: string,
  preferredLocale: "es" | "en" = "es",
): string {
  const path = normalizePath(pathname);
  const locale =
    path === localizedDemoMapPath("en")
      ? "en"
      : path === localizedDemoMapPath("es")
        ? "es"
        : preferredLocale;
  if (
    [Routes.map, Routes.demoMap, localizedDemoMapPath("es"), localizedDemoMapPath("en")].some(
      (item) => item === path,
    )
  ) {
    const source = new URLSearchParams(searchStr);
    const search = new URLSearchParams();
    for (const key of ["scenario", "layers", "camera", "palette", "time"]) {
      const value = source.get(key);
      if (value !== null) search.set(key, value);
    }
    return `${localizedDemoMapPath(locale)}${search.size ? `?${search}` : ""}`;
  }
  return path === Routes.root ? Routes.root : Routes.home;
}
