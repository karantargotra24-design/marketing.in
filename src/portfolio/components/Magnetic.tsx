"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
  className?: string;
  strength?: number;
  external?: boolean;
};

/** Button that is pulled toward the pointer, with an inner label that moves a bit further. */
export function MagneticButton({ href, children, variant = "solid", className = "", strength = 0.35, external }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.4 });
  const ix = useSpring(useMotionValue(0), { stiffness: 220, damping: 15 });
  const iy = useSpring(useMotionValue(0), { stiffness: 220, damping: 15 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
    ix.set(dx * strength * 0.5);
    iy.set(dy * strength * 0.5);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
    ix.set(0);
    iy.set(0);
  };

  const base =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-sm px-7 py-4 font-mono text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-300 md:text-sm";
  const look =
    variant === "solid"
      ? "bg-brand text-ink hover:bg-fog"
      : "border border-white/15 text-fog hover:border-brand/60 hover:text-brand";

  const inner = (
    <motion.span style={{ x: ix, y: iy }} className="relative z-10 inline-flex items-center gap-2">
      {children}
    </motion.span>
  );

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ x: sx, y: sy }} className="inline-block">
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${look} ${className}`}>
          {inner}
        </a>
      ) : (
        <Link href={href} className={`${base} ${look} ${className}`}>
          {inner}
        </Link>
      )}
    </motion.div>
  );
}
