import { BRAND, whatsappLink } from "../brand";

const NAME = `${BRAND.person} · `;

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-[1] overflow-hidden border-t border-white/10 pb-8 pt-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-12 md:px-8">
        <div className="md:col-span-6">
          <p className="font-display text-3xl">
            Karan<span className="text-brand">.</span>
          </p>
          <p className="mt-3 max-w-sm text-sm text-mist">
            Performance marketer and founder of {BRAND.name}. Meta Ads, lead generation and growth systems for brands in J&amp;K and across India.
          </p>
        </div>
        <nav aria-label="Footer" className="md:col-span-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            {["work", "about", "services", "process", "contact"].map((id) => (
              <li key={id}>
                <a href={`#${id}`} className="capitalize hover:text-brand">
                  {id}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist">Say hello</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-brand">WhatsApp</a></li>
            <li><a href={`mailto:${BRAND.email}`} className="hover:text-brand">{BRAND.email}</a></li>
            <li><a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-brand">Instagram</a></li>
            <li><a href={BRAND.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-brand">LinkedIn</a></li>
          </ul>
        </div>
      </div>

      {/* Outlined name running as a slow marquee */}
      <div aria-hidden className="mt-16 overflow-hidden">
        <div className="marquee-slow flex w-max whitespace-nowrap font-display text-[22vw] leading-[0.85] text-transparent [-webkit-text-stroke:1px_rgb(243_241_236/0.16)] md:text-[16vw]">
          <span className="pr-[0.3em]">{NAME.repeat(2)}</span>
          <span className="pr-[0.3em]">{NAME.repeat(2)}</span>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-7xl flex-col justify-between gap-2 px-5 font-mono text-[10px] uppercase tracking-[0.2em] text-mist md:flex-row md:px-8">
        <p>© {year} {BRAND.person} · {BRAND.name}</p>
        <p>Press G to toggle the grid</p>
      </div>
    </footer>
  );
}
