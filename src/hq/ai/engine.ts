import { z } from "zod";
import { makeContext, type AgentDefinition } from "../agents/base";
import { agentIds, type AgentId, type AgentOutput, type Client, type Fact, type FactStatus, type Task } from "../types";
import type { StorePort } from "../port";
import { BudgetGuard } from "./budget";
import { costUsd, priceFor, worstCaseUsd } from "./pricing";
import type { LlmProvider, Usage } from "./types";

export const aiOutputSchema = z.object({
  summary: z.string().min(10).max(1200),
  findings: z.array(z.object({ text: z.string().min(5).max(800), factIds: z.array(z.string()).min(1) })).max(20),
  recommendations: z.array(z.string().min(5).max(500)).max(12),
  missingInfo: z.array(z.string().max(300)).max(15).default([]),
  handoffs: z.array(z.object({ toAgent: z.enum(agentIds), note: z.string().max(300) })).max(6).default([]),
});
export type AiOutput = z.infer<typeof aiOutputSchema>;

const CERTAINTY: FactStatus[] = ["NEEDS VERIFICATION", "ASSUMPTION", "INFERRED", "RESEARCHED", "CLIENT-PROVIDED", "VERIFIED"];
const MAX_FACT_CHARS = 700, MAX_CONTEXT_CHARS = 28_000;

const SCHEMA_TEXT = `Reply with ONLY one JSON object, no prose, no code fences:
{"summary": string (10-1200 chars),
 "findings": [{"text": string, "factIds": [string, ...at least one id from the facts list]}],
 "recommendations": [string, ...up to 12 concrete next actions],
 "missingInfo": [string, ...information you needed but the facts do not contain],
 "handoffs": [{"toAgent": one of ${agentIds.join("|")}, "note": string}]}`;

const RULES = `Rules: use ONLY the facts provided for this client. Every finding must cite fact ids from the list. Never invent statistics, results, reviews, prices or sources; if something is not in the facts, put it in missingInfo. Respect "doNotSay". You cannot publish, spend money or message anyone; propose actions for human approval.`;

type Meta = { provider: string; model: string; calls: number; inputTokens: number; outputTokens: number; costUsd: number };
export type EngineOptions = { provider: LlmProvider; budget: BudgetGuard; store: StorePort; modelFor: (a: AgentId) => string; maxTokens?: number; repairAttempts?: number };

export class AiEngine {
  constructor(private o: EngineOptions) {}
  get provider() { return this.o.provider; }
  get mode() { return this.o.provider.isMock ? "mock" : "live"; }

  /** Retrieval: this client's permitted facts only, agent-relevant keys first, size-capped. */
  select(def: AgentDefinition, facts: Fact[]) {
    const focus = new Set(def.needs.map((n) => n.key));
    const ranked = [...facts].sort((a, b) => Number(focus.has(b.key.split("@")[0])) - Number(focus.has(a.key.split("@")[0])));
    const chosen: Fact[] = []; let size = 0; let trimmed = 0;
    for (const f of ranked) {
      const v = f.value.length > MAX_FACT_CHARS ? f.value.slice(0, MAX_FACT_CHARS) + "…" : f.value;
      if (size + v.length > MAX_CONTEXT_CHARS) { trimmed++; continue; }
      size += v.length; chosen.push({ ...f, value: v });
    }
    return { chosen, trimmed };
  }

