"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BRAND, whatsappLink } from "../brand";

const LINKS = [
  { href: "/#work", label: "Work" },
  { href: "/#services", label: "Services" },
  { href: "/#process", label: "Process" },
  { href: "/#contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(v > prev && v > 240 && !open);
    setScrolled(v > 24);
  });

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8"
      >
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 md:px-6 ${
            scrolled ? "glass shadow-[0_8px_40px_rgb(0_0_0/0.35)]" : "border border-transparent"
          }`}
        >
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight" aria-label={`${BRAND.name} home`}>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-black text-ink">S</span>
            <span>
              Scape<span className="text-brand">Media</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="group relative block overflow-hidden rounded-full px-4 py-2 text-sm text-fog/80 hover:text-fog">
                  <span className="block transition-transform duration-300 ease-out-expo group-hover:-translate-y-full">{l.label}</span>
                  <span className="absolute inset-x-4 top-2 block translate-y-[200%] text-brand transition-transform duration-300 ease-out-expo group-hover:translate-y-0">
                    {l.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full bg-fog px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-brand md:inline-flex"
          >
            Let&apos;s talk <ArrowUpRight size={16} />
          </a>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "circle(0% at 92% 6%)" }}
            animate={{ clipPath: "circle(150% at 92% 6%)" }}
            exit={{ clipPath: "circle(0% at 92% 6%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-surface px-6 pb-10 pt-28 md:hidden"
          >
            <ul className="space-y-2">
              {LINKS.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "110%" }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link href={l.href} onClick={() => setOpen(false)} className="flex items-baseline gap-3 font-display text-5xl font-semibold">
                      <span className="text-sm text-brand">0{i + 1}</span>
                      {l.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.45 } }} exit={{ opacity: 0 }} className="space-y-3 text-mist">
              <a href={whatsappLink()} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 font-semibold text-ink">
                WhatsApp me <ArrowUpRight size={18} />
              </a>
              <p className="text-center text-sm">
                {BRAND.email} · {BRAND.city}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
