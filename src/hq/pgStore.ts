import { randomBytes } from "node:crypto";
import type { StorePort, UsageRecord } from "./port";
import { OUTPUT_NAME_RE } from "./port";
import { approvalSchema, clientSchema, factSchema, taskSchema, type Approval, type Client, type Fact, type LogEntry, type Task } from "./types";

/** Minimal Postgres interface so production (`pg` pool) and tests (PGlite) share one implementation. */
export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[]; rowCount?: number }>;
  tx<T>(fn: (q: Db) => Promise<T>): Promise<T>;
}

type Row = Record<string, unknown>;
const iso = (v: unknown) => (v == null ? null : new Date(v as string).toISOString());

/**
 * Postgres-backed store. EVERY statement is scoped by agency_id (and client_id where relevant); the server role bypasses RLS,
 * so this scoping is the primary isolation control and RLS is the second layer for every other access path.
 */
export class PgStore implements StorePort {
  constructor(private db: Db, readonly agencyId: string) {}

  newId(prefix: string) { return `${prefix}_${Date.now().toString(36)}${randomBytes(3).toString("hex")}`; }

  // ---- clients ----
  private toClient(r: Row): Client {
    return clientSchema.parse({ id: r.id, name: r.name, kind: r.kind, createdAt: iso(r.created_at), doNotSay: r.do_not_say, agentPermissions: r.agent_permissions });
  }
  async listClients() {
    const { rows } = await this.db.query("select * from hq.clients where agency_id = $1 order by created_at, id", [this.agencyId]);
    return rows.map((r) => this.toClient(r));
  }
  async getClient(id: string) {
    const { rows } = await this.db.query("select * from hq.clients where agency_id = $1 and id = $2", [this.agencyId, id]);
    return rows[0] ? this.toClient(rows[0]) : null;
  }
  async addClient(c: Client) {
    const p = clientSchema.parse(c);
    try {
      await this.db.query("insert into hq.clients (agency_id, id, name, kind, do_not_say, agent_permissions, created_at) values ($1,$2,$3,$4,$5,$6,$7)",
        [this.agencyId, p.id, p.name, p.kind, JSON.stringify(p.doNotSay), JSON.stringify(p.agentPermissions), p.createdAt]);
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new Error(`Client ${p.id} already exists`);
      throw e;
    }
    await this.log({ clientId: p.id, actor: "system", action: "client.created", detail: p.name });
  }

  // ---- facts ----
  private toFact(r: Row): Fact {
    return factSchema.parse({ id: r.id, clientId: r.client_id, kb: r.kb, key: r.key, value: r.value, status: r.status, source: r.source, version: r.version, supersededBy: r.superseded_by, createdAt: iso(r.created_at) });
  }
  async listFacts(clientId: string, opts: { includeSuperseded?: boolean } = {}) {
    const { rows } = await this.db.query(`select * from hq.facts where agency_id = $1 and client_id = $2 ${opts.includeSuperseded ? "" : "and superseded_by is null"} order by created_at, id`, [this.agencyId, clientId]);
    return rows.map((r) => this.toFact(r));
  }
  async putFact(input: Omit<Fact, "id" | "version" | "supersededBy" | "createdAt">): Promise<Fact> {
    const id = this.newId("fact");
    const candidate = factSchema.parse({ ...input, id, version: 1, supersededBy: null, createdAt: new Date().toISOString() }); // validates before touching the DB
    return this.db.tx(async (q) => {
      const prev = (await q.query<Row>("select id, version from hq.facts where agency_id=$1 and client_id=$2 and kb=$3 and key=$4 and superseded_by is null for update", [this.agencyId, input.clientId, input.kb, input.key])).rows[0];
      const version = prev ? Number(prev.version) + 1 : 1;
      if (prev) await q.query("update hq.facts set superseded_by = $1 where id = $2 and agency_id = $3", [id, prev.id, this.agencyId]);
      await q.query("insert into hq.facts (id, agency_id, client_id, kb, key, value, status, source, version, created_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
        [id, this.agencyId, candidate.clientId, candidate.kb, candidate.key, candidate.value, candidate.status, candidate.source, version, candidate.createdAt]);
      return { ...candidate, version };
    });
  }

