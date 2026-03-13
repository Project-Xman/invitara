import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } } });
  return createTanStackRouter({ routeTree, scrollRestoration: true, defaultPreload: "intent", context: { queryClient } });
}

declare module "@tanstack/react-router" { interface Register { router: ReturnType<typeof createRouter> } }
