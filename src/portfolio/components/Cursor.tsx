"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const SNAP = 24;

/**
 * Square cursor that snaps to the exposed grid's column lines when within 24px.
 * Shows a label over elements with data-cursor. Desktop (fine pointer) only, off for reduced motion.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 900, damping: 50, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 900, damping: 50, mass: 0.3 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    // Enabling after mount is intentional: the cursor depends on browser-only media queries.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    let lines: number[] = [];
    const measure = () => {
      lines = [...document.querySelectorAll<HTMLElement>("[data-gridline]")]
        .filter((l) => l.offsetParent !== null)
        .flatMap((l) => {
          const r = l.getBoundingClientRect();
          return [r.left, r.right];
        });
    };
    measure();
    window.addEventListener("resize", measure);

    const move = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      setLabel(labelled?.dataset.cursor ?? null);
      setHovering(Boolean(t.closest("a, button, [role='button'], input, textarea, select")));
      let px = e.clientX;
      if (!labelled) {
        const near = lines.reduce((best, l) => (Math.abs(l - px) < Math.abs(best - px) ? l : best), Infinity);
        if (Math.abs(near - px) <= SNAP) px = near;
      }
      x.set(px);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", measure);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.15em]"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: label ? 72 : hovering ? 28 : 16,
        height: label ? 28 : hovering ? 28 : 16,
        backgroundColor: label ? "rgb(255 77 31 / 1)" : "rgb(255 77 31 / 0)",
        borderColor: "rgb(255 77 31 / 1)",
        color: "#0A0A0A",
      }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <span className="absolute inset-0 border-[1.5px] border-brand" />
      {label}
    </motion.div>
  );
}
