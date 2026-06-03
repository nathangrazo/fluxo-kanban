import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { forwardRef } from "react";
import { hasActiveFilters } from "../lib/selectors";
import { useUI } from "../store/ui";
import { PRIORITIES, TAGS, type Priority } from "../types";

export const FilterBar = forwardRef<HTMLInputElement>(function FilterBar(_, searchRef) {
  const filters = useUI((s) => s.filters);
  const setFilter = useUI((s) => s.setFilter);
  const clearFilters = useUI((s) => s.clearFilters);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      active ? "border-brand bg-brand text-white" : "border-line text-fg-muted hover:border-fg-muted hover:text-fg"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="relative">
        <span className="sr-only">Buscar tarefas</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted" />
        <input
          ref={searchRef}
          value={filters.query}
          onChange={(e) => setFilter("query", e.target.value)}
          placeholder="Buscar…"
          className="w-56 rounded-lg border border-line bg-surface py-1.5 pr-10 pl-9 text-sm placeholder:text-fg-muted focus:border-brand focus:outline-none"
        />
        <kbd className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-line px-1.5 font-mono text-[0.65rem] text-fg-muted">
          /
        </kbd>
      </label>

      <span className="mx-1 h-5 w-px bg-line" />

      {(Object.keys(PRIORITIES) as Priority[]).map((p) => (
        <button
          key={p}
          type="button"
          aria-pressed={filters.priority === p}
          onClick={() => setFilter("priority", filters.priority === p ? null : p)}
          className={chip(filters.priority === p)}
        >
          {PRIORITIES[p].label}
        </button>
      ))}

      <span className="mx-1 h-5 w-px bg-line" />

      {Object.entries(TAGS).map(([id, tag]) => (
        <button
          key={id}
          type="button"
          aria-pressed={filters.tag === id}
          onClick={() => setFilter("tag", filters.tag === id ? null : id)}
          className={chip(filters.tag === id)}
        >
          {tag.label}
        </button>
      ))}

      <AnimatePresence>
        {hasActiveFilters(filters) && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-fg-muted hover:text-fg"
          >
            <X className="size-3.5" /> Limpar
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});