  // ---- tasks ----
  private toTask(r: Row): Task {
    return taskSchema.parse({ id: r.id, clientId: r.client_id, runId: r.run_id, description: r.description, agent: r.agent, step: r.step, allowPartial: r.allow_partial, priority: r.priority, status: r.status,
      dependsOn: r.depends_on, startedAt: iso(r.started_at), completedAt: iso(r.completed_at), outputPath: r.output_path, reviewStatus: r.review_status, attempts: r.attempts, error: r.error, createdAt: iso(r.created_at) });
  }
  async listTasks(filter: { clientId?: string; runId?: string } = {}) {
    const { rows } = await this.db.query("select * from hq.tasks where agency_id = $1 and ($2::text is null or client_id = $2) and ($3::text is null or run_id = $3) order by created_at, id", [this.agencyId, filter.clientId ?? null, filter.runId ?? null]);
    return rows.map((r) => this.toTask(r));
  }
  async insertTasks(tasks: Task[]) {
    await this.db.tx(async (q) => {
      for (const raw of tasks) {
        const t = taskSchema.parse(raw);
        await q.query("insert into hq.tasks (id, agency_id, client_id, run_id, description, agent, step, allow_partial, priority, status, depends_on, started_at, completed_at, output_path, review_status, attempts, error, created_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)",
          [t.id, this.agencyId, t.clientId, t.runId, t.description, t.agent, t.step, t.allowPartial, t.priority, t.status, JSON.stringify(t.dependsOn), t.startedAt, t.completedAt, t.outputPath, t.reviewStatus, t.attempts, t.error, t.createdAt]);
      }
    });
  }
  async patchTask(id: string, patch: Partial<Task>) {
    const cols: Record<string, string> = { status: "status", outputPath: "output_path", reviewStatus: "review_status", attempts: "attempts", error: "error", startedAt: "started_at", completedAt: "completed_at" };
    const sets: string[] = []; const vals: unknown[] = [id, this.agencyId];
    for (const [k, v] of Object.entries(patch)) {
      if (!cols[k]) throw new Error(`Task field "${k}" cannot be patched`);
      vals.push(v); sets.push(`${cols[k]} = $${vals.length}`);
    }
    if (!sets.length) { const cur = (await this.listTasks()).find((t) => t.id === id); if (!cur) throw new Error(`Task ${id} not found`); return cur; }
    const { rows } = await this.db.query(`update hq.tasks set ${sets.join(", ")} where id = $1 and agency_id = $2 returning *`, vals);
    if (!rows[0]) throw new Error(`Task ${id} not found`);
    return this.toTask(rows[0]);
  }

  // ---- approvals ----
  private toApproval(r: Row): Approval {
    return approvalSchema.parse({ id: r.id, clientId: r.client_id, kind: r.kind, summary: r.summary, requestedBy: r.requested_by, status: r.status, decidedAt: iso(r.decided_at), decidedBy: r.decided_by, executedAt: iso(r.executed_at), createdAt: iso(r.created_at) });
  }
  async listApprovals(clientId?: string) {
    const { rows } = await this.db.query("select * from hq.approvals where agency_id = $1 and ($2::text is null or client_id = $2) order by created_at, id", [this.agencyId, clientId ?? null]);
    return rows.map((r) => this.toApproval(r));
  }
  async insertApproval(a: Approval) {
    const p = approvalSchema.parse(a);
    await this.db.query("insert into hq.approvals (id, agency_id, client_id, kind, summary, requested_by, status, decided_at, decided_by, executed_at, created_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
      [p.id, this.agencyId, p.clientId, p.kind, p.summary, p.requestedBy, p.status, p.decidedAt, p.decidedBy, p.executedAt, p.createdAt]);
  }
  async patchApproval(id: string, patch: Partial<Approval>) {
    const cols: Record<string, string> = { status: "status", decidedAt: "decided_at", decidedBy: "decided_by", executedAt: "executed_at" };
    const sets: string[] = []; const vals: unknown[] = [id, this.agencyId];
    for (const [k, v] of Object.entries(patch)) { if (!cols[k]) throw new Error(`Approval field "${k}" cannot be patched`); vals.push(v); sets.push(`${cols[k]} = $${vals.length}`); }
    const { rows } = await this.db.query(`update hq.approvals set ${sets.join(", ")} where id = $1 and agency_id = $2 returning *`, vals);
    if (!rows[0]) throw new Error(`Approval ${id} not found`);
    return this.toApproval(rows[0]);
  }

