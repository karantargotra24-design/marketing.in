import type { AgentOutput } from "./types";

export function renderAgentOutput(o: AgentOutput, meta: { clientId: string; clientName: string; taskId: string; agent: string; at: string }): string {
  const L: string[] = [];
  L.push(`# ${o.title} — ${meta.clientName}`, "");
  L.push(`Client ID: ${meta.clientId} · Task: ${meta.taskId} · Agent: ${meta.agent} · Generated: ${meta.at}`, "");
  if (o.meta) L.push(`Produced by: ${o.meta.mode === "ai" ? `AI (${o.meta.provider} · ${o.meta.model} · ${o.meta.calls} call(s))` : o.meta.mode === "rules-fallback" ? "RULES (AI output failed validation)" : "RULES (no AI call)"}${o.meta.note ? ` — ${o.meta.note}` : ""}`, "");
  L.push("## Summary", "", o.summary, "");
  L.push("## Findings", "");
  if (o.findings.length === 0) L.push("_No findings: no stored facts for this area._");
  for (const f of o.findings) L.push(`- [${f.status}] ${f.text} — source: ${f.sources.join("; ")}`);
  L.push("", "## Missing information", "");
  if (o.missingInfo.length === 0) L.push("_None identified._");
  for (const m of o.missingInfo) L.push(`- ${m}`);
  L.push("", "## Recommendations", "");
  if (o.recommendations.length === 0) L.push("_None._");
  for (const r of o.recommendations) L.push(`- ${r}`);
  if (o.handoffs.length) { L.push("", "## Handoffs", ""); for (const h of o.handoffs) L.push(`- → ${h.toAgent}: ${h.note}`); }
  L.push("");
  return L.join("\n");
}

/** Splits a rendered output into its named sections (used by QA to separate fact echoes from agent prose). */
export function sections(md: string): Record<string, string> {
  const out: Record<string, string> = {};
  const parts = md.split(/^## /m);
  for (const p of parts.slice(1)) { const nl = p.indexOf("\n"); out[p.slice(0, nl).trim()] = p.slice(nl + 1); }
  return out;
}
