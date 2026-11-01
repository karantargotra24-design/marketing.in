import type { StorePort } from "../port";
import { BudgetExceededError } from "./types";

export type Caps = { runUsd: number; dailyUsd: number; monthlyUsd: number };
export const DEFAULT_CAPS: Caps = { runUsd: 0.25, dailyUsd: 1, monthlyUsd: 17 }; // ≈ ₹1,500/month at ₹88/$

/**
 * Spend limits (run / day / month). See reserve().
 * Scope: per process (overshoot is bounded by in-flight reservations if several server instances run).
 */
export class BudgetGuard {
  private pending = 0;
  private runSpent = new Map<string, number>();
  private runPending = new Map<string, number>();
  constructor(private store: StorePort, readonly caps: Caps, private mockMode: boolean, private now: () => Date = () => new Date()) {}

  private async ledger() {
    const d = this.now();
    const dayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
    const monthStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
    const rows = (await this.store.listUsage({ since: monthStart })).filter((u) => (u.provider === "mock") === this.mockMode);
    const sum = (r: typeof rows) => r.reduce((a, u) => a + u.costUsd, 0);
    return { day: sum(rows.filter((u) => u.at >= dayStart)), month: sum(rows) };
  }

  private waiters: (() => void)[] = [];
  private wake() { const w = this.waiters; this.waiters = []; w.forEach((f) => f()); }

  /**
   * Reserve worst-case spend before a call.
   *  - HARD limit: actual spend so far + this call's worst case must fit under every cap, otherwise BudgetExceededError (no waiting).
   *  - SOFT limit: it fits, but other in-flight calls hold reservations: wait for them to finish instead of failing.
   * The check-and-reserve is synchronous after the ledger read, so parallel calls can never jointly overshoot a cap.
   */
  async reserve(runId: string, estUsd: number): Promise<() => void> {
    for (;;) {
      const { day, month } = await this.ledger();
      // ---- synchronous from here: no awaits between the checks and the reservation ----
      const spentRun = this.runSpent.get(runId) ?? 0, pendRun = this.runPending.get(runId) ?? 0;
      const fmt = (n: number) => `$${n.toFixed(4)}`;
      if (spentRun + estUsd > this.caps.runUsd) throw new BudgetExceededError("run", `Run budget ${fmt(this.caps.runUsd)} would be exceeded (spent ${fmt(spentRun)}, this call up to ${fmt(estUsd)}).`);
      if (day + estUsd > this.caps.dailyUsd) throw new BudgetExceededError("daily", `Daily budget ${fmt(this.caps.dailyUsd)} would be exceeded (spent ${fmt(day)}).`);
      if (month + estUsd > this.caps.monthlyUsd) throw new BudgetExceededError("monthly", `Monthly budget ${fmt(this.caps.monthlyUsd)} would be exceeded (spent ${fmt(month)}).`);
      if (spentRun + pendRun + estUsd > this.caps.runUsd || day + this.pending + estUsd > this.caps.dailyUsd || month + this.pending + estUsd > this.caps.monthlyUsd) {
        await new Promise<void>((r) => this.waiters.push(r));   // others hold reservations; retry when one is released
        continue;
      }
      this.pending += estUsd;
      this.runPending.set(runId, pendRun + estUsd);
      let released = false;
      return () => { if (!released) { released = true; this.pending -= estUsd; this.runPending.set(runId, (this.runPending.get(runId) ?? 0) - estUsd); this.wake(); } };
    }
  }

  addRunSpend(runId: string, usd: number) { this.runSpent.set(runId, (this.runSpent.get(runId) ?? 0) + usd); }
  get inFlightReserved() { return this.pending; }
}
