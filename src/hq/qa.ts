import { sections } from "./render";

export type QaIssue = { severity: "blocker" | "warn"; rule: string; detail: string };
export type QaResult = { doc: string; pass: boolean; score: number; issues: QaIssue[] };

/** Never allowed in any client's agent-authored prose (Part 11: no fabricated results / guaranteed claims). */
export const GLOBAL_BANNED = ["guaranteed returns", "guaranteed appreciation", "100% legal", "100% guaranteed", "best deal in", "golden opportunity"];

const REQUIRED = ["Summary", "Findings", "Missing information", "Recommendations"];
const NUM_RE = /(?:₹\s?[\d,]+(?:\.\d+)?(?:\s?(?:lakh|crore|k))?|\b\d+(?:\.\d+)?\s?%|\b\d+(?:\.\d+)?x\b|\bROAS\s?[:=]?\s?\d+(?:\.\d+)?)/gi;

function norm(s: string) { return s.toLowerCase().replace(/[,\s]/g, ""); }

/**
 * Rule-based QA. `corpus` = all of the client's own fact values + sources (the only place a number may come from).
 * Findings are verbatim fact echoes (already sourced); agent-authored prose (Summary, Recommendations, Handoffs) is held to the strict rules.
 */
export function qaReview(input: { doc: string; markdown: string; clientName: string; corpus: string; doNotSay: string[]; otherClientNames: string[]; isConsolidated?: boolean }): QaResult {
  const issues: QaIssue[] = [];
  const sec = sections(input.markdown);
  const required = input.isConsolidated ? ["Executive summary", "Missing information", "Limitations"] : REQUIRED;
  for (const r of required) if (!(r in sec)) issues.push({ severity: "blocker", rule: "structure", detail: `Missing section "${r}"` });

  // Isolation: any other workspace's name inside this document is a leak.
  for (const other of input.otherClientNames) {
    if (new RegExp(`\\b${other.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(input.markdown)) issues.push({ severity: "blocker", rule: "client-isolation", detail: `Mentions another workspace: "${other}"` });
  }

  const prose = [sec["Summary"], sec["Executive summary"], sec["Recommendations"], sec["Handoffs"]].filter(Boolean).join("\n");
  const banned = [...GLOBAL_BANNED, ...input.doNotSay.filter((p) => p.length > 3)];
  for (const b of banned) if (prose.toLowerCase().includes(b.toLowerCase())) issues.push({ severity: "blocker", rule: "banned-claim", detail: `Agent prose contains banned phrase "${b}"` });

  // Fabricated statistics: percent/₹/x/ROAS figures in agent prose must exist in the client's own data or be marked "Computed:".
  const corpus = norm(input.corpus);
  const proseNoComputed = prose.split("\n").filter((l) => !/^\s*(-\s*)?Computed:/i.test(l)).join("\n");
  for (const m of proseNoComputed.matchAll(NUM_RE)) if (!corpus.includes(norm(m[0]))) issues.push({ severity: "blocker", rule: "unsourced-number", detail: `Number "${m[0]}" is not in client data and not marked Computed` });

  // Findings must carry a status label and a source.
  for (const line of (sec["Findings"] ?? "").split("\n").filter((l) => l.startsWith("- "))) {
    if (!/^- \[(VERIFIED|CLIENT-PROVIDED|RESEARCHED|INFERRED|ASSUMPTION|NEEDS VERIFICATION)\]/.test(line)) issues.push({ severity: "blocker", rule: "status-label", detail: `Finding without status label: ${line.slice(0, 60)}` });
    if (!/source:\s*\S+/.test(line)) issues.push({ severity: "blocker", rule: "source", detail: `Finding without source: ${line.slice(0, 60)}` });
  }

  if (/insufficient data|no data/i.test(sec["Summary"] ?? "") && /\b(will increase|will grow|expected to)\b/i.test(sec["Recommendations"] ?? "")) issues.push({ severity: "warn", rule: "overreach", detail: "Predictive language despite insufficient data" });

  const score = Math.max(0, 100 - issues.filter((i) => i.severity === "blocker").length * 25 - issues.filter((i) => i.severity === "warn").length * 5);
  return { doc: input.doc, pass: !issues.some((i) => i.severity === "blocker") && score >= 70, score, issues };
}

export function renderQaReport(clientName: string, results: QaResult[]): string {
  const L = [`# QA report — ${clientName}`, "", "## Summary", "", `Computed: ${results.filter((r) => r.pass).length} of ${results.length} document(s) passed QA.`, "", "## Results", ""];
  for (const r of results) {
    L.push(`### ${r.doc} — ${r.pass ? "PASS" : "REVISION REQUESTED"} (score ${r.score})`);
    L.push(...(r.issues.length ? r.issues.map((i) => `- ${i.severity.toUpperCase()} · ${i.rule}: ${i.detail}`) : ["- No issues."]), "");
  }
  return L.join("\n");
}
