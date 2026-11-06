"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import type { Project } from "../data";
import { whatsappLink } from "../brand";
import { CountUp } from "./CountUp";
import { MagneticButton } from "./Magnetic";
import { ProjectVisual } from "./ProjectVisual";
import { Eyebrow, Reveal, RevealHeading } from "./Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CaseStudy({ project: p, next }: { project: Project; next: Project }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (n: number, o: { immediate: boolean }) => void } }).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [p.slug]);

  return (
    <main className="pt-32 md:pt-40">
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <Link href="/#work" className="inline-flex items-center gap-2 text-sm text-mist hover:text-brand">
            <ArrowLeft size={16} /> All work
          </Link>
        </motion.div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xs uppercase tracking-[0.25em] text-brand"
            >
              {p.category} · {p.year}
            </motion.p>
            <h1 className="mt-4 overflow-hidden font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-8xl">
              <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.15 }}>
                {p.title}
              </motion.span>
            </h1>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: EASE }}>
            <p className="text-lg text-fog/80">{p.summary}</p>
            <p className="mt-3 text-sm text-mist">Client: {p.client}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="rounded-full border border-white/10 px-3 py-1 text-xs text-fog/70">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <motion.div
        ref={heroRef}
        initial={{ clipPath: "inset(12% 8% 12% 8% round 32px)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0% round 32px)" }}
        transition={{ duration: 1.3, ease: EASE, delay: 0.3 }}
        className="relative mx-auto mt-14 h-[56vh] max-w-7xl overflow-hidden rounded-[2rem] md:mx-8 md:h-[72vh] xl:mx-auto"
      >
        <motion.div style={{ y }} className="absolute inset-x-0 inset-y-[-8%]">
          <ProjectVisual kind={p.visual} video={p.video} poster={p.poster} />
        </motion.div>
      </motion.div>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-3">
          {p.metrics.map((m) => (
            <div key={m.label} data-reveal className="bg-ink p-8">
              <CountUp {...m} className="font-display text-5xl font-semibold text-brand md:text-6xl" />
              <p className="mt-2 text-sm text-mist">{m.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-5 pb-24 md:grid-cols-[1fr_2fr] md:px-8">
        <div className="md:sticky md:top-32 md:self-start">
          <Eyebrow>The challenge</Eyebrow>
        </div>
        <RevealHeading text={p.challenge} as="h2" className="font-body text-2xl font-semibold leading-snug tracking-tight md:text-4xl" />

        <div className="md:sticky md:top-32 md:self-start">
          <Eyebrow>Strategy</Eyebrow>
        </div>
        <Reveal as="ul" className="space-y-4">
          {p.strategy.map((s) => (
            <li key={s} data-reveal className="flex gap-4 border-b border-white/10 pb-4 text-lg text-fog/85">
              <Check size={20} className="mt-1 shrink-0 text-brand" /> {s}
            </li>
          ))}
        </Reveal>

        <div className="md:sticky md:top-32 md:self-start">
          <Eyebrow>Execution</Eyebrow>
        </div>
        <Reveal as="ul" className="grid gap-4 sm:grid-cols-2">
          {p.execution.map((s, i) => (
            <li key={s} data-reveal className="glass rounded-2xl p-6">
              <span className="font-display text-sm text-brand">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 text-fog/85">{s}</p>
            </li>
          ))}
        </Reveal>

        <div className="md:sticky md:top-32 md:self-start">
          <Eyebrow>Outcome</Eyebrow>
        </div>
        <div>
          <RevealHeading text={p.outcome} as="h2" className="font-body text-2xl font-semibold leading-snug tracking-tight md:text-4xl" />
          <div className="mt-10">
            <MagneticButton href={whatsappLink(`Hi Karan, I saw the "${p.title}" case study. I'd like something similar.`)} external>
              Get results like this <ArrowUpRight size={18} />
            </MagneticButton>
          </div>
        </div>
      </section>

      <Link href={`/work/${next.slug}`} data-cursor="Next" className="group relative block overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-60">
          <ProjectVisual kind={next.visual} video={next.video} poster={next.poster} />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-32">
          <p className="text-xs uppercase tracking-[0.25em] text-mist">Next project</p>
          <p className="mt-4 flex items-center gap-4 font-display text-5xl font-semibold tracking-tight transition-transform duration-700 ease-out-expo group-hover:translate-x-4 md:text-8xl">
            {next.title}
            <ArrowUpRight className="h-10 w-10 shrink-0 text-brand transition-transform duration-500 group-hover:rotate-45 md:h-16 md:w-16" />
          </p>
        </div>
      </Link>
    </main>
  );
}
