import { useRef } from "react";
import { FilterBar } from "./components/FilterBar";
import { Sidebar } from "./components/Sidebar";
import { useHashRoute } from "./hooks/useHashRoute";
import { useThemeClass } from "./hooks/useTheme";
import { BoardView } from "./views/BoardView";

export default function App() {
  const route = useHashRoute();
  const searchRef = useRef<HTMLInputElement>(null);
  useThemeClass();

  return (
    <div className="flex h-svh overflow-hidden">
      <Sidebar route={route} />
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-4 px-6 pt-6 pb-5">
          <div>
            <p className="font-mono text-xs text-fg-muted">App de delivery · Sprint 14</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{route === "board" ? "Quadro" : "Visão geral"}</h1>
          </div>
          {route === "board" && <FilterBar ref={searchRef} />}
        </header>
        {route === "board" && <BoardView />}
      </main>
    </div>
  );
}
