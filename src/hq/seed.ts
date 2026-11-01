import type { HqStore } from "./store";
import type { Client, Fact, FactStatus, KnowledgeBase } from "./types";

type Seed = { kb: KnowledgeBase; key: string; value: string; status: FactStatus; source: string };
const art = (slug: string, title: string) => `artifact:${slug} (${title})`;

const PAHADI_STORE = art("e11d2b78-01a4-49af-ad5d-234c6dcdf225", "Pahadi Origin Store, preview read 2026-11-01");
const PROP_DS = art("09e5a272-7eb5-4ce4-9f3a-b0978c61b51f", "Propedia design system README + Messaging");
const PROP_DX = art("949ea29e-2df1-4871-a915-00ac866a5d0a", "Propedia Phase 1 Business Diagnostic, 2026-10-20");
const KARAN_CAP = art("85961743-6db1-4b21-85e0-03dac4b9591b", "Capability audit: Karan's personal brand OS, 2026-10-11");
const KARAN_BRIEF = "user-brief: Karan's standing preferences in this workspace";

export const SEED_CLIENTS: (Omit<Client, "createdAt" | "agentPermissions"> & { facts: Seed[] })[] = [
  {
    id: "pahadi-origin", name: "Pahadi Origin", kind: "client",
    doNotSay: ["guaranteed results", "cures", "100% pure", "clinically proven"],
    facts: [
      { kb: "business", key: "name", value: "Pahadi Origin: Jammu-based seller of Himalayan food products", status: "CLIENT-PROVIDED", source: PAHADI_STORE },
      { kb: "business", key: "offer_products", value: "5 live products, price (MRP): Akharot Giri/walnut kernels 250 g ₹449 (₹649); Badam Giri/almonds 250 g ₹349 (₹499); Pure Himalayan Honey 500 g ₹399 (₹599); Shilajit Resin 20 g ₹899 (₹1,499); Kashmiri Kahwa Tea 100 g ₹249 (₹399). Coming soon: Kashmiri Mongra Kesar.", status: "CLIENT-PROVIDED", source: PAHADI_STORE },
      { kb: "business", key: "location", value: "Jammu dispatch; delivery stated for Jammu, Kashmir and Himachal", status: "CLIENT-PROVIDED", source: PAHADI_STORE },
      { kb: "business", key: "channels", value: "Mobile-first COD storefront (preview artifact) built for Meta Ads traffic; WhatsApp for orders and bulk/gift-pack enquiries", status: "CLIENT-PROVIDED", source: PAHADI_STORE },
      { kb: "business", key: "order_policy", value: "Cash on Delivery; UPI and cards also listed in page metadata; free delivery claimed; easy return (replace if damaged); confirmation call/WhatsApp after each order", status: "CLIENT-PROVIDED", source: PAHADI_STORE },
      { kb: "business", key: "social_proof_on_store", value: "Store shows per-product star ratings (4.6–4.8) and four testimonials, each labelled 'Sample' on the page. Sample testimonials are placeholders, not real customer reviews.", status: "NEEDS VERIFICATION", source: PAHADI_STORE },
      { kb: "business", key: "scarcity_claims", value: "Store shows 'Only 6/8/9/10 left' stock badges. Unknown whether these reflect real inventory.", status: "NEEDS VERIFICATION", source: PAHADI_STORE },
      { kb: "business", key: "discount_claims", value: "Store shows 30–40% OFF against struck-through MRP. Whether the higher price was ever charged is unknown.", status: "NEEDS VERIFICATION", source: PAHADI_STORE },
      { kb: "business", key: "compliance_inferred", value: "Food/health-type products (shilajit 'Ayurvedic', honey) typically need FSSAI licence display and careful label/ad claims. Not checked for this client.", status: "INFERRED", source: "agency-sop: ad-claims-india (general knowledge, not client data)" },
      { kb: "brand", key: "voice", value: "Warm Hinglish, rural-pride tone: 'Asli Pahadi Taste, Ghar Baithe Order Karo'; 'Pahadon se seedha aapke ghar'; 'Pehle Dekho, Phir Paise'", status: "CLIENT-PROVIDED", source: PAHADI_STORE },
      { kb: "brand", key: "positioning", value: "'Apna Pahadi brand, Jammu se': sourced from J&K and Himachal hills, fresh packing (zip-lock pouch, glass jar), order-confirmation call", status: "CLIENT-PROVIDED", source: PAHADI_STORE },
      { kb: "brand", key: "design_system_reference", value: "A 'Pahadi Origin Design System' artifact exists in Karan's workspace. Its tokens (colours, type) were NOT read in this build.", status: "NEEDS VERIFICATION", source: art("e217befe-bdc0-4749-8c43-14a61c77ae3f", "Pahadi Origin Design System") },
      { kb: "audience", key: "geography", value: "Stated delivery regions: Jammu, Kashmir, Himachal; sample testimonials cite Jammu, Shimla, Srinagar, Kangra", status: "CLIENT-PROVIDED", source: PAHADI_STORE },
      { kb: "assets", key: "approved_assets", value: "Product images (webp, 5 products) and logo exist inside the store artifact. Client approval status of these assets is not recorded.", status: "NEEDS VERIFICATION", source: PAHADI_STORE },
      { kb: "requirements", key: "goals", value: "Storefront is purpose-built to convert Meta Ads traffic via COD. A numeric goal/target has not been provided.", status: "INFERRED", source: PAHADI_STORE },
      { kb: "requirements", key: "approval_policy", value: "No post, ad launch, spend or client message without Karan's explicit approval.", status: "CLIENT-PROVIDED", source: "agency-policy: docs/AGENCY_HQ.md" },
    ],
  },
  {
    id: "propedia", name: "Propedia", kind: "client",
    doNotSay: ["100% legal", "verified property", "guaranteed returns", "guaranteed appreciation", "best deal in J&K", "golden opportunity"],
    facts: [
      { kb: "business", key: "name", value: "Propedia: real estate firm in Jammu, J&K (plots, flats/houses, commercial, industrial, agricultural land, rentals, investment research)", status: "CLIENT-PROVIDED", source: PROP_DS },
      { kb: "business", key: "offer_products", value: "Seven verticals: residential plots; flats and houses; commercial; industrial; agricultural land; rentals and leasing; investment research", status: "CLIENT-PROVIDED", source: PROP_DS },
      { kb: "business", key: "location", value: "Jammu, J&K; later Samba, Kathua, Katra if the business can support it", status: "CLIENT-PROVIDED", source: PROP_DS },
      { kb: "business", key: "launch_priority", value: "Diagnostic recommends launching with rentals, residential resale and RERA-compliant plots; defer commercial/industrial/agricultural until partners and ~10 closed deals. (Analysis hypothesis, not client decision.)", status: "INFERRED", source: PROP_DX },
      { kb: "business", key: "jkrera_status", value: "Propedia's own JKRERA agent registration status is unknown (diagnostic gap #1).", status: "NEEDS VERIFICATION", source: PROP_DX },
      { kb: "business", key: "digital_presence_status", value: "As of the 2026-10-20 diagnostic, no website, Google Business Profile, Instagram or WhatsApp Business details had been supplied.", status: "INFERRED", source: PROP_DX },
      { kb: "business", key: "market", value: "Jammu Master Plan 2032 expands the planning area from 112 to 777.84 sq km (351 villages added); JKRERA says only registered agents may market registered projects.", status: "RESEARCHED", source: "https://kashmirlife.net/jammu-kashmir-admin-announces-jammu-master-plan-2032-369990/ ; https://kashmirreader.com/2026/07/05/jkrera-inspects-various-illegal-colonies-across-multiple-locations/ (read 2026-10-20 per diagnostic)" },
      { kb: "business", key: "stamp_duty", value: "J&K stamp duty reported as 7% men, 3% women, 5% joint, plus 1.2% registration (page dated June 2024).", status: "NEEDS VERIFICATION", source: "https://housing.com/news/jammu-kashmir-stamp-duty-and-registration-charges/ (stale; recheck current)" },
      { kb: "business", key: "price_benchmark", value: "Square Yards shows ~₹10,000/sq ft Jammu asking-price average (Sep–Oct 2026) from a single locality (Trikuta Nagar). Low reliability; do not use for pricing.", status: "NEEDS VERIFICATION", source: "https://www.squareyards.com/property-rates-in-jammu (per diagnostic)" },
      { kb: "brand", key: "positioning", value: "'Property, checked.' / 'Pehle documents, phir deal.' / 'Jammu ki property, pakki jaanch ke saath.' Documents-first, lawyer-reviewed process. Taglines are working drafts until Karan signs off.", status: "CLIENT-PROVIDED", source: PROP_DS },
      { kb: "brand", key: "voice", value: "Careful, plain-spoken, local, quick. English for ads/site/print; Hinglish for Reels, captions, WhatsApp. Local units first (kanal/marla); prices as ₹45 Lakh style.", status: "CLIENT-PROVIDED", source: PROP_DS },
      { kb: "brand", key: "do_not_say", value: "Never: '100% legal', 'verified property', 'guaranteed returns', 'guaranteed appreciation', 'best deal in J&K', 'golden opportunity', fake testimonials, return/appreciation promises.", status: "CLIENT-PROVIDED", source: PROP_DS },
      { kb: "brand", key: "colors@design-system-readme", value: "Navy #0B3A8C and red #E00000, Poppins (red corner brackets around a house with a tick)", status: "NEEDS VERIFICATION", source: PROP_DS },
      { kb: "brand", key: "colors@diagnostic-doc", value: "Forest green #0E412A and gold #D4AF55 (gold brackets around house-and-key), per the diagnostic's logo review", status: "NEEDS VERIFICATION", source: PROP_DX },
      { kb: "brand", key: "typography", value: "Poppins (700 headlines/prices, 600 labels, 500 post body, 400 web body)", status: "CLIENT-PROVIDED", source: PROP_DS },
      { kb: "brand", key: "logo_files", value: "Logo set exists in the Propedia design-system artifact (primary, reversed, horizontal, icon). Vector master / one-colour versions flagged missing in diagnostic.", status: "NEEDS VERIFICATION", source: PROP_DS },
      { kb: "audience", key: "personas", value: "Hypotheses: transferred professional (rental demand), absentee owner (rental supply), first-home family, plot builder / NRI buyer, colony developer. To be tested on first 50 enquiries.", status: "ASSUMPTION", source: PROP_DX },
      { kb: "competitor", key: "competitors", value: "Snapshot of one portal page (RealEstateIndia, Sainik Colony): 26 dealers listed; largest visible stock: Bhavani Realtors (9 sale, 67 rent), Shubhdeep Realtor (31 sale, 10 rent), Bali Property (29 sale, 6 rent), Verma Properties (23 sale, 13 rent). Not an audit of any firm's site, reviews or socials.", status: "RESEARCHED", source: "https://www.realestateindia.com/agents-brokers-in-sainik-colony-jammu.htm (per diagnostic)" },
      { kb: "strategy", key: "current_strategy", value: "30-day plan: compliance (JKRERA), sign 1 lawyer + 1 surveyor, enquiry system (sheet + WhatsApp Business), 15 rental + 5 resale listings, measurement; organic only; paid-ads go/no-go at Day-30 review.", status: "INFERRED", source: PROP_DX },
      { kb: "requirements", key: "open_gaps", value: "12 documented data gaps; first four are legal: JKRERA status, current stamp duty, correct Jammu document list, agricultural-land buyer eligibility.", status: "CLIENT-PROVIDED", source: PROP_DX },
      { kb: "requirements", key: "approval_policy", value: "No post, ad launch, spend or client message without Karan's explicit approval. Property/legal claims need the partner lawyer's review before publishing.", status: "CLIENT-PROVIDED", source: "agency-policy: docs/AGENCY_HQ.md ; " + PROP_DX },
    ],
  },
  {
    id: "karan-personal-brand", name: "Karan Targotra (Personal Brand)", kind: "personal_brand",
    doNotSay: ["guaranteed results", "get rich", "overnight"],
    facts: [
      { kb: "business", key: "name", value: "Karan Targotra: social media manager and performance marketer in Jammu; runs the agency ScapeMedia", status: "CLIENT-PROVIDED", source: KARAN_BRIEF },
      { kb: "business", key: "offer_products", value: "Meta/Google Ads, AI automation, SEO and content for SMBs, car dealerships and local brands", status: "CLIENT-PROVIDED", source: KARAN_BRIEF },
      { kb: "business", key: "location", value: "Jammu, India", status: "CLIENT-PROVIDED", source: KARAN_BRIEF },
      { kb: "business", key: "instagram_handle", value: "@karantargotra.a (live Instagram handle)", status: "CLIENT-PROVIDED", source: KARAN_CAP },
      { kb: "brand", key: "voice", value: "Brief, direct, lead with the answer; Hinglish-friendly; English for deliverables; honest when an idea is weak; India-aware (₹, local context)", status: "CLIENT-PROVIDED", source: KARAN_BRIEF },
      { kb: "brand", key: "design_system_reference", value: "Artifacts exist: 'Karan Targotra' and 'Karan Targotra Brand' design systems, 'Karan's Creative Clone — Style Guide v1', 'My Original Creative DNA — Brand & Design System', 'Karan Editing Style Card'. Contents (colours/fonts) were NOT read in this build (the Creative DNA doc exceeded the read limit).", status: "NEEDS VERIFICATION", source: art("73f3a686-8a86-492a-ad1b-16ad4e01aeba", "Karan Targotra Brand") + " ; " + art("57c7837a-4477-4d84-a2a9-9c99c7b31c20", "My Original Creative DNA") },
      { kb: "content", key: "previous_content", value: "Prior weekly content work exists: W43 content board/OS (Meta AI Ads week) with a reference-account system, 'Before you press Boost' carousel production package, 5-Pass Reel Carousel, W44 post preview and 'W44 Plan & Stats' (topics, 30-day stats, best posting times).", status: "CLIENT-PROVIDED", source: art("2f2af97a-334e-4d8b-ba93-de5a0acd8dc9", "W44 Plan & Stats") + " ; " + art("305ef18e-15f1-45f2-80fc-d95ace6aac7b", "W43 Content Board") },
      { kb: "content", key: "weekly_system", value: "A 'karan-weekly-content-os' skill and weekly artifacts (W43, W44) define the current weekly content workflow.", status: "CLIENT-PROVIDED", source: "skill: anthropic-skills:karan-weekly-content-os ; artifacts W43/W44" },
      { kb: "performance", key: "ga_note", value: "Last-30-day Instagram stats for @karantargotra.a exist in the 'W44 Plan & Stats' artifact. Numbers were NOT imported into this workspace yet.", status: "NEEDS VERIFICATION", source: art("2f2af97a-334e-4d8b-ba93-de5a0acd8dc9", "W44 Plan & Stats") },
      { kb: "requirements", key: "approval_policy", value: "Nothing is published or scheduled without Karan's explicit approval; connector use (Windsor Instagram insights, scheduling) needs approval first.", status: "CLIENT-PROVIDED", source: KARAN_CAP },
      { kb: "requirements", key: "client_requirements", value: "Personal brand goals: positioning, thought leadership, educational content, audience growth, personal storytelling. Specific targets not provided.", status: "ASSUMPTION", source: "user-brief: Agency OS master instruction, Part 2 (Account 03)" },
    ],
  },
];

