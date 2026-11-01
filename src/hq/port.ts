import type { Approval, Client, Fact, LogEntry, Task } from "./types";

export type UsageRecord = {
  clientId: string | null; taskId: string | null; agent: string; provider: string; model: string;
  inputTokens: number; outputTokens: number; cacheReadTokens: number; costUsd: number; at: string;
};

/** Everything the HQ engine needs from storage. Implemented by the file store (local dev) and PgStore (Supabase/Postgres). */
export interface StorePort {
  newId(prefix: string): string;
  listClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | null>;
  addClient(c: Client): Promise<void>;
  listFacts(clientId: string, opts?: { includeSuperseded?: boolean }): Promise<Fact[]>;
  putFact(input: Omit<Fact, "id" | "version" | "supersededBy" | "createdAt">): Promise<Fact>;
  listTasks(filter?: { clientId?: string; runId?: string }): Promise<Task[]>;
  insertTasks(tasks: Task[]): Promise<void>;
  patchTask(id: string, patch: Partial<Task>): Promise<Task>;
  listApprovals(clientId?: string): Promise<Approval[]>;
  insertApproval(a: Approval): Promise<void>;
  patchApproval(id: string, patch: Partial<Approval>): Promise<Approval>;
  saveOutput(clientId: string, name: string, body: string): Promise<string>;
  readOutput(clientId: string, name: string): Promise<string | null>;
  listOutputs(clientId: string): Promise<string[]>;
  log(e: Omit<LogEntry, "at">): Promise<void>;
  readLog(limit?: number): Promise<LogEntry[]>;
  recordUsage(u: UsageRecord): Promise<void>;
  listUsage(filter?: { clientId?: string; since?: string }): Promise<UsageRecord[]>;
}

export const OUTPUT_NAME_RE = /^[\w.-]+$/;
