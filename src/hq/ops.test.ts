import { describe, it, expect, beforeEach } from "vitest";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { HqStore } from "./store";
import { seedWorkspaces } from "./seed";
import { SAMPLE_CLIENTS } from "./fixtures";
import { AGENT_LIST } from "./agents/registry";
import { AiEngine } from "./ai/engine";
import { BudgetGuard, type Caps } from "./ai/budget";
import { MockProvider } from "./ai/mock";
import { parseIntent } from "./ops/intent";
import { buildPlan, planWaves } from "./ops/planner";
import { approvePlan, createSchedule, nextRun, processJobs, submitInstruction, tickSchedules, validCadence } from "./ops/runs";
import { decideApproval } from "./approvals";
import type { ContentItemBody } from "./ops/schemas";
import type { StorePort } from "./port";

let store: HqStore;
const CAPS: Caps = { runUsd: 50, dailyUsd: 500, monthlyUsd: 5000 };
const engine = (provider = new MockProvider({ latencyMs: 30 }), caps = CAPS) => ({ provider, ai: new AiEngine({ provider, budget: new BudgetGuard(store, caps, true), store, modelFor: () => "mock-sonnet" }) });
const CAMPAIGN = "Prepare a complete seven-day Instagram growth campaign for Pahadi Origin.";

beforeEach(async () => {
  store = new HqStore(await mkdtemp(path.join(tmpdir(), "hq-ops-")));
  await seedWorkspaces(store, true, SAMPLE_CLIENTS);
  for (const c of ["pahadi-origin", "propedia"]) for (const a of AGENT_LIST) for (const n of a.needs)
    if (!(await store.listFacts(c)).some((f) => f.kb === n.kb && f.key === n.key)) await store.putFact({ clientId: c, kb: n.kb, key: n.key, value: `[test] ${n.key} ZZ-${c}`, status: "CLIENT-PROVIDED", source: "test" });
});

const runAll = async (clientId: string, text: string, ai = engine()) => {
  const sub = await submitInstruction(store, clientId, text, "human:karan");
  if (!sub.ok) throw new Error(sub.error);
  if (sub.run.status === "AWAITING_PLAN_APPROVAL") await approvePlan(store, clientId, sub.run.id, "human:karan");
  await processJobs(store, { ai: ai.ai, max: 5 });
  return { run: (await store.getRun(clientId, sub.run.id))!, ai };
};
const bodies = async (clientId: string, kind: string, runId: string) => Promise.all((await store.listDeliverables({ clientId, kind, runId })).map(async (d) => ({ d, last: (await store.getDeliverable(clientId, d.id))!.versions.at(-1)!.body })));

describe("natural-language intent", () => {
  const pahadi = SAMPLE_CLIENTS[0];
  const client = { id: pahadi.id, name: pahadi.name, kind: pahadi.kind, createdAt: "", doNotSay: [], agentPermissions: [] };
  it("understands objective, duration, platform", () => {
    const i = parseIntent(CAMPAIGN, client, [], []);
    expect(i).toMatchObject({ objective: "campaign", days: 7, platform: "instagram" });
  });
  it("detects language and defaults with stated assumptions", () => {
    expect(parseIntent("write a month content calendar in Hindi", client, [], []).language).toBe("hindi");
    expect(parseIntent("write a month content calendar in Hindi", client, [], []).days).toBe(30);
    const i = parseIntent("do something about growth", client, [], []);
    expect(i.assumptions.join(" ")).toMatch(/assumed/);
  });
  it("detects other objectives", () => {
    for (const [t, o] of [["audit our social presence", "audit"], ["competitor research please", "research"], ["write reels for this week", "content_plan"], ["plan meta ads", "ads"], ["monthly performance report", "report"]] as const) expect(parseIntent(t, client, [], []).objective).toBe(o);
  });
});

