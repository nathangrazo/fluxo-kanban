import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSeed } from "../data/seed";
import type { Status, Task } from "../types";

type NewTask = Partial<Omit<Task, "id" | "createdAt">> & { title: string };

export interface BoardState {
  tasks: Record<string, Task>;
  order: Record<Status, string[]>;
  addTask: (input: NewTask) => string;
  updateTask: (id: string, patch: Partial<Omit<Task, "id" | "status">>) => void;
  deleteTask: (id: string) => void;
  /** Devolve uma tarefa excluída pra posição em que estava */
  restoreTask: (task: Task, index: number) => void;
  moveTask: (id: string, to: Status, index?: number) => void;
  addChecklistItem: (taskId: string, text: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  removeChecklistItem: (taskId: string, itemId: string) => void;
  reset: () => void;
}

const uid = () => crypto.randomUUID().slice(0, 8);

export const useBoard = create<BoardState>()(
  persist(
    (set, get) => ({
      ...createSeed(),

      addTask: (input) => {
        const id = uid();
        const status = input.status ?? "todo";
        const task: Task = {
          id,
          description: "",
          priority: "medium",
          tags: [],
          due: null,
          assignee: null,
          checklist: [],
          ...input,
          status,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          tasks: { ...s.tasks, [id]: task },
          order: { ...s.order, [status]: [id, ...s.order[status]] },
        }));
        return id;
      },

      updateTask: (id, patch) =>
        set((s) => (s.tasks[id] ? { tasks: { ...s.tasks, [id]: { ...s.tasks[id], ...patch } } } : s)),

      deleteTask: (id) =>
        set((s) => {
          const task = s.tasks[id];
          if (!task) return s;
          const tasks = { ...s.tasks };
          delete tasks[id];
          return {
            tasks,
            order: { ...s.order, [task.status]: s.order[task.status].filter((t) => t !== id) },
          };
        }),

      restoreTask: (task, index) =>
        set((s) => {
          const column = s.order[task.status].filter((t) => t !== task.id);
          column.splice(Math.min(index, column.length), 0, task.id);
          return { tasks: { ...s.tasks, [task.id]: task }, order: { ...s.order, [task.status]: column } };
        }),

      moveTask: (id, to, index) => {
        const { tasks, order } = get();
        const task = tasks[id];
        if (!task) return;

        const from = task.status;
        const source = order[from].filter((t) => t !== id);
        const target = from === to ? source : [...order[to]];
        const at = index === undefined ? target.length : Math.max(0, Math.min(index, target.length));
        target.splice(at, 0, id);

        set({
          tasks: { ...tasks, [id]: { ...task, status: to } },
          order: { ...order, [from]: source, [to]: target },
        });
      },

      addChecklistItem: (taskId, text) => {
        const task = get().tasks[taskId];
        if (!task || !text.trim()) return;
        get().updateTask(taskId, { checklist: [...task.checklist, { id: uid(), text: text.trim(), done: false }] });
      },

      toggleChecklistItem: (taskId, itemId) => {
        const task = get().tasks[taskId];
        if (!task) return;
        get().updateTask(taskId, {
          checklist: task.checklist.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)),
        });
      },

      removeChecklistItem: (taskId, itemId) => {
        const task = get().tasks[taskId];
        if (!task) return;
        get().updateTask(taskId, { checklist: task.checklist.filter((item) => item.id !== itemId) });
      },

      reset: () => set(createSeed()),
    }),
    {
      name: "fluxo:board",
      version: 1,
      partialize: ({ tasks, order }) => ({ tasks, order }),
    },
  ),
);
