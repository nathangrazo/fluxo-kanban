import { fireEvent, render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { beforeEach, describe, expect, it } from "vitest";
import { useBoard } from "../store/board";
import { Column } from "./Column";

function renderColumn() {
  const { order, tasks } = useBoard.getState();
  return render(
    <DndContext>
      <Column id="todo" title="A fazer" accent="#999" tasks={order.todo.map((id) => tasks[id])} total={order.todo.length} today="2026-11-24" />
    </DndContext>,
  );
}

describe("Column", () => {
  beforeEach(() => {
    localStorage.clear();
    useBoard.getState().reset();
  });

  it("cria uma tarefa pelo formulário inline", () => {
    renderColumn();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar tarefa em A fazer" }));
    const input = screen.getByPlaceholderText(/Título da tarefa/);
    fireEvent.change(input, { target: { value: "Escrever testes" } });
    fireEvent.keyDown(input, { key: "Enter" });

    const { order, tasks } = useBoard.getState();
    expect(tasks[order.todo[0]].title).toBe("Escrever testes");
  });

  it("descarta o rascunho com Esc", () => {
    renderColumn();
    const before = useBoard.getState().order.todo.length;
    fireEvent.click(screen.getByRole("button", { name: "Adicionar tarefa em A fazer" }));
    const input = screen.getByPlaceholderText(/Título da tarefa/);
    fireEvent.change(input, { target: { value: "Vai sumir" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(useBoard.getState().order.todo).toHaveLength(before);
  });
});
