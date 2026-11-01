import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { StorePort, UsageRecord } from "./port";
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
  async listOutputs(clientId: string): Promise<string[]> {
    try { return (await fs.readdir(path.join(this.clientDir(clientId), "outputs"))).filter((f) => f.endsWith(".md")).sort(); } catch { return []; }
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
