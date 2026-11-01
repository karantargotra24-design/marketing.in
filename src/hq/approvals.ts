import type { StorePort } from "./port";
import type { Approval } from "./types";
import { agentIds } from "./types";
import { isOperational } from "./integrations";

const AGENT_ACTORS = new Set<string>([...agentIds, "orchestrator", "system"]);

export async function requestApproval(store: StorePort, a: Pick<Approval, "clientId" | "kind" | "summary" | "requestedBy"> & { ref?: string | null }): Promise<Approval> {
  const approval: Approval = { id: store.newId("appr"), ref: null, ...a, status: "PENDING", decidedAt: null, decidedBy: null, executedAt: null, createdAt: new Date().toISOString() };
  await store.insertApproval(approval);
  await store.log({ clientId: a.clientId, actor: a.requestedBy, action: "approval.requested", detail: `${a.kind}: ${a.summary}` });
  return approval;
}

/** Only a human actor ("human:<name>") may decide. Agents can never approve their own requests. */
export async function decideApproval(store: StorePort, id: string, decision: "APPROVED" | "REJECTED", decidedBy: string): Promise<Approval> {
  if (!decidedBy.startsWith("human:") || AGENT_ACTORS.has(decidedBy)) throw new Error("Only a human can decide an approval");
  const cur = (await store.listApprovals()).find((x) => x.id === id);
  if (!cur) throw new Error("Approval not found");
  if (cur.status !== "PENDING") throw new Error(`Approval already ${cur.status}`);
  const out = await store.patchApproval(id, { status: decision, decidedAt: new Date().toISOString(), decidedBy });
  await store.log({ clientId: cur.clientId, actor: decidedBy, action: `approval.${decision.toLowerCase()}`, detail: cur.summary });
  return out;
}

export type ExternalResult = { ok: true; result: unknown } | { ok: false; reason: string };

/**
 * The only code path that may perform an external action (publish, ad launch, spend, message).
 * Requires: approved + same client + not already executed + integration connected AND tested. Otherwise nothing runs.
 */
export async function performExternalAction(store: StorePort, p: { approvalId: string; clientId: string; integrationId: string; execute: () => Promise<unknown> }): Promise<ExternalResult> {
  const a = (await store.listApprovals()).find((x) => x.id === p.approvalId);
  if (!a) return { ok: false, reason: "No such approval" };
  if (a.clientId !== p.clientId) return { ok: false, reason: "Approval belongs to a different client workspace" };
  if (a.status !== "APPROVED") return { ok: false, reason: `Approval is ${a.status}, not APPROVED` };
  if (a.executedAt) return { ok: false, reason: "Approval already used" };
  if (!isOperational(p.integrationId)) return { ok: false, reason: `Integration "${p.integrationId}" is not connected and tested; action not performed` };
  await store.patchApproval(a.id, { executedAt: new Date().toISOString() });
  await store.log({ clientId: a.clientId, actor: "system", action: "external.executed", detail: `${p.integrationId}: ${a.summary}` });
  return { ok: true, result: await p.execute() };
}
