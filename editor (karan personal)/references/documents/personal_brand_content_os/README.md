# Personal Brand Content OS — Claude + Canva

## Goal
Produce exactly 2 Instagram carousels and 2 static posts per week for a personal brand about AI, digital marketing, and personal branding, in English.

## What is included
- `CLAUDE_PROJECT_INSTRUCTIONS.md`: paste into Claude Project Instructions.
- `memory/BRAND_PROFILE.md`: fill in once.
- `memory/CONTENT_LOG.csv`: record published posts and avoid repetition.
- `memory/PERFORMANCE_LOG.csv`: track outcomes.
- `memory/LEARNING_LOG.md`: carry insights into future weeks.
- `skills/`: eight reusable skill instruction files.
- `AUTOMATION_BLUEPRINT.md`: platform-neutral automation design and acceptance tests.
- `WEEKLY_RUN_COMMAND.md`: one-line command to run the weekly workflow.

## Setup order
1. Create a Claude Project named `Personal Brand Content OS`.
2. Paste `CLAUDE_PROJECT_INSTRUCTIONS.md` into Project Instructions.
3. Upload `BRAND_PROFILE.md`, `CONTENT_LOG.csv`, `PERFORMANCE_LOG.csv`, and `LEARNING_LOG.md` as Project Knowledge.
4. Fill in the brand profile and add existing post examples/reference images.
5. In Canva, create or confirm a Brand Kit and templates for carousel slides and static posts.
6. Choose an automation orchestrator (e.g., Make or Zapier) only after confirming it supports your chosen storage, Claude API access, Canva workflow, and scheduler.
7. Choose a publishing scheduler (Metricool is one candidate) and connect the relevant social account yourself.
8. Test with drafts first. Do not enable automatic publishing until every acceptance test in `AUTOMATION_BLUEPRINT.md` passes.

## Important limitations
Claude Project Knowledge is persistent project context, not a guaranteed automatically updating database. Update/re-upload logs or connect a supported external data store if you want automatic read/write memory. Tool/API availability, plan requirements, and social publishing permissions must be verified in the accounts you use. No integration is assumed connected by this package.
