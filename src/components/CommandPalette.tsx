import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, KanbanSquare, LayoutDashboard, Moon, Plus, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { navigate } from "../hooks/useHashRoute";
import { useBoard } from "../store/board";
import { useSettings, useUI } from "../store/ui";
import { COLUMNS } from "../types";

type Item = {
  id: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  run: () => void;
};

const statusTitle = Object.fromEntries(COLUMNS.map((c) => [c.id, c.title]));

export function CommandPalette() {
  const open = useUI((s) => s.paletteOpen);
  const setPalette = useUI((s) => s.setPalette);
  const select = useUI((s) => s.select);
  const clearFilters = useUI((s) => s.clearFilters);
  const toggleTheme = useSettings((s) => s.toggleTheme);
  const tasks = useBoard((s) => s.tasks);
  const addTask = useBoard((s) => s.addTask);

  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const close = () => {
    setPalette(false);
    setQuery("");
    setCursor(0);
  };

  const items = useMemo<Item[]>(() => {
    const actions: Item[] = [
      {
        id: "new",
        label: query.trim() ? `Criar tarefa "${query.trim()}"` : "Nova tarefa",
        hint: "N",
        icon: <Plus className="size-4" />,
        run: () => {
          navigate("board");
          select(addTask({ title: query.trim() || "Nova tarefa" }));
        },
      },
      { id: "board", label: "Ir para o quadro", icon: <KanbanSquare className="size-4" />, run: () => navigate("board") },
      { id: "overview", label: "Ir para visão geral", icon: <LayoutDashboard className="size-4" />, run: () => navigate("overview") },
      { id: "theme", label: "Alternar tema", icon: <Moon className="size-4" />, run: toggleTheme },
      { id: "clear", label: "Limpar filtros", icon: <XCircle className="size-4" />, run: clearFilters },
    ];

    const q = query.trim().toLowerCase();
    const matchedActions = q ? actions.filter((a) => a.id === "new" || a.label.toLowerCase().includes(q)) : actions;
    const matchedTasks: Item[] = Object.values(tasks)
      .filter((t) => q && t.title.toLowerCase().includes(q))
      .slice(0, 6)
      .map((t) => ({
        id: t.id,
        label: t.title,
        hint: statusTitle[t.status],
        icon: <ArrowRight className="size-4" />,
        run: () => {
          navigate("board");
          select(t.id);
        },
      }));

    return [...matchedTasks, ...matchedActions];
  }, [query, tasks, addTask, select, toggleTheme, clearFilters]);

  // Atalhos globais: Ctrl/Cmd+K abre a paleta, N cria tarefa
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(!useUI.getState().paletteOpen);
      } else if (!typing && e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        navigate("board");
        select(addTask({ title: "Nova tarefa" }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPalette, select, addTask]);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[cursor]?.run();
      close();
    } else if (e.key === "Escape") {
      close();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={close}
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pt-[15vh] backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Paleta de comandos"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-4 text-fg-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Buscar tarefa ou digitar um comando…"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={items[cursor] ? `opt-${items[cursor].id}` : undefined}
                className="flex-1 bg-transparent py-4 text-sm placeholder:text-fg-muted focus:outline-none"
              />
              <kbd className="rounded border border-line px-1.5 font-mono text-[0.65rem] text-fg-muted">esc</kbd>
            </div>

            <ul id="palette-list" role="listbox" ref={listRef} className="max-h-80 overflow-y-auto p-2">
              {items.map((item, i) => (
                <li
                  key={item.id}
                  id={`opt-${item.id}`}
                  role="option"
                  aria-selected={i === cursor}
                  data-active={i === cursor}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => {
                    item.run();
                    close();
                  }}
                  className="relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
                >
                  {i === cursor && (
                    <motion.span
                      layoutId="palette-cursor"
                      className="absolute inset-0 rounded-lg bg-surface-2"
                      transition={{ type: "spring", stiffness: 600, damping: 40 }}
                    />
                  )}
                  <span className="relative text-fg-muted">{item.icon}</span>
                  <span className="relative flex-1 truncate">{item.label}</span>
                  {item.hint && <span className="relative font-mono text-xs text-fg-muted">{item.hint}</span>}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
