import type { Deliverable } from "@/hq";
import { decideDeliverableAction } from "./actions";
import { Badge, btn, btn2, inp, statusTone } from "./kit";

/** Approve / request changes / reject. Approve is disabled while QA has blocking issues (same rule the server enforces). */
export function DecisionForm({ d, back, compact }: { d: Deliverable; back: string; compact?: boolean }) {
  const blocked = Boolean(d.qa && !d.qa.pass);
  return (
    <form action={decideDeliverableAction} className="space-y-2" data-testid={`decision-${d.id}`}>
      <input type="hidden" name="client" value={d.clientId} /><input type="hidden" name="id" value={d.id} /><input type="hidden" name="back" value={back} />
      {!compact && <textarea name="note" rows={2} placeholder="What should change? (needed for “Request changes”)" className={inp} />}
      <div className="flex flex-wrap items-center gap-2">
        <button name="decision" value="approve" className={btn} disabled={blocked || d.status === "approved"} title={blocked ? "QA found blocking issues" : undefined}>Approve</button>
        <button name="decision" value="request_changes" className={btn2}>Request changes</button>
        <button name="decision" value="reject" className={btn2}>Reject</button>
        <Badge tone={statusTone(d.status)}>{d.status.replace("_", " ")}</Badge>
      </div>
      {blocked && <p className="text-xs text-amber-700">Approve is disabled: QA found blocking issues. Request changes and the authoring agent will revise it.</p>}
    </form>
  );
}
export function QaList({ d }: { d: Deliverable }) {
  if (!d.qa) return <p className="text-xs text-slate-500">Not yet checked by QA.</p>;
  return <ul className="space-y-0.5 text-xs" data-testid="qa-list">{d.qa.issues.length === 0 && <li>✅ No issues found</li>}{d.qa.issues.map((i, k) => <li key={k} className={i.severity === "blocker" ? "text-red-700" : "text-amber-700"}>{i.severity === "blocker" ? "❌" : "⚠️"} {i.detail}</li>)}</ul>;
}
