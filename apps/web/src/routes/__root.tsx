import { Routes } from "@/lib/routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DataSourceProvider } from "@/data/DataSourceProvider";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  redirect,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { initAnalytics, initClickTracking, trackPageView } from "../lib/analytics";
import { useRouterState } from "@tanstack/react-router";
import { getSession } from "@/auth/functions";
import { AuthContext } from "@/auth/context";
import { isPublicPath } from "@/auth/policy";
import { AppLocaleContext } from "@/i18n/locale-context";
import { requestedLocale, validateLanguageSearch } from "@/i18n/locale";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to={Routes.root}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href={Routes.root}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  validateSearch: validateLanguageSearch,
  beforeLoad: async ({ location, matches, search }) => {
    const { locale, ...auth } = await getSession({ data: { locale: requestedLocale(location.pathname, search.lang) } });
    const matchedPage = matches.some((match) => match.routeId !== "__root__");
    if (matchedPage && !auth.isAuthenticated && !isPublicPath(location.pathname)) {
      throw redirect({ to: Routes.login, search: { redirect: location.href }, replace: true });
    }
    return { auth, locale };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NODES" },
      { name: "description", content: "NODES · simulación de densidad en exteriores" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const locale = useRouterState({ select: (state) => state.matches[0]?.context.locale ?? "es" });
  return (
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient, auth, locale } = Route.useRouteContext();
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    initAnalytics();
    return initClickTracking();
  }, []);
  useEffect(() => {
    if (!path.startsWith(Routes.admin)) trackPageView(path);
  }, [path]);
  useEffect(() => {
    const onFocus = () => { void router.invalidate(); };
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) window.location.reload(); };
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <AppLocaleContext.Provider value={locale}>
          <DataSourceProvider>
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </DataSourceProvider>
        </AppLocaleContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
