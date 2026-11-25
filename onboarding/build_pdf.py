import base64, io, qrcode
from PIL import Image, ImageOps

W = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/scratchpad/pdfwork/'
IM = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/images/'
OUT = '/home/user/marketing.in/onboarding/'
import os; os.makedirs(OUT, exist_ok=True)

def b64(path): return base64.b64encode(open(path, 'rb').read()).decode()
def font(fam, wt, file, pkg): return "@font-face{font-family:'%s';font-weight:%s;src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, wt, b64(W + 'node_modules/@fontsource/%s/files/%s' % (pkg, file)))
fonts = ''.join([
    font('Space Grotesk', 500, 'space-grotesk-latin-500-normal.woff2', 'space-grotesk'),
    font('Space Grotesk', 700, 'space-grotesk-latin-700-normal.woff2', 'space-grotesk'),
    font('Inter', 400, 'inter-latin-400-normal.woff2', 'inter'),
    font('Inter', 600, 'inter-latin-600-normal.woff2', 'inter')])

def photo(n, w, h, cy=0.35, q=84):
    im = Image.open(IM + '%d.jpg' % n).convert('RGB'); im = ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(0.5, cy))
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
red = photo(25, 760, 1100, 0.3)        # red-lit portrait
studio = photo(26, 700, 900, 0.3)      # studio portrait

qr = qrcode.QRCode(border=1, box_size=10); qr.add_data('https://wa.me/919682514271?text=Hi%20Karan%2C%20I%27d%20like%20a%20free%20growth%20audit.'); qr.make(fit=True)
qi = qr.make_image(fill_color='#0B0B0C', back_color='#FFFFFF').convert('RGB'); qb = io.BytesIO(); qi.save(qb, 'PNG')
qrdata = 'data:image/png;base64,' + base64.b64encode(qb.getvalue()).decode()

LOGO = '<div class="logo"><i></i>ScapeMedia<small>Meta Ads</small></div>'
def foot(n, dark=True): return '<div class="foot"><span>scapemedia.in</span><span>%02d / 10</span></div>' % n

