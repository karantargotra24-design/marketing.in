"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import type { Metric } from "../data";

const fmt = (n: number, decimals = 0) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** Number that counts up once when it scrolls into view. Indian digit grouping (1,00,000). */
export function CountUp({ value, prefix = "", suffix = "", decimals = 0, className = "" }: Omit<Metric, "label"> & { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [display, setDisplay] = useState(fmt(0, decimals));

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Reduced-motion users get the final number immediately.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(fmt(value, decimals));
      return;
    }
    const c = animate(0, value, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setDisplay(fmt(v, decimals)) });
    return () => c.stop();
  }, [inView, value, decimals]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`} aria-label={`${prefix}${fmt(value, decimals)}${suffix}`}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
