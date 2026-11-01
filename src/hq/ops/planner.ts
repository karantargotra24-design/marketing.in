import { AGENTS } from "../agents/registry";
import { makeContext } from "../agents/base";
import { priceFor } from "../ai/pricing";
import type { StorePort } from "../port";
import type { AgentId, Client, Plan, PlanTask, Run } from "../types";
import { parseIntent, type Objective } from "./intent";

export type AutoRunPolicy = { enabled: boolean; maxEstUsd: number; highImpact: Objective[] };
export const DEFAULT_POLICY: AutoRunPolicy = { enabled: true, maxEstUsd: 0.5, highImpact: ["campaign", "ads"] };

const T = (key: string, kind: string, agent: AgentId | "orchestrator", title: string, dependsOn: string[] = []): PlanTask => ({ key, kind, agent, title, dependsOn, estCostUsd: 0 });
const RESEARCH = [T("r_market", "research_market", "research", "Market research"), T("r_comp", "research_competitors", "research", "Competitor research"), T("r_aud", "research_audience", "research", "Audience research"), T("r_brand", "research_brand_product", "research", "Brand & product research")];
const AUDIT = [T("a_biz", "audit_business", "audit_strategy", "Business audit"), T("a_soc", "audit_social", "social", "Social media audit"), T("a_con", "audit_content", "content", "Content audit"), T("a_pos", "audit_positioning", "audit_strategy", "Positioning audit"), T("a_perf", "audit_performance", "analytics", "Performance audit")];
const ids = (xs: PlanTask[]) => xs.map((x) => x.key);

/** Task graph per objective. Independent branches have no shared dependencies, so they run in parallel. */
function graph(o: Objective, platform: string, days: number): PlanTask[] {
  const research = RESEARCH, audit = AUDIT;
  const strategy = T("strategy", "strategy", "audit_strategy", "Marketing strategy", [...ids(research), ...ids(audit)]);
  const cal = T("calendar", "content_calendar", "content", `${days}-day ${platform} content calendar`, ["strategy"]);
  const scripts = T("scripts", "reel_scripts", "video", "Reel scripts & storyboards", ["calendar"]);
  const briefs = T("briefs", "creative_briefs", "creative", "Creative briefs & prompts", ["calendar", "scripts"]);
  const ads = T("ads", "ad_plan", "paid_ads", "Advertising plan", ["strategy"]);
  const qa1 = (deps: string[]) => T("qa1", "qa", "qa", "Quality assurance (facts, claims, brand, language, specs)", deps);
  const rev = T("revise", "revise", "orchestrator", "Revise blocked items from QA feedback", ["qa1"]);
  const qa2 = T("qa2", "qa", "qa", "Final quality check", ["revise"]);
  const pkg = (title: string) => T("package", "package", "orchestrator", title, ["qa2"]);
  const tail = (deps: string[], title: string) => [qa1(deps), rev, qa2, pkg(title)];
  switch (o) {
    case "campaign": return [...research, ...audit, strategy, cal, scripts, briefs, ads, ...tail(["strategy", "calendar", "scripts", "briefs", "ads"], "Campaign package for review")];
    case "content_plan": return [...research.slice(0, 1), ...research.slice(2, 4), ...audit.slice(2, 4), T("strategy", "strategy", "audit_strategy", "Content strategy", ["r_market", "r_aud", "r_brand", "a_con", "a_pos"]), cal, scripts, briefs, ...tail(["strategy", "calendar", "scripts", "briefs"], "Content package for review")];
    case "ads": return [...research.slice(0, 3), audit[0], audit[4], T("strategy", "strategy", "audit_strategy", "Advertising strategy", ["r_market", "r_comp", "r_aud", "a_biz", "a_perf"]), ads, T("briefs", "creative_briefs", "creative", "Ad creative briefs", ["ads"]), ...tail(["strategy", "ads", "briefs"], "Advertising package for review")];
    case "audit": return [...research, ...audit, ...tail(ids([...research, ...audit]), "Audit report for review")];
    case "research": return [...research, ...tail(ids(research), "Research pack for review")];
    case "strategy": case "general": return [...research, ...audit, strategy, ...tail([...ids(research), ...ids(audit), "strategy"], "Strategy pack for review")];
    case "report": return [audit[4], audit[1], ...tail(["a_perf", "a_soc"], "Performance report for review")];
  }
}