css = fonts + '''
@page{size:1080px 1350px;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px}
body{font:400 26px/1.5 Inter,sans-serif;color:#F4F1EC;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:1080px;height:1350px;position:relative;overflow:hidden;page-break-after:always;padding:84px 84px 96px;background:#0B0B0C}
.pg.cream{background:#F3EFE8;color:#0B0B0C}
h1,h2,h3,.logo{font-family:'Space Grotesk',sans-serif}
.logo{display:flex;align-items:center;gap:12px;font-weight:700;font-size:30px;letter-spacing:-.02em}
.logo i{width:16px;height:16px;border-radius:50%;background:#FF6200;box-shadow:0 0 22px #FF6200}
.logo small{font:500 14px 'Space Grotesk';letter-spacing:.18em;text-transform:uppercase;color:#9a9aa3;margin-left:6px}
.cream .logo small{color:#6b6b73}
.eyebrow{font:700 17px 'Space Grotesk';letter-spacing:.2em;text-transform:uppercase;color:#FF6200;display:flex;align-items:center;gap:14px;margin-bottom:26px}
.eyebrow:before{content:"";width:40px;height:3px;background:#FF6200}
.cream .eyebrow{color:#C24A00}.cream .eyebrow:before{background:#C24A00}
h2{font:700 82px/.96 'Space Grotesk';letter-spacing:-.04em;text-transform:uppercase}
h2 em{font-style:normal;color:#FF6200}.cream h2 em{color:#E85500}
.lead{font-size:28px;color:#b9b9c2;margin-top:28px;max-width:820px}
.cream .lead{color:#4a4a52}
.foot{position:absolute;left:84px;right:84px;bottom:44px;display:flex;justify-content:space-between;font:500 16px 'Space Grotesk';letter-spacing:.14em;text-transform:uppercase;color:#6f6f78}
.cream .foot{color:#8a8a92}
.glow{position:absolute;border-radius:50%;filter:blur(10px);pointer-events:none}
.card{border-radius:28px;padding:34px 36px}
.dk{background:#16161A;border:1px solid #2a2a30}
.cr{background:#fff;border:1px solid #0b0b0c14;color:#0B0B0C}
.tag{display:inline-block;font:700 15px 'Space Grotesk';letter-spacing:.12em;text-transform:uppercase;padding:9px 16px;border-radius:999px;border:1.5px solid #ff620088;color:#FF6200;background:#ff620014}
.n{font:700 20px 'Space Grotesk';color:#FF6200;letter-spacing:.08em}
.cream .n{color:#C24A00}

/* cover */
.cover{padding:0}
.cover .photo{position:absolute;right:0;top:0;width:520px;height:1350px;background:#000 center/cover no-repeat}
.cover .photo:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#0B0B0C 0%,#0b0b0c00 45%),linear-gradient(0deg,#0B0B0C 0%,#0b0b0c00 30%)}
.cover .in{position:absolute;left:84px;top:84px;bottom:96px;width:720px;display:flex;flex-direction:column}
.cover h1{font:700 118px/.9 'Space Grotesk';letter-spacing:-.05em;text-transform:uppercase;margin-top:auto}
.cover h1 em{font-style:normal;color:#FF6200}
.cover p.sub{font-size:30px;color:#cfcfd6;margin-top:36px;max-width:640px}
.cover .meta{display:flex;gap:14px;flex-wrap:wrap;margin-top:44px}
.cover .meta .tag{color:#F4F1EC;border-color:#ffffff33;background:#ffffff0d}
.cover .by{margin-top:44px;font:500 22px 'Space Grotesk';color:#9a9aa3;letter-spacing:.04em}
.cover .by b{color:#F4F1EC;font-weight:700}

/* problem */
.pain{display:grid;gap:22px;margin-top:56px}
.pain .card{display:grid;grid-template-columns:90px 1fr;gap:20px;align-items:start}
.pain .big{font:700 62px/1 'Space Grotesk';color:#E85500;letter-spacing:-.04em}
.pain h3{font:700 32px/1.1 'Space Grotesk';text-transform:uppercase;letter-spacing:-.01em;margin-bottom:8px}
.pain p{font-size:24px;color:#4a4a52}
.callout{margin-top:44px;padding:34px 40px;border-radius:28px;background:#0B0B0C;color:#F4F1EC;font:700 40px/1.15 'Space Grotesk';letter-spacing:-.02em;text-transform:uppercase}
.callout em{font-style:normal;color:#FF6200}

/* pillars */
.pill{display:grid;gap:22px;margin-top:56px}
.pill .card{display:grid;grid-template-columns:100px 1fr;gap:10px 20px;align-items:center;padding:36px 40px}
.pill h3{font:700 44px/1 'Space Grotesk';text-transform:uppercase;letter-spacing:-.03em}
.pill p{font-size:25px;color:#b9b9c2;grid-column:2}
.pill .n{font-size:30px}
.pill .card:first-child{background:linear-gradient(120deg,#ff62002e,#16161A 60%);border-color:#ff620066}

/* system / funnel */
.sys{display:grid;grid-template-columns:1fr 1fr;gap:34px;margin-top:50px;align-items:start}
.fn{display:grid;gap:11px;justify-items:center}
.fn div{height:74px;border-radius:16px;border:1.5px solid #ff620066;background:#16161A;display:flex;align-items:center;justify-content:space-between;padding:0 24px;font:700 21px 'Space Grotesk';letter-spacing:.06em;text-transform:uppercase}
.fn div small{font:400 16px Inter;text-transform:none;letter-spacing:0;color:#9a9aa3}
.fn div:last-child{background:linear-gradient(90deg,#FF6200,#FF8A3D);color:#0B0B0C;border:0}
.fn div:last-child small{color:#2b1200}
.parts{display:grid;gap:11px}
.parts div{display:grid;grid-template-columns:44px 1fr;gap:12px;align-items:center;padding:14px 18px;border-radius:16px;background:#16161A;border:1px solid #2a2a30;font:700 20px 'Space Grotesk';text-transform:uppercase;letter-spacing:.02em}
.parts div span{color:#FF6200;font-size:16px}
.parts div small{display:block;font:400 16px Inter;text-transform:none;letter-spacing:0;color:#9a9aa3}
.boost{margin-top:36px;padding:26px 34px;border-radius:22px;border:2px dashed #ff620088;font:600 28px/1.3 'Space Grotesk'}
.boost b{color:#FF6200}

/* industries */
.ind{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:44px}
.ind .card{padding:26px 30px}
.ind h3{font:700 30px/1.05 'Space Grotesk';text-transform:uppercase;letter-spacing:-.02em;margin-bottom:8px}
.ind p{font-size:22px;color:#4a4a52;line-height:1.4}
.ind .card.wide{grid-column:span 2;background:#0B0B0C;color:#F4F1EC;border:0}
.ind .card.wide p{color:#b9b9c2}
.ind .card.wide h3 span{color:#FF6200}
.note{margin-top:26px;font-size:20px;color:#6b6b73}

/* process */
.proc{margin-top:52px;display:grid;gap:0}
.proc .row{display:grid;grid-template-columns:110px 1fr;gap:20px;padding:30px 0;border-top:1.5px solid #2a2a30;align-items:start}
.proc .row:last-child{border-bottom:1.5px solid #2a2a30}
.proc .no{font:700 56px/1 'Space Grotesk';color:#FF6200;letter-spacing:-.04em}
.proc h3{font:700 40px/1 'Space Grotesk';text-transform:uppercase;letter-spacing:-.02em;margin-bottom:8px}
.proc p{font-size:24px;color:#b9b9c2}

/* timeline */
.tl{margin-top:50px;display:grid;gap:18px}
.tl .w{display:grid;grid-template-columns:200px 1fr;gap:26px;align-items:start}
.tl .wk{background:#0B0B0C;color:#fff;border-radius:22px;padding:22px 26px;font:700 26px/1.1 'Space Grotesk';text-transform:uppercase;letter-spacing:-.01em}
.tl .wk small{display:block;color:#FF6200;font:700 15px 'Space Grotesk';letter-spacing:.16em;margin-bottom:6px}
.tl .bd{background:#fff;border:1px solid #0b0b0c14;border-radius:22px;padding:22px 28px}
.tl .bd h3{font:700 28px/1.1 'Space Grotesk';text-transform:uppercase;margin-bottom:8px}
.tl .bd li{font-size:22px;color:#4a4a52;margin-left:22px;line-height:1.45}

/* proof */
.pf{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:48px}
.pf .card{padding:30px 26px;background:#ff62000f;border:1.5px solid #ff620044}
.pf b{display:block;font:700 76px/1 'Space Grotesk';color:#FF6200;letter-spacing:-.05em}
.pf span{display:block;font-size:21px;color:#cfcfd6;margin-top:10px;line-height:1.3}
.src{font-size:19px;color:#77777f;margin-top:16px}
.hd3{font:700 30px/1 'Space Grotesk';text-transform:uppercase;margin-top:44px;letter-spacing:-.01em;display:flex;align-items:center;gap:14px}
.hd3 .ok{font:700 14px 'Space Grotesk';letter-spacing:.14em;color:#3ddc84;border:1.5px solid #3ddc8466;background:#3ddc8412;border-radius:999px;padding:7px 13px}
.conf{margin-top:34px;padding:28px 34px;border-radius:24px;background:#16161A;border:1.5px dashed #ffffff30;font-size:23px;color:#cfcfd6}
.conf b{color:#F4F1EC}

/* together */
.tg{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:46px}
.tg .card{padding:34px 34px}
.tg h3{font:700 32px/1 'Space Grotesk';text-transform:uppercase;margin-bottom:18px;letter-spacing:-.02em}
.tg li{font-size:23px;line-height:1.4;color:#3a3a42;margin:0 0 12px 24px}
.tg .price{background:#0B0B0C;color:#F4F1EC;border:0}
.tg .price li{color:#cfcfd6}
.price .amt{font:700 70px/1 'Space Grotesk';color:#FF6200;letter-spacing:-.05em;margin:4px 0 4px}
.price .amt small{font:500 24px 'Space Grotesk';color:#9a9aa3;letter-spacing:0}
.price p{font-size:21px;color:#b9b9c2;margin-bottom:16px}
.fine{margin-top:24px;font-size:20px;color:#6b6b73}

/* cta */
.cta{padding:0}
.cta .bg{position:absolute;inset:0;background:radial-gradient(900px 700px at 20% 15%,#ff62003d,transparent 60%),radial-gradient(800px 600px at 100% 100%,#ff62002a,transparent 60%),#0B0B0C}
.cta .in{position:absolute;inset:84px 84px 96px}
.cta h2{font-size:96px;margin-top:70px;max-width:900px}
.cta .row{display:grid;grid-template-columns:1fr 330px;gap:40px;margin-top:56px;align-items:center}
.cta .btns{display:grid;gap:16px}
.cta .btn{display:flex;align-items:center;gap:14px;border-radius:999px;padding:24px 34px;font:700 28px 'Space Grotesk';letter-spacing:.01em}
.cta .b1{background:#FF6200;color:#0B0B0C}
.cta .b2{background:#25D366;color:#04210f}
.cta .b3{border:2px solid #ffffff33;color:#F4F1EC;font-size:24px}
.cta .qr{background:#fff;border-radius:28px;padding:20px;text-align:center;color:#0B0B0C;font:700 18px 'Space Grotesk';letter-spacing:.1em;text-transform:uppercase}
.cta .qr img{width:100%;display:block;margin-bottom:10px;border-radius:8px}
.cta .who{display:grid;grid-template-columns:150px 1fr;gap:26px;align-items:center;margin-top:56px;padding:26px 30px;border-radius:28px;background:#16161A;border:1px solid #2a2a30}
.cta .who .ph{width:150px;height:150px;border-radius:50%;background:center top/cover;border:3px solid #FF6200}
.cta .who b{font:700 30px 'Space Grotesk';display:block}
.cta .who span{font-size:22px;color:#b9b9c2;line-height:1.35;display:block;margin-top:6px}
.legal{position:absolute;left:84px;right:84px;bottom:86px;font-size:15px;color:#6b6b74;line-height:1.45}
'''

