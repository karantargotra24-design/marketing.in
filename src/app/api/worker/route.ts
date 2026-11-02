import { timingSafeEqual } from "node:crypto";
import { aiEngineFromEnv, defaultStore, processJobs, tickSchedules } from "@/hq";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Called by a cron (GitHub Actions / Vercel Cron / Supabase pg_cron). Disabled unless HQ_WORKER_SECRET is set. Bearer auth, constant-time compare. */
export async function POST(req: Request) {
  const secret = process.env.HQ_WORKER_SECRET;
  if (!secret || secret.length < 24) return Response.json({ error: "worker disabled: set HQ_WORKER_SECRET (24+ chars)" }, { status: 503 });
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(got), b = Buffer.from(secret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const store = defaultStore();
  let ai; try { ai = aiEngineFromEnv(store); } catch (e) { ai = undefined; await store.log({ clientId: null, actor: "worker", action: "ai.unavailable", detail: e instanceof Error ? e.message.slice(0, 120) : "" }); }
  const t = await tickSchedules(store);
  const r = await processJobs(store, { ai, max: 3 });
  return Response.json({ schedulesStarted: t.started.length, jobsProcessed: r.processed, jobsFailed: r.failed });
}
export const GET = () => Response.json({ error: "use POST" }, { status: 405 });
