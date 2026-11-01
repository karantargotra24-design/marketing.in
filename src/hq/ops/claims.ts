import type { ContentItemBody, AdPlanBody, CreativeBriefBody } from "./schemas";
import type { Client, Fact, QaIssueRec } from "../types";

type Rule = { id: string; re: RegExp; evidenceKey: string | null; label: string; hard: boolean };
/** Claim detectors. A claim is allowed only if a stored fact of the right kind is VERIFIED; CLIENT-PROVIDED yields a warning (needs proof). */
export const CLAIM_RULES: Rule[] = [
  { id: "discount", re: /\b\d{1,3}\s?%\s?(off|discount)\b|\bflat\s+\d+\s?(%|rs|₹)?\s?off\b|\bmega sale\b/i, evidenceKey: "discount_claims", label: "discount / % off", hard: true },
  { id: "scarcity", re: /\bonly\s+(a\s+)?(few|\d+)\s+(pieces?\s+)?left\b|\blimited stock\b|\blast few\b|\bselling fast\b|\bhurry\b|\bstock ending\b/i, evidenceKey: "scarcity_claims", label: "scarcity / stock claim", hard: true },
  { id: "social_proof", re: /\b[45](\.\d)?\s?(\/\s?5|stars?|★)|\bcustomers? (love|say|rated)\b|\btestimonials?\b|\b\d+\+?\s+(happy customers|reviews)\b|\bbestseller\b|\bbest seller\b/i, evidenceKey: "social_proof_on_store", label: "ratings / reviews / testimonials", hard: true },
  { id: "health", re: /\b(cures?|treats?|heals?|detox\w*|immunity|immune|diabet\w*|cancer|weight loss|testosterone|stamina|energy booster|anti-?ageing|arthritis|clinically|medicinal|health benefits?)\b/i, evidenceKey: null, label: "health / medical claim", hard: true },
  { id: "purity", re: /\b100\s?%\s?(pure|natural|organic|original|genuine|authentic)\b|\bchemical[- ]free\b|\bno adulteration\b|\bguaranteed\b/i, evidenceKey: null, label: "purity / guarantee claim", hard: true },
  { id: "free_delivery", re: /\bfree (home )?delivery\b/i, evidenceKey: "order_policy", label: "free delivery", hard: false },
  { id: "superlative", re: /\b(best|no\.?\s?1|#1|number one|finest|unmatched)\b/i, evidenceKey: null, label: "superlative", hard: false },
];

const rank = (f?: Fact) => (!f ? 0 : f.status === "VERIFIED" ? 3 : f.status === "CLIENT-PROVIDED" ? 2 : 1);

export function scanText(label: string, text: string, facts: Fact[]): QaIssueRec[] {
  const issues: QaIssueRec[] = [];
  for (const r of CLAIM_RULES) {
    const m = text.match(r.re);
    if (!m) continue;
    const ev = r.evidenceKey ? facts.find((f) => f.key === r.evidenceKey) : undefined;
    const level = rank(ev);
    if (level === 3) continue;                                      // verified evidence exists
    if (level === 2 && !r.hard) { issues.push({ severity: "warn", rule: `claim:${r.id}`, detail: `${label}: "${m[0]}" (${r.label}) is client-stated but not proven; get evidence before publishing` }); continue; }
    issues.push({ severity: r.hard ? "blocker" : "warn", rule: `claim:${r.id}`, detail: `${label}: "${m[0]}" (${r.label}) has no verified evidence${ev ? ` (fact "${ev.key}" is ${ev.status})` : ""}` });
  }
  return issues;
}

/** Numbers: every ₹ amount and % in generated text must appear in the client's own facts. */
export function scanNumbers(label: string, text: string, corpus: string): QaIssueRec[] {
  const issues: QaIssueRec[] = [];
  const norm = (s: string) => s.toLowerCase().replace(/[,\s]/g, "");
  const c = norm(corpus);
  for (const m of text.matchAll(/₹\s?[\d,]+(?:\.\d+)?|\b\d+(?:\.\d+)?\s?%/g)) if (!c.includes(norm(m[0]))) issues.push({ severity: "blocker", rule: "number", detail: `${label}: "${m[0]}" does not appear in this client's facts` });
  return issues;
}

export function languageIssues(label: string, text: string, max?: number): QaIssueRec[] {
  const issues: QaIssueRec[] = [];
  if (/\s{3,}/.test(text) || /\b(\w{3,})\s+\1\b/i.test(text)) issues.push({ severity: "warn", rule: "language", detail: `${label}: repeated word or stray spaces` });
  if (/\b(lorem|todo|tbd|xxx)\b/i.test(text)) issues.push({ severity: "blocker", rule: "language", detail: `${label}: placeholder text left in` });
  if (max && text.length > max) issues.push({ severity: "blocker", rule: "length", detail: `${label}: ${text.length} chars exceeds ${max}` });
  return issues;
}

export function bannedIssues(label: string, text: string, client: Client): QaIssueRec[] {
  const banned = ["guaranteed returns", "guaranteed appreciation", "100% legal", ...client.doNotSay.filter((p) => p.length > 3)];
  return banned.filter((b) => text.toLowerCase().includes(b.toLowerCase())).map((b) => ({ severity: "blocker" as const, rule: "banned-phrase", detail: `${label}: contains banned phrase "${b}"` }));
}

const itemText = (b: ContentItemBody) => [b.hook, b.caption, b.cta, ...(b.script ?? []).map((s) => s.text), ...(b.slides ?? []).map((s) => s.text)].join("\n");

export function qaContentItem(b: ContentItemBody, facts: Fact[], client: Client, corpus: string): QaIssueRec[] {
  const t = itemText(b); const L = `Content "${b.title}"`;
  const issues = [...scanText(L, t, facts), ...scanNumbers(L, t, corpus), ...bannedIssues(L, t, client), ...languageIssues(L, b.caption, b.platform === "instagram" ? 2200 : 5000), ...languageIssues(L, b.hook, 150)];
  if (b.platform === "instagram" && b.hashtags.length > 30) issues.push({ severity: "blocker", rule: "spec", detail: `${L}: more than 30 hashtags` });
  if (!b.cta.trim()) issues.push({ severity: "warn", rule: "cta", detail: `${L}: no call to action` });
  if (b.format === "reel" && (!b.script || b.script.length < 2)) issues.push({ severity: "warn", rule: "spec", detail: `${L}: reel has no script yet` });
  if (b.format === "carousel" && (!b.slides || b.slides.length < 2)) issues.push({ severity: "warn", rule: "spec", detail: `${L}: carousel has no slide copy` });
  if (b.needsVerification.length) issues.push({ severity: "warn", rule: "evidence", detail: `${L}: author flagged unverified items: ${b.needsVerification.join("; ")}` });
  return issues;
}
export function qaCreativeBrief(b: CreativeBriefBody, client: Client, facts: Fact[], hasPalette: boolean): QaIssueRec[] {
  const L = `Brief for ${b.contentItemId}`; const t = [b.concept, b.layout, b.imagePrompt, b.videoPrompt ?? ""].join("\n");
  const issues = [...scanText(L, t, facts), ...bannedIssues(L, t, client)];
  if (b.imagePrompt.length < 40) issues.push({ severity: "blocker", rule: "spec", detail: `${L}: image prompt too short to be usable` });
  if (!/no (visible )?(text|logo|watermark)/i.test(b.imagePrompt)) issues.push({ severity: "warn", rule: "spec", detail: `${L}: image prompt should say "no text/logo/watermark" (text is added in design)` });
  if (!hasPalette) issues.push({ severity: "warn", rule: "brand", detail: `${L}: brand palette/fonts are not confirmed, so colours cannot be checked; generation must wait` });
  return issues;
}
export function qaAdPlan(b: AdPlanBody, client: Client, facts: Fact[], corpus: string): QaIssueRec[] {
  const issues: QaIssueRec[] = [];
  b.adCopy.forEach((a, i) => { const t = `${a.headline}\n${a.text}\n${a.cta}`; const L = `Ad copy #${i + 1}`; issues.push(...scanText(L, t, facts), ...scanNumbers(L, t, corpus), ...bannedIssues(L, t, client), ...languageIssues(L, a.headline, 80)); });
  if (b.budget.amountInr === null) issues.push({ severity: "warn", rule: "missing", detail: "Budget not provided: cannot be launched or sized" });
  if (b.audiences.some((a) => !a.validated)) issues.push({ severity: "warn", rule: "evidence", detail: "Audience suggestions are unvalidated (no performance data)" });
  return issues;
}

/** Removes unsupported claim phrases (used by the mock brain when "revising"; real AI revises via the model). */
export function stripClaims(text: string): string {
  let t = text;
  for (const r of CLAIM_RULES.filter((x) => x.hard)) {
    const flags = r.re.flags.includes("g") ? r.re.flags : r.re.flags + "g";
    const re = new RegExp(r.re.source, flags);
    if (r.id === "health" || r.id === "purity") t = t.split(/(?<=[.!?।])\s+/).filter((s) => !new RegExp(r.re.source, r.re.flags.replace("g", "")).test(s)).join(" ");
    else t = t.replace(re, "");
  }
  return t.replace(/\s+([.!?,])/g, "$1").replace(/([.!?])[.!?]+/g, "$1").replace(/\s{2,}/g, " ").replace(/^[\s.!,-]+/, "").trim();
}
export function stripDeep<T>(v: T): T {
  if (typeof v === "string") return stripClaims(v) as unknown as T;
  if (Array.isArray(v)) return v.map(stripDeep) as unknown as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, k === "hashtags" || k === "date" || k.endsWith("Id") || k === "contentItemId" ? x : stripDeep(x)])) as T;
  return v;
}
