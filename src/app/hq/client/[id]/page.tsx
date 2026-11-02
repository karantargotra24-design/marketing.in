import Link from "next/link";
import { notFound } from "next/navigation";
import { defaultStore, factStatuses, knowledgeBases } from "@/hq";
import { clientIdSchema } from "@/hq/types";
import { addFactAction } from "../../actions";

import { requireHuman } from "@/app/hq/guard";

export const dynamic = "force-dynamic";
const input = "w-full rounded border border-slate-300 px-2 py-1.5 text-sm";

export default async function ClientPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  await requireHuman();
  const { id } = await params;
  const { ok } = await searchParams;
  if (!clientIdSchema.safeParse(id).success) notFound();
  const store = defaultStore();
  const client = await store.getClient(id);
  if (!client) notFound();
  const [facts, outputs, tasks] = await Promise.all([store.listFacts(id), store.listOutputs(id), store.listTasks({ clientId: id })]);
  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
      <Link href="/hq" className="text-sm underline">← Agency HQ</Link>
      <h1 className="text-2xl font-bold">{client.name}</h1>
      <p className="text-sm text-slate-600">Isolated workspace <code>{client.id}</code> · {facts.length} active facts · {tasks.length} tasks. No other client&apos;s data appears here.</p>
      {ok && <p className="rounded bg-green-50 p-3 text-sm text-green-800">{ok}</p>}
      <section className="rounded-lg border bg-white p-4"><h2 className="mb-2 font-semibold">Reports & outputs</h2>
        <ul className="text-sm">{outputs.filter(Boolean).map((f) => <li key={f}><Link className="underline" href={`/hq/report/${id}/${f}`}>{f}</Link></li>)}</ul>{outputs.length === 0 && <p className="text-sm text-slate-500">None yet. Run a workflow from Agency HQ.</p>}</section>
      <section className="rounded-lg border bg-white p-4"><h2 className="mb-2 font-semibold">Knowledge base</h2>
        {knowledgeBases.map((kb) => { const rows = facts.filter((f) => f.kb === kb); return (
          <div key={kb} className="mb-3"><h3 className="text-sm font-semibold capitalize">{kb} <span className="font-normal text-slate-500">({rows.length})</span></h3>
            {rows.length === 0 ? <p className="text-xs text-amber-700">Empty — information needed.</p> : <ul className="space-y-1 text-xs">{rows.map((f) => <li key={f.id} className="border-t pt-1"><b>{f.key}</b> <span className="rounded bg-slate-100 px-1">{f.status}</span> v{f.version}<div>{f.value}</div><div className="text-slate-500">source: {f.source}</div></li>)}</ul>}</div>); })}
      </section>
      <section className="rounded-lg border bg-white p-4"><h2 className="mb-2 font-semibold">Add / update a fact (a source is required; updates keep history)</h2>
        <form action={addFactAction} className="grid gap-2 sm:grid-cols-6"><input type="hidden" name="clientId" value={id} />
          <select name="kb" className={input}>{knowledgeBases.map((k) => <option key={k}>{k}</option>)}</select>
          <input name="key" placeholder="key e.g. website_url" required className={input} />
          <select name="status" className={input}>{factStatuses.map((s) => <option key={s}>{s}</option>)}</select>
          <input name="source" placeholder="source (URL / doc / 'client call 1 Nov')" required className={input + " sm:col-span-2"} />
          <button className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">Save</button>
          <textarea name="value" placeholder="value" required className={input + " sm:col-span-6"} rows={2} /></form></section>
    </main>
  );
}
