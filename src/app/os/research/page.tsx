import Link from "next/link";
import { type SectionsBody } from "@/hq";
import { Badge, Card, Page, Unavailable, btn, statusTone, when } from "../kit";
import { getCtx } from "../ctx";
import { bodyOf, factIndex } from "../data";
import { submitCommand } from "../actions";

export default async function Research({ searchParams }: { searchParams: Promise<{ run?: string }> }) {
  const sp = await searchParams; const { store, client } = await getCtx();
  if (!client) return <Page title="Research & Audit"><Unavailable>No client selected.</Unavailable></Page>;
  const [all, facts] = await Promise.all([store.listDeliverables({ clientId: client.id }), store.listFacts(client.id, { includeSuperseded: true })]);
  const ds = all.filter((d) => d.kind === "research" || d.kind === "audit");
  const runIds = [...new Set(ds.map((d) => d.runId).filter(Boolean))] as string[]; const runId = sp.run ?? runIds.at(-1);
  const shown = ds.filter((d) => d.runId === runId); const idx = factIndex(facts);
  return (
    <Page title={`Research & Audit — ${client.name}`} sub="Cited findings. Every bullet points to a stored client fact or a fetched source with its date; gaps are listed, never filled in.">
      <div className="flex flex-wrap items-center gap-2 text-sm">{runIds.map((r, i) => <Link key={r} href={`/os/research?run=${r}`} className={`rounded-full border px-3 py-1 ${runId === r ? "bg-slate-900 text-white" : "bg-white"}`}>Run {i + 1}</Link>)}
        <form action={submitCommand}><input type="hidden" name="client" value={client.id} /><input type="hidden" name="instruction" value={`Run a full audit of ${client.name}'s business, social presence, content, positioning and performance`} /><button className={btn}>Run a full audit</button></form></div>
      {shown.length === 0 ? <Unavailable>No research or audit has been produced for {client.name} yet. Press “Run a full audit” or type an objective in the command bar.</Unavailable> :
        <div className="grid gap-4 lg:grid-cols-2" data-testid="research-list">{await Promise.all(shown.map(async (d) => { const { body } = await bodyOf<SectionsBody>(store, client.id, d); return (
          <Card key={d.id} title={d.title} right={<Badge tone={statusTone(d.status)}>{d.kind} · {d.agent}</Badge>}>
            <p className="text-sm">{body.summary}</p>
            {body.sections.map((s) => <div key={s.heading} className="mt-2"><h3 className="text-sm font-semibold">{s.heading}</h3><ul className="space-y-1 text-sm">{s.bullets.map((b, i) => <li key={i}>• {b.text}{b.factIds.map((f) => idx.get(f)).filter(Boolean).map((f) => <span key={f!.id} className="ml-1 rounded border bg-slate-50 px-1 text-[10px] text-slate-600" title={f!.source}>{f!.key} · {f!.status}</span>)}{b.sourceUrls.map((u) => <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="ml-1 rounded border bg-blue-50 px-1 text-[10px] text-blue-700 underline">{new URL(u).hostname}</a>)}</li>)}</ul></div>)}
            {body.risks.length > 0 && <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-xs"><b>Risks</b><ul>{body.risks.slice(0, 6).map((r) => <li key={r}>⚠ {r}</li>)}</ul></div>}
            {body.missingInfo.length > 0 && <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-xs"><b>Missing</b><ul>{body.missingInfo.slice(0, 6).map((r) => <li key={r}>☐ {r}</li>)}</ul></div>}
            <p className="mt-2 text-[11px] text-slate-400">{when(d.updatedAt)} · version {d.currentVersion}</p></Card>); }))}</div>}
    </Page>
  );
}
