import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { StorePort, UsageRecord } from "./port";
import type { ExecutionRecord, Deliverable, DeliverableStatus, DeliverableVersion, Job, Run, Schedule } from "./types";
import { approvalSchema, clientSchema, factSchema, taskSchema, type Approval, type Client, type Fact, type LogEntry, type Task } from "./types";

/**
 * File-backed store. One folder per client under <root>/clients/<id>/ so data boundaries
 * are physical, not just a column. Writes are serialized per file and atomic (tmp + rename).
 * Swap for a Supabase adapter later; callers only use this class.
 */
export class HqStore implements StorePort {
  private locks = new Map<string, Promise<unknown>>();
  constructor(public readonly root: string) {}

  newId(prefix: string) {
    return `${prefix}_${Date.now().toString(36)}${randomBytes(3).toString("hex")}`;
  }

  private async serial<T>(file: string, fn: () => Promise<T>): Promise<T> {
    const prev = this.locks.get(file) ?? Promise.resolve();
    const next = prev.then(fn, fn);
    this.locks.set(file, next.catch(() => undefined));
    return next;
  }

  private async readJson<T>(file: string, fallback: T): Promise<T> {
    try { return JSON.parse(await fs.readFile(file, "utf8")) as T; } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return fallback;
      throw e;
    }
  }

  private async writeJson(file: string, data: unknown) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${randomBytes(4).toString("hex")}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2) + "\n");
    await fs.rename(tmp, file);
  }

  private update<T>(file: string, fallback: T, mutate: (cur: T) => T): Promise<T> {
    return this.serial(file, async () => {
      const next = mutate(await this.readJson(file, fallback));
      await this.writeJson(file, next);
      return next;
    });
  }

  clientDir(clientId: string) {
    const dir = path.resolve(this.root, "clients", clientId);
    if (path.dirname(dir) !== path.resolve(this.root, "clients")) throw new Error("Invalid client id");
    return dir;
  }

  // ---- clients registry (agency-level) ----
  async listClients(): Promise<Client[]> {
    return (await this.readJson<unknown[]>(path.join(this.root, "clients.json"), [])).map((c) => clientSchema.parse(c));
  }
  async getClient(id: string) { return (await this.listClients()).find((c) => c.id === id) ?? null; }
  async addClient(c: Client) {
    const parsed = clientSchema.parse(c);
    await this.update<Client[]>(path.join(this.root, "clients.json"), [], (cur) => {
      if (cur.some((x) => x.id === parsed.id)) throw new Error(`Client ${parsed.id} already exists`);
      return [...cur, parsed];
    });
    await fs.mkdir(path.join(this.clientDir(parsed.id), "outputs"), { recursive: true });
    await this.log({ clientId: parsed.id, actor: "system", action: "client.created", detail: parsed.name });
  }

  // ---- facts (per client file) ----
  private factsFile(clientId: string) { return path.join(this.clientDir(clientId), "facts.json"); }
  async listFacts(clientId: string, opts: { includeSuperseded?: boolean } = {}): Promise<Fact[]> {
    const all = (await this.readJson<unknown[]>(this.factsFile(clientId), [])).map((f) => factSchema.parse(f));
    return opts.includeSuperseded ? all : all.filter((f) => !f.supersededBy);
  }
  /** Adds a fact. If an active fact with the same kb+key exists it is superseded, not deleted (history kept). */
  async putFact(input: Omit<Fact, "id" | "version" | "supersededBy" | "createdAt">): Promise<Fact> {
    const id = this.newId("fact");
    let created!: Fact;
    await this.update<Fact[]>(this.factsFile(input.clientId), [], (cur) => {
      const prev = cur.find((f) => f.kb === input.kb && f.key === input.key && !f.supersededBy);
      created = factSchema.parse({ ...input, id, version: prev ? prev.version + 1 : 1, supersededBy: null, createdAt: new Date().toISOString() });
      return [...cur.map((f) => (prev && f.id === prev.id ? { ...f, supersededBy: id } : f)), created];
    });
    return created;
  }

  // ---- tasks (agency-level file, every row carries clientId) ----
  private tasksFile() { return path.join(this.root, "tasks.json"); }
  async listTasks(filter: { clientId?: string; runId?: string } = {}): Promise<Task[]> {
    const all = (await this.readJson<unknown[]>(this.tasksFile(), [])).map((t) => taskSchema.parse(t));
    return all.filter((t) => (!filter.clientId || t.clientId === filter.clientId) && (!filter.runId || t.runId === filter.runId));
  }
  async insertTasks(tasks: Task[]) { await this.update<Task[]>(this.tasksFile(), [], (cur) => [...cur, ...tasks.map((t) => taskSchema.parse(t))]); }
  async patchTask(id: string, patch: Partial<Task>): Promise<Task> {
    let out!: Task;
    await this.update<Task[]>(this.tasksFile(), [], (cur) => cur.map((t) => {
      if (t.id !== id) return t;
      out = taskSchema.parse({ ...t, ...patch });
      return out;
    }));
    if (!out) throw new Error(`Task ${id} not found`);
    return out;
  }

  // ---- approvals ----
  private approvalsFile() { return path.join(this.root, "approvals.json"); }
  async listApprovals(clientId?: string): Promise<Approval[]> {
    const all = (await this.readJson<unknown[]>(this.approvalsFile(), [])).map((a) => approvalSchema.parse(a));
    return clientId ? all.filter((a) => a.clientId === clientId) : all;
  }
  async insertApproval(a: Approval) { await this.update<Approval[]>(this.approvalsFile(), [], (cur) => [...cur, approvalSchema.parse(a)]); }
  async patchApproval(id: string, patch: Partial<Approval>): Promise<Approval> {
    let out!: Approval;
    await this.update<Approval[]>(this.approvalsFile(), [], (cur) => cur.map((a) => {
      if (a.id !== id) return a;
      out = approvalSchema.parse({ ...a, ...patch });
      return out;
    }));
    if (!out) throw new Error(`Approval ${id} not found`);
    return out;
  }

  // ---- outputs (markdown inside the client folder) ----
  async saveOutput(clientId: string, name: string, body: string): Promise<string> {
    if (!/^[\w.-]+$/.test(name)) throw new Error("Invalid output name");
    const rel = path.join("clients", clientId, "outputs", name);
    const abs = path.join(this.clientDir(clientId), "outputs", name);
    await this.serial(abs, async () => { await fs.mkdir(path.dirname(abs), { recursive: true }); await fs.writeFile(abs, body); });
    return rel;
  }
  async readOutput(clientId: string, name: string): Promise<string | null> {
    if (!/^[\w.-]+$/.test(name)) throw new Error("Invalid output name");
    try { return await fs.readFile(path.join(this.clientDir(clientId), "outputs", name), "utf8"); } catch { return null; }
  }
  async listOutputs(clientId: string, opts: { all?: boolean } = {}): Promise<string[]> {
    try { return (await fs.readdir(path.join(this.clientDir(clientId), "outputs"))).filter((f) => opts.all ? /^[\w.-]+$/.test(f) && !f.endsWith(".tmp") : f.endsWith(".md")).sort(); } catch { return []; }
  }
  async importFacts(clientId: string, facts: Fact[]): Promise<number> {
    let added = 0;
    await this.update<Fact[]>(this.factsFile(clientId), [], (cur) => {
      const have = new Set(cur.map((f) => f.id));
      const fresh = facts.filter((f) => f.clientId === clientId && !have.has(f.id)).map((f) => factSchema.parse(f));
      added = fresh.length;
      return [...cur, ...fresh];
    });
    return added;
  }

  // ---- AI usage ledger (append-only JSONL) ----
  async recordUsage(u: UsageRecord) {
    const file = path.join(this.root, "usage.jsonl");
    await this.serial(file, async () => { await fs.mkdir(this.root, { recursive: true }); await fs.appendFile(file, JSON.stringify(u) + "\n"); });
  }
  async listUsage(filter: { clientId?: string; since?: string } = {}): Promise<UsageRecord[]> {
    try {
      const rows = (await fs.readFile(path.join(this.root, "usage.jsonl"), "utf8")).trim().split("\n").filter(Boolean).map((l) => JSON.parse(l) as UsageRecord);
      return rows.filter((r) => (!filter.clientId || r.clientId === filter.clientId) && (!filter.since || r.at >= filter.since));
    } catch { return []; }
  }

  // ---- runs / deliverables / jobs / schedules / settings (file-backed; Postgres is the production store) ----
  private col(name: string) { return path.join(this.root, `${name}.json`); }
  async createRun(r: Run) { await this.update<Run[]>(this.col("runs"), [], (c) => [...c, r]); }
  async getRun(clientId: string, id: string) { return (await this.readJson<Run[]>(this.col("runs"), [])).find((r) => r.id === id && r.clientId === clientId) ?? null; }
  async listRuns(f: { clientId?: string; limit?: number } = {}) {
    const rows = (await this.readJson<Run[]>(this.col("runs"), [])).filter((r) => !f.clientId || r.clientId === f.clientId);
    return f.limit ? rows.slice(-f.limit) : rows;
  }
  async patchRun(clientId: string, id: string, patch: Partial<Run>) {
    let out: Run | undefined;
    await this.update<Run[]>(this.col("runs"), [], (c) => c.map((r) => (r.id === id && r.clientId === clientId ? (out = { ...r, ...patch }) : r)));
    if (!out) throw new Error(`Run ${id} not found`);
    return out;
  }
  private dfile() { return this.col("deliverables"); }
  async createDeliverable(d: Omit<Deliverable, "currentVersion" | "createdAt" | "updatedAt">, body: unknown, by: string, note = "") {
    const now = new Date().toISOString();
    const full: Deliverable = { ...d, currentVersion: 1, createdAt: now, updatedAt: now };
    await this.update<{ d: Deliverable; v: DeliverableVersion[] }[]>(this.dfile(), [], (c) => [...c, { d: full, v: [{ deliverableId: d.id, version: 1, body, note, createdBy: by, createdAt: now }] }]);
    return full;
  }
  async reviseDeliverable(clientId: string, id: string, body: unknown, by: string, note = "") {
    let out: Deliverable | undefined;
    await this.update<{ d: Deliverable; v: DeliverableVersion[] }[]>(this.dfile(), [], (c) => c.map((x) => {
      if (x.d.id !== id || x.d.clientId !== clientId) return x;
      const now = new Date().toISOString(); const version = x.d.currentVersion + 1;
      out = { ...x.d, currentVersion: version, status: "draft", qa: null, updatedAt: now };
      return { d: out, v: [...x.v, { deliverableId: id, version, body, note, createdBy: by, createdAt: now }] };
    }));
    if (!out) throw new Error(`Deliverable ${id} not found`);
    return out;
  }
  async patchDeliverable(clientId: string, id: string, patch: { status?: DeliverableStatus; qa?: Deliverable["qa"] }) {
    let out: Deliverable | undefined;
    await this.update<{ d: Deliverable; v: DeliverableVersion[] }[]>(this.dfile(), [], (c) => c.map((x) => (x.d.id === id && x.d.clientId === clientId ? { ...x, d: (out = { ...x.d, ...patch, updatedAt: new Date().toISOString() }) } : x)));
    if (!out) throw new Error(`Deliverable ${id} not found`);
    return out;
  }
  async getDeliverable(clientId: string, id: string) {
    const x = (await this.readJson<{ d: Deliverable; v: DeliverableVersion[] }[]>(this.dfile(), [])).find((y) => y.d.id === id && y.d.clientId === clientId);
    return x ? { deliverable: x.d, versions: x.v } : null;
  }
  async listDeliverables(f: { clientId: string; runId?: string; kind?: string }) {
    return (await this.readJson<{ d: Deliverable }[]>(this.dfile(), [])).map((x) => x.d).filter((d) => d.clientId === f.clientId && (!f.runId || d.runId === f.runId) && (!f.kind || d.kind === f.kind));
  }
  async enqueueJob(j: Job) { await this.update<Job[]>(this.col("jobs"), [], (c) => [...c, j]); }
  async leaseJobs(max: number, leaseMs: number, now = new Date()) {
    const leased: Job[] = [];
    await this.update<Job[]>(this.col("jobs"), [], (c) => c.map((j) => {
      const due = j.runAfter <= now.toISOString() && (j.status === "queued" || (j.status === "leased" && (j.leaseUntil ?? "") < now.toISOString()));
      if (!due || leased.length >= max) return j;
      const n = { ...j, status: "leased" as const, attempts: j.attempts + 1, leaseUntil: new Date(now.getTime() + leaseMs).toISOString() };
      leased.push(n); return n;
    }));
    return leased;
  }
  async finishJob(id: string, o: { ok: true } | { ok: false; error: string; retryAt?: string }) {
    await this.update<Job[]>(this.col("jobs"), [], (c) => c.map((j) => (j.id !== id ? j : o.ok ? { ...j, status: "done", leaseUntil: null } : o.retryAt ? { ...j, status: "queued", runAfter: o.retryAt, leaseUntil: null, error: o.error } : { ...j, status: "failed", leaseUntil: null, error: o.error })));
  }
  async listJobs(f: { status?: Job["status"] } = {}) { return (await this.readJson<Job[]>(this.col("jobs"), [])).filter((j) => !f.status || j.status === f.status); }
  async listSchedules(clientId?: string) { return (await this.readJson<Schedule[]>(this.col("schedules"), [])).filter((s) => !clientId || s.clientId === clientId); }
  async saveSchedule(s: Schedule) { await this.update<Schedule[]>(this.col("schedules"), [], (c) => (c.some((x) => x.id === s.id) ? c.map((x) => (x.id === s.id ? s : x)) : [...c, s])); }
  async getSetting<T = unknown>(key: string) { const m = await this.readJson<Record<string, unknown>>(this.col("settings"), {}); return (m[key] as T) ?? null; }
  async setSetting(key: string, value: unknown) { await this.update<Record<string, unknown>>(this.col("settings"), {}, (m) => ({ ...m, [key]: value })); }

  // ---- execution history (append-only JSONL) ----
  async recordExecution(e: ExecutionRecord) {
    const file = path.join(this.root, "executions.jsonl");
    await this.serial(file, async () => { await fs.mkdir(this.root, { recursive: true }); await fs.appendFile(file, JSON.stringify(e) + "\n"); });
  }
  async listExecutions(filter: { clientId?: string; runId?: string; limit?: number } = {}): Promise<ExecutionRecord[]> {
    try {
      const rows = (await fs.readFile(path.join(this.root, "executions.jsonl"), "utf8")).trim().split("\n").filter(Boolean).map((l) => JSON.parse(l) as ExecutionRecord)
        .filter((r) => (!filter.clientId || r.clientId === filter.clientId) && (!filter.runId || r.runId === filter.runId));
      return filter.limit ? rows.slice(-filter.limit) : rows;
    } catch { return []; }
  }

  // ---- activity log (append-only JSONL) ----
  async log(e: Omit<LogEntry, "at">) {
    const file = path.join(this.root, "activity.log.jsonl");
    await this.serial(file, async () => {
      await fs.mkdir(this.root, { recursive: true });
      await fs.appendFile(file, JSON.stringify({ at: new Date().toISOString(), ...e }) + "\n");
    });
  }
  async readLog(limit = 200): Promise<LogEntry[]> {
    try {
      const lines = (await fs.readFile(path.join(this.root, "activity.log.jsonl"), "utf8")).trim().split("\n").filter(Boolean);
      return lines.slice(-limit).map((l) => JSON.parse(l) as LogEntry);
    } catch { return []; }
  }
}
