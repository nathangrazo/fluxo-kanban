import { addDays, toISODate } from "../lib/date";
import type { Status, Task } from "../types";

type SeedTask = Omit<Task, "id" | "createdAt" | "due" | "checklist"> & {
  dueIn: number | null;
  checklist?: [string, boolean][];
};

const seed: SeedTask[] = [
  { title: "Pesquisa com entregadores", description: "Entrevistar 8 entregadores sobre o fluxo de aceite de pedidos.", status: "done", priority: "medium", tags: ["pesquisa"], dueIn: -6, assignee: "carla", checklist: [["Roteiro", true], ["Agendar entrevistas", true], ["Síntese", true]] },
  { title: "Wireframes do checkout", description: "", status: "done", priority: "high", tags: ["design"], dueIn: -3, assignee: "carla" },
  { title: "Endpoint de cupons", description: "POST /coupons/validate com regras de valor mínimo e primeira compra.", status: "review", priority: "high", tags: ["back"], dueIn: 1, assignee: "diego", checklist: [["Regras de negócio", true], ["Testes", true], ["Documentação", false]] },
  { title: "Tela de rastreio do pedido", description: "Mapa com a posição do entregador e linha do tempo do pedido.", status: "doing", priority: "urgent", tags: ["front", "design"], dueIn: 0, assignee: "ana", checklist: [["Layout", true], ["Mapa", false], ["Estados de erro", false]] },
  { title: "Carrinho some ao trocar de aba", description: "Reproduzido no Safari iOS. Suspeita de storage sendo limpo.", status: "doing", priority: "urgent", tags: ["bug", "front"], dueIn: -1, assignee: "bruno" },
  { title: "Notificações push", description: "", status: "doing", priority: "medium", tags: ["back"], dueIn: 4, assignee: "diego" },
  { title: "Design system: botões e inputs", description: "Revisar estados de foco e contraste.", status: "review", priority: "medium", tags: ["design", "front"], dueIn: 2, assignee: "carla" },
  { title: "Onboarding em 3 passos", description: "", status: "todo", priority: "high", tags: ["design"], dueIn: 6, assignee: "carla" },
  { title: "Cache das listas de restaurantes", description: "Avaliar stale-while-revalidate nas listas da home.", status: "todo", priority: "medium", tags: ["front", "pesquisa"], dueIn: 8, assignee: "bruno" },
  { title: "Rate limit no login", description: "", status: "todo", priority: "high", tags: ["back", "bug"], dueIn: -2, assignee: "diego" },
  { title: "Avaliação do restaurante", description: "Estrelas + comentário opcional depois da entrega.", status: "todo", priority: "low", tags: ["front"], dueIn: 12, assignee: null },
  { title: "Benchmark de concorrentes", description: "", status: "todo", priority: "low", tags: ["pesquisa"], dueIn: null, assignee: "ana" },
];

export function createSeed(today = new Date()) {
  const tasks: Record<string, Task> = {};
  const order: Record<Status, string[]> = { todo: [], doing: [], review: [], done: [] };

  seed.forEach((item, i) => {
    const id = `t${i + 1}`;
    tasks[id] = {
      id,
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      tags: item.tags,
      assignee: item.assignee,
      due: item.dueIn === null ? null : toISODate(addDays(today, item.dueIn)),
      checklist: (item.checklist ?? []).map(([text, done], j) => ({ id: `${id}-c${j}`, text, done })),
      createdAt: addDays(today, -14 + i).toISOString(),
    };
    order[item.status].push(id);
  });

  return { tasks, order };
}
