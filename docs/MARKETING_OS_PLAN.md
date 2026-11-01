# Marketing OS — repository audit & implementation plan (v1, 2026-11-01)
Status: **PLAN. Awaiting your approval on the decisions in §6 before Phase A starts.** Nothing below has been purchased, deployed or connected.

## 1. Audit of what exists (inspected, not assumed)
| Area | Evidence | Status |
|---|---|---|
| App | Next.js 16 / React 19 / Tailwind 4; routes `/`, `/login`, `/dashboard`, `/content`, `/onboarding`, `/hq`, `/hq/client/[id]`, `/hq/report/...`; production build passes | COMPLETED AND TESTED (build) |
| HQ engine | `src/hq/` ≈1,440 lines: orchestrator (DAG scheduler, retries, `allowPartial`), 12 agent definitions, QA rules, approval gate, scoped workspace, activity log | COMPLETED AND TESTED |
| Agents | **Rule-based**, not AI. Optional Anthropic adapter (`provider.ts`) exists, off by default, call-capped, tested only against a mock API | PARTIALLY IMPLEMENTED |
| Storage | `StorePort` interface (this branch) + file store under `data/hq/` — **not usable on Vercel** (read-only FS) | PARTIALLY IMPLEMENTED |
| Database | One migration (`agency` schema: agencies, profiles, clients, client_users, audit_logs + RLS) and `supabase/tests/rls_isolation.sql`. **No tables for HQ facts/tasks/approvals/outputs/usage yet.** Never applied by me; the only reachable Supabase project (`scapemedia-academy`) is **INACTIVE** and shared with your Academy app | PARTIALLY IMPLEMENTED |
| Auth | Supabase session via `proxy.ts` (protects `/dashboard`, `/hq`); server actions call `requireHuman()`. In **mock mode `/hq` is open** — unsafe if deployed without Supabase keys | PARTIALLY IMPLEMENTED |
| Tests | 58 pass (8 files): 30 HQ, rest legacy. No browser tests committed; no DB tests | PARTIALLY IMPLEMENTED |
| CI/CD | **No `.github/` at all** — no CI, no branch protection, no deploy pipeline | NOT STARTED |
| Integrations | None live. Connectors exist only inside your Claude chat session | NOT STARTED |
| File storage | None (outputs are rows/files). No Supabase Storage buckets | NOT STARTED |
| Queue/scheduler | In-process DAG only; no durable queue, no cron, no resume after crash | NOT STARTED |

## 2. Critical findings (act before anything else)
1. **The GitHub repo is PUBLIC** (`karantargotra24-design/marketing.in`, verified via GitHub search API) and last phase I committed `data/hq/` (client facts, audit reports) and client facts inside `src/hq/seed.ts`. Pahadi/Propedia business details and the Propedia diagnostic summary are readable by anyone, and are in git history. *I cannot change repo visibility.* **You should make the repo private now** (GitHub → Settings → Danger Zone → Change visibility). Then I will (a) untrack `data/` and add it to `.gitignore` (no history rewrite, files stay on disk), (b) move client seed content out of source into a private import file loaded at runtime. Rewriting history or deleting is **your call** (§6-2). None of this content included credentials; no secrets were found in the repo (`.env*` ignored; `.env.example` has placeholders only).
2. **Shared Supabase project.** Only `scapemedia-academy` is visible and it is paused. Putting agency/client data beside student data is a risk. Recommendation: a **separate Supabase project** for Marketing OS (§6-3).
3. **Fail-open auth in mock mode** (above) — will fail closed in production.

## 3. Target architecture
```
GitHub (source of truth, PRs, Actions CI)
   └─ Vercel: Next.js Marketing OS (/hq dashboard, server actions, cron route)
        ├─ Supabase (dedicated project): Postgres (hq.* tables, RLS) · Auth (owner/member/client) · Storage (private buckets, per-client prefix)
        ├─ AI layer: provider interface (Anthropic first; OpenAI-compatible second), model per agent, token/cost ledger, USD caps
        ├─ Workflow engine: hq.jobs table (leased with FOR UPDATE SKIP LOCKED) · worker route driven by Vercel Cron + manual "run now" · per-task retry/backoff · execution history
        └─ Integrations layer: one adapter per platform, OAuth tokens encrypted server-side, every write behind the approval gate
```
Honest constraint: Vercel functions are time-limited, so a run is executed by a worker invocation that picks up ready tasks and runs them concurrently (`Promise.all` inside one invocation; many invocations for long runs). If runs outgrow this, switch the queue executor to Inngest/Trigger.dev (free tiers) — the `jobs` abstraction stays; needs your approval (§6-5).

