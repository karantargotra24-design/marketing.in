---
name: final-quality-assurance
description: QA gate before delivery.
---
# final-quality-assurance

**Purpose:** QA gate before delivery.

**Required inputs:** deliverable path

**Workflow:** 1 Facts/sources. 2 Brand. 3 Claims/policy. 4 Specs. 5 Isolation. 6 Verdict.

**Output template:** reports/qa-<date>.md with PASS/FAIL/BLOCKED

**Quality checklist:** Verdict on line 1; each FAIL has fix. Plus rules in knowledge/00 (sources, no invented data, isolation).

**Example invocation:** /qa <path>

**Content scoring (SOURCED, P3):** score each draft 1-5 on accuracy, audience relevance, originality, hook strength, usefulness, readability, brand fit, CTA fit. Any dimension <4 -> revise or FAIL. Unverifiable claim -> flag.
