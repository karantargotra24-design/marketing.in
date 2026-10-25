"use client";

import { useEffect, useState } from "react";

/** Mock persistence: a list kept in this browser only (localStorage). Replaced by the database later. */
export function useMockList<T>(key: string, seed: T[]) {
  const [items, setItems] = useState<T[]>(seed);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      // Loading saved mock data once on mount is the intended use here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, [key]);
  const save = (next: T[]) => {
    setItems(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  };
  return [items, save] as const;
}
