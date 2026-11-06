"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PLATFORMS, PROCESS, STATS } from "../data";
import { CountUp } from "./CountUp";
import { Eyebrow, Reveal, RevealHeading, ScrubText } from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

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

export function About() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-40">
      <Eyebrow>Why brands work with me</Eyebrow>
      <ScrubText
        className="font-body text-3xl font-semibold leading-[1.15] tracking-tight md:text-6xl"
        text="Most agencies sell posts. I sell *outcomes. Every campaign starts with your numbers: cost per lead, showroom visits, site visits, *revenue. Then we build creatives and funnels that move them, and report in plain language every week."
      />
    </section>
  );
}

export function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-36">
      <Reveal className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 lg:grid-cols-4">
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

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-line]",
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 60%", scrub: true } },
      );
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step, i) => {
        gsap.from(step, {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          delay: i * 0.1,
          scrollTrigger: { trigger: el, start: "top 75%", once: true },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="process" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 md:px-8 md:py-36">
      <Eyebrow>How we work</Eyebrow>
      <RevealHeading text="From first call to *first *lead *in *7 *days." className="max-w-4xl font-display text-4xl font-semibold leading-[1.02] tracking-tight md:text-6xl" />
      <div ref={ref} className="relative mt-16">
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-white/10 md:block">
          <div data-line className="h-full origin-left bg-gradient-to-r from-brand to-brand-2" />
        </div>
        <ol className="grid gap-10 md:grid-cols-4 md:gap-6">
          {PROCESS.map((p) => (
            <li key={p.step} data-step className="relative">
              <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-brand/40 bg-ink font-display text-sm text-brand">
                {p.step}
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
