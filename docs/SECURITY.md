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
