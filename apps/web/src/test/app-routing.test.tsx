import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { Routes } from "@/lib/routes";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("keeps the named destinations in sync with all registered page routes", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const registered = Object.keys(router.routesById).filter((id) => id !== rootRouteId);

    expect(Object.values(Routes).sort()).toEqual(registered.sort());
  });
  it.each(["/home", "/map", "/reports", "/about", "/node/meta"])("matches English page URL %s", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes(path);
    expect(matches.at(-1)?.routeId).toBe(path === "/node/meta" ? "/node/$id" : path);
  });
  it("does not match the removed /zones alias", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    expect(router.matchRoutes("/zones").at(-1)?.routeId).toBe(rootRouteId);
  });
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
