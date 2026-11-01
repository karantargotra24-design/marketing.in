import Link from "next/link";
import { Badge, Card, Msg, Page, Unavailable, btn, btn2, inp, statusTone, when } from "../kit";
import { getCtx } from "../ctx";
import { createScheduleAction, runWorkerNow, toggleScheduleAction } from "../actions";

export default async function Automation({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams; const { store, clients, client } = await getCtx();
  if (!client) return <Page title="Automation Centre"><Unavailable>No client selected.</Unavailable></Page>;
  const [schedules, jobs, runs] = await Promise.all([store.listSchedules(), store.listJobs(), store.listRuns()]);
  const nameOf = (id: string) => clients.find((c) => c.id === id)?.name ?? id;
  const cron = Boolean(process.env.HQ_WORKER_SECRET && process.env.HQ_WORKER_SECRET.length >= 24);
  const count = (s: string) => jobs.filter((j) => j.status === s).length;
  return (
    <Page title="Automation Centre" sub="Recurring workflows and the background worker. Scheduled runs follow the same rules as manual ones: routine internal work proceeds, high-impact work waits for plan approval, nothing external happens without approval.">
      <Msg error={sp.error} ok={sp.ok} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Background worker"><p className="text-sm">Jobs: queued <b>{count("queued")}</b> · running <b>{count("leased")}</b> · done {count("done")} · failed <b>{count("failed")}</b></p>
          <p className="mt-2 text-sm">Cron endpoint <code>/api/worker</code>: {cron ? <Badge tone="green">enabled</Badge> : <Badge tone="amber">disabled (HQ_WORKER_SECRET not set)</Badge>}</p>
          <p className="mt-1 text-xs text-slate-500">{cron ? "Call it from a cron (GitHub Actions / Vercel Cron) with a Bearer secret." : "Without cron, queued jobs and due schedules are processed when you submit an objective or press the button below."}</p>
          <form action={runWorkerNow} className="mt-3"><button className={btn2}>Run worker now</button></form></Card>
        <div className="lg:col-span-2"><Card title="Schedules"><table className="w-full text-left text-sm"><thead className="text-xs text-slate-500"><tr><th>Name</th><th>Client</th><th>Cadence (IST)</th><th>Next run</th><th>Last run</th><th></th></tr></thead><tbody data-testid="schedules">
          {schedules.map((s) => <tr key={s.id} className="border-t align-top"><td className="py-1.5 pr-2"><b>{s.name}</b><div className="text-xs text-slate-500">{s.instruction.slice(0, 70)}</div></td><td>{nameOf(s.clientId)}</td><td>{s.cadence}</td><td className="text-xs">{s.enabled ? when(s.nextRunAt) : <Badge>paused</Badge>}</td><td className="text-xs">{s.lastRunId ? <Link className="underline" href={`/os/runs/${s.lastRunId}`}>{when(s.lastRunAt)}</Link> : "—"}</td><td><form action={toggleScheduleAction}><input type="hidden" name="id" value={s.id} /><button className="text-sm underline">{s.enabled ? "Pause" : "Resume"}</button></form></td></tr>)}
          {schedules.length === 0 && <tr><td colSpan={6} className="py-2 text-slate-500">No schedules yet.</td></tr>}</tbody></table></Card></div>
      </div>
      <Card title={`New schedule for ${client.name}`}><form action={createScheduleAction} className="grid gap-2 sm:grid-cols-4"><input type="hidden" name="client" value={client.id} /><input name="name" required placeholder="Name, e.g. Weekly content" className={inp} /><input name="instruction" required minLength={8} placeholder="Objective, e.g. Prepare next week's content plan" className={inp + " sm:col-span-2"} /><input name="cadence" required defaultValue="weekly:MON@09:00" className={inp} aria-label="Cadence" /><button className={btn}>Create schedule</button></form><p className="mt-1 text-xs text-slate-500">Cadence: daily@09:00 · weekly:MON@09:00 · monthly:1@09:00 (India time).</p></Card>
      <Card title="Recent runs"><ul className="text-sm" data-testid="recent-runs">{[...runs].reverse().slice(0, 8).map((r) => <li key={r.id} className="flex items-center justify-between border-t py-1 first:border-0"><span>{nameOf(r.clientId)} · {r.instruction.slice(0, 60)} {r.scheduleId && <Badge tone="blue">scheduled</Badge>}</span><Badge tone={statusTone(r.status)}>{r.status.replace(/_/g, " ")}</Badge></li>)}{runs.length === 0 && <li className="text-slate-500">No runs yet.</li>}</ul></Card>
    </Page>
  );
}