describe("planner", () => {
  it("builds a dependency graph whose first wave is wide (parallel) and last step is the package", async () => {
    const client = (await store.getClient("pahadi-origin"))!;
    const r = await buildPlan(store, client, CAMPAIGN);
    if (!r.ok) throw new Error(r.error);
    const waves = planWaves(r.plan.tasks);
    expect(waves[0].length).toBe(9);                      // 4 research + 5 audit branches start together
    expect(waves.at(-1)).toEqual(["package"]);
    const agents = new Set(r.plan.tasks.map((t) => t.agent));
    for (const a of ["research", "audit_strategy", "social", "content", "analytics", "video", "creative", "paid_ads", "qa", "orchestrator"]) expect(agents.has(a as never)).toBe(true);
    expect(r.plan.estCostUsd).toBeGreaterThan(0);
    expect(r.plan.needsPlanApproval).toBe(true);           // campaigns are high-impact → preview first
  });
  it("lets routine internal work proceed without waiting for you", async () => {
    const client = (await store.getClient("pahadi-origin"))!;
    const r = await buildPlan(store, client, "audit our business and social presence");
    if (!r.ok) throw new Error(r.error);
    expect(r.plan.needsPlanApproval).toBe(false);
    expect(r.plan.reason).toMatch(/routine internal work/);
  });
  it("is configurable: policy can force preview for everything", async () => {
    await store.setSetting("autoRunPolicy", { enabled: false });
    const r = await buildPlan(store, (await store.getClient("pahadi-origin"))!, "audit our business");
    expect(r.ok && r.plan.needsPlanApproval).toBe(true);
  });
  it("reports missing client information up front", async () => {
    const fresh = await store.getClient("karan-personal-brand");
    const r = await buildPlan(store, fresh!, "prepare a 7-day instagram campaign");
    if (!r.ok) throw new Error(r.error);
    expect(r.plan.missingInfo.length).toBeGreaterThan(3);
  });
  it("refuses instructions that name a different client (workspaces never mix)", async () => {
    const r = await buildPlan(store, (await store.getClient("pahadi-origin"))!, "Prepare a campaign for Propedia");
    expect(r).toMatchObject({ ok: false, error: expect.stringMatching(/Propedia.*active workspace/) });
  });
  it("rejects empty or oversized instructions", async () => {
    const c = (await store.getClient("pahadi-origin"))!;
    expect((await buildPlan(store, c, "hi")).ok).toBe(false);
    expect((await buildPlan(store, c, "x".repeat(1001))).ok).toBe(false);
  });
});