  /** Runs the AI step on top of the deterministic result. Returns the merged output; never throws for AI-output problems (falls back, visibly). */
  async enhance(i: { task: Task; client: Client; def: AgentDefinition; facts: Fact[]; rules: AgentOutput }): Promise<AgentOutput> {
    const { task, client, def, rules } = i;
    const meta: Meta = { provider: this.o.provider.id, model: this.o.modelFor(def.id as AgentId), calls: 0, inputTokens: 0, outputTokens: 0, costUsd: 0 };
    if (rules.insufficientData) return { ...rules, meta: { ...meta, mode: "rules", calls: 0, note: "AI skipped: not enough stored data for this agent (no cost, nothing invented)" } };

    const { chosen, trimmed } = this.select(def, i.facts);
    const payload = { agent: def.id, task: task.description, client: { name: client.name, doNotSay: client.doNotSay }, facts: chosen.map((f) => ({ id: f.id, kb: f.kb, key: f.key, status: f.status, value: f.value, source: f.source })), workspaceAnalysis: { summary: rules.summary, missingInfo: rules.missingInfo } };
    const system = `${def.instructions}\n\n${RULES}\n\n${SCHEMA_TEXT}`;
    let user = `Do your job for this client using only these facts.\n${JSON.stringify(payload)}`;
    const price = priceFor(meta.model);
    const maxTokens = this.o.maxTokens ?? 2000;
    if (trimmed > 0) await this.o.store.log({ clientId: client.id, actor: def.id, action: "ai.context_trimmed", detail: `${task.id}: ${trimmed} fact(s) omitted to fit the size cap` });
    let parsed: AiOutput | null = null; let lastError = "";

    for (let attempt = 0; attempt <= (this.o.repairAttempts ?? 1) && !parsed; attempt++) {
      const release = await this.o.budget.reserve(task.runId, worstCaseUsd(price, system.length + user.length, maxTokens)); // throws BudgetExceededError
      let usage: Usage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0 }; let text = ""; let model = meta.model;
      const started = Date.now();
      try {
        const r = await this.o.provider.complete({ model: meta.model, system, user, maxTokens });
        usage = r.usage; text = r.text; model = r.model;
      } finally {
        // record spend even if the call failed after usage was incurred; on pre-flight failures usage is zero
        const cost = costUsd(price, usage);
        meta.calls += 1; meta.inputTokens += usage.inputTokens; meta.outputTokens += usage.outputTokens; meta.costUsd += cost;
        this.o.budget.addRunSpend(task.runId, cost);
        if (usage.inputTokens + usage.outputTokens > 0) await this.o.store.recordUsage({ clientId: client.id, taskId: task.id, agent: def.id, provider: this.o.provider.id, model, ...usage, costUsd: cost, at: new Date().toISOString() });
        release();
        void started;
      }
      const res = parseAi(text);
      if (res.ok) parsed = res.value;
      else { lastError = res.error; user = `${user}\n\nYour previous reply was rejected: ${res.error}. Reply again with ONLY the JSON object.`; }
    }
    if (!parsed) {
      await this.o.store.log({ clientId: client.id, actor: def.id, action: "ai.invalid_output", detail: `${task.id}: ${lastError}`.slice(0, 300) });
      return { ...rules, meta: { ...meta, mode: "rules-fallback", note: `AI output failed validation after ${meta.calls} call(s) (${lastError.slice(0, 120)}); showing deterministic result only` } };
    }
    return merge(rules, parsed, chosen, meta);
  }
}

function parseAi(text: string): { ok: true; value: AiOutput } | { ok: false; error: string } {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return { ok: false, error: "no JSON object found" };
  let raw: unknown; try { raw = JSON.parse(m[0]); } catch { return { ok: false, error: "invalid JSON" }; }
  const v = aiOutputSchema.safeParse(raw);
  return v.success ? { ok: true, value: v.data } : { ok: false, error: v.error.issues.slice(0, 3).map((x) => `${x.path.join(".")}: ${x.message}`).join("; ") };
}

/** Grounding: AI findings survive only if they cite fact ids that exist in THIS client's provided facts. */
function merge(rules: AgentOutput, ai: AiOutput, facts: Fact[], meta: Meta): AgentOutput {
  const byId = new Map(facts.map((f) => [f.id, f]));
  let dropped = 0;
  const aiFindings = ai.findings.flatMap((f) => {
    const cited = f.factIds.map((id) => byId.get(id)).filter((x): x is Fact => Boolean(x));
    if (cited.length === 0) { dropped++; return []; }
    const status = cited.map((c) => c.status).sort((a, b) => CERTAINTY.indexOf(a) - CERTAINTY.indexOf(b))[0];
    return [{ text: `AI: ${f.text}`, sources: cited.map((c) => `${c.id} · ${c.source}`), status }];
  });
  const missing = [...new Set([...rules.missingInfo, ...ai.missingInfo])];
  return {
    ...rules,
    summary: ai.summary,
    findings: [...rules.findings, ...aiFindings],
    missingInfo: missing,
    recommendations: [...ai.recommendations.map((r) => `AI: ${r}`), ...rules.recommendations],
    handoffs: [...rules.handoffs, ...ai.handoffs],
    meta: { ...meta, mode: "ai", droppedFindings: dropped },
  };
}

export { makeContext };
