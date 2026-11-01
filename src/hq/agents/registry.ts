import { baseOutput, finding, riskyFacts, type AgentDefinition } from "./base";
import { agentIds, knowledgeBases, type AgentId, type KnowledgeBase } from "../types";

const ALL = knowledgeBases;
const STD_PROTOCOL = "Receives task {taskId, clientId, objective}. Reads only its permitted knowledge bases through its WorkspaceScope. Writes one markdown output to the client workspace, sets task status, and lists handoffs for dependent agents. Never edits another agent's approved output. Submits to QA.";
const STD_QUALITY = ["Every finding carries a source and a status label", "No statistic without a stored source", "Missing information is listed, never guessed", "Brand do-not-say rules respected"];
const SYS = (role: string, extra: string) => `You are the ${role} for a digital marketing agency (ScapeMedia, Jammu, India). Work only from the client workspace facts you are given. Cite each fact's id/source and status label. If a needed input is missing, list it under Missing information; never fabricate numbers, research or results. Use ₹ and India context. ${extra} You may draft and plan; you may not publish, spend money, or message anyone: request approval instead.`;

function def(d: Omit<AgentDefinition, "communication" | "qualityStandards" | "instructions"> & { role: string; extra: string; qualityStandards?: string[] }): AgentDefinition {
  const { role, extra, qualityStandards, ...rest } = d;
  return { ...rest, instructions: SYS(role, extra), qualityStandards: [...STD_QUALITY, ...(qualityStandards ?? [])], communication: STD_PROTOCOL };
}

const need = (kb: KnowledgeBase, key: string, why: string) => ({ kb, key, why });

