import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm } from "@/auth/LoginForm";
import { safeReturnPath } from "@/auth/policy";
import { DemoHeader } from "@/components/nodes/DemoHeader";
import { authText } from "@/i18n/auth";
import { useAppLocale } from "@/i18n/locale-context";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: safeReturnPath(search["redirect"]),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) throw redirect({ href: search.redirect, replace: true });
  },
  head: ({ match }) => ({
    meta: [
      { title: `${authText(match.context.locale, "title")} — NODES` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const locale = useAppLocale();
  const { redirect: destination } = Route.useSearch();
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <DemoHeader />
      <main className="mx-auto w-full max-w-md px-5 py-10">
        <LoginForm destination={destination} locale={locale} />
      </main>
    </div>
  );
}
