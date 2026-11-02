import { describeAi, summarizeUsage } from "@/hq";
import { Badge, Card, Msg, Page, Unavailable, btn, inp, money } from "../kit";
import { getCtx } from "../ctx";
import { importCsvAction, submitCommand } from "../actions";

export default async function Analytics({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams; const { store, client } = await getCtx();
  if (!client) return <Page title="Analytics & Reports"><Unavailable>No client selected.</Unavailable></Page>;
  const [facts, usageAll] = await Promise.all([store.listFacts(client.id), store.listUsage()]);
  const perf = facts.filter((f) => f.kb === "performance" && f.key.includes("@") && Number.isFinite(Number(f.value)));
  const byMetric = new Map<string, { sum: number; n: number; last: string }>();
  for (const f of perf) { const [m, d] = f.key.split("@"); const e = byMetric.get(m) ?? { sum: 0, n: 0, last: "" }; e.sum += Number(f.value); e.n++; e.last = d > e.last ? d : e.last; byMetric.set(m, e); }
  const spend = summarizeUsage(usageAll.filter((u) => u.clientId === client.id)); const ai = describeAi();
  const agents = Object.entries(spend.byAgent);
  return (
    <Page title={`Analytics & Reports — ${client.name}`} sub="Real numbers only. Marketing performance appears here after you import data or connect an account; AI usage below is measured from the usage ledger.">
      <Msg error={sp.error} ok={sp.ok} />
      <Card title="Marketing performance">{byMetric.size === 0 ? <div className="text-center" data-testid="no-data"><Badge tone="amber">NO DATA</Badge><p className="mt-2 text-sm">No performance numbers are stored for {client.name}. Nothing is estimated or invented.</p><p className="text-xs text-slate-500">Import a CSV below, or connect Instagram / Meta Ads in Integrations (needs credentials).</p></div> :
        <table className="w-full text-left text-sm" data-testid="metrics"><thead className="text-xs text-slate-500"><tr><th>Metric</th><th>Total</th><th>Data points</th><th>Latest</th></tr></thead><tbody>{[...byMetric].map(([m, e]) => <tr key={m} className="border-t"><td className="py-1.5">{m.replace(/_/g, " ")}</td><td>{e.sum.toLocaleString("en-IN")}</td><td>{e.n}</td><td>{e.last}</td></tr>)}</tbody></table>}</Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Import performance data (CSV)"><form action={importCsvAction} className="space-y-2"><input type="hidden" name="client" value={client.id} /><textarea name="csv" rows={6} className={inp + " font-mono"} placeholder={"date,channel,metric,value\n2026-10-12,instagram,reach,1840\n2026-10-12,instagram,saves,63"} required /><button className={btn}>Import into Performance knowledge base</button></form><p className="mt-2 text-xs text-slate-500">Each row becomes a sourced fact labelled CLIENT-PROVIDED. The Analytics agent reads only these.</p></Card>
        <Card title="Reports"><form action={submitCommand}><input type="hidden" name="client" value={client.id} /><input type="hidden" name="instruction" value={`Prepare a monthly performance report for ${client.name}`} /><button className={btn}>Prepare performance report</button></form><p className="mt-2 text-xs text-slate-500">Runs the performance and social audits and packages them for approval. Scheduled monthly reports: Automation Centre. Report PDFs/sending are not built.</p></Card>
      </div>
      <Card title="AI usage and cost (this client)"><div className="grid gap-3 text-sm sm:grid-cols-3" data-testid="usage"><div><div className="text-xs text-slate-500">Real spend, month</div><b>{money(spend.real.month.costUsd)}</b> <span className="text-slate-500">≈ ₹{(spend.real.month.costUsd * spend.inr).toFixed(0)}</span></div><div><div className="text-xs text-slate-500">Simulated (mock), month</div><b>{money(spend.simulated.month.costUsd)}</b> · {spend.simulated.month.calls} calls</div><div><div className="text-xs text-slate-500">Limits (all clients)</div>run {money(ai.caps.runUsd)} · day {money(ai.caps.dailyUsd)} · month {money(ai.caps.monthlyUsd)}</div></div>
        {agents.length > 0 ? <p className="mt-2 text-xs">Real spend by agent: {agents.map(([a, b]) => `${a} ${money(b.costUsd)}`).join(" · ")}</p> : <p className="mt-2 text-xs text-slate-500">No real (paid) AI calls have been made.</p>}</Card>
    </Page>
  );
}
