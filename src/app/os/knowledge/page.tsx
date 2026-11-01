import Link from "next/link";
import { factStatuses, knowledgeBases } from "@/hq";
import { Badge, Card, Msg, Page, Unavailable, btn, inp } from "../kit";
import { getCtx } from "../ctx";
import { addFactAction } from "../actions";
import { computeGaps, conflictsOf } from "../data";

const tone = (s: string) => (s === "VERIFIED" || s === "RESEARCHED" ? "green" : s === "NEEDS VERIFICATION" ? "red" : s === "CLIENT-PROVIDED" ? "blue" : "amber") as "green" | "red" | "blue" | "amber";
export default async function Knowledge({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; kb?: string }> }) {
  const sp = await searchParams; const { store, client } = await getCtx();
  if (!client) return <Page title="Client Knowledge Centre"><Unavailable>No client selected.</Unavailable></Page>;
  const all = await store.listFacts(client.id, { includeSuperseded: true }); const facts = all.filter((f) => !f.supersededBy);
  const kb = knowledgeBases.includes(sp.kb as never) ? sp.kb : undefined; const shown = facts.filter((f) => !kb || f.kb === kb);
  const gaps = computeGaps(facts); const conflicts = conflictsOf(facts);
  return (
    <Page title={`Knowledge Centre — ${client.name}`} sub="Everything the agents may know about this client. Every fact has a source and a certainty label; updates keep history.">
      <Msg error={sp.error} ok={sp.ok} />
      {conflicts.map(([k, fs]) => <div key={k} className="rounded-md border border-red-300 bg-red-50 p-3 text-sm"><b>Conflict in {k}:</b> {fs.map((f) => `“${f.value.slice(0, 60)}” (${f.source.slice(0, 40)})`).join("  vs  ")}. Agents will not use these until you resolve it (add a new, single fact).</div>)}
      <div className="flex flex-wrap gap-1 text-sm" role="tablist">{[undefined, ...knowledgeBases].map((k) => <Link key={k ?? "all"} href={k ? `/os/knowledge?kb=${k}` : "/os/knowledge"} className={`rounded-full border px-3 py-1 ${kb === k ? "bg-slate-900 text-white" : "bg-white"}`}>{k ?? "All"} ({facts.filter((f) => !k || f.kb === k).length})</Link>)}</div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><Card><table className="w-full text-left text-sm"><thead className="text-xs text-slate-500"><tr><th>KB</th><th>Key</th><th>Value</th><th>Status</th><th>Source</th><th>v</th></tr></thead><tbody data-testid="facts">
          {shown.map((f) => <tr key={f.id} className="border-t align-top"><td className="py-1.5 pr-2">{f.kb}</td><td className="pr-2 font-medium">{f.key}</td><td className="pr-2">{f.value.slice(0, 220)}</td><td><Badge tone={tone(f.status)}>{f.status}</Badge></td><td className="max-w-[10rem] truncate text-xs text-slate-500" title={f.source}>{f.source}</td><td className="text-xs">{f.version}</td></tr>)}
          {shown.length === 0 && <tr><td colSpan={6} className="py-3 text-sm text-slate-500">Empty: information needed.</td></tr>}</tbody></table></Card></div>
        <div className="space-y-4">
          <Card title="Information still needed"><ul className="space-y-1 text-sm" data-testid="gaps">{gaps.slice(0, 14).map((g) => <li key={`${g.kb}.${g.key}`}>☐ <b>{g.kb}.{g.key}</b> <span className="text-slate-500">({g.why})</span></li>)}{gaps.length === 0 && <li className="text-slate-500">No gaps for the 12 agents.</li>}</ul></Card>
          <Card title="Add or update a fact"><form action={addFactAction} className="grid gap-2"><input type="hidden" name="clientId" value={client.id} />
            <select name="kb" className={inp} defaultValue={kb ?? "business"}>{knowledgeBases.map((k) => <option key={k}>{k}</option>)}</select>
            <input name="key" required placeholder="key, e.g. website_url" className={inp} /><textarea name="value" required rows={2} placeholder="value" className={inp} />
            <select name="status" className={inp} defaultValue="CLIENT-PROVIDED">{factStatuses.map((s) => <option key={s}>{s}</option>)}</select>
            <input name="source" required placeholder="source (required): URL, document, “client call 1 Nov”" className={inp} /><button className={btn}>Save as new version</button></form></Card>
        </div>
      </div>
    </Page>
  );
}
