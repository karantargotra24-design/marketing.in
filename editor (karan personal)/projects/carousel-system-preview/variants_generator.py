import sys
sys.argv=[sys.argv[0], "/tmp/ph1080.jpg"]
exec(open("/tmp/kwscripts/carousel_v3.py").read())
RED="#FF0000"; BLK="#0B0B0B"
def blobs(op=.55):
    return f"<div style='position:absolute;inset:0;background:radial-gradient(420px 420px at 15% 18%,rgba(255,0,0,.75),transparent 70%),radial-gradient(380px 380px at 88% 30%,rgba(255,255,255,.22),transparent 70%),radial-gradient(460px 420px at 75% 92%,rgba(255,0,0,.55),transparent 70%),radial-gradient(380px 380px at 10% 88%,rgba(255,255,255,.14),transparent 70%);filter:blur(30px);opacity:{op}'></div>"
def glass(inner,extra=""): return f"<div style='position:relative;background:rgba(255,255,255,.10);border:1.5px solid rgba(255,255,255,.28);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-radius:36px;box-shadow:0 20px 60px rgba(0,0,0,.35);{extra}'>{inner}</div>"
def card(inner,extra=""): return f"<div class='sh' style='position:relative;background:#fff;border:2.5px solid {BLK};border-radius:30px;{extra}'>{inner}</div>"
def stk(n,sz,rot,x,y): return f"<div style='position:absolute;left:{x}px;top:{y}px;transform:rotate({rot}deg);padding:10px;background:#fff;border-radius:{int(sz*.32)}px;box-shadow:0 14px 30px rgba(0,0,0,.35)'>{ltile(n,sz)}</div>"
def stki(icon,sz,rot,x,y,bg="#FFFFFF",fg=BLK): return f"<div style='position:absolute;left:{x}px;top:{y}px;transform:rotate({rot}deg);padding:10px;background:#fff;border-radius:{int(sz*.32)}px;box-shadow:0 14px 30px rgba(0,0,0,.35)'><div style='width:{sz}px;height:{sz}px;border-radius:{int(sz*.24)}px;background:{bg};border:3px solid {BLK};display:grid;place-items:center'>{ic(icon,fg,int(sz*.55),2.2)}</div></div>"
def tag(t,rot=-2,size=42,red=False): 
    bg,fg=(RED,"#fff") if red else ("#fff",BLK)
    return f"<span style='display:inline-block;background:{bg};color:{fg};font:700 {size}px Inter;padding:12px 26px;transform:rotate({rot}deg);box-shadow:4px 4px 0 {BLK}'>{t}</span>"
