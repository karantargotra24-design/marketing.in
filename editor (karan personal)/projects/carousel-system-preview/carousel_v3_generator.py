import re, base64, sys, os
SI="/tmp/iconpkgs/si/package/icons/"; LU="/tmp/iconpkgs/lu/package/icons/"
def logo(n, color="currentColor", size=64):
    d=re.search(r'<path d="([^"]+)"', open(SI+n+".svg").read()).group(1)
    return f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="{color}"><path d="{d}"/></svg>'
def ic(n, color="currentColor", size=56, sw=1.8):
    s=open(LU+n+".svg").read()
    inner=re.search(r'<svg[^>]*>(.*)</svg>', s, re.S).group(1)
    return f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{inner}</svg>'
BRAND={"openai":"#0B0B0B","claude":"#D97757","googlegemini":"linear-gradient(135deg,#4796E3,#9177C7 55%,#CA6673)","canva":"linear-gradient(135deg,#00C4CC,#7D2AE8)","meta":"#0467DF","instagram":"radial-gradient(circle at 30% 107%,#FDF497 0%,#FD5949 45%,#D6249F 60%,#285AEB 90%)","whatsapp":"#25D366","zapier":"#FF4F00","notion":"#FFFFFF","googlesheets":"#34A853"}
GLYPH={"notion":"#0B0B0B"}
SOLID={"googlegemini":"#8E75B2","canva":"#00C4CC","instagram":"#FF0069"}
def ltile(n,sz,extra=""):
    g=GLYPH.get(n,"#FFFFFF"); bd="border:2px solid #E6E6E6;" if n=="notion" else ""
    return f"<div class='sh' style='width:{sz}px;height:{sz}px;border-radius:{int(sz*.24)}px;background:{BRAND[n]};{bd}display:grid;place-items:center;{extra}'>{logo(n,g,int(sz*.52))}</div>"
