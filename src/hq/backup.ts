import type { StorePort, UsageRecord } from "./port";
import type { Approval, Client, Fact, Task } from "./types";

export type Dump = {
  version: 1; exportedAt: string;
  clients: Client[]; facts: Fact[]; tasks: Task[]; approvals: Approval[]; usage: UsageRecord[];
  outputs: { clientId: string; name: string; body: string }[];
};

/** Logical backup of everything except the activity log (append-only; covered by database backups). Works for any StorePort. */
export async function exportAll(s: StorePort): Promise<Dump> {
  const clients = await s.listClients();
  const outputs: Dump["outputs"] = [];
  const facts: Fact[] = [];
  for (const c of clients) {
    facts.push(...(await s.listFacts(c.id, { includeSuperseded: true })));
    for (const name of await s.listOutputs(c.id, { all: true })) outputs.push({ clientId: c.id, name, body: (await s.readOutput(c.id, name)) ?? "" });
  }
  return { version: 1, exportedAt: new Date().toISOString(), clients, facts, tasks: await s.listTasks(), approvals: await s.listApprovals(), usage: await s.listUsage(), outputs };
}

/** Idempotent restore: never overwrites or deletes anything that already exists. Returns counts of what was added. */
export async function importAll(s: StorePort, d: Dump) {
  if (d.version !== 1) throw new Error("Unsupported dump version");
  const added = { clients: 0, facts: 0, tasks: 0, approvals: 0, outputs: 0, usage: 0 };
  const have = new Set((await s.listClients()).map((c) => c.id));
  for (const c of d.clients) if (!have.has(c.id)) { await s.addClient(c); added.clients++; }
  for (const c of d.clients) added.facts += await s.importFacts(c.id, d.facts.filter((f) => f.clientId === c.id));
  const tasks = new Set((await s.listTasks()).map((t) => t.id));
  const newTasks = d.tasks.filter((t) => !tasks.has(t.id));
  if (newTasks.length) await s.insertTasks(newTasks);
  added.tasks = newTasks.length;
  const appr = new Set((await s.listApprovals()).map((a) => a.id));
  for (const a of d.approvals) if (!appr.has(a.id)) { await s.insertApproval(a); added.approvals++; }
  for (const o of d.outputs) if ((await s.readOutput(o.clientId, o.name)) === null) { await s.saveOutput(o.clientId, o.name, o.body); added.outputs++; }
  if (!(await s.listUsage()).length) for (const u of d.usage) { await s.recordUsage(u); added.usage++; }
  await s.log({ clientId: null, actor: "system", action: "backup.imported", detail: JSON.stringify(added) });
  return added;
}
