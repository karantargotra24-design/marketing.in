import type { ReactNode } from "react";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");
export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "amber" | "red" | "blue" | "purple" }) {
  const t = { gray: "bg-slate-100 text-slate-700", green: "bg-green-100 text-green-800", amber: "bg-amber-100 text-amber-800", red: "bg-red-100 text-red-800", blue: "bg-blue-100 text-blue-800", purple: "bg-purple-100 text-purple-800" }[tone];
  return <span className={cx("inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium", t)}>{children}</span>;
}
export const statusTone = (s: string) => (/COMPLETED|approved|pass|tested_ok|COMPLETED/i.test(s) && !/blocked/i.test(s) ? "green" : /FAILED|rejected|blocked|failed/i.test(s) ? "red" : /WAITING|changes|AWAITING|draft|PENDING|queued/i.test(s) ? "amber" : /PROGRESS|RUNNING|review|leased/i.test(s) ? "blue" : "gray") as "gray" | "green" | "amber" | "red" | "blue";
export function Card({ title, children, right, id }: { title?: ReactNode; children: ReactNode; right?: ReactNode; id?: string }) {
  return <section id={id} className="rounded-lg border border-slate-200 bg-white p-4">{(title || right) && <div className="mb-2 flex items-center justify-between gap-2">{title && <h2 className="font-semibold">{title}</h2>}{right}</div>}{children}</section>;
}
export function Page({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return <div className="space-y-4"><div><h1 className="text-2xl font-bold">{title}</h1>{sub && <p className="text-sm text-slate-600">{sub}</p>}</div>{children}</div>;
}
export function Unavailable({ children }: { children: ReactNode }) { return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600" data-testid="unavailable">{children}</div>; }
export const btn = "rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40";
export const btn2 = "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40";
export const inp = "w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm";
export const money = (n: number) => `$${n.toFixed(4)}`;
export const when = (iso?: string | null) => (iso ? iso.slice(0, 16).replace("T", " ") + " UTC" : "—");
export function Msg({ error, ok }: { error?: string; ok?: string }) {
  return <>{error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p>}{ok && <p role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-800">{ok}</p>}</>;
}
