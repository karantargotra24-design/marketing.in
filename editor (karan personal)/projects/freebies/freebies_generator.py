import os, html as H
OUT=os.environ["OUT"]; E=H.escape
CSS="""@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@800&family=Instrument+Serif:ital@0;1&display=swap');
@page{size:A4;margin:12mm 0 16mm} @page :first{margin-top:0} *{box-sizing:border-box;margin:0} body{font:400 11pt/1.5 Inter,sans-serif;color:#0B0B0B}
.cover{background:#0B0B0B;color:#fff;padding:22mm 18mm 16mm;position:relative}
.cover .k{font:600 8.5pt Inter;letter-spacing:.16em;color:#FF0000} .cover h1{font:400 34pt/1 'Instrument Serif',serif;margin-top:6mm} .cover h1 b{font:800 30pt 'Plus Jakarta Sans';letter-spacing:-.03em;display:block;color:#FF0000;text-transform:uppercase;margin-top:2mm}
.cover p{margin-top:5mm;color:#ccc;max-width:140mm} .cover .h{position:absolute;right:18mm;top:22mm;font:400 13pt 'Instrument Serif'}
.body{padding:10mm 18mm 18mm} h2{font:800 15pt 'Plus Jakarta Sans';letter-spacing:-.02em;margin:7mm 0 3mm;display:flex;gap:3mm;align-items:baseline} h2 span{font:400 22pt 'Instrument Serif';color:#FF0000}
.box{border:1.5px solid #0B0B0B;border-radius:4mm;padding:4mm 5mm;margin:2.5mm 0;break-inside:avoid} .box small{display:block;font:600 8pt Inter;letter-spacing:.14em;color:#6B6B6B;margin-bottom:1.5mm}
.prompt{font:500 10.5pt/1.5 'Courier New',monospace;background:#F4F4F4;border-radius:3mm;padding:3.5mm 4mm;white-space:pre-wrap}
ul.ck{list-style:none;padding:0} ul.ck li{padding:2.2mm 0 2.2mm 9mm;border-bottom:1px solid #E6E6E6;position:relative} ul.ck li:before{content:"";position:absolute;left:0;top:2.6mm;width:4.5mm;height:4.5mm;border:1.5px solid #0B0B0B;border-radius:1mm}
.tip{background:#0B0B0B;color:#fff;border-radius:4mm;padding:4mm 5mm;margin-top:6mm} .tip b{color:#FF0000}
.foot{position:fixed;bottom:8mm;left:18mm;right:18mm;display:flex;justify-content:space-between;font:500 8pt Inter;color:#6B6B6B;border-top:1px solid #E6E6E6;padding-top:2mm}
"""
def doc(fname,kicker,title,punch,intro,body):
    h=f"<!DOCTYPE html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body><div class='cover'><div class='h'>@karantargotra.a</div><div class='k'>{kicker}</div><h1>{title}<b>{punch}</b></h1><p>{intro}</p></div><div class='body'>{body}</div></body></html>"
    open(f"{OUT}/{fname}.html","w").write(h)
