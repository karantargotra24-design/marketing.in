# Connector inventory (tested 2026-10-25, cloud session; one harmless read each)
Tests ran from a claude.ai cloud container. Results may differ on Karan's own machine.

| Connector | Status | What it can do (observed) | Limit / issue | Manual fallback |
|---|---|---|---|---|
| Metricool | PASS | `getBrandSettings` returned 1 brand: karantargotra.a (IG + FB linked, tz Asia/Calcutta) | Only personal brand is connected; no client brands. Not tested: analytics, review-post creation | Export from Metricool UI |
| Windsor.ai (direct connector) | PASS (thin) | Lists 1 connected source: `instagram_public` karantargotra.a | No ad accounts connected; write actions exist, denied in settings. Plugin version of Windsor FAILED (proxy 403) | Meta Ads Manager CSV export |
| Supermetrics | BLOCKED | Auth OK (team owner) | No subscription covers Claude ("LICENSE_NOT_FOUND") | CSV exports |
| Semrush | BLOCKED | Subscription active | `no_api_units`: no API units left | Semrush web UI; free tools |
| Motion | NOT USABLE | Auth OK | No organization/workspace attached | Meta Ads Library manually |
| Canva | PASS (partial) | Lists 1 brand kit | Design create/edit not tested (asks permission). Plugin version FAILED (proxy 403) | Design by hand |
| ElevenLabs | PASS | Lists voices (25+, incl. 2 Indian-accent custom voices) | Restricted connector: voice/speech only, no image/video. Generating spends credits; clone voices need Gate A | None needed |
| Higgsfield | PASS, 0 credits | Balance read: free plan, 0 credits | Cannot generate anything until credits added | Other tools |
| ManyMotions (ai-video-editor) | PASS (list only) | Lists video/image models | Generation not tested (spends credits); plugin version FAILED (proxy 403) | CapCut manually |
| Google Drive | PASS | Lists recent files (read-only test) | Write/share denied or asks | Manual upload |
| Notion | PASS | Workspace "KARAN TARGOTRA's Space" reachable | Writes ask permission. Plugin version FAILED (proxy 403) | Markdown files |
| Gmail | FAIL (needs sign-in) | Re-auth required in claude.ai connector settings | Drafts only by policy | Manual email |
| Google Sheets, Calendar, Zapier, HubSpot, Gamma, Figma, Wix, Netlify, Supabase, Calendly, GoDaddy, Razorpay, Vibe Prospecting | NOT TESTED | Present in toolset | Zapier writes, Razorpay denied in settings; others ask or untested | n/a |
| Plugin MCP servers (ahrefs, similarweb, klaviyo, asana, slack, etc., ~27) | FAIL | none | Proxy 403 in this cloud environment | Run locally |

Notes
- Never assume PASS means publish works: Metricool scheduling was NOT tested (policy: no publishing without approval).
- Environment note: Google Drive shows Karan's real working files (e.g. a "Cinematic Noir v3" boost carousel folder, a Dhanteras ad plan for Mon 26 Oct 8 PM). The original knowledge pack may live there. I did not open them.
