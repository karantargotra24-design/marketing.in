import type { Usage } from "./types";

/** USD per 1M tokens. Source: Claude API reference (cached 2026-10-06); re-verify on the pricing page before relying on it.
 *  Haiku cache-read price was not in the reference: assumed 10% of input (conservative for budgeting). */
export type Price = { in: number; out: number; cacheRead: number };
export const PRICES: Record<string, Price> = {
  "claude-sonnet-5-5": { in: 2, out: 10, cacheRead: 0.2 },
  "claude-haiku-5-5": { in: 0.1, out: 0.5, cacheRead: 0.01 },
  "claude-opus-5-5": { in: 4, out: 20, cacheRead: 0.2 },
  "claude-fable-5-1": { in: 10, out: 50, cacheRead: 1 },
  // Mock models are priced like their real counterparts so budget logic is exercised, but no money is ever spent.
  "mock-sonnet": { in: 2, out: 10, cacheRead: 0.2 },
  "mock-haiku": { in: 0.1, out: 0.5, cacheRead: 0.01 },
};

export function priceFor(model: string, env: Record<string, string | undefined> = process.env): Price {
  if (PRICES[model]) return PRICES[model];
  const i = Number(env.HQ_PRICE_IN_PER_M), o = Number(env.HQ_PRICE_OUT_PER_M);
  if (i > 0 && o > 0) return { in: i, out: o, cacheRead: Number(env.HQ_PRICE_CACHE_PER_M) || i };
  throw new Error(`No price known for model "${model}". Spend limits cannot be enforced without a price: set HQ_PRICE_IN_PER_M and HQ_PRICE_OUT_PER_M.`);
}

export const costUsd = (p: Price, u: Usage) => (Math.max(0, u.inputTokens - u.cacheReadTokens) * p.in + u.cacheReadTokens * p.cacheRead + u.outputTokens * p.out) / 1e6;
export const estimateTokens = (text: string) => Math.ceil(text.length / 3.5);
/** Worst-case cost of a call, used to reserve budget BEFORE calling (full max_tokens assumed). */
export const worstCaseUsd = (p: Price, inputChars: number, maxTokens: number) => (estimateTokens("x".repeat(inputChars)) * p.in + maxTokens * p.out) / 1e6;
export const USD_INR = () => Number(process.env.HQ_USD_INR) || 88;
