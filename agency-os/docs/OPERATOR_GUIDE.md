# Operator guide
Start: `cd agency-os && claude` (must start here so `.claude/` loads). First time: edit `knowledge/00-source-of-truth.md` and mark rules CONFIRMED.

| You want | Type |
|---|---|
| Onboard a new client | `/onboard-client Acme Dental` |
| Audit client-001 | `/audit client-001-sa-visa-central` |
| Research competitors for client-001 | `/research client-001-sa-visa-central competitors` |
| 30/60/90 growth strategy | `/strategy client-001-sa-visa-central` |
| Next week's Instagram content | `/content-week client-002-jammu-motors` |
| Design prompts for approved content | `/creative-briefs client-002-jammu-motors` |
| Analyse latest ad report | `/ads-report client-002-jammu-motors <csv path>` |
| Monthly client presentation | `/present-month client-001-sa-visa-central` |
| All pending approvals | `/approvals` |
| Weekly agency ops report | `/ops-report` |
| Plan personal brand content | `/personal-content` |
| Weekly intel (personal) | `/weekly-intel` |
| Anything else, any workspace | `/marketing <workspace> <instruction>` |
| QA a file | `/qa <path>` |

Approval: say "approve <item>" in chat. Publishing tools are denied in `.claude/settings.json`; the review-queue tools ask first.