const TOKENS: Record<string, [number, number]> = { content_calendar: [5000, 3500], reel_scripts: [6000, 3000], creative_briefs: [6000, 3500], strategy: [8000, 2500], ad_plan: [6000, 2500], revise: [4000, 2000] };
export function estimateTaskCost(kind: string, agent: string, model: string): number {
  if (agent === "orchestrator" || kind === "qa" || kind === "package") return 0;
  const [i, o] = TOKENS[kind] ?? [5000, 1500];
  const p = priceFor(model);
  return (i * p.in + o * p.out) / 1e6;
}
const MODEL_FOR = (agent: string) => (["client_ops", "analytics", "lead_crm"].includes(agent) ? process.env.HQ_MODEL_BULK ?? "claude-haiku-5-5" : process.env.HQ_MODEL_DEFAULT ?? "claude-sonnet-5-5");

export async function loadPolicy(store: StorePort): Promise<AutoRunPolicy> { return { ...DEFAULT_POLICY, ...((await store.getSetting<Partial<AutoRunPolicy>>("autoRunPolicy")) ?? {}) }; }

export type PlanResult = { ok: true; plan: Plan } | { ok: false; error: string };

export async function buildPlan(store: StorePort, client: Client, instruction: string): Promise<PlanResult> {
  const text = instruction.trim();
  if (text.length < 8) return { ok: false, error: "Please describe the objective in a sentence (at least a few words)." };
  if (text.length > 1000) return { ok: false, error: "Instruction is too long (max 1000 characters)." };
  const facts = await store.listFacts(client.id);
  const others = (await store.listClients()).filter((c) => c.id !== client.id);
  const intent = parseIntent(text, client, facts, others);
  if (intent.mentionsOtherClient) return { ok: false, error: `This instruction names "${intent.mentionsOtherClient}" but the active workspace is "${client.name}". Switch client first: workspaces are never mixed.` };
  const tasks = graph(intent.objective, intent.platform, intent.days).map((t) => ({ ...t, estCostUsd: estimateTaskCost(t.kind, t.agent, MODEL_FOR(t.agent)) }));
  const estCostUsd = tasks.reduce((a, t) => a + t.estCostUsd, 0);
  const ctx = makeContext(client.name, facts);
  const agentsUsed = [...new Set(tasks.map((t) => t.agent).filter((a): a is AgentId => a !== "orchestrator"))];
  const missing = new Map<string, string>();
  for (const a of agentsUsed) for (const n of AGENTS[a].needs) if (!ctx.has(n.kb, n.key) && !missing.has(`${n.kb}.${n.key}`)) missing.set(`${n.kb}.${n.key}`, `${n.kb}.${n.key}: ${n.why}`);
  const policy = await loadPolicy(store);
  const highImpact = policy.highImpact.includes(intent.objective);
  const needsPlanApproval = !policy.enabled || highImpact || estCostUsd > policy.maxEstUsd;
  const reason = !policy.enabled ? "auto-run is switched off" : highImpact ? `"${intent.objective}" is a high-impact objective` : estCostUsd > policy.maxEstUsd ? `estimated cost $${estCostUsd.toFixed(2)} is above your auto-run limit $${policy.maxEstUsd.toFixed(2)}` : "routine internal work, within your auto-run policy";
  return { ok: true, plan: { objective: intent.objective, days: intent.days, platform: intent.platform, summary: `${intent.objective.replace("_", " ")} for ${client.name}: ${tasks.length} tasks across ${agentsUsed.length} agents`, language: intent.language, tasks, missingInfo: [...missing.values()], assumptions: intent.assumptions, highImpact, estCostUsd, needsPlanApproval, reason } };
}

/** Peak parallel width of a plan (tasks whose dependencies resolve in the same wave). Useful for UI and tests. */
export function planWaves(tasks: PlanTask[]): string[][] {
  const done = new Set<string>(); const waves: string[][] = [];
  while (done.size < tasks.length) {
    const wave = tasks.filter((t) => !done.has(t.key) && t.dependsOn.every((d) => done.has(d))).map((t) => t.key);
    if (!wave.length) throw new Error("Plan has a dependency cycle");
    wave.forEach((k) => done.add(k)); waves.push(wave);
  }
  return waves;
}
export type { Run };
