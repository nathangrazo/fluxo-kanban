import { beforeEach, describe, expect, it } from "vitest";
import { useBoard } from "./board";

const state = () => useBoard.getState();

describe("board store", () => {
  beforeEach(() => {
    localStorage.clear();
    state().reset();
  });

  it("adiciona uma tarefa no topo da coluna", () => {
    const id = state().addTask({ title: "Nova", status: "doing" });
    expect(state().order.doing[0]).toBe(id);
    expect(state().tasks[id]).toMatchObject({ title: "Nova", status: "doing", priority: "medium" });
  });

  it("move entre colunas na posição pedida", () => {
    const id = state().order.todo[0];
    state().moveTask(id, "review", 1);
    expect(state().order.todo).not.toContain(id);
    expect(state().order.review[1]).toBe(id);
    expect(state().tasks[id].status).toBe("review");
  });

  it("reordena dentro da mesma coluna sem duplicar", () => {
    const [first, second, third] = state().order.todo;
    state().moveTask(first, "todo", 2);
    expect(state().order.todo.slice(0, 3)).toEqual([second, third, first]);
    expect(new Set(state().order.todo).size).toBe(state().order.todo.length);
  });

  it("limita o índice ao tamanho da coluna", () => {
    const id = state().order.todo[0];
    state().moveTask(id, "done", 999);
    expect(state().order.done.at(-1)).toBe(id);
  });

  it("remove a tarefa e o id da coluna", () => {
    const id = state().order.doing[0];
    state().deleteTask(id);
    expect(state().tasks[id]).toBeUndefined();
    expect(state().order.doing).not.toContain(id);
  });

  it("gerencia o checklist", () => {
    const id = state().addTask({ title: "Com checklist" });
    state().addChecklistItem(id, "  primeiro  ");
    state().addChecklistItem(id, "   ");
    const [item] = state().tasks[id].checklist;
    expect(state().tasks[id].checklist).toHaveLength(1);
    expect(item.text).toBe("primeiro");

    state().toggleChecklistItem(id, item.id);
    expect(state().tasks[id].checklist[0].done).toBe(true);

    state().removeChecklistItem(id, item.id);
    expect(state().tasks[id].checklist).toHaveLength(0);
  });
});
