"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { insertClient, getMyProfile, writeAudit } from "@/db/agency";
import { createSupabaseServer } from "@/db/supabase/server";
import { newClientSchema } from "@/services/clientSchema";

export async function addClient(formData: FormData) {
  const parsed = newClientSchema.safeParse({
    name: formData.get("name") ?? "",
    industry: formData.get("industry") ?? "",
    city: formData.get("city") ?? "",
  });
  if (!parsed.success) redirect(`/dashboard?error=${encodeURIComponent(parsed.error.issues[0].message)}`);

  const supabase = await createSupabaseServer();
  if (!supabase) redirect("/dashboard?error=Not+connected+yet");
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");

  const profile = await getMyProfile(supabase, userId);
  if (!profile || profile.role === "client") redirect("/dashboard?error=You+do+not+have+permission+to+add+clients");

  const id = await insertClient(supabase, profile.agency_id, parsed.data);
  await writeAudit(supabase, { agencyId: profile.agency_id, userId, action: "client.create", entity: "client", entityId: id, details: { name: parsed.data.name } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
