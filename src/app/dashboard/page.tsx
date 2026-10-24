import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyProfile, listClients, type ClientRow } from "@/db/agency";
import { createSupabaseServer } from "@/db/supabase/server";
import { signOut } from "../login/actions";
import { addClient } from "./actions";

const MOCK_CLIENTS: ClientRow[] = [
  { id: "m1", name: "Jammu Motors (example)", industry: "Car dealership", city: "Jammu", status: "active" },
  { id: "m2", name: "Dogra Sweets (example)", industry: "Food & retail", city: "Jammu", status: "active" },
];

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await createSupabaseServer();

  let clients = MOCK_CLIENTS;
  let canEdit = false;
  let who = "Mock mode";
  if (supabase) {
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;
    if (!userId) redirect("/login");
    const profile = await getMyProfile(supabase, userId);
    if (!profile) {
      return (
        <main className="mx-auto max-w-md px-4 py-10">
          <h1 className="text-xl font-bold">No agency access</h1>
          <p className="mt-2 text-sm">This login is not linked to an agency yet. Ask the agency owner to add you.</p>
          <form action={signOut} className="mt-4"><button className="underline">Sign out</button></form>
        </main>
      );
    }
    clients = await listClients(supabase);
    canEdit = profile.role !== "client";
    who = `${profile.full_name || "Signed in"} · ${profile.role}`;
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">Clients</h1>
          <p className="text-sm text-slate-600">{who}</p>
        </div>
        {supabase && <form action={signOut}><button className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Sign out</button></form>}
      </header>

      <Link href="/content" className="rounded-lg border border-slate-300 bg-white p-3 text-center font-semibold">Open content studio (mock)</Link>

      {!supabase && <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">MOCK data. Nothing is saved or connected.</p>}
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <ul className="flex flex-col gap-2">
        {clients.length === 0 && <li className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">No clients yet. Add your first one below.</li>}
        {clients.map((c) => (
          <li key={c.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <b>{c.name}</b>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">{c.status}</span>
            </div>
            <p className="text-sm text-slate-600">{[c.industry, c.city].filter(Boolean).join(" · ") || "No details yet"}</p>
          </li>
        ))}
      </ul>

      {canEdit && (
        <form action={addClient} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <h2 className="font-semibold">Add client</h2>
          <input name="name" required maxLength={120} placeholder="Client name" aria-label="Client name" className="rounded-lg border border-slate-300 p-3 text-base" />
          <input name="industry" maxLength={80} placeholder="Industry (optional)" aria-label="Industry" className="rounded-lg border border-slate-300 p-3 text-base" />
          <input name="city" maxLength={80} placeholder="City (optional)" aria-label="City" className="rounded-lg border border-slate-300 p-3 text-base" />
          <button className="rounded-lg bg-slate-900 p-3 font-semibold text-white">Add client</button>
        </form>
      )}
    </main>
  );
}
