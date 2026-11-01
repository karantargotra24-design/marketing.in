import path from "node:path";
import { HqStore } from "./store";

export * from "./types";
export { HqStore } from "./store";
export { Orchestrator, WORKFLOWS, RecoverableError, findConflicts } from "./orchestrator";
export { AGENTS, AGENT_LIST } from "./agents/registry";
export { WorkspaceScope } from "./workspace";
export { requestApproval, decideApproval, performExternalAction } from "./approvals";
export { INTEGRATIONS } from "./integrations";
export { seedWorkspaces, onboardClient } from "./seed";

/** Data lives in <repo>/data/hq (override with HQ_DATA_DIR). File storage works locally and in cloud dev; Vercel needs the Supabase adapter (not built). */
export function defaultStore() { return new HqStore(process.env.HQ_DATA_DIR ?? path.join(process.cwd(), "data", "hq")); }
export { anthropicProvider, providerFromEnv } from "./provider";
