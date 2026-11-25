import base64, io, os, qrcode
from PIL import Image, ImageOps

W = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/scratchpad/pdfwork/'
IM = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/images/'
OUT = '/home/user/marketing.in/onboarding/'
os.makedirs(OUT, exist_ok=True)

# Palette sampled from the red-lit portrait (background #150404, glow #63140A-#902010)
BG = '#150404'      # page background (portrait background)
PANEL = '#250909'   # cards
LINE = '#3D1411'    # borders
RED = '#8F1D14'     # deep red fills (portrait rim light)
REDHI = '#C2382C'   # accent text on dark (large type only)
TXT = '#F3ECE8'

def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()
def font(fam, wt, f, pkg): return "@font-face{font-family:'%s';font-weight:%s;src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, wt, b64(W + 'node_modules/@fontsource/%s/files/%s' % (pkg, f)))
fonts = ''.join([font('Space Grotesk', 500, 'space-grotesk-latin-500-normal.woff2', 'space-grotesk'), font('Space Grotesk', 700, 'space-grotesk-latin-700-normal.woff2', 'space-grotesk'),
                 font('Inter', 400, 'inter-latin-400-normal.woff2', 'inter'), font('Inter', 600, 'inter-latin-600-normal.woff2', 'inter')])

def photo(n, w, h, cy=0.3, q=88):
    im = Image.open(IM + '%d.jpg' % n).convert('RGB'); im = ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(0.5, cy))
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
red = photo(25, 880, 1100, 0.3)          # full portrait, no crop
studio = photo(26, 400, 400, 0.18)

qr = qrcode.QRCode(border=1, box_size=10); qr.add_data('https://wa.me/919682514271?text=Hi%20Karan%2C%20I%27d%20like%20a%20free%20growth%20audit.'); qr.make(fit=True)
qb = io.BytesIO(); qr.make_image(fill_color='#150404', back_color='#FFFFFF').convert('RGB').save(qb, 'PNG')
qrdata = 'data:image/png;base64,' + base64.b64encode(qb.getvalue()).decode()

LOGO = '<div class="logo"><i></i>ScapeMedia<small>Meta Ads</small></div>'

