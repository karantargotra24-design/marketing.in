import { describe, expect, it } from "vitest";
import { runContentWriter } from "./index";
import type { ContentProvider } from "./schema";

const base = { clientName: "Jammu Motors", industry: "Car dealership", city: "Jammu", platform: "instagram", format: "reel", topic: "Test drive Saturday" };

describe("runContentWriter", () => {
  it("returns a valid mock draft with a script for reels", async () => {
    const r = await runContentWriter(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.isMock).toBe(true);
      expect(r.draft.script?.length).toBeGreaterThan(0);
      expect(r.draft.caption).toContain("Jammu");
      expect(r.draft.qaFlags.length).toBeGreaterThan(0);
    }
  });
  it("rejects a too-short topic", async () => {
    const r = await runContentWriter({ ...base, topic: "ab" });
    expect(r.ok).toBe(false);
  });
  it("turns a malformed AI answer into a safe error", async () => {
    const bad: ContentProvider = { name: "bad", isMock: false, generate: async () => ({ hook: "" }) };
    const r = await runContentWriter(base, bad);
    expect(r.ok).toBe(false);
  });
  it("turns a provider crash into a safe error", async () => {
    const boom: ContentProvider = { name: "boom", isMock: false, generate: async () => { throw new Error("secret-key-123"); } };
    const r = await runContentWriter(base, boom);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).not.toContain("secret");
  });
});
