import { AnimatePresence, motion } from "motion/react";
import { Undo2 } from "lucide-react";
import { useEffect } from "react";
import { useBoard } from "../store/board";
import { useUI } from "../store/ui";

const DURATION = 5000;

/** Aviso de exclusão com opção de desfazer por alguns segundos. */
export function UndoToast() {
  const undo = useUI((s) => s.undo);
  const setUndo = useUI((s) => s.setUndo);
  const restoreTask = useBoard((s) => s.restoreTask);

  useEffect(() => {
    if (!undo) return;
    const id = window.setTimeout(() => setUndo(null), DURATION);
    return () => window.clearTimeout(id);
  }, [undo, setUndo]);

  return (
    <AnimatePresence>
      {undo && (
        <motion.div
          key={undo.task.id}
          role="status"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-[65] flex -translate-x-1/2 items-center gap-4 overflow-hidden rounded-xl border border-line bg-fg py-3 pr-3 pl-4 text-sm text-canvas shadow-2xl"
        >
          <span className="max-w-56 truncate">
            Tarefa <strong className="font-semibold">"{undo.task.title}"</strong> excluída
          </span>
          <button
            type="button"
            onClick={() => {
              restoreTask(undo.task, undo.index);
              setUndo(null);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-canvas/15 px-3 py-1.5 font-medium transition-colors hover:bg-canvas/25"
          >
            <Undo2 className="size-3.5" />
            Desfazer
          </button>
          <motion.span
            className="absolute bottom-0 left-0 h-0.5 bg-brand-soft"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: DURATION / 1000, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
