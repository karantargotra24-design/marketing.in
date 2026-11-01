"use server";

import { cookies } from "next/headers";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { seedWorkspaces, approvePlan, cancelRun, clientIdSchema, createSchedule, decideApproval, decideDeliverable, defaultStore, factStatuses, knowledgeBases, onboardClient, prepareExecution, processJobs, submitInstruction, testIntegration, tickSchedules, validCadence } from "@/hq";
import { requireHuman } from "@/app/hq/guard";
import { aiOrUndefined, CLIENT_COOKIE } from "./ctx";

const back = (path: string, kind: "error" | "ok", msg: string): never => redirect(`${path}${path.includes("?") ? "&" : "?"}${kind}=${encodeURIComponent(msg)}`);
const guarded = async <T,>(path: string, fn: () => Promise<T>): Promise<T> => { try { return await fn(); } catch (e) { return back(path, "error", e instanceof Error ? e.message : "Something went wrong"); } };
const kick = () => after(async () => { const store = defaultStore(); try { await tickSchedules(store); await processJobs(store, { ai: aiOrUndefined(store), max: 3 }); } catch { /* the worker route / next click will retry; failures are logged in the activity log */ } });

export async function switchClient(fd: FormData) {
  await requireHuman();
  const id = clientIdSchema.safeParse(fd.get("client"));
  if (id.success && (await defaultStore().getClient(id.data))) (await cookies()).set(CLIENT_COOKIE, id.data, { httpOnly: true, sameSite: "lax", path: "/" });
  redirect(String(fd.get("back") || "/os").startsWith("/os") ? String(fd.get("back") || "/os") : "/os");
}

export async function submitCommand(fd: FormData) {
  const actor = await requireHuman();
  const store = defaultStore();
  const clientId = clientIdSchema.safeParse(fd.get("client"));
  if (!clientId.success) return back("/os", "error", "Choose a client first");
  const r = await guarded("/os", () => submitInstruction(store, clientId.data, String(fd.get("instruction") ?? ""), actor));
  if (!r.ok) return back("/os", "error", r.error);
  if (r.run.status === "QUEUED") kick();
  redirect(`/os/runs/${r.run.id}`);
}
export async function approvePlanAction(fd: FormData) {
  const actor = await requireHuman(); const store = defaultStore(); const runId = String(fd.get("run")); const clientId = String(fd.get("client"));
  const r = await guarded(`/os/runs/${runId}`, () => approvePlan(store, clientId, runId, actor));
  if (!r.ok) return back(`/os/runs/${runId}`, "error", r.error);
  kick(); redirect(`/os/runs/${runId}`);
}
export async function cancelRunAction(fd: FormData) { const actor = await requireHuman(); const runId = String(fd.get("run")); await cancelRun(defaultStore(), String(fd.get("client")), runId, actor); redirect(`/os/runs/${runId}`); }
export async function runWorkerNow() { await requireHuman(); const store = defaultStore(); const t = await tickSchedules(store); const r = await processJobs(store, { ai: aiOrUndefined(store), max: 3 }); back("/os/automation", "ok", `Worker ran: ${t.started.length} schedule(s) started, ${r.processed} job(s) processed${r.failed ? `, ${r.failed} failed` : ""}.`); }

export async function decideDeliverableAction(fd: FormData) {
  const actor = await requireHuman(); const store = defaultStore();
  const path = String(fd.get("back") || "/os/approvals"); const safe = path.startsWith("/os") ? path : "/os/approvals";
  const decision = z.enum(["approve", "request_changes", "reject"]).safeParse(fd.get("decision"));
  if (!decision.success) return back(safe, "error", "Unknown decision");
  const r = await guarded(safe, () => decideDeliverable(store, String(fd.get("client")), String(fd.get("id")), decision.data, actor, String(fd.get("note") ?? ""), aiOrUndefined(store)));
  if (!r.ok) return back(safe, "error", r.error);
  back(safe, "ok", r.note ?? (decision.data === "approve" ? "Approved. Nothing has been published or sent." : decision.data === "reject" ? "Rejected." : "Changes requested."));
}
export async function decideApprovalAction(fd: FormData) {
  const actor = await requireHuman(); const store = defaultStore();
  const approval = (await store.listApprovals()).find((a) => a.id === fd.get("id"));
  if (!approval) return back("/os/approvals", "error", "Approval not found");
  const approve = fd.get("decision") === "APPROVED";
  // Approval requests that point at a deliverable are decided through it, so QA rules and linked records stay consistent.
  if (approval.ref?.startsWith("deliverable:")) {
    const r = await guarded("/os/approvals", () => decideDeliverable(store, approval.clientId, approval.ref!.slice(12), approve ? "approve" : "reject", actor, "", undefined));
    if (!r.ok) return back("/os/approvals", "error", r.error);
  } else await guarded("/os/approvals", () => decideApproval(store, approval.id, approve ? "APPROVED" : "REJECTED", actor));
  back("/os/approvals", "ok", "Decision recorded. Nothing was executed: execution needs a connected, tested integration.");
}
export async function prepareExecutionAction(fd: FormData) {
  const actor = await requireHuman(); const runId = String(fd.get("run"));
  const r = await guarded(`/os/runs/${runId}`, () => prepareExecution(defaultStore(), String(fd.get("client")), runId, actor));
  if (!r.ok) return back(`/os/runs/${runId}`, "error", r.error);
  back(`/os/runs/${runId}`, "ok", "Execution package prepared from approved items. Nothing was published or scheduled.");
}

