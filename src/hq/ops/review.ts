import type { AiEngine } from "../ai/engine";
import { decideApproval, requestApproval } from "../approvals";
import type { StorePort } from "../port";
import type { AgentId, Deliverable, Run, Task } from "../types";
import { qaDeliverables, type OpsCtx } from "./handlers";
import { adPlanSchema, contentItemSchema, creativeBriefSchema } from "./schemas";
import { AGENTS } from "../agents/registry";
import { WorkspaceScope } from "../workspace";
import type { z } from "zod";

export type ReviewResult = { ok: true; deliverable: Deliverable; note?: string } | { ok: false; error: string };
const SCHEMAS: Record<string, z.ZodType<unknown>> = { content_item: contentItemSchema, creative_brief: creativeBriefSchema, ad_plan: adPlanSchema };

/** Human decision on a single deliverable. QA blockers cannot be approved past. Requesting changes triggers an automatic revision by the authoring agent when AI is available. */
export async function decideDeliverable(store: StorePort, clientId: string, id: string, decision: "approve" | "request_changes" | "reject", by: string, note = "", ai?: AiEngine): Promise<ReviewResult> {
  if (!by.startsWith("human:")) return { ok: false, error: "Only a human can decide on a deliverable" };
  const got = await store.getDeliverable(clientId, id);
  if (!got) return { ok: false, error: "Deliverable not found for this client" };
  const d = got.deliverable;
  /** A deliverable and its approval request are ONE decision: resolving either resolves both. */
  const settle = async (to: "APPROVED" | "REJECTED") => { for (const a of (await store.listApprovals(clientId)).filter((x) => x.status === "PENDING" && x.ref === `deliverable:${id}`)) await decideApproval(store, a.id, to, by); };
  if (decision === "approve") {
    if (d.qa && !d.qa.pass) return { ok: false, error: "QA found blocking issues. Request changes (the agent will revise) or reject." };
    if (!d.qa && !["strategy", "campaign_package", "qa_report", "research", "audit", "content_calendar"].includes(d.kind)) return { ok: false, error: "This item has not been through QA yet." };
    const out = await store.patchDeliverable(clientId, id, { status: "approved" });
    await settle("APPROVED");
    await store.log({ clientId, actor: by, action: "deliverable.approved", detail: `${d.kind}:${id}` });
    return { ok: true, deliverable: out };
  }
  if (decision === "reject") {
    const out = await store.patchDeliverable(clientId, id, { status: "rejected" });
    await settle("REJECTED");
    await store.log({ clientId, actor: by, action: "deliverable.rejected", detail: `${d.kind}:${id} ${note.slice(0, 120)}` });
    return { ok: true, deliverable: out };
  }
  // request changes
  if (!note.trim()) return { ok: false, error: "Please say what should change." };
  await store.patchDeliverable(clientId, id, { status: "changes_requested" });
  await store.log({ clientId, actor: by, action: "deliverable.changes_requested", detail: `${d.kind}:${id} ${note.slice(0, 160)}` });
  const schema = SCHEMAS[d.kind];
  if (!ai || !schema) return { ok: true, deliverable: (await store.getDeliverable(clientId, id))!.deliverable, note: !schema ? "Change request recorded. This kind of deliverable is revised by re-running its workflow." : "Change request recorded. AI is off, so no revision was produced." };
  const client = (await store.getClient(clientId))!;
  const agent = d.agent as AgentId;
  const facts = await new WorkspaceScope(store, clientId, agent, AGENTS[agent].knowledgePermissions).allowedFacts();
  const prev = got.versions.at(-1)!.body;
  const run: Run | null = d.runId ? await store.getRun(clientId, d.runId) : null;
  const task = { id: `review_${id.slice(-6)}`, clientId, runId: d.runId ?? "adhoc", description: "revision from your feedback", agent, step: "ops", allowPartial: false, priority: "normal", status: "IN PROGRESS", dependsOn: [], startedAt: null, completedAt: null, outputPath: null, reviewStatus: "NOT_REVIEWED", attempts: 0, error: null, kind: "revise", params: null, createdAt: new Date().toISOString() } as Task;
  const { value } = await ai.generate({ task, client, agent, kind: `revise_${d.kind}`, schema, facts, schemaHint: `Return the SAME JSON shape as "previous", changed to satisfy the owner's request. Remove unsupported claims; invent nothing.`, payload: { language: run?.plan.language ?? "english", previous: prev, issues: [note, ...(d.qa?.issues.filter((i) => i.severity === "blocker").map((i) => i.detail) ?? [])] } });
  await store.reviseDeliverable(clientId, id, value, agent, `Revised from owner feedback: ${note.slice(0, 120)}`);
  const ctx: OpsCtx = { store, ai, client, run: run ?? ({ id: d.runId ?? "adhoc", plan: { language: "english" } } as Run), task };
  await qaDeliverables(ctx, [id]);
  return { ok: true, deliverable: (await store.getDeliverable(clientId, id))!.deliverable, note: "Revised by the authoring agent and re-checked by QA." };
}

/** Execution preparation: collects what is APPROVED into a ready-to-schedule package. Does not publish, send or spend anything. */
export async function prepareExecution(store: StorePort, clientId: string, runId: string, by: string): Promise<ReviewResult> {
  if (!by.startsWith("human:")) return { ok: false, error: "Only a human can prepare execution" };
  const ds = await store.listDeliverables({ clientId, runId });
  const approvedItems = ds.filter((d) => d.kind === "content_item" && d.status === "approved");
  if (!approvedItems.length) return { ok: false, error: "No approved content items in this run yet. Approve items first." };
  const rows = await Promise.all(approvedItems.map(async (d) => { const b = (await store.getDeliverable(clientId, d.id))!.versions.at(-1)!.body as { date: string; platform: string; format: string; caption: string; hashtags: string[]; cta: string; title: string }; const brief = ds.find((x) => x.kind === "creative_brief" && x.status !== "rejected"); return { deliverableId: d.id, version: d.currentVersion, date: b.date, platform: b.platform, format: b.format, title: b.title, caption: b.caption, hashtags: b.hashtags, cta: b.cta, creativeBriefReady: Boolean(brief), assetsReady: false }; }));
  const created = await store.createDeliverable({ id: store.newId("dlv"), clientId, runId, taskId: null, kind: "execution_prep", title: `Execution package (${rows.length} approved item(s))`, agent: "orchestrator", status: "in_review", qa: null },
    { items: rows.sort((a, b) => a.date.localeCompare(b.date)), requires: ["Final creative assets (not generated yet)", "A connected and TESTED publishing integration", "Your explicit publish approval at execution time"], executed: false, notExecuted: "Nothing has been published, scheduled, sent or spent." }, "orchestrator", "Prepared from approved items");
  await requestApproval(store, { clientId, kind: "publish_post", summary: `Execution package ready: ${rows.length} approved post(s). Needs assets + a tested integration to run`, requestedBy: "orchestrator", ref: `deliverable:${created.id}` });
  await store.log({ clientId, actor: by, action: "execution.prepared", detail: `${runId}: ${rows.length} item(s)` });
  return { ok: true, deliverable: created };
}
