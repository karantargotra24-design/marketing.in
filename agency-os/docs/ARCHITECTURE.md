# Architecture
```mermaid
flowchart TD
  K[Karan: one instruction] --> C[/marketing command + CLAUDE.md = CEO orchestrator/]
  C -->|pick workspace| W[(personal-brand or clients/id)]
  C --> R[trend / seo / competitor researchers]
  R --> A[auditor]
  A --> G[growth-strategist]
  G --> T[scriptwriter + copywriter]
  T --> D[creative-director -> carousel-editor / reel-editor]
  D --> Q[qa-reviewer PASS/FAIL/BLOCKED]
  Q --> P{Karan approves in chat?}
  P -- yes --> M[Metricool review-only / manual publish]
  P -- no --> T
  M --> N[analyst: performance]
  R & A & G & T & D & Q & N -->|files only| W
  C --> L[logs/audit-trail.md]
```
Subagents cannot spawn subagents, so the orchestrator (main session) chains specialists through files.
Isolation: one workspace per task; shared config (.claude/) contains no client names (tests/isolation.py).