def arrow(w,h,rot,x,y): return f"<svg style='position:absolute;left:{x}px;top:{y}px;transform:rotate({rot}deg)' width='{w}' height='{h}' viewBox='0 0 260 160' fill='none' stroke='{RED}' stroke-width='9' stroke-linecap='round'><path d='M10 120 C 80 20, 170 20, 230 90'/><path d='M200 92 L232 92 L228 60'/></svg>"
def circle(w,h,x,y): return f"<svg style='position:absolute;left:{x}px;top:{y}px' width='{w}' height='{h}' viewBox='0 0 {w} {h}' fill='none' stroke='{RED}' stroke-width='8'><ellipse cx='{w/2}' cy='{h/2}' rx='{w/2-8}' ry='{h/2-8}' transform='rotate(-4 {w/2} {h/2})'/></svg>"
def pillcta(): return f"<span style='display:inline-flex;align-items:center;gap:26px;background:#fff;color:{BLK};border:2.5px solid {BLK};border-radius:999px;padding:16px 18px 16px 48px;font:600 48px Inter'>“AI”<i style='width:72px;height:72px;border-radius:50%;background:{RED};display:grid;place-items:center'>{UP}</i></span>"
def zaptile(sz): return f"<div class='sh' style='width:{sz}px;height:{sz}px;border-radius:{int(sz*.24)}px;background:#fff;border:3px solid {BLK};display:grid;place-items:center'>{ic('zap',RED,int(sz*.55),2.4)}</div>"
TOOLS=[("openai","ChatGPT","Captions aur hooks"),("claude","Claude","Lambe docs aur scripts"),("googlegemini","Gemini","Research"),("canva","Canva","Design aur resize")]
def deck(V):
    dark = V in ("BD","B"); bgc = BLK if dark else "#fff"; fg = "#fff" if dark else BLK
    base = (lambda extra="": f"<div class='s b' style='background:{BLK};{extra}'>{blobs()}") if dark else (lambda extra="": f"<div class='s w' style='{extra}'>")
    box = glass if dark else card
    st = V in ("BD","D")
    # cover
    stickers = (stk('openai',120,-10,90,170)+stk('claude',130,8,820,150)+stk('canva',110,6,100,1000)+stk('googlegemini',120,-7,830,1000)+stk('instagram',96,12,480,80)) if st else ("<div style='position:relative;display:flex;gap:24px;margin-bottom:60px'>"+"".join(ltile(n,130) for n in ['openai','claude','googlegemini','canva'])+"</div>")
    head = f"<div class='pj' style='font-size:160px;line-height:.88;color:{fg}'>AI<br>TOOLS</div>"
    c1 = base("justify-content:center;align-items:center;text-align:center") + stickers + f"""<div style='position:relative'>{box(head,'padding:50px 80px')}{circle(660,430,-40,-25) if st else ''}
<span style='position:absolute;right:-50px;top:-40px;background:{RED};color:#fff;font:700 40px Inter;padding:12px 28px;border-radius:999px;transform:rotate(8deg)'>FREE</span></div>
<div style='position:relative;margin-top:56px'>{tag('jo har marketer ko aane chahiye') if st else f"<span class='serif it' style='font-size:56px;color:{fg}'>jo har marketer ko aane chahiye</span>"}</div>{ft(1)}</div>"""
    # tool list
    rows="".join((f"<div style='position:relative;transform:rotate({r if st else 0}deg)'>")+box(f"<div style='display:flex;align-items:center;gap:26px'>{ltile(n,88)}<div><div style='font:700 40px Inter;color:{fg}'>{t}</div><div style='font:500 28px Inter;color:{fg};opacity:.75'>{u}</div></div></div>",'padding:20px 28px')+"</div>" for (n,t,u),r in zip(TOOLS,[-1,1,-1,1]))
    title_red = tag('KIS KAAM KA?',-2,70,True) if st else f"<span class='pj' style='font-size:88px;color:{RED}'>KIS KAAM KA?</span>"
    c2 = base() + f"<div style='position:relative'>{lrow('AI SE KAAM').replace('<div class','<div style=color:'+fg+' class')}<div class='serif' style='font-size:96px;line-height:1;margin-top:46px;color:{fg}'>Kaunsa AI tool,</div><div style='margin-top:12px'>{title_red}</div><div style='display:grid;gap:22px;margin-top:50px'>{rows}</div>{arrow(170,110,35,700,250) if st else ''}</div>{ft(5)}</div>"
    # flow
    if st:
        flow=f"""<div style='position:relative;height:700px;margin-top:30px'>{stk('instagram',150,-8,20,40)}<div style='position:absolute;left:10px;top:240px'>{tag('Comment: “AI”',-3,34)}</div>
{arrow(260,160,0,230,60)}<div style='position:absolute;left:470px;top:150px;transform:rotate(4deg);padding:10px;background:#fff;border-radius:48px;box-shadow:0 14px 30px rgba(0,0,0,.35)'>{zaptile(150)}</div>
<div style='position:absolute;left:440px;top:350px'>{tag('Keyword pakda, 1 sec',2,30)}</div>{arrow(260,160,110,640,330)}{stk('whatsapp',160,7,600,470)}<div style='position:absolute;left:150px;top:560px'>{tag('Free resource DM mein',-3,36,True)}</div></div>"""
    else:
        node=lambda icon,t,u: box(f"<div style='display:flex;align-items:center;gap:26px'>{icon}<div><div style='font:700 40px Inter;color:{fg}'>{t}</div><div style='font:500 28px Inter;color:{fg};opacity:.75'>{u}</div></div></div>",'padding:24px 32px;width:760px')
        dn=f"<div style='height:62px;display:grid;place-items:center;position:relative'>{ic('arrow-down',RED,52,2.6)}</div>"
        flow=f"<div style='position:relative;display:flex;flex-direction:column;align-items:center;margin-top:50px'>{node(ltile('instagram',96),'Instagram post','Koi comment karta hai: “AI”')}{dn}{node(zaptile(96),'Automation tool','Keyword pakadta hai')}{dn}{node(ltile('whatsapp',96),'DM / WhatsApp','Free resource inbox mein')}</div>"
    c3 = base() + f"<div style='position:relative'>{lrow('AI SE KAAM').replace('<div class','<div style=color:'+fg+' class')}<div class='serif' style='font-size:100px;line-height:1;margin-top:50px;color:{fg}'>Comment se DM tak,</div><div class='pj' style='font-size:92px;color:{fg}'>AUTO<span class='red'>MATIC</span></div></div>{flow}{ft(4)}</div>"
    # cta
    c4 = base("justify-content:center;align-items:center;text-align:center") + (stk('instagram',110,-10,110,170)+stk('whatsapp',100,9,840,190) if st else '') + box(f"<div class='serif' style='font-size:110px;line-height:1;color:{fg}'>Poori list chahiye?</div><div style='font:500 36px Inter;color:{fg};opacity:.75;margin:56px 0 22px'>Comment</div>{pillcta()}",'padding:70px 60px;width:880px') + f"<div style='position:relative;margin-top:40px'>{tag('Main DM mein bhej dunga',2,36) if st else f'<span style=\"font:500 36px Inter;color:{fg};opacity:.8\">Main DM mein bhej dunga.</span>'}</div>{ft(8)}</div>"
    return [c1,c2,c3,c4]
