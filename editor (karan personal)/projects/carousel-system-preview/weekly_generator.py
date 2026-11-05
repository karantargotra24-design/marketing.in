import sys, json, os, html as H
WEEK, OUTDIR = sys.argv[1], sys.argv[2]
exec(open("/tmp/kwscripts/variants.py").read())
E=H.escape; BLK="#0B0B0B"; RED="#FF0000"
w=json.load(open(WEEK,encoding="utf-8"))
def gtile(icon,sz=120): return glass(ic(icon,"#fff",int(sz*.52),2),f"width:{sz}px;height:{sz}px;display:grid;place-items:center;border-radius:{int(sz*.26)}px")
def lrw(t,fg): return f"<div style='position:relative;color:{fg}'>{lrow(t)}</div>"
VIS={("C1",2):("i","sparkles"),("C1",3):("l","openai"),("C1",4):("l","claude"),("C1",5):("l","googlegemini"),("C1",6):("l","canva"),("C1",7):("i","message-square-reply"),
     ("C2",2):("i","gauge"),("C2",3):("i","smartphone"),("C2",4):("i","list-x"),("C2",5):("l","whatsapp"),("C2",6):("i","indian-rupee")}
def sticker(pid,k):
    t,n=VIS[(pid,k)]
    return stk(n,120,8,800,150) if t=="l" else stki(n,120,8,800,150)
def ctatext(t):
    r=t.split(' and ',1)[-1]
    return r[0].upper()+r[1:]
