# 00 Source of Truth (v0.2: rules tagged SOURCED come from Karan's Personal Brand Content OS pack; rest ASSUMED)

> Rebuilt from scratch because the original pack was not available. Every rule below is an **ASSUMPTION** inferred from the master prompt. Karan: review, edit, then change the status column to CONFIRMED. Until then, agents follow these as defaults and flag them.

Precedence: latest chat instruction > this file > design system / SOPs > everything else.

| # | Rule | Status |
|---|---|---|
| H1 | Nothing is published, scheduled, sent, or spent without Karan's explicit approval in chat | ASSUMED (from prompt) |
| H2 | Never invent numbers, quotes, testimonials, prices or results. No data -> blank + "no data" | ASSUMED (from prompt) |
| H3 | One workspace at a time. Never move client info/assets/strategy between clients or into personal brand | ASSUMED (from prompt) |
| H4 | Every research claim has a source URL + access date; label facts vs assumptions | ASSUMED (from prompt) |
| H5 | Personal brand content in English only. Handle @karantargotra.a (also seen as the Metricool brand) | English SOURCED (pack); handle OBSERVED in Metricool, unconfirmed |
| H6 | Personal brand formats: carousels and static posts only; never substitute reels or extra posts unless Karan asks | SOURCED (pack: CLAUDE_PROJECT_INSTRUCTIONS) |
| H7 | Design system v3.1 applies. Token values are PLACEHOLDERS in `knowledge/04-design-system-v3.1.md` until Karan supplies the real ones | ASSUMED, content missing; Drive search found no spec, only one draft (see 04) |
| H8 | Personal-brand weekly content is previewed to Karan one day before the scheduled date | ASSUMED (from prompt) |
| H9 | Clone-voice / avatar content is never published until Karan approves a Gate A check | ASSUMED (from prompt) |
| H10 | AI disclosure and platform ad policies are followed; no unverifiable public claims | ASSUMED |
| H11 | Deliverables in English; chat can be Hinglish; currency ₹, time IST | ASSUMED (from preferences) |
| H12 | Credentials never written to files, logs or reports | ASSUMED (standard) |

| P1 | Weekly personal output = EXACTLY 2 carousels (normally 5-8 slides) + 2 static single-image posts, English | SOURCED (pack) |
| P2 | Personal niche: AI, digital marketing, personal branding | SOURCED (pack README) |
| P3 | Quality gate: score each draft 1-5 on accuracy, audience relevance, originality, hook strength, usefulness, readability, brand fit, CTA fit; revise any dimension below 4; flag unverifiable claims instead of inventing | SOURCED (pack) |
| P4 | Never invent credentials, client results, testimonials, personal stories, stats or tool successes. Record URL, publisher, date for time-sensitive claims | SOURCED (pack) |
| P5 | Stage A: draft-only pilot for 2 weeks before any automation; no unattended publishing until all acceptance tests in personal-brand/pack-source/AUTOMATION_BLUEPRINT.md pass | SOURCED (pack) |
| P6 | Memory = personal-brand/memory/ (content log, performance log, learning log). Check CONTENT_LOG before planning; append rows after approval; never claim remembered what is absent | SOURCED (pack) |
| P7 | Weekly trigger phrase "RUN MY WEEKLY CONTENT SYSTEM" runs the full personal pipeline (maps to /personal-content) | SOURCED (pack) |

## Open decisions (ask Karan once, in one batch)
1. Confirm or edit every ASSUMED rule above.
2. Real design system v3.1 tokens (colours, fonts, grid, logo rules).
3. Real content pillars and tone for @karantargotra.a.
4. Real details for client-001 (SA Visa Central) and client-002 (Jammu Motors): services, audience, brand rules, competitors, accounts available.
5. Which connectors may be used for which workspace (e.g. Metricool brand per client).
6. (Answered by pack: reels stay off unless you ask.) Fill personal-brand/brand-profile.md (voice, proof points, audience, colours HEX, fonts, Canva template links, default CTA, preferred days). Without it, content stays generic.
