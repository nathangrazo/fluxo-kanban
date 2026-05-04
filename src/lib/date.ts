/** Data local no formato YYYY-MM-DD (sem passar por UTC). */
export function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Diferença em dias entre duas datas YYYY-MM-DD (b - a). */
export function daysBetween(a: string, b: string) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

const short = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

export function formatDue(due: string, today: string) {
  const diff = daysBetween(today, due);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  const [y, m, d] = due.split("-").map(Number);
  return short.format(new Date(y, m - 1, d)).replace(".", "");
}
