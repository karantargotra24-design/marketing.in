import sys, os
OUT=sys.argv[1]
exec(open("/tmp/kwscripts/variants.py").read())
KW="TOOLS"; BLK="#0B0B0B"; RED="#FF0000"
H="width:1080px;height:1920px;"
def page(body,transparent=False):
    bg="background:transparent;" if transparent else ""
    return f"<!DOCTYPE html><html><head><meta charset='utf-8'>{FONTS}<style>{CSS}*{{box-sizing:border-box;margin:0}}html,body{{width:1080px;height:1920px;overflow:hidden;{bg}}}</style></head><body>{body}</body></html>"
files={}
# 00 hook title overlay (transparent, sits top over talking head; safe zone below IG top bar)
_hk = "<div class='serif' style='font-size:84px;line-height:1;color:#fff'>Stop using AI</div><div style='margin-top:14px'>" + tag('ONLY FOR CAPTIONS',-2,58,True) + "</div>"
files["00_hook_title_OVERLAY"]=("<div style='position:absolute;left:70px;right:70px;top:250px;text-align:center'>" + glass(_hk,'padding:40px 46px;background:rgba(11,11,11,.55)') + "</div>", True)
tasks=[("openai","ChatGPT","Task 1","Caption first drafts","10 hooks → pick 1 → edit"),("claude","Claude","Task 2","Summarise long docs","Decisions · questions · next steps"),("googlegemini","Gemini","Task 3","Research a topic fast","Always check the sources"),("canva","Canva","Task 4","Resize one design","Post → Story → Reel cover"),(None,"Any AI chat","Task 5","Draft DM replies","Save as quick replies")]
for i,(lg,tool,num,title,sub) in enumerate(tasks,1):
    icon = ltile(lg,260) if lg else f"<div class='sh' style='width:260px;height:260px;border-radius:62px;background:#fff;border:4px solid {BLK};display:grid;place-items:center'>{ic('message-square-reply',BLK,140,2)}</div>"
    files[f"0{i}_task{i}_{tool.split()[0].lower()}"]=(f"""<div class='s b' style='{H}background:{BLK};justify-content:center;align-items:center;text-align:center'>{blobs()}
<div style='position:relative;font:600 34px Inter;letter-spacing:.16em;color:#fff;opacity:.75'>{num.upper()} OF 5</div>
<div style='position:relative;margin:60px 0 56px'>{icon}</div>
{glass(f"<div class='serif' style='font-size:96px;line-height:1.02;color:#fff'>{title}</div><div style='margin-top:22px'>{tag(tool.upper(),-2,52,True)}</div><div style='font:500 40px Inter;color:#fff;opacity:.8;margin-top:34px'>{sub}</div>",'padding:60px 56px;width:920px')}
<div class='ft' style='bottom:420px'><span>@karantargotra.a</span><span>{i} / 5</span></div></div>""",False)
files["06_rule_card"]=(f"""<div class='s b' style='{H}background:{BLK};justify-content:center;align-items:center;text-align:center'>{blobs()}
{glass(f"<div style='font:600 34px Inter;letter-spacing:.16em;color:#fff;opacity:.75'>ONE RULE</div><div class='serif' style='font-size:110px;line-height:1;color:#fff;margin-top:30px'>AI writes the first draft.</div><div class='pj' style='font-size:96px;color:{RED};margin-top:20px'>YOU MAKE IT YOURS.</div>",'padding:70px 60px;width:940px')}</div>""",False)
files["07_cta_endcard"]=(f"""<div class='s b' style='{H}background:{BLK};justify-content:center;align-items:center;text-align:center'>{blobs()}
{stk('openai',150,-10,90,330)}{stk('claude',160,8,800,300)}{stk('googlegemini',140,6,110,1330)}{stk('canva',150,-7,800,1320)}
{glass(f"<div class='serif' style='font-size:104px;line-height:1.02;color:#fff'>Want the prompt for each task?</div><div style='font:500 40px Inter;color:#fff;opacity:.75;margin:70px 0 26px'>Comment</div>{pillcta()}",'padding:80px 60px;width:900px')}
<div style='position:relative;margin-top:50px'>{tag('I’ll DM you all 5 prompts',2,40)}</div></div>""",False)
os.makedirs(OUT,exist_ok=True)
for n,(b,t) in files.items(): open(f"{OUT}/{n}.html","w").write(page(b,t))
print(len(files))
