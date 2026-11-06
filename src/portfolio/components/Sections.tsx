"use client";

import { PLATFORMS, STATS } from "../data";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";

export function Marquee() {
  const items = [...PLATFORMS, ...PLATFORMS];
  return (
    <div className="relative overflow-hidden border-y border-white/5 py-6" aria-label="Platforms I work with">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent" />
      <ul className="marquee-track flex w-max gap-12 whitespace-nowrap font-display text-xl text-fog/40 md:text-2xl">
        {items.map((p, i) => (
          <li key={i} className="flex items-center gap-12" aria-hidden={i >= PLATFORMS.length}>
            {p}
            <span className="h-1.5 w-1.5 rounded-full bg-brand/60" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-36">
      <Reveal className="grid grid-cols-2 gap-px overflow-hidden rounded-none border border-white/10 bg-white/10 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} data-reveal className="bg-ink p-6 md:p-10">
            <CountUp {...s} className="font-display text-4xl font-semibold tracking-tight text-fog md:text-6xl" />
            <p className="mt-3 text-sm text-mist">{s.label}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
