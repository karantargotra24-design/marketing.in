import { Hero } from "@/portfolio/components/Hero";
import { Work } from "@/portfolio/components/Work";
import { Services } from "@/portfolio/components/Services";
import { About, Marquee, Process, Stats } from "@/portfolio/components/Sections";
import { Contact } from "@/portfolio/components/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <Marquee />
      <Work />
      <About />
      <Stats />
      <Services />
      <Process />
      <Contact />
    </main>
  );
}