def bc(n): return SOLID.get(n, BRAND[n] if BRAND[n].startswith('#') else '#0B0B0B')
PH=sys.argv[1] if len(sys.argv)>1 else None
ph="data:image/jpeg;base64,"+base64.b64encode(open(PH,"rb").read()).decode() if PH else ""
CSS="""
:root{--red:#FF0000;--ink:#0B0B0B;--white:#FFFFFF;--g1:#F4F4F4;--g2:#E6E6E6;--g6:#6B6B6B;--g8:#1C1C1C}
.s{position:relative;width:1080px;height:1350px;padding:96px;display:flex;flex-direction:column;overflow:hidden;font-family:Inter,sans-serif}
.s.w{background:#fff;color:var(--ink);background-image:radial-gradient(#d9d9d9 1.4px,transparent 1.5px);background-size:40px 40px}
.s.b{background:var(--ink);color:#fff;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:90px 90px}
.serif{font-family:'Instrument Serif',Georgia,serif;font-weight:400;letter-spacing:-.02em}.it{font-style:italic}
.pj{font-family:'Plus Jakarta Sans',Inter,sans-serif;font-weight:800;letter-spacing:-.045em}
.red{color:var(--red)}
.lrow{display:flex;justify-content:space-between;align-items:center;font:600 22px Inter;letter-spacing:.14em}
.lrow .h{font:400 30px 'Instrument Serif';letter-spacing:0;opacity:.75}
.ft{position:absolute;left:120px;right:120px;bottom:56px;display:flex;justify-content:space-between;font:500 24px Inter;opacity:.6;border-top:1px solid currentColor;padding-top:24px}
.tile{display:grid;place-items:center;border-radius:28px}
.b .tile{background:#fff;color:#0B0B0B}.w .tile{background:#0B0B0B;color:#fff}
.sh{box-shadow:0 18px 40px rgba(0,0,0,.18)}
.b .sh{box-shadow:0 18px 50px rgba(0,0,0,.6)}
.hl{background:linear-gradient(transparent 62%,rgba(255,0,0,.85) 62% 90%,transparent 90%)}
.pill{display:inline-flex;align-items:center;gap:26px;border-radius:999px;padding:16px 18px 16px 48px;font:600 48px Inter}
.pill i{width:72px;height:72px;border-radius:50%;background:var(--red);display:grid;place-items:center}
"""
UP=ic("arrow-up","#fff",34,3)
def ft(n,t=8): return f"<div class='ft'><span>@karantargotra.a</span><span>{n} / {t}</span></div>"
def lrow(t): return f"<div class='lrow'><span>{t}</span><span class='h'>@karantargotra.a</span></div>"
SER="AI SE KAAM"
def tile(inner,sz,extra=""): return f"<div class='tile sh' style='width:{sz}px;height:{sz}px;{extra}'>{inner}</div>"
S=[]
# 1 photo cover
S.append(("Cover · photo + floating tool logos", f"""<div class='s b' style="background:#0B0B0B url('{ph}') center 60%/cover">
<div style='position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.82) 0%,rgba(0,0,0,.15) 42%,rgba(0,0,0,.1) 60%,rgba(0,0,0,.9) 100%)'></div>
<div style='position:relative;text-align:center;margin-top:-20px'><div class='pj' style='font-size:150px;line-height:.9'>5 KAAM</div>
<div class='serif it' style='font-size:56px;margin-top:6px'>jo AI se <span class='hl' style='padding:0 6px'>aaj</span> karwa lo</div></div>
{ltile('openai',130,'position:absolute;left:70px;top:430px;transform:rotate(-8deg)')}
{ltile('claude',130,'position:absolute;right:70px;top:400px;transform:rotate(7deg)')}
{ltile('canva',112,'position:absolute;left:96px;top:760px;transform:rotate(5deg)')}
{ltile('googlegemini',112,'position:absolute;right:96px;top:740px;transform:rotate(-6deg)')}
<div style='position:absolute;left:0;right:0;bottom:150px;text-align:center'><span style='background:#fff;color:#0B0B0B;font:600 36px Inter;padding:14px 30px;border-radius:999px'>Coding ke bina</span></div>{ft(1)}</div>"""))
# 2 type cover
orbit="".join(ltile(n,108,f"position:absolute;left:{x}px;top:{y}px") for n,x,y in [("openai",120,250),("claude",860,230),("googlegemini",80,980),("canva",880,1000),("zapier",470,1060),("notion",490,150)])
S.append(("Type cover · logo orbit + brand-colour glows", f"""<div class='s b' style='justify-content:center;align-items:center;text-align:center'><div style='position:absolute;inset:0;background:radial-gradient(420px 320px at 15% 20%,rgba(217,119,87,.35),transparent 70%),radial-gradient(420px 320px at 88% 22%,rgba(145,119,199,.32),transparent 70%),radial-gradient(460px 340px at 50% 95%,rgba(255,79,0,.28),transparent 70%),radial-gradient(400px 300px at 10% 85%,rgba(0,196,204,.28),transparent 70%)'></div>{orbit}
<div style='position:relative'><span style='position:absolute;right:-30px;top:-70px;background:var(--red);color:#fff;font:700 40px Inter;padding:12px 28px;border-radius:999px;transform:rotate(6deg)'>FREE</span>
<div class='pj' style='font-size:190px;line-height:.88'>AI<br>TOOLS</div></div>
<div class='serif it' style='font-size:58px;margin-top:34px;opacity:.9'>jo har marketer ko aane chahiye</div>{ft(1)}</div>"""))
# 3 concept with phone mockups + chart
def phone(lbl,state,red=False,grad='#F4F4F4'):
    bar="var(--red)" if red else "#0B0B0B"
    return f"""<div style='flex:1;display:flex;flex-direction:column;align-items:center;gap:18px'>
<div class='sh' style='width:230px;height:400px;border-radius:38px;border:10px solid #0B0B0B;background:#fff;padding:20px 16px;display:flex;flex-direction:column;gap:12px'>
<div style='display:flex;align-items:center;gap:10px'><span style='width:34px;height:34px;border-radius:50%;background:#0B0B0B'></span><span style='height:12px;width:90px;background:var(--g2);border-radius:6px'></span></div>
<div style='flex:1;border-radius:14px;background:{grad};display:grid;place-items:center'>{ic('megaphone','#fff' if not red else bar,70,2)}</div>
<div style='display:flex;gap:12px'>{ic('heart','#0B0B0B',30,2)}{ic('message-circle','#0B0B0B',30,2)}{ic('send','#0B0B0B',30,2)}</div></div>
<b class='serif' style='font-size:50px'>{lbl}</b><span style='font:500 28px Inter;color:{'var(--red)' if red else 'var(--g6)'}'>{state}</span></div>"""
S.append(("Concept · phone mockups, colour fades to grey", f"""<div class='s w'>{lrow(SER)}
<div class='pj' style='font-size:120px;text-align:center;margin-top:56px'>AD FATIGUE</div>
<p style='font:500 42px/1.3 Inter;text-align:center;margin-top:20px'>Same ad baar baar dikhe toh kya hota hai?</p>
<div style='display:flex;gap:24px;margin-top:50px'>{phone('Hafta 1','Log rukte hain',grad='linear-gradient(135deg,#FF4F00,#D6249F)')}{phone('Hafta 3','Dekha hua lagta hai',grad='linear-gradient(135deg,#d99a85,#b98aa8)')}{phone('Hafta 5','Seedha scroll',True,'#EDEDED')}</div>
<div style='position:absolute;left:96px;right:96px;bottom:150px;display:flex;align-items:center;gap:20px;background:#0B0B0B;color:#fff;border-radius:22px;padding:26px 34px;font:600 36px/1.25 Inter'>{ic('refresh-cw','#fff',48,2.2)}Creative refresh ka plan launch se pehle bana lo.</div>{ft(3)}</div>"""))
# 4 flow with logos
def node(n,name,sub,dark=False):
    bg="#0B0B0B" if dark else "#fff"; fg="#fff" if dark else "#0B0B0B"
    icon = ltile(n,96) if n in BRAND else f"<div class='sh' style='width:96px;height:96px;border-radius:23px;background:#FFB300;display:grid;place-items:center'>{ic('zap','#0B0B0B',54,2.2)}</div>"
    return f"""<div class='sh' style='display:flex;align-items:center;gap:26px;background:{bg};color:{fg};border:2px solid #0B0B0B;border-radius:28px;padding:26px 34px;width:760px'>
{icon}
<div><div style='font:700 40px Inter'>{name}</div><div style='font:500 28px Inter;opacity:.7'>{sub}</div></div></div>"""
arrow=f"<div style='height:62px;display:grid;place-items:center'>{ic('arrow-down','#FF0000',52,2.6)}</div>"
S.append(("Flow · real tool logos connected", f"""<div class='s w'>{lrow(SER)}
<div class='serif' style='font-size:92px;line-height:1;text-align:center;margin-top:46px'>Comment se DM tak,<br><span class='pj' style='font-size:84px'>AUTOMATIC</span></div>
<div style='display:flex;flex-direction:column;align-items:center;margin-top:44px'>
{node('instagram','Instagram post','Koi comment karta hai: "AI"')}{arrow}
{node('zap','Automation tool','Keyword pakadta hai, 1 second mein')}{arrow}
{node('whatsapp','DM / WhatsApp','Free resource seedha inbox mein',True)}</div><p style='position:absolute;left:96px;right:96px;bottom:150px;text-align:center;font:600 38px Inter'>Ek baar setup, har post pe leads.</p>{ft(4)}</div>"""))
# 5 tool list with logos
rows="".join(f"""<div style='display:flex;align-items:center;gap:26px;background:#161616;border:1.5px solid #2c2c2c;border-left:8px solid {bc(n) if n!='openai' else '#FFFFFF'};border-radius:24px;padding:22px 26px'>
{ltile(n,92)}
<div style='flex:1'><div style='font:700 38px Inter'>{t}</div><div style='font:500 28px Inter;opacity:.65'>{u}</div></div>{ic('arrow-up-right','#FF0000' if i==0 else '#666',44,2.2)}</div>""" for i,(n,t,u) in enumerate([("openai","ChatGPT","Captions aur hooks ke 10 options"),("claude","Claude","Lambe docs, strategy aur scripts"),("googlegemini","Gemini","Research aur Google Workspace kaam"),("canva","Canva","Design, templates aur resize")]))
S.append(("Tool list · app-icon rows with brand-colour edge", f"""<div class='s b'>{lrow(SER)}
<div class='serif' style='font-size:96px;line-height:1;margin-top:50px'>Kaunsa AI tool,<br><span class='pj red' style='font-size:88px'>KIS KAAM KA?</span></div>
<div style='display:grid;gap:22px;margin-top:54px'>{rows}</div>{ft(5)}</div>"""))
# 6 prompt grid icons
cards="".join(f"""<div style='background:#fff;border:2px solid #0B0B0B;border-radius:28px;padding:34px;display:flex;flex-direction:column;gap:18px' class='sh'>
<div style='width:96px;height:96px;border-radius:24px;background:{['#D97757','#0467DF','#25D366','#FF0000'][i]};display:grid;place-items:center'>{ic(icn,'#fff',52,2)}</div>
<div class='pj' style='font-size:52px'>{t}</div><div style='font:500 30px/1.3 Inter;color:#333'>{d}</div></div>""" for i,(icn,t,d) in enumerate([("user","ROLE","'Act as Meta Ads expert'"),("file-text","CONTEXT","Business, audience, ₹ budget"),("target","TASK","Ek clear kaam, ek output"),("layout-list","FORMAT","Table, bullets ya 50 words")]))
S.append(("Framework · 2×2 icon cards", f"""<div class='s w'>{lrow(SER)}
<div class='serif' style='font-size:100px;line-height:1;text-align:center;margin-top:46px'>Prompt ke <span class='pj' style='font-size:96px'>4 PARTS</span></div>
<div style='display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:56px'>{cards}</div>
<p style='position:absolute;left:96px;right:96px;bottom:150px;text-align:center;font:600 38px Inter'>Charon do, output generic nahi aayega.</p>{ft(6)}</div>"""))
# 7 source proof with meta logo + mock post
S.append(("Source proof · logo + mock announcement + red marker", f"""<div class='s b'>{lrow(SER)}
<div style='display:flex;align-items:center;gap:22px;margin-top:56px'>{ltile('meta',104)}<span class='pj' style='font-size:44px'>META UPDATE</span></div>
<div class='serif' style='font-size:100px;line-height:1;margin-top:34px'>Kya badla, aur tumhe <span class='hl'>kya karna</span> hai?</div>
<div class='sh' style='margin-top:46px;background:#fff;color:#0B0B0B;border-radius:26px;padding:36px'>
<div style='display:flex;align-items:center;gap:16px'>{logo('meta','#0467DF',44)}<b style='font:700 30px Inter'>Official announcement</b><span style='margin-left:auto;font:500 24px Inter;color:#6B6B6B'>[date]</span></div>
<div style='margin-top:26px;display:grid;gap:14px'><span style='height:20px;background:#E6E6E6;border-radius:8px'></span><span style='height:20px;width:85%;background:#E6E6E6;border-radius:8px'></span><span style='height:20px;width:70%;background:rgba(255,0,0,.25);border-radius:8px'></span><span style='height:20px;width:60%;background:#E6E6E6;border-radius:8px'></span></div>
<div style='margin-top:22px;font:500 24px Inter;color:#6B6B6B'>Real screenshot goes here · Source: [official URL]</div></div>{ft(7)}</div>"""))
# 8 CTA with instagram comment mock
S.append(("CTA · Instagram comment mock + Comment “AI” pill", f"""<div class='s b' style='align-items:center;text-align:center;justify-content:center'>
<div class='serif' style='font-size:118px;line-height:1'>Poori list chahiye?</div>
<div class='sh' style='margin-top:60px;background:#fff;color:#0B0B0B;border-radius:28px;padding:28px 34px;display:flex;align-items:center;gap:22px;width:760px;text-align:left'>
<span style='width:72px;height:72px;border-radius:50%;background:radial-gradient(circle at 30% 107%,#FDF497 0%,#FD5949 45%,#D6249F 60%,#285AEB 90%);display:grid;place-items:center;color:#fff'>{logo('instagram','#fff',40)}</span>
<div style='flex:1'><b style='font:700 30px Inter'>tum</b><div style='font:600 44px Inter'>AI</div></div>{ic('heart','#FF0000',48,2.4)}</div>
<div style='font:500 36px Inter;opacity:.7;margin:56px 0 20px'>Comment</div>
<span class='pill' style='background:#fff;color:#0B0B0B'>“AI”<i>{UP}</i></span>
<p style='font:500 36px Inter;opacity:.7;margin-top:46px'>Main DM mein bhej dunga.</p>{ft(8)}</div>"""))
FONTS="<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@800&family=Instrument+Serif:ital@0;1&display=swap' rel='stylesheet'>"
