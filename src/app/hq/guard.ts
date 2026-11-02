import { redirect } from "next/navigation";
import { getMyProfile } from "@/db/agency";
import { createSupabaseServer } from "@/db/supabase/server";
import { decideAccess } from "@/hq/access";

/** Single entry point for HQ pages and server actions. Returns the human actor id used for approvals. */
export async function requireHuman(): Promise<string> {
  const supabase = await createSupabaseServer();
  const production = process.env.NODE_ENV === "production";
  const allowOpen = process.env.HQ_ALLOW_OPEN === "1";
  if (!supabase) {
    const d = decideAccess({ supabaseConfigured: false, production, allowOpen, signedIn: false, role: null });
    if (!d.allow) redirect("/hq/locked");
    return "human:karan-local";
  }
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as { sub?: string; email?: string } | undefined;
  const profile = claims?.sub ? await getMyProfile(supabase, claims.sub) : null;
  const d = decideAccess({ supabaseConfigured: true, production, allowOpen, signedIn: Boolean(claims?.sub), role: profile?.role ?? null });
  if (!d.allow) redirect(d.reason === "login" ? "/login" : "/hq/locked");
  return `human:${claims?.email ?? claims!.sub}`;
}
