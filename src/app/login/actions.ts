"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/db/supabase/server";
import { loginSchema } from "@/services/clientSchema";

export async function signIn(formData: FormData) {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0].message)}`);

  const supabase = await createSupabaseServer();
  if (!supabase) redirect("/login?error=Login+is+not+connected+yet");

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect("/login?error=Wrong+email+or+password");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase?.auth.signOut();
  redirect("/login");
}
