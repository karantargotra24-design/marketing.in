import { isIntegrationOperational, type AdPlanBody } from "@/hq";
import { Badge, Card, Msg, Page, Unavailable, btn } from "../kit";
import { getCtx } from "../ctx";
import { bodyOf } from "../data";
import { DecisionForm, QaList } from "../decision";
import { submitCommand } from "../actions";

export default async function Campaigns({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams; const { store, client } = await getCtx();
  if (!client) return <Page title="Campaign Manager"><Unavailable>No client selected.</Unavailable></Page>;
  const [plans, facts] = await Promise.all([store.listDeliverables({ clientId: client.id, kind: "ad_plan" }), store.listFacts(client.id)]);
  const d = plans.at(-1);
  const has = (k: string) => facts.some((f) => f.key.split("@")[0] === k);
  const unverified = facts.filter((f) => ["scarcity_claims", "discount_claims", "social_proof_on_store"].includes(f.key) && f.status !== "VERIFIED");
  const metaOk = await isIntegrationOperational(store, "meta_ads");
  const body = d ? (await bodyOf<AdPlanBody>(store, client.id, d)).body : null;
  const budget = has("budget") || body?.budget.amountInr != null;
  const checklist: [string, boolean, string][] = [
    ["Budget (₹) provided", budget, "Add a requirements.budget fact in the Knowledge Centre"], ["Goal / KPI provided", has("goals"), "Add a requirements.goals fact"], ["Landing page URL verified", has("website_url"), "Add a business.website_url fact"],
    ["Ad copy passed QA with no unverified claims", Boolean(d?.qa?.pass) && unverified.length === 0 ? true : Boolean(d?.qa?.pass), unverified.length ? `${unverified.length} store claim(s) are unverified (${unverified.map((f) => f.key).join(", ")}); they are kept out of the copy` : "Run QA"],
    ["Plan approved by you", d?.status === "approved", "Approve the plan below"], ["Meta Ads integration connected AND tested", metaOk, "Awaiting credentials: see Integrations"],
  ];
  const ready = checklist.every((c) => c[1]);
  return (
    <Page title={`Campaign Manager — ${client.name}`} sub="Plans and checks only. Launching or changing a live campaign is not possible from here: it needs your approval and a tested Meta/Google integration.">
      <Msg error={sp.error} ok={sp.ok} />
      <form action={submitCommand}><input type="hidden" name="client" value={client.id} /><input type="hidden" name="instruction" value={`Prepare an Instagram advertising plan for ${client.name} with ad copy, audiences, creative briefs and a budget recommendation`} /><button className={btn}>Create an advertising plan</button></form>
      {!d || !body ? <Unavailable>No advertising plan yet. The Advertising agent produces one as part of a campaign or ads objective (needs AI mode mock or live).</Unavailable> : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card title="Objective & budget"><p className="text-sm">{body.objective}</p><p className="mt-2 text-sm"><b>Budget:</b> {body.budget.amountInr != null ? `₹${body.budget.amountInr.toLocaleString("en-IN")}` : <Badge tone="amber">NOT PROVIDED</Badge>} <span className="text-slate-500">{body.budget.note}</span></p></Card>
            <Card title="Audience suggestions">{body.audiences.map((a) => <div key={a.name} className="mb-2 text-sm"><b>{a.name}</b> {!a.validated && <Badge tone="amber">unvalidated</Badge>}<div>{a.targeting}</div><div className="text-slate-500">{a.rationale}</div></div>)}</Card>
            <Card title="Ad copy"><table className="w-full text-left text-sm"><thead className="text-xs text-slate-500"><tr><th>Headline</th><th>Text</th><th>CTA</th></tr></thead><tbody data-testid="ad-copy">{body.adCopy.map((a, i) => <tr key={i} className="border-t align-top"><td className="py-1.5 pr-2 font-medium">{a.headline}</td><td className="pr-2">{a.text}</td><td>{a.cta}</td></tr>)}</tbody></table></Card>
            <Card title="Performance analysis"><p className="text-sm"><Badge tone={body.performanceAnalysis.status === "NO DATA" ? "amber" : "green"}>{body.performanceAnalysis.status}</Badge> {body.performanceAnalysis.note}</p></Card>
            <Card title="Risks"><ul className="text-sm">{body.risks.map((r) => <li key={r}>⚠ {r}</li>)}</ul></Card>
          </div>
          <div className="space-y-4">
            <Card title="Launch checklist (computed from real data)"><ul className="space-y-1 text-sm" data-testid="launch-checklist">{checklist.map(([l, ok, why]) => <li key={l}>{ok ? "✅" : "☐"} {l}{!ok && <div className="ml-5 text-xs text-slate-500">{why}</div>}</li>)}</ul>
              <button className="mt-3 w-full rounded-md border px-3 py-1.5 text-sm opacity-40" disabled data-testid="launch-btn">Launch campaign{ready ? "" : " (blocked)"}</button><p className="mt-1 text-xs text-slate-500">Launch is intentionally not implemented in this build: it needs a tested Meta integration and a separate explicit approval before any spend.</p></Card>
            <Card title="QA & decision"><QaList d={d} /><div className="mt-3"><DecisionForm d={d} back="/os/campaigns" /></div></Card>
          </div>
        </div>)}
    </Page>
  );
}