/** Idempotent: only adds clients/facts that are missing. Never overwrites or deletes (Part 11 rule 4). */
export async function seedWorkspaces(store: HqStore, quiet = false) {
  const existing = new Set((await store.listClients()).map((c) => c.id));
  for (const c of SEED_CLIENTS) {
    if (existing.has(c.id)) continue;
    const { facts, ...client } = c;
    await store.addClient({ ...client, createdAt: new Date().toISOString(), agentPermissions: [] });
    for (const f of facts) await store.putFact({ clientId: c.id, ...f } as Omit<Fact, "id" | "version" | "supersededBy" | "createdAt">);
    if (!quiet) console.log(`seeded ${c.id}: ${facts.length} facts`);
  }
}

/** Onboards a brand-new client with empty, isolated workspace (Part 2 "future clients"). */
export async function onboardClient(store: HqStore, input: { id: string; name: string; kind?: Client["kind"]; doNotSay?: string[] }) {
  await store.addClient({ id: input.id, name: input.name, kind: input.kind ?? "client", doNotSay: input.doNotSay ?? [], agentPermissions: [], createdAt: new Date().toISOString() });
  await store.putFact({ clientId: input.id, kb: "requirements", key: "approval_policy", value: "No post, ad launch, spend or client message without Karan's explicit approval.", status: "CLIENT-PROVIDED", source: "agency-policy: docs/AGENCY_HQ.md" });
}
