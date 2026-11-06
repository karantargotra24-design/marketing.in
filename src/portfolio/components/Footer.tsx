import Link from "next/link";
import { BRAND, whatsappLink } from "../brand";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-white/5 px-5 pb-8 pt-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-2xl font-semibold">
              Scape<span className="text-brand">Media</span>
            </p>
            <p className="mt-3 max-w-sm text-sm text-mist">
              Performance marketing, lead generation and brand growth for businesses in J&amp;K and across India.
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="text-xs uppercase tracking-widest text-mist">Explore</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/#work" className="hover:text-brand">Work</Link></li>
              <li><Link href="/#services" className="hover:text-brand">Services</Link></li>
              <li><Link href="/#process" className="hover:text-brand">Process</Link></li>
              <li><Link href="/#contact" className="hover:text-brand">Contact</Link></li>
            </ul>
          </nav>
          <div>
            <p className="text-xs uppercase tracking-widest text-mist">Say hello</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-brand">WhatsApp</a></li>
              <li><a href={`mailto:${BRAND.email}`} className="hover:text-brand">{BRAND.email}</a></li>
              <li><a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-brand">Instagram</a></li>
              <li><a href={BRAND.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-brand">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <p
          aria-hidden
          className="pointer-events-none mt-16 select-none text-center font-display text-[18vw] font-bold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgb(238_242_240/0.12)]"
        >
          ScapeMedia
        </p>
        <div className="mt-6 flex flex-col justify-between gap-2 text-xs text-mist md:flex-row">
          <p>© {year} {BRAND.name} · {BRAND.person}</p>
          <p>Made in Jammu with care.</p>
        </div>
      </div>
    </footer>
  );
}
