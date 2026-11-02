import { type StrategyBody } from "@/hq";
import { Badge, Card, Msg, Page, Unavailable, statusTone } from "../kit";
import { getCtx } from "../ctx";
import { bodyOf, factIndex } from "../data";
import { DecisionForm, QaList } from "../decision";

export default async function Strategy({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams; const { store, client } = await getCtx();
  if (!client) return <Page title="Marketing Strategy"><Unavailable>No client selected.</Unavailable></Page>;
  const [list, facts] = await Promise.all([store.listDeliverables({ clientId: client.id, kind: "strategy" }), store.listFacts(client.id, { includeSuperseded: true })]);
  const d = list.at(-1);
  if (!d) return <Page title={`Marketing Strategy — ${client.name}`}><Unavailable>No strategy yet. A strategy is produced as part of a campaign, content plan or advertising run. Try: “Prepare a complete seven-day Instagram growth campaign”. It needs AI mode mock or live.</Unavailable></Page>;
  const { body, versions } = await bodyOf<StrategyBody>(store, client.id, d); const idx = factIndex(facts);
  const cite = (ids: string[]) => ids.map((i) => idx.get(i)).filter(Boolean).map((f) => <span key={f!.id} className="ml-1 rounded border bg-slate-50 px-1 text-[10px] text-slate-600" title={f!.source}>{f!.key} · {f!.status}</span>);
  return (
    <Page title={`Marketing Strategy — ${client.name}`} sub="Proposed by the Business Audit & Strategy agent. Nothing here is a commitment until you approve it.">
      <Msg error={sp.error} ok={sp.ok} />
      <div className="flex flex-wrap items-center gap-3"><Badge tone={statusTone(d.status)}>{d.status.replace("_", " ")} · v{d.currentVersion}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Objectives"><ul className="space-y-1 text-sm">{body.objectives.map((o, i) => <li key={i}>• {o.text}{o.metric ? ` (${o.metric})` : ""}{cite(o.factIds)}</li>)}</ul></Card>
        <Card title="Campaign theme"><p className="text-sm">{body.campaignTheme}</p></Card>
        <Card title="Target personas"><ul className="space-y-2 text-sm">{body.personas.map((p) => <li key={p.name}><b>{p.name}</b>: {p.description}{cite(p.factIds)}</li>)}</ul></Card>
        <Card title="Content pillars"><ul className="space-y-1 text-sm">{body.pillars.map((p) => <li key={p.name}><b>{p.name}</b>: {p.description} <i className="text-slate-500">e.g. {p.example}</i></li>)}</ul></Card>
        <Card title="Growth recommendations"><ul className="space-y-1 text-sm">{body.growth.map((g, i) => <li key={i}>• {g.text}{cite(g.factIds)}</li>)}</ul></Card>
        <Card title="Assumptions & missing information"><ul className="text-sm">{body.assumptions.map((a) => <li key={a}>• Assumption: {a}</li>)}{body.missingInfo.slice(0, 8).map((m) => <li key={m} className="text-amber-800">☐ {m}</li>)}</ul></Card>
      </div>
      <Card title="Decision"><DecisionForm d={d} back="/os/strategy" /><QaList d={d} /><p className="mt-2 text-xs text-slate-500">Versions: {versions.map((v) => `v${v.version} (${v.createdBy})`).join(" → ")}</p></Card>
    </Page>
  );
}
