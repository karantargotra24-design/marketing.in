import { aiEngineFromEnv } from "../ai/config";
import type { AiEngine } from "../ai/engine";
import { USD_INR } from "../ai/pricing";
import { Orchestrator } from "../orchestrator";
import type { StorePort } from "../port";
import type { Plan, Run, Task } from "../types";
import { scanNumbers, scanText } from "./claims";
import type { SectionsBody } from "./schemas";

type Env = Record<string, string | undefined>;
export type LiveTestReport = {
  verdict: "PASS" | "FAIL"; mode: "mock" | "live"; clientId: string; provider: string; model: string | null; runId: string; deliverableId: string | null;
  costUsd: number; costInr: number; capInr: number; calls: number; inputTokens: number; outputTokens: number;
  bullets: number; citedFacts: number; uncitedBullets: number; invalidCitations: number; qaIssues: string[]; secretLeaks: number; failures: string[];
};
const SECRET_RES = [/sk-ant-[A-Za-z0-9_-]{16,}/, /\bAKIA[0-9A-Z]{16}\b/, /eyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\./, /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/];

/**
 * The controlled first real-AI test: ONE client, ONE agent (Research), ONE task, hard budget (default ₹100), with verification and a leak scan.
 * Live mode additionally requires HQ_LIVE_TEST_APPROVED=1 (your explicit approval of this specific test) on top of the normal live-mode gates.
 * In mock mode it is a free dry run of exactly the same checks.
 */
