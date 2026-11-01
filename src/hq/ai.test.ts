import { describe, it, expect, beforeEach } from "vitest";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { HqStore } from "./store";
import { Orchestrator } from "./orchestrator";
import { seedWorkspaces } from "./seed";
import { SAMPLE_CLIENTS } from "./fixtures";
import { AGENT_LIST, AGENTS } from "./agents/registry";
import { makeContext } from "./agents/base";
import { AiEngine } from "./ai/engine";
import { BudgetGuard, type Caps } from "./ai/budget";
import { MockProvider, defaultResponder, extractPayload, type MockFault } from "./ai/mock";
import { anthropicProvider, openAiCompatProvider, withConcurrencyLimit } from "./ai/providers";
import { aiEngineFromEnv } from "./ai/config";
import { costUsd, priceFor, PRICES } from "./ai/pricing";
import { AiRefusalError, RecoverableError, type LlmProvider } from "./ai/types";
import { renderAgentOutput } from "./render";
import { qaReview } from "./qa";

let store: HqStore;
beforeEach(async () => {
  store = new HqStore(await mkdtemp(path.join(tmpdir(), "hq-ai-")));
  await seedWorkspaces(store, true, SAMPLE_CLIENTS);
  // give every agent all the inputs it needs so AI is not skipped for "insufficient data"
  for (const c of ["propedia", "pahadi-origin"]) for (const a of AGENT_LIST) for (const n of a.needs)
    if (!(await store.listFacts(c)).some((f) => f.kb === n.kb && f.key === n.key)) await store.putFact({ clientId: c, kb: n.kb, key: n.key, value: `[test] ${n.key} for ${c} ZZ-${c}`, status: "CLIENT-PROVIDED", source: "test" });
});

const CAPS: Caps = { runUsd: 5, dailyUsd: 50, monthlyUsd: 500 };
const engine = (provider: LlmProvider, caps: Caps = CAPS, opts: Partial<ConstructorParameters<typeof AiEngine>[0]> = {}) =>
  new AiEngine({ provider, budget: new BudgetGuard(store, caps, provider.isMock), store, modelFor: () => "mock-sonnet", ...opts });
const orch = (ai: AiEngine, extra = {}) => new Orchestrator(store, { ai, retryDelayMs: 1, ...extra });
const read = async (cid: string, p: string) => readFile(path.join(store.clientDir(cid), "outputs", p.split("/").pop()!), "utf8");

describe("all 12 agents (rule-based analyzers) actually execute", () => {
  it.each(AGENT_LIST.map((a) => a.id))("%s produces valid structured output", async (id) => {
    const facts = await store.listFacts("propedia");
    const o = AGENTS[id].analyze(makeContext("Propedia", facts));
    expect(o.title).toBeTruthy(); expect(Array.isArray(o.findings)).toBe(true); expect(Array.isArray(o.recommendations)).toBe(true);
    expect(renderAgentOutput(o, { clientId: "propedia", clientName: "Propedia", taskId: "t", agent: id, at: "now" })).toContain("## Recommendations");
  });
  it("paid_ads and lead_crm run end to end through the orchestrator", async () => {
    for (const a of ["paid_ads", "lead_crm"] as const) {
      const { runId } = await new Orchestrator(store).planSingle("propedia", a, `check ${a}`);
      const r = await new Orchestrator(store).execute(runId);
      expect(r.tasks[0].status).toMatch(/UNDER REVIEW|WAITING FOR INPUT/);
    }
  });
});

describe("pricing and cost accounting", () => {
  it("computes cost per million tokens, including cached input", () => {
    expect(costUsd(PRICES["claude-sonnet-5-5"], { inputTokens: 1_000_000, outputTokens: 1_000_000, cacheReadTokens: 0 })).toBeCloseTo(12);
    expect(costUsd(PRICES["claude-haiku-5-5"], { inputTokens: 1_000_000, outputTokens: 0, cacheReadTokens: 0 })).toBeCloseTo(0.1);
    expect(costUsd(PRICES["claude-sonnet-5-5"], { inputTokens: 1_000_000, outputTokens: 0, cacheReadTokens: 1_000_000 })).toBeCloseTo(0.2);
  });
  it("refuses unknown models unless a price is configured (limits could not be enforced)", () => {
    expect(() => priceFor("some-new-model", {})).toThrow(/No price known/);
    expect(priceFor("some-new-model", { HQ_PRICE_IN_PER_M: "1", HQ_PRICE_OUT_PER_M: "3" })).toMatchObject({ in: 1, out: 3 });
  });
});

