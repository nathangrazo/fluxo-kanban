import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useBoard } from "../store/board";
import type { Status, Task } from "../types";
import { SortableTask } from "./SortableTask";

type Props = {
  id: Status;
  title: string;
  accent: string;
  tasks: Task[];
  total: number;
  today: string;
};

export function Column({ id, title, accent, tasks, total, today }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { status: id } });
  const addTask = useBoard((s) => s.addTask);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function submit() {
    if (draft.trim()) addTask({ title: draft.trim(), status: id });
    setDraft("");
    setAdding(false);
  }

  return (
    <section className="flex w-72 shrink-0 flex-col" aria-label={title}>
      <header className="mb-3 flex items-center gap-2 px-1">
        <span className="size-2 rounded-full" style={{ background: accent }} />
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="rounded-md bg-surface-2 px-1.5 font-mono text-xs text-fg-muted">
          {tasks.length === total ? total : `${tasks.length}/${total}`}
        </span>
        <button
          type="button"
          onClick={() => setAdding(true)}
          aria-label={`Adicionar tarefa em ${title}`}
          className="ml-auto rounded-md p-1 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <Plus className="size-4" />
        </button>
      </header>

      <div
        ref={setNodeRef}
        className={`flex min-h-40 flex-1 flex-col gap-2.5 rounded-2xl p-2 transition-colors duration-200 ${
          isOver ? "bg-brand/[0.07] ring-1 ring-brand/30" : "bg-surface-2/60"
        }`}
      >
        <AnimatePresence>
          {adding && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="overflow-hidden"
            >
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={submit}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                  if (e.key === "Escape") {
                    setDraft("");
                    setAdding(false);
                  }
                }}
                rows={2}
                placeholder="Título da tarefa… (Enter pra salvar)"
                className="w-full resize-none rounded-xl border border-brand bg-surface p-3 text-sm focus:outline-none"
              />
            </motion.form>
          )}
        </AnimatePresence>

        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} today={today} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !adding && (
          <p className="grid flex-1 place-items-center rounded-xl border border-dashed border-line py-8 text-xs text-fg-muted">
            {total === 0 ? "Arraste tarefas pra cá" : "Nada com esses filtros"}
          </p>
        )}
      </div>
    </section>
  );
}
