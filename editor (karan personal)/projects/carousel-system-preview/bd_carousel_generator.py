import sys, json, os, html as H
WEEK, OUTDIR = sys.argv[1], sys.argv[2]
exec(open("/tmp/kwscripts/bd.py").read())   # helpers: blobs, glass, stk, stki, hlt, arrow, circle, ltile, ic, pill bits
E=H.escape
w=json.load(open(WEEK,encoding="utf-8")); p=[x for x in w["posts"] if x["id"]=="C1"][0]
COLS=["#FF0069","#7D2AE8","#D97757","#0467DF"]; n=len(p["slides"])
ICONS={2:("eye","#FFE14D"),3:None,4:("file-text","#FFE14D"),5:("pin","#FFE14D"),6:("link","#FFE14D")}
def pillcta(): return f"<span style='display:inline-flex;align-items:center;gap:26px;background:#fff;color:#0B0B0B;border-radius:999px;padding:16px 18px 16px 48px;font:600 48px Inter'>“AI”<i style='width:72px;height:72px;border-radius:50%;background:#FF0000;display:grid;place-items:center'>{UP}</i></span>"
pages=[]
for s in p["slides"]:
    k=s["n"]
    if s["type"]=="hook":
        b=f"""<div class='s b' style="background:#0B0B0B url('{ph}') center top/cover">
<div style='position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.25) 0%,rgba(0,0,0,0) 40%,rgba(0,0,0,.85) 76%)'></div>
{stk('instagram',120,10,850,90)}
<div style='position:absolute;left:70px;right:70px;bottom:150px'>{glass(f"<span style='font:600 22px Inter;letter-spacing:.14em;color:#fff;opacity:.85'>{E(s['tag'])}</span><div class='serif' style='font-size:86px;line-height:1;color:#fff;margin-top:14px'>{E(s['hook'])}</div><div style='margin-top:14px'>{hlt(E(s['hook_red']),-2,56)}</div><div style='font:500 32px Inter;color:rgba(255,255,255,.85);margin-top:22px'>{E(s['hook_sub'])}</div>",'padding:44px 50px')}</div>
{ft(k,n)}</div>"""
    elif s["type"]=="content":
        sticker = stk('instagram',120,8,800,150) if ICONS[k] is None else stki(ICONS[k][0],ICONS[k][1],120,8,800,150)
        num = f"<div style='position:relative;display:inline-block'><span class='serif' style='font-size:200px;line-height:.8;color:#FF0000'>{k:02d}</span>{circle(300,240,-50,-50) if k==2 else ''}</div>"
        b=f"""<div class='s b' style='background:#0B0B0B'>{blobs(COLS,.55)}<div style='position:relative'>{lrow(p['pillar'])}</div>{sticker}<div style='flex:1'></div>
<div style='position:relative'>{num}</div>
{glass(f"<div class='serif' style='font-size:76px;line-height:1.02;color:#fff'>{E(s['title'])}</div><div style='margin-top:14px'>{hlt(E(s['title_red'].upper()),-2,50)}</div><p style='font:400 38px/1.45 Inter;color:rgba(255,255,255,.88);margin-top:30px'>{E(s['body'])}</p>",'padding:50px 54px;margin-top:40px')}
<div style='flex:1.3'></div>{ft(k,n)}</div>"""
    else:
        b=f"""<div class='s b' style='background:#0B0B0B;justify-content:center;align-items:center;text-align:center'>{blobs(COLS)}
{stk('instagram',110,-10,110,170)}{stk('whatsapp',100,9,840,190)}
{glass(f"<div class='serif' style='font-size:104px;line-height:1;color:#fff'>{E(s['cta_title'])}</div><div style='font:500 36px Inter;color:rgba(255,255,255,.75);margin:56px 0 22px'>Comment</div>{pillcta()}",'padding:70px 60px;width:880px')}
<div style='position:relative;margin-top:40px'>{hlt(E(s['cta_body'].split('— ',1)[-1]),2,36)}</div>{ft(k,n)}</div>"""
    pages.append((f"C1_slide{k:02d}",b))
os.makedirs(OUTDIR,exist_ok=True)
for name,b in pages:
    open(os.path.join(OUTDIR,name+".html"),"w",encoding="utf-8").write(f"<!DOCTYPE html><html><head><meta charset='utf-8'>{FONTS}<style>{CSS}*{{box-sizing:border-box;margin:0}}body{{width:1080px;height:1350px;overflow:hidden}}</style></head><body>{b}</body></html>")
print(len(pages))
