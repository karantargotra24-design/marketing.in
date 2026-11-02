import { stripDeep } from "./claims";

type F = { id: string; kb: string; key: string; status: string; value: string };
type P = { agent: string; kind: string; client: { name: string }; language: "english" | "hindi" | "hinglish"; platform: string; days: number; startDate: string; facts: F[]; strategy?: { pillars: { name: string }[]; campaignTheme: string }; items?: { index: number; id: string; format: string; title: string; hook: string; date: string }[]; previous?: unknown; issues?: string[]; missing?: string[]; upstreamIds?: string[] };

const by = (f: F[], k: string) => f.find((x) => x.key === k);
const ids = (f: F[], ...keys: string[]) => keys.flatMap((k) => f.filter((x) => x.key.split("@")[0] === k).map((x) => x.id));
const cut = (s: string, n = 220) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const FORMATS = ["reel", "carousel", "static", "reel", "story", "reel", "carousel"] as const;
const PILLARS = ["Education", "Trust & process", "Product showcase", "Brand stories"];

function products(f: F[]) {
  const v = by(f, "offer_products")?.value ?? "";
  const out: { name: string; alt: string; price: string | null }[] = [];
  for (const m of v.matchAll(/([A-Za-z][A-Za-z ]*?(?:\/[A-Za-z ]+?)?)\s+(?:\d+\s?(?:g|kg|ml)\s+)?₹\s?([\d,]+)/g)) {
    const [name, alt] = m[1].trim().split("/"); out.push({ name: name.trim(), alt: (alt ?? "").trim(), price: m[2] });
  }
  return out.length ? out : [{ name: "our products", alt: "", price: null }];
}
const voicePhrase = (f: F[]) => (by(f, "voice")?.value.match(/['‘“"]([^'’”"]{6,70})['’”"]/)?.[1] ?? "");
const hasKey = (f: F[], k: string) => f.some((x) => x.key === k);
const cod = (f: F[]) => /cash on delivery/i.test(by(f, "order_policy")?.value ?? "");
const addDays = (iso: string, n: number) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

function sections(p: P, heading: string, keys: string[], gapText: string, riskKeys: string[] = []) {
  const bullets = p.facts.filter((f) => keys.includes(f.key.split("@")[0])).map((f) => ({ text: `${f.key.replace(/_/g, " ")} [${f.status}]: ${cut(f.value)}`, factIds: [f.id], sourceUrls: [] as string[] }));
  const risks = p.facts.filter((f) => (riskKeys.length ? riskKeys.includes(f.key) : false) || f.status === "NEEDS VERIFICATION").map((f) => `${f.key}: ${f.status}, do not use in marketing until verified`);
  return { summary: `[MOCK AI] ${heading} for ${p.client.name} from ${bullets.length} stored fact(s).`, sections: [{ heading, bullets: bullets.length ? bullets : [{ text: `No stored facts cover this area yet (${gapText}).`, factIds: [], sourceUrls: [] }] }], missingInfo: [...(bullets.length ? [] : [gapText]), "Live web/search sources: awaiting credentials, so nothing here is externally researched"], risks };
}

function item(p: P, i: number) {
  const prods = products(p.facts), pr = prods[i % prods.length];
  const format = FORMATS[i % FORMATS.length], pillar = PILLARS[i % PILLARS.length];
  const vp = voicePhrase(p.facts);
  const L = p.language;
  const price = pr.price ? `₹${pr.price}` : "";
  const hook = L === "hindi" ? `${pr.name} खरीदने से पहले ये 3 बातें देखें` : L === "hinglish" ? `${pr.name} kharidne se pehle ye 3 cheezein dekho` : `3 things to check before you buy ${pr.name}`;
  let caption = L === "hindi" ? `${pr.name}${price ? ` — ${price}` : ""}। सीधे पहाड़ों से आपके घर तक।${cod(p.facts) ? " कैश ऑन डिलीवरी उपलब्ध।" : ""}` : L === "hinglish" ? `${pr.name}${pr.alt ? ` (${pr.alt})` : ""}${price ? ` — ${price}` : ""}. Seedha Pahadon se, ghar tak.${vp ? ` ${vp}.` : ""}${cod(p.facts) ? " COD available." : ""} Order ke liye WhatsApp karein.` : `${pr.name}${pr.alt ? ` (${pr.alt})` : ""}${price ? ` — ${price}` : ""}. Straight from the hills to your home.${cod(p.facts) ? " Cash on delivery available." : ""} Order on WhatsApp.`;
  const cta = L === "hindi" ? "WhatsApp पर ऑर्डर करें" : L === "hinglish" ? "WhatsApp pe order karo" : "Order on WhatsApp";
  const naive: string[] = [];
  const revising = Boolean(p.previous);
  if (!revising) { // a naive writer copies whatever the store page says
    if (i === 1 && hasKey(p.facts, "scarcity_claims")) { caption += " Only few left!"; naive.push("scarcity line copied from store page"); }
    if (i === 4 && hasKey(p.facts, "discount_claims")) { caption += " 40% OFF!"; naive.push("discount copied from store page"); }
    if (i === 2 && /shilajit|honey/i.test(pr.name)) { caption += " Great health benefits."; naive.push("health claim"); }
  }
  const tag = "#" + p.client.name.replace(/[^A-Za-z0-9]/g, "");
  return { date: addDays(p.startDate, i), platform: p.platform, format, pillar, language: L, title: `${pr.name}: ${format}`, hook: cut(hook, 150), caption, cta, hashtags: [tag, ...(format === "reel" ? ["#Reels"] : [])], script: null, slides: format === "carousel" ? [{ n: 1, text: pr.name }, { n: 2, text: price ? `${pr.name} ${price}` : pr.name }, { n: 3, text: cta }] : null, claimsUsed: ids(p.facts, "offer_products", "voice", "order_policy"), needsVerification: naive };
}

