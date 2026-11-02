# Deployment & operations

## State (2026-11-01)
| Item | Status |
|---|---|
| Supabase project `marketing-os` (`qludiulirhytdomcggfy`, ap-south-1, free plan) | CREATED. Separate from the Academy project. |
| Migrations `agency_phase1`, `hq_persistence` applied | DONE. Security advisor: 0 findings. |
| Live isolation test on that database (rolled back) | PASSED: cross-agency read 0 rows; client-role sees 0; cross-agency write blocked; anon denied; facts append-only |
| `ScapeMedia` agency row | CREATED: `9cc2f01a-2309-4450-89dd-d6fc9e95e3d7` |
| Owner login | **YOU**: create it (below) |
| Client data in the database | **Not yet imported** (needs `DATABASE_URL`, below) |
| Vercel project / production deploy | NOT DONE (needs your approval + the env vars) |

## One-time setup (about 10 minutes)
1. **Owner login.** Supabase → Authentication → Add user (your email + a strong password, auto-confirm). Copy its UUID, then in SQL editor:
   `insert into agency.profiles (id, agency_id, full_name, role) values ('<USER_UUID>', '9cc2f01a-2309-4450-89dd-d6fc9e95e3d7', 'Karan', 'owner');`
2. **Expose nothing extra.** Do NOT add `hq` to "Exposed schemas" (server code reaches it via `DATABASE_URL`; RLS is the backstop).
3. **Env vars** (Vercel → Settings → Environment Variables, and `.env.local` for local): see `.env.example`. `DATABASE_URL` is a secret (Connect → Transaction pooler).
4. **Import your data once** (from the machine that has `data/hq`/`data/seed`): `DATABASE_URL=... HQ_AGENCY_ID=... npm run hq -- copy-files-to-db` (idempotent, never overwrites).
5. **Deploy** on Vercel (import the GitHub repo). Production refuses to start HQ without `DATABASE_URL`+`HQ_AGENCY_ID` and requires a staff login.

## Backup & recovery
- Database: Supabase daily backups exist on paid plans (Pro); the free plan has none, so use the logical export.
- Logical backup: `npm run hq -- export hq-backup.json` (clients, all fact versions, tasks, approvals, reports, usage). Keep it private (contains client data); schedule weekly. Restore: `npm run hq -- import hq-backup.json` (idempotent; tested round-trip on file and Postgres).
- The activity log is append-only and not part of the JSON export (covered by DB backups).
- Disaster recovery order: new Supabase project → apply `supabase/migrations/*` in order → create agency row + owner → `import`.

## Limits & honesty
- Free-plan projects pause after inactivity; first request after a pause is slow or needs a restore in the dashboard.
- File/asset storage buckets are NOT built yet (reports are stored as text in `hq.outputs`).
- No email/WhatsApp/ads integration is connected.

## Autonomous operation (added 2026-11-01)
- **Migrations** (additive, in order): `20261101000002_hq_executions.sql`, `20261101000003_hq_agency_ops.sql`. **Both applied to the live `marketing-os` project on 2026-11-02**; the security advisor reported no issues. Both are also tested on a real Postgres engine (PGlite) with the earlier migrations.
- **Background work:** `submitInstruction` queues a job; after the response the server starts the worker in the background; `POST /api/worker` (cron) and the "Run worker now" button also process jobs and due schedules. Jobs are leased with `FOR UPDATE SKIP LOCKED`; a crashed worker's lease expires and the run resumes (IN PROGRESS tasks are reset to PENDING). Failed jobs retry with backoff, then stop as `failed`.
- **Cron:** Vercel Hobby only allows daily cron. Use `.github/workflows/worker.yml` (every 10 minutes, free): set repo variable `WORKER_URL` and secret `HQ_WORKER_SECRET`. It is inert until both exist.
- **Env for live AI** (all required): `HQ_AI=live`, `ANTHROPIC_API_KEY`, `HQ_AI_SPEND_APPROVED=1`, caps `HQ_AI_RUN_CAP_USD / DAILY / MONTHLY`.

## Controlled first live AI test (₹100 cap)
One client, one agent (Research), one task. Free dry run first:
```bash
HQ_AI=mock npm run hq -- live-test pahadi-origin
```
Real run (only after you approve the spend): set `ANTHROPIC_API_KEY`, `HQ_AI=live`, `HQ_AI_SPEND_APPROVED=1` and `HQ_LIVE_TEST_APPROVED=1`, then run the same command. Caps are clamped to ₹100. The report checks completion, cost, citations, QA and a secret-leak scan; exit code 0 = PASS.
