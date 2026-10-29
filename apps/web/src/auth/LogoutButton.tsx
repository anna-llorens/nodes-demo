import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { authText } from "@/i18n/auth";
import { logout } from "./functions";
import { logoutDestination } from "./policy";

export function LogoutButton({ locale = "es" }: { locale?: "es" | "en" }) {
  const signOut = useServerFn(logout);
  const queryClient = useQueryClient();
  const location = useRouterState({ select: (state) => state.location });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  async function onClick() {
    if (pending) return;
    setPending(true);
    setError(false);
    try {
      await signOut();
      queryClient.clear();
      window.location.replace(logoutDestination(location.pathname, location.searchStr, locale));
    } catch {
      setError(true);
      setPending(false);
    }
  }
  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" className="min-h-11" disabled={pending} onClick={onClick}>
        {authText(locale, pending ? "loggingOut" : "logout")}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {authText(locale, "logoutError")}
        </p>
      )}
    </div>
  );
}
