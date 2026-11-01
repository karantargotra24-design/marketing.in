import Link from "next/link";
import { describeAi, summarizeUsage } from "@/hq";
import { AutoRefresh } from "./ui";
import { Badge, Card, Msg, Page, Unavailable, money, statusTone, when } from "./kit";
import { getCtx } from "./ctx";
import { computeGaps, conflictsOf, kbFilled } from "./data";

export default async function Overview({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams; const { store, clients, client } = await getCtx();
  if (!client) return <Page title="Agency Overview"><Unavailable>No clients exist yet. Create one in <Link className="underline" href="/os/clients">Client Management</Link>.</Unavailable></Page>;
  const [tasks, runs, approvals, ds, usage, facts] = await Promise.all([store.listTasks({ clientId: client.id }), store.listRuns({ clientId: client.id }), store.listApprovals(client.id), store.listDeliverables({ clientId: client.id }), store.listUsage(), store.listFacts(client.id)]);
  const spend = summarizeUsage(usage); const ai = describeAi();
  const active = runs.filter((r) => ["QUEUED", "RUNNING"].includes(r.status));
  const needs = [
    ...runs.filter((r) => r.status === "AWAITING_PLAN_APPROVAL").map((r) => ({ t: `Approve plan: “${r.instruction.slice(0, 70)}”`, href: `/os/runs/${r.id}`, tag: "Plan" })),
    ...approvals.filter((a) => a.status === "PENDING").map((a) => ({ t: a.summary, href: "/os/approvals", tag: "Approval" })),
    ...(ds.filter((d) => d.status === "in_review" && d.kind === "content_item").length ? [{ t: `${ds.filter((d) => d.status === "in_review" && d.kind === "content_item").length} content item(s) ready for your review`, href: "/os/calendar", tag: "Review" }] : []),
    ...(tasks.filter((t) => t.status === "WAITING FOR APPROVAL").length ? [{ t: `${tasks.filter((t) => t.status === "WAITING FOR APPROVAL").length} task(s) paused at an AI spend limit`, href: "/os/tasks", tag: "Spend" }] : []),
    ...conflictsOf(facts).map(([k]) => ({ t: `Conflicting information: ${k}`, href: "/os/knowledge", tag: "Conflict" })),
  ];
  const gaps = computeGaps(facts);
  const counts = (s: string) => tasks.filter((t) => t.status === s).length;
  return (
    <Page title="Agency Overview" sub={`Active client: ${client.name}`}>
      <Msg error={sp.error} ok={sp.ok} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="kpis">
        {[["Clients", clients.length], ["Active runs", active.length], ["Running tasks", counts("IN PROGRESS")], ["Waiting for input", counts("WAITING FOR INPUT")], ["Completed tasks", counts("COMPLETED")], ["Failed tasks", counts("FAILED")], ["Pending approvals", approvals.filter((a) => a.status === "PENDING").length], ["Deliverables", ds.length]].map(([l, n]) => <div key={l as string} className="rounded-lg border bg-white p-3"><div className="text-2xl font-bold">{n}</div><div className="text-xs text-slate-600">{l}</div></div>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><Card title="Needs your attention">
          {needs.length === 0 ? <p className="text-sm text-slate-500">Nothing is waiting for you.</p> : <ul className="divide-y">{needs.map((n, i) => <li key={i} className="flex items-center justify-between gap-2 py-2 text-sm"><span><Badge tone="amber">{n.tag}</Badge> {n.t}</span><Link href={n.href} className="underline">Open</Link></li>)}</ul>}
          {gaps.length > 0 && <p className="mt-2 text-sm text-slate-600">{gaps.length} piece(s) of information the agents still need — <Link className="underline" href="/os/knowledge">see Knowledge Centre</Link>.</p>}
        </Card></div>
        <Card title="AI & spend" right={<Badge tone={ai.mode === "LIVE" ? "green" : ai.mode === "MOCK" ? "amber" : "gray"}>{ai.mode}</Badge>}>
          <p className="text-sm">Real spend this month: <b>{money(spend.real.month.costUsd)}</b> <span className="text-slate-500">(≈ ₹{(spend.real.month.costUsd * spend.inr).toFixed(0)})</span></p>
          <p className="text-sm">Simulated (mock): {money(spend.simulated.month.costUsd)} · {spend.simulated.month.calls} calls</p>
          <p className="mt-1 text-xs text-slate-500">Limits: run {money(ai.caps.runUsd)} · day {money(ai.caps.dailyUsd)} · month {money(ai.caps.monthlyUsd)}</p>
        </Card>
      </div>
      <Card title={<>Runs <AutoRefresh active={active.length > 0} /></>}>
        {runs.length === 0 ? <p className="text-sm text-slate-500">No runs yet. Type an objective in the bar above.</p> : (
          <table className="w-full text-left text-sm"><thead className="text-xs text-slate-500"><tr><th>Instruction</th><th>Status</th><th>Progress</th><th>Created</th></tr></thead><tbody>
            {[...runs].reverse().slice(0, 8).map((r) => { const t = tasks.filter((x) => x.runId === r.id); const done = t.filter((x) => ["COMPLETED", "WAITING FOR INPUT", "FAILED", "WAITING FOR APPROVAL"].includes(x.status)).length; return (
              <tr key={r.id} className="border-t"><td className="py-1.5 pr-2"><Link className="underline" href={`/os/runs/${r.id}`}>{r.instruction.slice(0, 80)}</Link></td><td><Badge tone={statusTone(r.status)}>{r.status}</Badge></td><td className="w-40">{t.length ? <div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-indigo-600" style={{ width: `${(done / t.length) * 100}%` }} /></div> : "—"}<span className="text-xs text-slate-500">{done}/{t.length}</span></td><td className="text-xs">{when(r.createdAt)}</td></tr>); })}
          </tbody></table>)}
      </Card>
      <Card title="Client readiness"><div className="grid gap-3 sm:grid-cols-3">{await Promise.all(clients.map(async (c) => { const f = await store.listFacts(c.id); return <div key={c.id} className="rounded border p-3"><b>{c.name}</b><div className="my-1 h-2 rounded bg-slate-200"><div className="h-2 rounded bg-indigo-600" style={{ width: `${kbFilled(f) * 10}%` }} /></div><div className="text-xs text-slate-600">{kbFilled(f)}/10 knowledge bases · {f.length} facts · {computeGaps(f).length} gaps</div></div>; }))}</div></Card>
    </Page>
  );
}
