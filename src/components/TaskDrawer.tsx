import { AnimatePresence, motion } from "motion/react";
import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { checklistProgress } from "../lib/selectors";
import { useBoard } from "../store/board";
import { useUI } from "../store/ui";
import { COLUMNS, PEOPLE, PRIORITIES, TAGS, type Priority, type Status } from "../types";

const field = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none";

export function TaskDrawer() {
  const selectedId = useUI((s) => s.selectedId);
  const select = useUI((s) => s.select);
  const task = useBoard((s) => (selectedId ? s.tasks[selectedId] : undefined));
  const { updateTask, moveTask, deleteTask, addChecklistItem, toggleChecklistItem, removeChecklistItem } = useBoard();
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && select(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, select]);

  const progress = task ? checklistProgress(task) : null;

  return (
    <AnimatePresence>
      {task && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => select(null)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          />

          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Detalhes da tarefa"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-surface shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-3">
              <span className="font-mono text-xs text-fg-muted">#{task.id}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Excluir "${task.title}"?`)) {
                      deleteTask(task.id);
                      select(null);
                    }
                  }}
                  aria-label="Excluir tarefa"
                  className="rounded-md p-1.5 text-fg-muted hover:bg-surface-2 hover:text-[#ef4f5f]"
                >
                  <Trash2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => select(null)}
                  aria-label="Fechar"
                  className="rounded-md p-1.5 text-fg-muted hover:bg-surface-2 hover:text-fg"
                >
                  <X className="size-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <textarea
                value={task.title}
                onChange={(e) => updateTask(task.id, { title: e.target.value })}
                rows={2}
                aria-label="Título"
                className="w-full resize-none bg-transparent text-xl font-semibold tracking-tight focus:outline-none"
              />

              <dl className="grid grid-cols-[7rem_1fr] items-center gap-x-3 gap-y-3 text-sm">
                <dt className="text-fg-muted">Status</dt>
                <dd>
                  <select
                    value={task.status}
                    onChange={(e) => moveTask(task.id, e.target.value as Status, 0)}
                    className={field}
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </dd>

                <dt className="text-fg-muted">Prioridade</dt>
                <dd>
                  <select
                    value={task.priority}
                    onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
                    className={field}
                  >
                    {Object.entries(PRIORITIES).map(([id, p]) => (
                      <option key={id} value={id}>{p.label}</option>
                    ))}
                  </select>
                </dd>

                <dt className="text-fg-muted">Responsável</dt>
                <dd>
                  <select
                    value={task.assignee ?? ""}
                    onChange={(e) => updateTask(task.id, { assignee: e.target.value || null })}
                    className={field}
                  >
                    <option value="">Ninguém</option>
                    {Object.entries(PEOPLE).map(([id, p]) => (
                      <option key={id} value={id}>{p.name}</option>
                    ))}
                  </select>
                </dd>

                <dt className="text-fg-muted">Prazo</dt>
                <dd>
                  <input
                    type="date"
                    value={task.due ?? ""}
                    onChange={(e) => updateTask(task.id, { due: e.target.value || null })}
                    className={field}
                  />
                </dd>
              </dl>

              <div>
                <p className="mb-2 text-sm text-fg-muted">Etiquetas</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(TAGS).map(([id, tag]) => {
                    const on = task.tags.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          updateTask(task.id, { tags: on ? task.tags.filter((t) => t !== id) : [...task.tags, id] })
                        }
                        className="rounded-md border px-2 py-1 text-xs font-medium transition-colors"
                        style={
                          on
                            ? { color: tag.color, borderColor: tag.color, background: `color-mix(in srgb, ${tag.color} 12%, transparent)` }
                            : { color: "var(--fg-muted)", borderColor: "var(--line)" }
                        }
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-fg-muted">Descrição</p>
                <textarea
                  value={task.description}
                  onChange={(e) => updateTask(task.id, { description: e.target.value })}
                  rows={4}
                  placeholder="Adicione detalhes…"
                  className={`${field} resize-y`}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <p className="text-fg-muted">Checklist</p>
                  {progress && progress.total > 0 && (
                    <span className="font-mono text-xs text-fg-muted">
                      {progress.done}/{progress.total}
                    </span>
                  )}
                </div>

                {progress && progress.total > 0 && (
                  <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <motion.div
                      className="h-full rounded-full bg-brand"
                      animate={{ width: `${progress.ratio * 100}%` }}
                      transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    />
                  </div>
                )}

                <ul className="space-y-1">
                  <AnimatePresence initial={false}>
                    {task.checklist.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="group flex items-center gap-2.5 rounded-md px-1 py-1 hover:bg-surface-2"
                      >
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => toggleChecklistItem(task.id, item.id)}
                          className="size-4 accent-[var(--color-brand)]"
                        />
                        <span className={`flex-1 text-sm ${item.done ? "text-fg-muted line-through" : ""}`}>{item.text}</span>
                        <button
                          type="button"
                          onClick={() => removeChecklistItem(task.id, item.id)}
                          aria-label={`Remover ${item.text}`}
                          className="text-fg-muted opacity-0 group-hover:opacity-100 hover:text-fg focus:opacity-100"
                        >
                          <X className="size-3.5" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addChecklistItem(task.id, newItem);
                    setNewItem("");
                  }}
                  className="mt-2 flex items-center gap-2"
                >
                  <Plus className="size-4 text-fg-muted" />
                  <input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Novo item"
                    className="flex-1 bg-transparent py-1 text-sm placeholder:text-fg-muted focus:outline-none"
                  />
                </form>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