css += '''
.pain{margin-top:38px;gap:16px}.pain .card{padding:26px 32px}.pain p{font-size:23px}
.callout{margin-top:30px;padding:28px 36px;font-size:36px}
.pf{margin-top:26px;gap:16px}.pf .card{padding:22px 24px}.pf b{font-size:68px}
.hd3{margin-top:30px;font-size:27px}.src{margin-top:12px;font-size:18px}
.conf{margin-top:24px;padding:22px 30px;font-size:21px}
.tg{margin-top:32px}.tg .card{padding:28px 30px}.tg li{font-size:22px;margin-bottom:9px}.price .amt{font-size:64px}
.fine{margin-top:18px}
.cta h2{margin-top:56px}.cta .who{margin-top:44px}
'''

pages = []
# 1 COVER
pages.append('''<section class="pg cover"><div class="photo" style="background-image:url(%s)"></div>
<div class="in">%s
<h1>We turn<br>ad spend<br>into <em>business</em><br>opportunities.</h1>
<p class="sub">Specialist Meta Ads and performance marketing for businesses in Jammu &amp; J&amp;K that want customers, not just reach.</p>
<div class="meta"><span class="tag">Meta Ads</span><span class="tag">Lead generation</span><span class="tag">Optimisation</span></div>
<div class="by">Client onboarding guide &nbsp;·&nbsp; by <b>Karan Targotra</b>, Founder</div></div></section>''' % (red, LOGO))

