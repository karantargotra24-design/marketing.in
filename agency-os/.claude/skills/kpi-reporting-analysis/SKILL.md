---
name: kpi-reporting-analysis
description: Periodic KPI report.
---
# kpi-reporting-analysis

**Purpose:** Periodic KPI report.

**Required inputs:** data export, period

**Workflow:** 1 Load data. 2 Compare to baseline. 3 Insights + next actions.

**Output template:** reports/kpi-<date>.md

**Quality checklist:** Every number traces to a source row. Plus rules in knowledge/00 (sources, no invented data, isolation).

**Example invocation:** /ads-report
