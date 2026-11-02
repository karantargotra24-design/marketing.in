import { Badge, Card, Msg, Page, btn, inp } from "../kit";
import { getCtx } from "../ctx";
import { addClientAction, seedWorkspacesAction, switchClient } from "../actions";
import { computeGaps, conflictsOf, kbFilled } from "../data";

export default async function Clients({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams; const { store, clients, client } = await getCtx();
  const rows = await Promise.all(clients.map(async (c) => { const [f, runs] = await Promise.all([store.listFacts(c.id), store.listRuns({ clientId: c.id })]); return { c, f, last: runs.at(-1) ?? null, gaps: computeGaps(f).length, conflicts: conflictsOf(f).length }; }));
  return (
    <Page title="Client Management" sub="Each client is an isolated workspace: knowledge, deliverables, runs and spend are never shared.">
      <Msg error={sp.error} ok={sp.ok} />
      {clients.length === 0 && <Card title="No workspaces yet"><form action={seedWorkspacesAction}><button className={btn}>Create the 3 workspaces from the seed file</button></form><p className="mt-1 text-xs text-slate-500">Reads data/seed/clients.json (private, not in git). Or add a client below.</p></Card>}
      <Card><table className="w-full text-left text-sm"><thead className="text-xs text-slate-500"><tr><th>Client</th><th>Type</th><th>KBs filled</th><th>Facts</th><th>Open gaps</th><th>Conflicts</th><th>Last run</th><th></th></tr></thead><tbody>
        {rows.map(({ c, f, last, gaps, conflicts }) => <tr key={c.id} className="border-t"><td className="py-2"><b>{c.name}</b> <span className="text-xs text-slate-500">{c.id}</span>{client?.id === c.id && <> <Badge tone="blue">active</Badge></>}</td><td>{c.kind === "personal_brand" ? "Personal brand" : "Client"}</td><td>{kbFilled(f)}/10</td><td>{f.length}</td><td>{gaps}</td><td>{conflicts || "—"}</td><td className="text-xs">{last ? `${last.objective} · ${last.status}` : "—"}</td>
          <td><form action={switchClient}><input type="hidden" name="client" value={c.id} /><input type="hidden" name="back" value="/os" /><button className="text-sm underline">Switch to</button></form></td></tr>)}</tbody></table></Card>
      <Card title="Add a client"><form action={addClientAction} className="flex flex-wrap gap-2"><input name="name" required placeholder="Client name" className={inp + " sm:w-64"} /><input name="id" required pattern="[a-z0-9][a-z0-9_-]{1,40}" placeholder="id (e.g. jammu-motors)" className={inp + " sm:w-56"} /><button className={btn}>Create empty workspace</button></form><p className="mt-2 text-xs text-slate-500">New workspaces start empty. Add facts (with sources) in the Knowledge Centre, then give an objective.</p></Card>
    </Page>
  );
}
