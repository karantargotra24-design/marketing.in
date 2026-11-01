import { RecoverableError } from "../errors";
import { estimateTokens } from "./pricing";
import type { LlmProvider, LlmRequest, LlmResponse } from "./types";

/** The engine puts the JSON payload on one line starting with {"agent"; retries append text after it, so never assume it is last. */
export function extractPayload<T = unknown>(user: string): T {
  const line = user.split("\n").find((l) => l.startsWith('{"agent"'));
  return JSON.parse(line ?? "{}") as T;
}

export type MockFault = "recoverable" | "fatal" | "invalid-json" | "refusal-text" | null;
export type MockCall = { agent: string; model: string; system: string; user: string; startedAt: number; endedAt: number };

/**
 * Deterministic stand-in for a real model. Spends no money. Its answers are valid, grounded in the facts it is given, and
 * labelled "[MOCK AI]" so nobody can mistake them for real model reasoning. Instrumented so tests can PROVE concurrency.
 */
export class MockProvider implements LlmProvider {
  readonly id = "mock"; readonly isMock = true;
  inFlight = 0; maxInFlight = 0; calls: MockCall[] = [];
  constructor(private opts: { latencyMs?: number; faults?: (call: number, req: LlmRequest) => MockFault; responder?: (req: LlmRequest) => string } = {}) {}

  async complete(req: LlmRequest): Promise<LlmResponse> {
    const n = this.calls.length + 1;
    const startedAt = Date.now();
    this.inFlight++; this.maxInFlight = Math.max(this.maxInFlight, this.inFlight);
    try {
      await new Promise((r) => setTimeout(r, this.opts.latencyMs ?? 0));
      const fault = this.opts.faults?.(n, req) ?? null;
      if (fault === "recoverable") throw new RecoverableError("mock: rate limited (429)");
      if (fault === "fatal") throw new Error("mock: provider error 400");
      const text = fault === "invalid-json" ? "Sure! here is my analysis (not JSON)" : fault === "refusal-text" ? "{}" : (this.opts.responder ?? defaultResponder)(req);
      return { text, usage: { inputTokens: estimateTokens(req.system + req.user), outputTokens: estimateTokens(text), cacheReadTokens: 0 }, model: req.model, stopReason: "end_turn" };
    } finally {
      this.inFlight--;
      let agent = "?"; try { agent = extractPayload<{ agent?: string }>(req.user).agent ?? "?"; } catch { /* ignore */ }
      this.calls.push({ agent, model: req.model, system: req.system, user: req.user, startedAt, endedAt: Date.now() });
    }
  }
}

type PromptPayload = { agent: string; client: { name: string }; facts: { id: string; key: string; kb: string }[]; workspaceAnalysis: { missingInfo: string[] } };
export function defaultResponder(req: LlmRequest): string {
  const p = extractPayload<PromptPayload>(req.user);
  const cited = p.facts.slice(0, 3);
  return JSON.stringify({
    summary: `[MOCK AI] ${p.agent} reviewed ${p.facts.length} stored facts for ${p.client.name}.`,
    findings: cited.map((f) => ({ text: `[MOCK AI] "${f.key}" in the ${f.kb} knowledge base is relevant to ${p.agent}.`, factIds: [f.id] })),
    recommendations: [`[MOCK AI] Review the "${cited[0]?.key ?? "stored"}" fact before planning ${p.agent} work.`],
    missingInfo: p.workspaceAnalysis.missingInfo.slice(0, 2),
    handoffs: [],
  });
}
