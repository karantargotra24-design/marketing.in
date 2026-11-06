"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { PERSON, PROCESS, PROJECTS, type Project } from "../data";
import { whatsappLink } from "../brand";
import { CountUp } from "./CountUp";
import { ProjectVisual } from "./ProjectVisual";
import { Eyebrow, RevealHeading } from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const desktop = () => window.matchMedia("(min-width: 768px)").matches;

/** Splits "*word" markers into accent-coloured words. */
function Accent({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className={w.startsWith("*") ? "text-brand" : undefined}>
          {w.replace(/^\*/, "")}{" "}
        </span>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Manifesto: statements revealed by a hard clip in 4 steps, no fades  */
/* ------------------------------------------------------------------ */
export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="about" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 md:px-8 md:py-36">
      <Eyebrow>About</Eyebrow>
      <div ref={ref} className="space-y-1">
        {PERSON.manifesto.map((line, i) => (
          <p
            key={line}
            className="font-display text-5xl leading-[0.95] md:text-[5.5rem]"
            style={{
              clipPath: on ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
              transition: `clip-path 400ms steps(4) ${i * 160}ms`,
            }}
          >
            <Accent text={line} />
          </p>
        ))}
      </div>
      <div className="mt-14 grid gap-8 md:grid-cols-12">
        {PERSON.about.map((p, i) => (
          <p key={i} className={`text-base leading-relaxed text-fog/80 md:text-lg ${i === 0 ? "md:col-span-5" : "md:col-span-5 md:col-start-7"}`}>
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Work ledger: stamped index, hover cuts the visual in, click expands */
/* ------------------------------------------------------------------ */
export function Ledger() {
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="work" className="relative scroll-mt-24 overflow-hidden py-24 md:py-36">
      {/* Hovered project's visual, cut in instantly behind the table */}
      {hover !== null && open === null && (
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden opacity-30 mix-blend-luminosity md:block">
          <ProjectVisual kind={PROJECTS[hover].visual} video={PROJECTS[hover].video} poster={PROJECTS[hover].poster} />
        </div>
      )}
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <Eyebrow>Selected work</Eyebrow>
        <RevealHeading text="Campaigns that *paid *for *themselves." className="max-w-4xl font-display text-5xl leading-[0.95] md:text-8xl" />

        <div className="mt-14 border-t border-white/15" role="list">
          <div className="hidden grid-cols-12 gap-4 border-b border-white/15 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-mist md:grid">
            <span className="col-span-1">No.</span>
            <span className="col-span-4">Project</span>
            <span className="col-span-3">Client</span>
            <span className="col-span-1">Year</span>
            <span className="col-span-3 text-right">Result</span>
          </div>
          {PROJECTS.map((p, i) => (
            <div key={p.slug} role="listitem" className="border-b border-white/15">
              <button
                type="button"
                aria-expanded={open === i}
                aria-controls={`case-${p.slug}`}
                onClick={() => setOpen(open === i ? null : i)}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                data-cursor={open === i ? "Close" : "Open"}
                className={`grid w-full grid-cols-[1fr_auto] items-center gap-4 py-5 text-left md:grid-cols-12 md:py-0 md:min-h-16 ${
                  hover === i || open === i ? "bg-fog text-ink" : ""
                } focus-visible:outline-2 focus-visible:outline-brand`}
              >
                <span className="hidden pl-2 font-mono text-xs md:col-span-1 md:block">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-2xl leading-none md:col-span-4 md:text-3xl">{p.title}</span>
                <span className={`hidden text-sm md:col-span-3 md:block ${hover === i || open === i ? "text-ink/70" : "text-mist"}`}>{p.client}</span>
                <span className="font-mono text-xs md:col-span-1">{p.year}</span>
                <span className="hidden items-center justify-end gap-3 pr-2 md:col-span-3 md:flex">
                  <span className={`font-display text-2xl ${hover === i || open === i ? "text-ink" : "text-brand"}`}>
                    {p.metrics[0].prefix}
                    {p.metrics[0].value.toLocaleString("en-IN")}
                    {p.metrics[0].suffix}
                  </span>
                  <Plus size={18} className={`transition-transform duration-300 ${open === i ? "rotate-45" : ""}`} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && <CaseStudy key={p.slug} project={p} />}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudy({ project: p }: { project: Project }) {
  return (
    <motion.div
      id={`case-${p.slug}`}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="grid gap-10 py-10 md:grid-cols-12">
        <div className="relative h-64 overflow-hidden border border-white/10 md:col-span-5 md:h-auto md:min-h-80">
          <ProjectVisual kind={p.visual} video={p.video} poster={p.poster} />
          <span className="absolute left-4 top-4 bg-brand px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink">{p.category}</span>
        </div>
        <div className="md:col-span-7">
          <p className="text-lg text-fog/85">{p.summary}</p>
          <div className="mt-6 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
            {p.metrics.map((m) => (
              <div key={m.label} className="bg-ink p-4">
                <CountUp {...m} className="font-display text-4xl text-brand" />
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-mist">{m.label}</p>
              </div>
            ))}
          </div>
          <dl className="mt-8 space-y-6">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand">Challenge</dt>
              <dd className="mt-2 text-fog/85">{p.challenge}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand">Strategy & execution</dt>
              <dd className="mt-2">
                <ul className="space-y-2">
                  {[...p.strategy, ...p.execution].map((s) => (
                    <li key={s} className="flex gap-3 text-fog/85">
                      <Check size={16} className="mt-1 shrink-0 text-brand" /> {s}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand">Outcome</dt>
              <dd className="mt-2 text-fog/85">{p.outcome}</dd>
            </div>
          </dl>
          <a
            href={whatsappLink(`Hi Karan, I saw "${p.title}" on your portfolio. I'd like something similar.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 bg-brand px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-fog"
          >
            Get results like this <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Frames: pinned section where project frames slam in at scroll steps */
/* ------------------------------------------------------------------ */
const SLOTS = [
  "md:left-0 md:top-0 md:w-[40%] md:h-[46%]",
  "md:left-[43%] md:top-[6%] md:w-[27%] md:h-[36%]",
  "md:left-[73%] md:top-0 md:w-[27%] md:h-[50%]",
  "md:left-[5%] md:top-[52%] md:w-[30%] md:h-[46%]",
  "md:left-[38%] md:top-[47%] md:w-[33%] md:h-[53%]",
  "md:left-[74%] md:top-[56%] md:w-[26%] md:h-[44%]",
];

const FRAMED = PROJECTS.slice(0, SLOTS.length);

export function Frames() {
  const ref = useRef<HTMLElement>(null);
  const [count, setCount] = useState(FRAMED.length);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !desktop()) return;
    setCount(0);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "+=180%",
      pin: true,
      onUpdate: (self) => setCount(Math.min(FRAMED.length, Math.floor(self.progress * (FRAMED.length + 0.6)))),
    });
    return () => st.kill();
  }, []);

  return (
    <section ref={ref} aria-label="Project frames" className="relative bg-ink md:h-screen">
      <div className="mx-auto flex h-full max-w-7xl flex-col px-5 py-16 md:px-8 md:py-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-4xl md:text-6xl">
            In <span className="text-brand">frames.</span>
          </h2>
          <span className="font-mono text-xs text-mist" aria-hidden>
            {String(count).padStart(2, "0")} / {String(FRAMED.length).padStart(2, "0")}
          </span>
        </div>
        <div className="relative grid flex-1 grid-cols-2 gap-3 md:block">
          {FRAMED.map((p, i) => (
            <figure
              key={p.slug}
              className={`relative h-48 overflow-hidden border border-white/10 md:absolute ${SLOTS[i]} ${i < count ? "slam" : "md:invisible"}`}
            >
              <ProjectVisual kind={p.visual} video={p.video} poster={p.poster} />
              <span className="absolute left-3 top-3 font-display text-3xl text-brand">{String(i + 1).padStart(2, "0")}</span>
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent p-3 pt-8 font-mono text-[10px] uppercase tracking-[0.15em]">
                {p.title} · {p.metrics[0].prefix}
                {p.metrics[0].value.toLocaleString("en-IN")}
                {p.metrics[0].suffix} {p.metrics[0].label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Process: horizontal strip of paper panels, scrubbed by scroll       */
/* ------------------------------------------------------------------ */
export function ProcessStrip() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const tr = track.current;
    if (!el || !tr || reduced() || !desktop()) return;
    const ctx = gsap.context(() => {
      gsap.to(tr, {
        x: () => -(tr.scrollWidth - window.innerWidth + 64),
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: () => `+=${tr.scrollWidth}`, pin: true, scrub: true, invalidateOnRefresh: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="process" className="relative scroll-mt-24 overflow-hidden py-24 md:flex md:h-screen md:flex-col md:justify-center md:py-0">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <Eyebrow>How I work</Eyebrow>
        <h2 className="font-display text-5xl leading-[0.95] md:text-7xl">
          First call to <span className="text-brand">first lead in 7 days.</span>
        </h2>
      </div>
      <div ref={track} className="mt-12 flex flex-col gap-4 px-5 md:w-max md:flex-row md:gap-6 md:px-8 md:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {PROCESS.map((s) => (
          <article key={s.step} className="relative flex min-h-64 flex-col justify-between bg-fog p-6 text-ink md:h-[52vh] md:w-[30rem] md:p-8">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink/60">Step {s.step}</span>
            <div>
              <h3 className="font-display text-5xl md:text-7xl">{s.title}</h3>
              <p className="mt-3 max-w-sm text-ink/75">{s.text}</p>
            </div>
            <span
              aria-hidden
              className="absolute right-5 top-5 rotate-[-8deg] border-2 border-brand px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand"
            >
              {s.step === "04" ? "Scaling" : "Approved"}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Grid overlay: the exposed 12-column grid. Press G to toggle.        */
/* ------------------------------------------------------------------ */
export function GridOverlay() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "g" || e.key === "G") setShow((s) => !s);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  if (!show) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-4 px-5 md:grid-cols-12 md:px-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} data-gridline className={`border-l border-white/[0.045] ${i === 11 ? "border-r" : ""} ${i >= 4 ? "hidden md:block" : ""}`} />
        ))}
      </div>
    </div>
  );
}
