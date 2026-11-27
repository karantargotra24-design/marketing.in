import type { ReactNode } from "react";

export function InfoNotice({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">{children}</p>;
}

export function ErrorNotice({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
      {children}
    </p>
  );
}
