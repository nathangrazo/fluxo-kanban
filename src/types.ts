export type Status = "todo" | "doing" | "review" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  tags: string[];
  /** Data no formato YYYY-MM-DD */
  due: string | null;
  assignee: string | null;
  checklist: ChecklistItem[];
  createdAt: string;
}

export const COLUMNS: { id: Status; title: string; accent: string }[] = [
  { id: "todo", title: "A fazer", accent: "#8b8b9c" },
  { id: "doing", title: "Em andamento", accent: "#5b5bf0" },
  { id: "review", title: "Revisão", accent: "#e8a33d" },
  { id: "done", title: "Concluído", accent: "#2fb67c" },
];

export const PRIORITIES: Record<Priority, { label: string; color: string; weight: number }> = {
  urgent: { label: "Urgente", color: "#ef4f5f", weight: 3 },
  high: { label: "Alta", color: "#f08a3c", weight: 2 },
  medium: { label: "Média", color: "#5b5bf0", weight: 1 },
  low: { label: "Baixa", color: "#8b8b9c", weight: 0 },
};

export const TAGS: Record<string, { label: string; color: string }> = {
  design: { label: "Design", color: "#d16ff0" },
  front: { label: "Front-end", color: "#3fa7f5" },
  back: { label: "Back-end", color: "#2fb67c" },
  bug: { label: "Bug", color: "#ef4f5f" },
  pesquisa: { label: "Pesquisa", color: "#e8a33d" },
};

export const PEOPLE: Record<string, { name: string; color: string }> = {
  ana: { name: "Ana Lima", color: "#f08a3c" },
  bruno: { name: "Bruno Reis", color: "#3fa7f5" },
  carla: { name: "Carla Souza", color: "#d16ff0" },
  diego: { name: "Diego Alves", color: "#2fb67c" },
};