describe("autonomous campaign run (mock AI) — one instruction, everything coordinated", () => {
  it("high-impact instruction waits for plan approval; only a human can approve", async () => {
    const sub = await submitInstruction(store, "pahadi-origin", CAMPAIGN, "human:karan");
    if (!sub.ok) throw new Error(sub.error);
    expect(sub.run.status).toBe("AWAITING_PLAN_APPROVAL");
    expect(await store.listTasks({ runId: sub.run.id })).toHaveLength(0);       // nothing runs before approval
    expect((await approvePlan(store, "pahadi-origin", sub.run.id, "orchestrator")).ok).toBe(false);
    expect((await approvePlan(store, "propedia", sub.run.id, "human:karan")).ok).toBe(false); // wrong client
    expect((await approvePlan(store, "pahadi-origin", sub.run.id, "human:karan")).ok).toBe(true);
    expect((await store.listJobs({ status: "queued" })).length).toBe(1);
  });

  it("produces the full package: research, audits, strategy, calendar, scripts, briefs, ad plan, QA, package + approval", async () => {
    const { run, ai } = await runAll("pahadi-origin", CAMPAIGN);
    expect(run.status).toBe("COMPLETED");
    const tasks = await store.listTasks({ runId: run.id });
    expect(tasks.every((t) => ["COMPLETED", "WAITING FOR INPUT"].includes(t.status))).toBe(true);
    const count = async (k: string) => (await store.listDeliverables({ clientId: "pahadi-origin", runId: run.id, kind: k })).length;
    expect(await count("research")).toBe(4); expect(await count("audit")).toBe(5); expect(await count("strategy")).toBe(1);
    expect(await count("content_calendar")).toBe(1); expect(await count("content_item")).toBe(7); expect(await count("creative_brief")).toBe(7);
    expect(await count("ad_plan")).toBe(1); expect(await count("campaign_package")).toBe(1); expect(await count("qa_report")).toBe(2);
    // reel scripts were added as new versions of the reel items
    const items = await bodies("pahadi-origin", "content_item", run.id);
    const reels = items.filter((x) => (x.last as ContentItemBody).format === "reel");
    expect(reels.length).toBe(3);
    for (const r of reels) expect((r.last as ContentItemBody).script?.length).toBeGreaterThan(1);
    // package → approval centre, nothing executed
    const pkg = (await store.listDeliverables({ clientId: "pahadi-origin", runId: run.id, kind: "campaign_package" }))[0];
    expect(pkg.status).toBe("in_review");
    const appr = (await store.listApprovals("pahadi-origin")).find((a) => a.ref === `deliverable:${pkg.id}`);
    expect(appr).toMatchObject({ status: "PENDING", requestedBy: "orchestrator" });
    expect(((await store.getDeliverable("pahadi-origin", pkg.id))!.versions[0].body as { notExecuted: string }).notExecuted).toMatch(/Nothing has been published/);
    expect(ai.provider.calls.length).toBeGreaterThan(15);
  });

  it("runs independent branches truly in parallel and respects dependencies", async () => {
    const mock = new MockProvider({ latencyMs: 80 });
    const { run } = await runAll("pahadi-origin", CAMPAIGN, engine(mock));
    expect(mock.maxInFlight).toBeGreaterThanOrEqual(6);
    const t = Object.fromEntries((await store.listTasks({ runId: run.id })).map((x) => [x.kind!, x]));
    const firstWave = (await store.listTasks({ runId: run.id })).filter((x) => /^(research|audit)_/.test(x.kind!));
    expect(firstWave.length).toBe(9);
    // the 9 independent branches overlap: their combined window is far shorter than running their model calls one after another
    const waveCalls = mock.calls.filter((c) => /"kind":"(research|audit)_/.test(c.user)).length;
    const window = Math.max(...firstWave.map((x) => Date.parse(x.completedAt!))) - Math.min(...firstWave.map((x) => Date.parse(x.startedAt!)));
    expect(waveCalls).toBeGreaterThanOrEqual(6);
    expect(window).toBeLessThan(waveCalls * 80 * 0.6);
    const lastDone = Math.max(...firstWave.map((x) => Date.parse(x.completedAt!)));
    expect(Date.parse(t.strategy.startedAt!)).toBeGreaterThanOrEqual(lastDone);
    expect(Date.parse(t.content_calendar.startedAt!)).toBeGreaterThanOrEqual(Date.parse(t.strategy.completedAt!));
    expect(Date.parse(t.reel_scripts.startedAt!)).toBeGreaterThanOrEqual(Date.parse(t.content_calendar.completedAt!));
    expect(Date.parse(t.package.startedAt!)).toBeGreaterThanOrEqual(Date.parse(t.revise.completedAt!));
  });

  it("QA catches unverified claims; the authoring agent revises automatically; history keeps the original", async () => {
    const { run } = await runAll("pahadi-origin", CAMPAIGN);
    const reports = await bodies("pahadi-origin", "qa_report", run.id);
    const blockedFirst = reports.map((r) => (r.last as { blocked: number }).blocked).sort((a, b) => b - a);
    expect(blockedFirst[0]).toBeGreaterThanOrEqual(2);              // first pass found the copied store claims
    expect(blockedFirst[1]).toBe(0);                                // final pass: clean
    const items = await store.listDeliverables({ clientId: "pahadi-origin", runId: run.id, kind: "content_item" });
    const revised = items.filter((d) => d.currentVersion >= 3 || (d.currentVersion >= 2 && d.status !== "changes_requested"));
    expect(revised.length).toBeGreaterThan(0);
    for (const d of items) {
      expect(d.status).not.toBe("changes_requested");
      const g = (await store.getDeliverable("pahadi-origin", d.id))!;
      const final = JSON.stringify(g.versions.at(-1)!.body);
      expect(final).not.toMatch(/only few left|40% OFF/i);
      const everFlagged = g.versions.some((v) => /only few left|40% OFF/i.test(JSON.stringify(v.body)));
      if (everFlagged) { expect(g.versions.length).toBeGreaterThanOrEqual(2); expect(g.versions.some((v) => v.note.startsWith("Revised after QA"))).toBe(true); }
    }
  });

  it("records execution history and cost for every task; mock spend is separated from real spend", async () => {
    const { run } = await runAll("pahadi-origin", CAMPAIGN);
    const hist = await store.listExecutions({ runId: run.id });
    expect(hist.length).toBeGreaterThanOrEqual((await store.listTasks({ runId: run.id })).length);
    expect(hist.some((h) => h.mode === "ai" && h.costUsd > 0)).toBe(true);
    const usage = await store.listUsage({ clientId: "pahadi-origin" });
    expect(usage.length).toBeGreaterThan(10); expect(usage.every((u) => u.provider === "mock")).toBe(true);
  });
});

describe("sparse workspaces (regression: long gap lists must not break deliverables)", () => {
  it("a nearly empty client still gets a complete, honest package; nothing FAILS", async () => {
    const { onboardClient } = await import("./seed");
    await onboardClient(store, { id: "sparse-co", name: "Sparse Co" });
    const { run } = await runAll("sparse-co", "Prepare a complete seven-day Instagram growth campaign for Sparse Co.");
    expect(run.status).toBe("COMPLETED");
    const tasks = await store.listTasks({ runId: run.id });
    expect(tasks.filter((t) => t.status === "FAILED")).toEqual([]);
    const kinds = (await store.listDeliverables({ clientId: "sparse-co", runId: run.id })).map((d) => d.kind);
    for (const k of ["strategy", "content_calendar", "creative_brief", "ad_plan", "campaign_package"]) expect(kinds, k).toContain(k);
    const pkg = (await bodies("sparse-co", "campaign_package", run.id))[0].last as { missingInfo: string[] };
    expect(pkg.missingInfo.length).toBeGreaterThan(10);                  // the gaps are reported, not hidden
  });
});

describe("autonomy edge cases", () => {
  it("with AI off, rule-based research/audit still run and generation steps wait for input (no fake content)", async () => {
    const sub = await submitInstruction(store, "pahadi-origin", CAMPAIGN, "human:karan");
    if (!sub.ok) throw new Error(sub.error);
    await approvePlan(store, "pahadi-origin", sub.run.id, "human:karan");
    await processJobs(store, { ai: undefined, max: 5 });
    const tasks = await store.listTasks({ runId: sub.run.id });
    const by = Object.fromEntries(tasks.map((t) => [t.kind!, t]));
    expect(by.strategy.status).toBe("WAITING FOR INPUT"); expect(by.strategy.error).toMatch(/AI is off/);
    expect(by.content_calendar.status).toBe("WAITING FOR INPUT");
    expect((await store.listDeliverables({ clientId: "pahadi-origin", runId: sub.run.id, kind: "content_item" })).length).toBe(0);
    expect((await store.listDeliverables({ clientId: "pahadi-origin", runId: sub.run.id, kind: "research" })).length).toBe(4);
    expect(by.package.status).toBe("COMPLETED");
  });

  it("a spend limit pauses AI tasks for approval but the run still reports what it has", async () => {
    const { run } = await runAll("pahadi-origin", CAMPAIGN, engine(new MockProvider({ latencyMs: 5 }), { runUsd: 0.04, dailyUsd: 100, monthlyUsd: 1000 }));
    const tasks = await store.listTasks({ runId: run.id });
    expect(tasks.some((t) => t.status === "WAITING FOR APPROVAL" && /spend limit/.test(t.error ?? ""))).toBe(true);
    expect(tasks.find((t) => t.kind === "package")!.status).toBe("COMPLETED");
    const spent = (await store.listUsage()).reduce((a, u) => a + u.costUsd, 0);
    expect(spent).toBeLessThanOrEqual(0.04 + 1e-9);
  });

  it("keeps two clients' runs completely separate when executed at the same time", async () => {
    const mock = new MockProvider({ latencyMs: 20 }); const e = engine(mock);
    const a = await submitInstruction(store, "pahadi-origin", "audit our business and social presence", "human:karan");
    const b = await submitInstruction(store, "propedia", "audit our business and social presence", "human:karan");
    if (!a.ok || !b.ok) throw new Error("submit failed");
    await processJobs(store, { ai: e.ai, max: 5 });
    for (const [cid, other] of [["pahadi-origin", "Propedia"], ["propedia", "Pahadi Origin"]] as const) {
      const ds = await store.listDeliverables({ clientId: cid });
      expect(ds.length).toBeGreaterThan(5);
      for (const d of ds) expect(JSON.stringify((await store.getDeliverable(cid, d.id))!.versions)).not.toContain(other);
    }
    const pFacts = await store.listFacts("propedia"), aFacts = await store.listFacts("pahadi-origin");
    for (const c of mock.calls) {
      const mine = c.user.includes("ZZ-propedia") ? pFacts : aFacts; const theirs = mine === pFacts ? aFacts : pFacts;
      for (const f of theirs) expect(c.user).not.toContain(f.id);
      void mine;
    }
    expect(await store.getRun("propedia", a.run.id)).toBeNull();           // a run is invisible from another client
    expect(await store.getDeliverable("propedia", (await store.listDeliverables({ clientId: "pahadi-origin" }))[0].id)).toBeNull();
  });
});

describe("durable queue, recovery and retries", () => {
  it("recovers a run whose worker crashed mid-task (lease expires → re-leased → completes)", async () => {
    const sub = await submitInstruction(store, "pahadi-origin", "audit our business and social presence", "human:karan");
    if (!sub.ok) throw new Error(sub.error);
    // simulate a worker that leased the job, started tasks, then died
    const [job] = await store.leaseJobs(1, 1000, new Date());
    const tasks = await store.listTasks({ runId: sub.run.id });
    await store.patchTask(tasks[0].id, { status: "IN PROGRESS", startedAt: new Date().toISOString() });
    expect((await processJobs(store, { ai: engine().ai, now: new Date(Date.now() - 5000) })).processed).toBe(0); // lease still held
    const later = new Date(Date.now() + 60_000);
    const r = await processJobs(store, { ai: engine().ai, now: later, max: 3 });
    expect(r.processed).toBe(1);
    const after = await store.listTasks({ runId: sub.run.id });
    expect(after.every((t) => ["COMPLETED", "WAITING FOR INPUT"].includes(t.status))).toBe(true);
    expect((await store.listJobs()).find((j) => j.id === job.id)!.status).toBe("done");
    expect((await store.readLog(300)).some((l) => l.action === "task.recovered")).toBe(true);
  });
  it("retries a failed job with backoff and finally marks it failed (never loops forever)", async () => {
    const sub = await submitInstruction(store, "pahadi-origin", "audit our business and social presence", "human:karan");
    if (!sub.ok) throw new Error(sub.error);
    const orig = store.listTasks.bind(store);
    store.listTasks = async () => { throw new Error("db unavailable"); };
    let now = new Date();
    for (let i = 0; i < 4; i++) { await processJobs(store, { ai: undefined, now, maxAttempts: 3 }); now = new Date(now.getTime() + 10 * 60_000); }
    store.listTasks = orig;
    const j = (await store.listJobs())[0];
    expect(j.status).toBe("failed"); expect(j.attempts).toBe(3); expect(j.error).toMatch(/db unavailable/);
  });
  it("two workers never run the same job", async () => {
    await submitInstruction(store, "pahadi-origin", "audit our business", "human:karan");
    const [a, b] = await Promise.all([store.leaseJobs(5, 60_000), store.leaseJobs(5, 60_000)]);
    expect(a.length + b.length).toBe(1);
  });
});

describe("schedules", () => {
  it("computes next runs in IST", () => {
    // Sunday 2026-11-01 12:00 UTC = 17:30 IST → next Monday 09:00 IST = Monday 03:30 UTC
    expect(nextRun("weekly:MON@09:00", new Date("2026-11-01T12:00:00Z")).toISOString()).toBe("2026-11-02T03:30:00.000Z");
    expect(nextRun("daily@09:00", new Date("2026-11-01T12:00:00Z")).toISOString()).toBe("2026-11-02T03:30:00.000Z");
    expect(nextRun("monthly:1@09:00", new Date("2026-11-01T12:00:00Z")).toISOString()).toBe("2026-12-01T03:30:00.000Z");
    expect(nextRun("daily@23:00", new Date("2026-11-01T12:00:00Z")).toISOString()).toBe("2026-11-01T17:30:00.000Z");
  });
  it("validates cadence strings", () => { expect(validCadence("weekly:MON@09:00")).toBe(true); expect(validCadence("every minute")).toBe(false); });
  it("starts due schedules once, advances the next run, and queues routine work automatically", async () => {
    const s = await createSchedule(store, { clientId: "pahadi-origin", name: "Weekly audit", instruction: "audit our business and social presence", cadence: "weekly:MON@09:00" }, new Date("2026-11-01T12:00:00Z"));
    expect((await tickSchedules(store, new Date("2026-11-01T13:00:00Z"))).started).toHaveLength(0);
    const due = new Date("2026-11-02T04:00:00Z");
    const r1 = await tickSchedules(store, due); expect(r1.started).toHaveLength(1);
    expect((await tickSchedules(store, due)).started).toHaveLength(0);                 // no double fire
    const after = (await store.listSchedules())[0];
    expect(after.nextRunAt > due.toISOString()).toBe(true); expect(after.lastRunId).toBe(r1.started[0]);
    const run = (await store.getRun("pahadi-origin", r1.started[0]))!;
    expect(run.scheduleId).toBe(s.id); expect(run.status).toBe("QUEUED");              // routine → no human wait
    await processJobs(store, { ai: engine().ai, max: 2 });
    expect((await store.getRun("pahadi-origin", run.id))!.status).toBe("COMPLETED");
  });
  it("a scheduled high-impact instruction still waits for plan approval", async () => {
    await createSchedule(store, { clientId: "pahadi-origin", name: "Weekly campaign", instruction: CAMPAIGN, cadence: "daily@09:00" }, new Date("2026-11-01T00:00:00Z"));
    const r = await tickSchedules(store, new Date("2026-11-02T04:00:00Z"));
    expect((await store.getRun("pahadi-origin", r.started[0]))!.status).toBe("AWAITING_PLAN_APPROVAL");
  });
});

describe("decisions on deliverables", () => {
  const firstOf = async (run: string, kind: string) => (await store.listDeliverables({ clientId: "pahadi-origin", runId: run, kind }))[0];
  it("approving the package also settles its approval request (one decision, not two)", async () => {
    const { run } = await runAll("pahadi-origin", CAMPAIGN);
    const pkg = await firstOf(run.id, "campaign_package");
    expect((await store.listApprovals("pahadi-origin")).filter((a) => a.ref === `deliverable:${pkg.id}` && a.status === "PENDING")).toHaveLength(1);
    const { decideDeliverable } = await import("./ops/review");
    expect((await decideDeliverable(store, "pahadi-origin", pkg.id, "approve", "human:karan")).ok).toBe(true);
    expect((await store.listApprovals("pahadi-origin")).find((a) => a.ref === `deliverable:${pkg.id}`)!.status).toBe("APPROVED");
    expect((await store.getDeliverable("pahadi-origin", pkg.id))!.deliverable.status).toBe("approved");
  });
  it("agents cannot decide; another client cannot decide; QA-blocked items cannot be approved", async () => {
    const { run } = await runAll("pahadi-origin", CAMPAIGN);
    const item = await firstOf(run.id, "content_item");
    const { decideDeliverable } = await import("./ops/review");
    expect(await decideDeliverable(store, "pahadi-origin", item.id, "approve", "content")).toMatchObject({ ok: false, error: expect.stringMatching(/human/) });
    expect(await decideDeliverable(store, "propedia", item.id, "approve", "human:karan")).toMatchObject({ ok: false, error: expect.stringMatching(/not found/) });
    await store.patchDeliverable("pahadi-origin", item.id, { qa: { pass: false, issues: [{ severity: "blocker", rule: "claim:discount", detail: "x" }] }, status: "changes_requested" });
    expect(await decideDeliverable(store, "pahadi-origin", item.id, "approve", "human:karan")).toMatchObject({ ok: false, error: expect.stringMatching(/blocking/) });
  });
  it("request changes needs a note; with AI it creates a new version and re-runs QA; without AI it records the request", async () => {
    const { run, ai } = await runAll("pahadi-origin", CAMPAIGN);
    const item = await firstOf(run.id, "content_item"); const v = item.currentVersion;
    const { decideDeliverable } = await import("./ops/review");
    expect(await decideDeliverable(store, "pahadi-origin", item.id, "request_changes", "human:karan", " ", ai.ai)).toMatchObject({ ok: false });
    const r = await decideDeliverable(store, "pahadi-origin", item.id, "request_changes", "human:karan", "shorter hook please", ai.ai);
    expect(r.ok && r.deliverable.currentVersion).toBe(v + 1);
    expect((await store.getDeliverable("pahadi-origin", item.id))!.versions.at(-1)!.note).toMatch(/Revised from owner feedback/);
    expect((await store.getDeliverable("pahadi-origin", item.id))!.deliverable.qa).not.toBeNull();     // QA re-ran
    const r2 = await decideDeliverable(store, "pahadi-origin", item.id, "request_changes", "human:karan", "again", undefined);
    expect(r2.ok && r2.note).toMatch(/AI is off/);
  });
  it("execution preparation packages ONLY approved items and executes nothing", async () => {
    const { run } = await runAll("pahadi-origin", CAMPAIGN);
    const { decideDeliverable, prepareExecution } = await import("./ops/review");
    expect((await prepareExecution(store, "pahadi-origin", run.id, "human:karan")).ok).toBe(false);       // nothing approved yet
    const items = await store.listDeliverables({ clientId: "pahadi-origin", runId: run.id, kind: "content_item" });
    for (const i of items.slice(0, 2)) await decideDeliverable(store, "pahadi-origin", i.id, "approve", "human:karan");
    const r = await prepareExecution(store, "pahadi-origin", run.id, "human:karan");
    if (!r.ok) throw new Error(r.error);
    const body = (await store.getDeliverable("pahadi-origin", r.deliverable.id))!.versions[0].body as { items: unknown[]; executed: boolean; requires: string[] };
    expect(body.items).toHaveLength(2); expect(body.executed).toBe(false); expect(body.requires.join(" ")).toMatch(/TESTED publishing integration/);
  });
});

describe("approvals of produced work", () => {
  it("the package approval is decided by a human only and executes nothing", async () => {
    const { run } = await runAll("pahadi-origin", CAMPAIGN);
    const appr = (await store.listApprovals("pahadi-origin")).find((a) => a.requestedBy === "orchestrator")!;
    await expect(decideApproval(store, appr.id, "APPROVED", "orchestrator")).rejects.toThrow(/human/);
    expect((await decideApproval(store, appr.id, "APPROVED", "human:karan")).status).toBe("APPROVED");
    expect(run.status).toBe("COMPLETED");
  });
});
export type { StorePort };
