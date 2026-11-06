"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fades + lifts every child marked data-reveal as the block scrolls into view (GSAP ScrollTrigger). */
export function Reveal({ children, className = "", stagger = 0.08, as: Tag = "div", id }: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "section" | "ul";
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const ctx = gsap.context(() => {
      const items = el.querySelectorAll("[data-reveal]");
      gsap.from(items, {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger,
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [stagger]);
  return (
    <Tag ref={ref as never} className={className} id={id}>
      {children}
    </Tag>
  );
}

/** Headline whose words slide up from a mask when scrolled into view. Prefix a word with * to colour it in the accent. */
export function RevealHeading({ text, className = "", as: Tag = "h2" }: { text: string; className?: string; as?: "h1" | "h2" | "h3" }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll("[data-word]"), {
        yPercent: 110,
        rotate: 4,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <Tag ref={ref} className={className} aria-label={text.replace(/\*/g, "")}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-bottom" aria-hidden>
          <span data-word className={`inline-block will-change-transform ${w.startsWith("*") ? "text-brand" : ""}`}>
            {w.replace(/^\*/, "")}
            {" "}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** Paragraph whose words light up one by one, scrubbed to scroll position. */
export function ScrubText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-w]"),
        { opacity: 0.15 },
        { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } },
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <p ref={ref} className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} data-w className={w.startsWith("*") ? "text-brand" : undefined}>
          {w.replace(/^\*/, "")}{" "}
        </span>
      ))}
    </p>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-brand">
      <span className="h-px w-8 bg-brand" />
      {children}
    </div>
  );
}
