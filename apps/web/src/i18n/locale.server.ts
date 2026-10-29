import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import type { AppLocale } from "./locale";

/** Remember the language on the app host independently of the authentication session. */
export function resolveAppLocale(preferred: AppLocale | undefined): AppLocale {
  const saved = getCookie("nodes_lang");
  const locale = preferred ?? (saved === "en" ? "en" : "es");
  if (preferred && saved !== preferred) {
    const secure = new URL(getRequest().url).protocol === "https:";
    setCookie("nodes_lang", locale, {
      path: "/",
      maxAge: 31536000,
      secure,
      sameSite: secure ? "none" : "lax",
      partitioned: secure,
    });
  }
  return locale;
}
