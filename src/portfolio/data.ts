/**
 * Portfolio content. Edit text here, not inside components.
 *
 * IMPORTANT: every number and client description below is SAMPLE content to show the layout.
 * Replace it with your real, client-approved results before you publish the site.
 * Showing invented results to prospects is a trust (and legal) risk.
 */

export type VisualKind = "ads" | "car" | "property" | "funnel" | "social" | "brand";
export type TileSize = "lg" | "wide" | "tall" | "sm";

export type Metric = { value: number; prefix?: string; suffix?: string; label: string; decimals?: number };

export type Project = {
  slug: string;
  title: string;
  client: string;
  category: string;
  year: string;
  summary: string;
  tags: string[];
  size: TileSize;
  visual: VisualKind;
  /** Optional silent loop, e.g. "/work/propedia.mp4" in /public. Loaded only when visible. */
  video?: string;
  poster?: string;
  metrics: Metric[];
  challenge: string;
  strategy: string[];
  execution: string[];
  outcome: string;
};

export const CATEGORIES = ["All", "Meta Ads", "Automotive", "Real Estate", "Lead Gen", "Social", "Brand"] as const;

export const PROJECTS: Project[] = [
  {
    slug: "showroom-footfall-engine",
    title: "Showroom Footfall Engine",
    client: "Multi-brand car dealership, Jammu",
    category: "Automotive",
    year: "2026",
    summary: "Meta lead forms + WhatsApp follow-up that turned scrollers into booked test drives.",
    tags: ["Meta Ads", "Lead Forms", "WhatsApp", "CRM"],
    size: "lg",
    visual: "car",
    metrics: [
      { value: 412, label: "Qualified leads / month" },
      { value: 184, prefix: "₹", label: "Cost per lead" },
      { value: 3.1, suffix: "x", decimals: 1, label: "Test drives vs. before" },
    ],
    challenge:
      "Leads were cheap but cold. Sales called people who did not remember filling a form, and showroom visits stayed flat.",
    strategy: [
      "Model-wise campaigns (hatchback, SUV, EV) with on-road price hooks in ₹ and EMI angles.",
      "Higher-intent lead forms: model, budget, exchange car, preferred visit day.",
      "Instant WhatsApp confirmation with brochure and test-drive slot within 2 minutes.",
    ],
    execution: [
      "12 reel creatives shot at the showroom: walkarounds, delivery moments, festive offers.",
      "Retargeting of video viewers and website visitors with offer-led carousels.",
      "Weekly lead-quality loop with the sales team to cut junk forms.",
    ],
    outcome:
      "Lead quality rose fast enough that the dealership moved budget from print to Meta and asked for a service-department campaign.",
  },
  {
    slug: "propedia",
    title: "Propedia",
    client: "Real estate discovery brand",
    category: "Real Estate",
    year: "2026",
    summary: "Positioning, content and a lead funnel for a property platform built for J&K buyers.",
    tags: ["Brand", "Real Estate", "Funnels", "Content"],
    size: "tall",
    visual: "property",
    metrics: [
      { value: 2600, suffix: "+", label: "Buyer enquiries" },
      { value: 38, suffix: "%", label: "Site-visit rate" },
      { value: 11, label: "Projects listed" },
    ],
    challenge:
      "Property buyers in the region relied on brokers and word of mouth. A new platform had to earn trust before it could earn leads.",
    strategy: [
      "Position Propedia as the honest guide: verified listings, clear pricing, local expertise.",
      "Content pillars: locality guides, price explainers, site-visit vlogs, buyer FAQs.",
      "Lead funnel by budget band, with project-specific landing pages.",
    ],
    execution: [
      "Visual identity system and social templates in the brand palette.",
      "Meta + Google search campaigns per locality and budget.",
      "WhatsApp nurture: floor plans, payment plans and site-visit booking.",
    ],
    outcome: "Propedia became a recognised name in its niche and builders now approach it to list projects.",
  },
  {
    slug: "festive-roas-sprint",
    title: "Festive ROAS Sprint",
    client: "Local sweets & gifting brand",
    category: "Meta Ads",
    year: "2025",
    summary: "A 21-day Diwali push across catalogue ads, reels and WhatsApp ordering.",
    tags: ["Meta Ads", "Catalogue", "Reels", "Festive"],
    size: "wide",
    visual: "ads",
    metrics: [
      { value: 5.4, suffix: "x", decimals: 1, label: "ROAS" },
      { value: 1900, suffix: "+", label: "Gift-box orders" },
      { value: 62, suffix: "%", label: "Repeat buyers" },
    ],
    challenge: "Most festive orders came in the last 4 days, leaving the kitchen overloaded and ads expensive.",
    strategy: [
      "Early-bird corporate gifting offer to pull demand forward.",
      "Catalogue ads by box size and budget (₹499 to ₹4,999).",
      "Retarget past buyers with 'same box as last year' reminders.",
    ],
    execution: [
      "Short reels: packing process, box reveals, family gifting moments.",
      "Click-to-WhatsApp ads with a quick-order menu.",
      "Daily budget shifts based on stock and kitchen capacity.",
    ],
    outcome: "Orders spread across three weeks, so the kitchen could deliver on time and ad costs stayed under control.",
  },
  {
    slug: "clinic-lead-machine",
    title: "Clinic Lead Machine",
    client: "Dental & skin clinic chain",
    category: "Lead Gen",
    year: "2025",
    summary: "Appointment-first funnel with instant booking and no-show reminders.",
    tags: ["Lead Gen", "Google Ads", "Automation"],
    size: "sm",
    visual: "funnel",
    metrics: [
      { value: 96, prefix: "₹", label: "Cost per booking" },
      { value: 47, suffix: "%", label: "Fewer no-shows" },
    ],
    challenge: "High enquiry volume, low show-up rate. Front desk could not call everyone back in time.",
    strategy: [
      "Treatment-specific offers with transparent starting prices.",
      "Booking calendar inside the lead flow, not after it.",
    ],
    execution: [
      "Automated WhatsApp reminders 24h and 2h before the slot.",
      "Google Search for high-intent treatment keywords by area.",
    ],
    outcome: "The front desk now spends time with patients, not chasing leads.",
  },
  {
    slug: "creative-system",
    title: "Always-On Creative System",
    client: "Café & lifestyle brand",
    category: "Social",
    year: "2025",
    summary: "A reel-first content engine: 20 posts a month without losing the brand's look.",
    tags: ["Social", "Reels", "Design System"],
    size: "sm",
    visual: "social",
    metrics: [
      { value: 8.7, suffix: "x", decimals: 1, label: "Reach growth" },
      { value: 24, suffix: "k", label: "New followers" },
    ],
    challenge: "Posting was random, design was inconsistent and reels felt like ads.",
    strategy: ["Three content pillars: menu, people, city moments.", "Template kit so every post looks on-brand."],
    execution: ["Monthly shoot days, batch editing, scheduled publishing.", "Creator collabs with local food pages."],
    outcome: "The page now drives weekend footfall, tracked through an in-store 'saw it on Insta' offer.",
  },
  {
    slug: "brand-growth-blueprint",
    title: "Brand Growth Blueprint",
    client: "Regional furniture retailer",
    category: "Brand",
    year: "2024",
    summary: "Repositioning, new messaging and a 90-day growth plan for a 20-year-old family business.",
    tags: ["Branding", "Positioning", "Strategy"],
    size: "wide",
    visual: "brand",
    metrics: [
      { value: 2.3, suffix: "x", decimals: 1, label: "Store enquiries" },
      { value: 90, label: "Day roadmap" },
      { value: 4, label: "New channels live" },
    ],
    challenge: "A trusted name offline, invisible online. Younger buyers saw the brand as 'old-fashioned'.",
    strategy: [
      "New promise: 'Crafted for Jammu homes' with design-led storytelling.",
      "Audience split: newly-weds, home upgraders, interior designers.",
      "Channel plan: Instagram, Meta Ads, Google Business Profile, WhatsApp catalogue.",
    ],
    execution: [
      "Brand voice guide, refreshed visuals and a content playbook for the in-house team.",
      "Google Business Profile clean-up and review-generation routine.",
    ],
    outcome: "The founder's next generation now runs the playbook in-house, with monthly strategy reviews.",
  },
];

