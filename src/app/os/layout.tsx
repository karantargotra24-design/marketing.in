import type { Metadata } from "next";
import { describeAi } from "@/hq";
import { getCtx } from "./ctx";
import { Shell } from "./Shell";

export const metadata: Metadata = { title: "Marketing OS" };
export const dynamic = "force-dynamic";

export default async function OsLayout({ children }: { children: React.ReactNode }) {
  const { store, clients, client } = await getCtx();
  const badges: Record<string, number> = {};
  if (client) {
    const [appr, ds, runs] = await Promise.all([store.listApprovals(client.id), store.listDeliverables({ clientId: client.id }), store.listRuns({ clientId: client.id })]);
    badges["/os/approvals"] = appr.filter((a) => a.status === "PENDING").length + ds.filter((d) => d.status === "in_review" && d.kind === "campaign_package").length + runs.filter((r) => r.status === "AWAITING_PLAN_APPROVAL").length;
    badges["/os/calendar"] = ds.filter((d) => d.kind === "content_item" && d.status === "in_review").length;
  }
  return <Shell clients={clients.map((c) => ({ id: c.id, name: c.name }))} activeId={client?.id ?? null} badges={badges} aiMode={describeAi().mode}>{children}</Shell>;
}
