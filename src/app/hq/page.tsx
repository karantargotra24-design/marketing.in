import Link from "next/link";
import { AGENT_LIST, defaultStore, INTEGRATIONS, WORKFLOWS } from "@/hq";
import { addClientAction, createTaskAction, decideApprovalAction, requestApprovalAction, runWorkflowAction, seedAction } from "./actions";

import { requireHuman } from "@/app/hq/guard";

export const dynamic = "force-dynamic";
const badge = (s: string) => ({ COMPLETED: "bg-green-100 text-green-800", FAILED: "bg-red-100 text-red-800", "IN PROGRESS": "bg-blue-100 text-blue-800", "WAITING FOR INPUT": "bg-amber-100 text-amber-800", "UNDER REVIEW": "bg-purple-100 text-purple-800", PENDING: "bg-slate-200 text-slate-700", "WAITING FOR APPROVAL": "bg-orange-100 text-orange-800" } as Record<string, string>)[s] ?? "bg-slate-100";
const card = "rounded-lg border border-slate-200 bg-white p-4";
const input = "w-full rounded border border-slate-300 px-2 py-1.5 text-sm";
const btn = "rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white";

export default async function HqPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await requireHuman();
  const { error, ok } = await searchParams;
  const store = defaultStore();
  const loaded = await Promise.all([store.listClients(), store.listTasks(), store.listApprovals(), store.readLog(25)]).catch(() => null);
  const writable = loaded !== null;
  const [clients, tasks, approvals, log] = loaded ?? [[], [], [], []];
  const count = (s: string) => tasks.filter((t) => t.status === s).length;
  const pending = approvals.filter((a) => a.status === "PENDING");
  const runs = new Set(tasks.filter((t) => t.status === "IN PROGRESS" || t.status === "PENDING").map((t) => t.runId));
  const name = (id: string) => clients.find((c) => c.id === id)?.name ?? id;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div><h1 className="text-2xl font-bold">AI Marketing Agency HQ</h1><p className="text-sm text-slate-600">ScapeMedia · multi-agent, multi-client. Nothing is published, sent or spent without your approval.</p></div>
        <Link href="/dashboard" className="text-sm underline">Client list (Supabase)</Link>
      </header>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {ok && <p className="rounded bg-green-50 p-3 text-sm text-green-800">{ok}</p>}
      {!writable && <p className="rounded bg-amber-50 p-3 text-sm text-amber-900">HQ data folder is not readable/writable here. File storage works locally and in cloud dev, not on read-only hosting.</p>}

      <section aria-label="Overview" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Clients", clients.length], ["Active runs", runs.size], ["Agents", AGENT_LIST.length], ["Running tasks", count("IN PROGRESS")], ["Completed", count("COMPLETED")], ["Waiting for input", count("WAITING FOR INPUT")], ["Pending approvals", pending.length], ["Failed", count("FAILED")]].map(([l, n]) => (
          <div key={l as string} className={card}><div className="text-2xl font-bold">{n}</div><div className="text-xs text-slate-600">{l}</div></div>
        ))}
      </section>

      <section className={card}>
        <h2 className="mb-2 font-semibold">Clients & workspaces</h2>
        {clients.length === 0 && <form action={seedAction}><p className="mb-2 text-sm">No workspaces yet. Create Pahadi Origin, Propedia and your Personal Brand from the sources found in your cloud:</p><button className={btn}>Create the 3 workspaces</button></form>}
        <ul className="divide-y">
          {clients.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div><Link href={`/hq/client/${c.id}`} className="font-medium underline">{c.name}</Link> <span className="text-xs text-slate-500">{c.kind === "personal_brand" ? "personal brand" : "client"} · {c.id}</span></div>
              <form action={runWorkflowAction} className="flex gap-2"><input type="hidden" name="clientId" value={c.id} />
                <select name="workflow" className={input + " w-auto"}>{Object.keys(WORKFLOWS).map((w) => <option key={w}>{w}</option>)}</select><button className={btn}>Run</button></form>
            </li>
          ))}
        </ul>
        <form action={addClientAction} className="mt-3 flex flex-wrap gap-2 border-t pt-3">
          <input name="name" placeholder="New client name" required className={input + " sm:w-56"} />
          <input name="id" placeholder="id (e.g. jammu-motors)" required pattern="[a-z0-9][a-z0-9_-]{1,40}" className={input + " sm:w-48"} />
          <button className={btn}>Add client</button>
        </form>
      </section>

      <section className={card}>
        <h2 className="mb-2 font-semibold">Tasks</h2>
        <form action={createTaskAction} className="mb-3 grid gap-2 sm:grid-cols-5">
          <select name="clientId" className={input}>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select name="agent" className={input}>{AGENT_LIST.filter((a) => a.id !== "qa").map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <input name="description" placeholder="Task description" required className={input + " sm:col-span-2"} />
          <div className="flex gap-2"><select name="priority" className={input}><option>normal</option><option>high</option><option>low</option></select><button className={btn}>Run</button></div>
        </form>
        <div className="overflow-x-auto"><table className="w-full text-left text-xs">
          <thead className="text-slate-500"><tr><th>Task</th><th>Client</th><th>Agent</th><th>Status</th><th>Review</th><th>Started</th><th>Output</th></tr></thead>
          <tbody>{[...tasks].reverse().slice(0, 40).map((t) => (
            <tr key={t.id} className="border-t align-top"><td className="py-1 pr-2" title={t.description}>{t.id.slice(-8)}<div className="text-slate-500">{t.description.slice(0, 40)}</div></td><td>{name(t.clientId)}</td><td>{t.agent}</td>
              <td><span className={`rounded px-1.5 py-0.5 ${badge(t.status)}`}>{t.status}</span>{t.error && <div className="text-red-700">{t.error}</div>}</td><td>{t.reviewStatus}</td><td>{t.startedAt?.slice(11, 19) ?? "—"}</td>
              <td>{t.outputPath ? <Link className="underline" href={`/hq/report/${t.clientId}/${t.outputPath.split("/").pop()}`}>open</Link> : "—"}</td></tr>))}
          </tbody></table>{tasks.length === 0 && <p className="text-sm text-slate-500">No tasks yet.</p>}</div>
      </section>

      <section className={card}>
        <h2 className="mb-2 font-semibold">Approvals</h2>
        {pending.length === 0 && <p className="text-sm text-slate-500">Nothing waiting. Approving here only records your decision; publishing/ads/messaging integrations are not connected yet.</p>}
        {pending.map((a) => (
          <form key={a.id} action={decideApprovalAction} className="flex flex-wrap items-center justify-between gap-2 border-t py-2 text-sm"><input type="hidden" name="id" value={a.id} />
            <span><b>{a.kind}</b> · {name(a.clientId)} · {a.summary}</span>
            <span className="flex gap-2"><button name="decision" value="APPROVED" className={btn}>Approve</button><button name="decision" value="REJECTED" className="rounded border px-3 py-1.5 text-sm">Reject</button></span></form>))}
        <form action={requestApprovalAction} className="mt-3 grid gap-2 border-t pt-3 sm:grid-cols-4">
          <select name="clientId" className={input}>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select name="kind" className={input}>{["publish_post", "launch_ad", "spend_money", "send_client_message", "modify_production", "other"].map((k) => <option key={k}>{k}</option>)}</select>
          <input name="summary" placeholder="What needs approval?" required className={input} /><button className={btn}>Request approval</button>
        </form>
      </section>

      <section className={card}>
        <h2 className="mb-2 font-semibold">Agents ({AGENT_LIST.length})</h2>
        <div className="grid gap-2 sm:grid-cols-2">{AGENT_LIST.map((a) => {
          const mine = tasks.filter((t) => t.agent === a.id);
          const busy = mine.filter((t) => t.status === "IN PROGRESS");
          return (<details key={a.id} className="rounded border p-2 text-sm"><summary className="cursor-pointer"><b>{a.name}</b> <span className={`rounded px-1.5 text-xs ${busy.length ? "bg-blue-100" : "bg-slate-100"}`}>{busy.length ? `working (${busy.length})` : "idle"}</span> <span className="text-xs text-slate-500">done {mine.filter((t) => t.status === "COMPLETED").length} · failed {mine.filter((t) => t.status === "FAILED").length}</span></summary>
            <p className="mt-1 text-slate-700">{a.identity}</p><p className="mt-1 text-xs"><b>Reads:</b> {a.knowledgePermissions.join(", ")}</p><p className="text-xs"><b>Outputs:</b> {a.expectedOutputs.join(", ")}</p><p className="text-xs"><b>Tools:</b> {a.tools.join("; ")}</p>
            {mine.filter((t) => t.error).slice(-2).map((t) => <p key={t.id} className="text-xs text-red-700">Error {t.id.slice(-6)}: {t.error}</p>)}</details>);
        })}</div>
      </section>

      <section className={card}>
        <h2 className="mb-2 font-semibold">Integrations (honest status)</h2>
        <table className="w-full text-left text-xs"><tbody>{INTEGRATIONS.map((i) => <tr key={i.id} className="border-t"><td className="py-1 pr-2 font-medium">{i.id}</td><td className="pr-2">{i.status}</td><td className="text-slate-600">{i.note}</td></tr>)}</tbody></table>
      </section>

      <section className={card}>
        <h2 className="mb-2 font-semibold">Activity log</h2>
        <ul className="space-y-0.5 text-xs">{[...log].reverse().map((l, i) => <li key={i}><span className="text-slate-500">{l.at.slice(11, 19)}</span> {l.clientId ?? "agency"} · {l.actor} · {l.action} · {l.detail.slice(0, 90)}</li>)}</ul>
      </section>
    </main>
  );
}
