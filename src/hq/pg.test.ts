import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { PGlite } from "@electric-sql/pglite";
import { HqStore } from "./store";
import { PgStore, type Db } from "./pgStore";
import type { StorePort } from "./port";
import { Orchestrator } from "./orchestrator";
import { seedWorkspaces } from "./seed";
import { SAMPLE_CLIENTS } from "./fixtures";
import { exportAll, importAll } from "./backup";
import { requestApproval, decideApproval } from "./approvals";
import { freshDatabase, makeAgency, makeStaff } from "./testing/pglite";

let pg: PGlite; let db: Db; let agencyA: string; let agencyB: string;
beforeAll(async () => { ({ pg, db } = await freshDatabase()); agencyA = await makeAgency(pg, "Agency A"); agencyB = await makeAgency(pg, "Agency B"); });

type Factory = () => Promise<StorePort>;
const factories: [string, Factory][] = [
  ["file store", async () => new HqStore(await mkdtemp(path.join(tmpdir(), "hq-c-")))],
  ["postgres store", async () => { const id = await makeAgency(pg, `T-${Math.random()}`); return new PgStore(db, id); }],
];

describe.each(factories)("storage contract: %s", (_n, make) => {
  let s: StorePort;
  beforeEach(async () => { s = await make(); await seedWorkspaces(s, true, SAMPLE_CLIENTS); });

  it("stores clients and rejects duplicates", async () => {
    expect((await s.listClients()).map((c) => c.id).sort()).toEqual(["karan-personal-brand", "pahadi-origin", "propedia"]);
    await expect(s.addClient({ ...SAMPLE_CLIENTS[0], createdAt: new Date().toISOString(), agentPermissions: [] })).rejects.toThrow(/already exists/);
  });
  it("versions facts and keeps history", async () => {
    const base = { clientId: "propedia", kb: "business" as const, key: "jkrera_status", status: "VERIFIED" as const, source: "t" };
    const a = await s.putFact({ ...base, value: "Applied" });
    const b = await s.putFact({ ...base, value: "Registered" });
    expect([a.version, b.version]).toEqual([2, 3]); // seed already holds v1
    const all = (await s.listFacts("propedia", { includeSuperseded: true })).filter((f) => f.key === "jkrera_status");
    expect(all).toHaveLength(3);
    expect((await s.listFacts("propedia")).filter((f) => f.key === "jkrera_status").map((f) => f.value)).toEqual(["Registered"]);
  });
  it("never returns another client's facts", async () => {
    for (const c of ["propedia", "pahadi-origin"]) expect((await s.listFacts(c)).every((f) => f.clientId === c)).toBe(true);
  });
  it("persists tasks/outputs/approvals/usage and patches tasks", async () => {
    const r = await new Orchestrator(s, { retryDelayMs: 1 }).runWorkflow("propedia", "audit_360");
    expect(r.tasks.every((t) => t.status === "COMPLETED" || t.status === "WAITING FOR INPUT")).toBe(true);
    expect((await s.listTasks({ runId: r.runId })).length).toBe(9);
    expect(await s.readOutput("propedia", r.finalReport!.split("/").pop()!)).toContain("360° Audit");
    expect(await s.readOutput("pahadi-origin", r.finalReport!.split("/").pop()!)).toBeNull(); // not visible from another client
    const a = await requestApproval(s, { clientId: "propedia", kind: "publish_post", summary: "P", requestedBy: "content" });
    await decideApproval(s, a.id, "APPROVED", "human:karan");
    expect((await s.listApprovals("propedia"))[0].status).toBe("APPROVED");
    await s.recordUsage({ clientId: "propedia", taskId: null, agent: "research", provider: "mock", model: "m", inputTokens: 10, outputTokens: 5, cacheReadTokens: 0, costUsd: 0.0123, at: new Date().toISOString() });
    expect((await s.listUsage({ clientId: "propedia" }))[0].costUsd).toBeCloseTo(0.0123);
    expect((await s.readLog(500)).length).toBeGreaterThan(5);
  });
  it("rejects invalid output names", async () => {
    await expect(s.saveOutput("propedia", "../x.md", "x")).rejects.toThrow();
  });
  it("exports and restores everything into an empty store (backup round-trip)", async () => {
    await new Orchestrator(s, { retryDelayMs: 1 }).runWorkflow("pahadi-origin", "onboarding");
    const dump = await exportAll(s);
    const fresh = await make();
    const added = await importAll(fresh, JSON.parse(JSON.stringify(dump)));
    expect(added.clients).toBe(3);
    const again = await exportAll(fresh);
    expect(again.facts.map((f) => f.id).sort()).toEqual(dump.facts.map((f) => f.id).sort());
    expect(again.tasks.length).toBe(dump.tasks.length);
    expect(again.outputs.length).toBe(dump.outputs.length);
    const second = await importAll(fresh, dump); // idempotent
    expect(second).toMatchObject({ clients: 0, facts: 0, tasks: 0, approvals: 0, outputs: 0 });
  });
});

