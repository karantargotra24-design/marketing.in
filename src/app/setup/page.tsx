import Link from "next/link";
import { getAppMode } from "@/lib/appMode";

export default function Home() {
  const mode = getAppMode();
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4 py-8">
      <h1 className="text-2xl font-bold">ScapeMedia Agency OS</h1>
      <p className="text-lg">Setup OK ✅</p>
      <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
        Mode: <strong>{mode.toUpperCase()}</strong>.{" "}
        {mode === "mock"
          ? "Nothing is connected yet. All data is fake."
          : "Real mode is on. Connections are configured in the server environment."}
      </p>
      <Link href="/dashboard" className="rounded-lg bg-slate-900 p-3 text-center font-semibold text-white">
        Open dashboard
      </Link>
    </main>
  );
}
