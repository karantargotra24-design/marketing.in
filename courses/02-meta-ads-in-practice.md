# Meta Ads in Practice: Complete Course Pack
**ScapeMedia Academy · Instructor: Karan Targotra**
Intermediate · 8 live classes · 4 weeks (2 classes/week) · 90 min each · Google Meet · ₹6,499

> How to use this pack: each class has a run-of-show, teaching notes, a live demo inside Ads Manager, an activity, a 5-question quiz with answers, and homework. Assignments 1–4 have full briefs and rubrics at the end. Mark your own client examples where it says **[YOUR EXAMPLE]** and blur client numbers you can't share.
> Meta changes its menus often: check the live interface the day before each class and update screenshots.

---

## Course promise
By the end, a student can **set up a Meta ad account correctly, track conversions, build lead-generation and click-to-WhatsApp campaigns for a local business, read the numbers, and decide what to fix or scale.**

## Who it's for
Freelancers, marketers, agency juniors and business owners who already post on Instagram but aren't getting leads from ads. Basic Instagram/Facebook knowledge expected (or Digital Marketing Foundations).

## Practical rule
Every student runs **one real campaign**: on their own business, a friend's or family business, or a practice page. A recommended test budget of **₹300–₹500/day for 5–7 days** (about ₹2,000–₹3,500 in total, paid by the student directly to Meta). Students who can't spend still complete every assignment as a plan, but are told clearly that the learning is stronger with live data.

## Pre-class checklist (students)
- Facebook account (real, older than a few weeks; brand-new accounts get restricted more often)
- A Facebook Page + Instagram professional account linked to it (practice page is fine)
- A payment method that works for ads (card or other options Meta shows in India)
- Practice business chosen + its WhatsApp Business number
- Canva account

---

# CLASS 1: Business Setup Done Right
**Goal:** every student has a clean business portfolio, ad account, page, Instagram and payment set up correctly.

### Run of show (90 min)
| Time | Segment |
|---|---|
| 0–10 | Welcome, intros ("business + what you've tried with ads before") |
| 10–25 | Why accounts get restricted (and how to avoid it) |
| 25–65 | Live demo: business portfolio, ad account, page, Instagram, payment, people/roles |
| 65–80 | Students set up live; troubleshooting in chat |
| 80–90 | Quiz + homework |

### Teaching notes
**1. The asset map (draw it):**
`Business portfolio (Business Manager)` → owns → `Ad account` + `Facebook Page` + `Instagram account` + `Pixel/dataset` + `WhatsApp number`
"The business portfolio is the building. Ad accounts, pages and pixels are the rooms."

