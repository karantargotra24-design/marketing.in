import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewClient } from "@/services/clientSchema";

/** Client that talks to the "agency" schema. */
export type AgencyDb = SupabaseClient<any, "agency", "agency">; // eslint-disable-line @typescript-eslint/no-explicit-any

export type Profile = { id: string; agency_id: string; full_name: string; role: "owner" | "member" | "client" };
export type ClientRow = { id: string; name: string; industry: string | null; city: string | null; status: string };

export async function getMyProfile(db: AgencyDb, userId: string): Promise<Profile | null> {
  const { data, error } = await db.from("profiles").select("id, agency_id, full_name, role").eq("id", userId).maybeSingle();
  if (error) throw new Error(`Could not load profile: ${error.message}`);
  return data as Profile | null;
}

export async function listClients(db: AgencyDb): Promise<ClientRow[]> {
  const { data, error } = await db.from("clients").select("id, name, industry, city, status").order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load clients: ${error.message}`);
  return (data ?? []) as ClientRow[];
}

export async function insertClient(db: AgencyDb, agencyId: string, input: NewClient): Promise<string> {
  const { data, error } = await db.from("clients").insert({ agency_id: agencyId, ...input }).select("id").single();
  if (error) throw new Error(`Could not add client: ${error.message}`);
  return data.id as string;
}

export async function writeAudit(
  db: AgencyDb,
  entry: { agencyId: string; userId: string; action: string; entity: string; entityId?: string; details?: Record<string, unknown> },
) {
  const { error } = await db.from("audit_logs").insert({
    agency_id: entry.agencyId,
    actor_type: "user",
    actor_user_id: entry.userId,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId ?? null,
    details: entry.details ?? {},
  });
  if (error) throw new Error(`Could not write audit log: ${error.message}`);
}
