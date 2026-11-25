import base64, io, os, qrcode
from PIL import Image, ImageOps

W = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/scratchpad/pdfwork/'
IM = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/images/'
OUT = '/home/user/marketing.in/onboarding/'
os.makedirs(OUT, exist_ok=True)

# ScapeMedia brand: WHITE + RED, red sampled from the highlight of the founder portrait
RED = '#D92B1E'      # brand red (portrait highlight family, #DC3E21, pulled slightly purer)
REDD = '#B01E14'     # deeper red for gradients / hover
REDHI = '#F0452C'    # red accent text on dark backgrounds
DARK = '#150404'     # portrait background
DARK2 = '#250B0A'    # cards on dark
LINE = '#3D1411'
WHITE = '#FFFFFF'
CREAM = '#FBF6F3'
INK = '#150404'

def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()
def font(fam, wt, f, pkg): return "@font-face{font-family:'%s';font-weight:%s;src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, wt, b64(W + 'node_modules/@fontsource/%s/files/%s' % (pkg, f)))
fonts = ''.join([font('Space Grotesk', 500, 'space-grotesk-latin-500-normal.woff2', 'space-grotesk'), font('Space Grotesk', 700, 'space-grotesk-latin-700-normal.woff2', 'space-grotesk'),
                 font('Inter', 400, 'inter-latin-400-normal.woff2', 'inter'), font('Inter', 600, 'inter-latin-600-normal.woff2', 'inter')])

def photo(n, w, h, cy=0.3, q=88):
    im = Image.open(IM + '%d.jpg' % n).convert('RGB'); im = ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(0.5, cy))
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
hero = photo(27, 880, 1100, 0.3)
avatar = photo(27, 400, 400, 0.2)

qr = qrcode.QRCode(border=1, box_size=10); qr.add_data('https://wa.me/919682514271?text=Hi%20Karan%2C%20I%27d%20like%20a%20free%20growth%20audit.'); qr.make(fit=True)
qb = io.BytesIO(); qr.make_image(fill_color=DARK, back_color='#FFFFFF').convert('RGB').save(qb, 'PNG')
qrdata = 'data:image/png;base64,' + base64.b64encode(qb.getvalue()).decode()

def logo(dark=False):
    return '<div class="logo %s"><i></i>ScapeMedia<small>Meta Ads</small></div>' % ('d' if dark else '')