# 2 PROBLEM
pages.append('''<section class="pg cream">%s<div style="margin-top:48px"><p class="eyebrow">The problem</p>
<h2>Boosting posts<br>doesn't bring <em>customers.</em></h2>
<div class="pain">
<div class="card cr"><span class="big">01</span><div><h3>Reach without enquiries</h3><p>Likes and views go up. The phone stays quiet. Spend has no clear link to business.</p></div></div>
<div class="card cr"><span class="big">02</span><div><h3>Leads that go cold</h3><p>Enquiries arrive, but slow follow-up means the customer is already talking to someone else.</p></div></div>
<div class="card cr"><span class="big">03</span><div><h3>No idea what works</h3><p>No tracking, no testing. Budget is decided by gut feeling, not by data.</p></div></div></div>
<div class="callout">Advertising works when it's a <em>system</em>, not a button.</div></div>%s</section>''' % (LOGO, foot(2)))

# 3 PILLARS
pages.append('''<section class="pg">%s<div style="margin-top:70px"><p class="eyebrow">What we do</p>
<h2>One specialisation.<br><em>One growth focus.</em></h2>
<p class="lead">We don't do everything. We do Meta advertising, and we do it with one aim: qualified enquiries for your business.</p>
<div class="pill">
<div class="card dk"><span class="n">01</span><h3>Meta Ads</h3><p>Facebook and Instagram campaigns built around your business objective.</p></div>
<div class="card dk"><span class="n">02</span><h3>Lead generation</h3><p>Funnels designed to attract and capture relevant enquiries, through lead forms or WhatsApp.</p></div>
<div class="card dk"><span class="n">03</span><h3>Performance optimisation</h3><p>Ongoing creative testing, audience analysis and improvement. Winners scale, losers stop.</p></div></div></div>%s</section>''' % (LOGO, foot(3)))

