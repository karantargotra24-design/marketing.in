"use client";

import { Fingerprint, Lightbulb, Magnet, MessageCircle, Rocket, Sparkles, Target, TrendingUp, type LucideIcon } from "lucide-react";
import { SERVICES } from "../data";
import { Eyebrow, Reveal, RevealHeading } from "./Reveal";

const ICONS: Record<(typeof SERVICES)[number]["icon"], LucideIcon> = {
  TrendingUp,
  Target,
  Magnet,
  Sparkles,
  Lightbulb,
  Fingerprint,
  MessageCircle,
  Rocket,
};

export function Services() {
  const track = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section id="services" className="relative scroll-mt-24 border-y border-white/5 bg-surface/60 py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-14 grid gap-6 md:mb-20 md:grid-cols-2 md:items-end">
          <div>
            <Eyebrow>Services</Eyebrow>
            <RevealHeading text="Everything you need to grow, under one roof." className="font-display text-4xl font-semibold leading-[1.02] tracking-tight md:text-6xl" />
          </div>
          <p className="max-w-md text-mist md:justify-self-end md:text-lg">
            Strategy, creatives, ads and follow-up handled by one team, so nothing gets lost between agencies.
          </p>
        </div>

        <Reveal as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.07}>
          {SERVICES.map((s, i) => {
            const Icon = ICONS[s.icon];
            return (
              <li
                key={s.title}
                data-reveal
                onPointerMove={track}
                className="group relative min-h-64 overflow-hidden rounded-3xl border border-white/10 bg-ink/60 p-6 transition-colors duration-500 hover:border-brand/40"
              >
                <div className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand transition-all duration-500 ease-out-expo group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:bg-brand group-hover:text-ink">
                      <Icon size={22} />
                    </span>
                    <span className="font-display text-sm text-mist">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-14 font-display text-xl font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{s.text}</p>
                </div>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
