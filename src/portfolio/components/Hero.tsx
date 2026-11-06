"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { BRAND } from "../brand";
import { PERSON } from "../data";
import { CursorChips } from "./CursorChips";
import { MagneticButton } from "./Magnetic";

const COLS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const DROP = "cubic-bezier(0.55,0,1,0.45)";

function Letters({ word, className = "" }: { word: string; className?: string }) {
  return (
    <span className={`block whitespace-nowrap ${className}`} aria-hidden>
      {word.split("").map((ch, i) => (
        <span key={i} data-drop className="inline-block will-change-transform">
          {ch}
        </span>
      ))}
    </span>
  );
}

/** Personal hero: giant name whose letters drop one by one and shake the page on impact. */
export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray<HTMLElement>("[data-drop]");
      const tl = gsap.timeline({ delay: 0.25 });
      gsap.set(letters, { yPercent: -140, opacity: 0 });
      gsap.set("[data-fade]", { opacity: 0, y: 24 });
      gsap.set("[data-stamp]", { scale: 0 });
      letters.forEach((l, i) => {
        tl.to(l, { yPercent: 0, opacity: 1, duration: 0.18, ease: DROP }, i * 0.075);
        // Small impact shake on every landing, a stronger one on the last letter.
        const amp = i === letters.length - 1 ? 4 : 1.5;
        tl.to(el, { y: amp, duration: 0.04, yoyo: true, repeat: 1, ease: "none" }, i * 0.075 + 0.18);
      });
      tl.to("[data-stamp]", { scale: 1, duration: 0.12, ease: "back.out(3)" }, ">-0.02");
      tl.to("[data-fade]", { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 }, "<");
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="top" className="grain relative min-h-[100svh] overflow-hidden pb-16 pt-24 md:pt-28">
      {/* Warm glow behind the portrait */}
      <div aria-hidden className="pointer-events-none absolute right-[-10%] top-[10%] h-[70vh] w-[60vw] rounded-full bg-brand/20 blur-[120px]" />
      <CursorChips />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* Column index along the top edge of the grid */}
        <div aria-hidden className="grid grid-cols-4 border-b border-white/10 pb-2 font-mono text-[10px] text-mist/70 md:grid-cols-12">
          {COLS.map((c, i) => (
            <span key={c} className={i >= 4 ? "hidden md:block" : ""}>
              {c}
            </span>
          ))}
        </div>
        <span data-stamp aria-hidden className="absolute right-5 top-6 h-6 w-6 bg-brand md:right-8 md:h-8 md:w-8" />

        <div className="grid gap-10 pt-10 md:grid-cols-12 md:pt-14">
          <div className="md:col-span-8">
            <p data-fade className="font-mono text-xs uppercase tracking-[0.25em] text-mist">
              Hello, I&apos;m
            </p>
            <h1 className="mt-3 font-display text-[21vw] leading-[0.86] md:text-[13vw] lg:text-[12.5rem]">
              <span className="sr-only">
                {PERSON.first} {PERSON.last}, {PERSON.title}
              </span>
              <Letters word={PERSON.first} />
              <Letters word={`${PERSON.last}.`} className="text-brand" />
            </h1>
            <p data-fade className="mt-6 font-display text-2xl leading-tight text-brand md:text-4xl">
              {PERSON.title}
            </p>
            <p data-fade className="mt-5 max-w-xl text-base leading-relaxed text-fog/80 md:text-lg">
              {PERSON.intro}
            </p>
            <div data-fade className="mt-8 flex flex-wrap gap-3">
              <MagneticButton href="/#work">
                View my work <ArrowDown size={18} />
              </MagneticButton>
              <MagneticButton href="/#contact" variant="ghost">
                Let&apos;s connect <ArrowUpRight size={18} />
              </MagneticButton>
            </div>
            <p data-fade className="mt-8 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
              {PERSON.meta.map((m, i) => (
                <span key={m}>
                  {i > 0 && <span className="mr-3 text-brand">/</span>}
                  {m}
                </span>
              ))}
            </p>
          </div>

          <div data-fade className="relative md:col-span-4">
            <Portrait />
            <dl className="absolute -bottom-4 right-0 space-y-4 text-right md:-right-2">
              {PERSON.heroStats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-4xl leading-none text-brand md:text-5xl">{s.value}</dd>
                  <dd className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Portrait() {
  if (BRAND.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={BRAND.photo}
        alt={`Portrait of ${BRAND.person}`}
        className="relative z-10 h-[52vh] w-full object-cover object-top grayscale-[35%] contrast-110 md:h-[64vh]"
      />
    );
  }
  // Placeholder until a portrait is added in brand.ts
  return (
    <div className="relative flex h-[44vh] w-full flex-col justify-between border border-white/10 bg-surface/60 p-5 md:h-[60vh]">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">Portrait · 4:5</span>
      <span aria-hidden className="font-display text-[9rem] leading-none text-transparent [-webkit-text-stroke:1.5px_rgb(255_77_31/0.7)] md:text-[11rem]">
        KT
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">Add your photo in brand.ts</span>
    </div>
  );
}
