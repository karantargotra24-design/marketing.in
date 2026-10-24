export type SupabaseConfig = { url: string; key: string };

/** Returns null when keys are missing, so the app falls back to clearly-labelled mock data. */
export function getSupabaseConfig(
  env: Record<string, string | undefined> = process.env,
): SupabaseConfig | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (env.APP_MODE !== "real" || !url || !key) return null;
  return { url, key };
}
