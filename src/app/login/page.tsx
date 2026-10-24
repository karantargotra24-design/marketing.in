import { getSupabaseConfig } from "@/lib/env";
import { signIn } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const connected = getSupabaseConfig() !== null;
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4 py-8">
      <h1 className="text-2xl font-bold">ScapeMedia Agency OS</h1>
      {!connected && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
          MOCK mode: login is not connected. <a className="underline" href="/dashboard">Open the mock dashboard</a>
        </p>
      )}
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <form action={signIn} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">Email
          <input name="email" type="email" required autoComplete="email" className="rounded-lg border border-slate-300 bg-white p-3 text-base" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">Password
          <input name="password" type="password" required minLength={8} autoComplete="current-password" className="rounded-lg border border-slate-300 bg-white p-3 text-base" />
        </label>
        <button disabled={!connected} className="rounded-lg bg-slate-900 p-3 font-semibold text-white disabled:opacity-40">Sign in</button>
      </form>
    </main>
  );
}
