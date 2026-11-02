import type { WorkspaceScope } from "../workspace";
import type { AgentId, AgentOutput, Fact, FactStatus, KnowledgeBase } from "../types";

export type Need = { kb: KnowledgeBase; key: string; why: string };

export type AgentDefinition = {
  id: AgentId;
  name: string;
  identity: string;
  /** System instructions: used verbatim as the system prompt when an LLM provider is attached. */
  instructions: string;
  responsibilities: string[];
  requiredInputs: string[];
  expectedOutputs: string[];
  tools: string[];
  /** Knowledge bases this agent may read. Enforced by WorkspaceScope. */
  knowledgePermissions: readonly KnowledgeBase[];
  qualityStandards: string[];
  communication: string;
  /** Facts this agent needs to do its job well. Missing ones are reported, never invented. */
  needs: Need[];
  /** Domain analysis over the facts the agent is allowed to see. Must not invent data. */
  analyze(ctx: AnalyzeContext): AgentOutput;
};

export type AnalyzeContext = {
  clientName: string;
  facts: Fact[];
  has(kb: KnowledgeBase, key: string): boolean;
  get(kb: KnowledgeBase, key: string): Fact | undefined;
  /** facts whose key starts with base (conflict variants use base@variant). */
  variants(kb: KnowledgeBase, base: string): Fact[];
};

/** A need can be satisfied by an equivalent key (e.g. personas/geography satisfy target_segments). */
const ALIASES: Record<string, string[]> = { target_segments: ["personas", "geography"] };

export function makeContext(clientName: string, facts: Fact[]): AnalyzeContext {
  const base = (k: string) => k.split("@")[0];
  const match = (kb: KnowledgeBase, key: string) => (f: Fact) => f.kb === kb && (base(f.key) === key || (ALIASES[key] ?? []).includes(base(f.key)));
  return {
    clientName, facts,
    has: (kb, key) => facts.some(match(kb, key)),
    get: (kb, key) => facts.find(match(kb, key)),
    variants: (kb, key) => facts.filter(match(kb, key)),
  };
}

const ref = (f: Fact) => `${f.id}${f.source ? ` · ${f.source}` : ""}`;
export const finding = (f: Fact, text?: string) => ({ text: text ?? `${f.key.split("@")[0]}: ${f.value}`, sources: [ref(f)], status: f.status as FactStatus });

/** Shared engine: grounded findings + honest gap list. Domain agents add `extra` checks. */
export function baseOutput(def: Pick<AgentDefinition, "needs" | "name">, ctx: AnalyzeContext, extra: Partial<AgentOutput> & { focusKeys?: string[]; title: string }): AgentOutput {
  const missing = def.needs.filter((n) => !ctx.has(n.kb, n.key));
  const focus = new Set(extra.focusKeys ?? def.needs.map((n) => n.key));
  const found = ctx.facts.filter((f) => focus.has(f.key.split("@")[0]));
  const insufficient = def.needs.length > 0 && missing.length * 2 > def.needs.length;
  return {
    title: extra.title,
    summary: extra.summary ?? (insufficient
      ? `INSUFFICIENT DATA for ${ctx.clientName}: ${missing.length} of ${def.needs.length} required inputs are missing. No conclusions were invented.`
      : `${def.name} reviewed ${found.length} stored fact(s) for ${ctx.clientName}; ${missing.length} required input(s) missing.`),
    findings: [...found.map((f) => finding(f)), ...(extra.findings ?? [])],
    missingInfo: [...missing.map((n) => `${n.kb}.${n.key} — ${n.why}`), ...(extra.missingInfo ?? [])],
    recommendations: extra.recommendations ?? [],
    handoffs: extra.handoffs ?? [],
    insufficientData: insufficient,
  };
}

/** Phrases that need proof before use in marketing (checked against stored facts, not the web). */
export const RISKY_CLAIM_WORDS = ["guaranteed", "100%", "cure", "best deal", "only .* left", "verified"];
/** The brand's own banned-phrase list quotes risky words on purpose; it is a rule, not a claim. */
const RULE_KEYS = new Set(["do_not_say", "approval_policy"]);
export function riskyFacts(facts: Fact[]): Fact[] {
  const re = new RegExp(RISKY_CLAIM_WORDS.join("|"), "i");
  return facts.filter((f) => !RULE_KEYS.has(f.key.split("@")[0]) && (re.test(f.value) || f.status === "NEEDS VERIFICATION"));
}
export function scope(_s: WorkspaceScope) { return _s; }
