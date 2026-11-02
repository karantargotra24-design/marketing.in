import { type ContentItemBody, type CreativeBriefBody } from "@/hq";
import { Badge, Card, Msg, Page, Unavailable, statusTone } from "../kit";
import { getCtx } from "../ctx";
import { bodyOf } from "../data";
import { DecisionForm, QaList } from "../decision";
import Link from "next/link";

export default async function Creative({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; brief?: string }> }) {
  const sp = await searchParams; const { store, client } = await getCtx();
  if (!client) return <Page title="Creative Studio"><Unavailable>No client selected.</Unavailable></Page>;
  const [bs, facts, items] = await Promise.all([store.listDeliverables({ clientId: client.id, kind: "creative_brief" }), store.listFacts(client.id), store.listDeliverables({ clientId: client.id, kind: "content_item" })]);
  const palette = facts.find((f) => f.key.split("@")[0] === "colors"); const paletteOk = Boolean(palette) && palette!.status !== "NEEDS VERIFICATION";
  const rows = await Promise.all(bs.map(async (d) => ({ d, ...(await bodyOf<CreativeBriefBody>(store, client.id, d)) })));
  const sel = rows.find((r) => r.d.id === sp.brief) ?? rows[0];
  const item = sel ? items.find((i) => i.id === sel.body.contentItemId) : null;
  const itemBody = item ? (await bodyOf<ContentItemBody>(store, client.id, item)).body : null;
  return (
    <Page title={`Creative Studio — ${client.name}`} sub="Design briefs, layouts and generation prompts, checked against the brand. Image/video generation is not connected: this screen produces the instructions, not the assets.">
      <Msg error={sp.error} ok={sp.ok} />
      <div className={`rounded-md border p-3 text-sm ${paletteOk ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`} data-testid="brand-check">{paletteOk ? `Brand palette confirmed (${palette!.status}).` : "Brand palette and fonts are NOT confirmed for this client, so colour compliance cannot be checked and asset generation must wait. Add or resolve the brand colour facts in the Knowledge Centre."}</div>
      {rows.length === 0 ? <Unavailable>No creative briefs yet. They are produced by the Creative Director agent as part of a campaign or content plan (needs AI mode mock or live).</Unavailable> : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card title={`${rows.length} brief(s)`}><ul className="space-y-1 text-sm" data-testid="brief-list">{rows.map((r) => <li key={r.d.id}><Link href={`/os/creative?brief=${r.d.id}`} className={`block rounded p-1.5 hover:bg-slate-50 ${sel?.d.id === r.d.id ? "bg-indigo-50" : ""}`}>{r.d.title.replace("Brief · ", "").slice(0, 44)} <Badge tone={statusTone(r.d.status)}>{r.d.status.replace("_", " ")}</Badge></Link></li>)}</ul></Card>
          {sel && <div className="space-y-4 lg:col-span-2" data-testid="brief-detail">
            <Card title={sel.d.title} right={<Badge tone="blue">{sel.body.aspect}</Badge>}>
              {itemBody && <p className="text-xs text-slate-500">For post: {itemBody.format} · {itemBody.date} · “{itemBody.hook}”</p>}
              <h3 className="mt-2 text-sm font-semibold">Concept</h3><p className="text-sm">{sel.body.concept}</p>
              <h3 className="mt-2 text-sm font-semibold">Layout</h3><p className="text-sm">{sel.body.layout}</p>
              <h3 className="mt-2 text-sm font-semibold">Image-generation prompt</h3><pre className="whitespace-pre-wrap rounded bg-slate-50 p-2 text-xs">{sel.body.imagePrompt}</pre>
              {sel.body.videoPrompt && <><h3 className="mt-2 text-sm font-semibold">Video-generation prompt</h3><pre className="whitespace-pre-wrap rounded bg-slate-50 p-2 text-xs">{sel.body.videoPrompt}</pre></>}
              {sel.body.storyboard && <><h3 className="mt-2 text-sm font-semibold">Storyboard</h3><ol className="list-decimal pl-5 text-sm">{sel.body.storyboard.map((s) => <li key={s}>{s}</li>)}</ol></>}
              <h3 className="mt-2 text-sm font-semibold">Variations</h3><ul className="text-sm">{sel.body.variations.map((v) => <li key={v}>• {v}</li>)}</ul>
              <h3 className="mt-2 text-sm font-semibold">Brand notes</h3><p className="text-sm">{sel.body.brandNotes}</p>
              <h3 className="mt-2 text-sm font-semibold">Assets needed</h3><ul className="text-sm">{sel.body.assetSlots.map((a) => <li key={a}>☐ {a}</li>)}</ul>
            </Card>
            <Card title="Generation"><button className="rounded-md border px-3 py-1.5 text-sm opacity-40" disabled>Generate image / video</button><p className="mt-1 text-xs text-slate-500">Not connected: no image or video generation service has credentials. Each generation also spends credits and would need your approval.</p></Card>
            <Card title="Checks & decision"><QaList d={sel.d} /><div className="mt-3"><DecisionForm d={sel.d} back={`/os/creative?brief=${sel.d.id}`} /></div></Card>
          </div>}
        </div>)}
    </Page>
  );
}