describe("postgres: agency isolation and database rules", () => {
  it("two agencies using the same client id never see each other's data", async () => {
    const a = new PgStore(db, agencyA); const b = new PgStore(db, agencyB);
    await seedWorkspaces(a, true, SAMPLE_CLIENTS);
    expect(await b.listClients()).toEqual([]);
    await seedWorkspaces(b, true, SAMPLE_CLIENTS); // same ids allowed in another agency
    await a.putFact({ clientId: "propedia", kb: "business", key: "only_a", value: "secret-A", status: "VERIFIED", source: "t" });
    expect((await b.listFacts("propedia")).some((f) => f.value === "secret-A")).toBe(false);
    const t = (await new Orchestrator(a, { retryDelayMs: 1 }).planSingle("propedia", "research", "x")).tasks[0];
    await expect(b.patchTask(t.id, { status: "FAILED" })).rejects.toThrow(/not found/); // cannot touch other agency's task
    expect((await a.listTasks()).find((x) => x.id === t.id)!.status).toBe("PENDING");
  });
  it("composite foreign keys forbid rows pointing at another agency's client", async () => {
    await expect(db.query("insert into hq.facts (id, agency_id, client_id, kb, key, value, status, source, version) values ('x1',$1,'does-not-exist','business','k','v','VERIFIED','s',1)", [agencyA])).rejects.toThrow();
  });
  it("facts are append-only and only one version can be active", async () => {
    const a = new PgStore(db, agencyA);
    const f = (await a.listFacts("propedia"))[0];
    await expect(db.query("update hq.facts set value='tampered' where id=$1", [f.id])).rejects.toThrow(/append-only/);
    await expect(db.query("insert into hq.facts (id, agency_id, client_id, kb, key, value, status, source, version) select 'dup1', agency_id, client_id, kb, key, 'v2', status, source, 9 from hq.facts where id=$1", [f.id])).rejects.toThrow();
  });
  it("activity log and usage ledger cannot be edited or deleted", async () => {
    const a = new PgStore(db, agencyA); await a.log({ clientId: null, actor: "t", action: "x", detail: "y" });
    await expect(db.query("delete from hq.activity_log")).rejects.toThrow(/append-only/);
    await a.recordUsage({ clientId: null, taskId: null, agent: "x", provider: "p", model: "m", inputTokens: 1, outputTokens: 1, cacheReadTokens: 0, costUsd: 0.01, at: new Date().toISOString() });
    await expect(db.query("update hq.usage set cost_usd = 0")).rejects.toThrow(/append-only/);
  });
  it("an agency cannot be changed on an existing task", async () => {
    const a = new PgStore(db, agencyA); const [t] = await a.listTasks();
    await expect(db.query("update hq.tasks set agency_id=$1 where id=$2", [agencyB, t.id])).rejects.toThrow();
  });
  it("survives a new connection/store instance (persistence)", async () => {
    const again = new PgStore(db, agencyA);
    expect((await again.listClients()).length).toBe(3);
    expect((await again.listTasks()).length).toBeGreaterThan(0);
  });
});

describe("postgres: row level security", () => {
  const as = async (userId: string | null, role: "authenticated" | "anon", sql: string, params: unknown[] = []) => {
    await pg.exec(`reset role; ${userId ? `select set_config('request.jwt.claim.sub','${userId}',false);` : "select set_config('request.jwt.claim.sub','',false);"} set role ${role};`);
    try { return await pg.query(sql, params as never[]); } finally { await pg.exec("reset role"); }
  };
  it("staff see only their own agency; other-agency staff and client logins see nothing", async () => {
    const ownerA = await makeStaff(pg, agencyA, "owner"); const memberB = await makeStaff(pg, agencyB, "member"); const clientA = await makeStaff(pg, agencyA, "client");
    expect((await as(ownerA, "authenticated", "select count(*)::int n from hq.facts")).rows[0]).toMatchObject({ n: expect.any(Number) });
    const a = (await as(ownerA, "authenticated", "select distinct agency_id from hq.facts")).rows as { agency_id: string }[];
    expect(a.map((r) => r.agency_id)).toEqual([agencyA]);
    const b = (await as(memberB, "authenticated", "select distinct agency_id from hq.facts")).rows as { agency_id: string }[];
    expect(b.map((r) => r.agency_id)).toEqual([agencyB]);
    expect((await as(clientA, "authenticated", "select count(*)::int n from hq.facts")).rows[0]).toEqual({ n: 0 });
    expect((await as(clientA, "authenticated", "select count(*)::int n from hq.clients")).rows[0]).toEqual({ n: 0 });
  });
  it("anonymous users have no access at all", async () => {
    await expect(as(null, "anon", "select * from hq.facts")).rejects.toThrow(/permission denied/);
  });
  it("staff cannot write into another agency, and members cannot delete clients", async () => {
    const memberA = await makeStaff(pg, agencyA, "member");
    await expect(as(memberA, "authenticated", "insert into hq.clients (agency_id,id,name,kind) values ($1,'sneaky','S','client')", [agencyB])).rejects.toThrow(/row-level security/);
    const del = await as(memberA, "authenticated", "delete from hq.clients where id='propedia' returning id");
    expect(del.rows).toHaveLength(0); // RLS hides the row from the delete: nothing deleted
    expect((await new PgStore(db, agencyA).listClients()).length).toBe(3);
  });
});
