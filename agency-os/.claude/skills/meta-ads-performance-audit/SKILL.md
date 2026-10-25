---
name: meta-ads-performance-audit
description: Audit Meta Ads from real exports/connector data.
---
# meta-ads-performance-audit

**Purpose:** Audit Meta Ads from real exports/connector data.

**Required inputs:** CSV or connector data

**Workflow:** 1 Validate data. 2 Funnel metrics (spend, CTR, CPL, CPA). 3 Findings + tests. 4 No live changes.

**Output template:** reports/ads-<date>.md

**Quality checklist:** Blanks where no data; ₹ formatting. Plus rules in knowledge/00 (sources, no invented data, isolation).

**Example invocation:** /ads-report client-002
