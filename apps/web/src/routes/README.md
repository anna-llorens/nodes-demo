# Routes

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
defines a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.

## Adding a page

1. Add a route file here with an English name, for example `help.tsx` for `/help`.
2. Export `Route = createFileRoute("/help")({ component: HelpPage })` and import or define the
   page component. Put optional page metadata in the route's `head` function.
3. Run `pnpm dev` from the repository root. The TanStack Start plugin included by
   `@lovable.dev/vite-tanstack-config` generates the route tree at startup and watches route-file
   changes. `pnpm build` also generates it. Typechecking alone does not regenerate routes.
4. Add a navigation link where the page should be reachable; route generation does not add
   menu entries automatically. UI labels must follow the project's language rules.

The public website in `apps/site` uses Astro instead: its pages live in `src/pages`, and
localized page links are defined in `src/lib/routes.ts`.

## Named navigation destinations

`src/lib/routes.ts` exports `Routes`, the central catalog for web-app page names. Use
`Routes.home`, `Routes.map`, `Routes.node`, etc. in links, redirects and pathname comparisons:

```tsx
import { Routes } from "@/lib/routes";

<Link to={Routes.node} params={{ id: nodeId }}>…</Link>
```

Keep string literals in `createFileRoute("/path")`: the installed generator requires a literal
route ID and rejects expressions such as `createFileRoute(Routes.home)`. File names remain the
source of truth for route generation. After generating a new route, add its named destination
to `Routes`. TypeScript checks every destination against TanStack's route keys, and the routing
test checks that the catalog covers every registered page. `AppRoutePath` exports the union of
the catalog's path values; `localizedDemoMapPath(locale)` builds concrete localized map URLs.
