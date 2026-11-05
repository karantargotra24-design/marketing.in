import sys, os
OUT=sys.argv[1]; sys.argv=[sys.argv[0], "/tmp/ph1080.jpg"]
exec(open("/tmp/kwscripts/carousel_v3.py").read())
BLK="#0B0B0B"; RED="#FF0000"; KW="TOOLS"
def page(body,transparent=False):
    bg="transparent" if transparent else "#FBFBFB"
    return f"<!DOCTYPE html><html><head><meta charset='utf-8'>{FONTS}<style>*{{box-sizing:border-box;margin:0}}html,body{{width:1080px;height:1920px;overflow:hidden;background:{bg};font-family:Inter,sans-serif;color:{BLK}}}"+\
      ".grid{position:absolute;inset:0;background-image:radial-gradient(#dcdcdc 1.6px,transparent 1.7px);background-size:44px 44px}"+\
      ".card{background:#fff;border:1.5px solid #E6E6E6;border-radius:36px;box-shadow:0 24px 60px rgba(0,0,0,.08)}"+\
      ".serif{font-family:'Instrument Serif',serif;letter-spacing:-.02em}</style></head><body>"+body+"</body></html>"
files={}
# hook overlay: black title box, white sentence-case text (ref 01 style)
files["00_hook_title_OVERLAY"]=("<div style='position:absolute;left:0;right:0;top:250px;display:flex;justify-content:center'><div style='background:#0B0B0B;color:#fff;font:500 72px/1.1 Inter;padding:22px 34px;letter-spacing:-.02em'>Stop using AI only for captions</div></div>",True)
tasks=[("openai","ChatGPT","Caption first drafts","Write 10 hooks for a café in Jammu. Max 12 words each.","10 hooks ready. Pick one, then edit it in your words."),
("claude","Claude","Summarise long docs","Summarise this brief: decisions, open questions, next steps.","Table ready: 3 decisions · 2 open questions · 4 next steps."),
("googlegemini","Gemini","Research a topic fast","Give me an overview of this topic with sources and dates.","Overview with 5 sources. Check each one before you use it."),
("canva","Canva","Resize one design","Post 4:5  →  Story 9:16  →  Reel cover","One design, every format."),
(None,"Any AI chat","Draft DM replies","Here are my 10 most asked DM questions. Draft short replies.","10 replies saved as quick replies.")]
for i,(lg,tool,title,q,a) in enumerate(tasks,1):
    logo_html = ltile(lg,120) if lg else f"<div style='width:120px;height:120px;border-radius:29px;background:#fff;border:3px solid {BLK};display:grid;place-items:center'>{ic('message-square-reply',BLK,64,2)}</div>"
    if lg=="canva":
        mock=f"""<div style='display:flex;align-items:flex-end;justify-content:center;gap:40px;padding:50px 30px'>
<div style='width:230px;height:288px;border:3px solid {BLK};border-radius:16px;display:grid;place-items:center;font:600 30px Inter'>4:5</div>
<svg width='70' height='40' viewBox='0 0 70 40' fill='none' stroke='{BLK}' stroke-width='3'><path d='M2 20h62M50 6l14 14-14 14'/></svg>
<div style='width:200px;height:356px;border:3px solid {RED};border-radius:16px;display:grid;place-items:center;font:600 30px Inter;color:{RED}'>9:16</div></div>
<div style='text-align:center;font:500 34px Inter;color:#6B6B6B;padding-bottom:40px'>{a}</div>"""
    else:
        mock=f"""<div style='padding:40px'><div style='display:flex;justify-content:flex-end'><div style='background:#F4F4F4;border-radius:28px 28px 6px 28px;padding:24px 30px;font:500 34px/1.35 Inter;max-width:720px'>{q}</div></div>
<div style='display:flex;gap:18px;margin-top:30px;align-items:flex-start'>{ltile(lg,64) if lg else ''}<div style='border:2.5px solid {RED};border-radius:6px 28px 28px 28px;padding:22px 28px;font:500 34px/1.35 Inter;max-width:700px'>{a}</div></div>
<div style='margin-top:36px;border:1.5px solid #E6E6E6;border-radius:999px;padding:22px 30px;font:400 30px Inter;color:#9a9a9a'>Message {tool}…</div></div>"""
    files[f"0{i}_task{i}_{tool.split()[0].lower()}"]=(f"""<div class='grid'></div><div style='position:absolute;left:80px;right:80px;top:460px'>
<div style='font:600 30px Inter;letter-spacing:.16em;color:#6B6B6B'>TASK {i} OF 5</div>
<div style='display:flex;align-items:center;gap:28px;margin-top:30px'>{logo_html}<div><div style='font:700 40px Inter'>{tool}</div><div class='serif' style='font-size:84px;line-height:1'>{title}</div></div></div>
<div class='card' style='margin-top:60px'>{mock}</div></div>""",False)
# rule card: thin-line diagram (ref style)
node=lambda t,red=False: f"<div style='border:{'3px solid '+RED if red else '2px solid '+BLK};border-radius:24px;padding:26px 30px;font:600 38px Inter;background:#fff;{('color:'+RED) if red else ''}'>{t}</div>"
line="<div style='width:2px;height:70px;background:#0B0B0B;margin:0 auto'></div>"
files["06_rule_diagram"]=(f"""<div class='grid'></div><div style='position:absolute;left:80px;right:80px;top:420px;text-align:center'>
<div style='font:600 30px Inter;letter-spacing:.16em;color:#6B6B6B'>ONE RULE</div>
<div class='serif' style='font-size:96px;line-height:1.02;margin-top:24px'>AI writes the first draft.<br>You make it yours.</div>
<div style='display:flex;flex-direction:column;align-items:center;margin-top:70px'>{node('AI first draft')}{line}{node('+ your real example')}{line}{node('+ your voice')}{line}{node('Post',True)}</div></div>""",False)
# CTA pill overlay on talking head (ref 01-03: small Comment label above white rounded pill, black circle arrow)
up=f"<svg viewBox='0 0 24 24' width='30' height='30' fill='none' stroke='#fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M12 19V5M5 12l7-7 7 7'/></svg>"
files["07_cta_pill_OVERLAY"]=(f"""<div style='position:absolute;left:0;right:0;top:1250px;display:flex;flex-direction:column;align-items:center;gap:12px'>
<div style='font:500 38px Inter;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.4)'>Comment</div>
<div style='display:flex;align-items:center;gap:40px;background:#fff;border-radius:999px;padding:16px 18px 16px 56px;box-shadow:0 10px 30px rgba(0,0,0,.25)'><span style='font:600 54px Inter'>“{KW}”</span><span style='width:76px;height:76px;border-radius:50%;background:#0B0B0B;display:grid;place-items:center'>{up}</span></div>
<div style='font:500 32px Inter;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.4)'>All 5 prompts in your DMs</div></div>""",True)
# caption style sample (thin white, 1-3 words, ref A)
files["08_caption_style_SAMPLE_OVERLAY"]=("<div style='position:absolute;left:0;right:0;top:700px;text-align:center;font:300 110px Inter;color:#fff;letter-spacing:-.02em;text-shadow:0 3px 18px rgba(0,0,0,.35)'>hand it <span style='font-weight:800'>to AI</span></div>",True)
os.makedirs(OUT,exist_ok=True)
for n,(b,t) in files.items(): open(f"{OUT}/{n}.html","w").write(page(b,t))
print(len(files))
# --- grammar additions ---
extra={}
logos=["openai","claude","googlegemini","canva"]
pos=[(170,820),(700,780),(150,1260),(720,1240)]
extra["00b_map_graphic"]=("<div class='grid'></div><div style='position:absolute;left:80px;right:80px;top:420px;text-align:center'><div style='font:600 30px Inter;letter-spacing:.16em;color:#6B6B6B'>THIS WEEK</div><div class='serif' style='font-size:110px;line-height:1;margin-top:20px'>5 tasks.<br><span style=\"color:#FF0000\">0 coding.</span></div></div>"+
 "".join(f"<div style='position:absolute;left:{x}px;top:{y}px'>{ltile(n,180)}</div>" for n,(x,y) in zip(logos,pos))+
 "<svg style='position:absolute;inset:0' width='1080' height='1920'><g stroke='#0B0B0B' stroke-width='2' fill='none' opacity='.35'><path d='M260 910 L540 1080 L790 870'/><path d='M240 1350 L540 1080 L810 1330'/></g><circle cx='540' cy='1080' r='14' fill='#FF0000'/></svg>",False)
extra["09_logo_row_OVERLAY"]=("<div style='position:absolute;left:0;right:0;top:240px;display:flex;justify-content:center;gap:26px'>"+"".join(ltile(n,130) for n in logos)+f"<div style='width:130px;height:130px;border-radius:31px;background:#fff;border:3px solid #0B0B0B;display:grid;place-items:center'>{ic('message-square-reply','#0B0B0B',70,2)}</div></div>",True)
for k,n in enumerate(logos,1):
    extra[f"10_burst_{k}_{n}"]=(f"<div class='grid'></div><div style='position:absolute;inset:0;display:grid;place-items:center'>{ltile(n,420)}</div>",False)
for n,(b,t) in extra.items(): open(f"{OUT}/{n}.html","w").write(page(b,t))
print("extra",len(extra))
