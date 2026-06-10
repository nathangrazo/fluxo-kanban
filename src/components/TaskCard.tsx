import { CalendarDays, CheckSquare } from "lucide-react";
import { formatDue } from "../lib/date";
import { checklistProgress, isOverdue } from "../lib/selectors";
import { PRIORITIES, TAGS, type Task } from "../types";
import { Avatar } from "./Avatar";

type Props = {
  task: Task;
  today: string;
  dragging?: boolean;
  overlay?: boolean;
};

export function TaskCard({ task, today, dragging, overlay }: Props) {
  const progress = checklistProgress(task);
  const overdue = isOverdue(task, today);
  const priority = PRIORITIES[task.priority];

  return (
    <div
      className={`group relative rounded-xl border bg-surface p-3.5 text-left transition-[box-shadow,border-color,opacity] ${
        overlay
          ? "rotate-2 border-brand/50 shadow-2xl shadow-black/20"
          : "border-line shadow-sm hover:border-fg-muted/40 hover:shadow-md"
      } ${dragging ? "opacity-30" : ""}`}
    >
      <span
        className="absolute top-3.5 left-0 h-5 w-[3px] rounded-r"
        style={{ background: priority.color }}
        title={`Prioridade ${priority.label.toLowerCase()}`}
      />

      {task.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md px-1.5 py-0.5 text-[0.68rem] font-medium"
              style={{ color: TAGS[tag]?.color, background: `color-mix(in srgb, ${TAGS[tag]?.color} 14%, transparent)` }}
            >
              {TAGS[tag]?.label ?? tag}
            </span>
          ))}
        </div>
      )}

      <p className={`text-sm leading-snug font-medium ${task.status === "done" ? "text-fg-muted line-through" : ""}`}>
        {task.title}
      </p>

      {progress.total > 0 && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-500"
            style={{ width: `${progress.ratio * 100}%` }}
          />
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 text-xs text-fg-muted">
        {task.due && (
          <span className={`flex items-center gap-1 ${overdue ? "font-medium text-[#ef4f5f]" : ""}`}>
            <CalendarDays className="size-3.5" />
            {formatDue(task.due, today)}
            {overdue && <span className="sr-only">(atrasada)</span>}
          </span>
        )}
        {progress.total > 0 && (
          <span className="flex items-center gap-1">
            <CheckSquare className="size-3.5" />
            {progress.done}/{progress.total}
          </span>
        )}
        <span className="ml-auto">
          <Avatar id={task.assignee} size={22} />
        </span>
      </div>
    </div>
  );
}
