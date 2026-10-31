import sys
OUT=sys.argv[1]; sys.argv=[sys.argv[0],"/tmp/ph1080.jpg"]
exec(open("/tmp/kwscripts/carousel_v3.py").read())
BLK="#0B0B0B"; RED="#FF0000"
def page(body,transparent):
    bg="transparent" if transparent else "#FBFBFB"
    return f"<!DOCTYPE html><html><head><meta charset='utf-8'>{FONTS}<style>*{{box-sizing:border-box;margin:0}}html,body{{width:1080px;height:1920px;overflow:hidden;background:{bg};font-family:Inter,sans-serif;color:{BLK}}}.grid{{position:absolute;inset:0;background-image:radial-gradient(#dcdcdc 1.6px,transparent 1.7px);background-size:44px 44px}}.serif{{font-family:'Instrument Serif',serif;letter-spacing:-.02em}}</style></head><body>{body}</body></html>"
f={}
f["hook_OVERLAY"]=("<div style='position:absolute;left:0;right:0;top:250px;display:flex;justify-content:center'><div style='background:#0B0B0B;color:#fff;font:500 70px/1.1 Inter;padding:22px 34px;letter-spacing:-.02em'>AI & marketing, made simple</div></div>",True)
logos=["openai","claude","googlegemini","canva","meta"]
f["namecard"]=(f"""<div class='grid'></div><div style='position:absolute;left:90px;right:90px;top:560px'>
<div style='font:600 30px Inter;letter-spacing:.16em;color:#6B6B6B'>WHO'S TALKING</div>
<div class='serif' style='font-size:150px;line-height:.92;margin-top:24px'>Karan<br>Targotra</div>
<div style='display:inline-block;background:{BLK};color:#fff;font:600 44px Inter;padding:14px 26px;margin-top:34px'>AI &amp; Marketing</div>
<div style='width:100%;height:2px;background:{BLK};margin:70px 0 50px'></div>
<div style='display:flex;gap:22px'>{''.join(ltile(n,110) for n in logos)}</div>
<div style='font:500 40px Inter;color:#6B6B6B;margin-top:50px'>@karantargotra.a</div></div>""",False)
up="<svg viewBox='0 0 24 24' width='30' height='30' fill='none' stroke='#fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M12 19V5M5 12l7-7 7 7'/></svg>"
f["pill_OVERLAY"]=(f"""<div style='position:absolute;left:0;right:0;top:1250px;display:flex;flex-direction:column;align-items:center;gap:12px'>
<div style='font:500 38px Inter;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.45)'>Comment</div>
<div style='display:flex;align-items:center;gap:40px;background:#fff;border-radius:999px;padding:16px 18px 16px 56px;box-shadow:0 10px 30px rgba(0,0,0,.25)'><span style='font:600 54px Inter'>“AI”</span><span style='width:76px;height:76px;border-radius:50%;background:#0B0B0B;display:grid;place-items:center'>{up}</span></div>
<div style='font:500 32px Inter;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.45)'>10 ready AI prompts in your DMs</div></div>""",True)
import os; os.makedirs(OUT,exist_ok=True)
for n,(b,t) in f.items(): open(f"{OUT}/{n}.html","w").write(page(b,t))
print(len(f))
