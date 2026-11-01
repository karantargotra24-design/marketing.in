import Link from "next/link";
import { taskStatuses } from "@/hq";
import { AutoRefresh } from "../ui";
import { Badge, Card, Page, Unavailable, statusTone, when } from "../kit";
import { getCtx } from "../ctx";

export default async function Tasks({ searchParams }: { searchParams: Promise<{ run?: string }> }) {
  const sp = await searchParams; const { store, client } = await getCtx();
  if (!client) return <Page title="Task Management"><Unavailable>No client selected.</Unavailable></Page>;
  const [all, runs, execs] = await Promise.all([store.listTasks({ clientId: client.id }), store.listRuns({ clientId: client.id }), store.listExecutions({ clientId: client.id, limit: 500 })]);
  const tasks = all.filter((t) => !sp.run || t.runId === sp.run);
  const active = tasks.some((t) => t.status === "IN PROGRESS" || t.status === "PENDING") && runs.some((r) => ["QUEUED", "RUNNING"].includes(r.status));
  const byId = new Map(all.map((t) => [t.id, t]));
  return (
    <Page title="Task Management" sub={`${client.name}: every unit of agent work, its dependencies and its outcome.`}>
      <div className="flex flex-wrap items-center gap-2 text-sm"><Link href="/os/tasks" className={`rounded-full border px-3 py-1 ${!sp.run ? "bg-slate-900 text-white" : "bg-white"}`}>All runs</Link>{[...runs].reverse().slice(0, 6).map((r) => <Link key={r.id} href={`/os/tasks?run=${r.id}`} className={`rounded-full border px-3 py-1 ${sp.run === r.id ? "bg-slate-900 text-white" : "bg-white"}`}>{r.objective} · {r.status}</Link>)}<AutoRefresh active={active} /></div>
      <div className="grid gap-2 overflow-x-auto md:grid-cols-4 xl:grid-cols-7" data-testid="board">
        {taskStatuses.map((s) => <div key={s} className="min-w-[150px] rounded-lg bg-slate-100 p-2"><h3 className="mb-1 text-[11px] font-semibold uppercase text-slate-500">{s} ({tasks.filter((t) => t.status === s).length})</h3>
          {tasks.filter((t) => t.status === s).map((t) => <div key={t.id} className="mb-1.5 rounded border bg-white p-2 text-xs"><b>{t.description.slice(0, 60)}</b><div className="text-slate-500">{t.agent}{t.kind ? ` · ${t.kind}` : ""}</div>{t.error && <div className="mt-1 text-red-700">{t.error.slice(0, 90)}</div>}</div>)}</div>)}
      </div>
      <Card title="Task list with dependencies"><table className="w-full text-left text-xs"><thead className="text-slate-500"><tr><th>Task</th><th>Agent</th><th>Status</th><th>Waits for</th><th>Tries</th><th>Started</th><th>Finished</th></tr></thead><tbody>
        {tasks.map((t) => <tr key={t.id} className="border-t align-top"><td className="py-1.5 pr-2">{t.description.slice(0, 70)}<div className="text-slate-400">{t.id.slice(-8)}</div></td><td>{t.agent}</td><td><Badge tone={statusTone(t.status)}>{t.status}</Badge></td><td className="max-w-[14rem]">{t.dependsOn.map((d) => byId.get(d)?.kind ?? byId.get(d)?.agent ?? "?").join(", ") || "—"}</td><td>{execs.filter((e) => e.taskId === t.id).length || t.attempts}</td><td>{when(t.startedAt)}</td><td>{when(t.completedAt)}</td></tr>)}
        {tasks.length === 0 && <tr><td colSpan={7} className="py-3 text-sm text-slate-500">No tasks yet. Give an objective in the command bar.</td></tr>}</tbody></table></Card>
    </Page>
  );
}