css = fonts + '''
@page{size:1080px 1350px;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;font:400 26px/1.45 Inter,sans-serif;color:@TXT@;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:1080px;height:1350px;position:relative;overflow:hidden;page-break-after:always;background:@BG@;padding:80px}
h1,h2,h3,.logo{font-family:'Space Grotesk',sans-serif}
.logo{display:flex;align-items:center;gap:12px;font-weight:700;font-size:30px;letter-spacing:-.02em}
.logo i{width:16px;height:16px;border-radius:50%;background:@RED@;box-shadow:0 0 22px @RED@,0 0 0 4px #8F1D1433}
.logo small{font:500 14px 'Space Grotesk';letter-spacing:.18em;text-transform:uppercase;color:#9d8884;margin-left:6px}
.hi{color:@REDHI@}
.eb{font:700 17px 'Space Grotesk';letter-spacing:.22em;text-transform:uppercase;color:@REDHI@;display:flex;align-items:center;gap:14px;margin-bottom:22px}
.eb:before{content:"";width:40px;height:3px;background:currentColor}
h2{font:700 84px/.94 'Space Grotesk';letter-spacing:-.045em;text-transform:uppercase}
.foot{position:absolute;left:80px;right:80px;bottom:40px;display:flex;justify-content:space-between;font:500 16px 'Space Grotesk';letter-spacing:.16em;text-transform:uppercase;color:#7a6663}
.chip{display:inline-block;font:700 19px 'Space Grotesk';letter-spacing:.12em;text-transform:uppercase;padding:12px 20px;border-radius:999px;background:@RED@;color:#fff}
.chip.o{background:transparent;border:2px solid @RED@;color:#fff}

/* ---------- PAGE 1 : headline on top, photo + info below, nothing overlaps ---------- */
.p1{background:radial-gradient(900px 700px at 78% 78%,#8F1D1455,transparent 65%),radial-gradient(700px 500px at 0% 0%,#8F1D141f,transparent 60%),@BG@}
.p1 h1{font:700 118px/.9 'Space Grotesk';letter-spacing:-.055em;text-transform:uppercase;margin-top:40px}
.p1 h1 em{font-style:normal;color:@REDHI@}
.p1 .low{position:absolute;left:80px;right:80px;top:640px;bottom:80px;display:grid;grid-template-columns:1fr 500px;gap:40px}
.p1 .L{display:flex;flex-direction:column;justify-content:space-between;padding:6px 0 0}
.p1 .sub{font:500 33px/1.28 'Space Grotesk';color:#e4d9d5}
.p1 .stack{display:grid;gap:12px;justify-items:start}
.p1 .by{font:500 22px 'Space Grotesk';color:#a8928e;border-top:2px solid @LINE@;padding-top:20px}
.p1 .by b{display:block;color:#fff;font-size:28px;margin-bottom:2px}
.p1 .card{position:relative;border-radius:250px 250px 28px 28px;overflow:hidden;border:3px solid @RED@;background:#000 center/cover no-repeat;box-shadow:0 0 90px #8F1D1488,0 40px 80px -30px #000}
.p1 .tagline{position:absolute;right:80px;top:80px;font:700 15px 'Space Grotesk';letter-spacing:.2em;text-transform:uppercase;color:#a8928e}

/* ---------- PAGE 2 ---------- */
.p2 h2{font-size:74px}
.flow{display:grid;grid-template-columns:repeat(5,1fr);margin-top:34px;position:relative}
.flow:before{content:"";position:absolute;left:10%;right:10%;top:34px;height:4px;background:@RED@;border-radius:2px}
.flow div{text-align:center;position:relative;font:700 19px/1.15 'Space Grotesk';letter-spacing:.06em;text-transform:uppercase}
.flow b{display:grid;place-items:center;width:68px;height:68px;margin:0 auto 10px;border-radius:50%;background:@BG@;color:#fff;border:4px solid @RED@;font:700 22px 'Space Grotesk';box-shadow:0 0 0 8px #8F1D1430}
.flow div:last-child b{background:@RED@}
.tiles{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:30px}
.tile{background:@PANEL@;border:1.5px solid @LINE@;border-radius:26px;padding:22px 24px}
.tile .ic{font:700 20px 'Space Grotesk';color:@REDHI@;letter-spacing:.1em}
.tile h3{font:700 30px/1 'Space Grotesk';letter-spacing:-.03em;text-transform:uppercase;margin:8px 0 6px}
.tile p{font-size:20px;color:#cdbdb9;line-height:1.35}
.tile.hot{background:@RED@;border-color:@RED@}.tile.hot .ic{color:#fff;opacity:.8}.tile.hot p{color:#fff}
.ind{margin-top:26px;padding:22px 28px;border-radius:26px;background:#0D0202;border:1.5px solid @LINE@}
.ind h3{font:700 19px 'Space Grotesk';letter-spacing:.2em;text-transform:uppercase;color:@REDHI@;margin-bottom:12px}
.ind div{display:flex;flex-wrap:wrap;gap:10px}
.ind span{font:600 20px 'Space Grotesk';padding:8px 16px;border-radius:999px;border:1.5px solid #5a2320}
.steps{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:20px}
.steps div{font:700 19px 'Space Grotesk';text-transform:uppercase;letter-spacing:.04em;text-align:center;padding:12px 4px;border-radius:16px;background:@RED@}
.steps small{display:block;opacity:.7;font-size:14px;margin-bottom:2px}

/* ---------- PAGE 3 ---------- */
.p3{background:radial-gradient(900px 700px at 12% 8%,#8F1D1448,transparent 60%),radial-gradient(800px 600px at 100% 100%,#8F1D1440,transparent 60%),@BG@}
.p3 h2{font-size:92px;margin-top:34px}
.nums{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px}
.nums div{padding:26px 24px;border-radius:24px;background:@PANEL@;border:1.5px solid @RED@}
.nums b{display:block;font:700 76px/1 'Space Grotesk';letter-spacing:-.05em;color:#fff}
.nums span{font-size:20px;color:#cdbdb9;line-height:1.3;display:block;margin-top:8px}
.src{font-size:17px;color:#8a7672;margin-top:12px}
.price{margin-top:30px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:26px 34px;border-radius:26px;background:@RED@;color:#fff}
.price b{font:700 62px/1 'Space Grotesk';letter-spacing:-.04em}
.price b small{font:500 24px 'Space Grotesk';opacity:.85;letter-spacing:0}
.price span{font:600 22px/1.3 'Space Grotesk';text-align:right;max-width:380px}
.cta{display:grid;grid-template-columns:1fr 290px;gap:32px;margin-top:30px;align-items:center}
.btns{display:grid;gap:14px}
.btn{border-radius:999px;padding:22px 32px;font:700 27px 'Space Grotesk'}
.b1{background:#fff;color:@BG@}
.b2{background:#25D366;color:#04210f}
.b3{border:2px solid #6b2a26;font-size:22px}
.qr{background:#fff;border-radius:26px;padding:18px;text-align:center;color:@BG@;font:700 16px 'Space Grotesk';letter-spacing:.1em;text-transform:uppercase}
.qr img{width:100%;display:block;margin-bottom:8px;border-radius:6px}
.who{display:grid;grid-template-columns:110px 1fr;gap:22px;align-items:center;margin-top:26px}
.who .a{width:110px;height:110px;border-radius:50%;background:center top/cover;border:3px solid @RED@}
.who b{font:700 28px 'Space Grotesk';display:block}.who span{font-size:21px;color:#b9a29e}
.legal{position:absolute;left:80px;right:80px;bottom:34px;font-size:14px;line-height:1.4;color:#7a6663}
'''
for k, v in {'@BG@': BG, '@PANEL@': PANEL, '@LINE@': LINE, '@RED@': RED, '@REDHI@': REDHI, '@TXT@': TXT}.items(): css = css.replace(k, v)

