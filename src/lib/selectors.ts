import type { Filters } from "../store/ui";
import { COLUMNS, PRIORITIES, type Priority, type Status, type Task } from "../types";
import { daysBetween } from "./date";

export function matchesFilters(task: Task, filters: Filters) {
  const query = filters.query.trim().toLowerCase();
  if (query && !`${task.title} ${task.description}`.toLowerCase().includes(query)) return false;
  if (filters.priority && task.priority !== filters.priority) return false;
  if (filters.tag && !task.tags.includes(filters.tag)) return false;
  if (filters.assignee && task.assignee !== filters.assignee) return false;
  return true;
}

export function hasActiveFilters(filters: Filters) {
  return Boolean(filters.query.trim() || filters.priority || filters.tag || filters.assignee);
}

export function isOverdue(task: Task, today: string) {
  return task.status !== "done" && task.due !== null && daysBetween(today, task.due) < 0;
}

export function checklistProgress(task: Task) {
  const total = task.checklist.length;
  const done = task.checklist.filter((item) => item.done).length;
  return { done, total, ratio: total ? done / total : 0 };
}

export function getStats(tasks: Task[], today: string) {
  const byStatus = Object.fromEntries(COLUMNS.map((c) => [c.id, 0])) as Record<Status, number>;
  const byPriority = Object.fromEntries(Object.keys(PRIORITIES).map((p) => [p, 0])) as Record<Priority, number>;

  for (const task of tasks) {
    byStatus[task.status] += 1;
    if (task.status !== "done") byPriority[task.priority] += 1;
  }

  const overdue = tasks.filter((t) => isOverdue(t, today));
  const upcoming = tasks
    .filter((t) => t.status !== "done" && t.due && daysBetween(today, t.due) >= 0 && daysBetween(today, t.due) <= 7)
    .sort((a, b) => a.due!.localeCompare(b.due!));

  return {
    total: tasks.length,
    done: byStatus.done,
    open: tasks.length - byStatus.done,
    completion: tasks.length ? byStatus.done / tasks.length : 0,
    byStatus,
    byPriority,
    overdue,
    upcoming,
  };
}