export async function addClientAction(fd: FormData) {
  await requireHuman();
  const p = z.object({ id: clientIdSchema, name: z.string().trim().min(1).max(120) }).safeParse({ id: String(fd.get("id") ?? "").trim().toLowerCase(), name: fd.get("name") });
  if (!p.success) return back("/os/clients", "error", p.error.issues[0].message);
  await guarded("/os/clients", () => onboardClient(defaultStore(), p.data));
  back("/os/clients", "ok", `Client ${p.data.name} created with an empty, isolated workspace`);
}
export async function addFactAction(fd: FormData) {
  const actor = await requireHuman();
  const p = z.object({ clientId: clientIdSchema, kb: z.enum(knowledgeBases), key: z.string().trim().regex(/^[a-z0-9_@-]{2,60}$/, "Key: lowercase letters, digits, _ - @"), value: z.string().trim().min(1).max(2000), status: z.enum(factStatuses), source: z.string().trim().min(2, "A source is required").max(300) }).safeParse(Object.fromEntries(["clientId", "kb", "key", "value", "status", "source"].map((k) => [k, fd.get(k)])));
  if (!p.success) return back("/os/knowledge", "error", p.error.issues[0].message);
  const store = defaultStore();
  if (!(await store.getClient(p.data.clientId))) return back("/os/knowledge", "error", "Unknown client");
  await store.putFact(p.data); await store.log({ clientId: p.data.clientId, actor, action: "fact.saved", detail: `${p.data.kb}.${p.data.key}` });
  back("/os/knowledge", "ok", "Saved as a new version (history is kept).");
}
export async function importCsvAction(fd: FormData) {
  const actor = await requireHuman(); const clientId = clientIdSchema.parse(fd.get("client")); const store = defaultStore();
  const lines = String(fd.get("csv") ?? "").trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return back("/os/analytics", "error", "Paste a header row (date,channel,metric,value) and at least one data row");
  const header = lines[0].toLowerCase().split(",").map((x) => x.trim());
  if (header.join(",") !== "date,channel,metric,value") return back("/os/analytics", "error", "Header must be exactly: date,channel,metric,value");
  let n = 0; const bad: number[] = [];
  for (const [i, l] of lines.slice(1).entries()) {
    const [date, channel, metric, value] = l.split(",").map((x) => x.trim());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "") || !/^[a-z0-9_]{2,30}$/i.test(channel ?? "") || !/^[a-z0-9_]{2,30}$/i.test(metric ?? "") || !Number.isFinite(Number(value))) { bad.push(i + 2); continue; }
    await store.putFact({ clientId, kb: "performance", key: `${channel}_${metric}@${date}`.toLowerCase(), value: String(Number(value)), status: "CLIENT-PROVIDED", source: `CSV import by ${actor.replace("human:", "")} on ${new Date().toISOString().slice(0, 10)}` }); n++;
  }
  await store.log({ clientId, actor, action: "performance.imported", detail: `${n} row(s)` });
  if (bad.length) return back("/os/analytics", "error", `Imported ${n} row(s). Rows with problems were skipped: line ${bad.slice(0, 8).join(", ")}`);
  back("/os/analytics", "ok", `Imported ${n} row(s) into the Performance knowledge base.`);
}
export async function createScheduleAction(fd: FormData) {
  await requireHuman(); const cadence = String(fd.get("cadence") ?? "");
  if (!validCadence(cadence)) return back("/os/automation", "error", "Cadence must look like daily@09:00, weekly:MON@09:00 or monthly:1@09:00 (IST)");
  await guarded("/os/automation", () => createSchedule(defaultStore(), { clientId: String(fd.get("client")), name: String(fd.get("name") || "Scheduled workflow").slice(0, 80), instruction: String(fd.get("instruction") ?? ""), cadence }));
  back("/os/automation", "ok", "Schedule created. It starts when the worker runs.");
}
export async function toggleScheduleAction(fd: FormData) {
  await requireHuman(); const store = defaultStore(); const s = (await store.listSchedules()).find((x) => x.id === fd.get("id"));
  if (s) await store.saveSchedule({ ...s, enabled: !s.enabled });
  redirect("/os/automation");
}
export async function testIntegrationAction(fd: FormData) {
  await requireHuman(); const id = String(fd.get("id"));
  const r = await guarded("/os/integrations", () => testIntegration(defaultStore(), id));
  back("/os/integrations", r.ok ? "ok" : "error", `${id}: ${r.detail}`);
}
export async function savePolicyAction(fd: FormData) {
  await requireHuman();
  const p = z.object({ enabled: z.boolean(), maxEstUsd: z.number().min(0).max(100), highImpact: z.array(z.enum(["campaign", "ads", "content_plan", "audit", "research", "strategy", "report", "general"])) }).safeParse({ enabled: fd.get("enabled") === "on", maxEstUsd: Number(fd.get("maxEstUsd")), highImpact: fd.getAll("highImpact") });
  if (!p.success) return back("/os/settings", "error", "Invalid policy values");
  await defaultStore().setSetting("autoRunPolicy", p.data);
  back("/os/settings", "ok", "Auto-run policy saved.");
}

export async function seedWorkspacesAction() {
  await requireHuman();
  await guarded("/os/clients", () => seedWorkspaces(defaultStore(), true));
  back("/os/clients", "ok", "Workspaces created from the private seed file (existing data untouched).");
}