export function mockRespond(user: string): string {
  const line = user.split("\n").find((l) => l.startsWith('{"agent"')) ?? "{}";
  const p = JSON.parse(line) as P;
  const k = p.kind;
  if (k.startsWith("revise_")) return JSON.stringify({ ...(stripDeep(p.previous) as object), ...(k === "revise_content_item" ? { needsVerification: [] } : {}) });
  switch (k) {
    case "research_market": return JSON.stringify(sections(p, "Market research", ["location", "channels", "launch_priority", "market", "digital_presence_status"], "market and location facts"));
    case "research_competitors": return JSON.stringify(sections(p, "Competitor research", ["competitors"], "no competitors stored; needs a competitor list or a search tool"));
    case "research_audience": return JSON.stringify(sections(p, "Audience research", ["geography", "personas", "target_segments"], "no audience facts stored"));
    case "research_brand_product": return JSON.stringify(sections(p, "Brand and product research", ["name", "offer_products", "positioning", "voice", "order_policy", "compliance_inferred"], "no brand/product facts stored"));
    case "audit_business": return JSON.stringify(sections(p, "Business audit", ["name", "offer_products", "order_policy", "channels", "jkrera_status", "launch_priority"], "business facts"));
    case "audit_social": return JSON.stringify(sections(p, "Social media audit", ["instagram_handle", "channels", "digital_presence_status"], "no social handles stored; connect Instagram or add the handle"));
    case "audit_content": return JSON.stringify(sections(p, "Content audit", ["previous_content", "weekly_system", "approved_assets"], "no previous content stored"));
    case "audit_positioning": return JSON.stringify(sections(p, "Positioning audit", ["positioning", "voice", "do_not_say", "colors", "typography", "logo_files", "design_system_reference"], "no positioning facts stored", ["social_proof_on_store", "scarcity_claims", "discount_claims"]));
    case "audit_performance": { const perf = p.facts.filter((f) => f.kb === "performance"); return JSON.stringify(perf.length ? sections(p, "Performance audit", perf.map((f) => f.key), "") : { summary: `[MOCK AI] NO DATA: no performance numbers are stored for ${p.client.name}. Nothing was estimated.`, sections: [{ heading: "Performance", bullets: [{ text: "NO DATA: import Meta/Instagram exports or connect an account.", factIds: [], sourceUrls: [] }] }], missingInfo: ["performance.baseline_metrics", "performance.followers", "performance.ad_metrics"], risks: [] }); }
    case "strategy": {
      const goal = by(p.facts, "goals"), geo = by(p.facts, "geography") ?? by(p.facts, "location"), pos = by(p.facts, "positioning") ?? by(p.facts, "voice");
      return JSON.stringify({
        objectives: [{ text: goal ? `Work toward the stated aim: ${cut(goal.value, 160)}` : "Establish a measured baseline (reach, enquiries/orders) before setting growth targets", metric: null, factIds: ids(p.facts, "goals") }, { text: `Publish consistently on ${p.platform} for ${p.days} days using only verified product facts`, metric: null, factIds: ids(p.facts, "offer_products") }],
        personas: [{ name: "Hypothesis: delivery-region buyer", description: `Hypothesis (not validated): people in the stated delivery area who prefer a clear price and ${cod(p.facts) ? "pay-on-delivery" : "simple ordering"}.`, factIds: [geo?.id, ...ids(p.facts, "order_policy")].filter(Boolean) as string[] }],
        pillars: PILLARS.map((n) => ({ name: n, description: n === "Education" ? "What to check, how to use: no medical claims" : n === "Trust & process" ? "Packing, ordering, delivery: only proven policies" : n === "Product showcase" ? "One product, one reason, real price" : "Sourcing and seasons told honestly", example: n === "Education" ? "3 things to check before buying" : "How an order reaches you" })),
        campaignTheme: pos ? cut(pos.value, 200) : `${p.client.name}: ${p.days}-day ${p.platform} push`,
        growth: [{ text: "Review results after the first week and double down on the best-performing pillar", factIds: [] }],
        assumptions: ["No numeric goal or budget is stored; strategy is directional until provided", "Audience is a hypothesis until data exists"], missingInfo: (p.missing ?? []).slice(0, 15).map((m) => m.slice(0, 300)),
      });
    }
    case "content_calendar": {
      const items = Array.from({ length: p.days }, (_, i) => item(p, i));
      return JSON.stringify({ calendar: { platform: p.platform, startDate: p.startDate, days: p.days, language: p.language, items: items.map((x) => ({ date: x.date, format: x.format, pillar: x.pillar, title: x.title })), notes: [`[MOCK AI] Calendar built from stored product, voice and policy facts for ${p.client.name}`] }, items });
    }
    case "content_chunk": { const range = (p as unknown as { range: [number, number] }).range; return JSON.stringify({ items: Array.from({ length: range[1] - range[0] }, (_, j) => item(p, range[0] + j)) }); }
    case "reel_scripts": return JSON.stringify({ scripts: (p.items ?? []).filter((x) => x.format === "reel").map((x) => ({ index: x.index, script: [{ t: "0–3s", text: `HOOK: ${x.hook}` }, { t: "3–12s", text: `Show the product close-up; say the real price on screen only if it is in the facts` }, { t: "12–20s", text: "Show how ordering works (WhatsApp / COD as stored)" }, { t: "20–25s", text: "CTA: order on WhatsApp" }], storyboard: ["Shot 1: hands pick the product", "Shot 2: pack opened, natural light", "Shot 3: order screen / WhatsApp"] })) });
    case "creative_briefs": return JSON.stringify({ briefs: (p.items ?? []).map((x) => ({ contentItemId: x.id, concept: `${x.title}: honest product-first visual in the brand voice`, layout: x.format === "carousel" ? "Slide 1 hook, slides 2-3 product + price, last slide CTA; large type, one idea per slide" : "Product centred, generous negative space for text overlay added in design", aspect: x.format === "reel" || x.format === "story" ? "9:16" : "4:5", imagePrompt: `Close-up photograph of ${x.title.split(":")[0]}, warm natural light, rustic wooden surface, shallow depth of field, no text, no logo, no watermark`, videoPrompt: x.format === "reel" ? `8-second macro clip of ${x.title.split(":")[0]}, slow push-in, natural sound, no faces, no text` : null, storyboard: x.format === "reel" ? ["Close-up", "Detail", "Pack shot + CTA frame"] : null, variations: ["Warm indoor light", "Outdoor morning light"], brandNotes: hasKey(p.facts, "colors") ? "Use the confirmed palette" : "Palette and fonts are NOT confirmed; keep neutral until they are", assetSlots: ["Product photo", ...(x.format === "reel" ? ["Raw footage (must be shot)"] : [])] })) });
    case "ad_plan": {
      const b = by(p.facts, "budget")?.value.match(/₹\s?([\d,]+)/)?.[1];
      const pr = products(p.facts);
      const naive = !p.previous && hasKey(p.facts, "scarcity_claims");
      return JSON.stringify({ objective: `Drive ${cod(p.facts) ? "cash-on-delivery orders" : "enquiries"} for ${p.client.name}`, budget: { amountInr: b ? Number(b.replace(/,/g, "")) : null, note: b ? "From the stored budget fact" : "No budget stored. Sizing and launch are blocked until you provide one" },
        audiences: [{ name: "Delivery regions, broad", targeting: "Locations from the stored delivery area; age and interests left broad for the first test", rationale: "No performance data exists, so start broad and learn", validated: false }],
        adCopy: pr.slice(0, 3).map((x, i) => ({ headline: `${x.name}${x.price ? ` ₹${x.price}` : ""}`, text: `${x.alt || x.name}, straight from the hills.${cod(p.facts) ? " Pay on delivery." : ""}${naive && i === 1 ? " Only few left!" : ""}`, cta: "Order on WhatsApp", language: p.language, claimsUsed: ids(p.facts, "offer_products", "order_policy") })),
        creativeRefs: p.upstreamIds ?? [], risks: ["Audience unvalidated", "Store page shows unverified claims; they are excluded from ad copy"],
        launchChecklist: [{ item: "Budget approved", done: Boolean(b) }, { item: "Goal and KPI set", done: hasKey(p.facts, "goals") }, { item: "Landing page URL verified", done: hasKey(p.facts, "website_url") }, { item: "Meta Ads connected and tested", done: false }, { item: "Your explicit launch approval", done: false }],
        performanceAnalysis: { status: "NO DATA", note: "No campaign results exist yet. Analysis starts once data is imported or connected." } });
    }
  }
  return JSON.stringify({ error: `mock brain has no generator for ${k}` });
}