# 4 SYSTEM
pages.append('''<section class="pg">%s<div style="margin-top:60px"><p class="eyebrow">The growth engine</p>
<h2>A connected system,<br><em>not a boost.</em></h2>
<div class="sys"><div class="fn">
<div style="width:100%%">Advertising <small>Meta Ads live</small></div>
<div style="width:92%%">Attention <small>Hook stops the scroll</small></div>
<div style="width:84%%">Interest <small>Offer makes sense</small></div>
<div style="width:76%%">Enquiries <small>Form / WhatsApp</small></div>
<div style="width:68%%">Qualified leads <small>Right person</small></div>
<div style="width:60%%">Sales chances <small>You close</small></div></div>
<div class="parts">
<div><span>01</span><p>Meta Ads<small>Objective, structure, budget</small></p></div>
<div><span>02</span><p>Creatives<small>Hooks built on buyer motives</small></p></div>
<div><span>03</span><p>Audience<small>Location, age, interest</small></p></div>
<div><span>04</span><p>Destination<small>Landing page / WhatsApp</small></p></div>
<div><span>05</span><p>Lead capture<small>Forms that qualify</small></p></div>
<div><span>06</span><p>Follow-up<small>Fast replies</small></p></div>
<div><span>07</span><p>Analysis<small>Cost per lead, quality</small></p></div></div></div>
<div class="boost">A boosted post covers <b>1 of these 7.</b> We build and run all of them together.</div></div>%s</section>''' % (LOGO, foot(4)))

# 5 INDUSTRIES
pages.append('''<section class="pg cream">%s<div style="margin-top:60px"><p class="eyebrow">Who we help</p>
<h2>Built for businesses<br><em>that want to grow.</em></h2>
<div class="ind">
<div class="card wide"><h3>Automotive dealerships <span>· hands-on experience</span></h3><p>Vehicle enquiries, test-drive bookings and exchange campaigns.</p></div>
<div class="card cr"><h3>Real estate</h3><p>Property enquiries, site-visit bookings and project launches.</p></div>
<div class="card cr"><h3>Education &amp; coaching</h3><p>Course enquiries, admission campaigns and counselling bookings.</p></div>
<div class="card cr"><h3>Healthcare</h3><p>Appointment enquiries and awareness, within Meta's health ad policies.</p></div>
<div class="card cr"><h3>Hotels &amp; hospitality</h3><p>Room bookings, event enquiries and seasonal promotions.</p></div>
<div class="card cr"><h3>Restaurants</h3><p>Table bookings, delivery orders and festive offers.</p></div>
<div class="card cr"><h3>Retail</h3><p>Store visits, new-arrival launches and sale campaigns.</p></div></div>
<p class="note">Results depend on your offer, budget, market and follow-up. We never guarantee leads or sales.</p></div>%s</section>''' % (LOGO, foot(5)))

# 6 PROCESS
pages.append('''<section class="pg">%s<div style="margin-top:60px"><p class="eyebrow">Our process</p>
<h2>From business goal<br>to <em>live campaign.</em></h2>
<div class="proc">
<div class="row"><span class="no">01</span><div><h3>Discover</h3><p>We understand your business, offer, margins and objectives.</p></div></div>
<div class="row"><span class="no">02</span><div><h3>Strategise</h3><p>Market and competitor research, then a written advertising plan.</p></div></div>
<div class="row"><span class="no">03</span><div><h3>Create</h3><p>Campaign concepts and ad creatives built for Reels, Stories and Feed.</p></div></div>
<div class="row"><span class="no">04</span><div><h3>Launch</h3><p>Tracking, lead capture and campaigns go live, monitored from day one.</p></div></div>
<div class="row"><span class="no">05</span><div><h3>Optimise</h3><p>We review results, improve performance and scale only where data justifies it.</p></div></div></div></div>%s</section>''' % (LOGO, foot(6)))

# 7 FIRST 30 DAYS
pages.append('''<section class="pg cream">%s<div style="margin-top:60px"><p class="eyebrow">What to expect</p>
<h2>Your first<br><em>30 days.</em></h2>
<p class="lead">A typical plan. Exact steps are fixed in your growth audit.</p>
<div class="tl">
<div class="w"><div class="wk"><small>Week 1</small>Foundation</div><div class="bd"><h3>Audit &amp; set-up</h3><ul><li>Business, offer and market review</li><li>Ad account, Pixel and tracking checked</li><li>Lead capture and WhatsApp route ready</li></ul></div></div>
<div class="w"><div class="wk"><small>Week 2</small>Launch</div><div class="bd"><h3>Creatives &amp; first campaigns</h3><ul><li>Multiple hooks and formats go live</li><li>Audience and offer tests start</li><li>Daily monitoring, no blind spend</li></ul></div></div>
<div class="w"><div class="wk"><small>Week 3</small>Learn</div><div class="bd"><h3>Read the data</h3><ul><li>Lead quality checked, not just volume</li><li>Weak ads paused, strong ones kept</li><li>New creative variations added</li></ul></div></div>
<div class="w"><div class="wk"><small>Week 4</small>Decide</div><div class="bd"><h3>Report &amp; scale plan</h3><ul><li>Plain-language report: spend, leads, cost per lead</li><li>Clear recommendation for month two</li><li>Budget increases only where justified</li></ul></div></div></div></div>%s</section>''' % (LOGO, foot(7)))

