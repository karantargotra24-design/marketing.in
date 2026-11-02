import { describe, it, expect, beforeEach } from "vitest";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { HqStore } from "./store";
import { Orchestrator, RecoverableError, type RunnerFn } from "./orchestrator";
import { seedWorkspaces, onboardClient } from "./seed";
import { SAMPLE_CLIENTS } from "./fixtures";
import { WorkspaceScope } from "./workspace";
import { requestApproval, decideApproval, performExternalAction } from "./approvals";
import { AGENTS, AGENT_LIST } from "./agents/registry";
import { makeContext } from "./agents/base";
import type { AgentOutput } from "./types";

let store: HqStore;
beforeEach(async () => {
  store = new HqStore(await mkdtemp(path.join(tmpdir(), "hq-")));
  await seedWorkspaces(store, true, SAMPLE_CLIENTS);
});

const out = (over: Partial<AgentOutput> = {}): AgentOutput => ({ title: "T", summary: "ok", findings: [], missingInfo: [], recommendations: [], handoffs: [], insufficientData: false, ...over });
const delayRunner = (ms: number, log?: string[]): RunnerFn => async (t) => { log?.push(`start ${t.agent}`); await new Promise((r) => setTimeout(r, ms)); log?.push(`end ${t.agent}`); return out(); };
const mk = (opts = {}) => new Orchestrator(store, { retryDelayMs: 1, ...opts });

describe("agents", () => {
  it("defines all 12 specialists with complete profiles", () => {
    expect(AGENT_LIST).toHaveLength(12);
    for (const a of AGENT_LIST) {
      expect(a.instructions.length).toBeGreaterThan(50);
      for (const k of ["identity", "communication"] as const) expect(a[k]).toBeTruthy();
      for (const k of ["responsibilities", "requiredInputs", "expectedOutputs", "tools", "knowledgePermissions", "qualityStandards"] as const) expect(a[k].length).toBeGreaterThan(0);
    }
  });
  it("analytics reports NO DATA instead of inventing metrics", async () => {
    const o = AGENTS.analytics.analyze(makeContext("X", []));
    expect(o.insufficientData).toBe(true);
    expect(o.summary).toMatch(/NO DATA/);
    expect(o.findings).toHaveLength(0);
  });
});

describe("client isolation", () => {
  it("a scope only ever returns its own client's facts", async () => {
    for (const c of await store.listClients()) {
      const scope = new WorkspaceScope(store, c.id, "audit_strategy", AGENTS.audit_strategy.knowledgePermissions);
      const facts = await scope.allowedFacts();
      expect(facts.length).toBeGreaterThan(0);
      expect(facts.every((f) => f.clientId === c.id)).toBe(true);
    }
  });
  it("a scope cannot read knowledge bases outside the agent's permissions", async () => {
    const scope = new WorkspaceScope(store, "propedia", "analytics", AGENTS.analytics.knowledgePermissions);
    await expect(scope.facts("brand")).rejects.toThrow(/no permission/);
  });
  it("rejects path-traversal client ids and output names", async () => {
    expect(() => store.clientDir("../propedia")).toThrow();
    await expect(store.saveOutput("propedia", "../x.md", "x")).rejects.toThrow();
  });
  it("each client's files live in its own folder and never mention another client", async () => {
    const o = mk();
    await Promise.all(["pahadi-origin", "propedia", "karan-personal-brand"].map((id) => o.runWorkflow(id, "audit_360")));
    const names = { "pahadi-origin": ["Propedia", "Karan Targotra"], propedia: ["Pahadi Origin", "Karan Targotra"], "karan-personal-brand": ["Pahadi Origin", "Propedia"] } as const;
    for (const [id, banned] of Object.entries(names)) {
      for (const f of await store.listOutputs(id)) {
        const md = await readFile(path.join(store.clientDir(id), "outputs", f), "utf8");
        for (const b of banned) expect(md, `${id}/${f} leaks ${b}`).not.toContain(b);
      }
    }
  });
  it("QA blocks a deliverable that mentions another workspace", async () => {
    const leak: RunnerFn = async () => out({ recommendations: ["Reuse what worked for Propedia."] });
    const r = await mk({ runner: leak }).runWorkflow("pahadi-origin", "onboarding");
    const a = r.tasks.find((t) => t.agent === "client_ops")!;
    expect(a.reviewStatus).toBe("REVISION_REQUESTED");
    expect(a.status).toBe("UNDER REVIEW");
  });
});

