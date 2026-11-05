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

# W45 C1 — profile checklist
secs=[("Name field",["Your name field includes what you do, e.g. 'Karan | AI & Marketing'","Your profile photo shows your face clearly, even at small size"]),
("Bio",["Line 1 says who you help","Line 2 says what they get from following you","Line 3 is one next step (free resource, WhatsApp or call)","No vague lines like 'dreamer | creator | explorer'"]),
("Pinned posts",["Pin 1: your most useful value post","Pin 2: a personal story (who you are, why you do this)","Pin 3: real proof (results, reviews, work you can show)","All 3 still match what you post today"]),
("Link in bio",["One main action, not 10 links","The link opens fast on mobile","What's behind the link matches what your bio promises"])]
b="".join(f"<h2><span>{i:02d}</span>{E(t)}</h2><ul class='ck'>"+"".join(f"<li>{E(x)}</li>" for x in items)+"</ul>" for i,(t,items) in enumerate(secs,1))
b+="<div class='tip'><b>Test:</b> show your profile to a friend for 5 seconds. Ask: who is this for, and what would you get by following? If they can't answer, fix the bio first.</div>"
doc("05_profile_checklist","FREE CHECKLIST","People visit your profile","BUT DON'T FOLLOW?","A 4-point check for your Instagram profile. Takes about 10 minutes.",b)
# W45 S1 — comment-to-DM setup guide
steps=[("Pick the post and one keyword",["Choose one word people can type fast, e.g. AI","Use the same word on the slide, in the caption and in the automation"]),
("Prepare what you'll send",["Make the freebie first (PDF, sheet or link)","Upload it to Drive and set it to 'Anyone with the link can view'","Test the link in a private browser window"]),
("Set up the automation",["Use a Meta-approved Instagram automation tool (check its current plans and Meta permissions yourself)","Connect your Instagram professional account","Trigger: comment on a specific post contains your keyword","Action: send a DM with a short message and the link","Optional: reply publicly to the comment, e.g. 'Sent! Check your DMs'"]),
("Test before you post",["Comment the keyword from a second account","Check the DM arrives and the link opens","Fix spelling of the keyword (capital and small letters)"]),
("After it goes live",["Reply to anyone who asks a question in DMs","Send only what you promised, nothing extra","Note how many people commented, for your weekly review"])]
b="".join(f"<h2><span>{i:02d}</span>{E(t)}</h2><ul class='ck'>"+"".join(f"<li>{E(x)}</li>" for x in items)+"</ul>" for i,(t,items) in enumerate(steps,1))
b+="<div class='tip'><b>Rule:</b> only DM people who commented, and only with what the post promised. No spam, no surprise sales pitches.</div>"
doc("06_comment_to_dm_setup_guide","FREE SETUP GUIDE","How does commenting","SEND A DM?","Set up a Comment &rarr; DM automation for your own posts in 5 steps.",b)
# W45 C2 — WhatsApp follow-up sheet
msgs=[("Message 1: Right away","Hi [Name], thanks for your interest in [Business]! What do you need [product/service] for?"),
("Message 2: Next day","Hi [Name], quick answer to your question: [1 useful tip or price range in ₹]. Would a 5-minute call help? I'm free [time options]."),
("Message 3: Day three","Hi [Name], just checking in: are you still looking at [product/service]? If not, no problem, just let me know and I'll update my list."),
("Bonus: After a call","Thanks for your time today, [Name]. As discussed: [1-line summary]. Next step: [what happens next, by when]."),
("Bonus: After a purchase","Thank you for choosing [Business], [Name]! If you have any questions, reply here. A quick review would really help us: [review link].")]
b="".join(f"<h2><span>{i:02d}</span>{E(t)}</h2>{P(m)}" for i,(t,m) in enumerate(msgs,1))
b+="<h2><span>06</span>Tracking sheet</h2><div class='box'><small>COLUMNS FOR GOOGLE SHEETS</small>Date · Name · Phone · Source (ad / post / referral) · Need · Msg 1 sent · Msg 2 sent · Msg 3 sent · Call booked · Status · Notes</div>"
b+="<div class='tip'><b>Rules:</b> use their name, one question per message, stop after three, and only message people who gave you their number.</div>"
doc("07_whatsapp_follow_up_sheet","FREE TEMPLATES","Got a lead but no reply?","FOLLOW-UP SHEET","Copy-paste WhatsApp follow-ups. Fill in the [brackets] for your business.",b)
