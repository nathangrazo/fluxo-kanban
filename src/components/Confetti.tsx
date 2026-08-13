import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { useUI, type Burst } from "../store/ui";

const COLORS = ["#5b5bf0", "#2fb67c", "#e8a33d", "#ef4f5f", "#3fa7f5", "#d16ff0"];
const COUNT = 28;

/** Gera as partículas de uma explosão. A semente é o id, então é determinístico. */
function makePieces(id: number) {
  let seed = id * 9301 + 49297;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: COUNT }, (_, i) => {
    const angle = (i / COUNT) * Math.PI * 2 + rand() * 0.4;
    const speed = 70 + rand() * 110;
    return {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed - 60,
      rotate: rand() * 540 - 270,
      color: COLORS[i % COLORS.length],
      w: 5 + rand() * 5,
      h: rand() > 0.5 ? 5 + rand() * 5 : 3,
      round: rand() > 0.6,
    };
  });
}

function Pieces({ burst }: { burst: Burst }) {
  const clearBurst = useUI((s) => s.clearBurst);
  const pieces = useMemo(() => makePieces(burst.id), [burst.id]);

  return (
    <div className="pointer-events-none fixed z-[70]" style={{ left: burst.x, top: burst.y }}>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{ width: p.w, height: p.h, background: p.color, borderRadius: p.round ? "50%" : 2 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 140], opacity: [1, 1, 0], rotate: p.rotate, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], y: { duration: 1.1, ease: "easeOut", times: [0, 0.45, 1] } }}
          onAnimationComplete={i === 0 ? () => clearBurst(burst.id) : undefined}
        />
      ))}
    </div>
  );
}

/** Confete quando uma tarefa vai pra "Concluído". */
export function Confetti() {
  const bursts = useUI((s) => s.bursts);
  const reduce = useReducedMotion();
  if (reduce) return null;
  return bursts.map((burst) => <Pieces key={burst.id} burst={burst} />);
}
