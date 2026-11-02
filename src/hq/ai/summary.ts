import type { UsageRecord } from "../port";
import type { ExecutionRecord } from "../types";
import { USD_INR } from "./pricing";

export type SpendBucket = { calls: number; inputTokens: number; outputTokens: number; costUsd: number };
const empty = (): SpendBucket => ({ calls: 0, inputTokens: 0, outputTokens: 0, costUsd: 0 });
const add = (b: SpendBucket, u: UsageRecord) => { b.calls++; b.inputTokens += u.inputTokens; b.outputTokens += u.outputTokens; b.costUsd += u.costUsd; };

/** Splits the ledger into REAL spend (paid providers) and SIMULATED spend (mock provider, no money). Never mixed. */
export function summarizeUsage(rows: UsageRecord[], now = new Date()) {
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const out = { real: { today: empty(), month: empty() }, simulated: { today: empty(), month: empty() }, byAgent: {} as Record<string, SpendBucket>, byClient: {} as Record<string, SpendBucket>, inr: USD_INR() };
  for (const u of rows) {
    const side = u.provider === "mock" ? out.simulated : out.real;
    if (u.at >= monthStart) add(side.month, u);
    if (u.at >= dayStart) add(side.today, u);
    if (u.provider !== "mock" && u.at >= monthStart) {
      add((out.byAgent[u.agent] ??= empty()), u);
      add((out.byClient[u.clientId ?? "agency"] ??= empty()), u);
    }
  }
  return out;
}

/** Real timestamps -> true peak concurrency via a sweep line (an end at time t does not overlap a start at t). Nothing is animated or estimated. */
export function parallelism(execs: ExecutionRecord[]) {
  const spans = execs.filter((e) => e.outcome !== "retrying").map((e) => ({ id: e.id, agent: e.agent, mode: e.mode, model: e.model, s: Date.parse(e.startedAt), e: Date.parse(e.endedAt) }));
  const events = spans.flatMap((x) => [{ t: x.s, d: 1 }, { t: x.e, d: -1 }]).sort((a, b) => a.t - b.t || a.d - b.d); // ends (-1) sort before starts (+1) at equal t
  let cur = 0, max = 0;
  for (const ev of events) { cur += ev.d; max = Math.max(max, cur); }
  return { maxOverlap: max, spans, from: spans.length ? Math.min(...spans.map((x) => x.s)) : 0, to: spans.length ? Math.max(...spans.map((x) => x.e)) : 0 };
}
