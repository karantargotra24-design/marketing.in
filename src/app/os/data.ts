import { AGENT_LIST, knowledgeBases, makeContext, type Deliverable, type Fact, type StorePort } from "@/hq";

export async function bodyOf<T = unknown>(store: StorePort, clientId: string, d: Deliverable) {
  const g = await store.getDeliverable(clientId, d.id);
  return { body: g!.versions.at(-1)!.body as T, versions: g!.versions };
}
/** Information the agents need but the workspace does not hold (union over all 12 agents). */
export function computeGaps(facts: Fact[]) {
  const ctx = makeContext("x", facts); const map = new Map<string, { kb: string; key: string; why: string; agents: string[] }>();
  for (const a of AGENT_LIST) for (const n of a.needs) if (!ctx.has(n.kb, n.key)) { const k = `${n.kb}.${n.key}`; const e = map.get(k) ?? { kb: n.kb, key: n.key, why: n.why, agents: [] }; e.agents.push(a.name); map.set(k, e); }
  return [...map.values()];
}
export function conflictsOf(facts: Fact[]) {
  const g = new Map<string, Fact[]>();
  for (const f of facts) if (f.key.includes("@") && f.kb !== "performance") { const k = `${f.kb}.${f.key.split("@")[0]}`; g.set(k, [...(g.get(k) ?? []), f]); }
  return [...g].filter(([, v]) => new Set(v.map((f) => f.value)).size > 1);
}
export const kbFilled = (facts: Fact[]) => knowledgeBases.filter((k) => facts.some((f) => f.kb === k)).length;
export const factIndex = (facts: Fact[]) => new Map(facts.map((f) => [f.id, f]));
export const latestRun = async (store: StorePort, clientId: string) => (await store.listRuns({ clientId })).at(-1) ?? null;
