import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { Column } from "../components/Column";
import { TaskCard } from "../components/TaskCard";
import { useToday } from "../hooks/useToday";
import { matchesFilters } from "../lib/selectors";
import { useBoard } from "../store/board";
import { useUI } from "../store/ui";
import { COLUMNS, type Status } from "../types";

export function BoardView() {
  const tasks = useBoard((s) => s.tasks);
  const order = useBoard((s) => s.order);
  const moveTask = useBoard((s) => s.moveTask);
  const filters = useUI((s) => s.filters);
  const today = useToday();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const visible = useMemo(() => {
    const result = {} as Record<Status, typeof tasks[string][]>;
    for (const col of COLUMNS) {
      result[col.id] = order[col.id].map((id) => tasks[id]).filter((t) => t && matchesFilters(t, filters));
    }
    return result;
  }, [tasks, order, filters]);

  /** Descobre a coluna de um id, seja ele de uma tarefa ou da própria coluna. */
  function columnOf(id: string): Status | undefined {
    if (id in order) return id as Status;
    return tasks[id]?.status;
  }

  /**
   * Índice na lista completa da coluna. Com filtro ativo a lista visível é
   * menor, então o índice tem que ser calculado na ordem real.
   */
  function indexIn(column: Status, overId: string) {
    const index = order[column].indexOf(overId);
    return index === -1 ? order[column].length : index;
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id));
  }

  // Troca de coluna enquanto arrasta, pra o card aparecer no lugar certo
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const from = columnOf(String(active.id));
    const to = columnOf(String(over.id));
    if (!from || !to || from === to) return;
    moveTask(String(active.id), to, indexIn(to, String(over.id)));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const to = columnOf(String(over.id));
    if (!to) return;
    moveTask(String(active.id), to, indexIn(to, String(over.id)));
  }

  const activeTask = activeId ? tasks[activeId] : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto px-4 pb-6 md:px-6">
        {COLUMNS.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            accent={col.accent}
            tasks={visible[col.id]}
            total={order[col.id].length}
            today={today}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
        {activeTask && <TaskCard task={activeTask} today={today} overlay />}
      </DragOverlay>
    </DndContext>
  );
}
