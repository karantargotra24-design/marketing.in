# AI Marketing Agency HQ — implementation report (2026-11-01)

Status key: **CAT** = completed and tested · **INT** = implemented, not fully tested · **PART** = partially implemented · **BLOCKED** · **NS** = not started.
Tests: `npm test` → 58 passing (30 in `src/hq/hq.test.ts`). Two guards were deliberately broken to confirm the tests fail when they should (QA isolation check, approval gate).

## 1. Cloud environment audit
| Resource | Result |
|---|---|
| This repo (`marketing.in`) | Inspected. Next.js 16 + Supabase app in mock mode: login, client list, content writer agent, brand onboarding, tests. **Reused unchanged** except one line adding `/hq` to the login-protected paths. |
| Claude artifacts (~35) | Listed. Read: Propedia design system (README, Messaging), Propedia Phase 1 diagnostic (doc), Pahadi Origin Store (page text), capability-audit doc. **Not read:** Pahadi Origin Design System tokens, "My Original Creative DNA" doc (too large for the read tool), W44 Plan & Stats numbers, W43 boards, ScapeMedia site. |
| Google Drive | Searched "Pahadi", "Propedia", "Marketing OS": **no matching files.** One unrelated shared sheet ("Influencers' Calling", contact data) exists; deliberately **not** ingested. |
| Notion | Searched "Pahadi Origin": nothing. |
| "Marketing OS folder", PDFs, decks, spreadsheets, images/videos | **Not found/accessible** via any tool here. If they exist on your device or elsewhere, upload or point me to them. |
| Memory / past conversations | Only what is in this session (your preferences) and the artifacts above. No private conversation history was accessed. |
| MCP connectors | Many listed in the session; 25+ plugin servers failed to connect (proxy 403). Nothing was called for client data beyond Drive/Notion/Artifacts reads. |

## 2. Architecture (CAT)
`src/hq/` is framework-free TypeScript; the Next.js `/hq` dashboard and `scripts/hq.ts` CLI are thin layers over it.
- `store.ts` file-backed store (`data/hq/`): one **folder per client**, atomic writes, append-only activity log. Interface is adapter-ready for Supabase.
- `workspace.ts` **WorkspaceScope**: the only way an agent touches data; bound to one client and one agent's permitted knowledge bases.
- `agents/registry.ts` 12 specialist definitions; `orchestrator.ts` DAG scheduler + workflow templates (`audit_360`, `content_plan`, `onboarding`); `qa.ts` rule-based QA; `approvals.ts` gate; `integrations.ts` honest connector status; `seed.ts` workspaces.

## 3. Agents
**12/12 defined (CAT for structure & behaviour):** identity, system instructions, responsibilities, inputs, outputs, tools, knowledge permissions, quality standards, protocol. Orchestrator is a scheduler/consolidator that delegates; it does not do specialist work.
**Important limitation (PART):** agents are **rule-based workspace analysts**. They ground findings in stored facts, flag risks, list gaps and give next actions. They do **not** browse the web, call ad platforms or write creative copy from this app. An Anthropic adapter exists (`src/hq/provider.ts`, **INT**: tested only against a mocked API, never live). It is OFF unless `HQ_AI=on` and `ANTHROPIC_API_KEY` are set, capped by `HQ_AI_MAX_CALLS` (default 20), and adds only "AI-drafted" recommendations that QA still checks (invented numbers are blocked). Live research, calendars, scripts and ad copy therefore still happen in the Claude chat, not in the app.

## 4. Parallel execution (CAT)
DAG scheduler with `maxConcurrency`, dependency waiting, retry of `RecoverableError` (max attempts), non-recoverable failure → `FAILED`, dependents fail with "Upstream task failed" unless `allowPartial` (consolidation/QA, which then name the failure). Tests prove: 6 audit tasks run at once (6×150 ms tasks finish in <900 ms), `maxConcurrency=2` respected, consolidation starts only after all six finish, QA after consolidation, content_plan fans out creative+video in parallel, different clients run simultaneously. Note: in the real CLI run the rule-based agents finish in milliseconds, so observed overlap there is only 3.

