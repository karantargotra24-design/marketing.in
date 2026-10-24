import { describe, expect, it } from "vitest";
import { getSupabaseConfig } from "./env";

describe("getSupabaseConfig", () => {
  it("is null in mock mode even if keys exist", () => {
    expect(getSupabaseConfig({ APP_MODE: "mock", NEXT_PUBLIC_SUPABASE_URL: "u", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "k" })).toBeNull();
  });
  it("is null when a key is missing", () => {
    expect(getSupabaseConfig({ APP_MODE: "real", NEXT_PUBLIC_SUPABASE_URL: "u" })).toBeNull();
  });
  it("returns config in real mode with keys", () => {
    expect(getSupabaseConfig({ APP_MODE: "real", NEXT_PUBLIC_SUPABASE_URL: "u", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "k" })).toEqual({ url: "u", key: "k" });
  });
});
