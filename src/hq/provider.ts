import { RecoverableError } from "./orchestrator";

export type LlmProvider = { name: string; complete(system: string, user: string): Promise<string> };

/**
 * Anthropic Messages API adapter. OFF by default: only created when HQ_AI=on and ANTHROPIC_API_KEY is set.
 * Hard cap on calls per process (HQ_AI_MAX_CALLS, default 20) so a loop can never run up a bill.
 */
export function anthropicProvider(opts: { apiKey: string; model?: string; maxCalls?: number; maxTokens?: number; fetchImpl?: typeof fetch }): LlmProvider {
  let calls = 0;
  const f = opts.fetchImpl ?? fetch;
  return {
    name: `anthropic:${opts.model ?? "claude-sonnet-5-5"}`,
    async complete(system, user) {
      if (++calls > (opts.maxCalls ?? 20)) throw new Error("AI call cap reached; raise HQ_AI_MAX_CALLS with Karan's approval");
      const res = await f("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": opts.apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: opts.model ?? "claude-sonnet-5-5", max_tokens: opts.maxTokens ?? 1000, system, messages: [{ role: "user", content: user }] }),
      });
      if (res.status === 429 || res.status >= 500) throw new RecoverableError(`AI provider ${res.status}`);
      if (!res.ok) throw new Error(`AI provider error ${res.status}`);
      const data = (await res.json()) as { content?: { type: string; text?: string }[] };
      return (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
    },
  };
}

export function providerFromEnv(env = process.env): LlmProvider | undefined {
  if (env.HQ_AI !== "on" || !env.ANTHROPIC_API_KEY) return undefined;
  return anthropicProvider({ apiKey: env.ANTHROPIC_API_KEY, model: env.HQ_AI_MODEL, maxCalls: Number(env.HQ_AI_MAX_CALLS) || 20 });
}

/** Asks the model for extra, fact-grounded recommendations. Output is parsed defensively; QA still gates it. */
export async function aiRecommendations(llm: LlmProvider, system: string, clientName: string, factLines: string[]): Promise<string[]> {
  const user = `Client: ${clientName}\nFacts (id | kb.key | status | value):\n${factLines.join("\n")}\n\nReturn ONLY a JSON array of up to 5 short action recommendations grounded in these facts. No statistics unless they appear in the facts.`;
  const raw = await llm.complete(system, user);
  const m = raw.match(/\[[\s\S]*\]/);
  if (!m) return [];
  try { return (JSON.parse(m[0]) as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 5).map((r) => `AI-drafted: ${r}`); } catch { return []; }
}
