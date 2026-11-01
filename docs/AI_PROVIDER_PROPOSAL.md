# AI provider & budget proposal — AWAITING YOUR APPROVAL

Nothing here has been purchased or called. The adapter is off until you set a key.
Prices: Anthropic first-party list prices as listed in the Claude API reference on 2026-10-06 (verify on the pricing page before committing). USD→INR assumed ₹88 (assumption; use today's rate).

## Options
| Option | Model (ID) | Input / Output per 1M tokens | Cached input | Best for |
|---|---|---|---|---|
| **A (recommended default)** | Claude Sonnet 5.5 (`claude-sonnet-5-5`) | $2 / $10 | $0.20 | All 7 specialists: strong reasoning, 1M context, cheap enough to run per client weekly |
| B (cheap bulk) | Claude Haiku 5.5 (`claude-haiku-5-5`) | $0.10 / $0.50 (≤100K prompt) | n/a | Classification, tagging, hooks/variants, gap-list drafting |
| C (premium) | Claude Opus 5.5 (`claude-opus-5-5`) | $4 / $20 | $0.20 | Final strategy/audit synthesis only |
| D (top) | Claude Fable 5.1 (`claude-fable-5-1`) | $10 / $50 | n/a | Not needed for this workload |
| E (non-Anthropic) | any OpenAI-compatible endpoint | varies | varies | Implemented as a second adapter if you prefer; needs your key + prices |

Other levers: Batch API runs async at 50% cost (good for nightly reports, not for the live dashboard). Prompt caching cuts repeat-context input to ~10% (workspace facts + agent instructions are the repeated part). Web search is a server-side tool billed per search on top of tokens — **per-search fee not in my reference; confirm on the pricing page before enabling**.

## Estimated cost (assumptions stated; real usage is logged in the dashboard)
Per specialist call ≈ 6,000 input tokens (instructions + the client's facts + shared research) and 1,500 output tokens.
- Sonnet 5.5: 6K×$2/1M + 1.5K×$10/1M = $0.012 + $0.015 ≈ **$0.027 per agent call**; a 7-agent audit ≈ **$0.19 (₹17)**.
- Haiku 5.5: ≈ $0.0014 per agent call; 7-agent run ≈ $0.01 (₹1).
- Content production (monthly calendar + 8 reel scripts + 4 carousels + ad copy, ~25K output tokens, ~15K input): Sonnet 5.5 ≈ $0.03 + $0.25 ≈ **$0.28 (₹25)** per client-month.

| Scenario (3 workspaces) | Runs / month | Sonnet 5.5 | In ₹ |
|---|---|---|---|
| Light | 12 audits + 3 content packs | ≈ $3.1 | ≈ ₹270 |
| Normal | 24 audits + 6 content packs + reruns/retries (×2) | ≈ $12 | ≈ ₹1,050 |
| Heavy | 60 audits + 15 content packs + web search | ≈ $30 + search fees | ≈ ₹2,600+ |
Estimates are ±2×. Retries, long contexts and web search move them; the hard caps below bound the worst case.

## Safeguards implemented before any spend
Per-run, daily and monthly USD caps (`HQ_AI_RUN_CAP_USD`, `HQ_AI_DAILY_CAP_USD`, `HQ_AI_MONTHLY_CAP_USD`), a call cap, every call's tokens and cost logged to the database and shown on `/hq`, key only in server environment variables, AI off unless `HQ_AI=on`.

## What I need from you (AWAITING MY APPROVAL)
1. Provider + model: recommend **Sonnet 5.5 for specialists, Haiku 5.5 for bulk variants**.
2. Monthly budget: recommend **₹1,500/month hard cap** to start (≈ $17), daily cap ₹200.
3. An Anthropic API key placed in the server environment (never in chat or git). Web search: approve separately after you see its per-search price.