## 5. Client workspaces (CAT)
Pahadi Origin (16 facts), Propedia (21), Personal Brand (11), each with the 10 knowledge bases, source + status label per fact, versioned updates. New client onboarding creates an empty isolated workspace (tested: audit of an empty client returns WAITING FOR INPUT, nothing invented). Isolation tests: scoped reads, KB permission denial, path traversal rejected, QA blocks cross-client mentions, no output file mentions another client.

## 6. Test audits (Part 13) — evidence
Logs: `data/hq/evidence/first-real-test-run.txt`. Reports: `data/hq/clients/<id>/outputs/audit-final-*.md` and `qa-*.md`. All three ran in parallel; all 9 tasks per client completed; QA passed all documents. Real findings:
- **Pahadi Origin:** storefront shows testimonials labelled "Sample", "Only N left" stock badges, 30–40% "OFF" claims and 4.6–4.8 ratings, all flagged NEEDS VERIFICATION. Do not run Meta Ads on those claims until proven real. No website URL, GBP, performance data, audience personas or marketing history exist in the workspace.
- **Propedia:** **brand colour conflict** (design system README: navy `#0B3A8C` + red; diagnostic: green `#0E412A` + gold). JKRERA status, stamp duty and price benchmark unverified. Many gaps (no handles, budget, goals, performance).
- **Personal Brand:** handle `@karantargotra.a`, voice and prior weekly content found; no stored performance numbers (they exist in the W44 artifact but are not imported); creative-DNA colours/fonts not read.
"WAITING FOR INPUT" on several agents is the honest result of missing data, not a failure.

## 7. Dashboard (INT)
`/hq`: overview counters, clients (+add), run workflow, create task, tasks table with status/review/output, approvals (request/approve/reject), agent directory with live status, integrations, activity log; `/hq/client/[id]` knowledge base + add fact + reports. Every control calls a server action. Verified by driving the production build with Playwright (seed → audit → add client → task → approval → report → fact; isolation; 404 on traversal). That browser script is **not** committed as an automated test. Login: protected via the existing Supabase session in real mode; open on localhost in mock mode.

## 8. Automation & integrations (NS / BLOCKED)
No scheduled jobs, no external calls. `approvals.ts` makes execution impossible unless an approval is human-approved, same client, unused, and the integration is `CONNECTED_AND_TESTED` — none is. Meta/Google/Instagram/HubSpot/Drive exist as Claude-session connectors only and are untested for your accounts. WhatsApp API needs paid approval.

## 9. Known limitations
- File storage: works locally/in cloud dev, **not** on read-only hosting (Vercel). Needs the Supabase adapter (the repo's existing schema is a starting point) before deploying HQ.
- `data/` (client info) is no longer tracked by git; see docs/SECURITY.md. Evidence logs from the first run are kept locally, not in the repo.
- Pahadi data comes from the storefront preview, not a client questionnaire; "CLIENT-PROVIDED" there means "from your artifact".
- QA is rules (structure, sources, banned phrases, number provenance, isolation), not a fact-checker.
- No concurrency across multiple server processes (in-process locks).

## 10. Remaining work (suggested order)
1. Answer the gap lists (Pahadi: website/URL, goals, budget, FSSAI, real reviews; Propedia: palette, JKRERA, handles; Personal: import W44 stats, confirm brand colours).
2. Add your Anthropic API key (server env only), run one capped live test, then extend the AI step beyond recommendations to full drafts.
3. Supabase store adapter + deploy.
4. Connect and live-test one read-only integration at a time (Instagram insights via Windsor, then Meta Ads).
5. Scheduled weekly content/reporting workflows; CSV import for performance data.

## 11. Operating the agency
```bash
npm run hq -- seed                 # create the 3 workspaces (idempotent, never overwrites)
npm run hq -- audit all            # 360° audit for every workspace, in parallel
npm run hq -- audit propedia       # one client
npm run hq -- run pahadi-origin content_plan
npm run hq -- onboard jammu-motors "Jammu Motors"
npm run hq -- status
npm run dev                        # dashboard at http://localhost:3000/hq
```
Add facts via the client page (source required). Read reports in `data/hq/clients/<id>/outputs/`. Approve or reject at `/hq`.