P=lambda t: f"<div class='prompt'>{E(t)}</div>"
# 1 — C1: 5-prompt pack
tasks=[("Caption first drafts","ChatGPT (or any AI chat)","You are a social media copywriter for [business/niche].\nAudience: [who they are, city, age].\nWrite 10 hook options for a post about [topic].\nTone: [friendly / expert / witty]. Max 12 words each.\nThen write 1 caption under 120 words using the best hook, ending with one question."),
("Summarise long documents","Claude (or any AI chat)","Here are my notes / client brief:\n[paste text]\nSummarise in a table with 3 columns: Key decisions | Open questions | Next steps (owner + deadline if mentioned).\nDon't add anything that isn't in the text. Flag anything unclear."),
("Research a topic fast","Gemini (or any AI chat with web access)","Give me a short overview of [topic] for [audience] in India.\nList 5 key points, each with the source link and date.\nMark anything you are unsure about.\nI will open and check every source before I use it."),
("Resize one design","Canva","No prompt needed. Steps:\n1. Finish your 4:5 post (1080×1350).\n2. Use Resize (Canva Pro) to make a 9:16 Story, a Reel cover and a LinkedIn version.\n3. Fix text that moved and keep the key word inside the safe area.\nNo Pro? Duplicate the design into a new size and copy the elements over."),
("Draft replies to common DMs","Any AI chat","Here are the 10 questions I get most in DMs:\n[paste list]\nWrite a short, friendly reply to each (max 40 words), in my voice: [describe how you talk].\nEnd each reply with one clear next step.\nI'll save these as quick replies.")]
b="".join(f"<h2><span>{i:02d}</span>{E(t)}</h2><div class='box'><small>TOOL</small>{E(tool)}</div>{P(pr)}" for i,(t,tool,pr) in enumerate(tasks,1))
b+="<div class='tip'><b>Rule:</b> AI writes the first draft. You add your own example and edit it in your voice before you post.</div>"
doc("01_5_tasks_prompt_pack","FREE PROMPT PACK","5 tasks to hand","TO AI THIS WEEK","The exact prompts for the 5 tasks from the carousel. Fill in the [brackets] and paste.",b)
# 2 — S1: 10 ready prompts
ten=[("Instagram hooks","Act as a social media copywriter for [business]. Audience: [who]. Write 10 hooks for a post about [topic]. Max 12 words each. No emojis."),
("Caption","Write 3 captions for [business] about [topic]. Tone: [tone]. Under [N] words. End each with a question to the reader."),
("Carousel outline","Plan a 7-slide Instagram carousel on [topic] for [audience]. Slide 1 hook, slides 2–6 one idea each, slide 7 call to action. Max 25 words per slide."),
("Reel script","Write a 30-second Reel script on [topic]. Hook in the first line, 3 quick points, one call to action. Mark what to show on screen for each line."),
("Ad copy variations","Act as a Meta Ads copywriter. Product: [product], price [₹], audience [who]. Write 5 primary texts under 125 characters and 5 headlines under 40 characters."),
("Customer persona","Based on this info about my customers: [paste], create one customer persona: goals, problems, objections, where they spend time online, words they use."),
("Content calendar","Create a 2-week content plan for [business] on Instagram: 3 posts a week. Columns: date, format, topic, hook, call to action. Mix education, proof and offers."),
("Reply to a review","Write a polite reply to this customer review: [paste]. Thank them, address the point they raised, keep it under 60 words, no excuses."),
("Repurpose content","Turn this [blog/caption/video transcript]: [paste] into 1 LinkedIn post, 1 Instagram caption and 3 tweet-length lines. Keep my main point the same."),
("Improve my prompt","Here is my prompt: [paste]. Ask me 3 questions that would make the output better, then rewrite the prompt using my answers.")]
b="<div class='box'><small>THE 4 PARTS OF A GOOD PROMPT</small><b>Role</b> (who the AI should act as) · <b>Context</b> (business, audience, ₹ budget) · <b>Task</b> (one clear job) · <b>Format</b> (length, table, bullets)</div>"
b+="".join(f"<h2><span>{i:02d}</span>{E(t)}</h2>{P(pr)}" for i,(t,pr) in enumerate(ten,1))
doc("02_10_ready_prompts","FREE PROMPT PACK","Same AI. Different prompt.","10 READY PROMPTS","Copy, fill in the [brackets], paste into ChatGPT, Claude or Gemini.",b)
# 3 — C2: lead-leak checklist
secs=[("Leak 1: Slow or confusing page",["Open the page on mobile data, not Wi-Fi","The offer is clear at first glance, above the fold","One main button, and it matches the ad's promise","Price or price range in ₹ is visible (or clearly 'on call')","Phone number / WhatsApp works when tapped"]),
("Leak 2: Too many form fields",["Only ask what you need for the first call (often name + phone)","No compulsory fields you never use","Form works on mobile and shows a thank-you message","You get notified the moment a form is filled"]),
("Leak 3: Slow replies",["Instant auto-reply on WhatsApp / DM / form","A real person follows up the same day","3-message follow-up plan: right away, next day, day three","Every lead is logged in one sheet or CRM"]),
("Leak 4: A vague offer",["Says what they get, for whom and the price range","One clear reason to act now (real, not fake urgency)","Proof is real: reviews, photos, results you can show","Ad, page and reply all say the same thing"])]
b="".join(f"<h2><span>{i:02d}</span>{E(t)}</h2><ul class='ck'>"+"".join(f"<li>{E(x)}</li>" for x in items)+"</ul>" for i,(t,items) in enumerate(secs,1))
b+="<div class='tip'><b>Rule:</b> fix the leaks first, then raise the budget. More budget on a leaky funnel buys more of the same problem.</div>"
doc("03_lead_leak_checklist","FREE CHECKLIST","Clicks but zero leads?","LEAD-LEAK CHECKLIST","Go through this on your own ad before you spend more. Tick every box.",b)
# 4 — S2: editing checklist
secs=[("Make it yours",["Add one real example from your own work","Rewrite the opening line the way you'd say it out loud","Cut words you'd never use (\"unlock\", \"game-changer\", \"dive in\")","Keep one idea per post"]),
("Make it true",["Check every number, date and tool feature against a real source","Remove any result, client or story that didn't happen","Mark AI-generated images where required"]),
("Make it work",["The first line says the benefit","The hook is different from your last few posts","One clear call to action","Read it on your phone before posting"])]
b="".join(f"<h2><span>{i:02d}</span>{E(t)}</h2><ul class='ck'>"+"".join(f"<li>{E(x)}</li>" for x in items)+"</ul>" for i,(t,items) in enumerate(secs,1))
b+="<div class='tip'><b>Remember:</b> AI is your first draft, not your final post.</div>"
doc("04_ai_content_editing_checklist","FREE CHECKLIST","Using AI for content?","EDITING CHECKLIST","Run every AI-assisted post through these 11 checks before you publish.",b)
print("ok")
