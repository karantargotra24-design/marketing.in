import path from "node:path";
import { HqStore } from "./store";
import { PgStore } from "./pgStore";
import { pgPoolDb } from "./pgDb";
import type { StorePort } from "./port";

export * from "./types";
export { HqStore } from "./store";
export { Orchestrator, WORKFLOWS, RecoverableError, findConflicts } from "./orchestrator";
export { AGENTS, AGENT_LIST } from "./agents/registry";
export { WorkspaceScope } from "./workspace";
export { requestApproval, decideApproval, performExternalAction } from "./approvals";
export { INTEGRATIONS } from "./integrations";
export { seedWorkspaces, onboardClient } from "./seed";

/** Postgres when DATABASE_URL + HQ_AGENCY_ID are set; otherwise local file storage (dev only; refused in production). */
export function defaultStore(): StorePort {
  if (process.env.DATABASE_URL && process.env.HQ_AGENCY_ID) return new PgStore(pgPoolDb(process.env.DATABASE_URL), process.env.HQ_AGENCY_ID);
  if (process.env.NODE_ENV === "production" && process.env.HQ_ALLOW_FILE_STORE !== "1") throw new Error("No database configured: set DATABASE_URL and HQ_AGENCY_ID (file storage is disabled in production)");
  return fileStore();
}
export function fileStore() { return new HqStore(process.env.HQ_DATA_DIR ?? path.join(process.cwd(), "data", "hq")); }
export { aiEngineFromEnv, describeAi } from "./ai/config";
export { summarizeUsage, parallelism } from "./ai/summary";
export { USD_INR } from "./ai/pricing";
export { AiEngine } from "./ai/engine";
export { MockProvider } from "./ai/mock";
export { BudgetGuard, DEFAULT_CAPS } from "./ai/budget";
export * from "./ai/types";
export { PgStore } from "./pgStore";
export { exportAll, importAll } from "./backup";
export { submitInstruction, approvePlan, cancelRun, processJobs, createSchedule, tickSchedules, nextRun, validCadence } from "./ops/runs";
export { buildPlan, planWaves, loadPolicy, DEFAULT_POLICY } from "./ops/planner";
export { parseIntent } from "./ops/intent";