export const AGENTS: Record<AgentId, AgentDefinition> = {
  research: def({
    id: "research", name: "Research & Market Intelligence", role: "Research & Market Intelligence analyst", extra: "Label every claim RESEARCHED with a URL, or ASSUMPTION.",
    identity: "Finds and organizes market, competitor, audience and keyword intelligence with sources.",
    responsibilities: ["Industry & market research", "Competitor analysis", "Customer behaviour", "Search trends & keywords", "Market positioning & opportunities"],
    requiredInputs: ["Industry & location", "Known competitors", "Target audience"], expectedOutputs: ["Research report", "Competitor matrix", "Audience intelligence", "Opportunity list"],
    tools: ["web search (needs provider)", "Semrush (Claude session MCP, not wired to app)"], knowledgePermissions: ["business", "audience", "competitor", "strategy"],
    needs: [need("business", "location", "market definition"), need("competitor", "competitors", "competitor matrix"), need("audience", "target_segments", "audience intelligence"), need("business", "offer_products", "keyword themes")],
    analyze: (ctx) => baseOutput(AGENTS.research, ctx, {
      title: "Research & market intelligence",
      focusKeys: ["location", "competitors", "target_segments", "offer_products", "market", "personas"],
      recommendations: [
        ...(!ctx.has("competitor", "competitors") ? ["Build a competitor list first: top 5–10 local competitors with handles/URLs (Research can then profile them with sources)."] : ["Verify each stored competitor on its live Google Business Profile, website and Instagram; the stored snapshot is not an audit."]),
        "Live web research needs an AI/search provider attached to the Research agent (not configured in the app yet): until then this output is a gap-and-plan report only.",
      ],
      handoffs: [{ toAgent: "seo_web", note: "Keyword themes derive from offer_products and location facts." }],
    }),
  }),
  audit_strategy: def({
    id: "audit_strategy", name: "Business Audit & Strategy", role: "Business audit and growth strategist", extra: "Roadmaps must be derived from stored facts and identified gaps.",
    identity: "Runs 360° audits, SWOT, customer-journey and gap analysis, and 30/60/90-day roadmaps.",
    responsibilities: ["360° business audit", "Brand audit", "SWOT", "Customer journey", "Marketing gap identification", "30/60/90 roadmap"],
    requiredInputs: ["Business model", "Brand positioning", "Goals", "Current marketing"], expectedOutputs: ["Audit report", "Strategic recommendations", "Roadmap"],
    tools: ["workspace read"], knowledgePermissions: ALL,
    needs: [need("business", "offer_products", "business model"), need("brand", "positioning", "brand audit"), need("requirements", "goals", "strategy targets"), need("campaigns", "past_campaigns", "marketing history"), need("performance", "baseline_metrics", "baseline")],
    analyze: (ctx) => {
      const risky = riskyFacts(ctx.facts);
      const o = baseOutput(AGENTS.audit_strategy, ctx, {
        title: "Business audit & strategy",
        focusKeys: ["offer_products", "positioning", "goals", "past_campaigns", "launch_priority", "current_strategy", "voice"],
        findings: risky.map((f) => ({ text: `Risk flag: "${f.key.split("@")[0]}" is ${f.status}; do not use in marketing until verified.`, sources: [f.id], status: "NEEDS VERIFICATION" as const })),
      });
      const gaps = o.missingInfo.length;
      o.recommendations = [
        `Days 1–30: close the ${gaps} information gap(s) this agent lists under Missing information before scaling any marketing spend.`,
        "Days 31–60: build one measurable lead channel from verified assets; add tracking (source on every enquiry).",
        "Days 61–90: review baseline vs results and decide on paid expansion with Karan's approval.",
        ...(risky.length ? [`Resolve ${risky.length} flagged unverified claim(s)/fact(s) first (see Risk flags).`] : []),
      ];
      o.handoffs = [{ toAgent: "client_ops", note: "Gap list should become onboarding questions for the client." }];
      return o;
    },
  }),
  social: def({
    id: "social", name: "Social Media Strategist", role: "Social media strategist", extra: "Platform plans must reflect actual handles and assets in the workspace.",
    identity: "Plans platform-specific growth and positioning for Instagram, Facebook, YouTube and LinkedIn.",
    responsibilities: ["Instagram/Facebook/YouTube/LinkedIn strategy", "Audience development", "Engagement optimisation", "Positioning"],
    requiredInputs: ["Social handles", "Brand voice", "Audience", "Past content"], expectedOutputs: ["Platform strategy", "Action plan"],
    tools: ["workspace read", "Metricool/Windsor (Claude session MCP, not wired to app)"], knowledgePermissions: ["business", "brand", "audience", "content", "performance", "competitor"],
    needs: [need("business", "instagram_handle", "profile audit"), need("brand", "voice", "tone"), need("audience", "target_segments", "targeting"), need("content", "previous_content", "content history"), need("performance", "followers", "baseline")],
    analyze: (ctx) => baseOutput(AGENTS.social, ctx, {
      title: "Social media review",
      focusKeys: ["instagram_handle", "voice", "target_segments", "previous_content", "followers", "channels", "personas"],
      recommendations: [ctx.has("business", "instagram_handle") ? "Profile audit can run once read-only analytics access is approved." : "Confirm the Instagram/Facebook/YouTube/LinkedIn accounts to be managed; none are stored.", "No posting happens without approval (Approval Gate)."],
      handoffs: [{ toAgent: "content", note: "Platform priorities feed the content calendar." }],
    }),
  }),
  content: def({
    id: "content", name: "Content Strategist", role: "Content strategist", extra: "Calendars must map to stored pillars, voice and audience.",
    identity: "Builds content pillars and monthly/weekly/daily plans with briefs and scripts.",
    responsibilities: ["Content calendars", "Pillars", "Storytelling frameworks (AIDA, PAS)", "Briefs and scripts", "Distribution"],
    requiredInputs: ["Pillars", "Voice", "Audience", "Offers"], expectedOutputs: ["Calendars", "Concepts", "Scripts", "Briefs"],
    tools: ["workspace read", "existing contentWriter agent (src/agents/contentWriter)"], knowledgePermissions: ["business", "brand", "audience", "content", "strategy", "assets"],
    needs: [need("content", "content_pillars", "calendar structure"), need("brand", "voice", "copy tone"), need("audience", "target_segments", "relevance"), need("business", "offer_products", "promotional content")],
    analyze: (ctx) => baseOutput(AGENTS.content, ctx, {
      title: "Content strategy readiness",
      focusKeys: ["content_pillars", "voice", "target_segments", "offer_products", "previous_content", "do_not_say", "personas"],
      recommendations: [ctx.has("content", "content_pillars") ? "Generate next month's calendar from stored pillars (draft only; approval before publishing)." : "Define 3–5 content pillars from offers + audience pains; propose, then get client approval before calendars."],
      handoffs: [{ toAgent: "creative", note: "Approved content ideas need creative briefs." }, { toAgent: "video", note: "Reel concepts need scripts." }],
    }),
  }),
  creative: def({
    id: "creative", name: "Creative Director", role: "Creative director", extra: "Respect brand colours/typography exactly; flag conflicts.",
    identity: "Turns strategy into visual concepts, briefs and image-generation prompts consistent with the brand.",
    responsibilities: ["Visual concepts", "Carousel/static/ad creative briefs", "Image prompts", "Brand consistency QC"],
    requiredInputs: ["Colours", "Typography", "Logo files", "Approved assets"], expectedOutputs: ["Creative briefs", "Prompts", "Asset requirements"],
    tools: ["Canva/Higgsfield/ElevenLabs (Claude session MCP, not wired to app)"], knowledgePermissions: ["brand", "content", "assets", "audience"],
    needs: [need("brand", "colors", "palette"), need("brand", "typography", "type"), need("brand", "logo_files", "logo usage"), need("assets", "approved_assets", "reuse")],
    analyze: (ctx) => {
      const colors = ctx.variants("brand", "colors");
      const o = baseOutput(AGENTS.creative, ctx, { title: "Creative direction readiness", focusKeys: ["colors", "typography", "logo_files", "approved_assets", "design_system_reference", "voice"] });
      if (colors.length > 1) o.recommendations.push("Colour conflict in brand knowledge: confirm the single approved palette before producing any creative (see Conflicts).");
      o.recommendations.push("Briefs and prompts are produced only after palette/typography are confirmed; generation tools need approval (they spend credits).");
      return o;
    },
  }),
  video: def({
    id: "video", name: "Video & Reels Production", role: "short-form video producer", extra: "Scripts: hook, scenes, voiceover, on-screen text, editing notes.",
    identity: "Writes production-ready reel scripts, storyboards and editing briefs.",
    responsibilities: ["Reel research", "Hooks", "Scripts", "Storyboards", "Editing instructions"],
    requiredInputs: ["Voice", "Offers", "Audience", "Raw footage availability"], expectedOutputs: ["Scripts", "Storyboards", "Editing briefs"],
    tools: ["ai-video-editor/ElevenLabs/Higgsfield (Claude session MCP, not wired to app)"], knowledgePermissions: ["brand", "content", "audience", "business"],
    needs: [need("brand", "voice", "script tone"), need("business", "offer_products", "what to show"), need("assets", "approved_assets", "footage/photos")],
    analyze: (ctx) => baseOutput(AGENTS.video, ctx, { title: "Video production readiness", focusKeys: ["voice", "offer_products", "approved_assets"], recommendations: ["Scripts are drafted per approved content idea; footage must be supplied by client/Karan (video cannot be fully automated)."] }),
  }),
  paid_ads: def({
    id: "paid_ads", name: "Paid Advertising", role: "Meta and Google Ads strategist", extra: "Never launch or change spend; produce plans for approval.",
    identity: "Plans Meta/Google campaigns, copy, testing and budgets; analyses ad performance.",
    responsibilities: ["Campaign structures", "Audiences", "Ad copy", "Budget allocation", "Retargeting", "Optimisation"],
    requiredInputs: ["Goal", "Budget (₹)", "Landing page", "Audience", "Past ad data"], expectedOutputs: ["Campaign plan", "Ad copy", "Targeting", "Performance report"],
    tools: ["Windsor/Supermetrics (Claude session MCP, not wired to app)"], knowledgePermissions: ["business", "brand", "audience", "campaigns", "performance", "requirements", "strategy"],
    needs: [need("requirements", "budget", "budget split"), need("requirements", "goals", "campaign objective"), need("business", "website_url", "landing page"), need("audience", "target_segments", "targeting"), need("performance", "ad_metrics", "optimisation baseline")],
    analyze: (ctx) => {
      const risky = riskyFacts(ctx.facts.filter((f) => f.kb === "business" || f.kb === "brand"));
      return baseOutput(AGENTS.paid_ads, ctx, {
        title: "Paid advertising readiness",
        focusKeys: ["budget", "goals", "website_url", "target_segments", "ad_metrics", "channels", "offer_products"],
        findings: risky.map((f) => ({ text: `Ad-policy risk flag: "${f.key.split("@")[0]}" (${f.status}) may breach Meta/Google ad policy or consumer rules if used as-is.`, sources: [f.id], status: "NEEDS VERIFICATION" as const })),
        recommendations: ["No campaign can be built responsibly without budget, goal and a live landing page; these are listed under Missing information.", "All launches and spend require explicit approval."],
      });
    },
  }),
  seo_web: def({
    id: "seo_web", name: "SEO & Website", role: "SEO and conversion specialist", extra: "Do not claim rankings or traffic without data.",
    identity: "Audits site and search visibility; plans keywords, landing pages and local SEO.",
    responsibilities: ["Technical/on-page/local SEO", "Keyword research", "Landing pages", "Conversion optimisation"],
    requiredInputs: ["Website URL", "Google Business Profile", "Offers", "Location"], expectedOutputs: ["SEO audit", "Keyword strategy", "Website recommendations"],
    tools: ["Semrush (Claude session MCP, not wired to app)"], knowledgePermissions: ["business", "brand", "audience", "competitor", "performance", "content"],
    needs: [need("business", "website_url", "site audit"), need("business", "gbp", "local SEO"), need("business", "offer_products", "keyword themes"), need("business", "location", "local intent")],
    analyze: (ctx) => baseOutput(AGENTS.seo_web, ctx, {
      title: "SEO & website review",
      focusKeys: ["website_url", "gbp", "offer_products", "location", "channels", "digital_presence_status"],
      recommendations: [ctx.has("business", "website_url") ? "Run technical + on-page audit on the stored URL." : "No live website URL is stored: confirm where customers actually buy/enquire before any SEO work.", "Local SEO: create/claim Google Business Profile if not present (needs owner access)."],
    }),
  }),
  lead_crm: def({
    id: "lead_crm", name: "Lead Generation & CRM", role: "lead generation and CRM automation specialist", extra: "Follow-ups are drafts until approved.",
    identity: "Designs lead funnels, WhatsApp flows, scoring and follow-up sequences.",
    responsibilities: ["Funnels", "WhatsApp marketing", "CRM workflows", "Lead scoring", "Follow-up sequences", "Conversion tracking"],
    requiredInputs: ["Lead channels", "CRM/sheet", "Sales process"], expectedOutputs: ["Funnel design", "Automation spec", "Improvement plan"],
    tools: ["HubSpot/Zapier/Google Sheets (Claude session MCP, not wired to app)"], knowledgePermissions: ["business", "audience", "campaigns", "performance", "requirements"],
    needs: [need("business", "whatsapp", "lead channel"), need("business", "crm", "lead tracking"), need("performance", "leads_count", "baseline"), need("business", "sales_process", "funnel stages")],
    analyze: (ctx) => baseOutput(AGENTS.lead_crm, ctx, { title: "Lead generation & CRM readiness", focusKeys: ["whatsapp", "crm", "leads_count", "sales_process", "order_policy", "channels"], recommendations: ["Define lead stages and a source field for every enquiry before any ad spend, so cost per lead is measurable."] }),
  }),
  analytics: def({
    id: "analytics", name: "Analytics & Performance", role: "marketing analyst", extra: "If no performance data is stored, say NO DATA. Never estimate results.",
    identity: "Reads performance data and reports CPL, ROAS, engagement and trends.",
    responsibilities: ["Social/ads analytics", "CPL/ROAS/ROI", "Monthly reports", "Campaign comparisons"],
    requiredInputs: ["Performance exports or API access"], expectedOutputs: ["Dashboards", "Reports", "Optimisation recommendations"],
    tools: ["Windsor/Supermetrics (Claude session MCP, not wired to app)"], knowledgePermissions: ["performance", "campaigns", "content", "requirements"],
    needs: [need("performance", "baseline_metrics", "any metric baseline"), need("performance", "followers", "audience size"), need("performance", "ad_metrics", "ad results"), need("campaigns", "past_campaigns", "campaign list")],
    analyze: (ctx) => {
      const perf = ctx.facts.filter((f) => f.kb === "performance");
      const o = baseOutput(AGENTS.analytics, ctx, { title: "Analytics & performance", focusKeys: ["baseline_metrics", "followers", "ad_metrics", "past_campaigns", "leads_count", "website_traffic"] });
      if (perf.length === 0) {
        o.summary = `NO DATA: the ${ctx.clientName} workspace holds no performance numbers. No metrics were estimated or invented.`;
        o.insufficientData = true;
        o.recommendations = ["Export last 30–90 days from Meta Ads Manager / Instagram Insights / GA4 (or approve read-only connector access) and import into the Performance knowledge base."];
      }
      return o;
    },
  }),
  client_ops: def({
    id: "client_ops", name: "Client Operations", role: "client operations manager", extra: "Client messages are drafts until approved.",
    identity: "Onboarding, requirements, tracking, approvals and account summaries.",
    responsibilities: ["Onboarding", "Requirement collection", "Project tracking", "Client message drafts", "Approvals", "History"],
    requiredInputs: ["Requirements", "Contacts", "Approval rules"], expectedOutputs: ["Client briefs", "Task reports", "Approval requests", "Account summary"],
    tools: ["workspace read", "Gmail/WhatsApp drafts (Claude session MCP, not wired to app)"], knowledgePermissions: ALL,
    needs: [need("requirements", "client_requirements", "scope"), need("requirements", "budget", "planning"), need("requirements", "goals", "success criteria"), need("requirements", "approval_policy", "who approves")],
    analyze: (ctx) => {
      const counts = knowledgeBases.map((kb) => ({ kb, n: ctx.facts.filter((f) => f.kb === kb).length }));
      const filled = counts.filter((c) => c.n > 0).length;
      const o = baseOutput(AGENTS.client_ops, ctx, { title: "Client operations & onboarding completeness", focusKeys: ["client_requirements", "budget", "goals", "approval_policy"] });
      o.findings.push({ text: `Computed: ${filled} of ${knowledgeBases.length} knowledge bases have at least one fact (${counts.map((c) => `${c.kb}:${c.n}`).join(", ")}).`, sources: ["workspace-count"], status: "VERIFIED" });
      const empty = counts.filter((c) => c.n === 0).map((c) => c.kb);
      if (empty.length) o.missingInfo.push(`Empty knowledge bases: ${empty.join(", ")} — send the client an onboarding questionnaire (draft only; approval needed to send).`);
      o.recommendations = ["Convert the missing-information list into a short client questionnaire (WhatsApp/email draft for Karan's approval)."];
      return o;
    },
  }),
  qa: def({
    id: "qa", name: "Quality Assurance", role: "quality assurance reviewer", extra: "Block outputs with unsourced numbers, cross-client content or banned claims.",
    identity: "Reviews every deliverable for facts, brand compliance, data validity and structure before delivery.",
    responsibilities: ["Fact checking", "Source verification", "Brand compliance", "Data validation", "Quality scoring"],
    requiredInputs: ["Agent outputs", "Client brand rules"], expectedOutputs: ["Approved deliverables", "Revision requests", "Quality report"],
    tools: ["qa.ts rule engine"], knowledgePermissions: ["brand", "business", "requirements"], needs: [],
    analyze: (ctx) => baseOutput(AGENTS.qa, ctx, { title: "QA", focusKeys: [] }),
  }),
};

export const AGENT_LIST = agentIds.map((id) => AGENTS[id]);
export { finding };