p1 = '''<section class="pg p1">%s<div class="tagline">Performance marketing &middot; Jammu</div>
<h1 style="margin-top:44px">We turn<br>ad spend<br>into <em>business</em><br>opportunities.</h1>
<div class="low"><div class="L"><p class="sub">Specialist Meta Ads for businesses in Jammu &amp; J&amp;K that want customers, not just reach.</p>
<div class="stack"><span class="chip">Meta Ads</span><span class="chip o">Leads</span><span class="chip o">Enquiries</span><span class="chip o">Customers</span></div>
<div class="by"><b>Karan Targotra</b>Founder, ScapeMedia</div></div>
<div class="card" style="background-image:url(%s)"></div></div></section>''' % (LOGO, red)

p2 = '''<section class="pg p2">%s<div style="margin-top:30px"><p class="eb">One specialisation</p>
<h2>Ads that build<br><span class="hi">customers.</span></h2>
<div class="flow"><div><b>1</b>Ad</div><div><b>2</b>Attention</div><div><b>3</b>Enquiry</div><div><b>4</b>Qualified lead</div><div><b>5</b>Sale</div></div>
<div class="tiles">
<div class="tile hot"><span class="ic">01</span><h3>Meta Ads</h3><p>Facebook &amp; Instagram campaigns built on your goal.</p></div>
<div class="tile"><span class="ic">02</span><h3>Lead gen</h3><p>Forms and WhatsApp that capture real enquiries.</p></div>
<div class="tile"><span class="ic">03</span><h3>Creatives</h3><p>Reels, Stories and Feed ads that stop the scroll.</p></div>
<div class="tile"><span class="ic">04</span><h3>Tracking</h3><p>Pixel and cost per lead, so you know what works.</p></div>
<div class="tile"><span class="ic">05</span><h3>Follow-up</h3><p>Fast replies so leads don't go cold.</p></div>
<div class="tile hot"><span class="ic">06</span><h3>Optimise</h3><p>Test, cut losers, scale winners.</p></div></div>
<div class="ind"><h3>Built for</h3><div><span>Automotive</span><span>Real estate</span><span>Education</span><span>Healthcare</span><span>Hotels</span><span>Restaurants</span><span>Retail</span></div></div>
<div class="steps"><div><small>01</small>Discover</div><div><small>02</small>Strategise</div><div><small>03</small>Create</div><div><small>04</small>Launch</div><div><small>05</small>Optimise</div></div></div>
<div class="foot"><span>scapemedia.in</span><span>02 / 03</span></div></section>''' % LOGO

p3 = '''<section class="pg p3">%s
<h2>Real work.<br><span class="hi">Real data.</span></h2>
<div class="nums"><div><b>7.13L</b><span>Instagram views &middot; Jammu Motors</span></div><div><b>2.55L</b><span>Unique viewers reached</span></div><div><b>9.9L</b><span>Views in one month &middot; founder account</span></div></div>
<p class="src">Verified: Instagram Insights (13 Aug &ndash; 10 Nov 2026; June 2026). Ad spend, leads and sales stay client-confidential.</p>
<div class="price"><b>&#8377;6,000<small> /month</small></b><span>Starting price for Meta Ads management. Ad spend is paid directly to Meta.</span></div>
<div class="cta"><div class="btns"><div class="btn b1">Get your free growth audit</div><div class="btn b2">WhatsApp &nbsp;+91 96825 14271</div><div class="btn b3">karan@scapemedia.in &nbsp;&middot;&nbsp; scapemedia.in</div></div>
<div class="qr"><img src="%s" alt="">Scan to chat</div></div>
<div class="who"><div class="a" style="background-image:url(%s)"></div><div><b>Karan Targotra</b><span>Founder &middot; Jammu, J&amp;K</span></div></div>
<div class="legal">Meta, Facebook and Instagram are trademarks of Meta Platforms, Inc. ScapeMedia is independent and not affiliated with Meta. Prices are starting points, excluding taxes. Results depend on offer, budget, market and follow-up; none are guaranteed.</div></section>''' % (LOGO, qrdata, studio)

html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ScapeMedia | Meta Ads for Jammu businesses</title><style>%s</style></head><body>%s</body></html>' % (css, p1 + p2 + p3)
open(OUT + 'ScapeMedia_Onboarding_3page.html', 'w').write(html)
print('ok', len(html))