# 8 PROOF
pages.append('''<section class="pg">%s<div style="margin-top:40px"><p class="eyebrow">Proof &amp; performance</p>
<h2>Real work.<br>Real data. <em>Real progress.</em></h2>
<div class="hd3">Jammu Motors &middot; Instagram <span class="ok">Verified</span></div>
<div class="pf"><div class="card"><b>7.13L</b><span>Views</span></div><div class="card"><b>2.55L</b><span>Unique viewers</span></div><div class="card"><b>+208</b><span>Net followers</span></div></div>
<p class="src">Source: Instagram Insights, 13 Aug &ndash; 10 Nov 2026.</p>
<div class="hd3">Founder account &middot; @karantargotra.a <span class="ok">Verified</span></div>
<div class="pf"><div class="card"><b>9.9L</b><span>Views in June 2026</span></div><div class="card"><b>7.6L</b><span>Views in July 2026</span></div><div class="card"><b>95%%</b><span>Views from non-followers</span></div></div>
<p class="src">Source: Instagram monthly insights.</p>
<div class="conf"><b>Ad spend, leads, cost per lead and sales are client-confidential.</b> We never publish figures we can't verify. Anonymised campaign examples are shared in your growth audit.</div></div>%s</section>''' % (LOGO, foot(8)))

# 9 WORKING TOGETHER
pages.append('''<section class="pg cream">%s<div style="margin-top:44px"><p class="eyebrow">Working together</p>
<h2>Simple terms.<br><em>Clear scope.</em></h2>
<div class="tg">
<div class="card cr"><h3>What we need from you</h3><ul><li>Your offer, pricing and best-selling products or services</li><li>Access to your Facebook Page, Instagram and ad account</li><li>Your WhatsApp or phone number for leads</li><li>Any past ad data and customer photos or videos</li><li>A monthly ad budget you're comfortable with</li></ul></div>
<div class="card price"><h3>Investment</h3><p>Meta Ads management from</p><div class="amt">&#8377;6,000<small> / month</small></div><ul><li>Ad spend is paid directly to Meta from your own account</li><li>Final quote after a free audit</li><li>Written scope before any spend</li></ul></div></div>
<p class="fine">Prices are starting points and exclude applicable taxes. Meta ad spend is separate. No guaranteed results.</p>
<div class="callout" style="margin-top:30px;font-size:34px">You own your ad account, your data and your leads. <em>Always.</em></div></div>%s</section>''' % (LOGO, foot(9)))

# 10 CTA
pages.append('''<section class="pg cta"><div class="bg"></div><div class="in">%s
<h2>Your next customer could come from <em>your next campaign.</em></h2>
<div class="row"><div class="btns">
<div class="btn b1">Get your free growth audit</div>
<div class="btn b2">WhatsApp &nbsp;+91 96825 14271</div>
<div class="btn b3">karan@scapemedia.in &nbsp;&middot;&nbsp; scapemedia.in</div></div>
<div class="qr"><img src="%s" alt="">Scan to chat on WhatsApp</div></div>
<div class="who"><div class="ph" style="background-image:url(%s)"></div><div><b>Karan Targotra</b><span>Founder, ScapeMedia &middot; Jammu, J&amp;K<br>I review every audit request personally.</span></div></div></div>
<div class="legal">Meta, Facebook and Instagram are trademarks of Meta Platforms, Inc. ScapeMedia is an independent agency and is not affiliated with or endorsed by Meta. Results depend on offer, budget, market and follow-up; no results are guaranteed.</div></section>''' % (LOGO, qrdata, studio))

html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ScapeMedia | Client Onboarding Guide</title><style>%s</style></head><body>%s</body></html>' % (css, ''.join(pages))
open(OUT + 'ScapeMedia_Client_Onboarding.html', 'w').write(html)
print('html', len(html))
