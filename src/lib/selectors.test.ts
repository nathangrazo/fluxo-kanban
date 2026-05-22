import { describe, expect, it } from "vitest";
import { emptyFilters } from "../store/ui";
import type { Task } from "../types";
import { checklistProgress, getStats, isOverdue, matchesFilters } from "./selectors";

const task = (patch: Partial<Task>): Task => ({
  id: "x",
  title: "Tela de login",
  description: "Validar e-mail",
  status: "todo",
  priority: "medium",
  tags: ["front"],
  due: null,
  assignee: "ana",
  checklist: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  ...patch,
});

describe("matchesFilters", () => {
  it("busca no título e na descrição sem diferenciar maiúsculas", () => {
    expect(matchesFilters(task({}), { ...emptyFilters, query: "LOGIN" })).toBe(true);
    expect(matchesFilters(task({}), { ...emptyFilters, query: "e-mail" })).toBe(true);
    expect(matchesFilters(task({}), { ...emptyFilters, query: "pagamento" })).toBe(false);
  });

  it("combina filtros", () => {
    const filters = { ...emptyFilters, tag: "front", priority: "high" as const };
    expect(matchesFilters(task({ priority: "high" }), filters)).toBe(true);
    expect(matchesFilters(task({ priority: "low" }), filters)).toBe(false);
  });
});

describe("isOverdue", () => {
  it("considera só tarefas abertas com prazo no passado", () => {
    expect(isOverdue(task({ due: "2026-03-09" }), "2026-03-10")).toBe(true);
    expect(isOverdue(task({ due: "2026-03-10" }), "2026-03-10")).toBe(false);
    expect(isOverdue(task({ due: "2026-03-01", status: "done" }), "2026-03-10")).toBe(false);
    expect(isOverdue(task({ due: null }), "2026-03-10")).toBe(false);
  });
});

describe("getStats", () => {
  it("calcula totais, atrasadas e próximas", () => {
    const tasks = [
      task({ id: "a", status: "done" }),
      task({ id: "b", due: "2026-03-08", priority: "urgent" }),
      task({ id: "c", due: "2026-03-12" }),
      task({ id: "d", due: "2026-04-30" }),
    ];
    const stats = getStats(tasks, "2026-03-10");
    expect(stats.total).toBe(4);
    expect(stats.completion).toBe(0.25);
    expect(stats.overdue.map((t) => t.id)).toEqual(["b"]);
    expect(stats.upcoming.map((t) => t.id)).toEqual(["c"]);
    expect(stats.byPriority.urgent).toBe(1);
  });
});

describe("checklistProgress", () => {
  it("retorna 0 quando não há itens", () => {
    expect(checklistProgress(task({})).ratio).toBe(0);
  });

  it("conta os itens feitos", () => {
    const t = task({ checklist: [{ id: "1", text: "a", done: true }, { id: "2", text: "b", done: false }] });
    expect(checklistProgress(t)).toEqual({ done: 1, total: 2, ratio: 0.5 });
  });
});
