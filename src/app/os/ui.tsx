"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-reads server data every 2s while work is running, so progress shown is the real stored state. */
export function AutoRefresh({ active }: { active: boolean }) {
  const r = useRouter();
  useEffect(() => { if (!active) return; const t = setInterval(() => r.refresh(), 2000); return () => clearInterval(t); }, [active, r]);
  return active ? <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700" data-testid="live">● live</span> : null;
}
