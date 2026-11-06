"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, ArrowUpRight, BadgeIndianRupee, BellRing, TrendingUp } from "lucide-react";
import { BRAND } from "../brand";
import { MagneticButton } from "./Magnetic";
import { CursorChips } from "./CursorChips";

const ROTATING = ["leads.", "sales.", "footfall.", "growth."];
const EASE = [0.16, 1, 0.3, 1] as const;

function SplitLine({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={`block overflow-hidden pb-[0.08em] ${className}`} aria-hidden>
      {text.split(" ").map((word, w, words) => {
        // Letters are grouped per word so a line can only wrap between words.
        const start = words.slice(0, w).join(" ").length + (w ? 1 : 0);
        return (
          <span key={w} className="inline-block whitespace-nowrap">
            {word.split("").map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block will-change-transform"
                initial={{ y: "110%", rotate: 8 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ delay: delay + (start + i) * 0.028, duration: 0.9, ease: EASE }}
              >
                {ch}
              </motion.span>
            ))}
            {w < words.length - 1 && "\u00A0"}
          </span>
        );
      })}
    </span>
  );
}

function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % ROTATING.length), 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={ROTATING[i]}
          initial={{ y: "100%", opacity: 0, filter: "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="inline-block pb-[0.08em] text-brand"
        >
          {ROTATING[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function FloatingCard({
  children,
  className,
  depth,
  mx,
  my,
  delay,
}: {
  children: React.ReactNode;
  className: string;
  depth: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  delay: number;
}) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  return (
    <motion.div
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 1, ease: EASE }}
      className={`pointer-events-none absolute hidden lg:block ${className}`}
      aria-hidden
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(8px)"]);

  const mxRaw = useMotionValue(0);
  const myRaw = useMotionValue(0);
  const mx = useSpring(mxRaw, { stiffness: 60, damping: 20 });
  const my = useSpring(myRaw, { stiffness: 60, damping: 20 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    mxRaw.set((e.clientX / window.innerWidth - 0.5) * 40);
    myRaw.set((e.clientY / window.innerHeight - 0.5) * 40);
  };

  return (
    <section ref={ref} onPointerMove={onMove} className="grain relative flex min-h-[100svh] items-center overflow-hidden pt-28">
      {/* Opening curtain */}
      <motion.div
        aria-hidden
        className="fixed inset-0 z-[60] origin-top bg-brand"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
      />

      {/* Dynamic gradient background */}
      <div aria-hidden className="absolute inset-0 -z-0">
        <div className="blob blob-a left-[8%] top-[12%] h-[42vw] w-[42vw] max-h-[620px] max-w-[620px] bg-brand/15" />
        <div className="blob blob-b right-[2%] top-[30%] h-[36vw] w-[36vw] max-h-[540px] max-w-[540px] bg-brand-2/20" />
        <div className="grid-lines absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>
      <CursorChips />

      <motion.div style={{ scale, opacity, filter: blur }} className="relative z-10 mx-auto w-full max-w-7xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
          className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-fog/80 md:text-xs"
        >
          <span className="relative flex h-2 w-2">
            <span className="anim-pulse absolute inline-flex h-full w-full rounded-full bg-brand" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          Taking 3 new growth partners this quarter · {BRAND.city}
        </motion.div>

        <h1 className="font-display text-[16vw] leading-[0.9] sm:text-[12vw] lg:text-[10.5rem]">
          <span className="sr-only">We turn attention into leads, sales, footfall and growth.</span>
          <SplitLine text="We turn" delay={0.8} />
          <SplitLine text="attention into" delay={0.95} />
          <motion.span
            aria-hidden
            className="block"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.35, duration: 0.9, ease: EASE }}
          >
            <RotatingWord />
          </motion.span>
        </h1>

        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-[1.1fr_1fr] md:items-end">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.9, ease: EASE }}
            className="max-w-xl text-base leading-relaxed text-mist md:text-lg"
          >
            I&apos;m <span className="text-fog">{BRAND.person}</span>, founder of {BRAND.name}. I build Meta Ads, lead-gen and WhatsApp
            funnels for car dealerships, real estate and local brands that care about one number: <span className="text-fog">revenue</span>.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.65, duration: 0.9, ease: EASE }}
            className="flex flex-wrap gap-3 md:justify-end"
          >
            <MagneticButton href="/#work">
              View My Work <ArrowDown size={18} className="transition-transform duration-300 group-hover:translate-y-0.5" />
            </MagneticButton>
            <MagneticButton href="/#contact" variant="ghost">
              Let&apos;s Connect <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-45" />
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating design elements */}
      <FloatingCard mx={mx} my={my} depth={0.9} delay={1.8} className="right-[6%] top-[18%]">
        <div className="glass float-slow w-56 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-mist">
            <TrendingUp size={14} className="text-brand" /> ROAS · last 30 days
          </div>
          <div className="mt-2 font-display text-3xl font-semibold">5.4x</div>
          <div className="mt-3 flex h-10 items-end gap-1">
            {[30, 45, 38, 60, 52, 74, 68, 90].map((h, i) => (
              <span key={i} className="anim-rise flex-1 rounded-sm bg-brand/70" style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </FloatingCard>
      <FloatingCard mx={mx} my={my} depth={-1.3} delay={2} className="right-[24%] bottom-[16%]">
        <div className="glass float-mid flex items-center gap-3 rounded-2xl px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/15 text-brand">
            <BellRing size={16} />
          </span>
          <div>
            <div className="text-sm font-medium">New lead · SUV enquiry</div>
            <div className="text-xs text-mist">via Meta Lead Form · just now</div>
          </div>
        </div>
      </FloatingCard>
      <FloatingCard mx={mx} my={my} depth={0.6} delay={2.2} className="right-[4%] bottom-[30%]">
        <div className="glass float-slow flex items-center gap-2 rounded-full px-4 py-2 text-sm" style={{ animationDelay: "1.2s" }}>
          <BadgeIndianRupee size={16} className="text-brand" /> CPL ₹184
        </div>
      </FloatingCard>

      <motion.a
        href="#work"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-mist md:flex"
      >
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-white/15">
          <motion.span
            className="absolute left-0 top-0 h-4 w-px bg-brand"
            animate={{ y: [-16, 40] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
}
