import { useSyncExternalStore } from "react";

export type Route = "board" | "overview";

const routes: Record<string, Route> = {
  "#/": "board",
  "#/visao-geral": "overview",
};

export const routeHref: Record<Route, string> = {
  board: "#/",
  overview: "#/visao-geral",
};

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

/** Roteamento mínimo por hash: só tem duas telas, não precisava de lib. */
export function useHashRoute(): Route {
  return useSyncExternalStore(
    subscribe,
    () => routes[window.location.hash] ?? "board",
    () => "board",
  );
}

export function navigate(route: Route) {
  window.location.hash = routeHref[route];
}