NAMES={"BD":"1 · B+D Glass + Sticker","B":"2 · B Glass","D":"3 · D Sticker Collage"}
rowsH="".join(f"<section><h2>{NAMES[V]}</h2><div class='row'>"+"".join(f"<div class='fr'><div class='sc'>{b}</div></div>" for b in deck(V))+"</div></section>" for V in ("BD","B","D"))
sw="".join(f"<span style='display:inline-flex;align-items:center;gap:8px;margin-right:18px;font:500 15px Inter'><i style='width:22px;height:22px;border-radius:5px;background:{c};border:1px solid #bbb;display:inline-block'></i>{n}</span>" for c,n in [("#0B0B0B","Black"),("#FFFFFF","White"),("#FF0000","Red"),("#E6E6E6","Grey"),("#6B6B6B","Dark grey")])
open("/tmp/variants.html","w").write(f"""<!DOCTYPE html><html><head><meta charset='utf-8'>{FONTS}<style>{CSS}*{{box-sizing:border-box;margin:0}} body{{background:#EDEDED;padding:30px;width:1900px;font-family:Inter}} h1{{font:800 44px 'Plus Jakarta Sans';letter-spacing:-.04em}} h1 span{{color:#FF0000}} h2{{font:700 24px Inter;margin:26px 0 10px}} .row{{display:flex;gap:16px}} .fr{{width:432px;height:540px;overflow:hidden;border-radius:6px}} .sc{{width:1080px;height:1350px;transform:scale(.4);transform-origin:0 0}}</style></head><body>
<h1>Carousel rotation: <span>3 variants</span>, your colours only</h1><p style='margin:10px 0 4px;color:#444'>Order per upload: 1 → 2 → 3 → repeat. Backgrounds and elements use only your palette. Tool logos keep their official colours.</p><div>{sw}</div>{rowsH}</body></html>""")
print("ok")