## 4. The 12 agents (your list, mapped to what exists)
| Your agent | Today | Change |
|---|---|---|
| Research | `research` | add live tools (page fetch with SSRF guard now; search API after approval) |
| Audit | `audit_strategy` (combined) | **split** |
| Strategy | `audit_strategy` (combined) | **split**, takes Audit + Research output |
| Content | `content` + `social` + `video` | merge social planning and reel scripts into Content |
| Creative | `creative` | adds image/video prompt output; generation tools approval-gated |
| Advertising | `paid_ads` | plan/copy only; launch = approval + live integration |
| SEO | `seo_web` | page analysis tool |
| Analytics | `analytics` | CSV import now; API connectors later |
| CRM | `lead_crm` | funnel/follow-up specs; sends = approval |
| Client Service | `client_ops` | questionnaires/status; messages are drafts |
| Quality Assurance | `qa` + `qa.ts` | rules stay; add AI reviewer pass |
| Automation | *(new)* | owns schedules/recurring workflows, run monitoring |
Per agent: instructions, permitted knowledge bases, tool allow-list, zod output schema, retry policy, logs — already modelled in `AgentDefinition`; add `tools`/`model`/`schema`.

## 5. Phases (each = feature branch → PR → your approval; tests must be green)
| Phase | Scope | Exit criteria (tested) | Needs from you |
|---|---|---|---|
| **A. Security & workflow** | Untrack client data; fail-closed auth; GitHub Actions CI (lint, types, tests, build); PR template; CODEOWNERS; secrets-scan test | CI green on PR; test proves `/hq` rejects anonymous in production mode | Make repo private; enable branch protection (I can't) |
| **B. Persistence** | `hq.*` migration (composite `(agency_id, client_id)` keys, append-only facts/logs, RLS), `PgStore`, file→DB importer, Storage bucket policies, backup/restore script + doc | Same contract tests pass for file and Postgres stores (run on PGlite); RLS tests: agency A/B and client-role isolation; restore round-trip | Approve new Supabase project (free tier ok; ~$25/mo Pro if you want PITR backups) |
| **C. AI engine** | Provider layer, per-agent model + zod structured output + repair retry, context retrieval, usage/cost ledger, USD caps, kill switch | Mock-provider tests incl. cap enforcement and invalid-JSON recovery; one **capped live smoke test** only after approval | Provider/model/budget (see `AI_PROVIDER_PROPOSAL.md`) + API key in env |
| **D. Durable parallel workflows** | `hq.jobs` queue, leased workers, cron, resume after crash, schedules, execution history | Concurrency proven with instrumented provider (in-flight counter ≥ N); crash/resume test; retry/backoff tests | Cron/queue choice |
| **E. Capabilities** | Research tools, content pack (calendar, scripts, carousels, briefs, ad copy, prompts), content approval workflow, CSV performance import, report generator | Brand-guard QA tests per client; approval state machine tests | Real client inputs (gap lists) |
| **F. Integrations** | One at a time, read-only first: Drive/Sheets, Meta Insights, GA4/Search Console, then writes behind approvals | Contract tests with recorded fixtures **plus** a live test per integration before it is marked working | OAuth apps / test accounts per platform |
| **G. Dashboard & observability** | Live task board from DB, usage/cost panel, execution history, approval inbox, error log | Committed Playwright e2e (`npm run test:e2e`) in CI | — |
| **H. Production deploy** | Vercel project, env vars, migrations in CI, runbook, cost & security report | Staging deploy smoke test; rollback doc | Approve production deploy |

## 6. Decisions I need (defaults in bold; I will not proceed on Phase B–F items marked ★ without them)
1. **Make the repo private now.** (Or tell me to move work to a new private repo.)
2. Untrack client data without rewriting history (**recommended**), or scrub history (destructive; needs explicit OK).
3. ★ New dedicated Supabase project (**recommended**) vs. reuse `scapemedia-academy`. Creating/restoring projects may cost money.
4. ★ AI provider/model/budget — see `docs/AI_PROVIDER_PROPOSAL.md` (recommend Sonnet 5.5 + Haiku 5.5, ₹1,500/month cap).
5. Queue executor: **Postgres jobs + Vercel Cron first**, Inngest later if needed.
6. Agent roster: adopt your 12-name list (split Audit/Strategy, add Automation, fold Social/Video).
7. First integration to connect after Supabase + AI: suggest **Instagram insights for @karantargotra.a** (read-only) because it unblocks your personal-brand analytics.

## 7. Completed / pending / blocked
- COMPLETED AND TESTED: HQ engine core, isolation, approval gate logic, QA rules, `/hq` dashboard (manual browser run), 58 tests.
- IMPLEMENTED, NOT TESTED LIVE: Anthropic adapter (mock only); `StorePort` abstraction (type-level, file store unchanged).
- PENDING: Phases A–H.
- BLOCKED on you: private repo, Supabase project, AI budget/key, OAuth credentials for each platform.
- Not claimed: no integration is connected; no agent has made a real AI call.

## 8. Reviewable diff in this PR
Plan + proposal docs, `StorePort` interface and usage ledger on the file store (type-only refactor; 58 tests still pass).
