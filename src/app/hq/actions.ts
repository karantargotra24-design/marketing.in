"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { aiEngineFromEnv, agentIds, clientIdSchema, defaultStore, factStatuses, knowledgeBases, onboardClient, Orchestrator, WORKFLOWS, decideApproval, requestApproval, seedWorkspaces } from "@/hq";
import { requireHuman } from "./guard";

const orchestrator = (store: ReturnType<typeof defaultStore>) => new Orchestrator(store, { ai: aiEngineFromEnv(store) });
const back = (msg: string, kind: "error" | "ok" = "error") => redirect(`/hq?${kind}=${encodeURIComponent(msg)}`);
const fail = (e: unknown): never => back(e instanceof Error ? e.message : "Something went wrong");

export async function seedAction() {
  await requireHuman();
  try { await seedWorkspaces(defaultStore(), true); } catch (e) { fail(e); }
  revalidatePath("/hq"); back("Seeded Pahadi Origin, Propedia and Personal Brand (existing data untouched)", "ok");
}

export async function addClientAction(fd: FormData) {
  await requireHuman();
  const p = z.object({ id: clientIdSchema, name: z.string().trim().min(1).max(120) }).safeParse({ id: String(fd.get("id") ?? "").trim().toLowerCase(), name: fd.get("name") });
  if (!p.success) return back(p.error.issues[0].message);
  try { await onboardClient(defaultStore(), p.data); } catch (e) { fail(e); }
  revalidatePath("/hq"); back(`Client ${p.data.name} onboarded with an empty, isolated workspace`, "ok");
}

export async function runWorkflowAction(fd: FormData) {
  await requireHuman();
  const p = z.object({ clientId: clientIdSchema, workflow: z.enum(Object.keys(WORKFLOWS) as [string, ...string[]]) }).safeParse({ clientId: fd.get("clientId"), workflow: fd.get("workflow") });
  if (!p.success) return back(p.error.issues[0].message);
  try { const store = defaultStore(); await orchestrator(store).runWorkflow(p.data.clientId, p.data.workflow); } catch (e) { fail(e); }
  revalidatePath("/hq"); back(`Workflow ${p.data.workflow} finished for ${p.data.clientId}`, "ok");
}

export async function createTaskAction(fd: FormData) {
  await requireHuman();
  const p = z.object({ clientId: clientIdSchema, agent: z.enum(agentIds), description: z.string().trim().min(3).max(300), priority: z.enum(["high", "normal", "low"]) })
    .safeParse({ clientId: fd.get("clientId"), agent: fd.get("agent"), description: fd.get("description"), priority: fd.get("priority") ?? "normal" });
  if (!p.success) return back(p.error.issues[0].message);
  try { const o = orchestrator(defaultStore()); const { runId } = await o.planSingle(p.data.clientId, p.data.agent, p.data.description, p.data.priority); await o.execute(runId); } catch (e) { fail(e); }
  revalidatePath("/hq"); back("Task created and run", "ok");
}

export async function addFactAction(fd: FormData) {
  await requireHuman();
  const p = z.object({ clientId: clientIdSchema, kb: z.enum(knowledgeBases), key: z.string().trim().regex(/^[a-z0-9_@-]{2,60}$/), value: z.string().trim().min(1).max(2000), status: z.enum(factStatuses), source: z.string().trim().min(2, "Source is required").max(300) })
    .safeParse(Object.fromEntries(["clientId", "kb", "key", "value", "status", "source"].map((k) => [k, fd.get(k)])));
  if (!p.success) return back(p.error.issues[0].message);
  const store = defaultStore();
  if (!(await store.getClient(p.data.clientId))) return back("Unknown client");
  await store.putFact(p.data);
  await store.log({ clientId: p.data.clientId, actor: "human", action: "fact.saved", detail: `${p.data.kb}.${p.data.key}` });
  revalidatePath("/hq"); redirect(`/hq/client/${p.data.clientId}?ok=Fact+saved`);
}

export async function requestApprovalAction(fd: FormData) {
  await requireHuman();
  const p = z.object({ clientId: clientIdSchema, kind: z.enum(["publish_post", "launch_ad", "spend_money", "send_client_message", "modify_production", "other"]), summary: z.string().trim().min(3).max(300) })
    .safeParse({ clientId: fd.get("clientId"), kind: fd.get("kind"), summary: fd.get("summary") });
  if (!p.success) return back(p.error.issues[0].message);
  await requestApproval(defaultStore(), { ...p.data, requestedBy: "human" });
  revalidatePath("/hq"); back("Approval request recorded. Nothing has been sent or published", "ok");
}

export async function decideApprovalAction(fd: FormData) {
  const who = await requireHuman();
  const decision = fd.get("decision") === "APPROVED" ? "APPROVED" : "REJECTED";
  try { await decideApproval(defaultStore(), String(fd.get("id")), decision, who); } catch (e) { fail(e); }
  revalidatePath("/hq"); back(`Approval ${decision.toLowerCase()}. No external action is wired yet, so nothing was executed`, "ok");
}
