import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { StorePort } from "./port";
import type { Client, Fact, FactStatus, KnowledgeBase } from "./types";

export type Seed = { kb: KnowledgeBase; key: string; value: string; status: FactStatus; source: string };


export type SeedClient = Omit<Client, "createdAt" | "agentPermissions"> & { facts: Seed[] };

/** Real client content lives OUTSIDE git: data/seed/clients.json (or HQ_SEED_FILE). See docs/SECURITY.md. */
export function loadSeedClients(file = process.env.HQ_SEED_FILE ?? path.join(process.cwd(), "data", "seed", "clients.json")): SeedClient[] {
  if (!existsSync(file)) throw new Error(`Seed file not found: ${file}. Client data is not stored in git; restore it from your private backup.`);
  return JSON.parse(readFileSync(file, "utf8")) as SeedClient[];
}

/** Idempotent: only adds clients/facts that are missing. Never overwrites or deletes (Part 11 rule 4). */
export async function seedWorkspaces(store: StorePort, quiet = false, clients: SeedClient[] = loadSeedClients()) {
  const existing = new Set((await store.listClients()).map((c) => c.id));
  for (const c of clients) {
    if (existing.has(c.id)) continue;
    const { facts, ...client } = c;
    await store.addClient({ ...client, createdAt: new Date().toISOString(), agentPermissions: [] });
    for (const f of facts) await store.putFact({ clientId: c.id, ...f } as Omit<Fact, "id" | "version" | "supersededBy" | "createdAt">);
    if (!quiet) console.log(`seeded ${c.id}: ${facts.length} facts`);
  }
}

/** Onboards a brand-new client with empty, isolated workspace (Part 2 "future clients"). */
export async function onboardClient(store: StorePort, input: { id: string; name: string; kind?: Client["kind"]; doNotSay?: string[] }) {
  await store.addClient({ id: input.id, name: input.name, kind: input.kind ?? "client", doNotSay: input.doNotSay ?? [], agentPermissions: [], createdAt: new Date().toISOString() });
  await store.putFact({ clientId: input.id, kb: "requirements", key: "approval_policy", value: "No post, ad launch, spend or client message without Karan's explicit approval.", status: "CLIENT-PROVIDED", source: "agency-policy: docs/AGENCY_HQ.md" });
}
