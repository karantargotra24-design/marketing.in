import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/db/supabase/server";

/** In real mode the Supabase session is required; in mock/local mode HQ is open on localhost only. Returns the human actor id used for approvals. */
export async function requireHuman(): Promise<string> {
  const supabase = await createSupabaseServer();
  if (!supabase) return "human:karan-local";
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/login");
  return `human:${(claims as { email?: string }).email ?? claims.sub}`;
}
