import { STATUS_LABEL, listIntegrations } from "@/hq";
import { Badge, Card, Msg, Page, btn2, when } from "../kit";
import { getCtx } from "../ctx";
import { testIntegrationAction } from "../actions";

const tone = { built_in: "blue", awaiting_credentials: "gray", configured_untested: "amber", tested_ok: "green", tested_failed: "red", adapter_not_written: "amber" } as const;
export default async function Integrations({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams; const { store } = await getCtx();
  const list = await listIntegrations(store);
  return (
    <Page title="Integrations" sub="An integration counts as connected only after a live test passes. Everything that can publish, send or spend also needs a human approval each time.">
      <Msg error={sp.error} ok={sp.ok} />
      <div className="grid gap-3 md:grid-cols-2" data-testid="integrations">{list.map((i) => (
        <Card key={i.id} title={i.label} right={<Badge tone={tone[i.status]}>{STATUS_LABEL[i.status]}</Badge>}>
          <p className="text-sm">{i.purpose} {i.writes && <Badge tone="amber">can write: approval-gated</Badge>}</p>
          {i.missingEnv.length > 0 && <p className="mt-1 text-xs text-slate-600">Needs: {i.missingEnv.map((e) => <code key={e} className="mr-1 rounded bg-slate-100 px-1">{e}</code>)}</p>}
          <p className="mt-1 text-xs text-slate-500">{i.howTo}</p>
          {i.last && <p className="mt-1 text-xs">Last test {when(i.last.at)}: {i.last.ok ? "✅" : "❌"} {i.last.detail}</p>}
          {(i.status === "configured_untested" || i.status === "tested_ok" || i.status === "tested_failed") && <form action={testIntegrationAction} className="mt-2"><input type="hidden" name="id" value={i.id} /><button className={btn2}>Run live test</button></form>}
        </Card>))}</div>
    </Page>
  );
}