css = fonts + '''
@page{size:1080px 1350px;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;font:400 26px/1.45 Inter,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:1080px;height:1350px;position:relative;overflow:hidden;page-break-after:always;padding:80px}
h1,h2,h3,.logo{font-family:'Space Grotesk',sans-serif}
.logo{display:flex;align-items:center;gap:12px;font-weight:700;font-size:30px;letter-spacing:-.02em}
.logo i{width:16px;height:16px;border-radius:50%;background:@RED@;box-shadow:0 0 0 5px #D92B1E2e}
.logo small{font:500 14px 'Space Grotesk';letter-spacing:.18em;text-transform:uppercase;opacity:.6;margin-left:6px}
.eb{font:700 17px 'Space Grotesk';letter-spacing:.22em;text-transform:uppercase;display:flex;align-items:center;gap:14px;margin-bottom:22px}
.eb:before{content:"";width:40px;height:3px;background:currentColor}
h2{font:700 84px/.94 'Space Grotesk';letter-spacing:-.045em;text-transform:uppercase}
.foot{position:absolute;left:80px;right:80px;bottom:40px;display:flex;justify-content:space-between;font:500 16px 'Space Grotesk';letter-spacing:.16em;text-transform:uppercase;opacity:.55}

/* ===== PAGE 1: white + red cover ===== */
.p1{background:@CREAM@;color:@INK@}
.p1 .rbar{position:absolute;left:0;top:0;bottom:0;width:22px;background:@RED@}
.p1 .logo{margin-left:6px}
.p1 .tagline{position:absolute;right:80px;top:84px;font:700 15px 'Space Grotesk';letter-spacing:.2em;text-transform:uppercase;color:@RED@}
.p1 h1{font:700 118px/.9 'Space Grotesk';letter-spacing:-.055em;text-transform:uppercase;margin:44px 0 0 6px}
.p1 h1 em{font-style:normal;color:@RED@}
.p1 .low{position:absolute;left:86px;right:80px;top:650px;bottom:80px;display:grid;grid-template-columns:1fr 500px;gap:40px}
.p1 .L{display:flex;flex-direction:column;justify-content:space-between}
.p1 .sub{font:500 33px/1.28 'Space Grotesk';color:#3a2a28}
.p1 .stack{display:grid;gap:12px;justify-items:start}
.chip{display:inline-block;font:700 19px 'Space Grotesk';letter-spacing:.12em;text-transform:uppercase;padding:12px 20px;border-radius:999px;background:@RED@;color:#fff}
.chip.o{background:transparent;border:2.5px solid @RED@;color:@RED@}
.p1 .by{font:500 22px 'Space Grotesk';color:#6b5753;border-top:3px solid @RED@;padding-top:18px}
.p1 .by b{display:block;color:@INK@;font-size:28px;margin-bottom:2px}
.p1 .art{position:relative}
.p1 .blob{position:absolute;right:-60px;bottom:-30px;width:470px;height:470px;border-radius:50%;background:@RED@}
.p1 .card{position:absolute;inset:0;border-radius:250px 250px 28px 28px;overflow:hidden;background:#000 center/cover no-repeat;border:6px solid #fff;box-shadow:0 30px 70px -20px #15040877}

/* ===== PAGE 2: dark, red tiles ===== */
.p2{background:radial-gradient(800px 600px at 100% 0%,#D92B1E2a,transparent 60%),@DARK@;color:#F6EFEC}
.p2 .eb{color:@REDHI@}
.p2 .hi{color:@REDHI@}
.p2 .logo small{color:#bba7a3}
.p2 h2{font-size:74px}
.flow{display:grid;grid-template-columns:repeat(5,1fr);margin-top:34px;position:relative}
.flow:before{content:"";position:absolute;left:10%;right:10%;top:34px;height:4px;background:@RED@;border-radius:2px}
.flow div{text-align:center;position:relative;font:700 19px/1.15 'Space Grotesk';letter-spacing:.06em;text-transform:uppercase}
.flow b{display:grid;place-items:center;width:68px;height:68px;margin:0 auto 10px;border-radius:50%;background:@DARK@;color:#fff;border:4px solid @RED@;font:700 22px 'Space Grotesk';box-shadow:0 0 0 8px #D92B1E30}
.flow div:last-child b{background:@RED@}
.tiles{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:30px}
.tile{background:@DARK2@;border:1.5px solid @LINE@;border-radius:26px;padding:22px 24px}
.tile .ic{font:700 20px 'Space Grotesk';color:@REDHI@;letter-spacing:.1em}
.tile h3{font:700 30px/1 'Space Grotesk';letter-spacing:-.03em;text-transform:uppercase;margin:8px 0 6px}
.tile p{font-size:20px;color:#d6c6c2;line-height:1.35}
.tile.hot{background:@RED@;border-color:@RED@}.tile.hot .ic{color:#fff;opacity:.85}.tile.hot p{color:#fff}
.ind{margin-top:26px;padding:22px 28px;border-radius:26px;background:#0D0202;border:1.5px solid @LINE@}
.ind h3{font:700 19px 'Space Grotesk';letter-spacing:.2em;text-transform:uppercase;color:@REDHI@;margin-bottom:12px}
.ind div{display:flex;flex-wrap:wrap;gap:10px}
.ind span{font:600 20px 'Space Grotesk';padding:8px 16px;border-radius:999px;border:1.5px solid #6a2723}
.steps{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:20px}
.steps div{font:700 19px 'Space Grotesk';text-transform:uppercase;letter-spacing:.04em;text-align:center;padding:12px 4px;border-radius:16px;background:@RED@;color:#fff}
.steps small{display:block;opacity:.75;font-size:14px;margin-bottom:2px}

/* ===== PAGE 3: red + white ===== */
.p3{background:linear-gradient(170deg,#E5331F 0%,#D92B1E 45%,@REDD@ 100%);color:#fff}
.p3 .logo i{background:#fff;box-shadow:0 0 0 5px #ffffff3d}
.p3 h2{font-size:92px;margin-top:34px}
.p3 h2 .w{color:@DARK@}
.nums{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px}
.nums div{padding:26px 24px;border-radius:24px;background:#fff;color:@INK@;box-shadow:0 20px 40px -22px #15040899}
.nums b{display:block;font:700 76px/1 'Space Grotesk';letter-spacing:-.05em;color:@RED@}
.nums span{font-size:20px;color:#4a3835;line-height:1.3;display:block;margin-top:8px}
.src{font-size:17px;color:#fff;opacity:.9;margin-top:12px}
.price{margin-top:30px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:26px 34px;border-radius:26px;background:@DARK@;color:#fff}
.price b{font:700 62px/1 'Space Grotesk';letter-spacing:-.04em}
.price b small{font:500 24px 'Space Grotesk';opacity:.7;letter-spacing:0}
.price span{font:600 22px/1.3 'Space Grotesk';text-align:right;max-width:380px;color:#f2dedb}
.cta{display:grid;grid-template-columns:1fr 290px;gap:32px;margin-top:30px;align-items:center}
.btns{display:grid;gap:14px}
.btn{border-radius:999px;padding:22px 32px;font:700 27px 'Space Grotesk'}
.b1{background:#fff;color:@RED@;box-shadow:0 14px 30px -12px #15040899}
.b2{background:#25D366;color:#04210f}
.b3{border:2.5px solid #ffffffcc;font-size:22px;color:#fff}
.qr{background:#fff;border-radius:26px;padding:18px;text-align:center;color:@DARK@;font:700 16px 'Space Grotesk';letter-spacing:.1em;text-transform:uppercase}
.qr img{width:100%;display:block;margin-bottom:8px;border-radius:6px}
.who{display:grid;grid-template-columns:110px 1fr;gap:22px;align-items:center;margin-top:26px}
.who .a{width:110px;height:110px;border-radius:50%;background:center top/cover;border:4px solid #fff}
.who b{font:700 28px 'Space Grotesk';display:block}.who span{font-size:21px;color:#ffe4e0}
.legalbar{position:absolute;left:0;right:0;bottom:0;height:96px;background:@DARK@;padding:20px 80px;font-size:14px;line-height:1.4;color:#c8b4b0}
'''
for k, v in {'@RED@': RED, '@REDD@': REDD, '@REDHI@': REDHI, '@DARK@': DARK, '@DARK2@': DARK2, '@LINE@': LINE, '@CREAM@': CREAM, '@INK@': INK}.items(): css = css.replace(k, v)

