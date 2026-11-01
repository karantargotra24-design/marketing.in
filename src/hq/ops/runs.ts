import { aiEngineFromEnv } from "../ai/config";
import type { AiEngine } from "../ai/engine";
import { Orchestrator } from "../orchestrator";
import type { StorePort } from "../port";
import type { Plan, Run, Schedule, Task } from "../types";
import { buildPlan } from "./planner";

export type SubmitResult = { ok: true; run: Run } | { ok: false; error: string };

/** One instruction → plan → run. Routine internal work is queued immediately; high-impact work waits for plan approval. */
export async function submitInstruction(store: StorePort, clientId: string, instruction: string, by: string, opts: { scheduleId?: string } = {}): Promise<SubmitResult> {
  const client = await store.getClient(clientId);
  if (!client) return { ok: false, error: `Unknown client "${clientId}"` };
  const planned = await buildPlan(store, client, instruction);
  if (!planned.ok) return planned;
  const plan = planned.plan;
  const run: Run = { id: store.newId("run"), clientId, instruction: instruction.trim(), objective: plan.objective, status: plan.needsPlanApproval ? "AWAITING_PLAN_APPROVAL" : "QUEUED", plan, estCostUsd: plan.estCostUsd, autoApproved: !plan.needsPlanApproval, createdBy: by, scheduleId: opts.scheduleId ?? null, createdAt: new Date().toISOString(), startedAt: null, completedAt: null };
  await store.createRun(run);
  await store.log({ clientId, actor: by, action: "run.submitted", detail: `${run.id} ${plan.objective}: ${plan.reason}` });
  if (!plan.needsPlanApproval) await startRun(store, run);
  return { ok: true, run };
}

export async function approvePlan(store: StorePort, clientId: string, runId: string, by: string): Promise<SubmitResult> {
  if (!by.startsWith("human:")) return { ok: false, error: "Only a human can approve a plan" };
  const run = await store.getRun(clientId, runId);
  if (!run) return { ok: false, error: "Run not found for this client" };
  if (run.status !== "AWAITING_PLAN_APPROVAL") return { ok: false, error: `Run is ${run.status}, not awaiting approval` };
  await store.log({ clientId, actor: by, action: "run.plan_approved", detail: runId });
  await startRun(store, run);
  return { ok: true, run: (await store.getRun(clientId, runId))! };
}
export async function cancelRun(store: StorePort, clientId: string, runId: string, by: string) {
  const run = await store.getRun(clientId, runId);
  if (!run || ["COMPLETED", "FAILED", "CANCELLED"].includes(run.status)) return;
  await store.patchRun(clientId, runId, { status: "CANCELLED", completedAt: new Date().toISOString() });
  for (const t of await store.listTasks({ runId })) if (t.status === "PENDING") await store.patchTask(t.id, { status: "FAILED", error: "Run cancelled", completedAt: new Date().toISOString() });
  await store.log({ clientId, actor: by, action: "run.cancelled", detail: runId });
}

const PARTIAL = new Set(["qa", "revise", "package"]);
async function startRun(store: StorePort, run: Run) {
  const ids = new Map(run.plan.tasks.map((t) => [t.key, store.newId("task")]));
  const now = new Date().toISOString();
  const tasks: Task[] = run.plan.tasks.map((t) => ({
    id: ids.get(t.key)!, clientId: run.clientId, runId: run.id, description: t.title, agent: t.agent as Task["agent"], step: "ops", allowPartial: PARTIAL.has(t.kind), priority: "normal", status: "PENDING",
    dependsOn: t.dependsOn.map((d) => ids.get(d)!), startedAt: null, completedAt: null, outputPath: null, reviewStatus: "NOT_REVIEWED", attempts: 0, error: null, kind: t.kind, params: null, createdAt: now,
  }));
  await store.insertTasks(tasks);
  await store.patchRun(run.clientId, run.id, { status: "QUEUED" });
  await store.enqueueJob({ id: store.newId("job"), kind: "run", runId: run.id, status: "queued", runAfter: now, attempts: 0, leaseUntil: null, error: null });
}

