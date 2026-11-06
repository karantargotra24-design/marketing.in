"use client";

import { motion } from "framer-motion";

/**
 * Figma-style "multiplayer" cursors drifting over a section: the team at work on your campaign.
 * Chip colours are UI accents only (like a design tool), not brand colours.
 */
type Chip = { label: string; color: string; x: string; y: string; path: [number, number][]; duration: number };

const DEFAULT: Chip[] = [
  { label: "Media buyer", color: "#F5C842", x: "58%", y: "22%", path: [[0, 0], [40, 30], [-20, 60], [0, 0]], duration: 11 },
  { label: "Copywriter", color: "#5AA9FF", x: "76%", y: "58%", path: [[0, 0], [-50, -20], [-10, 40], [0, 0]], duration: 13 },
  { label: "Designer", color: "#B58CFF", x: "42%", y: "70%", path: [[0, 0], [60, -30], [20, 20], [0, 0]], duration: 12 },
  { label: "Analyst", color: "#6EE7A8", x: "88%", y: "16%", path: [[0, 0], [-30, 50], [10, 20], [0, 0]], duration: 10 },
  { label: "Karan", color: "#FF8FB1", x: "66%", y: "84%", path: [[0, 0], [30, -40], [-40, -10], [0, 0]], duration: 14 },
];

export function CursorChips({ chips = DEFAULT, className = "" }: { chips?: Chip[]; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 hidden md:block ${className}`}>
      {chips.map((c, i) => (
        <motion.div
          key={c.label}
          className="absolute"
          style={{ left: c.x, top: c.y }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1, x: c.path.map((p) => p[0]), y: c.path.map((p) => p[1]) }}
          transition={{
            opacity: { delay: 2 + i * 0.25, duration: 0.5 },
            scale: { delay: 2 + i * 0.25, duration: 0.5 },
            x: { delay: 2 + i * 0.25, duration: c.duration, repeat: Infinity, ease: "easeInOut" },
            y: { delay: 2 + i * 0.25, duration: c.duration, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <svg width="16" height="18" viewBox="0 0 16 18" className="drop-shadow">
            <path d="M1 1l13 7.5-6 1.6L5.2 16z" fill={c.color} stroke="#0A0A0A" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          <span
            className="ml-3 -mt-1 inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] font-medium text-[#0A0A0A] shadow-lg"
            style={{ background: c.color }}
          >
            <span className="h-2.5 w-2.5 rounded-[3px] bg-[#0A0A0A]/80" />
            {c.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
