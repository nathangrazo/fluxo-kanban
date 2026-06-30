import { motion } from "motion/react";
import { useState } from "react";

export type Datum = { key: string; label: string; value: number };

type Props = {
  title: string;
  subtitle?: string;
  data: Datum[];
  orientation?: "vertical" | "horizontal";
  unit?: string;
};

/**
 * Gráfico de barras de uma série só. Segue algumas regras simples:
 * barra fina (máx. 24px), ponta arredondada e base reta, valor na ponta,
 * tooltip no hover e uma tabela com os mesmos dados pra leitor de tela.
 */
export function BarChart({ title, subtitle, data, orientation = "horizontal", unit = "tarefas" }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const hovered = data.find((d) => d.key === hover);

  return (
    <figure className="relative rounded-2xl border border-line bg-surface p-5">
      <figcaption>
        <p className="text-sm font-semibold">{title}</p>
        {subtitle && <p className="text-xs text-fg-muted">{subtitle}</p>}
      </figcaption>

      {orientation === "horizontal" ? (
        <ul className="mt-5 space-y-1" aria-hidden>
          {data.map((d, i) => (
            <li
              key={d.key}
              onPointerEnter={() => setHover(d.key)}
              onPointerLeave={() => setHover(null)}
              className="grid grid-cols-[6.5rem_1fr] items-center gap-3 rounded-md py-1.5"
            >
              <span className="truncate text-xs text-fg-muted">{d.label}</span>
              <span className="flex items-center gap-2">
                <motion.span
                  className="h-4 rounded-r-[4px] bg-chart"
                  style={{ opacity: hover && hover !== d.key ? 0.45 : 1 }}
                  initial={{ width: 0 }}
                  animate={{ width: `calc(${(d.value / max) * 100}% - 2rem)` }}
                  transition={{ duration: 0.9, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                />
                <span className="font-mono text-xs tabular-nums">{d.value}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5" aria-hidden>
          <div className="relative flex h-44 items-end justify-around border-b border-line">
            {/* grade recessiva no meio e no topo */}
            <span className="absolute inset-x-0 top-0 border-t border-line/60" />
            <span className="absolute inset-x-0 top-1/2 border-t border-line/60" />
            {data.map((d, i) => (
              <div
                key={d.key}
                onPointerEnter={() => setHover(d.key)}
                onPointerLeave={() => setHover(null)}
                className="relative flex h-full flex-1 flex-col items-center justify-end"
              >
                <span className="mb-1 font-mono text-xs tabular-nums">{d.value}</span>
                <motion.span
                  className="w-6 rounded-t-[4px] bg-chart"
                  style={{ opacity: hover && hover !== d.key ? 0.45 : 1 }}
                  initial={{ height: 0 }}
                  animate={{ height: `calc(${(d.value / max) * 100}% - 1.25rem)` }}
                  transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-around">
            {data.map((d) => (
              <span key={d.key} className="flex-1 text-center text-xs text-fg-muted">
                {d.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {hovered && (
        <div className="pointer-events-none absolute top-4 right-4 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg">
          <p className="text-fg-muted">{hovered.label}</p>
          <p className="font-semibold">
            {hovered.value} {unit}
          </p>
        </div>
      )}

      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Categoria</th>
            <th scope="col">Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <th scope="row">{d.label}</th>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