  // ---- outputs ----
  async saveOutput(clientId: string, name: string, body: string) {
    if (!OUTPUT_NAME_RE.test(name)) throw new Error("Invalid output name");
    await this.db.query("insert into hq.outputs (agency_id, client_id, name, body) values ($1,$2,$3,$4) on conflict (agency_id, client_id, name) do update set body = excluded.body, updated_at = now()", [this.agencyId, clientId, name, body]);
    return `clients/${clientId}/outputs/${name}`;
  }
  async readOutput(clientId: string, name: string) {
    if (!OUTPUT_NAME_RE.test(name)) throw new Error("Invalid output name");
    const { rows } = await this.db.query<{ body: string }>("select body from hq.outputs where agency_id=$1 and client_id=$2 and name=$3", [this.agencyId, clientId, name]);
    return rows[0]?.body ?? null;
  }
  async listOutputs(clientId: string, opts: { all?: boolean } = {}) {
    const { rows } = await this.db.query<{ name: string }>(`select name from hq.outputs where agency_id=$1 and client_id=$2 ${opts.all ? "" : "and name like '%.md'"} order by name`, [this.agencyId, clientId]);
    return rows.map((r) => r.name);
  }
  async importFacts(clientId: string, facts: Fact[]) {
    return this.db.tx(async (q) => {
      let added = 0;
      for (const raw of facts) {
        const f = factSchema.parse(raw);
        if (f.clientId !== clientId) continue;
        const r = await q.query("insert into hq.facts (id, agency_id, client_id, kb, key, value, status, source, version, superseded_by, created_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict (agency_id, id) do nothing", [f.id, this.agencyId, f.clientId, f.kb, f.key, f.value, f.status, f.source, f.version, f.supersededBy, f.createdAt]);
        added += r.rowCount ?? 0;
      }
      return added;
    });
  }

  // ---- log + usage ----
  async log(e: Omit<LogEntry, "at">) {
    await this.db.query("insert into hq.activity_log (agency_id, client_id, actor, action, detail) values ($1,$2,$3,$4,$5)", [this.agencyId, e.clientId, e.actor, e.action, e.detail]);
  }
  async readLog(limit = 200): Promise<LogEntry[]> {
    const { rows } = await this.db.query("select * from (select * from hq.activity_log where agency_id=$1 order by id desc limit $2) s order by id", [this.agencyId, limit]);
    return rows.map((r) => ({ at: iso(r.at)!, clientId: (r.client_id as string) ?? null, actor: r.actor as string, action: r.action as string, detail: r.detail as string }));
  }
  async recordUsage(u: UsageRecord) {
    await this.db.query("insert into hq.usage (agency_id, client_id, task_id, agent, provider, model, input_tokens, output_tokens, cache_read_tokens, cost_usd, at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
      [this.agencyId, u.clientId, u.taskId, u.agent, u.provider, u.model, u.inputTokens, u.outputTokens, u.cacheReadTokens, u.costUsd, u.at]);
  }
  async listUsage(filter: { clientId?: string; since?: string } = {}): Promise<UsageRecord[]> {
    const { rows } = await this.db.query("select * from hq.usage where agency_id=$1 and ($2::text is null or client_id=$2) and ($3::timestamptz is null or at >= $3) order by id", [this.agencyId, filter.clientId ?? null, filter.since ?? null]);
    return rows.map((r) => ({ clientId: (r.client_id as string) ?? null, taskId: (r.task_id as string) ?? null, agent: r.agent as string, provider: r.provider as string, model: r.model as string,
      inputTokens: Number(r.input_tokens), outputTokens: Number(r.output_tokens), cacheReadTokens: Number(r.cache_read_tokens), costUsd: Number(r.cost_usd), at: iso(r.at)! }));
  }
}
