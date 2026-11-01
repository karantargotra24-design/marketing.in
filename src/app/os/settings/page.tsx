import { AGENT_LIST, describeAi, knowledgeBases, loadPolicy } from "@/hq";
import { Badge, Card, Msg, Page, btn, inp } from "../kit";
import { getCtx } from "../ctx";
import { savePolicyAction } from "../actions";

export default async function Settings({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams; const { store, actor } = await getCtx();
  const policy = await loadPolicy(store); const ai = describeAi();
  const usingDb = Boolean(process.env.DATABASE_URL && process.env.HQ_AGENCY_ID);
  const open = process.env.HQ_ALLOW_OPEN === "1";
  const OBJ = ["campaign", "ads", "content_plan", "audit", "research", "strategy", "report", "general"] as const;
  return (
    <Page title="Settings & Permissions" sub="Who may do what, what each agent may read, and how much autonomy and AI spend you allow.">
      <Msg error={sp.error} ok={sp.ok} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="You"><p className="text-sm">Signed in as <b>{actor.replace("human:", "")}</b></p><p className="mt-1 text-xs text-slate-500">Access: staff accounts (owner/member) only. Client logins cannot open this app. Roles are enforced by the database (row-level security).</p></Card>
        <Card title="Autonomy policy (what runs without waiting for you)"><form action={savePolicyAction} className="space-y-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="enabled" defaultChecked={policy.enabled} /> Let routine internal work start automatically</label>
          <label className="flex items-center gap-2">Preview anything estimated above $<input name="maxEstUsd" type="number" step="0.05" min="0" max="100" defaultValue={policy.maxEstUsd} className={inp + " w-24"} /></label>
          <fieldset><legend className="text-xs text-slate-500">Always preview and approve the plan for:</legend><div className="flex flex-wrap gap-3">{OBJ.map((o) => <label key={o} className="flex items-center gap-1"><input type="checkbox" name="highImpact" value={o} defaultChecked={policy.highImpact.includes(o)} />{o.replace("_", " ")}</label>)}</div></fieldset>
          <button className={btn}>Save policy</button></form>
          <p className="mt-2 text-xs text-slate-500">Never automatic, regardless of this policy: publishing, client messages, launching/changing ads, spending ad budgets, unapproved API costs, destructive changes.</p></Card>
        <Card title="AI engine"><p className="text-sm"><Badge tone={ai.mode === "LIVE" ? "green" : ai.mode === "MOCK" ? "amber" : "gray"}>{ai.mode}</Badge> provider {ai.provider} · models {ai.models.default} / {ai.models.bulk}</p><p className="mt-1 text-sm">Limits: run ${ai.caps.runUsd} · day ${ai.caps.dailyUsd} · month ${ai.caps.monthlyUsd}</p>{ai.liveBlockers.length > 0 && <p className="text-xs text-amber-700">Live blocked: {ai.liveBlockers.join("; ")}</p>}<p className="mt-1 text-xs text-slate-500">Changed with server environment variables (see .env.example). Raising limits or enabling live mode needs your explicit approval.</p></Card>
        <Card title="Data & security"><ul className="text-sm"><li>Storage: <Badge tone={usingDb ? "green" : "amber"}>{usingDb ? "Postgres (Supabase)" : "Local file store (development only)"}</Badge></li><li className="mt-1">Open access flag: {open ? <Badge tone="red">HQ_ALLOW_OPEN is ON (not for production)</Badge> : <Badge tone="green">off (login required in production)</Badge>}</li><li className="mt-1">Worker endpoint: {process.env.HQ_WORKER_SECRET ? "secret set" : "disabled"}</li><li className="mt-1">Client isolation: enforced in code (scoped workspaces), database keys and row-level security.</li></ul></Card>
      </div>
      <Card title="What each agent may read (permissions)"><div className="overflow-x-auto"><table className="w-full text-left text-xs" data-testid="perm-matrix"><thead className="text-slate-500"><tr><th>Agent</th>{knowledgeBases.map((k) => <th key={k} className="px-1">{k.slice(0, 5)}</th>)}</tr></thead><tbody>{AGENT_LIST.map((a) => <tr key={a.id} className="border-t"><td className="py-1 pr-2">{a.name}</td>{knowledgeBases.map((k) => <td key={k} className="px-1">{a.knowledgePermissions.includes(k) ? "●" : "·"}</td>)}</tr>)}</tbody></table></div><p className="mt-1 text-xs text-slate-500">● = may read. Every agent is additionally limited to the active client; there is no cross-client read path.</p></Card>
    </Page>
  );
}