describe("genuine parallel AI execution (mock provider)", () => {
  it("runs the 7 named agents concurrently, with measurable overlap", async () => {
    const mock = new MockProvider({ latencyMs: 150 });
    const t0 = Date.now();
    const r = await orch(engine(mock)).runWorkflow("propedia", "full_review");
    const wall = Date.now() - t0;
    const specialists = r.tasks.filter((t) => t.step === "agent");
    expect(specialists.map((t) => t.agent).sort()).toEqual(["analytics", "audit_strategy", "content", "creative", "research", "seo_web", "social"]);
    expect(mock.calls.length).toBe(7);
    expect(mock.maxInFlight).toBe(7);                         // all seven model calls were in flight at the same instant
    expect(wall).toBeLessThan(7 * 150 * 0.7);                  // sequential would be >= 1050ms
    const starts = mock.calls.map((c) => c.startedAt), ends = mock.calls.map((c) => c.endedAt);
    expect(Math.max(...starts)).toBeLessThan(Math.min(...ends)); // every call started before any call finished
    for (const t of specialists) expect(["COMPLETED", "WAITING FOR INPUT"]).toContain(t.status);
    const cons = r.tasks.find((t) => t.step === "consolidate")!;
    for (const s of specialists) expect(cons.startedAt! >= s.completedAt!).toBe(true);
  });
  it("marks every specialist output as AI-produced and records usage + execution history", async () => {
    const mock = new MockProvider({ latencyMs: 5 });
    const r = await orch(engine(mock)).runWorkflow("propedia", "full_review");
    const md = await read("propedia", r.tasks.find((t) => t.agent === "research")!.outputPath!);
    expect(md).toMatch(/Produced by: AI \(mock/);
    expect(md).toContain("[MOCK AI]");
    const usage = await store.listUsage({ clientId: "propedia" });
    expect(usage.length).toBe(7);
    expect(usage.every((u) => u.provider === "mock" && u.costUsd > 0 && u.inputTokens > 0 && u.taskId)).toBe(true);
    const hist = await store.listExecutions({ runId: r.runId });
    expect(hist.length).toBe(10);                               // 7 agents + consolidate + qa + deliver
    expect(hist.filter((h) => h.mode === "ai").length).toBe(7);
    expect(hist.reduce((a, h) => a + h.costUsd, 0)).toBeCloseTo(usage.reduce((a, u) => a + u.costUsd, 0), 6);
  });
  it("respects the provider concurrency limit", async () => {
    const mock = new MockProvider({ latencyMs: 30 });
    await orch(engine(withConcurrencyLimit(mock, 2))).runWorkflow("propedia", "full_review");
    expect(mock.maxInFlight).toBe(2);
  });
  it("AI off: output is rule-based and labelled so", async () => {
    const r = await new Orchestrator(store).runWorkflow("propedia", "onboarding");
    const md = await read("propedia", r.tasks[0].outputPath!);
    expect(md).not.toMatch(/Produced by: AI/);
  });
  it("skips the AI call (no cost) when the workspace lacks the data to reason about", async () => {
    const mock = new MockProvider();
    const r = await orch(engine(mock)).runWorkflow("karan-personal-brand", "onboarding"); // sparse workspace
    const waiting = r.tasks.filter((t) => t.status === "WAITING FOR INPUT");
    expect(waiting.length).toBeGreaterThan(0);
    expect(mock.calls.length).toBeLessThan(r.tasks.filter((t) => t.step === "agent").length);
  });
});

describe("context isolation for AI prompts", () => {
  it("never sends one client's facts to a model call made for another", async () => {
    const mock = new MockProvider({ latencyMs: 20 });
    const ai = engine(mock);
    await Promise.all([orch(ai).runWorkflow("propedia", "full_review"), orch(ai).runWorkflow("pahadi-origin", "full_review")]);
    expect(mock.calls.length).toBeGreaterThanOrEqual(10);
    const pFacts = await store.listFacts("propedia"), aFacts = await store.listFacts("pahadi-origin");
    for (const c of mock.calls) {
      const owner = c.user.includes("ZZ-propedia") ? "propedia" : c.user.includes("ZZ-pahadi-origin") ? "pahadi-origin" : null;
      expect(owner, "prompt must belong to exactly one client").not.toBeNull();
      const other = owner === "propedia" ? "pahadi-origin" : "propedia";
      expect(c.user).not.toContain(`ZZ-${other}`);
      for (const f of owner === "propedia" ? aFacts : pFacts) expect(c.user).not.toContain(f.id);
      expect(c.system + c.user).not.toMatch(/Karan Targotra \(Personal Brand\)/);
    }
  });
  it("only sends knowledge bases the agent is permitted to read", async () => {
    const mock = new MockProvider();
    const { runId } = await orch(engine(mock)).planSingle("propedia", "analytics", "perf check");
    await orch(engine(mock)).execute(runId);
    const sent = extractPayload<{ facts: { kb: string }[] }>(mock.calls[0].user);
    const allowed = new Set<string>(AGENTS.analytics.knowledgePermissions);
    expect(sent.facts.length).toBeGreaterThan(0);
    expect(sent.facts.every((f) => allowed.has(f.kb))).toBe(true);
  });
});

describe("structured output, grounding and repair", () => {
  const responder = (fn: (p: { facts: { id: string }[] }) => unknown) => (req: { user: string }) => JSON.stringify(fn(extractPayload(req.user)));
  const run = async (mock: MockProvider, agent: "research" | "audit_strategy" = "research") => {
    const { runId } = await orch(engine(mock)).planSingle("propedia", agent, "t");
    const r = await orch(engine(mock)).execute(runId);
    return { task: r.tasks[0], md: r.tasks[0].outputPath ? await read("propedia", r.tasks[0].outputPath) : "" };
  };
  it("drops findings that cite facts which are not in this client's context", async () => {
    const mock = new MockProvider({ responder: responder((p) => ({ summary: "A valid summary of the work.", findings: [{ text: "Invented claim", factIds: ["fact_does_not_exist"] }, { text: "Grounded claim", factIds: [p.facts[0].id] }], recommendations: ["Do the next sensible thing"], missingInfo: [], handoffs: [] })) as never });
    const { md } = await run(mock);
    expect(md).toContain("Grounded claim"); expect(md).not.toContain("Invented claim");
  });
  it("repairs invalid JSON with one extra call, and records both calls", async () => {
    const mock = new MockProvider({ faults: (n) => (n === 1 ? "invalid-json" : null) });
    const { task, md } = await run(mock);
    expect(mock.calls.length).toBe(2);
    expect(mock.calls[1].user).toContain("previous reply was rejected");
    expect(md).toMatch(/Produced by: AI/);
    expect(task.status).not.toBe("FAILED");
    expect((await store.listUsage({ clientId: "propedia" })).length).toBe(2);
  });
  it("falls back visibly to rule-based output when the model keeps returning invalid output", async () => {
    const mock = new MockProvider({ faults: () => "invalid-json" });
    const { task, md } = await run(mock);
    expect(mock.calls.length).toBe(2);
    expect(md).toMatch(/Produced by: RULES \(AI output failed validation\)/);
    expect(task.status).not.toBe("FAILED"); // deliverable still produced, honestly labelled
    expect((await store.readLog(100)).some((l) => l.action === "ai.invalid_output")).toBe(true);
  });
  it("QA still blocks AI prose containing invented statistics", async () => {
    const mock = new MockProvider({ responder: responder((p) => ({ summary: "Summary of what was reviewed.", findings: [{ text: "A grounded finding", factIds: [p.facts[0].id] }], recommendations: ["Expect 340% ROAS in 30 days"], missingInfo: [], handoffs: [] })) as never });
    const { runId } = await orch(engine(mock)).planSingle("propedia", "research", "t");
    const full = await orch(engine(mock)).runWorkflow("propedia", "onboarding"); // has QA step
    void runId;
    expect(full.tasks.some((t) => t.reviewStatus === "REVISION_REQUESTED")).toBe(true);
    const md = await read("propedia", full.tasks[0].outputPath!);
    expect(qaReview({ doc: "d", markdown: md, clientName: "Propedia", corpus: "", doNotSay: [], otherClientNames: [] }).issues.some((i) => i.rule === "unsourced-number")).toBe(true);
  });
});

describe("errors and retries with AI", () => {
  it("retries recoverable provider errors and records each attempt in execution history", async () => {
    const mock = new MockProvider({ faults: (n) => (n <= 2 ? "recoverable" : null) });
    const { runId } = await orch(engine(mock)).planSingle("propedia", "research", "t");
    const r = await orch(engine(mock)).execute(runId);
    expect(r.tasks[0].attempts).toBe(3);
    expect(r.tasks[0].status).not.toBe("FAILED");
    expect((await store.listExecutions({ runId })).map((h) => h.outcome)).toEqual(["retrying", "retrying", "ok"]);
  });
  it("fails the task (not silently) on a fatal provider error, and does not retry", async () => {
    const mock = new MockProvider({ faults: () => "fatal" });
    const { runId } = await orch(engine(mock)).planSingle("propedia", "research", "t");
    const r = await orch(engine(mock)).execute(runId);
    expect(mock.calls.length).toBe(1);
    expect(r.tasks[0].status).toBe("FAILED");
    expect(r.tasks[0].error).toMatch(/provider error/);
    expect((await store.listExecutions({ runId }))[0].outcome).toBe("failed");
  });
  it("one failing agent does not stop the others; consolidation reports the failure", async () => {
    const mock = new MockProvider({ latencyMs: 5, faults: (_n, req) => (req.user.includes('"agent":"seo_web"') ? "fatal" : null) });
    const r = await orch(engine(mock)).runWorkflow("propedia", "full_review");
    expect(r.tasks.find((t) => t.agent === "seo_web")!.status).toBe("FAILED");
    expect(r.tasks.filter((t) => t.step === "agent" && t.status !== "FAILED").length).toBe(6);
    expect(await read("propedia", r.finalReport!)).toMatch(/SEO & Website.*FAILED/);
  });
});

describe("spend limits", () => {
  it("blocks calls that would exceed the per-run cap: tasks wait for approval, nothing is overspent", async () => {
    const mock = new MockProvider({ latencyMs: 20 });
    const price = priceFor("mock-sonnet");
    const ai = engine(mock, { runUsd: 0.05, dailyUsd: 50, monthlyUsd: 500 });
    const r = await orch(ai).runWorkflow("propedia", "full_review");
    const waiting = r.tasks.filter((t) => t.status === "WAITING FOR APPROVAL");
    expect(waiting.length).toBeGreaterThan(0);
    expect(waiting[0].error).toMatch(/spend limit reached/);
    const spent = (await store.listUsage()).reduce((a, u) => a + u.costUsd, 0);
    expect(spent).toBeLessThanOrEqual(0.05 + 1e-9);
    expect(price.out).toBeGreaterThan(0);
    expect(r.tasks.find((t) => t.step === "consolidate")!.status).not.toBe("PENDING"); // run still finishes and reports
    expect((await store.listExecutions({ runId: r.runId })).some((h) => h.outcome === "waiting_approval")).toBe(true);
  });
  it("parallel reservations cannot jointly exceed the daily cap", async () => {
    const mock = new MockProvider({ latencyMs: 30 });
    const ai = engine(mock, { runUsd: 100, dailyUsd: 0.03, monthlyUsd: 100 }); // each call reserves ~$0.0206 worst case
    await orch(ai).runWorkflow("propedia", "full_review");
    const r = (await store.listTasks()).filter((t) => t.step === "agent");
    expect(mock.calls.length).toBeLessThanOrEqual(2);             // 7 started at once; only what fits under the cap was allowed
    expect(r.filter((t) => t.status === "WAITING FOR APPROVAL").length).toBeGreaterThanOrEqual(5);
    expect((await store.listUsage()).reduce((a, u) => a + u.costUsd, 0)).toBeLessThanOrEqual(0.03);
  });
  it("counts spend already in the ledger (monthly cap)", async () => {
    await store.recordUsage({ clientId: "propedia", taskId: null, agent: "x", provider: "mock", model: "mock-sonnet", inputTokens: 1, outputTokens: 1, cacheReadTokens: 0, costUsd: 9.99, at: new Date().toISOString() });
    const mock = new MockProvider();
    const r = await orch(engine(mock, { runUsd: 100, dailyUsd: 100, monthlyUsd: 10 })).runWorkflow("propedia", "onboarding");
    expect(mock.calls.length).toBe(0);
    expect(r.tasks.some((t) => t.status === "WAITING FOR APPROVAL")).toBe(true);
  });
  it("mock spend never counts against live budgets (and vice versa)", async () => {
    await store.recordUsage({ clientId: "propedia", taskId: null, agent: "x", provider: "anthropic", model: "claude-sonnet-5-5", inputTokens: 1, outputTokens: 1, cacheReadTokens: 0, costUsd: 99, at: new Date().toISOString() });
    const mock = new MockProvider();
    await orch(engine(mock, { runUsd: 5, dailyUsd: 1, monthlyUsd: 1 })).runWorkflow("propedia", "onboarding");
    expect(mock.calls.length).toBeGreaterThan(0);
  });
});

describe("configuration and secrets", () => {
  it("is off by default", () => expect(aiEngineFromEnv(store, {})).toBeUndefined());
  it("mock mode needs no key", () => expect(aiEngineFromEnv(store, { HQ_AI: "mock" })?.mode).toBe("mock"));
  it("live mode is blocked without explicit spend approval, even with a key", () => {
    expect(() => aiEngineFromEnv(store, { HQ_AI: "live", ANTHROPIC_API_KEY: "sk-ant-SECRETVALUE123456789" })).toThrow(/HQ_AI_SPEND_APPROVED/);
  });
  it("live mode needs a key and never echoes it", () => {
    expect(() => aiEngineFromEnv(store, { HQ_AI: "live", HQ_AI_SPEND_APPROVED: "1" })).toThrow(/ANTHROPIC_API_KEY is not set/);
    try { aiEngineFromEnv(store, { HQ_AI: "live", ANTHROPIC_API_KEY: "sk-ant-SECRETVALUE123456789" }); } catch (e) { expect(String(e)).not.toContain("SECRETVALUE"); }
  });
  it("rejects unknown modes and providers", () => {
    expect(() => aiEngineFromEnv(store, { HQ_AI: "banana" })).toThrow(/Unknown HQ_AI mode/);
    expect(() => aiEngineFromEnv(store, { HQ_AI: "live", HQ_AI_SPEND_APPROVED: "1", HQ_AI_PROVIDER: "x" })).toThrow(/Unknown HQ_AI_PROVIDER/);
  });
  it("live mode builds an engine when approved and keyed (no network call is made)", () => {
    const e = aiEngineFromEnv(store, { HQ_AI: "live", HQ_AI_SPEND_APPROVED: "1", ANTHROPIC_API_KEY: "sk-ant-x" });
    expect(e?.mode).toBe("live");
  });
});

describe("real-provider adapters against a fake HTTP layer (no real network, no spend)", () => {
  const json = (body: unknown, status = 200) => (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
  const req = { model: "claude-sonnet-5-5", system: "s", user: "u", maxTokens: 100 };
  it("anthropic: sends key in header only, no sampling params, parses usage", async () => {
    let seen: { headers: Record<string, string>; body: Record<string, unknown> } | undefined;
    const f = (async (_u: string, init: RequestInit) => { seen = { headers: init.headers as Record<string, string>, body: JSON.parse(init.body as string) }; return new Response(JSON.stringify({ content: [{ type: "text", text: "hi" }], usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 3 }, stop_reason: "end_turn" })); }) as unknown as typeof fetch;
    const r = await anthropicProvider({ apiKey: "sk-ant-KEY", fetchImpl: f }).complete(req);
    expect(r).toMatchObject({ text: "hi", usage: { inputTokens: 10, outputTokens: 5, cacheReadTokens: 3 } });
    expect(seen!.headers["x-api-key"]).toBe("sk-ant-KEY");
    expect(JSON.stringify(seen!.body)).not.toContain("sk-ant-KEY");
    expect(seen!.body).not.toHaveProperty("temperature");
  });
  it("anthropic: 429/5xx/network errors are recoverable; 400 is fatal and never echoes the body or key", async () => {
    await expect(anthropicProvider({ apiKey: "k", fetchImpl: json({}, 429) }).complete(req)).rejects.toBeInstanceOf(RecoverableError);
    await expect(anthropicProvider({ apiKey: "k", fetchImpl: json({}, 529) }).complete(req)).rejects.toBeInstanceOf(RecoverableError);
    await expect(anthropicProvider({ apiKey: "k", fetchImpl: (async () => { throw new Error("socket hang up"); }) as unknown as typeof fetch }).complete(req)).rejects.toBeInstanceOf(RecoverableError);
    const bad = anthropicProvider({ apiKey: "sk-ant-KEY", fetchImpl: json({ error: { message: "echo of sk-ant-KEY and prompt" } }, 400) });
    await expect(bad.complete(req)).rejects.toThrow(/error 400$/);
    await expect(bad.complete(req)).rejects.not.toThrow(/sk-ant-KEY/);
  });
  it("anthropic: a refusal is a distinct, non-retried error", async () => {
    await expect(anthropicProvider({ apiKey: "k", fetchImpl: json({ content: [], stop_reason: "refusal" }) }).complete(req)).rejects.toBeInstanceOf(AiRefusalError);
  });
  it("openai-compatible adapter parses text and usage", async () => {
    const r = await openAiCompatProvider({ apiKey: "k", baseUrl: "https://x.test/v1/", fetchImpl: json({ choices: [{ message: { content: "yo" } }], usage: { prompt_tokens: 7, completion_tokens: 2 } }) }).complete(req);
    expect(r).toMatchObject({ text: "yo", usage: { inputTokens: 7, outputTokens: 2 } });
  });
  it("end to end: engine + anthropic adapter over the fake HTTP layer records cost from reported usage", async () => {
    const f = (async (_u: string, init: RequestInit) => {
      const b = JSON.parse(init.body as string) as { messages: { content: string }[] };
      const payload = extractPayload<{ facts: { id: string }[] }>(b.messages[0].content);
      return new Response(JSON.stringify({ content: [{ type: "text", text: JSON.stringify({ summary: "Real-shaped summary text.", findings: [{ text: "Grounded in a fact", factIds: [payload.facts[0].id] }], recommendations: ["Verify the first fact"], missingInfo: [], handoffs: [] }) }], usage: { input_tokens: 4000, output_tokens: 500 }, stop_reason: "end_turn" }));
    }) as unknown as typeof fetch;
    const ai = new AiEngine({ provider: anthropicProvider({ apiKey: "k", fetchImpl: f }), budget: new BudgetGuard(store, CAPS, false), store, modelFor: () => "claude-sonnet-5-5" });
    const { runId } = await new Orchestrator(store, { ai }).planSingle("propedia", "research", "t");
    await new Orchestrator(store, { ai }).execute(runId);
    const u = await store.listUsage({ clientId: "propedia" });
    expect(u).toHaveLength(1);
    expect(u[0]).toMatchObject({ provider: "anthropic", model: "claude-sonnet-5-5", inputTokens: 4000, outputTokens: 500 });
    expect(u[0].costUsd).toBeCloseTo((4000 * 2 + 500 * 10) / 1e6, 8);
  });
});

describe("defaults", () => { it("default mock responder is valid JSON", () => { expect(() => JSON.parse(defaultResponder({ model: "m", system: "", maxTokens: 1, user: `x\n${JSON.stringify({ agent: "a", client: { name: "c" }, facts: [], workspaceAnalysis: { missingInfo: [] } })}` }))).not.toThrow(); }); });
export type { MockFault };

import { summarizeUsage, parallelism } from "./ai/summary";
describe("usage summaries keep real and simulated money apart", () => {
  const u = (provider: string, cost: number, at = new Date().toISOString()) => ({ clientId: "propedia", taskId: null, agent: "research", provider, model: "m", inputTokens: 1, outputTokens: 1, cacheReadTokens: 0, costUsd: cost, at });
  it("never adds mock cost to real spend", () => {
    const s = summarizeUsage([u("mock", 5), u("anthropic", 0.5)]);
    expect(s.real.month.costUsd).toBeCloseTo(0.5); expect(s.simulated.month.costUsd).toBeCloseTo(5);
    expect(s.byAgent.research.costUsd).toBeCloseTo(0.5);
  });
  it("computes real overlap from recorded timestamps", () => {
    const e = (id: string, a: number, b: number) => ({ id, taskId: id, runId: "r", clientId: "c", agent: id, attempt: 1, startedAt: new Date(a).toISOString(), endedAt: new Date(b).toISOString(), outcome: "ok" as const, mode: "ai", model: "m", calls: 1, inputTokens: 0, outputTokens: 0, costUsd: 0, error: null });
    expect(parallelism([e("a", 0, 100), e("b", 10, 90), e("c", 20, 200), e("d", 300, 400)]).maxOverlap).toBe(3);
    expect(parallelism([e("a", 0, 100), e("b", 100, 200)]).maxOverlap).toBe(1);
    // a long span next to many SEQUENTIAL short ones: true peak is 2 (the old pairwise count said 4)
    expect(parallelism([e("L", 0, 1000), e("a", 0, 10), e("b", 20, 30), e("c", 40, 50)]).maxOverlap).toBe(2);
  });
});
