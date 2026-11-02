# Security & data handling

## Rules
- Secrets only in server environment variables (`.env.local` locally, Vercel/Supabase dashboards in production). Never in git, chat, or client code. `.env*` is git-ignored; `src/hq/security.test.ts` fails CI if a key pattern or env file is tracked.
- **Client data is not stored in git.** `data/` is git-ignored. Real client facts live in `data/seed/clients.json` (private, back it up yourself; or set `HQ_SEED_FILE`). Tests use synthetic data in `src/hq/fixtures.ts`.
- HQ access: signed-in **staff** (owner/member) only. Client-role logins and users without an agency profile are refused. With no auth configured, HQ is **locked in production** (open only on localhost, or if you deliberately set `HQ_ALLOW_OPEN=1`).
- External actions (publish, ads, spend, client messages) require a human approval and a connected, tested integration. Agents cannot approve.
- No history rewrite or destructive repo/DB operation without your explicit approval.

## Known exposure (history)
Until this change the repo was **public** and earlier commits (`data/hq/...`, and client facts in `src/hq/seed.ts`) remain in git history. They contain business descriptions and audit notes, no credentials. Make the repo private. Scrubbing history (e.g. `git filter-repo`) is destructive and needs your OK; if the content is sensitive, treat it as already public.

## Remaining (see MARKETING_OS_PLAN.md)
Row-level security for HQ tables, encrypted OAuth token storage, rate limiting, private storage buckets: Phase B and F.

## History audit (2026-11-01, 68 commits, all refs)
- Method: every added line in every commit scanned for Anthropic/OpenAI/AWS/GitHub/Slack/Razorpay keys, private keys, JWTs, Supabase secrets, Postgres URLs with passwords and generic `key = "..."` assignments. Values were never printed.
- **Result: no real credentials were ever committed.** Two pattern hits, both in commit `e6fd1b8`, were fake placeholder keys in a test file; they have been replaced by values built at runtime. **No key rotation is needed.** No `.env` file (other than `.env.example`) was ever tracked.
- **Client information in history:** `data/hq/**` (workspace facts and generated reports for Pahadi Origin, Propedia, Personal Brand) and earlier versions of `src/hq/seed.ts` are in commits before `9af636b`. They contain business descriptions, store product/price details, a competitor snapshot and audit notes: no passwords, no customer personal data.
- **Repository visibility:** still PUBLIC. Making it private could not be done from this environment (the GitHub proxy blocks repository-settings writes). Owner action: GitHub → Settings → Danger Zone → Change visibility → Private (about 30 seconds).
- **Not done without your approval:** rewriting history (`git filter-repo` + force-push) to remove `data/hq/**` and old seed content. After making the repo private this is optional; if you want it, say so explicitly.
- Guard tests (`src/hq/security.test.ts`) fail CI if env files, client data or key-shaped strings are ever tracked again.

## Worker endpoint
`POST /api/worker` is disabled (503) unless `HQ_WORKER_SECRET` (24+ chars) is set; then it requires `Authorization: Bearer <secret>` (constant-time compare), otherwise 401. `GET` is 405. It runs due schedules and queued jobs only: the same internal work a logged-in user can trigger; it can never approve, publish, send or spend.
