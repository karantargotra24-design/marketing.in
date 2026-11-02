import { z } from "zod";

/** Provenance label for every stored fact (Part 7). */
export const factStatuses = ["VERIFIED", "CLIENT-PROVIDED", "RESEARCHED", "INFERRED", "ASSUMPTION", "NEEDS VERIFICATION"] as const;
export type FactStatus = (typeof factStatuses)[number];

/** The ten knowledge bases every client workspace has (Part 7). */
export const knowledgeBases = [
  "business", "brand", "audience", "competitor", "content",
  "strategy", "campaigns", "performance", "assets", "requirements",
] as const;
export type KnowledgeBase = (typeof knowledgeBases)[number];

export const clientKinds = ["client", "personal_brand"] as const;

export const clientIdSchema = z.string().regex(/^[a-z0-9][a-z0-9_-]{1,40}$/, "client id must be lowercase letters, digits, - or _");

export const clientSchema = z.object({
  id: clientIdSchema,
  name: z.string().trim().min(1).max(120),
  kind: z.enum(clientKinds),
  createdAt: z.string(),
  /** Phrases agents must never write for this client (brand rules). */
  doNotSay: z.array(z.string()).default([]),
  /** Names of OTHER workspaces; used by QA to detect cross-client leakage. Filled by registry. */
  agentPermissions: z.array(z.string()).default([]),
});
export type Client = z.infer<typeof clientSchema>;

export const factSchema = z.object({
  id: z.string(),
  clientId: clientIdSchema,
  kb: z.enum(knowledgeBases),
  key: z.string().min(1),
  value: z.string().min(1),
  status: z.enum(factStatuses),
  /** Where this came from: artifact slug, URL, "user-brief", etc. Required: no unsourced facts. */
  source: z.string().min(1),
  version: z.number().int().min(1),
  supersededBy: z.string().nullable().default(null),
  createdAt: z.string(),
});
export type Fact = z.infer<typeof factSchema>;

export const taskStatuses = [
  "PENDING", "IN PROGRESS", "WAITING FOR INPUT", "WAITING FOR APPROVAL", "UNDER REVIEW", "COMPLETED", "FAILED",
] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export const agentIds = [
  "research", "audit_strategy", "social", "content", "creative", "video",
  "paid_ads", "seo_web", "lead_crm", "analytics", "client_ops", "qa",
] as const;
export type AgentId = (typeof agentIds)[number];

export const taskAgents = [...agentIds, "orchestrator"] as const;
export const taskSteps = ["agent", "consolidate", "qa", "deliver", "ops"] as const;

export const taskSchema = z.object({
  id: z.string(),
  clientId: clientIdSchema,
  runId: z.string(),
  description: z.string(),
  agent: z.enum(taskAgents),
  step: z.enum(taskSteps).default("agent"),
  allowPartial: z.boolean().default(false),
  priority: z.enum(["high", "normal", "low"]).default("normal"),
  status: z.enum(taskStatuses),
  dependsOn: z.array(z.string()).default([]),
  startedAt: z.string().nullable().default(null),
  completedAt: z.string().nullable().default(null),
  outputPath: z.string().nullable().default(null),
  reviewStatus: z.enum(["NOT_REVIEWED", "APPROVED", "REVISION_REQUESTED"]).default("NOT_REVIEWED"),
  attempts: z.number().int().default(0),
  error: z.string().nullable().default(null),
  /** Production step type (research, strategy, content_calendar, ...). null = legacy analyzer task. */
  kind: z.string().nullable().default(null),
  params: z.record(z.string(), z.unknown()).nullable().default(null),
  createdAt: z.string(),
});
export type Task = z.infer<typeof taskSchema>;

export const approvalSchema = z.object({
  id: z.string(),
  clientId: clientIdSchema,
  kind: z.enum(["publish_post", "launch_ad", "spend_money", "send_client_message", "modify_production", "other"]),
  summary: z.string(),
  requestedBy: z.string(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  decidedAt: z.string().nullable().default(null),
  decidedBy: z.string().nullable().default(null),
  /** What the approval is about, e.g. "deliverable:<id>" or "run:<id>". */
  ref: z.string().nullable().default(null),
  executedAt: z.string().nullable().default(null),
  createdAt: z.string(),
});
export type Approval = z.infer<typeof approvalSchema>;

export type LogEntry = { at: string; clientId: string | null; actor: string; action: string; detail: string };

/** What an agent returns. Saved as markdown in the client's workspace. */
export type AgentOutput = {
  title: string;
  summary: string;
  /** Findings grounded in stored facts. Each carries the fact ids / sources it relies on. */
  findings: { text: string; sources: string[]; status: FactStatus }[];
  /** Information the agent needed but the workspace does not have. */
  missingInfo: string[];
  recommendations: string[];
  /** Messages for dependent agents (Part 10 step 9). */
  handoffs: { toAgent: AgentId; note: string }[];
  /** True when the agent could not do its job for lack of data. Never faked as success. */
  insufficientData: boolean;
  /** How this output was produced. Never omitted for AI-capable runs, so the UI can never mislabel rule-based output as AI. */
  meta?: { mode: "rules" | "ai" | "rules-fallback"; provider?: string; model?: string; calls?: number; inputTokens?: number; outputTokens?: number; costUsd?: number; note?: string; droppedFindings?: number };
};

export type ExecutionRecord = {
  id: string; taskId: string; runId: string; clientId: string; agent: string; attempt: number;
  startedAt: string; endedAt: string; outcome: "ok" | "failed" | "retrying" | "waiting_approval";
  mode: string | null; model: string | null; calls: number; inputTokens: number; outputTokens: number; costUsd: number; error: string | null;
};

// ---------- runs, deliverables, jobs, schedules ----------
export const runStatuses = ["PLANNED", "AWAITING_PLAN_APPROVAL", "QUEUED", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"] as const;
export type RunStatus = (typeof runStatuses)[number];
export type PlanTask = { key: string; kind: string; agent: string; title: string; dependsOn: string[]; estCostUsd: number };
export type Plan = { objective: string; days: number; platform: "instagram" | "facebook" | "youtube"; summary: string; language: "english" | "hindi" | "hinglish"; tasks: PlanTask[]; missingInfo: string[]; assumptions: string[]; highImpact: boolean; estCostUsd: number; needsPlanApproval: boolean; reason: string };
export type Run = { id: string; clientId: string; instruction: string; objective: string; status: RunStatus; plan: Plan; estCostUsd: number; autoApproved: boolean; createdBy: string; scheduleId: string | null; createdAt: string; startedAt: string | null; completedAt: string | null };

export const deliverableStatuses = ["draft", "in_review", "approved", "changes_requested", "rejected"] as const;
export type DeliverableStatus = (typeof deliverableStatuses)[number];
export type QaIssueRec = { severity: "blocker" | "warn"; rule: string; detail: string };
export type Deliverable = { id: string; clientId: string; runId: string | null; taskId: string | null; kind: string; title: string; agent: string; status: DeliverableStatus; currentVersion: number; qa: { pass: boolean; issues: QaIssueRec[] } | null; createdAt: string; updatedAt: string };
export type DeliverableVersion = { deliverableId: string; version: number; body: unknown; note: string; createdBy: string; createdAt: string };

export type Job = { id: string; kind: "run"; runId: string; status: "queued" | "leased" | "done" | "failed"; runAfter: string; attempts: number; leaseUntil: string | null; error: string | null };
export type Schedule = { id: string; clientId: string; name: string; instruction: string; cadence: string; enabled: boolean; nextRunAt: string; lastRunAt: string | null; lastRunId: string | null; createdAt: string };