pages=[]
for p in w["posts"]:
    pid=p["id"]
    if p["format"]=="carousel":
        n=len(p["slides"]); D = p["variant"]=="D"
        fg = BLK if D else "#fff"
        box = card if D else glass
        def base(extra=""): return f"<div class='s w' style='{extra}'>" if D else f"<div class='s b' style='background:{BLK};{extra}'>{blobs()}"
        for s in p["slides"]:
            k=s["n"]
            if s["type"]=="hook":
                logos = ['openai','claude','googlegemini','canva'] if pid=="C1" else ['meta','instagram','whatsapp','googlesheets']
                st = stk(logos[0],120,-10,90,190)+stk(logos[1],130,8,820,170)+stk(logos[2],110,6,110,990)+stk(logos[3],120,-7,820,1000)
                inner=f"<span style='font:600 24px Inter;letter-spacing:.14em;color:{fg};opacity:.75'>{E(s['tag'])}</span><div class='pj' style='font-size:110px;line-height:.95;color:{fg};margin-top:18px'>{E(s['hook'].upper())}</div>"
                b = base("justify-content:center;align-items:center;text-align:center") + st + f"""<div style='position:relative'>{box(inner,'padding:56px 64px;width:860px')}{circle(900,330,-20,-10) if D else ''}</div>
<div style='position:relative;margin-top:44px'>{tag(E(s['hook_red']),-2,64,True)}</div><div style='position:relative;margin-top:44px;font:500 36px Inter;color:{fg};opacity:.8'>{E(s['hook_sub'])}</div>{ft(k,n)}</div>"""
            elif s["type"]=="content":
                num=f"<div style='position:relative;display:inline-block'><span class='serif' style='font-size:200px;line-height:.8;color:{RED}'>{k:02d}</span>{circle(300,240,-50,-50) if k==2 else ''}</div>"
                b = base() + lrw(p['pillar'],fg) + sticker(pid,k) + f"""<div style='flex:1'></div><div style='position:relative'>{num}</div>
{box(f"<div class='serif' style='font-size:76px;line-height:1.02;color:{fg}'>{E(s['title'])}</div><div style='margin-top:16px'>{tag(E(s['title_red'].upper()),-2,48, D)}</div><p style='font:400 38px/1.45 Inter;color:{fg};opacity:.88;margin-top:30px'>{E(s['body'])}</p>",'padding:50px 54px;margin-top:40px')}<div style='flex:1.3'></div>{ft(k,n)}</div>"""
            else:
                b = base("justify-content:center;align-items:center;text-align:center") + stk('instagram',110,-10,110,170)+stk('whatsapp',100,9,840,190) + box(f"<div class='serif' style='font-size:96px;line-height:1.02;color:{fg}'>{E(s['cta_title'])}</div><div style='font:500 36px Inter;color:{fg};opacity:.75;margin:56px 0 22px'>Comment</div>{pillcta()}",'padding:70px 60px;width:900px') + f"<div style='position:relative;margin-top:40px'>{tag(E(ctatext(s['cta_body'])),2,34)}</div>{ft(k,n)}</div>"
            pages.append((f"{pid}_slide{k:02d}",b))
    else:
        s=p["static"]
        head=f"<div class='serif' style='position:relative;font-size:92px;line-height:1;color:#fff;margin-top:56px'>{E(s['headline'])}</div><div class='pj' style='position:relative;font-size:84px;margin-top:6px;color:{RED}'>{E(s['headline_red'].upper())}</div>"
        cta=f"<div style='position:relative;display:flex;align-items:center;gap:24px;color:#fff'><span style='font:500 30px Inter;opacity:.8'>Comment</span>{pillcta()}<span style='font:500 28px Inter;opacity:.8'>{E(s['cta'].split('for ',1)[-1])}</span></div>"
        if pid=="S1":
            mid=f"""<div style='display:grid;gap:22px;margin-top:46px'>
{glass(f"<div style='display:flex;gap:22px;align-items:flex-start'><div style='width:72px;height:72px;border-radius:18px;background:{RED};display:grid;place-items:center;flex:none'>{ic('x','#fff',44,3)}</div><div><div style='font:600 24px Inter;letter-spacing:.12em;color:#fff;opacity:.7'>BEFORE</div><div style='font:500 40px/1.3 Inter;color:#fff;margin-top:8px'>“{E(s['bad'])}”</div></div></div>",'padding:30px 34px')}
{glass(f"<div style='display:flex;gap:22px;align-items:flex-start'><div style='width:72px;height:72px;border-radius:18px;background:#fff;display:grid;place-items:center;flex:none'>{ic('check',BLK,44,3)}</div><div><div style='font:600 24px Inter;letter-spacing:.12em;color:#fff;opacity:.7'>AFTER</div><div style='font:500 40px/1.3 Inter;color:#fff;margin-top:8px'>“{E(s['good'])}”</div></div></div>",'padding:30px 34px;border-color:rgba(255,255,255,.6)')}
</div><p style='position:relative;font:500 32px/1.4 Inter;color:#fff;opacity:.85;margin-top:30px'>{E(s['support'])}</p>"""
            extra=""
        else:
            col=lambda title,items,good: glass(f"<div style='display:flex;align-items:center;gap:16px'><div style='width:64px;height:64px;border-radius:16px;background:{'#fff' if good else RED};display:grid;place-items:center'>{ic('check' if good else 'x',BLK if good else '#fff',38,3)}</div><span class='pj' style='font-size:52px;color:#fff'>{title}</span></div>"+"".join(f"<div style='font:500 34px/1.3 Inter;color:#fff;padding:20px 0;border-top:1px solid rgba(255,255,255,.2);margin-top:{18 if i==0 else 0}px'>{E(t)}</div>" for i,t in enumerate(items)),'padding:34px')
            mid=f"<div style='display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:50px'>{col('DO',s['dos'],True)}{col('DON'+chr(39)+'T',s['donts'],False)}</div><p style='position:relative;font:500 34px/1.4 Inter;color:#fff;opacity:.85;margin-top:34px;text-align:center'>{E(s['support'])}</p>"
            extra=""
        b=f"<div class='s b' style='background:{BLK}'>{blobs()}{lrw(s['tag'],'#fff')}{extra}{head}{mid}<div style='flex:1'></div>{cta}<div style='height:110px'></div><div class='ft'><span>@karantargotra.a</span><span></span></div></div>"
        pages.append((f"{pid}_static",b))
os.makedirs(OUTDIR,exist_ok=True)
for name,b in pages:
    open(os.path.join(OUTDIR,name+".html"),"w",encoding="utf-8").write(f"<!DOCTYPE html><html><head><meta charset='utf-8'>{FONTS}<style>{CSS}*{{box-sizing:border-box;margin:0}}body{{width:1080px;height:1350px;overflow:hidden}}</style></head><body>{b}</body></html>")
print(len(pages))
