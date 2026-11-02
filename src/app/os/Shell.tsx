"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { submitCommand, switchClient } from "./actions";

export const NAV: [string, string, string][] = [
  ["/os", "Agency Overview", "core"], ["/os/clients", "Client Management", "core"], ["/os/knowledge", "Client Knowledge Centre", "core"],
  ["/os/agents", "AI Agent Command Centre", "agents"], ["/os/tasks", "Task Management", "agents"],
  ["/os/research", "Research & Audit", "work"], ["/os/strategy", "Marketing Strategy", "work"], ["/os/calendar", "Content Calendar", "work"], ["/os/creative", "Creative Studio", "work"], ["/os/campaigns", "Campaign Manager", "work"],
  ["/os/approvals", "Approval Centre", "control"], ["/os/analytics", "Analytics & Reports", "control"], ["/os/automation", "Automation Centre", "control"], ["/os/integrations", "Integrations", "control"], ["/os/settings", "Settings & Permissions", "control"],
];
const GROUP: Record<string, string> = { core: "Agency", agents: "Agents", work: "Work", control: "Control" };

export function Shell({ clients, activeId, badges, aiMode, children }: { clients: { id: string; name: string }[]; activeId: string | null; badges: Record<string, number>; aiMode: string; children: React.ReactNode }) {
  const path = usePathname(); const [open, setOpen] = useState(false);
  const nav = (
    <nav aria-label="Main" className="space-y-0.5">
      {NAV.map(([href, label, g], i) => (
        <div key={href}>
          {(i === 0 || NAV[i - 1][2] !== g) && <div className="mt-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{GROUP[g]}</div>}
          <Link href={href} onClick={() => setOpen(false)} aria-current={path === href ? "page" : undefined} className={`flex items-center justify-between rounded px-2 py-1.5 text-sm ${path === href ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
            <span>{label}</span>{badges[href] ? <span className="rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-slate-900">{badges[href]}</span> : null}
          </Link>
        </div>
      ))}
    </nav>
  );
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-60 shrink-0 bg-slate-900 p-3 lg:block"><div className="px-2 pb-2 text-base font-bold text-white">Marketing OS</div>{nav}</aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button className="rounded border px-2 py-1 text-sm lg:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
            <form action={switchClient} className="flex items-center gap-1">
              <input type="hidden" name="back" value={path} />
              <label className="sr-only" htmlFor="client">Active client</label>
              <select id="client" name="client" defaultValue={activeId ?? ""} onChange={(e) => e.currentTarget.form?.requestSubmit()} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm font-medium" data-testid="client-switcher">
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </form>
            <form action={submitCommand} className="flex min-w-[240px] flex-1 items-center gap-2" data-testid="command-bar">
              <input type="hidden" name="client" value={activeId ?? ""} />
              <label className="sr-only" htmlFor="instruction">Instruction for the Orchestrator</label>
              <input id="instruction" name="instruction" required minLength={8} maxLength={1000} placeholder="Give one objective, e.g. “Prepare a complete seven-day Instagram growth campaign”" className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm" disabled={!activeId} />
              <button className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40" disabled={!activeId}>Send</button>
            </form>
            <span title="AI mode" className={`rounded px-2 py-1 text-xs font-semibold ${aiMode === "LIVE" ? "bg-green-100 text-green-800" : aiMode === "MOCK" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"}`} data-testid="ai-mode">AI: {aiMode}</span>
          </div>
          {open && <div className="mt-2 rounded bg-slate-900 p-2 lg:hidden">{nav}</div>}
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </div>
    </div>
  );
}
