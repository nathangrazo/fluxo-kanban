import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Priority, Task } from "../types";

export type Burst = { id: number; x: number; y: number };
export type Undo = { task: Task; index: number };

export interface Filters {
  query: string;
  priority: Priority | null;
  tag: string | null;
  assignee: string | null;
}

export const emptyFilters: Filters = { query: "", priority: null, tag: null, assignee: null };

interface UIState {
  filters: Filters;
  selectedId: string | null;
  paletteOpen: boolean;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  clearFilters: () => void;
  select: (id: string | null) => void;
  setPalette: (open: boolean) => void;
  /** Explosões de confete ativas */
  bursts: Burst[];
  celebrate: (x: number, y: number) => void;
  clearBurst: (id: number) => void;
  /** Última tarefa excluída, pra oferecer "Desfazer" */
  undo: Undo | null;
  setUndo: (undo: Undo | null) => void;
}

let burstId = 0;

/** Estado de tela: não vai pro localStorage. */
export const useUI = create<UIState>()((set) => ({
  filters: emptyFilters,
  selectedId: null,
  paletteOpen: false,
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  clearFilters: () => set({ filters: emptyFilters }),
  select: (id) => set({ selectedId: id }),
  setPalette: (open) => set({ paletteOpen: open }),
  bursts: [],
  celebrate: (x, y) => set((s) => ({ bursts: [...s.bursts, { id: ++burstId, x, y }] })),
  clearBurst: (id) => set((s) => ({ bursts: s.bursts.filter((b) => b.id !== id) })),
  undo: null,
  setUndo: (undo) => set({ undo }),
}));

type Theme = "light" | "dark";

interface SettingsState {
  theme: Theme;
  toggleTheme: () => void;
}

const systemTheme = (): Theme =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: systemTheme(),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
    }),
    { name: "fluxo:settings" },
  ),
);
