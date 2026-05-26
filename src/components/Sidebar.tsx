import { motion } from "motion/react";
import { Command, KanbanSquare, LayoutDashboard, Moon, RotateCcw, Sun } from "lucide-react";
import { routeHref, type Route } from "../hooks/useHashRoute";
import { useBoard } from "../store/board";
import { useSettings, useUI } from "../store/ui";
import { PEOPLE } from "../types";
import { Avatar } from "./Avatar";

const NAV: { route: Route; label: string; icon: typeof KanbanSquare }[] = [
  { route: "board", label: "Quadro", icon: KanbanSquare },
  { route: "overview", label: "Visão geral", icon: LayoutDashboard },
];

export function Sidebar({ route }: { route: Route }) {
  const { theme, toggleTheme } = useSettings();
  const reset = useBoard((s) => s.reset);
  const assignee = useUI((s) => s.filters.assignee);
  const setFilter = useUI((s) => s.setFilter);
  const setPalette = useUI((s) => s.setPalette);

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-line bg-surface px-3 py-4">
      <div className="flex items-center gap-2 px-2">
        <img src="favicon.svg" alt="" className="size-7" />
        <span className="text-lg font-semibold tracking-tight">Fluxo</span>
      </div>

      <button
        type="button"
        onClick={() => setPalette(true)}
        className="mt-5 flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        Buscar ou executar
        <kbd className="flex items-center gap-0.5 font-mono text-xs">
          <Command className="size-3" />K
        </kbd>
      </button>

      <nav className="mt-6 space-y-0.5">
        {NAV.map(({ route: r, label, icon: Icon }) => (
          <a
            key={r}
            href={routeHref[r]}
            className="relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium"
          >
            {route === r && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-lg bg-surface-2"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <Icon className={`relative size-4 ${route === r ? "text-brand" : "text-fg-muted"}`} />
            <span className={`relative ${route === r ? "" : "text-fg-muted"}`}>{label}</span>
          </a>
        ))}
      </nav>

      <p className="mt-8 px-3 font-mono text-[0.68rem] tracking-wider text-fg-muted uppercase">Equipe</p>
      <ul className="mt-2 space-y-0.5">
        {Object.entries(PEOPLE).map(([id, person]) => (
          <li key={id}>
            <button
              type="button"
              aria-pressed={assignee === id}
              onClick={() => setFilter("assignee", assignee === id ? null : id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                assignee === id ? "bg-brand/10 text-brand" : "text-fg-muted hover:bg-surface-2 hover:text-fg"
              }`}
            >
              <Avatar id={id} size={20} />
              {person.name}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-0.5 border-t border-line pt-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          Tema {theme === "dark" ? "claro" : "escuro"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("Restaurar as tarefas de exemplo? Suas alterações serão perdidas.")) reset();
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <RotateCcw className="size-4" />
          Restaurar exemplo
        </button>
      </div>
    </aside>
  );
}
