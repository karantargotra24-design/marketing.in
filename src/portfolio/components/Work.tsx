"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { CATEGORIES, PROJECTS, type Project, type TileSize } from "../data";
import { CountUp } from "./CountUp";
import { ProjectVisual } from "./ProjectVisual";
import { Eyebrow, RevealHeading } from "./Reveal";

const SPAN: Record<TileSize, string> = {
  lg: "md:col-span-4 md:row-span-2",
  tall: "md:col-span-2 md:row-span-2",
  wide: "md:col-span-4",
  sm: "md:col-span-2",
};
const EASE = [0.16, 1, 0.3, 1] as const;

export function Work() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const [active, setActive] = useState<number | null>(null);
  const close = useCallback(() => setActive(null), []);
  const nav = useCallback((d: 1 | -1) => setActive((a) => (a === null ? a : (a + d + PROJECTS.length) % PROJECTS.length)), []);

  const list = useMemo(
    () => (filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter || p.tags.includes(filter))),
    [filter],
  );

  return (
    <section id="work" className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-24 md:px-8 md:py-36">
      <div className="mb-12 flex flex-col gap-8 md:mb-16 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Selected work</Eyebrow>
          <RevealHeading text="Campaigns that *paid *for *themselves." className="max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-tight md:text-7xl" />
        </div>
        <LayoutGroup id="filters">
          <div role="tablist" aria-label="Filter projects" className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={filter === c}
                onClick={() => setFilter(c)}
                className={`relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${filter === c ? "text-ink" : "text-fog/70 hover:text-fog"}`}
              >
                {filter === c && (
                  <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-brand" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                )}
                <span className="relative">{c}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      </div>

      <motion.div layout className="grid auto-rows-[340px] grid-flow-dense gap-4 md:auto-rows-[280px] md:grid-cols-6 md:gap-5">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <ProjectCard
              key={p.slug}
              project={p}
              index={i}
              className={filter === "All" ? SPAN[p.size] : "md:col-span-3 md:row-span-1"}
              onOpen={() => setActive(PROJECTS.indexOf(p))}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {active !== null && (
          <ProjectPreview
            key="preview"
            index={active}
            onClose={close}
            onNav={nav}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function ProjectCard({ project: p, index, className, onOpen }: { project: Project; index: number; className: string; onOpen: () => void }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: (index % 3) * 0.08, ease: EASE }}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-surface ${className}`}
    >
      <button
        type="button"
        onClick={onOpen}
        data-cursor="View"
        aria-label={`Preview project: ${p.title}`}
        className="absolute inset-0 z-20 text-left focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand"
      />
      <div className="absolute inset-0 transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.06]">
        <ProjectVisual kind={p.visual} video={p.video} poster={p.poster} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent opacity-90" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5">
        <span className="glass rounded-full px-3 py-1 text-[11px] uppercase tracking-widest text-fog/80">{p.category}</span>
        <span className="grid h-10 w-10 -translate-y-2 place-items-center rounded-full bg-brand text-ink opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={18} />
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-5 md:p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-1">
            <p className="text-xs text-mist">
              {p.client} · {p.year}
            </p>
            <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight md:text-3xl">{p.title}</h3>
            <p className="mt-2 hidden max-w-md text-sm text-fog/70 md:block md:max-h-0 md:overflow-hidden md:opacity-0 md:transition-all md:duration-500 md:group-hover:max-h-20 md:group-hover:opacity-100">
              {p.summary}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-2xl font-semibold text-brand md:text-3xl">
              {p.metrics[0].prefix}
              {p.metrics[0].value.toLocaleString("en-IN")}
              {p.metrics[0].suffix}
            </div>
            <div className="text-[11px] text-mist">{p.metrics[0].label}</div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ProjectPreview({ index, onClose, onNav }: { index: number; onClose: () => void; onNav: (d: 1 | -1) => void }) {
  const p = PROJECTS[index];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const prevFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis?.start();
      prevFocus?.focus();
    };
  }, [onClose, onNav]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 md:items-center md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      <motion.div className="absolute inset-0 bg-ink/70 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: 80, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 60, scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative z-10 flex max-h-[92svh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-surface md:rounded-3xl"
        data-lenis-prevent
      >
        <div className="relative h-56 shrink-0 md:h-72">
          <AnimatePresence mode="wait">
            <motion.div key={p.slug} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <ProjectVisual kind={p.visual} video={p.video} poster={p.poster} />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close preview"
            className="glass absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-brand hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-y-auto px-6 pb-6 md:px-10 md:pb-10"
          >
            <p className="text-xs uppercase tracking-widest text-brand">
              {p.category} · {p.year}
            </p>
            <h3 id="preview-title" className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-5xl">
              {p.title}
            </h3>
            <p className="mt-1 text-sm text-mist">{p.client}</p>
            <p className="mt-5 max-w-2xl text-fog/80 md:text-lg">{p.summary}</p>

            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
              {p.metrics.map((m) => (
                <div key={m.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <CountUp {...m} className="font-display text-3xl font-semibold text-brand" />
                  <div className="mt-1 text-xs text-mist">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="rounded-full border border-white/10 px-3 py-1 text-xs text-fog/70">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
              <Link
                href={`/work/${p.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-fog"
              >
                Read full case study <ArrowUpRight size={16} />
              </Link>
              <div className="flex gap-2">
                <button onClick={() => onNav(-1)} aria-label="Previous project" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 hover:border-brand hover:text-brand">
                  <ArrowLeft size={18} />
                </button>
                <button onClick={() => onNav(1)} aria-label="Next project" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 hover:border-brand hover:text-brand">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
