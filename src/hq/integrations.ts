/**
 * Honest integration registry. Nothing here is "operational" until a live test passes from inside the app.
 * Several connectors are available to the Claude chat session via MCP, but the HQ app itself has no credentials
 * and makes no external calls. Statuses are therefore conservative.
 */
export type IntegrationStatus = "NOT_CONFIGURED" | "CLAUDE_SESSION_ONLY" | "CONNECTED_AND_TESTED";
export type Integration = { id: string; purpose: string; status: IntegrationStatus; writes: boolean; note: string };

export const INTEGRATIONS: Integration[] = [
  { id: "ai_provider", purpose: "LLM for live research and copy (Anthropic API)", status: "NOT_CONFIGURED", writes: false, note: "Adapter written (provider.ts), tested only against a mocked API. Enable with HQ_AI=on + ANTHROPIC_API_KEY; capped by HQ_AI_MAX_CALLS. Not live-tested." },
  { id: "meta_ads", purpose: "Meta Ads reporting / campaign changes", status: "CLAUDE_SESSION_ONLY", writes: true, note: "Windsor.ai / Supermetrics connectors exist in the Claude session; account linking unverified. Writes need approval." },
  { id: "google_ads", purpose: "Google Ads reporting", status: "CLAUDE_SESSION_ONLY", writes: true, note: "Via Windsor.ai in Claude session; not wired to app." },
  { id: "instagram_publish", purpose: "Instagram insights/publishing", status: "CLAUDE_SESSION_ONLY", writes: true, note: "Windsor/Metricool listed; @karantargotra.a link unconfirmed. Publishing is approval-gated." },
  { id: "whatsapp", purpose: "WhatsApp Business messaging", status: "NOT_CONFIGURED", writes: true, note: "Paid, approval-based API. Drafts only." },
  { id: "google_drive_sheets", purpose: "Drive/Sheets read & export", status: "CLAUDE_SESSION_ONLY", writes: true, note: "Used in this build to search Drive (no Pahadi/Propedia files found)." },
  { id: "crm", purpose: "HubSpot / CRM sync", status: "CLAUDE_SESSION_ONLY", writes: true, note: "HubSpot connector exists in session; not wired." },
  { id: "image_video_gen", purpose: "Canva / Higgsfield / ElevenLabs generation", status: "CLAUDE_SESSION_ONLY", writes: true, note: "Spends credits: needs approval each time." },
  { id: "email", purpose: "Gmail drafts/sending", status: "CLAUDE_SESSION_ONLY", writes: true, note: "Gmail reported as needing reconnect." },
];

export const isOperational = (id: string) => INTEGRATIONS.find((i) => i.id === id)?.status === "CONNECTED_AND_TESTED";
