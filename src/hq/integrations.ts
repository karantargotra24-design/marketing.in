import type { StorePort } from "./port";

/**
 * Integration registry. A platform is "Tested OK" only after a recorded live test passed. Env credentials make it
 * "Configured, not tested" at best. Writes (publish, ad launch, spend, messages) additionally require an approval.
 */
export type IntegrationDef = { id: string; label: string; purpose: string; writes: boolean; requiredEnv: string[]; howTo: string; test?: (env: Env, f: typeof fetch) => Promise<{ ok: boolean; detail: string }> };
type Env = Record<string, string | undefined>;
export type IntegrationStatus = "built_in" | "awaiting_credentials" | "configured_untested" | "tested_ok" | "tested_failed" | "adapter_not_written";
export type TestRecord = { ok: boolean; detail: string; at: string };

const get = async (url: string, f: typeof fetch, init?: RequestInit) => { const r = await f(url, init); return { r, j: (await r.json().catch(() => ({}))) as Record<string, unknown> }; };
const G = "https://graph.facebook.com/v21.0";

export const INTEGRATION_DEFS: IntegrationDef[] = [
  { id: "ai_provider", label: "AI model provider (Anthropic)", purpose: "Real agent reasoning and content", writes: false, requiredEnv: ["ANTHROPIC_API_KEY"], howTo: "Create an API key in the Anthropic Console; set ANTHROPIC_API_KEY, HQ_AI=live and HQ_AI_SPEND_APPROVED=1 only after approving the budget.",
    test: async (e, f) => { const { r } = await get("https://api.anthropic.com/v1/models", f, { headers: { "x-api-key": e.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" } }); return { ok: r.ok, detail: r.ok ? "Key accepted (models list reachable; no tokens spent)" : `HTTP ${r.status}` }; } },
  { id: "web_fetch", label: "Web page fetch (research)", purpose: "Read public web pages for audits (SSRF-guarded)", writes: false, requiredEnv: [], howTo: "Built in. No account needed." },
  { id: "web_search", label: "Web search (Brave Search API)", purpose: "Competitor and market research with cited sources", writes: false, requiredEnv: ["BRAVE_SEARCH_API_KEY"], howTo: "Get a Brave Search API key (has a free tier) and set BRAVE_SEARCH_API_KEY.",
    test: async (e, f) => { const { r } = await get("https://api.search.brave.com/res/v1/web/search?q=test&count=1", f, { headers: { accept: "application/json", "x-subscription-token": e.BRAVE_SEARCH_API_KEY! } }); return { ok: r.ok, detail: r.ok ? "Search works" : `HTTP ${r.status}` }; } },
  { id: "instagram_graph", label: "Instagram (Graph API, read insights)", purpose: "Profile, posts, reach and engagement for analytics", writes: true, requiredEnv: ["META_ACCESS_TOKEN", "IG_USER_ID"], howTo: "Instagram Business/Creator account linked to a Facebook Page; a Meta app with instagram_basic + instagram_manage_insights; long-lived token. Publishing needs instagram_content_publish and app review, and is approval-gated.",
    test: async (e, f) => { const { r, j } = await get(`${G}/${e.IG_USER_ID}?fields=username&access_token=${e.META_ACCESS_TOKEN}`, f); return { ok: r.ok && typeof j.username === "string", detail: r.ok ? `Connected as @${String(j.username)}` : `HTTP ${r.status}` }; } },
  { id: "meta_ads", label: "Meta Ads (Marketing API)", purpose: "Ad account reporting; campaign changes only with approval", writes: true, requiredEnv: ["META_ACCESS_TOKEN", "META_AD_ACCOUNT_ID"], howTo: "Meta app with ads_read (reporting). ads_management is needed for launches and is approval-gated. META_AD_ACCOUNT_ID like act_123.",
    test: async (e, f) => { const { r, j } = await get(`${G}/${e.META_AD_ACCOUNT_ID}?fields=name,account_status&access_token=${e.META_ACCESS_TOKEN}`, f); return { ok: r.ok && typeof j.name === "string", detail: r.ok ? `Ad account "${String(j.name)}" readable` : `HTTP ${r.status}` }; } },
  { id: "whatsapp", label: "WhatsApp Business (Cloud API)", purpose: "Client/lead messaging: drafts only until approved", writes: true, requiredEnv: ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID"], howTo: "WhatsApp Business Platform app, verified business, approved templates. Sending is approval-gated.",
    test: async (e, f) => { const { r } = await get(`${G}/${e.WHATSAPP_PHONE_ID}?access_token=${e.WHATSAPP_TOKEN}`, f); return { ok: r.ok, detail: r.ok ? "Phone number readable" : `HTTP ${r.status}` }; } },
  { id: "youtube", label: "YouTube Data API", purpose: "Channel and video research/analytics (read)", writes: false, requiredEnv: ["YOUTUBE_API_KEY"], howTo: "Create an API key in Google Cloud with YouTube Data API v3 enabled.",
    test: async (e, f) => { const { r } = await get(`https://www.googleapis.com/youtube/v3/videos?part=id&id=dQw4w9WgXcQ&key=${e.YOUTUBE_API_KEY}`, f); return { ok: r.ok, detail: r.ok ? "Key accepted" : `HTTP ${r.status}` }; } },
  { id: "crm_hubspot", label: "CRM (HubSpot)", purpose: "Leads, pipeline, follow-ups", writes: true, requiredEnv: ["HUBSPOT_TOKEN"], howTo: "HubSpot private app token with CRM read scopes. Writes are approval-gated.",
    test: async (e, f) => { const { r } = await get("https://api.hubapi.com/crm/v3/objects/contacts?limit=1", f, { headers: { authorization: `Bearer ${e.HUBSPOT_TOKEN}` } }); return { ok: r.ok, detail: r.ok ? "CRM readable" : `HTTP ${r.status}` }; } },
  { id: "email", label: "Email (Resend)", purpose: "Client emails: drafts only until approved", writes: true, requiredEnv: ["RESEND_API_KEY"], howTo: "Resend API key and a verified sending domain. Sending is approval-gated.",
    test: async (e, f) => { const { r } = await get("https://api.resend.com/domains", f, { headers: { authorization: `Bearer ${e.RESEND_API_KEY}` } }); return { ok: r.ok, detail: r.ok ? "Account reachable" : `HTTP ${r.status}` }; } },
  { id: "file_storage", label: "Cloud file storage (Supabase Storage)", purpose: "Creative assets and client documents", writes: true, requiredEnv: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"], howTo: "Create private buckets; set the project URL and the service-role key (server only).",
    test: async (e, f) => { const { r } = await get(`${e.SUPABASE_URL}/storage/v1/bucket`, f, { headers: { apikey: e.SUPABASE_SERVICE_ROLE_KEY!, authorization: `Bearer ${e.SUPABASE_SERVICE_ROLE_KEY}` } }); return { ok: r.ok, detail: r.ok ? "Storage reachable" : `HTTP ${r.status}` }; } },
  { id: "google_analytics", label: "Google Analytics 4", purpose: "Traffic and conversions", writes: false, requiredEnv: ["GOOGLE_SERVICE_ACCOUNT_JSON", "GA4_PROPERTY_ID"], howTo: "Service account added as Viewer on the GA4 property. (Adapter not written yet.)" },
  { id: "search_console", label: "Google Search Console", purpose: "Search queries and pages", writes: false, requiredEnv: ["GOOGLE_SERVICE_ACCOUNT_JSON", "GSC_SITE_URL"], howTo: "Service account added as a user on the property. (Adapter not written yet.)" },
  { id: "google_ads", label: "Google Ads", purpose: "Search/Display reporting; changes with approval", writes: true, requiredEnv: ["GOOGLE_ADS_DEVELOPER_TOKEN", "GOOGLE_ADS_REFRESH_TOKEN", "GOOGLE_ADS_CUSTOMER_ID"], howTo: "Google Ads API developer token (needs approval from Google) and OAuth. (Adapter not written yet.)" },
  { id: "scheduling", label: "Content scheduling", purpose: "Queue approved posts for publishing", writes: true, requiredEnv: ["SCHEDULER_API_KEY"], howTo: "Metricool/Meta scheduling account. (Adapter not written yet.)" },
];

export function integrationStatus(d: IntegrationDef, env: Env, last: TestRecord | null): IntegrationStatus {
  if (d.requiredEnv.length === 0) return "built_in";
  if (d.requiredEnv.some((k) => !env[k])) return "awaiting_credentials";
  if (!d.test) return "adapter_not_written";
  if (!last) return "configured_untested";
  return last.ok ? "tested_ok" : "tested_failed";
}
export const STATUS_LABEL: Record<IntegrationStatus, string> = { built_in: "Built in", awaiting_credentials: "Awaiting credentials", configured_untested: "Configured — not tested", tested_ok: "Tested OK", tested_failed: "Test failed", adapter_not_written: "Credentials set — adapter not written" };

export async function listIntegrations(store: StorePort, env: Env = process.env) {
  return Promise.all(INTEGRATION_DEFS.map(async (d) => { const last = await store.getSetting<TestRecord>(`integration_test:${d.id}`); return { ...d, status: integrationStatus(d, env, last), last, missingEnv: d.requiredEnv.filter((k) => !env[k]) }; }));
}
/** Runs the live test (only when credentials exist) and records the result. Test output never includes secrets. */
export async function testIntegration(store: StorePort, id: string, env: Env = process.env, f: typeof fetch = fetch): Promise<TestRecord> {
  const d = INTEGRATION_DEFS.find((x) => x.id === id);
  if (!d) throw new Error("Unknown integration");
  if (d.requiredEnv.some((k) => !env[k])) throw new Error("Credentials are missing, so the integration cannot be tested");
  if (!d.test) throw new Error("No adapter has been written for this integration yet");
  let rec: TestRecord;
  try { const r = await d.test(env, f); rec = { ok: r.ok, detail: r.detail, at: new Date().toISOString() }; } catch (e) { rec = { ok: false, detail: `Request failed: ${e instanceof Error ? e.message.replace(/(token|key)=[^&\s]+/gi, "$1=***") : "error"}`, at: new Date().toISOString() }; }
  await store.setSetting(`integration_test:${id}`, rec);
  await store.log({ clientId: null, actor: "system", action: "integration.tested", detail: `${id}: ${rec.ok ? "ok" : "failed"}` });
  return rec;
}
/** Used by the approval gate: an integration may execute external actions only if its last live test passed. */
export async function isIntegrationOperational(store: StorePort, id: string, env: Env = process.env) {
  const d = INTEGRATION_DEFS.find((x) => x.id === id); if (!d) return false;
  return integrationStatus(d, env, await store.getSetting<TestRecord>(`integration_test:${id}`)) === "tested_ok";
}
export const INTEGRATIONS = INTEGRATION_DEFS.map((d) => ({ id: d.id, purpose: d.purpose, status: "NOT_CONFIGURED" as const, writes: d.writes, note: d.howTo }));
/** Legacy sync helper: never true. Use isIntegrationOperational (it checks the recorded live test). */
export const isOperational = (id: string) => id === "" && false;