export async function runLiveTest(store: StorePort, o: { clientId: string; env?: Env; maxInr?: number; engine?: AiEngine }): Promise<LiveTestReport> {
  const env = o.env ?? process.env; const maxInr = o.maxInr ?? 100; const capUsd = maxInr / USD_INR();
  const mode = (env.HQ_AI ?? "off").toLowerCase();
  if (mode !== "mock" && mode !== "live") throw new Error("Set HQ_AI=mock (free dry run) or HQ_AI=live (needs approval flags) to run the test");
  if (mode === "live" && env.HQ_LIVE_TEST_APPROVED !== "1") throw new Error("Live test blocked: set HQ_LIVE_TEST_APPROVED=1 only after you have approved this ₹100 test (plus HQ_AI_SPEND_APPROVED=1 and the API key)");
  const client = await store.getClient(o.clientId);
  if (!client) throw new Error(`Unknown client "${o.clientId}"`);
  const cap = (k: string, d: number) => String(Math.min(Number(env[k]) || d, capUsd));
  const ai = o.engine ?? aiEngineFromEnv(store, { ...env, HQ_AI_RUN_CAP_USD: cap("HQ_AI_RUN_CAP_USD", capUsd), HQ_AI_DAILY_CAP_USD: cap("HQ_AI_DAILY_CAP_USD", capUsd), HQ_AI_MONTHLY_CAP_USD: cap("HQ_AI_MONTHLY_CAP_USD", capUsd) });
  if (!ai) throw new Error("AI engine is not available");

  const plan: Plan = { objective: "research", days: 1, platform: "instagram", summary: "Controlled live test: one research task", language: "english", tasks: [{ key: "t", kind: "research_brand_product", agent: "research", title: "Brand & product research (live test)", dependsOn: [], estCostUsd: 0 }], missingInfo: [], assumptions: ["Live test"], highImpact: false, estCostUsd: 0, needsPlanApproval: false, reason: "controlled test" };
  const run: Run = { id: store.newId("run"), clientId: client.id, instruction: "Controlled live test: brand and product research", objective: "research", status: "QUEUED", plan, estCostUsd: 0, autoApproved: true, createdBy: "human:live-test", scheduleId: null, createdAt: new Date().toISOString(), startedAt: null, completedAt: null };
  await store.createRun(run);
  const task: Task = { id: store.newId("task"), clientId: client.id, runId: run.id, description: plan.tasks[0].title, agent: "research", step: "ops", allowPartial: false, priority: "normal", status: "PENDING", dependsOn: [], startedAt: null, completedAt: null, outputPath: null, reviewStatus: "NOT_REVIEWED", attempts: 0, error: null, kind: "research_brand_product", params: null, createdAt: run.createdAt };
  await store.insertTasks([task]);
  await store.log({ clientId: client.id, actor: "human:live-test", action: "livetest.started", detail: `${mode} cap ₹${maxInr}` });
  await new Orchestrator(store, { ai, maxAttempts: 2 }).execute(run.id);

  const failures: string[] = [];
  const t = (await store.listTasks({ runId: run.id }))[0];
  if (t.status !== "COMPLETED") failures.push(`Task ended ${t.status}${t.error ? `: ${t.error}` : ""}`);
  const d = (await store.listDeliverables({ clientId: client.id, runId: run.id }))[0] ?? null;
  const usage = (await store.listUsage({ clientId: client.id })).filter((u) => u.taskId === task.id);
  const costUsd = usage.reduce((a, u) => a + u.costUsd, 0);
  if (costUsd > capUsd + 1e-9) failures.push(`Cost $${costUsd.toFixed(4)} exceeded the cap $${capUsd.toFixed(4)}`);
  if (mode === "live" && usage.some((u) => u.provider === "mock")) failures.push("Live test recorded mock usage");

  let bullets = 0, cited = 0, uncited = 0, invalid = 0; const qaIssues: string[] = [];
  if (d) {
    const facts = await store.listFacts(client.id, { includeSuperseded: true }); const ids = new Set(facts.map((f) => f.id));
    const body = (await store.getDeliverable(client.id, d.id))!.versions.at(-1)!.body as SectionsBody;
    const corpus = facts.map((f) => `${f.value} ${f.source} ${f.key}`).join(" ");
    for (const s of body.sections) for (const b of s.bullets) {
      bullets++; const good = b.factIds.filter((x) => ids.has(x)); invalid += b.factIds.length - good.length; cited += good.length;
      if (!good.length && !b.sourceUrls.length && !/no stored facts|no .* stored|NO DATA|nothing/i.test(b.text)) uncited++;
      for (const i of [...scanText("bullet", b.text, facts), ...scanNumbers("bullet", b.text, corpus)]) qaIssues.push(`${i.severity}: ${i.detail}`);
    }
    if (invalid) failures.push(`${invalid} citation(s) referenced facts that do not exist`);
    if (uncited) failures.push(`${uncited} finding(s) have no source`);
    if (qaIssues.some((q) => q.startsWith("blocker"))) failures.push("QA blockers in the research output");
    if (!cited && bullets) failures.push("No finding is tied to a stored client fact");
  } else failures.push("No deliverable was produced");

  // secret leak scan over everything this test wrote
  const log = (await store.readLog(500)).map((l) => `${l.action} ${l.detail}`).join("\n"); const hay = log + JSON.stringify(d ?? {}) + JSON.stringify(await store.listTasks({ runId: run.id }));
  let leaks = SECRET_RES.filter((r) => r.test(hay)).length;
  for (const k of ["ANTHROPIC_API_KEY", "DATABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "HQ_WORKER_SECRET"]) if (env[k] && env[k]!.length > 12 && hay.includes(env[k]!)) leaks++;
  if (leaks) failures.push(`${leaks} possible secret(s) found in logs/outputs: rotate keys`);

  await store.log({ clientId: client.id, actor: "human:live-test", action: "livetest.finished", detail: `${failures.length ? "FAIL" : "PASS"} $${costUsd.toFixed(4)}` });
  return { verdict: failures.length ? "FAIL" : "PASS", mode, clientId: client.id, provider: ai.provider.id, model: usage[0]?.model ?? null, runId: run.id, deliverableId: d?.id ?? null, costUsd, costInr: costUsd * USD_INR(), capInr: maxInr, calls: usage.length, inputTokens: usage.reduce((a, u) => a + u.inputTokens, 0), outputTokens: usage.reduce((a, u) => a + u.outputTokens, 0), bullets, citedFacts: cited, uncitedBullets: uncited, invalidCitations: invalid, qaIssues, secretLeaks: leaks, failures };
}