describe("parallel execution engine", () => {
  it("runs the six independent audit tasks concurrently and respects dependencies", async () => {
    const log: string[] = [];
    const t0 = Date.now();
    const r = await mk({ runner: delayRunner(150, log) }).runWorkflow("pahadi-origin", "audit_360");
    const wall = Date.now() - t0;
    expect(r.maxObservedConcurrency).toBe(6);
    expect(wall).toBeLessThan(6 * 150); // sequential would take >= 900ms
    expect(log.slice(0, 6).every((l) => l.startsWith("start"))).toBe(true); // all 6 started before any ended
    const spec = r.tasks.filter((t) => t.step === "agent");
    const cons = r.tasks.find((t) => t.step === "consolidate")!;
    const qa = r.tasks.find((t) => t.step === "qa")!;
    const del = r.tasks.find((t) => t.step === "deliver")!;
    for (const s of spec) expect(cons.startedAt! >= s.completedAt!).toBe(true);
    expect(qa.startedAt! >= cons.completedAt!).toBe(true);
    expect(del.startedAt! >= qa.completedAt!).toBe(true);
  });
  it("honours maxConcurrency", async () => {
    const r = await mk({ runner: delayRunner(40), maxConcurrency: 2 }).runWorkflow("propedia", "audit_360");
    expect(r.maxObservedConcurrency).toBe(2);
  });
  it("runs different dependency shapes: content_plan fans out after content", async () => {
    const r = await mk({ runner: delayRunner(60) }).runWorkflow("propedia", "content_plan");
    const [creative, video] = ["creative", "video"].map((a) => r.tasks.find((t) => t.agent === a)!);
    expect(creative.startedAt! < video.completedAt! && video.startedAt! < creative.completedAt!).toBe(true); // overlap
  });
  it("different clients can run at the same time without sharing data", async () => {
    const [a, b] = await Promise.all([mk().runWorkflow("pahadi-origin", "audit_360"), mk().runWorkflow("propedia", "audit_360")]);
    expect(a.tasks.every((t) => t.clientId === "pahadi-origin")).toBe(true);
    expect(b.tasks.every((t) => t.clientId === "propedia")).toBe(true);
  });
});

describe("errors and retries", () => {
  it("retries recoverable failures with a limit, then succeeds", async () => {
    let n = 0;
    const flaky: RunnerFn = async (t) => { if (t.agent === "social" && ++n < 3) throw new RecoverableError("rate limited"); return out(); };
    const r = await mk({ runner: flaky, maxAttempts: 3 }).runWorkflow("propedia", "content_plan");
    const social = r.tasks.find((t) => t.agent === "social")!;
    expect(social.attempts).toBe(3);
    expect(social.status).not.toBe("FAILED");
  });
  it("stops retrying after maxAttempts and reports FAILED (never fakes success)", async () => {
    const always: RunnerFn = async (t) => { if (t.agent === "seo_web") throw new RecoverableError("timeout"); return out(); };
    const r = await mk({ runner: always, maxAttempts: 2 }).runWorkflow("propedia", "audit_360");
    const seo = r.tasks.find((t) => t.agent === "seo_web")!;
    expect(seo.status).toBe("FAILED");
    expect(seo.attempts).toBe(2);
    expect(seo.error).toMatch(/timeout/);
    // consolidation allows partial results and names the failure
    const final = await readFile(path.join(store.clientDir("propedia"), "outputs", r.finalReport!.split("/").pop()!), "utf8");
    expect(final).toMatch(/SEO & Website.*FAILED/);
  });
  it("does not retry non-recoverable errors and fails dependents that need the result", async () => {
    let calls = 0;
    const bad: RunnerFn = async (t) => { if (t.agent === "social") { calls++; throw new Error("boom"); } return out(); };
    const r = await mk({ runner: bad }).runWorkflow("propedia", "content_plan");
    expect(calls).toBe(1);
    for (const a of ["social", "content", "creative", "video"]) expect(r.tasks.find((t) => t.agent === a)!.status).toBe("FAILED");
    expect(r.tasks.find((t) => t.agent === "content")!.error).toMatch(/Upstream/);
    expect(r.tasks.find((t) => t.agent === "qa")!.status).toBe("COMPLETED"); // QA still reports on what exists
  });
});

describe("QA gate", () => {
  it("blocks fabricated statistics in agent prose", async () => {
    const r = await mk({ runner: async () => out({ recommendations: ["Expect 340% ROAS within 30 days."] }) }).runWorkflow("pahadi-origin", "onboarding");
    expect(r.tasks.find((t) => t.agent === "audit_strategy")!.reviewStatus).toBe("REVISION_REQUESTED");
  });
  it("blocks banned brand claims (Propedia: guaranteed returns)", async () => {
    const r = await mk({ runner: async () => out({ summary: "Plots offer guaranteed returns.", findings: [] }) }).runWorkflow("propedia", "onboarding");
    expect(r.tasks.find((t) => t.agent === "client_ops")!.reviewStatus).toBe("REVISION_REQUESTED");
  });
  it("blocks findings that lack a status label or source", async () => {
    const bad = out({ findings: [{ text: "Something", sources: [], status: "VERIFIED" }] });
    const r = await mk({ runner: async () => bad }).runWorkflow("propedia", "onboarding");
    expect(r.tasks.find((t) => t.agent === "client_ops")!.reviewStatus).toBe("REVISION_REQUESTED");
  });
  it("passes numbers that come from the client's own data", async () => {
    const r = await mk({ runner: async () => out({ recommendations: ["Keep the Shilajit price at ₹899."] }) }).runWorkflow("pahadi-origin", "onboarding");
    expect(r.tasks.find((t) => t.agent === "client_ops")!.reviewStatus).toBe("APPROVED");
  });
});