export const SERVICES = [
  { icon: "TrendingUp", title: "Performance Marketing", text: "Full-funnel campaigns judged on leads, sales and ROAS, not likes." },
  { icon: "Target", title: "Meta Ads Management", text: "Structure, creatives, audiences and daily optimisation on Facebook & Instagram." },
  { icon: "Magnet", title: "Lead Generation", text: "Lead forms, landing pages and follow-up flows built to convert, not just collect." },
  { icon: "Sparkles", title: "Social Media Marketing", text: "Reel-first content calendars, shoots and community management." },
  { icon: "Lightbulb", title: "Creative Strategy", text: "Hooks, angles and ad concepts tested fast, scaled when they win." },
  { icon: "Fingerprint", title: "Branding & Positioning", text: "A clear promise, voice and visual system people remember." },
  { icon: "MessageCircle", title: "WhatsApp Marketing", text: "Click-to-WhatsApp ads, broadcasts, catalogues and automated replies." },
  { icon: "Rocket", title: "Business Growth Strategy", text: "90-day roadmaps, budgets and KPIs your whole team can follow." },
] as const;

export const STATS: Metric[] = [
  { value: 4.2, prefix: "₹", suffix: "Cr+", decimals: 1, label: "Ad spend managed" },
  { value: 38, suffix: "k+", label: "Leads generated" },
  { value: 60, suffix: "+", label: "Brands served" },
  { value: 4.6, suffix: "x", decimals: 1, label: "Avg. ROAS on e-com" },
];

export const PLATFORMS = ["Meta Ads", "Google Ads", "WhatsApp Business", "Instagram", "GA4", "Search Console", "Canva", "HubSpot", "Zapier", "Semrush"];

export const PROCESS = [
  { step: "01", title: "Audit", text: "Ad account, funnel and competitors. Where is the money leaking?" },
  { step: "02", title: "Strategy", text: "Offer, audience, creative angles and a budget plan in ₹." },
  { step: "03", title: "Launch", text: "Campaigns, creatives and follow-up flows live in days, not weeks." },
  { step: "04", title: "Scale", text: "Weekly reviews. Kill losers, scale winners, report in plain language." },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
