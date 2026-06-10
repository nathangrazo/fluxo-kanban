import { toISODate } from "../lib/date";

/** Data de hoje em YYYY-MM-DD. Separado num hook pra facilitar trocar por um relógio depois. */
export function useToday() {
  return toISODate(new Date());
}
