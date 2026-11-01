import { z } from "zod";

const refs = z.array(z.string()).default([]);
const text = (n = 1200) => z.string().min(2).max(n);

/** research_* and audit_* deliverables */
export const sectionsSchema = z.object({
  summary: text(1500),
  sections: z.array(z.object({ heading: text(120), bullets: z.array(z.object({ text: text(600), factIds: refs, sourceUrls: z.array(z.string()).default([]) })).max(12) })).min(1).max(8),
  missingInfo: z.array(text(300)).max(15).default([]),
  risks: z.array(text(300)).max(10).default([]),
});
export type SectionsBody = z.infer<typeof sectionsSchema>;

export const strategySchema = z.object({
  objectives: z.array(z.object({ text: text(300), metric: z.string().nullable().default(null), factIds: refs })).min(1).max(6),
  personas: z.array(z.object({ name: text(80), description: text(500), factIds: refs })).min(1).max(5),
  pillars: z.array(z.object({ name: text(80), description: text(400), example: text(300) })).min(2).max(6),
  campaignTheme: text(300),
  growth: z.array(z.object({ text: text(400), factIds: refs })).max(8).default([]),
  assumptions: z.array(text(300)).max(10).default([]),
  missingInfo: z.array(text(300)).max(15).default([]),
});
export type StrategyBody = z.infer<typeof strategySchema>;

export const FORMATS = ["reel", "carousel", "static", "story"] as const;
export const contentItemSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), platform: z.enum(["instagram", "facebook", "youtube"]), format: z.enum(FORMATS), pillar: text(80),
  language: z.enum(["english", "hindi", "hinglish"]), title: text(160), hook: text(150), caption: text(2200), cta: text(160), hashtags: z.array(z.string().regex(/^#\S+$/)).max(30).default([]),
  script: z.array(z.object({ t: text(30), text: text(400) })).max(14).nullable().default(null),
  slides: z.array(z.object({ n: z.number().int().min(1).max(10), text: text(300) })).max(10).nullable().default(null),
  claimsUsed: refs, needsVerification: z.array(text(300)).max(10).default([]),
});
export type ContentItemBody = z.infer<typeof contentItemSchema>;

export const calendarSchema = z.object({
  platform: z.enum(["instagram", "facebook", "youtube"]), startDate: z.string(), days: z.number().int().min(1).max(31), language: z.enum(["english", "hindi", "hinglish"]),
  items: z.array(z.object({ date: z.string(), format: z.enum(FORMATS), pillar: text(80), title: text(160) })).min(1).max(40),
  notes: z.array(text(300)).max(10).default([]),
});
export type CalendarBody = z.infer<typeof calendarSchema>;

export const reelScriptsSchema = z.object({ scripts: z.array(z.object({ index: z.number().int().min(0), script: z.array(z.object({ t: text(30), text: text(400) })).min(2).max(14), storyboard: z.array(text(300)).max(10).default([]) })).max(40) });
export type ReelScriptsBody = z.infer<typeof reelScriptsSchema>;

export const creativeBriefSchema = z.object({
  contentItemId: z.string(), concept: text(600), layout: text(600), aspect: z.enum(["9:16", "4:5", "1:1", "1.91:1"]), imagePrompt: text(900), videoPrompt: z.string().max(900).nullable().default(null),
  storyboard: z.array(text(300)).max(10).nullable().default(null), variations: z.array(text(300)).min(1).max(5), brandNotes: text(500), assetSlots: z.array(text(160)).max(10).default([]),
});
export type CreativeBriefBody = z.infer<typeof creativeBriefSchema>;
export const creativeBatchSchema = z.object({ briefs: z.array(creativeBriefSchema).min(1).max(40) });

export const adPlanSchema = z.object({
  objective: text(300), budget: z.object({ amountInr: z.number().nullable().default(null), note: text(400) }),
  audiences: z.array(z.object({ name: text(100), targeting: text(400), rationale: text(400), validated: z.boolean().default(false) })).min(1).max(5),
  adCopy: z.array(z.object({ headline: text(80), text: text(500), cta: text(80), language: z.enum(["english", "hindi", "hinglish"]), claimsUsed: refs })).min(1).max(8),
  creativeRefs: z.array(z.string()).default([]), risks: z.array(text(300)).max(10).default([]),
  launchChecklist: z.array(z.object({ item: text(200), done: z.boolean() })).max(12),
  performanceAnalysis: z.object({ status: z.enum(["NO DATA", "ANALYSED"]), note: text(400) }),
});
export type AdPlanBody = z.infer<typeof adPlanSchema>;

export const packageSchema = z.object({
  title: text(200), objective: text(300), summary: text(1500),
  deliverables: z.array(z.object({ id: z.string(), kind: z.string(), title: z.string(), status: z.string(), qa: z.string() })),
  missingInfo: z.array(z.string()), assumptions: z.array(z.string()), usage: z.object({ calls: z.number(), costUsd: z.number(), mock: z.boolean() }),
  nextSteps: z.array(z.string()), notExecuted: z.string(),
});
export type PackageBody = z.infer<typeof packageSchema>;
