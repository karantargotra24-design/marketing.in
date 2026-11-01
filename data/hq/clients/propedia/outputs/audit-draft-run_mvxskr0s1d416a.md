# 360° Audit — Propedia

Client ID: propedia · Run: run_mvxskr0s1d416a · Generated: 2026-11-01T12:14:03.945Z

## Executive summary

Computed: 6 of 6 specialist agent(s) produced output; 0 failed; 4 reported insufficient data.
Computed: 21 active fact(s) in this workspace; 7 are unverified (NEEDS VERIFICATION / ASSUMPTION); 16 distinct information gap(s) found.

This audit reflects only information stored in this client's workspace. Gaps are listed, not guessed.

## What each agent found

- **Research & Market Intelligence** (task_mvxskr0s40746a, UNDER REVIEW): Research & Market Intelligence reviewed 5 stored fact(s) for Propedia; 0 required input(s) missing.
- **Business Audit & Strategy** (task_mvxskr0tc297b0, WAITING FOR INPUT): INSUFFICIENT DATA for Propedia: 3 of 5 required inputs are missing. No conclusions were invented.
- **Social Media Strategist** (task_mvxskr0t43420f, WAITING FOR INPUT): INSUFFICIENT DATA for Propedia: 3 of 5 required inputs are missing. No conclusions were invented.
- **SEO & Website** (task_mvxskr0td8a3aa, UNDER REVIEW): SEO & Website reviewed 3 stored fact(s) for Propedia; 2 required input(s) missing.
- **Analytics & Performance** (task_mvxskr0t1e9981, WAITING FOR INPUT): NO DATA: the Propedia workspace holds no performance numbers. No metrics were estimated or invented.
- **Client Operations** (task_mvxskr0t307114, WAITING FOR INPUT): INSUFFICIENT DATA for Propedia: 3 of 4 required inputs are missing. No conclusions were invented.

## Conflicting information

- **brand.colors** has 2 competing values — "Navy #0B3A8C and red #E00000, Poppins (red corner brackets around a house with a tick)" (NEEDS VERIFICATION; source: artifact:09e5a272-7eb5-4ce4-9f3a-b0978c61b51f (Propedia design system README + Messaging)) vs "Forest green #0E412A and gold #D4AF55 (gold brackets around house-and-key), per the diagnostic's logo review" (NEEDS VERIFICATION; source: artifact:949ea29e-2df1-4871-a915-00ac866a5d0a (Propedia Phase 1 Business Diagnostic, 2026-10-20)). Resolve with the client before use.

## Risk flags

- (audit_strategy) Risk flag: "jkrera_status" is NEEDS VERIFICATION; do not use in marketing until verified. — source: fact_mvxskqyg57968e
- (audit_strategy) Risk flag: "stamp_duty" is NEEDS VERIFICATION; do not use in marketing until verified. — source: fact_mvxskqyoc9f733
- (audit_strategy) Risk flag: "price_benchmark" is NEEDS VERIFICATION; do not use in marketing until verified. — source: fact_mvxskqyq35c90c
- (audit_strategy) Risk flag: "colors" is NEEDS VERIFICATION; do not use in marketing until verified. — source: fact_mvxskqza1d88f5
- (audit_strategy) Risk flag: "colors" is NEEDS VERIFICATION; do not use in marketing until verified. — source: fact_mvxskqzdbf8162
- (audit_strategy) Risk flag: "logo_files" is NEEDS VERIFICATION; do not use in marketing until verified. — source: fact_mvxskqzidf3d53

## Missing information

- requirements.goals — strategy targets _(needed by: audit_strategy)_
- campaigns.past_campaigns — marketing history _(needed by: audit_strategy)_
- performance.baseline_metrics — baseline _(needed by: audit_strategy)_
- business.instagram_handle — profile audit _(needed by: social)_
- content.previous_content — content history _(needed by: social)_
- performance.followers — baseline _(needed by: social)_
- business.website_url — site audit _(needed by: seo_web)_
- business.gbp — local SEO _(needed by: seo_web)_
- performance.baseline_metrics — any metric baseline _(needed by: analytics)_
- performance.followers — audience size _(needed by: analytics)_
- performance.ad_metrics — ad results _(needed by: analytics)_
- campaigns.past_campaigns — campaign list _(needed by: analytics)_
- requirements.client_requirements — scope _(needed by: client_ops)_
- requirements.budget — planning _(needed by: client_ops)_
- requirements.goals — success criteria _(needed by: client_ops)_
- Empty knowledge bases: content, campaigns, performance, assets — send the client an onboarding questionnaire (draft only; approval needed to send). _(needed by: client_ops)_

## Recommendations

- (research) Verify each stored competitor on its live Google Business Profile, website and Instagram; the stored snapshot is not an audit.
- (research) Live web research needs an AI/search provider attached to the Research agent (not configured in the app yet): until then this output is a gap-and-plan report only.
- (audit_strategy) Days 1–30: close the 3 information gap(s) this agent lists under Missing information before scaling any marketing spend.
- (audit_strategy) Days 31–60: build one measurable lead channel from verified assets; add tracking (source on every enquiry).
- (audit_strategy) Days 61–90: review baseline vs results and decide on paid expansion with Karan's approval.
- (audit_strategy) Resolve 6 flagged unverified claim(s)/fact(s) first (see Risk flags).
- (social) Confirm the Instagram/Facebook/YouTube/LinkedIn accounts to be managed; none are stored.
- (social) No posting happens without approval (Approval Gate).
- (seo_web) No live website URL is stored: confirm where customers actually buy/enquire before any SEO work.
- (seo_web) Local SEO: create/claim Google Business Profile if not present (needs owner access).
- (analytics) Export last 30–90 days from Meta Ads Manager / Instagram Insights / GA4 (or approve read-only connector access) and import into the Performance knowledge base.
- (client_ops) Convert the missing-information list into a short client questionnaire (WhatsApp/email draft for Karan's approval).

## Limitations

- Agents are rule-based workspace analysts: they do not browse the web or call ad platforms from this app. Live research and platform data require an AI provider and approved connectors (see Integrations).
- Nothing in this report has been published, sent or spent. External actions need explicit approval.
