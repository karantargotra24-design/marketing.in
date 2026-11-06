"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, Fuel, Gauge, Heart, MessageCircle, MousePointerClick, ShieldCheck } from "lucide-react";
import type { VisualKind } from "../data";

/**
 * Looping, code-drawn "previews" so every project has motion even before real media exists.
 * Loops pause when the card is off-screen. Swap for real media by setting `video` in data.ts.
 */
export function ProjectVisual({ kind, video, poster }: { kind: VisualKind; video?: string; poster?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-paused={!visible} className="absolute inset-0 overflow-hidden">
      {video ? <LazyVideo src={video} poster={poster} active={visible} /> : <Art kind={kind} />}
    </div>
  );
}

function LazyVideo({ src, poster, active }: { src: string; poster?: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  useEffect(() => {
    // Attach the source the first time the card comes near the viewport.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (active) setLoad(true);
    const v = ref.current;
    if (!v) return;
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [active, load]);
  return (
    <video
      ref={ref}
      className="h-full w-full object-cover"
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      src={load ? src : undefined}
    />
  );
}

function Art({ kind }: { kind: VisualKind }) {
  switch (kind) {
    case "car":
      return <CarArt />;
    case "property":
      return <PropertyArt />;
    case "ads":
      return <AdsArt />;
    case "funnel":
      return <FunnelArt />;
    case "social":
      return <SocialArt />;
    case "brand":
      return <BrandArt />;
    case "pipeline":
      return <PipelineArt />;
  }
}

const bg = "absolute inset-0 bg-[radial-gradient(120%_90%_at_80%_0%,rgb(255_77_31/0.22),transparent_55%),radial-gradient(90%_80%_at_0%_100%,rgb(199_54_26/0.18),transparent_60%)]";

function CarArt() {
  return (
    <div className="absolute inset-0 bg-surface">
      <div className={bg} />
      {/* speed lines */}
      <div className="absolute inset-0 opacity-60">
        {[18, 34, 52, 68, 82].map((t, i) => (
          <span
            key={t}
            className="anim-drive absolute h-px w-1/3 bg-gradient-to-r from-transparent via-brand/70 to-transparent"
            style={{ top: `${t}%`, animationDelay: `${i * 0.6}s`, animationDuration: `${2.6 + i * 0.4}s` }}
          />
        ))}
      </div>
      <svg viewBox="0 0 400 160" className="absolute bottom-[18%] left-1/2 w-[78%] -translate-x-1/2" aria-hidden>
        <path
          d="M20 118 L52 118 C56 96 92 96 96 118 L282 118 C286 96 322 96 326 118 L380 118 L380 96 C380 84 368 78 352 76 L300 70 L250 40 C242 35 232 32 220 32 L130 32 C116 32 104 38 96 46 L66 74 L34 82 C24 84 20 92 20 100 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-fog/80"
        />
        <path d="M110 70 L136 44 L208 44 L208 70 Z M220 44 L244 44 L278 70 L220 70 Z" fill="currentColor" className="text-brand/25" />
        <circle cx="74" cy="120" r="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand" />
        <circle cx="304" cy="120" r="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand" />
        <line x1="0" y1="140" x2="400" y2="140" stroke="currentColor" strokeOpacity=".2" className="text-fog" />
      </svg>
      <div className="glass absolute left-5 top-16 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs">
        <Gauge size={14} className="text-brand" /> Test drive booked
      </div>
      <div className="glass absolute right-5 top-28 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs">
        <Fuel size={14} className="text-brand" /> EMI from ₹9,999
      </div>
    </div>
  );
}

function PropertyArt() {
  const heights = [62, 80, 48, 92, 70, 56];
  return (
    <div className="absolute inset-0 bg-surface">
      <div className={bg} />
      <div className="absolute inset-x-6 bottom-0 top-32 flex items-end gap-2">
        {heights.map((h, i) => (
          <div
            key={i}
            className="relative flex-1 rounded-t-md border border-white/10 bg-gradient-to-t from-white/[0.03] to-white/[0.08]"
            style={{ height: `${h}%`, minHeight: 60 }}
          >
            <div className="grid grid-cols-3 gap-1 p-2">
              {Array.from({ length: Math.round(h / 8) * 3 }).map((_, j) => (
                <span
                  key={j}
                  className={`h-1.5 rounded-[1px] ${(i + j) % 5 === 0 ? "anim-blink bg-brand" : "bg-white/10"}`}
                  style={{ animationDelay: `${(i * 7 + j) % 10 * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="glass absolute left-5 top-16 rounded-none px-4 py-3">
        <div className="text-[10px] uppercase tracking-widest text-mist">Propedia</div>
        <div className="font-display text-lg font-semibold">3 BHK · Gandhi Nagar</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-brand">
          <ShieldCheck size={12} /> Verified listing
        </div>
      </div>
    </div>
  );
}

function AdsArt() {
  return (
    <div className="absolute inset-0 bg-surface">
      <div className={bg} />
      <div className="absolute bottom-6 left-0 top-16 flex w-max gap-4 anim-slide">
        {Array.from({ length: 2 }).flatMap((_, k) =>
          ["Kaju Katli Box", "Corporate Hamper", "Diwali Mithai", "Dry Fruit Combo"].map((t, i) => (
            <div key={`${k}-${i}`} className="glass flex w-56 shrink-0 flex-col rounded-none p-3">
              <div className="flex items-center gap-2 text-[11px] text-mist">
                <span className="h-5 w-5 rounded-full bg-brand/30" /> Sponsored
              </div>
              <div className="mt-2 flex-1 rounded-none bg-gradient-to-br from-brand/30 via-brand-2/20 to-transparent" />
              <div className="mt-2 text-sm font-medium">{t}</div>
              <div className="mt-2 flex items-center justify-between rounded-lg bg-brand px-2 py-1.5 text-xs font-semibold text-ink">
                Order on WhatsApp <MousePointerClick size={12} />
              </div>
            </div>
          )),
        )}
      </div>
    </div>
  );
}

function FunnelArt() {
  const rows = [
    { w: "100%", l: "Reach" },
    { w: "72%", l: "Clicks" },
    { w: "46%", l: "Leads" },
    { w: "28%", l: "Bookings" },
  ];
  return (
    <div className="absolute inset-0 bg-surface">
      <div className={bg} />
      <div className="absolute inset-6 flex flex-col justify-center gap-2.5">
        {rows.map((r, i) => (
          <div key={r.l} className="relative mx-auto flex h-9 items-center justify-center rounded-lg text-xs font-medium" style={{ width: r.w }}>
            <span
              className="anim-blink absolute inset-0 rounded-lg bg-gradient-to-r from-brand/40 to-brand-2/30"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
            <span className="relative">{r.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialArt() {
  return (
    <div className="absolute inset-0 bg-surface">
      <div className={bg} />
      <div className="absolute inset-0 flex items-center justify-center gap-3">
        {[0, 1].map((p) => (
          <div
            key={p}
            className={`glass relative h-[78%] w-[34%] overflow-hidden rounded-[1.4rem] p-1.5 ${p === 1 ? "float-mid mt-10" : "float-slow"}`}
          >
            <div className="grid h-full grid-cols-3 gap-0.5 overflow-hidden rounded-[1rem]">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="anim-blink bg-gradient-to-br from-brand/40 to-brand-2/10"
                  style={{ animationDelay: `${(i * 0.37 + p) % 3}s`, opacity: 0.5 + ((i * 13) % 5) / 10 }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="glass absolute bottom-4 left-4 flex items-center gap-3 rounded-full px-3 py-1.5 text-xs">
        <Heart size={12} className="text-brand" /> 12.4k <MessageCircle size={12} /> 318 <Bookmark size={12} /> 2.1k
      </div>
    </div>
  );
}

function BrandArt() {
  return (
    <div className="absolute inset-0 bg-surface">
      <div className={bg} />
      <div className="absolute inset-0 flex items-center">
        <div className="anim-slide flex w-max whitespace-nowrap font-display text-[5.5rem] font-semibold leading-none tracking-tight md:text-[7rem]">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex gap-10 pr-10">
              <span className="text-fog/90">Crafted</span>
              <span className="text-gradient">for Jammu</span>
              <span className="text-transparent [-webkit-text-stroke:1px_rgb(243_241_236/0.4)]">homes</span>
            </span>
          ))}
        </div>
      </div>
      <div className="absolute bottom-5 left-5 flex gap-2">
        {["#FF4D1F", "#C7361A", "#F3F1EC", "#141312"].map((c) => (
          <span key={c} className="h-6 w-6 rounded-full border border-white/20" style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

function PipelineArt() {
  const nodes = ["Memory", "Research", "Strategy", "Carousels", "Canva", "Schedule"];
  return (
    <div className="@container absolute inset-0 bg-surface">
      <div className={bg} />
      <div className="absolute inset-x-5 top-1/2 flex -translate-y-1/2 items-center justify-between">
        <span className="absolute inset-x-4 top-1/2 h-px bg-white/15" />
        <span className="anim-drive absolute top-1/2 h-px w-1/4 -translate-y-1/2 bg-gradient-to-r from-transparent via-brand to-transparent" />
        {nodes.map((n, i) => (
          <span key={n} className="relative flex flex-col items-center gap-2">
            <span
              className={`anim-blink grid h-8 w-8 place-items-center border font-mono text-[10px] ${i === 0 ? "border-brand bg-brand text-ink" : "border-white/20 bg-ink text-fog/80"}`}
              style={{ animationDelay: `${i * 0.35}s` }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.15em] text-mist @lg:block">{n}</span>
          </span>
        ))}
      </div>
      <div className="glass absolute left-5 top-16 hidden px-3 py-1.5 @md:block font-mono text-[10px] uppercase tracking-[0.2em] text-fog/80">Run my weekly content system</div>
      <div className="absolute right-5 top-5 hidden gap-2 @lg:flex font-mono text-[10px] uppercase text-mist">
        <span className="border border-white/15 px-2 py-1">2 × Carousel</span>
        <span className="border border-white/15 px-2 py-1">2 × Static</span>
      </div>
    </div>
  );
}
