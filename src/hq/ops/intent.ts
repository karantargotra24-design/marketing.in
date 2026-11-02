import type { Client, Fact } from "../types";

export type Objective = "campaign" | "content_plan" | "audit" | "research" | "strategy" | "ads" | "report" | "general";
export type Intent = { objective: Objective; days: number; platform: "instagram" | "facebook" | "youtube"; language: "english" | "hindi" | "hinglish"; assumptions: string[]; mentionsOtherClient: string | null };

const NUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fourteen: 14, thirty: 30 };

/** Deterministic intent parser. (Free-form LLM planning can replace it later; this is real, tested logic, not a stub.) */
export function parseIntent(text: string, client: Client, facts: Fact[], otherClients: Client[]): Intent {
  const t = text.toLowerCase();
  const assumptions: string[] = [];
  const mentioned = otherClients.find((c) => new RegExp(`\\b${c.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s*\(.*\)/, "")}\\b`).test(t));

  let objective: Objective = "general";
  if (/\bcampaign\b|\bgrowth\b|\blaunch\b/.test(t)) objective = "campaign";
  else if (/\b(ads?|advert\w*|meta ads|google ads|paid)\b/.test(t)) objective = "ads";
  else if (/\b(content|calendar|posts?|reels?|captions?|carousel|stories|scripts?)\b/.test(t)) objective = "content_plan";
  else if (/\b(report|performance|analytics|results)\b/.test(t)) objective = "report";
  else if (/\b(audit|review|analy[sz]e|assessment)\b/.test(t)) objective = "audit";
  else if (/\b(research|competitor|market)\b/.test(t)) objective = "research";
  else if (/\b(strategy|roadmap|positioning|plan)\b/.test(t)) objective = "strategy";
  if (objective === "general") assumptions.push("Instruction was broad; interpreted as a research + audit + strategy pass.");

  let days = 0;
  const m = t.match(/(\d{1,2})[\s-]*(day|days)/) ?? t.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|fourteen|thirty)[\s-]*(day|days)/);
  if (m) days = NUM[m[1]] ?? Number(m[1]);
  else if (/\bmonth(ly)?\b/.test(t)) days = 30;
  else if (/\bweek(ly)?\b/.test(t)) days = 7;
  if (!days) { days = 7; if (["campaign", "content_plan", "ads"].includes(objective)) assumptions.push("No duration given; assumed 7 days."); }
  days = Math.min(Math.max(days, 1), 30);

  const platform = /\byoutube\b/.test(t) ? "youtube" : /\bfacebook\b/.test(t) ? "facebook" : "instagram";
  if (!/\b(instagram|facebook|youtube)\b/.test(t) && ["campaign", "content_plan", "ads"].includes(objective)) assumptions.push("No platform given; assumed Instagram.");

  const voice = facts.find((f) => f.kb === "brand" && f.key === "voice")?.value.toLowerCase() ?? "";
  let language: Intent["language"] = "english";
  if (/\bhinglish\b/.test(t)) language = "hinglish";
  else if (/\bhindi\b|[ऀ-ॿ]/.test(t)) language = "hindi";
  else if (/hinglish/.test(voice)) { language = "hinglish"; assumptions.push("Language set to Hinglish from the client's brand voice."); }
  return { objective, days, platform, language, assumptions, mentionsOtherClient: mentioned ? mentioned.name : null };
}
