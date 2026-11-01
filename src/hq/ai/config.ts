import type { StorePort } from "../port";
import type { AgentId } from "../types";
import { BudgetGuard, DEFAULT_CAPS } from "./budget";
import { AiEngine } from "./engine";
import { MockProvider } from "./mock";
import { anthropicProvider, openAiCompatProvider, withConcurrencyLimit } from "./providers";
import { AiDisabledError } from "./types";

const BULK: AgentId[] = ["client_ops", "analytics", "lead_crm"];
const num = (v: string | undefined, d: number) => (v !== undefined && v !== "" && Number.isFinite(Number(v)) ? Number(v) : d);

/**
 * HQ_AI = off (default) | mock | live.  Live additionally requires a key AND HQ_AI_SPEND_APPROVED=1, a deliberate tripwire so paid calls
 * cannot start by accident. Keys are read from the environment only and are never logged.
 */
export function aiEngineFromEnv(store: StorePort, env: Record<string, string | undefined> = process.env): AiEngine | undefined {
  const mode = (env.HQ_AI ?? "off").toLowerCase();
  if (mode === "off" || mode === "") return undefined;
  const caps = { runUsd: num(env.HQ_AI_RUN_CAP_USD, DEFAULT_CAPS.runUsd), dailyUsd: num(env.HQ_AI_DAILY_CAP_USD, DEFAULT_CAPS.dailyUsd), monthlyUsd: num(env.HQ_AI_MONTHLY_CAP_USD, DEFAULT_CAPS.monthlyUsd) };
  const concurrency = num(env.HQ_AI_MAX_CONCURRENT, 8);
  if (mode === "mock") {
    const provider = new MockProvider({ latencyMs: num(env.HQ_MOCK_LATENCY_MS, 20) });
    return new AiEngine({ provider: withConcurrencyLimit(provider, concurrency), budget: new BudgetGuard(store, caps, true), store, modelFor: (a) => (BULK.includes(a) ? "mock-haiku" : "mock-sonnet") });
  }
  if (mode !== "live" && mode !== "on") throw new AiDisabledError(`Unknown HQ_AI mode "${mode}" (use off | mock | live)`);
  if (env.HQ_AI_SPEND_APPROVED !== "1") throw new AiDisabledError("Live AI is blocked: set HQ_AI_SPEND_APPROVED=1 only after the owner has approved provider and budget.");
  const kind = env.HQ_AI_PROVIDER ?? "anthropic";
  let provider;
  if (kind === "anthropic") { if (!env.ANTHROPIC_API_KEY) throw new AiDisabledError("ANTHROPIC_API_KEY is not set"); provider = anthropicProvider({ apiKey: env.ANTHROPIC_API_KEY, effort: (env.HQ_AI_EFFORT as "low" | "medium" | "high") ?? "medium" }); }
  else if (kind === "openai-compatible") { if (!env.OPENAI_COMPAT_API_KEY || !env.OPENAI_COMPAT_BASE_URL) throw new AiDisabledError("OPENAI_COMPAT_API_KEY / OPENAI_COMPAT_BASE_URL not set"); provider = openAiCompatProvider({ apiKey: env.OPENAI_COMPAT_API_KEY, baseUrl: env.OPENAI_COMPAT_BASE_URL }); }
  else throw new AiDisabledError(`Unknown HQ_AI_PROVIDER "${kind}"`);
  const def = env.HQ_MODEL_DEFAULT ?? "claude-sonnet-5-5", bulk = env.HQ_MODEL_BULK ?? "claude-haiku-5-5";
  return new AiEngine({ provider: withConcurrencyLimit(provider, concurrency), budget: new BudgetGuard(store, caps, false), store, modelFor: (a) => env[`HQ_MODEL_${a.toUpperCase()}`] ?? (BULK.includes(a) ? bulk : def) });
}

/** Safe-to-display description of the AI setup. Never includes keys. */
export function describeAi(env: Record<string, string | undefined> = process.env) {
  const mode = (env.HQ_AI ?? "off").toLowerCase();
  const caps = { runUsd: num(env.HQ_AI_RUN_CAP_USD, DEFAULT_CAPS.runUsd), dailyUsd: num(env.HQ_AI_DAILY_CAP_USD, DEFAULT_CAPS.dailyUsd), monthlyUsd: num(env.HQ_AI_MONTHLY_CAP_USD, DEFAULT_CAPS.monthlyUsd) };
  const liveBlockers: string[] = [];
  if (mode === "live" || mode === "on") {
    if (env.HQ_AI_SPEND_APPROVED !== "1") liveBlockers.push("spend not approved (HQ_AI_SPEND_APPROVED)");
    if ((env.HQ_AI_PROVIDER ?? "anthropic") === "anthropic" && !env.ANTHROPIC_API_KEY) liveBlockers.push("ANTHROPIC_API_KEY not set");
  }
  const label = mode === "mock" ? "MOCK" : mode === "live" || mode === "on" ? (liveBlockers.length ? "BLOCKED" : "LIVE") : "OFF";
  return { mode: label, caps, liveBlockers, provider: env.HQ_AI_PROVIDER ?? "anthropic", models: { default: env.HQ_MODEL_DEFAULT ?? "claude-sonnet-5-5", bulk: env.HQ_MODEL_BULK ?? "claude-haiku-5-5" } };
}
