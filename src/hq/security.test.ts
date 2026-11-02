import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { decideAccess, type AccessInput } from "./access";

const base: AccessInput = { supabaseConfigured: true, production: true, allowOpen: false, signedIn: true, role: "owner" };

describe("HQ access policy (fail closed)", () => {
  it("allows staff when signed in", () => {
    expect(decideAccess({ ...base, role: "owner" })).toMatchObject({ allow: true, mode: "staff" });
    expect(decideAccess({ ...base, role: "member" })).toMatchObject({ allow: true });
  });
  it("sends anonymous users to login", () => expect(decideAccess({ ...base, signedIn: false, role: null })).toEqual({ allow: false, reason: "login" }));
  it("blocks client-role logins and users with no agency profile", () => {
    expect(decideAccess({ ...base, role: "client" })).toEqual({ allow: false, reason: "forbidden" });
    expect(decideAccess({ ...base, role: null })).toEqual({ allow: false, reason: "forbidden" });
  });
  it("is LOCKED in production when auth is not configured", () => {
    expect(decideAccess({ ...base, supabaseConfigured: false })).toEqual({ allow: false, reason: "locked" });
  });
  it("is open only for local dev, or when explicitly overridden", () => {
    expect(decideAccess({ ...base, supabaseConfigured: false, production: false })).toMatchObject({ allow: true, mode: "local-open" });
    expect(decideAccess({ ...base, supabaseConfigured: false, allowOpen: true })).toMatchObject({ allow: true });
  });
});

describe("repository hygiene (runs in CI)", () => {
  const files = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n").filter(Boolean);
  it("does not track client data or env files", () => {
    expect(files.filter((f) => f.startsWith("data/"))).toEqual([]);
    expect(files.filter((f) => /(^|\/)\.env(\.|$)/.test(f) && !f.endsWith(".env.example"))).toEqual([]);
    expect(files.filter((f) => /\.(pem|key|p12)$/.test(f))).toEqual([]);
  });
  it("contains no obvious secrets in tracked text files", () => {
    const patterns: [string, RegExp][] = [
      ["Anthropic key", /sk-ant-[A-Za-z0-9_-]{20,}/], ["AWS key", /AKIA[0-9A-Z]{16}/], ["private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
      ["JWT", /eyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/], ["Razorpay live", /rzp_live_[A-Za-z0-9]{10,}/],
    ];
    const hits: string[] = [];
    for (const f of files.filter((f) => /\.(ts|tsx|md|json|ya?ml|sql|css|mjs)$/.test(f) && f !== "package-lock.json")) {
      const text = readFileSync(f, "utf8");
      for (const [name, re] of patterns) if (re.test(text)) hits.push(`${f}: ${name}`);
    }
    expect(hits).toEqual([]);
  });
  it("keeps real client facts out of source (seed loads from a private file)", () => {
    const seed = readFileSync("src/hq/seed.ts", "utf8");
    expect(seed).not.toMatch(/jamabandi|Akharot|shilajit/i);
  });
});
