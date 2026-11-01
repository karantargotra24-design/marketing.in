import { RecoverableError } from "../errors";
import { AiRefusalError, type LlmProvider, type LlmRequest, type LlmResponse } from "./types";

const retryable = (status: number) => status === 408 || status === 429 || status >= 500;

/** Anthropic Messages API. Never constructed unless live AI is enabled AND spend approved. NOT yet tested against the real service. */
export function anthropicProvider(opts: { apiKey: string; effort?: "low" | "medium" | "high"; fetchImpl?: typeof fetch; baseUrl?: string }): LlmProvider {
  const f = opts.fetchImpl ?? fetch;
  return {
    id: "anthropic", isMock: false,
    async complete(req: LlmRequest): Promise<LlmResponse> {
      let res: Response;
      try {
        res = await f(`${opts.baseUrl ?? "https://api.anthropic.com"}/v1/messages`, {
          method: "POST",
          headers: { "x-api-key": opts.apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
          body: JSON.stringify({ model: req.model, max_tokens: req.maxTokens, system: req.system, messages: [{ role: "user", content: req.user }], output_config: { effort: opts.effort ?? "medium" } }),
        });
      } catch (e) { throw new RecoverableError(`AI provider unreachable: ${(e as Error).message}`); }
      if (retryable(res.status)) throw new RecoverableError(`AI provider ${res.status}`);
      if (!res.ok) throw new Error(`AI provider error ${res.status}`); // body deliberately not logged (may echo prompt data)
      const data = (await res.json()) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number }; stop_reason?: string; model?: string };
      if (data.stop_reason === "refusal") throw new AiRefusalError("The model declined this request");
      return {
        text: (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join(""),
        usage: { inputTokens: data.usage?.input_tokens ?? 0, outputTokens: data.usage?.output_tokens ?? 0, cacheReadTokens: data.usage?.cache_read_input_tokens ?? 0 },
        model: data.model ?? req.model, stopReason: data.stop_reason,
      };
    },
  };
}

/** Any OpenAI-compatible chat-completions endpoint (needs explicit prices via HQ_PRICE_*). NOT yet tested against a real service. */
export function openAiCompatProvider(opts: { baseUrl: string; apiKey: string; fetchImpl?: typeof fetch }): LlmProvider {
  const f = opts.fetchImpl ?? fetch;
  return {
    id: "openai-compatible", isMock: false,
    async complete(req) {
      let res: Response;
      try {
        res = await f(`${opts.baseUrl.replace(/\/$/, "")}/chat/completions`, {
          method: "POST", headers: { authorization: `Bearer ${opts.apiKey}`, "content-type": "application/json" },
          body: JSON.stringify({ model: req.model, max_tokens: req.maxTokens, messages: [{ role: "system", content: req.system }, { role: "user", content: req.user }] }),
        });
      } catch (e) { throw new RecoverableError(`AI provider unreachable: ${(e as Error).message}`); }
      if (retryable(res.status)) throw new RecoverableError(`AI provider ${res.status}`);
      if (!res.ok) throw new Error(`AI provider error ${res.status}`);
      const d = (await res.json()) as { choices?: { message?: { content?: string }; finish_reason?: string }[]; usage?: { prompt_tokens?: number; completion_tokens?: number }; model?: string };
      return { text: d.choices?.[0]?.message?.content ?? "", usage: { inputTokens: d.usage?.prompt_tokens ?? 0, outputTokens: d.usage?.completion_tokens ?? 0, cacheReadTokens: 0 }, model: d.model ?? req.model, stopReason: d.choices?.[0]?.finish_reason };
    },
  };
}

/** Limits simultaneous in-flight provider calls (rate-limit friendliness). */
export function withConcurrencyLimit(p: LlmProvider, max: number): LlmProvider {
  let active = 0; const queue: (() => void)[] = [];
  const acquire = () => new Promise<void>((res) => { if (active < max) { active++; res(); } else queue.push(() => { active++; res(); }); });
  const release = () => { active--; queue.shift()?.(); };
  return { id: p.id, isMock: p.isMock, async complete(r) { await acquire(); try { return await p.complete(r); } finally { release(); } } };
}
