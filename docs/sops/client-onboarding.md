# SOP: Client onboarding (shared across clients; contains no client data)
1. Run `npm run hq -- onboard <id> "<Client Name>"` (or Agency HQ → Add client). This creates an empty, isolated workspace with the approval policy.
2. Collect facts per knowledge base (business, brand, audience, competitor, content, strategy, campaigns, performance, assets, requirements). Every fact needs a source and a status label.
3. Run the `onboarding` workflow; send the resulting gap list to the client as a questionnaire (draft → Karan approves → Karan sends).
4. Run `audit_360`. Resolve every item under "Conflicting information" and "Risk flags" before using the data in public marketing.
