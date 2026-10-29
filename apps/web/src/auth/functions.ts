import { createServerFn } from "@tanstack/react-start";
import { requestedLocale } from "@/i18n/locale";

export const getSession = createServerFn({ method: "GET" })
  .validator((value: unknown) => ({
    locale: requestedLocale(
      "/",
      value && typeof value === "object" ? (value as Record<string, unknown>)["locale"] : undefined,
    ),
  }))
  .handler(async ({ data }) => {
    const { readAuth } = await import("./session.server");
    const { resolveAppLocale } = await import("@/i18n/locale.server");
    return { ...(await readAuth()), locale: resolveAppLocale(data.locale) };
  });

export const login = createServerFn({ method: "POST" })
  .validator((value: unknown) => {
    const data = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
    return {
      user: typeof data["user"] === "string" ? data["user"].slice(0, 100) : "",
      password: typeof data["password"] === "string" ? data["password"].slice(0, 200) : "",
    };
  })
  .handler(async ({ data }) => {
    const { signIn } = await import("./session.server");
    return signIn(data.user, data.password);
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const { signOut } = await import("./session.server");
  await signOut();
  return { ok: true };
});
