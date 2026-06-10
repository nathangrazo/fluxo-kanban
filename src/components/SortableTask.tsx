import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import { useUI } from "../store/ui";
import type { Task } from "../types";
import { TaskCard } from "./TaskCard";

export function SortableTask({ task, today }: { task: Task; today: string }) {
  const select = useUI((s) => s.select);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
  });

  return (
    // O transform do dnd-kit fica no wrapper; o motion só cuida da entrada
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={() => select(task.id)}
      onKeyDown={(e) => {
        listeners?.onKeyDown?.(e);
        if (e.key === "Enter") select(task.id);
      }}
      aria-label={`${task.title}. Pressione espaço para mover, Enter para abrir.`}
      className="cursor-grab touch-none rounded-xl active:cursor-grabbing"
    >
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <TaskCard task={task} today={today} dragging={isDragging} />
      </motion.div>
    </div>
  );
}
