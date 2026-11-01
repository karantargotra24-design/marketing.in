import Link from "next/link";
import { AGENT_LIST, AGENTS, knowledgeBases } from "@/hq";
import { Badge, Card, Page, money, when } from "../kit";
import { getCtx } from "../ctx";

/** Capability is derived from what the execution history actually shows, never from what the definition claims. */
export default async function Agents({ searchParams }: { searchParams: Promise<{ agent?: string }> }) {
  const sp = await searchParams; const { store, client } = await getCtx();
  const execs = await store.listExecutions({ limit: 2000 });
  const sel = AGENTS[(sp.agent as keyof typeof AGENTS) ?? "research"] ?? AGENTS.research;
  const stat = (id: string) => {
    const e = execs.filter((x) => x.agent === id); const ai = e.filter((x) => x.mode === "ai");
    const level = ai.some((x) => !x.model?.startsWith("mock")) ? "Real AI (executed)" : ai.length ? "Mock AI (executed)" : e.length ? "Rules only (executed)" : "Never executed";
    return { n: e.length, fail: e.filter((x) => x.outcome === "failed").length, cost: e.reduce((a, x) => a + x.costUsd, 0), last: e.at(-1)?.startedAt ?? null, level };
  };
  const running = client ? (await store.listTasks({ clientId: client.id })).filter((t) => t.status === "IN PROGRESS") : [];
  const lvTone = (l: string) => (l.startsWith("Real") ? "green" : l.startsWith("Mock") ? "purple" : l.startsWith("Rules") ? "gray" : "amber") as "green" | "purple" | "gray" | "amber";
  const st = stat(sel.id);
  return (
    <Page title="AI Agent Command Centre" sub="The 12 specialists. Capability is measured from real execution history, not from the definition.">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2" data-testid="agent-grid">
          {AGENT_LIST.map((a) => { const s = stat(a.id); const busy = running.filter((t) => t.agent === a.id); return (
            <Link key={a.id} href={`/os/agents?agent=${a.id}`} className={`rounded-lg border bg-white p-3 hover:border-indigo-400 ${sel.id === a.id ? "border-indigo-600 ring-2 ring-indigo-100" : ""}`}>
              <div className="flex items-start justify-between gap-2"><b>{a.name}</b><Badge tone={busy.length ? "blue" : "gray"}>{busy.length ? `working (${busy.length})` : "idle"}</Badge></div>
              <div className="my-1.5"><Badge tone={lvTone(s.level)}>{s.level}</Badge></div>
              <div className="text-xs text-slate-500">{s.n} execution(s) · {s.fail} failed · {money(s.cost)}</div></Link>); })}
        </div>
        <Card title={sel.name}><p className="text-sm">{sel.identity}</p>
          <p className="mt-2 text-sm"><Badge tone={lvTone(st.level)}>{st.level}</Badge> <span className="text-xs text-slate-500">last run {when(st.last)}</span></p>
          <h3 className="mt-3 text-sm font-semibold">Responsibilities</h3><ul className="list-disc pl-5 text-sm">{sel.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
          <h3 className="mt-3 text-sm font-semibold">May read (knowledge bases)</h3><p className="text-sm">{knowledgeBases.map((k) => <span key={k} className={`mr-1 rounded px-1.5 py-0.5 text-xs ${sel.knowledgePermissions.includes(k) ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-400 line-through"}`}>{k}</span>)}</p>
          <h3 className="mt-3 text-sm font-semibold">Needs from the client</h3><p className="text-sm">{sel.needs.map((n) => `${n.kb}.${n.key}`).join(", ") || "—"}</p>
          <h3 className="mt-3 text-sm font-semibold">Tools</h3><p className="text-sm text-slate-600">{sel.tools.join(" · ")}</p>
          <h3 className="mt-3 text-sm font-semibold">Outputs</h3><p className="text-sm">{sel.expectedOutputs.join(" · ")}</p>
          <h3 className="mt-3 text-sm font-semibold">Recent executions</h3>
          <ul className="text-xs">{execs.filter((x) => x.agent === sel.id).slice(-6).reverse().map((x) => <li key={x.id}>{when(x.startedAt)} · {x.outcome} · {x.mode ?? "—"} · {money(x.costUsd)}{x.error ? ` · ${x.error.slice(0, 50)}` : ""}</li>)}</ul>
        </Card>
      </div>
    </Page>
  );
}
