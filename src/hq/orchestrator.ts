import { AGENTS } from "./agents/registry";
import { makeContext } from "./agents/base";
import { qaReview, renderQaReport, type QaResult } from "./qa";
import { renderAgentOutput } from "./render";
import type { HqStore } from "./store";
import { WorkspaceScope } from "./workspace";
import type { AgentId, AgentOutput, Client, Fact, Task } from "./types";

/** Throw this from an agent/runner for failures worth retrying (timeouts, rate limits). */
export class RecoverableError extends Error { readonly recoverable = true; }

export type RunnerFn = (task: Task, scope: WorkspaceScope, client: Client) => Promise<AgentOutput>;
export type Options = { maxConcurrency?: number; maxAttempts?: number; retryDelayMs?: number; runner?: RunnerFn };

type Step = { key: string; agent: Task["agent"]; step: Task["step"]; description: string; dependsOn: string[]; allowPartial?: boolean; priority?: Task["priority"] };

/** Workflow templates. Independent steps (no shared dependsOn) run in parallel. */
export const WORKFLOWS: Record<string, (clientName: string) => Step[]> = {
  audit_360: (n) => [
    { key: "A", agent: "research", step: "agent", description: `Market & competitor research for ${n}`, dependsOn: [], priority: "high" },
    { key: "B", agent: "audit_strategy", step: "agent", description: `Business positioning & marketing-gap audit for ${n}`, dependsOn: [], priority: "high" },
    { key: "C", agent: "social", step: "agent", description: `Social media presence review for ${n}`, dependsOn: [] },
    { key: "D", agent: "seo_web", step: "agent", description: `Website & search opportunity review for ${n}`, dependsOn: [] },
    { key: "E", agent: "analytics", step: "agent", description: `Historical performance analysis for ${n}`, dependsOn: [] },
    { key: "F", agent: "client_ops", step: "agent", description: `Client information & requirements check for ${n}`, dependsOn: [] },
    { key: "G", agent: "orchestrator", step: "consolidate", description: "Consolidate specialist outputs, detect conflicts", dependsOn: ["A", "B", "C", "D", "E", "F"], allowPartial: true },
    { key: "H", agent: "qa", step: "qa", description: "Quality review of all outputs", dependsOn: ["G"], allowPartial: true },
    { key: "I", agent: "orchestrator", step: "deliver", description: "Deliver final audit with QA verdict", dependsOn: ["H"], allowPartial: true },
  ],
  content_plan: (n) => [
    { key: "A", agent: "social", step: "agent", description: `Platform priorities for ${n}`, dependsOn: [] },
    { key: "B", agent: "content", step: "agent", description: `Content calendar readiness for ${n}`, dependsOn: ["A"] },
    { key: "C", agent: "creative", step: "agent", description: `Creative briefs readiness for ${n}`, dependsOn: ["B"] },
    { key: "D", agent: "video", step: "agent", description: `Reel scripts readiness for ${n}`, dependsOn: ["B"] },
    { key: "E", agent: "qa", step: "qa", description: "Quality review", dependsOn: ["C", "D"], allowPartial: true },
  ],
  onboarding: (n) => [
    { key: "A", agent: "client_ops", step: "agent", description: `Onboarding completeness for ${n}`, dependsOn: [] },
    { key: "B", agent: "audit_strategy", step: "agent", description: `Initial gap analysis for ${n}`, dependsOn: [] },
    { key: "C", agent: "qa", step: "qa", description: "Quality review", dependsOn: ["A", "B"], allowPartial: true },
  ],
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type RunSummary = { runId: string; clientId: string; tasks: Task[]; maxObservedConcurrency: number; finalReport: string | null };

export class Orchestrator {
  private opts: Required<Omit<Options, "runner">> & { runner?: RunnerFn };
  constructor(private store: HqStore, opts: Options = {}) {
    this.opts = { maxConcurrency: opts.maxConcurrency ?? 6, maxAttempts: opts.maxAttempts ?? 3, retryDelayMs: opts.retryDelayMs ?? 250, runner: opts.runner };
  }

  /** Creates tasks (with ids, deps, client id) without running them. */
  async plan(clientId: string, workflow: keyof typeof WORKFLOWS | string): Promise<{ runId: string; tasks: Task[] }> {
    const client = await this.store.getClient(clientId);
    if (!client) throw new Error(`Unknown client "${clientId}"`);
    const tpl = WORKFLOWS[workflow];
    if (!tpl) throw new Error(`Unknown workflow "${workflow}"`);
    const runId = this.store.newId("run");
    const steps = tpl(client.name);
    const ids = new Map(steps.map((s) => [s.key, this.store.newId("task")]));
    const now = new Date().toISOString();
    const tasks: Task[] = steps.map((s) => ({
      id: ids.get(s.key)!, clientId, runId, description: s.description, agent: s.agent, step: s.step, allowPartial: !!s.allowPartial,
      priority: s.priority ?? "normal", status: "PENDING", dependsOn: s.dependsOn.map((k) => ids.get(k)!), startedAt: null, completedAt: null,
      outputPath: null, reviewStatus: "NOT_REVIEWED", attempts: 0, error: null, createdAt: now,
    }));
    await this.store.insertTasks(tasks);
    await this.store.log({ clientId, actor: "orchestrator", action: "run.planned", detail: `${workflow} → ${tasks.length} tasks (${runId})` });
    return { runId, tasks };
  }

  /** Single ad-hoc task (dashboard "create task"). */
  async planSingle(clientId: string, agent: AgentId, description: string, priority: Task["priority"] = "normal") {
    if (!(await this.store.getClient(clientId))) throw new Error(`Unknown client "${clientId}"`);
    const runId = this.store.newId("run");
    const t: Task = { id: this.store.newId("task"), clientId, runId, description, agent, step: "agent", allowPartial: false, priority, status: "PENDING", dependsOn: [], startedAt: null, completedAt: null, outputPath: null, reviewStatus: "NOT_REVIEWED", attempts: 0, error: null, createdAt: new Date().toISOString() };
    await this.store.insertTasks([t]);
    return { runId, tasks: [t] };
  }

  async runWorkflow(clientId: string, workflow: string): Promise<RunSummary> {
    const { runId } = await this.plan(clientId, workflow);
    return this.execute(runId);
  }

  /** DAG scheduler: starts every ready task up to maxConcurrency, waits for any to finish, repeats. */
  async execute(runId: string): Promise<RunSummary> {
    const initial = await this.store.listTasks({ runId });
    if (!initial.length) throw new Error("Unknown run");
    const clientId = initial[0].clientId;
    const client = (await this.store.getClient(clientId))!;
    const running = new Map<string, Promise<void>>();
    let maxObserved = 0;
    const outputs = new Map<string, AgentOutput>();

    while (true) {
      const tasks = await this.store.listTasks({ runId });
      const byId = new Map(tasks.map((t) => [t.id, t]));
      const pending = tasks.filter((t) => t.status === "PENDING" && !running.has(t.id));
      let progressed = false;
      const order = { high: 0, normal: 1, low: 2 } as const;
      for (const t of pending.sort((a, b) => order[a.priority] - order[b.priority])) {
        const deps = t.dependsOn.map((d) => byId.get(d)!);
        if (deps.some((d) => d.status === "PENDING" || d.status === "IN PROGRESS")) continue;
        if (deps.some((d) => d.status === "FAILED") && !t.allowPartial) {
          await this.store.patchTask(t.id, { status: "FAILED", error: "Upstream task failed; not run", completedAt: new Date().toISOString() });
          await this.store.log({ clientId, actor: "orchestrator", action: "task.blocked", detail: t.id });
          progressed = true; continue;
        }
        if (running.size >= this.opts.maxConcurrency) break;
        await this.store.patchTask(t.id, { status: "IN PROGRESS", startedAt: new Date().toISOString() });
        const p = this.runTask(t.id, client, outputs).finally(() => running.delete(t.id));
        running.set(t.id, p);
        maxObserved = Math.max(maxObserved, running.size);
        progressed = true;
      }
      if (running.size === 0) {
        const left = (await this.store.listTasks({ runId })).filter((t) => t.status === "PENDING");
        if (left.length === 0) break;
        if (!progressed) { // unmet dependencies can never resolve: report, do not hang
          for (const t of left) await this.store.patchTask(t.id, { status: "FAILED", error: "Dependencies could not be satisfied", completedAt: new Date().toISOString() });
          break;
        }
        continue;
      }
      await Promise.race(running.values());
    }
    const final = await this.store.listTasks({ runId });
    const report = final.find((t) => t.step === "deliver")?.outputPath ?? final.find((t) => t.step === "qa")?.outputPath ?? null;
    await this.store.log({ clientId, actor: "orchestrator", action: "run.finished", detail: `${runId}: ${final.map((t) => t.status).join(",")}` });
    return { runId, clientId, tasks: final, maxObservedConcurrency: maxObserved, finalReport: report };
  }

  private async runTask(taskId: string, client: Client, outputs: Map<string, AgentOutput>) {
    let attempts = 0;
    while (true) {
      attempts++;
      const t = (await this.store.listTasks({ clientId: client.id })).find((x) => x.id === taskId)!;
      await this.store.patchTask(taskId, { attempts });
      try {
        if (t.step === "agent") await this.runAgent(t, client, outputs);
        else if (t.step === "consolidate") await this.consolidate(t, client, outputs);
        else if (t.step === "qa") await this.qa(t, client);
        else await this.deliver(t, client);
        return;
      } catch (e) {
        const recoverable = (e as { recoverable?: boolean }).recoverable === true;
        const msg = e instanceof Error ? e.message : String(e);
        if (recoverable && attempts < this.opts.maxAttempts) {
          await this.store.log({ clientId: client.id, actor: t.agent, action: "task.retry", detail: `${taskId} attempt ${attempts}: ${msg}` });
          await sleep(this.opts.retryDelayMs * attempts);
          continue;
        }
        await this.store.patchTask(taskId, { status: "FAILED", error: msg, completedAt: new Date().toISOString() });
        await this.store.log({ clientId: client.id, actor: t.agent, action: "task.failed", detail: `${taskId}: ${msg}` });
        return;
      }
    }
  }

  private async runAgent(t: Task, client: Client, outputs: Map<string, AgentOutput>) {
    const agent = t.agent as AgentId;
    const def = AGENTS[agent];
    const scope = new WorkspaceScope(this.store, client.id, agent, def.knowledgePermissions);
    const out = this.opts.runner
      ? await this.opts.runner(t, scope, client)
      : def.analyze(makeContext(client.name, await scope.allowedFacts()));
    outputs.set(t.id, out);
    const md = renderAgentOutput(out, { clientId: client.id, clientName: client.name, taskId: t.id, agent, at: new Date().toISOString() });
    const outputPath = await scope.saveOutput(`${agent}-${t.id}.md`, md);
    await scope.saveOutput(`${agent}-${t.id}.json`, JSON.stringify(out));
    await this.store.patchTask(t.id, { status: out.insufficientData ? "WAITING FOR INPUT" : "UNDER REVIEW", outputPath, completedAt: new Date().toISOString() });
    await scope.log("task.output", `${t.id} → ${out.insufficientData ? "WAITING FOR INPUT (insufficient data)" : "UNDER REVIEW"}`);
  }

  private async loadOutputs(tasks: Task[], clientId: string, cache: Map<string, AgentOutput>) {
    const res: { task: Task; out: AgentOutput }[] = [];
    for (const t of tasks) {
      let out = cache.get(t.id);
      if (!out && t.outputPath) { const raw = await this.store.readOutput(clientId, `${t.agent}-${t.id}.json`); if (raw) out = JSON.parse(raw) as AgentOutput; }
      if (out) res.push({ task: t, out });
    }
    return res;
  }

  private async consolidate(t: Task, client: Client, outputs: Map<string, AgentOutput>) {
    const run = await this.store.listTasks({ runId: t.runId });
    const specialists = run.filter((x) => x.step === "agent");
    const done = await this.loadOutputs(specialists, client.id, outputs);
    const failed = specialists.filter((x) => x.status === "FAILED");
    const facts = await this.store.listFacts(client.id);
    const conflicts = findConflicts(facts);
    const missing = new Map<string, string[]>();
    for (const { task, out } of done) for (const m of out.missingInfo) missing.set(m, [...(missing.get(m) ?? []), task.agent]);
    const risks = done.flatMap(({ task, out }) => out.findings.filter((f) => /risk flag/i.test(f.text)).map((f) => ({ agent: task.agent, f })));
    const seenRisk = new Set<string>();
    const L: string[] = [];
    L.push(`# 360° Audit — ${client.name}`, "", `Client ID: ${client.id} · Run: ${t.runId} · Generated: ${new Date().toISOString()}`, "");
    L.push("## Executive summary", "");
    L.push(`Computed: ${done.length} of ${specialists.length} specialist agent(s) produced output; ${failed.length} failed; ${done.filter((d) => d.out.insufficientData).length} reported insufficient data.`);
    L.push(`Computed: ${facts.length} active fact(s) in this workspace; ${facts.filter((f) => f.status === "NEEDS VERIFICATION" || f.status === "ASSUMPTION").length} are unverified (NEEDS VERIFICATION / ASSUMPTION); ${missing.size} distinct information gap(s) found.`);
    L.push("", "This audit reflects only information stored in this client's workspace. Gaps are listed, not guessed.", "");
    L.push("## What each agent found", "");
    for (const { task, out } of done) L.push(`- **${AGENTS[task.agent as AgentId].name}** (${task.id}, ${task.status}): ${out.summary}`);
    for (const f of failed) L.push(`- **${AGENTS[f.agent as AgentId]?.name ?? f.agent}** (${f.id}): FAILED — ${f.error}`);
    L.push("", "## Conflicting information", "");
    if (!conflicts.length) L.push("_No conflicting facts detected in stored knowledge._");
    for (const c of conflicts) L.push(`- **${c.base}** has ${c.facts.length} competing values — ${c.facts.map((f) => `"${f.value}" (${f.status}; source: ${f.source})`).join(" vs ")}. Resolve with the client before use.`);
    L.push("", "## Risk flags", "");
    const riskLines = risks.filter(({ f }) => !seenRisk.has(f.sources.join()) && (seenRisk.add(f.sources.join()), true));
    if (!riskLines.length) L.push("_None flagged._");
    for (const { agent, f } of riskLines) L.push(`- (${agent}) ${f.text} — source: ${f.sources.join("; ")}`);
    L.push("", "## Missing information", "");
    if (!missing.size) L.push("_None identified._");
    for (const [m, who] of missing) L.push(`- ${m} _(needed by: ${[...new Set(who)].join(", ")})_`);
    L.push("", "## Recommendations", "");
    const seen = new Set<string>();
    for (const { task, out } of done) for (const r of out.recommendations) if (!seen.has(r)) { seen.add(r); L.push(`- (${task.agent}) ${r}`); }
    L.push("", "## Limitations", "");
    L.push("- Agents are rule-based workspace analysts: they do not browse the web or call ad platforms from this app. Live research and platform data require an AI provider and approved connectors (see Integrations).");
    L.push("- Nothing in this report has been published, sent or spent. External actions need explicit approval.", "");
    const rel = await this.store.saveOutput(client.id, `audit-draft-${t.runId}.md`, L.join("\n"));
    await this.store.patchTask(t.id, { status: "UNDER REVIEW", outputPath: rel, completedAt: new Date().toISOString() });
    await this.store.log({ clientId: client.id, actor: "orchestrator", action: "audit.consolidated", detail: rel });
  }

  private async qa(t: Task, client: Client) {
    const run = await this.store.listTasks({ runId: t.runId });
    const reviewable = run.filter((x) => x.id !== t.id && x.step !== "deliver" && x.outputPath);
    const facts = await this.store.listFacts(client.id, { includeSuperseded: true });
    const corpus = facts.map((f) => `${f.value} ${f.source} ${f.key}`).join(" ");
    const others = (await this.store.listClients()).filter((c) => c.id !== client.id).flatMap((c) => [c.name]);
    const results: QaResult[] = [];
    for (const x of reviewable) {
      const name = x.outputPath!.split("/").pop()!;
      const md = (await this.store.readOutput(client.id, name)) ?? "";
      results.push(qaReview({ doc: name, markdown: md, clientName: client.name, corpus, doNotSay: client.doNotSay, otherClientNames: others, isConsolidated: x.step === "consolidate" }));
    }
    for (const [i, x] of reviewable.entries()) {
      const r = results[i];
      const data: Partial<Task> = { reviewStatus: r.pass ? "APPROVED" : "REVISION_REQUESTED" };
      if (x.step === "agent") data.status = !r.pass ? "UNDER REVIEW" : x.status === "WAITING FOR INPUT" ? "WAITING FOR INPUT" : "COMPLETED";
      if (x.step === "consolidate") data.status = r.pass ? "COMPLETED" : "UNDER REVIEW";
      await this.store.patchTask(x.id, data);
    }
    const rel = await this.store.saveOutput(client.id, `qa-${t.runId}.md`, renderQaReport(client.name, results));
    await this.store.saveOutput(client.id, `qa-${t.runId}.json`, JSON.stringify(results));
    await this.store.patchTask(t.id, { status: "COMPLETED", outputPath: rel, reviewStatus: "APPROVED", completedAt: new Date().toISOString() });
    await this.store.log({ clientId: client.id, actor: "qa", action: "qa.done", detail: `${results.filter((r) => r.pass).length}/${results.length} passed` });
  }

  private async deliver(t: Task, client: Client) {
    const run = await this.store.listTasks({ runId: t.runId });
    const draft = run.find((x) => x.step === "consolidate");
    const qa = run.find((x) => x.step === "qa");
    const draftMd = draft?.outputPath ? (await this.store.readOutput(client.id, draft.outputPath.split("/").pop()!)) ?? "" : "";
    const results: QaResult[] = qa?.outputPath ? JSON.parse((await this.store.readOutput(client.id, `qa-${t.runId}.json`)) ?? "[]") : [];
    const blocked = results.filter((r) => !r.pass);
    const L = [draftMd.trimEnd(), "", "## Quality assurance verdict", ""];
    L.push(`Computed: ${results.length - blocked.length} of ${results.length} reviewed document(s) passed QA.`);
    L.push(blocked.length ? `**Revision requested for:** ${blocked.map((b) => b.doc).join(", ")} — treat related sections as unapproved.` : "All reviewed documents passed QA. Report is approved for internal use; external sharing still needs Karan's approval.");
    const rel = await this.store.saveOutput(client.id, `audit-final-${t.runId}.md`, L.join("\n") + "\n");
    await this.store.patchTask(t.id, { status: "COMPLETED", outputPath: rel, reviewStatus: blocked.length ? "REVISION_REQUESTED" : "APPROVED", completedAt: new Date().toISOString() });
    await this.store.log({ clientId: client.id, actor: "orchestrator", action: "audit.delivered", detail: rel });
  }
}

/** Facts stored as `base@variant` in the same KB with different values are conflicting claims. */
export function findConflicts(facts: Fact[]) {
  const groups = new Map<string, Fact[]>();
  for (const f of facts) if (f.key.includes("@")) { const k = `${f.kb}.${f.key.split("@")[0]}`; groups.set(k, [...(groups.get(k) ?? []), f]); }
  return [...groups].filter(([, g]) => new Set(g.map((f) => f.value)).size > 1).map(([base, g]) => ({ base, facts: g }));
}
