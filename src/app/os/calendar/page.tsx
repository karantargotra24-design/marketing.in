import Link from "next/link";
import { type ContentItemBody } from "@/hq";
import { Badge, Card, Msg, Page, Unavailable, statusTone } from "../kit";
import { getCtx } from "../ctx";
import { bodyOf } from "../data";
import { DecisionForm, QaList } from "../decision";

const tone: Record<string, string> = { approved: "border-green-500 bg-green-50", in_review: "border-indigo-500 bg-indigo-50", changes_requested: "border-amber-500 bg-amber-50", draft: "border-slate-400 bg-slate-50", rejected: "border-red-500 bg-red-50 line-through" };
export default async function Calendar({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; item?: string; run?: string }> }) {
  const sp = await searchParams; const { store, client } = await getCtx();
  if (!client) return <Page title="Content Calendar"><Unavailable>No client selected.</Unavailable></Page>;
  const all = await store.listDeliverables({ clientId: client.id, kind: "content_item" });
  const runIds = [...new Set(all.map((d) => d.runId))] as string[]; const runId = sp.run ?? runIds.at(-1);
  const items = await Promise.all(all.filter((d) => d.runId === runId).map(async (d) => ({ d, ...(await bodyOf<ContentItemBody>(store, client.id, d)) })));
  items.sort((a, b) => a.body.date.localeCompare(b.body.date) || a.d.title.localeCompare(b.d.title));
  const sel = items.find((x) => x.d.id === sp.item) ?? items[0];
  const dates = [...new Set(items.map((x) => x.body.date))];
  const brief = sel ? (await store.listDeliverables({ clientId: client.id, runId: sel.d.runId ?? undefined, kind: "creative_brief" })).find((b) => b.title === `Brief · ${sel.body.title}`) : null;
  return (
    <Page title={`Content Calendar — ${client.name}`} sub="Every post: caption, script, QA checks and version history. Approving never publishes anything.">
      <Msg error={sp.error} ok={sp.ok} />
      {items.length === 0 ? <Unavailable>No content has been produced for {client.name} yet. Try: “Prepare a seven-day Instagram content plan”. Content generation needs AI mode mock or live (currently the dashboard shows the mode).</Unavailable> : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1"><Card title={`${items.length} post(s) · ${items[0].body.platform}`}><div className="space-y-2" data-testid="calendar">{dates.map((dt) => <div key={dt}><div className="text-xs font-semibold text-slate-500">{new Date(dt + "T00:00:00Z").toUTCString().slice(0, 11)}</div>{items.filter((x) => x.body.date === dt).map((x) => <Link key={x.d.id} href={`/os/calendar?item=${x.d.id}${runId ? `&run=${runId}` : ""}`} className={`mt-1 block rounded border-l-4 p-2 text-sm ${tone[x.d.status]} ${sel?.d.id === x.d.id ? "ring-2 ring-indigo-300" : ""}`}><b>{x.body.format}</b> · {x.body.title.split(":")[0]}<div className="text-xs text-slate-600">{x.body.hook.slice(0, 60)}</div><div className="mt-0.5 flex gap-1"><Badge tone={statusTone(x.d.status)}>{x.d.status.replace("_", " ")}</Badge>{x.d.qa && !x.d.qa.pass && <Badge tone="red">QA blocked</Badge>}{x.d.currentVersion > 1 && <Badge tone="purple">v{x.d.currentVersion}</Badge>}</div></Link>)}</div>)}</div></Card></div>
          {sel && <div className="space-y-4 lg:col-span-2" data-testid="post-detail">
            <Card title={sel.d.title} right={<Badge tone={statusTone(sel.d.status)}>{sel.d.status.replace("_", " ")} · v{sel.d.currentVersion}</Badge>}>
              <p className="text-xs text-slate-500">{sel.body.platform} · {sel.body.date} · pillar: {sel.body.pillar} · language: {sel.body.language}</p>
              <h3 className="mt-2 text-sm font-semibold">Hook</h3><p className="text-sm" data-testid="hook">{sel.body.hook}</p>
              <h3 className="mt-2 text-sm font-semibold">Caption</h3><p className="whitespace-pre-wrap text-sm" data-testid="caption">{sel.body.caption}</p>
              <p className="mt-1 text-sm"><b>CTA:</b> {sel.body.cta} · <span className="text-slate-500">{sel.body.hashtags.join(" ")}</span></p>
              {(sel.body as { script?: { t: string; text: string }[] | null }).script && <><h3 className="mt-2 text-sm font-semibold">Script</h3><ol className="text-sm">{(sel.body.script ?? []).map((s) => <li key={s.t}><span className="text-slate-500">{s.t}</span> {s.text}</li>)}</ol></>}
              {sel.body.slides && <><h3 className="mt-2 text-sm font-semibold">Slides</h3><ol className="text-sm">{sel.body.slides.map((s) => <li key={s.n}>{s.n}. {s.text}</li>)}</ol></>}
              {brief && <p className="mt-2 text-sm"><Link className="underline" href={`/os/creative?brief=${brief.id}`}>Creative brief available →</Link></p>}
            </Card>
            <Card title="Quality checks"><QaList d={sel.d} /></Card>
            <Card title="Your decision"><DecisionForm d={sel.d} back={`/os/calendar?item=${sel.d.id}`} /></Card>
            <Card title="Version history"><VersionList store={store} clientId={client.id} id={sel.d.id} /></Card>
          </div>}
        </div>)}
    </Page>
  );
}
async function VersionList({ store, clientId, id }: { store: import("@/hq").StorePort; clientId: string; id: string }) {
  const g = await store.getDeliverable(clientId, id);
  return <ol className="space-y-1 text-xs">{g!.versions.map((v) => <li key={v.version}><b>v{v.version}</b> · {v.createdBy} · {v.createdAt.slice(0, 16).replace("T", " ")} · {v.note || "first draft"}</li>)}</ol>;
}