p1 = '''<section class="pg p1"><div class="rbar"></div>%s<div class="tagline">Performance marketing &middot; Jammu</div>
<h1>We turn<br>ad spend<br>into <em>business</em><br>opportunities.</h1>
<div class="low"><div class="L"><p class="sub">Specialist Meta Ads for businesses in Jammu &amp; J&amp;K that want customers, not just reach.</p>
<div class="stack"><span class="chip">Meta Ads</span><span class="chip o">Leads</span><span class="chip o">Enquiries</span><span class="chip o">Customers</span></div>
<div class="by"><b>Karan Targotra</b>Founder, ScapeMedia</div></div>
<div class="art"><div class="blob"></div><div class="card" style="background-image:url(%s)"></div></div></div></section>''' % (logo(), hero)

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
<div class="foot"><span>scapemedia.in</span><span>02 / 03</span></div></section>''' % logo(True)

p3 = '''<section class="pg p3">%s
<h2>Real work.<br><span class="w">Real data.</span></h2>
<div class="nums"><div><b>7.13L</b><span>Instagram views &middot; Jammu Motors</span></div><div><b>2.55L</b><span>Unique viewers reached</span></div><div><b>9.9L</b><span>Views in one month &middot; founder account</span></div></div>
<p class="src">Verified: Instagram Insights (13 Aug &ndash; 10 Nov 2026; June 2026). Ad spend, leads and sales stay client-confidential.</p>
<div class="price"><b>&#8377;6,000<small> /month</small></b><span>Starting price for Meta Ads management. Ad spend is paid directly to Meta.</span></div>
<div class="cta"><div class="btns"><div class="btn b1">Get your free growth audit</div><div class="btn b2">WhatsApp &nbsp;+91 96825 14271</div><div class="btn b3">karan@scapemedia.in &nbsp;&middot;&nbsp; scapemedia.in</div></div>
<div class="qr"><img src="%s" alt="">Scan to chat</div></div>
<div class="who"><div class="a" style="background-image:url(%s)"></div><div><b>Karan Targotra</b><span>Founder &middot; Jammu, J&amp;K</span></div></div>
<div class="legalbar">Meta, Facebook and Instagram are trademarks of Meta Platforms, Inc. ScapeMedia is independent and not affiliated with Meta. Prices are starting points, excluding taxes. Results depend on offer, budget, market and follow-up; none are guaranteed.</div></section>''' % (logo(True), qrdata, avatar)

html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ScapeMedia | Meta Ads for Jammu businesses</title><style>%s</style></head><body>%s</body></html>' % (css, p1 + p2 + p3)
open(OUT + 'ScapeMedia_Onboarding_3page.html', 'w').write(html)
print('ok', len(html))
