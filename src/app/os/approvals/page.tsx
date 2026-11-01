import Link from "next/link";
import { isIntegrationOperational, type PackageBody } from "@/hq";
import { Badge, Card, Msg, Page, Unavailable, btn, btn2, statusTone, when } from "../kit";
import { getCtx } from "../ctx";
import { bodyOf } from "../data";
import { DecisionForm } from "../decision";
import { approvePlanAction, decideApprovalAction } from "../actions";

export default async function Approvals({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams; const { store, client } = await getCtx();
  if (!client) return <Page title="Approval Centre"><Unavailable>No client selected.</Unavailable></Page>;
  const [approvals, ds, runs, log] = await Promise.all([store.listApprovals(client.id), store.listDeliverables({ clientId: client.id }), store.listRuns({ clientId: client.id }), store.readLog(400)]);
  const plans = runs.filter((r) => r.status === "AWAITING_PLAN_APPROVAL");
  const pendingAll = approvals.filter((a) => a.status === "PENDING");
  const reviewKinds = ["campaign_package", "strategy", "ad_plan", "execution_prep"];
  const inReview = ds.filter((d) => d.status === "in_review" && reviewKinds.includes(d.kind));
  const decisions = log.filter((l) => l.clientId === client.id && /^(approval\.|deliverable\.|run\.plan_approved|execution\.)/.test(l.action)).slice(-12).reverse();
  const shownRefs = new Set(inReview.map((d) => `deliverable:${d.id}`));
  const pending = pendingAll.filter((a) => !a.ref || !shownRefs.has(a.ref)); // requests already shown as a package above are one decision, not two
  const igOk = await isIntegrationOperational(store, "instagram_graph");
  const packages = await Promise.all(inReview.filter((d) => d.kind === "campaign_package").map(async (d) => ({ d, body: (await bodyOf<PackageBody>(store, client.id, d)).body })));
  return (
    <Page title={`Approval Centre — ${client.name}`} sub="The only door to the outside world. Agents can ask; only you can decide. Approving records your decision. It never publishes, sends or spends by itself.">
      <Msg error={sp.error} ok={sp.ok} />
      <Card title={`Plans waiting for approval (${plans.length})`}>{plans.length === 0 ? <p className="text-sm text-slate-500">None. Routine internal work starts automatically.</p> : plans.map((r) => <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-t py-2 text-sm first:border-0"><span><Badge tone="amber">{r.objective}</Badge> {r.instruction.slice(0, 90)} <span className="text-slate-500">· est. ${r.estCostUsd.toFixed(2)}</span></span><span className="flex gap-2"><Link className={btn2} href={`/os/runs/${r.id}`}>Review plan</Link><form action={approvePlanAction}><input type="hidden" name="run" value={r.id} /><input type="hidden" name="client" value={client.id} /><button className={btn}>Approve & run</button></form></span></div>)}</Card>
      <Card title={`Deliverable packages to review (${packages.length})`}>{packages.length === 0 ? <p className="text-sm text-slate-500">No package is waiting.</p> : packages.map(({ d, body }) => <div key={d.id} className="mb-3 rounded border p-3" data-testid="package">
        <div className="flex flex-wrap items-center justify-between gap-2"><b>{body.title}</b><Badge tone={statusTone(d.status)}>{d.status.replace("_", " ")}</Badge></div>
        <p className="text-sm text-slate-600">{body.summary}</p>
        <table className="my-2 w-full text-left text-xs"><tbody>{body.deliverables.slice(0, 40).map((x) => <tr key={x.id} className="border-t"><td className="py-1">{x.title.slice(0, 60)}</td><td>{x.kind}</td><td>{x.status}</td><td>{x.qa}</td></tr>)}</tbody></table>
        {body.missingInfo.length > 0 && <p className="text-xs text-amber-800">Missing: {body.missingInfo.slice(0, 5).join("; ")}</p>}
        <p className="text-xs text-slate-500">{body.usage.mock ? "Simulated" : "Real"} AI usage: {body.usage.calls} call(s), ${body.usage.costUsd.toFixed(4)} · {body.notExecuted}</p>
        <div className="mt-2"><DecisionForm d={d} back="/os/approvals" compact /></div></div>)}</Card>
      <Card title={`Open requests (${pending.length})`}>{pending.length === 0 ? <p className="text-sm text-slate-500">No pending requests.</p> : <table className="w-full text-left text-sm"><tbody>{pending.map((a) => <tr key={a.id} className="border-t align-top"><td className="py-2"><Badge tone="amber">{a.kind}</Badge></td><td className="pr-2">{a.summary}<div className="text-xs text-slate-500">requested by {a.requestedBy} · {when(a.createdAt)}</div></td><td><form action={decideApprovalAction} className="flex gap-1"><input type="hidden" name="id" value={a.id} /><button name="decision" value="APPROVED" className={btn}>Approve</button><button name="decision" value="REJECTED" className={btn2}>Reject</button></form></td></tr>)}</tbody></table>}
        <p className="mt-2 text-xs text-slate-500">Execution status: {igOk ? "Instagram integration is tested; publishing still needs a second explicit confirmation." : "no publishing integration is connected and tested, so approved items can be prepared but cannot be sent."}</p></Card>
      <Card title="Decision history"><ul className="text-xs" data-testid="decision-history">{decisions.map((l, i) => <li key={i}>{when(l.at)} · {l.actor.replace("human:", "")} · {l.action} · {l.detail.slice(0, 80)}</li>)}{decisions.length === 0 && <li className="text-slate-500">No decisions yet.</li>}</ul></Card>
    </Page>
  );
}
