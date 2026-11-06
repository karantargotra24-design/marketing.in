"use client";

import { useState } from "react";
import { ArrowUpRight, Mail, MapPin, MessageCircle } from "lucide-react";
import { BRAND, whatsappLink } from "../brand";
import { MagneticButton } from "./Magnetic";
import { Eyebrow, RevealHeading } from "./Reveal";

const BUDGETS = ["Under ₹25k/mo", "₹25k–₹1L/mo", "₹1L–₹5L/mo", "₹5L+/mo"];
const NEEDS = ["Meta Ads", "Lead Generation", "Social Media", "Branding", "WhatsApp Marketing", "Full growth plan"];

/** No backend needed: the form builds a pre-filled WhatsApp message (best channel for Indian SMB leads). */
export function Contact() {
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [need, setNeed] = useState(NEEDS[0]);
  const [budget, setBudget] = useState(BUDGETS[1]);

  const message = `Hi Karan, I'm ${name || "[name]"} from ${business || "[business]"}. I need help with ${need}. Monthly budget: ${budget}.`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  };

  const chip = (on: boolean) =>
    `rounded-sm border px-4 py-2 text-sm transition-colors ${on ? "border-brand bg-brand text-ink" : "border-white/15 text-fog/70 hover:border-white/40"}`;

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden py-24 md:py-36">
      <div aria-hidden className="blob blob-a left-[-10%] top-[10%] h-[40vw] w-[40vw] bg-brand/15" />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Eyebrow>Let&apos;s connect</Eyebrow>
          <RevealHeading text="Ready for leads that *actually *convert?" className="font-display text-5xl font-semibold leading-[0.98] tracking-tight md:text-7xl" />
          <p className="mt-6 max-w-md text-mist md:text-lg">
            Free 20-minute audit call. I&apos;ll look at your ads, funnel and follow-up, and tell you honestly what to fix first.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <MagneticButton href={whatsappLink()} external>
              <MessageCircle size={18} /> WhatsApp me
            </MagneticButton>
            <MagneticButton href={`mailto:${BRAND.email}`} variant="ghost" external>
              <Mail size={18} /> {BRAND.email}
            </MagneticButton>
          </div>
          <p className="mt-8 flex items-center gap-2 text-sm text-mist">
            <MapPin size={16} className="text-brand" /> Based in {BRAND.city} · Working with brands across India
          </p>
        </div>

        <form onSubmit={submit} className="glass rounded-none p-6 md:p-8" aria-label="Project enquiry">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-mist">Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="mt-2 w-full border-b border-white/15 bg-transparent py-2 text-lg outline-none transition-colors focus:border-brand"
                placeholder="Rohit Sharma"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-mist">Business</span>
              <input
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                required
                autoComplete="organization"
                className="mt-2 w-full border-b border-white/15 bg-transparent py-2 text-lg outline-none transition-colors focus:border-brand"
                placeholder="Sharma Motors"
              />
            </label>
          </div>

          <fieldset className="mt-8">
            <legend className="text-xs uppercase tracking-widest text-mist">I need help with</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {NEEDS.map((n) => (
                <button type="button" key={n} aria-pressed={need === n} onClick={() => setNeed(n)} className={chip(need === n)}>
                  {n}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-8">
            <legend className="text-xs uppercase tracking-widest text-mist">Monthly ad budget</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <button type="button" key={b} aria-pressed={budget === b} onClick={() => setBudget(b)} className={chip(budget === b)}>
                  {b}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="group mt-10 flex w-full items-center justify-between rounded-sm bg-brand py-4 pl-7 pr-3 font-semibold text-ink transition-colors hover:bg-fog"
          >
            Send on WhatsApp
            <span className="grid h-10 w-10 place-items-center bg-ink text-brand transition-transform duration-500 ease-out-expo group-hover:rotate-45">
              <ArrowUpRight size={18} />
            </span>
          </button>
          <p className="mt-3 text-center text-xs text-mist">Reply within 2 working hours · Mon–Sat</p>
        </form>
      </div>
    </section>
  );
}
