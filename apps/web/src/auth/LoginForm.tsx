import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authText, type AuthTextKey } from "@/i18n/auth";
import { login } from "./functions";

/** Shared admin form, now used by the application's dedicated login page. */
export function LoginForm({
  destination,
  locale = "es",
}: {
  destination: string;
  locale?: "es" | "en";
}) {
  const signIn = useServerFn(login);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AuthTextKey | null>(null);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const values = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const result = await signIn({
        data: {
          user: String(values.get("user") ?? ""),
          password: String(values.get("password") ?? ""),
        },
      });
      if (result.ok) {
        // A fresh document replaces anonymous route context and loader caches together.
        window.location.replace(destination);
        return;
      }
      setError("invalidCredentials");
    } catch {
      setError("loginError");
    }
    setPending(false);
  }
  return (
    <form
      onSubmit={onSubmit}
      aria-busy={pending}
      className="flex flex-col gap-3 rounded-2xl bg-card p-6 shadow-card"
    >
      <h1 className="font-display text-xl font-bold text-brand-ink">{authText(locale, "title")}</h1>
      <label htmlFor="login-user" className="text-sm font-semibold">
        {authText(locale, "user")}
      </label>
      <Input id="login-user" name="user" autoComplete="username" required disabled={pending} />
      <label htmlFor="login-password" className="text-sm font-semibold">
        {authText(locale, "password")}
      </label>
      <Input
        id="login-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        disabled={pending}
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {authText(locale, error)}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {authText(locale, pending ? "loggingIn" : "login")}
      </Button>
    </form>
  );
}
