export type AccessInput = { supabaseConfigured: boolean; production: boolean; allowOpen: boolean; signedIn: boolean; role: "owner" | "member" | "client" | null };
export type AccessDecision = { allow: true; mode: "staff" | "local-open" } | { allow: false; reason: "locked" | "login" | "forbidden" };

/**
 * Pure access policy for HQ (dashboard + server actions).
 *  - Supabase configured: must be signed in AND hold a staff role (owner/member). Client-role logins never reach HQ.
 *  - Supabase not configured: open only outside production (local dev), or when HQ_ALLOW_OPEN=1 is set deliberately.
 *    In production it FAILS CLOSED.
 */
export function decideAccess(i: AccessInput): AccessDecision {
  if (!i.supabaseConfigured) {
    if (!i.production || i.allowOpen) return { allow: true, mode: "local-open" };
    return { allow: false, reason: "locked" };
  }
  if (!i.signedIn) return { allow: false, reason: "login" };
  if (i.role === "owner" || i.role === "member") return { allow: true, mode: "staff" };
  return { allow: false, reason: "forbidden" };
}
