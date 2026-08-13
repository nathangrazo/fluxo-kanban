import { AnimatePresence, motion } from "motion/react";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CommandPalette } from "./components/CommandPalette";
import { Confetti } from "./components/Confetti";
import { UndoToast } from "./components/UndoToast";
import { FilterBar } from "./components/FilterBar";
import { Sidebar } from "./components/Sidebar";
import { useHashRoute } from "./hooks/useHashRoute";
import { useThemeClass } from "./hooks/useTheme";
import { TaskDrawer } from "./components/TaskDrawer";
import { BoardView } from "./views/BoardView";
import { OverviewView } from "./views/OverviewView";

export default function App() {
  const route = useHashRoute();
  const searchRef = useRef<HTMLInputElement>(null);
  const [navOpen, setNavOpen] = useState(false);
  useThemeClass();

  // Fecha o menu mobile ao trocar de tela
  useEffect(() => {
    const close = () => setNavOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  // "/" foca a busca
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-svh overflow-hidden">
      <div className="hidden md:flex">
        <Sidebar route={route} />
      </div>

      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNavOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="fixed inset-y-0 left-0 z-50 flex md:hidden"
            >
              <Sidebar route={route} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-4 px-4 pt-5 pb-5 md:px-6 md:pt-6">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="Abrir menu"
              className="mt-1 rounded-md p-1 text-fg-muted hover:text-fg md:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div>
            <p className="font-mono text-xs text-fg-muted">App de delivery · Sprint 14</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{route === "board" ? "Quadro" : "Visão geral"}</h1>
            </div>
          </div>
          {route === "board" && <FilterBar ref={searchRef} />}
        </header>
        {route === "board" ? <BoardView /> : <OverviewView />}
      </main>
      <TaskDrawer />
      <CommandPalette />
      <UndoToast />
      <Confetti />
    </div>
  );
}
