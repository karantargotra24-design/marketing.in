import { spawn, type ChildProcess } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { SAMPLE_CLIENTS } from "../../src/hq/fixtures";

export const OPEN_PORT = 3111, LOCKED_PORT = 3112;
const procs: ChildProcess[] = [];

async function waitFor(url: string, ms = 60_000) {
  const end = Date.now() + ms;
  while (Date.now() < end) { try { const r = await fetch(url, { redirect: "manual" }); if (r.status < 500) return; } catch { /* not up yet */ } await new Promise((r) => setTimeout(r, 400)); }
  throw new Error(`server at ${url} did not start`);
}

async function start(port: number, env: Record<string, string>) {
  const busy = await fetch(`http://localhost:${port}/`, { redirect: "manual" }).then(() => true, () => false);
  if (busy) throw new Error(`Port ${port} is already in use (a stale server would give misleading e2e results). Stop it and retry.`);
  // detached => own process group, so teardown can kill npx AND the next-server it spawns
  procs.push(spawn("npx", ["next", "start", "-p", String(port)], { env: { ...process.env, NODE_ENV: "production", ...env }, stdio: "ignore", detached: true }));
}

/** Starts the PRODUCTION build twice: (1) opened deliberately with synthetic data + mock AI, (2) with no overrides to prove fail-closed. Needs `npm run build` first. */
export default async function setup() {
  const dir = mkdtempSync(path.join(tmpdir(), "hq-e2e-"));
  const seed = path.join(dir, "seed.json");
  writeFileSync(seed, JSON.stringify(SAMPLE_CLIENTS));
  const noSecrets = { NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "", DATABASE_URL: "", ANTHROPIC_API_KEY: "" };
  await start(OPEN_PORT, { ...noSecrets, HQ_DATA_DIR: path.join(dir, "data"), HQ_SEED_FILE: seed, HQ_ALLOW_OPEN: "1", HQ_ALLOW_FILE_STORE: "1", HQ_AI: "mock", HQ_MOCK_LATENCY_MS: "400" });
  await start(LOCKED_PORT, { ...noSecrets, HQ_DATA_DIR: path.join(dir, "locked-data"), HQ_AI: "off" });
  await Promise.all([waitFor(`http://localhost:${OPEN_PORT}/hq/locked`), waitFor(`http://localhost:${LOCKED_PORT}/hq/locked`)]);
  return async () => { for (const p of procs) { try { process.kill(-p.pid!, "SIGTERM"); } catch { /* already gone */ } } };
}