/** Background worker: leases queued jobs (safe with several workers) and executes them; failures retry with backoff. */
export async function processJobs(store: StorePort, o: { ai?: AiEngine; max?: number; leaseMs?: number; now?: Date; maxAttempts?: number } = {}): Promise<{ processed: number; failed: number }> {
  const ai = o.ai ?? aiEngineFromEnv(store);
  const jobs = await store.leaseJobs(o.max ?? 2, o.leaseMs ?? 10 * 60_000, o.now);
  let failed = 0;
  await Promise.all(jobs.map(async (job) => {
    const run = (await store.listRuns()).find((r) => r.id === job.runId);
    try {
      if (!run) throw new Error("Run missing");
      if (run.status === "CANCELLED") { await store.finishJob(job.id, { ok: true }); return; }
      await new Orchestrator(store, { ai }).execute(job.runId, { recover: job.attempts > 1 });
      await store.finishJob(job.id, { ok: true });
    } catch (e) {
      failed++;
      const msg = e instanceof Error ? e.message : String(e);
      await store.log({ clientId: run?.clientId ?? null, actor: "worker", action: "job.failed", detail: `${job.id}: ${msg}`.slice(0, 300) });
      const retry = job.attempts < (o.maxAttempts ?? 3);
      await store.finishJob(job.id, retry ? { ok: false, error: msg, retryAt: new Date((o.now ?? new Date()).getTime() + 60_000 * job.attempts).toISOString() } : { ok: false, error: msg });
    }
  }));
  return { processed: jobs.length, failed };
}

/* ---------- schedules (cadence in IST) ---------- */
const IST = 5.5 * 3600_000;
const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export function validCadence(c: string) { return /^(daily@\d{2}:\d{2}|weekly:(MON|TUE|WED|THU|FRI|SAT|SUN)@\d{2}:\d{2}|monthly:\d{1,2}@\d{2}:\d{2})$/.test(c); }
/** Next fire time strictly after `from`. Cadence: daily@HH:MM · weekly:MON@HH:MM · monthly:D@HH:MM (IST). */
export function nextRun(cadence: string, from: Date): Date {
  if (!validCadence(cadence)) throw new Error(`Invalid cadence "${cadence}"`);
  const [spec, time] = cadence.split("@"); const [hh, mm] = time.split(":").map(Number);
  const [kind, arg] = spec.split(":");
  const local = new Date(from.getTime() + IST);                                  // wall-clock in IST, read via UTC getters
  for (let add = 0; add < 400; add++) {
    const d = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + add, hh, mm));
    const ok = kind === "daily" || (kind === "weekly" && DOW[d.getUTCDay()] === arg) || (kind === "monthly" && d.getUTCDate() === Number(arg));
    const real = new Date(d.getTime() - IST);
    if (ok && real.getTime() > from.getTime()) return real;
  }
  throw new Error("No next run found");
}
export async function createSchedule(store: StorePort, i: { clientId: string; name: string; instruction: string; cadence: string }, now = new Date()): Promise<Schedule> {
  if (!validCadence(i.cadence)) throw new Error("Cadence must look like daily@09:00, weekly:MON@09:00 or monthly:1@09:00 (IST)");
  if (!(await store.getClient(i.clientId))) throw new Error("Unknown client");
  const s: Schedule = { id: store.newId("sch"), ...i, enabled: true, nextRunAt: nextRun(i.cadence, now).toISOString(), lastRunAt: null, lastRunId: null, createdAt: now.toISOString() };
  await store.saveSchedule(s); return s;
}
/** Starts every due schedule (no catch-up burst: missed occurrences collapse into one run). */
export async function tickSchedules(store: StorePort, now = new Date()): Promise<{ started: string[] }> {
  const started: string[] = [];
  for (const s of await store.listSchedules()) {
    if (!s.enabled || s.nextRunAt > now.toISOString()) continue;
    const r = await submitInstruction(store, s.clientId, s.instruction, `schedule:${s.id}`, { scheduleId: s.id });
    await store.saveSchedule({ ...s, lastRunAt: now.toISOString(), lastRunId: r.ok ? r.run.id : null, nextRunAt: nextRun(s.cadence, now).toISOString() });
    if (r.ok) started.push(r.run.id); else await store.log({ clientId: s.clientId, actor: "scheduler", action: "schedule.failed", detail: `${s.id}: ${r.error}` });
  }
  return { started };
}
export type { Plan };
