# Automation Blueprint

## Recommended workflow
1. **Trigger**: weekly schedule in an orchestrator (e.g., Make/Zapier) or manual command during the pilot.
2. **Read context**: fetch brand profile, content log, performance log, and learning log from a supported storage location.
3. **Research and plan**: call the chosen model/API and produce a four-post plan.
4. **Generate drafts**: generate structured content for 2 carousels + 2 statics.
5. **Validate**: check exactly four posts, required fields, source links for factual claims, no duplicate recent topics, and visual text length.
6. **Design**: populate Canva templates only through a supported Canva integration/API/workflow. If unavailable, produce design briefs and stop at this step.
7. **Review**: during pilot, send drafts for human approval. Store approval status.
8. **Schedule**: send approved content to a connected scheduler (candidate: Metricool) only if the account, format, and API/integration support the intended post.
9. **Verify**: record scheduler confirmation, post IDs, asset URLs, and timestamps.
10. **Analytics loop**: on a defined cadence, retrieve available post metrics, append to the performance log, and update learning hypotheses.

## Minimum connector categories
- Model access: Claude interface or API (verify the chosen automation can access it; a Claude Project UI is not automatically callable by external automation).
- Storage: a supported database, spreadsheet, or file store with read/write permissions.
- Design: Canva workflow/API/integration that can create or populate the intended template and export the final asset.
- Publishing: scheduler or official platform API that supports Instagram single-image and carousel formats for the connected account.
- Notifications/approval: email, messaging, or an approval dashboard if desired.

Not every category must be a separate connector, but each function must exist and be tested.

## Important distinction
Claude Project instructions and Project Knowledge help the interactive Claude workspace retain context. An external automation cannot be assumed to read or update that project directly. For a truly unattended workflow, the orchestrator needs supported model/API access and a persistent store that it can read and write.

## Rollout stages
### Stage A — Draft-only pilot
Run manually for 2 weeks. Generate all four posts; review copy and designs. No automated publishing.
### Stage B — Design automation
Connect Canva template workflow if supported. Confirm page count, fonts, colors, image placement, export quality, and asset links.
### Stage C — Scheduling
Connect scheduler and social account. Test drafts or scheduled test posts with explicit authorization.
### Stage D — Analytics and learning
Import metrics and update logs. Check that post IDs match the correct creative.

## Acceptance tests before unattended publishing
- Exactly 2 carousels and 2 statics are generated.
- No post is missing a caption, CTA, or visual brief.
- Every time-sensitive factual claim has a credible source or is flagged.
- Recent content is checked for repetition.
- Canva assets use the correct brand template and export successfully.
- Scheduler confirms the intended date, time zone, format, and account.
- Failed steps trigger an alert and do not publish incomplete content.
- Duplicate runs do not create duplicate scheduled posts.
- User has explicitly authorized automatic scheduling/publishing for the selected account.
- Analytics can be retrieved and mapped to the correct post.
