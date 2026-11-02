import { cookies } from "next/headers";
import { aiEngineFromEnv, defaultStore, type Client } from "@/hq";
import { requireHuman } from "@/app/hq/guard";

export const CLIENT_COOKIE = "os_client";

/** Every /os page starts here: staff-only, and ONE active client. Pages only ever query that client. */
export async function getCtx() {
  const actor = await requireHuman();
  const store = defaultStore();
  const clients = await store.listClients();
  const wanted = (await cookies()).get(CLIENT_COOKIE)?.value;
  const client: Client | null = clients.find((c) => c.id === wanted) ?? clients[0] ?? null;
  return { actor, store, clients, client };
}
export const aiOrUndefined = (store: ReturnType<typeof defaultStore>) => { try { return aiEngineFromEnv(store); } catch { return undefined; } };
export const aiState = () => { try { return { error: null as string | null }; } catch { return { error: "x" }; } };