**2. Setup checklist**
- [ ] Create a business portfolio in Meta Business Suite / Business settings
- [ ] Add the Facebook Page (own it, or request access if it's a client's)
- [ ] Connect the Instagram professional account
- [ ] Create the ad account: **time zone Asia/Kolkata, currency INR** (these can't be changed later)
- [ ] Add a payment method + billing details (GST number if the business has one)
- [ ] Add people with the **minimum role they need**
- [ ] Turn on two-factor authentication for everyone

**3. Agency vs owner**
When managing a client: **the client owns, the agency gets partner access.** Never create a client's ad account inside your own portfolio if you can avoid it, because they lose control if you part ways.

**4. Avoiding restrictions**
- Don't spam-create accounts or pages
- Real profile, real name, 2FA on
- Follow ad policies: no "before/after" body claims, no "guaranteed" income claims, no personal-attribute wording ("Are you overweight?")
- **Special ad categories** (housing, employment, credit/financial products, social issues/politics) must be declared and limit targeting. Relevant for real estate and loan clients.

### Live demo
Screen-share a full setup from zero on a practice business (or show your agency structure with client names blurred **[YOUR EXAMPLE]**).

### Quiz: Class 1
1. Which two ad-account settings can't be changed later?
   **Time zone and currency**
2. When you manage a client's ads, who should own the ad account?
   **The client (agency gets partner access)**
3. Real estate ads may need which declaration?
   **Special ad category (housing)**
4. Why turn on 2FA?
   **Account security; it reduces hacks and restrictions**
5. "Guaranteed ₹50,000/month from home!" Is this OK in an ad?
   **No: it's a misleading income claim, likely rejected**

### Homework
- Finish the full setup and post screenshots of Business settings (names visible, IDs blurred).
- **Start Assignment 1** (account setup + tracking), due before Class 3.

---

# CLASS 2: Pixel, Conversions API & Tracking
**Goal:** students install the Meta Pixel, understand events and the Conversions API, and verify tracking works.

### Run of show (90 min)
| Time | Segment |
|---|---|
| 0–10 | Recap + setup issues |
| 10–25 | Why tracking decides whether ads work |
| 25–55 | Live demo: create a dataset/Pixel, install it, test events |
| 55–70 | Events, parameters, Conversions API (concept) |
| 70–80 | UTM links |
| 80–90 | Quiz + homework |

### Teaching notes
**1. Why tracking matters.** Meta's delivery system learns from the events you send. No good signal = Meta optimises for the wrong people. "You're training an algorithm. Feed it the right examples."

**2. Pixel basics**
- Pixel = code on your website that tells Meta what visitors do
- **Standard events:** PageView, ViewContent, Lead, Contact, Schedule, CompleteRegistration, Purchase
- Install via: website platform integration (Shopify, WordPress, Wix), Google Tag Manager, or code
- Test with **Events Manager → Test events** and the **Meta Pixel Helper** Chrome extension

**3. Conversions API (CAPI)**
Sends events from the server instead of the browser, so it's more reliable when browsers block tracking. Use platform integrations (Shopify, WordPress plugins, Zapier/Make for forms) when possible. Explain **deduplication**: send the same event ID from Pixel and CAPI so it isn't counted twice.

**4. Lead businesses without a website**
- Instant forms: leads are tracked inside Meta, no Pixel needed
- Click-to-WhatsApp: tracked as conversations started
- Still worth having a landing page later for retargeting and better quality

**5. Domain verification** (Business settings → Brand safety → Domains) is needed to configure events on your domain properly.

**6. UTMs**
`?utm_source=meta&utm_medium=paid&utm_campaign=nov_leads&utm_content=reel_hook1`
Use Meta's **URL parameters** field with dynamic values like `{{campaign.name}}` and `{{ad.name}}` so Google Analytics shows which ad sent the visitor.

### Live demo
Create a dataset/Pixel → install on a test landing page (Wix/WordPress/HTML) → fire a Lead event on form submit → show it arrive in Test events.

### Quiz: Class 2
1. Which tool shows events arriving in real time?
   **Events Manager → Test events (or Pixel Helper)**
2. What's the benefit of the Conversions API?
   **Server-side events, more reliable tracking**
3. Pixel + CAPI send the same Lead. How do you avoid double counting?
   **Deduplication with the same event ID/name**
4. Name 3 standard events.
   **Any 3: PageView, ViewContent, Lead, Contact, Schedule, Purchase…**
5. A business has no website. Which 2 lead methods still work?
   **Instant forms and click-to-WhatsApp**

### Homework
- Install a Pixel on any test page (free Wix/Google Sites/Carrd is fine) and fire one event; screenshot Test events.
- **Submit Assignment 1** before Class 3.

---

# CLASS 3: Audiences That Work for Local Businesses
**Goal:** students build location, interest/broad, custom and lookalike audiences, and know when to use each.

### Run of show (90 min)
| Time | Segment |
|---|---|
| 0–10 | Recap + Assignment 1 highlights |
| 10–30 | Location targeting for local businesses |
| 30–50 | Broad vs interests vs Advantage+ audience |
| 50–70 | Live demo: custom + lookalike audiences |
| 70–80 | Audience size and overlap |
| 80–90 | Quiz + homework |

### Teaching notes
**1. Location first (local businesses)**
- City, or **radius around the pin** (e.g. 10–20 km around Gandhi Nagar)
- Choose "People living in or recently in this location" (default); avoid travellers unless it's tourism (Katra/Vaishno Devi businesses may *want* travellers)
- J&K reality: smaller audiences, so don't over-narrow

**2. Three ways to target**
| Approach | When |
|---|---|
| **Broad** (location + age only) | Clear creative, enough budget, conversion objective |
| **Interests** | New account with little data, niche products |
| **Advantage+ audience** | Let Meta expand using your suggestions as hints; test it vs your manual audience |

"In 2026, **the creative is the targeting.** A reel that says 'Jammu ke car owners…' finds Jammu car owners."

**3. Custom audiences (warm)**
- Instagram/Facebook engagers (last 30–365 days)
- Video viewers (e.g. 50%+ of a reel)
- Website visitors (Pixel)
- Customer list (phone numbers/emails, hashed by Meta; you must have consent)
- Lead form openers who didn't submit

**4. Lookalikes**
Built from a good source (customers, leads). 1% = closest match. In India, a 1% lookalike is a large audience; **combine it with the location** for local businesses.

**5. Audience size sanity check**
For a ₹500/day local campaign, aim for **roughly 50,000–5,00,000** people. Too small means high CPM and fatigue; too big for a local business means wasted reach outside the service area.

### Live demo
Create: (1) a 365-day IG engagers audience, (2) a 50% video viewers audience, (3) a 1% lookalike from a customer list **[YOUR EXAMPLE, data blurred]**.

### Quiz: Class 3
1. For a Katra hotel, which location option might be useful?
   **People travelling in / recently in the location**
2. What's a custom audience?
   **People who already interacted with you (engagers, visitors, customers)**
3. What does "the creative is the targeting" mean?
   **The ad's message and visuals attract the right people, even with broad targeting**
4. A 1% lookalike in India is huge. How do you make it local?
   **Restrict it with the location/radius**
5. What do you need before uploading a customer phone list?
   **Customer consent / lawful basis**

### Homework
- Build 2 custom audiences + 1 lookalike (or document the steps if there's no data yet).
- **Start Assignment 2** (creative pack), due before Class 6.

---

# CLASS 4: Campaign Structure, Objectives & Budgets
**Goal:** students choose the right objective, structure campaigns for testing, and set ₹ budgets with clear expectations.

### Run of show (90 min)
| Time | Segment |
|---|---|
| 0–10 | Recap |
| 10–30 | Objectives → what Meta optimises for |
| 30–50 | Testing structure (simple, not 20 ad sets) |
| 50–70 | Budgets: daily vs lifetime, CBO (Advantage campaign budget) vs ad set budget |
| 70–80 | Learning phase |
| 80–90 | Quiz + homework |

### Teaching notes
**1. Objectives:** Awareness · Traffic · Engagement · Leads · App promotion · Sales
- **Leads** → instant forms, or website leads with a Pixel Lead event, or messaging
- **Engagement / Leads with messaging destination** → click-to-WhatsApp
- **Sales** → website purchases (ecommerce)
- **Traffic** only when you truly just want visits (rare for local leads)
"Meta gives you what you ask for. Ask for clicks, you get clickers. Ask for leads, you get form-fillers."

**2. Simple testing structure (for ₹500–₹1,000/day)**
```
Campaign: Leads, Nov, Jammu Motors service
 └ Ad set: Jammu 15 km, 22–55, broad
     ├ Ad A: Reel, hook "price"
     ├ Ad B: Reel, hook "problem"
     └ Ad C: Static, offer
```
Test **creatives first**, audiences second. One variable at a time.

**3. Budget maths**
- Daily budget = (target leads × expected CPL) ÷ days
- Example: want 60 leads in 30 days at ₹80 CPL → ₹4,800 ÷ 30 = **₹160/day minimum**; start at ₹300 to learn faster
- Lifetime budget: good for fixed-date events or offers
- Advantage campaign budget (CBO): Meta shifts money between ad sets automatically; good once you have 2+ ad sets with a similar audience size

**4. Learning phase**
Meta needs about **50 optimisation events per ad set per week** to exit learning. With small local budgets you may stay in "learning limited". That's normal; judge by CPL and lead quality, not the label.
**Don't edit an ad set every day**: significant edits restart learning.

### Live demo
Build the full test structure above in Ads Manager with naming conventions:
`[Client]_[Objective]_[Month]_[Audience]_[Creative]` → `JM_Leads_Nov_15km_ReelPrice`

### Quiz: Class 4
1. Best objective for click-to-WhatsApp leads:
   **Engagement or Leads with a messaging destination**
2. Test creatives or audiences first?
   **Creatives first**
3. 40 leads in 20 days at ₹100 CPL → daily budget?
   **₹200/day**
4. About how many optimisation events per week to exit learning?
   **~50 per ad set**
5. What restarts the learning phase?
   **Significant edits (budget jumps, targeting, creative, optimisation changes)**

### Homework
- Draft your campaign structure + naming in a Doc (it feeds Assignment 3).

---

# CLASS 5: Creatives & Copy That Convert
**Goal:** students produce scroll-stopping ad creatives (reels, statics, carousels) and copy, built on proven frameworks.

### Run of show (90 min)
| Time | Segment |
|---|---|
| 0–10 | Recap |
| 10–30 | What makes an ad stop the scroll |
| 30–50 | Frameworks: hooks, PAS, offer stacking |
| 50–75 | Live demo: 3 creatives in Canva/CapCut in 25 minutes |
| 75–90 | Students' hooks reviewed live + homework |

### Teaching notes
**1. Anatomy of a winning ad**
**Hook (0–3s)** → **Problem/desire** → **Proof** → **Offer** → **CTA**
Native-looking > "polished ad". Phone-shot, face-to-camera, real location in Jammu outperforms stock images for local businesses.

**2. 10 hook templates**
1. "Jammu walo, [problem] se pareshan ho?"
2. "Stop doing [mistake] before you [action]"
3. "[Number] things nobody tells you about [topic]"
4. "I tried [X] so you don't have to"
5. "This is what ₹[amount] gets you at [business]"
6. "POV: you finally [desired result]"
7. "If you live in [area], watch this"
8. "Before you buy [product], see this"
9. "We asked 100 customers… here's what they said" (only if true)
10. "Last [N] slots for [offer]" (only if true)

**3. Copy frameworks**
- **PAS:** Problem → Agitate → Solution
- **AIDA:** Attention → Interest → Desire → Action
- **Offer stack:** main offer + bonus + risk reducer + urgency (only real urgency)

**4. Formats to test**
- 9:16 reel (15–30 sec), with text captions burned in (most watch on mute)
- 1:1 or 4:5 static with **one** big message + price/offer
- Carousel: "3 reasons", "before/after" (avoid prohibited body before/afters), product range

**5. Ad copy template**
```
Primary text:
[Hook line]
[2–3 lines on the problem/benefit]
✅ [Benefit 1]
✅ [Benefit 2]
✅ [Proof/offer]
👉 [CTA: Tap "Send WhatsApp message" / "Get quote"]

Headline: [Offer in 5–7 words]
CTA button: Send WhatsApp message / Get quote / Book now
```

### Live demo
Make 1 reel (CapCut, captions on), 1 static (Canva) and 1 carousel for a local business **[YOUR EXAMPLE]**, then write the copy for all three.

### Quiz: Class 5
1. Why burn captions into reels?
   **Most people watch with sound off**
2. PAS stands for:
   **Problem, Agitate, Solution**
3. Which usually wins for local businesses: polished stock or native phone-shot?
   **Native phone-shot (looks like real content)**
4. Is "Last 5 slots!" OK if you have unlimited slots?
   **No: fake urgency hurts trust and may break policy**
5. Name the 5 parts of a winning ad.
   **Hook, Problem/desire, Proof, Offer, CTA**

### Homework
- **Submit Assignment 2** (creative pack: 3 creatives + copy) before Class 6.

---

# CLASS 6: Lead Forms vs Click-to-WhatsApp: Building the Funnel
**Goal:** students build high-quality instant forms and WhatsApp flows, and connect leads to a sheet so none are lost.

### Run of show (90 min)
| Time | Segment |
|---|---|
| 0–10 | Recap + creative feedback |
| 10–30 | Instant forms: volume vs quality |
| 30–50 | Click-to-WhatsApp: setup + first-message design |
| 50–70 | Live demo: connect leads to Google Sheets + instant alert |
| 70–80 | Speed-to-lead and follow-up |
| 80–90 | Quiz + launch checklist for Assignment 3 |

### Teaching notes
**1. Instant forms**
- **More volume:** fewer steps, cheaper leads, more junk
- **Higher intent:** adds a review screen, so leads cost more but are better quality
- Add **1–2 qualifying questions** (budget, timeline, area), and use multiple choice to keep it fast
- Intro: headline + 3 bullets on the offer
- Thank-you screen: "We'll WhatsApp you within 30 minutes" + WhatsApp/call button

**2. Click-to-WhatsApp**
- Destination: WhatsApp (needs your WhatsApp Business number connected to the page)
- **Pre-filled first message / ice-breakers:** "I want today's service price", "Book a test drive", "Send the brochure"
- Pros: conversation starts instantly, high trust in India. Cons: you must reply fast, so set up quick replies and away messages.

**3. Never lose a lead**
- Forms: download from the page's leads centre, or **auto-sync to Google Sheets** (Zapier/Make/n8n or a CRM integration)
- Alert on new lead (email/WhatsApp to the owner)
- Track: Date · Name · Phone · Ad name · Status · Follow-up date

**4. Speed-to-lead**
Call or WhatsApp within **5 minutes**. Leads go cold quickly and competitors are often messaging the same person.

### Live demo
Build a Higher-intent instant form with 2 qualifying questions → connect to Google Sheets via Zapier/n8n → submit a test lead → see it arrive + alert. Then set up a click-to-WhatsApp ad with 3 ice-breakers.

### Quiz: Class 6
1. Lead quality is poor. Which form type do you switch to?
   **Higher intent**
2. What's a good qualifying question for a car service centre?
   **e.g. Car model / Preferred day / Service type (multiple choice)**
3. Biggest risk of click-to-WhatsApp?
   **Slow replies lose the lead**
4. Ideal reply time for a new lead:
   **Under 5 minutes**
5. Name 2 ways to get form leads into a sheet automatically.
   **Zapier, Make, n8n, a CRM integration**

### Homework
- **Assignment 3: launch your live campaign** (or the full plan if no budget). Runs between Class 6 and Class 8.

---

# CLASS 7: Reading Results & Optimising
**Goal:** students read the numbers, diagnose problems in the right order, and make one change at a time.

### Run of show (90 min)
| Time | Segment |
|---|---|
| 0–10 | Recap + early campaign check-ins |
| 10–30 | Custom columns: the dashboard to use |
| 30–55 | The diagnosis ladder |
| 55–80 | Live: review 3–4 student campaigns on screen |
| 80–90 | Quiz + homework |

### Teaching notes
**1. Custom columns (save as a preset)**
Delivery · Amount spent · Results · Cost per result · CPM · CTR (link) · CPC (link) · Frequency · Hook rate (3-sec video plays ÷ impressions; create it as a custom metric) · Lead form opens (for forms)

**2. The diagnosis ladder (go top to bottom)**
| Symptom | Likely cause | Fix |
|---|---|---|
| Low impressions / not spending | Audience too small, low bid, rejected ad | Widen audience, check ad status |
| High CPM | Small audience, competition, low-quality ad | Widen audience, improve creative |
| Low hook rate (<25–30%) | First 3 seconds weak | New hook/opening shot |
| Low CTR (link) (<~1%) | Message/offer not compelling | Better offer, clearer CTA |
| Good CTR, few leads | Form/landing/WhatsApp friction | Simplify form, faster page, better first message |
| Cheap leads, no sales | Low intent or slow follow-up | Higher-intent form, qualifying questions, speed-to-lead |
| CPL rising over time | Creative fatigue (frequency up) | New creatives |

These benchmarks are rough guides; compare against **your own account's** history.

**3. Rules of optimisation**
- Wait **3–4 days or ~1–2× target CPL spent** before judging an ad
- Kill clear losers, keep winners, add 1–2 new creatives a week
- **One change at a time**, and write it in a change log (date, change, reason)

**4. Breakdowns**
Use Breakdown → by Age, Gender, Placement, Time of day to find where leads come from. Don't over-cut audiences based on tiny data.

### Live demo
Pull up 3–4 student campaigns (with permission) and diagnose each with the ladder live. Show one of your own anonymised accounts **[YOUR EXAMPLE]**.

### Quiz: Class 7
1. High CTR but very few form submissions. Where's the problem?
   **The form/landing/WhatsApp step (friction after the click)**
2. Frequency 4.5 and CPL rising. What do you do?
   **Refresh creatives**
3. How to calculate hook rate?
   **3-second video plays ÷ impressions**
4. How long before you judge an ad?
   **3–4 days or ~1–2× target CPL spent**
5. Why keep a change log?
   **To know which change caused which result**

### Homework
- Optimise your live campaign once using the ladder; log the change.
- **Start Assignment 4** (performance report), to be presented in Class 8.

---

# CLASS 8: Scaling, Reporting & Live Account Reviews
**Goal:** students know when and how to scale, write a client-ready report, and present their campaign results.

### Run of show (90 min)
| Time | Segment |
|---|---|
| 0–15 | Scaling: vertical vs horizontal |
| 15–25 | Retargeting layer |
| 25–35 | Writing a client report |
| 35–80 | Student presentations (Assignment 4), 4 min each + feedback |
| 80–90 | Wrap-up, feedback form, testimonial request, next steps |

### Teaching notes
**1. When to scale:** stable CPL for 5–7 days + lead quality confirmed (sales happening).
- **Vertical:** raise budget **~20–30% every 2–3 days**
- **Horizontal:** duplicate the winner to new audiences (lookalike, broader radius, Advantage+ audience) or new placements
- Don't double budgets overnight on small accounts; performance often drops

**2. Retargeting (small budget, high return)**
Audience: video viewers 50% + IG engagers + website visitors (30 days) − existing leads.
Creative: testimonials, offer reminder, FAQ answers. Budget: 10–20% of total.

**3. Client report template (1 page, monthly)**
```
Period: 1–30 Nov
Spend: ₹X | Leads: X | CPL: ₹X (vs last month ₹X)
Best ad: [name], why it worked
What we changed: [3 bullets]
Lead quality: X% reached by phone, X booked (from client's sheet)
Next month: [3 actions], proposed budget ₹X
```
Never report only reach and likes to a lead-generation client.

### Final presentations (Assignment 4)
Feedback format: **what worked · what you'd change · the next test.**

### Wrap-up
- Completion: all classes + 4 assignments
- Next: **AI for Marketers**, to produce creatives and automate lead handling faster
- Feedback form + ask for a review (screenshot or 30-sec video)

### Quiz: Class 8 (final)
1. Safe vertical scaling step size:
   **~20–30% every 2–3 days**
2. Horizontal scaling means:
   **Duplicating winners to new audiences/placements**
3. Who should be excluded from retargeting?
   **Existing leads/customers**
4. Top line of a lead-gen report:
   **Spend, leads, CPL (vs previous period)**
5. When is a campaign ready to scale?
   **Stable CPL for 5–7 days + confirmed lead quality/sales**

---

# ASSIGNMENTS (briefs + rubrics)

## Assignment 1: Account Setup & Tracking
**Given:** Class 1 · **Due:** before Class 3 · **Format:** Google Doc with screenshots (IDs blurred)
1. Business portfolio with page, Instagram and ad account connected
2. Ad account settings (time zone, currency) + payment added
3. People and roles: who has what access and why
4. Pixel/dataset created + one event visible in Test events (or the steps documented if no website)
5. One UTM-tagged URL for your future ad

**Rubric (20 marks)**
| Criteria | Marks |
|---|---|
| Assets correctly connected | 6 |
| Correct ad account settings + payment | 3 |
| Sensible roles (least access) | 3 |
| Pixel event verified | 6 |
| UTM correct | 2 |

## Assignment 2: Creative Pack
**Given:** Class 3 · **Due:** before Class 6 · **Format:** Drive folder + Google Doc
1. **3 creatives:** 1 reel (15–30 sec, captions), 1 static, 1 carousel
2. **Copy for each:** primary text, headline, CTA button
3. 5 alternative hooks for the reel
4. One line per creative: the angle and why it should work for this audience

**Rubric (25 marks)**
| Criteria | Marks |
|---|---|
| Hooks stop the scroll (first 3 sec / first line) | 7 |
| Clear offer + CTA | 5 |
| Native, mobile-first quality (captions, safe zones, readable) | 5 |
| Copy follows a framework (PAS/AIDA) | 4 |
| Policy-safe (no fake urgency, no prohibited claims) | 4 |

## Assignment 3: Live Campaign Launch (or Full Plan)
**Given:** Class 6 · **Runs:** Class 6 → Class 8 · **Format:** Google Doc + Ads Manager screenshots
1. Objective + reason
2. Campaign → ad set → ads structure with naming convention
3. Audience + location + budget maths (expected leads)
4. Lead capture: instant form (questions shown) or WhatsApp first message/ice-breakers
5. Lead sheet set up (screenshot)
6. Launch screenshot + first 3 days of results (or, without budget, a full plan + expected results)

**Rubric (25 marks)**
| Criteria | Marks |
|---|---|
| Correct objective and clean structure | 6 |
| Realistic audience + budget maths | 5 |
| Lead capture quality (qualifying questions, thank-you screen) | 5 |
| Lead tracking in place | 4 |
| Launched / plan completeness | 5 |

## Assignment 4: Performance Report & Presentation
**Given:** Class 7 · **Due:** presented in Class 8 · **Format:** 1-page report (template from Class 8) + 3–5 slides
1. Spend, results, CPL, CTR, frequency (actual, or projected for plan-only students)
2. Best and worst ad, and why
3. Change log: what you changed and what happened
4. Lead quality notes (contacted / booked)
5. Next 30 days: 3 actions + budget

**Rubric (30 marks)**
| Criteria | Marks |
|---|---|
| Numbers correct and clearly presented | 8 |
| Diagnosis uses the ladder logic | 8 |
| Change log + learning | 5 |
| Clear, actionable next steps | 5 |
| Presentation within time | 4 |

**Total course score:** A1 20 + A2 25 + A3 25 + A4 30 = **100**
Completion suggestion: 60+ and all classes attended or watched.

---

## Instructor kit
- [ ] Practice business portfolio for demos (separate from client accounts)
- [ ] Blurred screenshots from 2–3 real campaigns **[YOUR EXAMPLE]**
- [ ] Templates: naming convention sheet, budget calculator sheet, lead sheet, custom-columns list, change log, monthly report
- [ ] 8 Google Forms quizzes
- [ ] Check Meta's current interface the day before each class
- [ ] Policy reminder slide in every class where students create ads

### Welcome message (Day 0)
```
Welcome to Meta Ads in Practice 🚀 (ScapeMedia Academy)

📅 Classes: [days], [time], 90 min, Google Meet
🔗 Link: [link]
🎥 Recordings shared here the same day

Before Class 1, please have:
1) Your Facebook account (2FA on)
2) A Facebook Page + Instagram professional account for your practice business
3) A payment method ready (₹300–500/day test budget recommended from Class 6)

Reply with: your name + the business you'll run ads for 👇
– Karan
```
