import { Hero } from "@/portfolio/components/Hero";
import { Services } from "@/portfolio/components/Services";
import { Marquee, Stats } from "@/portfolio/components/Sections";
import { Frames, Ledger, Manifesto, ProcessStrip } from "@/portfolio/components/Personal";
import { Contact } from "@/portfolio/components/Contact";

/** Single-page personal portfolio. All content lives in src/portfolio/data.ts and brand.ts. */
export default function Home() {
  return (
    <main className="relative z-[1]">
      <Hero />
      <Marquee />
      <Manifesto />
      <Stats />
      <Ledger />
      <Frames />
      <Services />
      <ProcessStrip />
      <Contact />
    </main>
  );
}