describe("real audits on seeded workspaces", () => {
  it("produces QA-approved, source-labelled reports and surfaces the Propedia colour conflict", async () => {
    const r = await mk().runWorkflow("propedia", "audit_360");
    expect(r.tasks.every((t) => t.status !== "FAILED" && t.status !== "PENDING")).toBe(true);
    expect(r.tasks.every((t) => t.reviewStatus === "APPROVED" || t.step === "deliver")).toBe(true);
    const md = await readFile(path.join(store.clientDir("propedia"), "outputs", r.finalReport!.split("/").pop()!), "utf8");
    expect(md).toMatch(/Conflicting information[\s\S]*brand\.colors/);
    expect(md).toMatch(/All reviewed documents passed QA/);
  });
  it("flags Pahadi Origin's unverified storefront claims", async () => {
    const r = await mk().runWorkflow("pahadi-origin", "audit_360");
    const md = await readFile(path.join(store.clientDir("pahadi-origin"), "outputs", r.finalReport!.split("/").pop()!), "utf8");
    for (const k of ["social_proof_on_store", "scarcity_claims", "discount_claims"]) expect(md).toContain(k);
  });
  it("audit of a brand-new empty client waits for input instead of inventing", async () => {
    await onboardClient(store, { id: "new-client", name: "New Client" });
    const r = await mk().runWorkflow("new-client", "audit_360");
    expect(r.tasks.filter((t) => t.step === "agent" && t.status === "WAITING FOR INPUT").length).toBeGreaterThanOrEqual(5);
    expect(await store.listFacts("new-client")).toHaveLength(1);
  });
});

describe("knowledge versioning and persistence", () => {
  it("keeps history when a fact is updated", async () => {
    const base = { clientId: "propedia", kb: "business" as const, key: "jkrera_status", status: "VERIFIED" as const, source: "test" };
    await store.putFact({ ...base, value: "Applied" });
    const all = await store.listFacts("propedia", { includeSuperseded: true });
    const versions = all.filter((f) => f.key === "jkrera_status").sort((a, b) => a.version - b.version);
    expect(versions.map((v) => v.version)).toEqual([1, 2]);
    expect(versions[0].supersededBy).toBe(versions[1].id);
    expect((await store.listFacts("propedia")).filter((f) => f.key === "jkrera_status")).toHaveLength(1);
  });
  it("seeding twice does not duplicate or overwrite", async () => {
    const before = (await store.listFacts("propedia", { includeSuperseded: true })).length;
    await seedWorkspaces(store, true, SAMPLE_CLIENTS);
    expect((await store.listFacts("propedia", { includeSuperseded: true })).length).toBe(before);
  });
  it("a fresh store instance on the same folder sees earlier tasks and logs", async () => {
    await mk().runWorkflow("propedia", "onboarding");
    const again = new HqStore(store.root);
    expect((await again.listTasks({ clientId: "propedia" })).length).toBe(3);
    expect((await again.readLog()).some((l) => l.action === "run.finished")).toBe(true);
  });
  it("rejects facts without a source", async () => {
    await expect(store.putFact({ clientId: "propedia", kb: "business", key: "k", value: "v", status: "VERIFIED", source: "" })).rejects.toThrow();
  });
});

describe("approval gate", () => {
  it("agents cannot approve; humans can", async () => {
    const a = await requestApproval(store, { clientId: "propedia", kind: "publish_post", summary: "Post 1", requestedBy: "content" });
    await expect(decideApproval(store, a.id, "APPROVED", "content")).rejects.toThrow(/human/);
    await expect(decideApproval(store, a.id, "APPROVED", "orchestrator")).rejects.toThrow(/human/);
    expect((await decideApproval(store, a.id, "APPROVED", "human:karan")).status).toBe("APPROVED");
    await expect(decideApproval(store, a.id, "REJECTED", "human:karan")).rejects.toThrow(/already/);
  });
  it("never executes without approval, without a tested integration, or across clients", async () => {
    let ran = 0;
    const exec = async () => { ran++; return "sent"; };
    const a = await requestApproval(store, { clientId: "propedia", kind: "publish_post", summary: "Post", requestedBy: "social" });
    expect(await performExternalAction(store, { approvalId: a.id, clientId: "propedia", integrationId: "instagram_publish", execute: exec })).toMatchObject({ ok: false, reason: expect.stringMatching(/PENDING/) });
    await decideApproval(store, a.id, "APPROVED", "human:karan");
    expect(await performExternalAction(store, { approvalId: a.id, clientId: "pahadi-origin", integrationId: "instagram_publish", execute: exec })).toMatchObject({ ok: false, reason: expect.stringMatching(/different client/) });
    expect(await performExternalAction(store, { approvalId: a.id, clientId: "propedia", integrationId: "instagram_publish", execute: exec })).toMatchObject({ ok: false, reason: expect.stringMatching(/not connected and tested/) });
    expect(ran).toBe(0);
  });
});
