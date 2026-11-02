import Link from "next/link";
import { planWaves } from "@/hq";
import { AutoRefresh } from "../../ui";
import { Badge, Card, Msg, Page, Unavailable, btn, btn2, money, statusTone, when } from "../../kit";
import { getCtx } from "../../ctx";
import { approvePlanAction, cancelRunAction, prepareExecutionAction } from "../../actions";

const ROUTE: Record<string, string> = { research: "/os/research", audit: "/os/research", strategy: "/os/strategy", content_calendar: "/os/calendar", content_item: "/os/calendar", creative_brief: "/os/creative", ad_plan: "/os/campaigns", qa_report: "/os/approvals", campaign_package: "/os/approvals", execution_prep: "/os/approvals" };

export default async function RunPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params; const sp = await searchParams; const { store, client } = await getCtx();
  if (!client) return <Page title="Run"><Unavailable>No client selected.</Unavailable></Page>;
  const run = await store.getRun(client.id, id);
  if (!run) return <Page title="Run not found"><Unavailable>This run does not exist in <b>{client.name}</b>&apos;s workspace. If it belongs to another client, switch client first.</Unavailable></Page>;
  const [tasks, ds, usage, execs] = await Promise.all([store.listTasks({ runId: id }), store.listDeliverables({ clientId: client.id, runId: id }), store.listUsage({ clientId: client.id }), store.listExecutions({ runId: id })]);
  const taskIds = new Set(tasks.map((t) => t.id)); const spent = usage.filter((u) => u.taskId && taskIds.has(u.taskId)); const mock = spent.some((u) => u.provider === "mock");
  const active = ["QUEUED", "RUNNING"].includes(run.status);
  const waves = planWaves(run.plan.tasks); const byKey = new Map(run.plan.tasks.map((t) => [t.key, t]));
  const done = tasks.filter((t) => ["COMPLETED", "WAITING FOR INPUT", "FAILED", "WAITING FOR APPROVAL"].includes(t.status)).length;
  const hasApproved = ds.some((d) => d.kind === "content_item" && d.status === "approved");
  return (
    <Page title={run.instruction} sub={`${client.name} · ${run.objective.replace("_", " ")} · created by ${run.createdBy.replace("human:", "")}`}>
      <Msg error={sp.error} ok={sp.ok} />
      <div className="flex flex-wrap items-center gap-2"><span data-testid="run-status"><Badge tone={statusTone(run.status)}>{run.status.replace(/_/g, " ")}</Badge></span><AutoRefresh active={active} />{tasks.length > 0 && <span className="text-sm text-slate-600">{done}/{tasks.length} tasks finished · {mock ? "simulated cost" : "cost"} {money(spent.reduce((a, u) => a + u.costUsd, 0))}</span>}</div>
      {run.status === "AWAITING_PLAN_APPROVAL" && <div className="rounded-lg border border-amber-300 bg-amber-50 p-4" data-testid="plan-approval"><b>Plan preview: nothing has started.</b><p className="text-sm">Why you are asked: {run.plan.reason}. Estimated cost at live model prices: <b>{money(run.plan.estCostUsd)}</b> (≈ ₹{(run.plan.estCostUsd * 88).toFixed(0)}).</p>
        <div className="mt-2 flex gap-2"><form action={approvePlanAction}><input type="hidden" name="run" value={run.id} /><input type="hidden" name="client" value={client.id} /><button className={btn}>Approve plan & run</button></form><form action={cancelRunAction}><input type="hidden" name="run" value={run.id} /><input type="hidden" name="client" value={client.id} /><button className={btn2}>Cancel</button></form></div></div>}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Execution plan" right={<span className="text-xs text-slate-500">{run.plan.tasks.length} tasks · {waves.length} waves · widest wave {Math.max(...waves.map((w) => w.length))} in parallel</span>}>
            <ol className="space-y-2 text-sm" data-testid="plan-waves">{waves.map((w, i) => <li key={i}><span className="mr-2 text-xs font-semibold text-slate-500">Wave {i + 1}{w.length > 1 ? ` (${w.length} in parallel)` : ""}</span>{w.map((k) => { const pt = byKey.get(k)!; const t = tasks.find((x) => x.kind === pt.kind && x.description === pt.title); return <span key={k} className="mr-1 inline-block"><Badge tone={t ? statusTone(t.status) : "gray"}>{pt.title.slice(0, 38)} · {pt.agent}</Badge></span>; })}</li>)}</ol>
          </Card>
          <Card title="Task results"><table className="w-full text-left text-xs"><thead className="text-slate-500"><tr><th className="pr-3">Task</th><th className="pr-3">Agent</th><th className="pr-3">Status</th><th className="pr-3">Tries</th><th className="pr-3">Cost</th><th>Note</th></tr></thead><tbody>{tasks.map((t) => { const e = execs.filter((x) => x.taskId === t.id); return <tr key={t.id} className="border-t align-top"><td className="py-1 pr-2">{t.description.slice(0, 60)}</td><td className="pr-3">{t.agent}</td><td className="pr-3"><Badge tone={statusTone(t.status)}>{t.status}</Badge></td><td className="pr-3">{e.length || t.attempts}</td><td className="pr-3">{money(e.reduce((a, x) => a + x.costUsd, 0))}</td><td className="max-w-[16rem] text-red-700">{t.error?.slice(0, 120)}</td></tr>; })}{tasks.length === 0 && <tr><td colSpan={6} className="py-2 text-slate-500">Tasks are created when the plan is approved.</td></tr>}</tbody></table></Card>
        </div>
        <div className="space-y-4">
          <Card title="Before it runs"><h3 className="text-sm font-semibold">Missing information</h3><ul className="text-sm" data-testid="plan-missing">{run.plan.missingInfo.slice(0, 12).map((m) => <li key={m}>☐ {m}</li>)}{run.plan.missingInfo.length === 0 && <li className="text-slate-500">None</li>}</ul>
            <h3 className="mt-2 text-sm font-semibold">Assumptions made</h3><ul className="text-sm">{run.plan.assumptions.map((m) => <li key={m}>• {m}</li>)}{run.plan.assumptions.length === 0 && <li className="text-slate-500">None</li>}</ul>
            <p className="mt-2 text-xs text-slate-500">Output language: {run.plan.language} · platform: {run.plan.platform} · {run.plan.days} day(s)</p></Card>
          <Card title={`Deliverables (${ds.length})`}><ul className="space-y-1 text-sm" data-testid="deliverables">{ds.map((d) => <li key={d.id} className="flex items-center justify-between gap-2"><Link href={`${ROUTE[d.kind] ?? "/os"}${d.kind === "content_item" ? `?item=${d.id}` : d.kind === "creative_brief" ? `?brief=${d.id}` : ""}`} className="truncate underline">{d.title.slice(0, 44)}</Link><Badge tone={statusTone(d.status)}>{d.status.replace("_", " ")} · v{d.currentVersion}</Badge></li>)}{ds.length === 0 && <li className="text-slate-500">Nothing produced yet.</li>}</ul>
            {run.status === "COMPLETED" && <form action={prepareExecutionAction} className="mt-3"><input type="hidden" name="run" value={run.id} /><input type="hidden" name="client" value={client.id} /><button className={btn2} disabled={!hasApproved}>Prepare execution package</button><p className="mt-1 text-xs text-slate-500">{hasApproved ? "Packages the APPROVED items. Publishes nothing." : "Approve content items first."}</p></form>}</Card>
        </div>
      </div>
      <p className="text-xs text-slate-500">Started {when(run.startedAt)} · finished {when(run.completedAt)}</p>
    </Page>
  );
}
