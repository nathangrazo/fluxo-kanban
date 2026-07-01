import { motion } from "motion/react";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { useMemo } from "react";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { Avatar } from "../components/Avatar";
import { BarChart } from "../components/BarChart";
import { navigate } from "../hooks/useHashRoute";
import { useToday } from "../hooks/useToday";
import { daysBetween, formatDue } from "../lib/date";
import { getStats } from "../lib/selectors";
import { useBoard } from "../store/board";
import { useUI } from "../store/ui";
import { COLUMNS, PEOPLE, PRIORITIES, type Priority, type Task } from "../types";

const container = { show: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

function TaskRow({ task, today, overdue }: { task: Task; today: string; overdue?: boolean }) {
  const select = useUI((s) => s.select);
  const late = overdue ? -daysBetween(today, task.due!) : 0;

  return (
    <li>
      <button
        type="button"
        onClick={() => {
          navigate("board");
          select(task.id);
        }}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-surface-2"
      >
        <span className="size-1.5 shrink-0 rounded-full" style={{ background: PRIORITIES[task.priority].color }} />
        <span className="flex-1 truncate">{task.title}</span>
        <span className={`shrink-0 font-mono text-xs ${overdue ? "text-[#ef4f5f]" : "text-fg-muted"}`}>
          {overdue ? `${late}d atrás` : formatDue(task.due!, today)}
        </span>
        <Avatar id={task.assignee} size={20} />
      </button>
    </li>
  );
}

export function OverviewView() {
  const tasks = useBoard((s) => s.tasks);
  const today = useToday();
  const list = useMemo(() => Object.values(tasks), [tasks]);
  const stats = useMemo(() => getStats(list, today), [list, today]);

  const byPerson = useMemo(
    () =>
      Object.entries(PEOPLE)
        .map(([id, p]) => ({
          key: id,
          label: p.name.split(" ")[0],
          value: list.filter((t) => t.assignee === id && t.status !== "done").length,
        }))
        .sort((a, b) => b.value - a.value),
    [list],
  );

  const kpis = [
    { label: "Tarefas", value: stats.total, detail: "no sprint" },
    { label: "Concluídas", value: stats.done, detail: `${Math.round(stats.completion * 100)}% do total` },
    { label: "Em aberto", value: stats.open, detail: `${stats.byStatus.doing} em andamento` },
    { label: "Atrasadas", value: stats.overdue.length, detail: stats.overdue.length ? "precisam de atenção" : "tudo em dia", alert: stats.overdue.length > 0 },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid flex-1 auto-rows-min grid-cols-2 gap-4 overflow-y-auto px-4 pb-8 md:px-6 lg:grid-cols-6 xl:grid-cols-12"
    >
      {kpis.map((kpi) => (
        <motion.div key={kpi.label} variants={item} className="col-span-1 rounded-2xl border border-line bg-surface p-5 lg:col-span-3 xl:col-span-3">
          <p className="text-xs text-fg-muted">{kpi.label}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">
            <AnimatedNumber value={kpi.value} />
          </p>
          <p className={`mt-1 flex items-center gap-1 text-xs ${kpi.alert ? "text-[#ef4f5f]" : "text-fg-muted"}`}>
            {kpi.alert && <AlertTriangle className="size-3.5" />}
            {kpi.detail}
          </p>
        </motion.div>
      ))}

      <motion.div variants={item} className="col-span-2 xl:col-span-4">
        <BarChart
          title="Tarefas por etapa"
          subtitle="Todas as colunas do quadro"
          orientation="vertical"
          data={COLUMNS.map((c) => ({ key: c.id, label: c.title, value: stats.byStatus[c.id] }))}
        />
      </motion.div>

      <motion.div variants={item} className="col-span-2 xl:col-span-4">
        <BarChart
          title="Em aberto por prioridade"
          subtitle="Sem contar as concluídas"
          data={(Object.keys(PRIORITIES) as Priority[]).map((p) => ({
            key: p,
            label: PRIORITIES[p].label,
            value: stats.byPriority[p],
          }))}
        />
      </motion.div>

      <motion.div variants={item} className="col-span-2 xl:col-span-4">
        <BarChart title="Carga por pessoa" subtitle="Tarefas em aberto" data={byPerson} />
      </motion.div>

      <motion.section variants={item} className="col-span-2 rounded-2xl border border-line bg-surface p-5 lg:col-span-3 xl:col-span-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="size-4 text-[#ef4f5f]" /> Atrasadas
          <span className="font-mono text-xs font-normal text-fg-muted">{stats.overdue.length}</span>
        </h2>
        {stats.overdue.length ? (
          <ul className="mt-3">
            {stats.overdue.map((t) => (
              <TaskRow key={t.id} task={t} today={today} overdue />
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-fg-muted">Nenhuma tarefa atrasada.</p>
        )}
      </motion.section>

      <motion.section variants={item} className="col-span-2 rounded-2xl border border-line bg-surface p-5 lg:col-span-3 xl:col-span-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <CalendarClock className="size-4 text-fg-muted" /> Próximos 7 dias
          <span className="font-mono text-xs font-normal text-fg-muted">{stats.upcoming.length}</span>
        </h2>
        {stats.upcoming.length ? (
          <ul className="mt-3">
            {stats.upcoming.map((t) => (
              <TaskRow key={t.id} task={t} today={today} />
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-fg-muted">Nada vencendo essa semana.</p>
        )}
      </motion.section>
    </motion.div>
  );
}
