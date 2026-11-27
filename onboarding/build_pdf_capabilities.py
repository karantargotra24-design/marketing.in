import base64, io, os, qrcode
from PIL import Image, ImageOps

W = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/scratchpad/pdfwork/'
IM = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/images/'
OUT = '/home/user/marketing.in/onboarding/'
os.makedirs(OUT, exist_ok=True)

RED = '#E10600'; BLACK = '#0A0A0A'

def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()
def ff(fam, pkg, wt): return "@font-face{font-family:'%s';font-weight:%s;src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, wt, b64(W + 'node_modules/@fontsource/%s/files/%s-latin-%s-normal.woff2' % (pkg, pkg, wt)))
fonts = ''.join([ff('Poppins', 'poppins', w) for w in (500, 600, 700)] + [ff('Inter', 'inter', w) for w in (400, 600)])

# cover photo: right half of A4, full-bleed, clean crop (no frame)
src = Image.open(IM + '27.jpg').convert('RGB')
ph = ImageOps.fit(src, (760, 2246), Image.LANCZOS, centering=(0.55, 0.0))
b = io.BytesIO(); ph.save(b, 'JPEG', quality=88); cover = 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

qr = qrcode.QRCode(border=0, box_size=10); qr.add_data('https://wa.me/919682514271?text=Hi%20Karan%2C%20I%27d%20like%20a%20free%20growth%20audit.'); qr.make(fit=True)
qb = io.BytesIO(); qr.make_image(fill_color=BLACK, back_color='#FFFFFF').convert('RGB').save(qb, 'PNG')
qrdata = 'data:image/png;base64,' + base64.b64encode(qb.getvalue()).decode()

css = fonts + '''
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:210mm}
body{font:400 10pt/1.6 Inter,sans-serif;color:#2B2B2B;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;background:#fff;padding:22mm 18mm 20mm}
h1,h2,h3,.logo{font-family:Poppins,sans-serif;color:@BLACK@}
.logo{display:flex;align-items:center;gap:7px;font-weight:700;font-size:14pt;letter-spacing:-.01em}
.logo i{width:9px;height:9px;border-radius:50%;background:@RED@}
.hdr{position:absolute;left:18mm;right:18mm;top:11mm;display:flex;justify-content:space-between;align-items:center;font:500 7.5pt Poppins;letter-spacing:.14em;text-transform:uppercase;color:#8A8A8A;padding-bottom:3mm;border-bottom:.6pt solid #DCDCDC}
.hdr .logo{font-size:10pt;letter-spacing:-.01em;text-transform:none;color:@BLACK@}
.ftr{position:absolute;left:18mm;right:18mm;bottom:10mm;display:flex;justify-content:space-between;font:500 7.5pt Poppins;letter-spacing:.12em;text-transform:uppercase;color:#8A8A8A;padding-top:3mm;border-top:.6pt solid #DCDCDC}
.ftr b{color:@BLACK@;font-weight:600}
.eb{font:600 7.5pt Poppins;letter-spacing:.16em;text-transform:uppercase;color:@RED@;margin-bottom:4mm}
.sec{display:grid;grid-template-columns:44mm 1fr;gap:7mm;padding:9mm 0;border-top:.6pt solid #DCDCDC}
.sec:first-of-type{border-top:0}
.sec .lab .n{font:600 22pt/1 Poppins;color:@RED@;letter-spacing:-.02em}
.sec .lab h2{font:600 15pt/1.2 Poppins;margin-top:3mm;letter-spacing:-.01em}
h3{font:600 11pt/1.3 Poppins;letter-spacing:-.005em}
p.lead{font:500 14pt/1.45 Poppins;color:@BLACK@;letter-spacing:-.01em}
p+p{margin-top:3mm}
.muted{color:#6B6B6B}

/* COVER */
.cover{padding:0}
.cover .ph{position:absolute;right:0;top:0;width:95mm;height:297mm;background:#111 center top/cover no-repeat}
.cover .in{position:absolute;left:18mm;top:20mm;bottom:18mm;width:88mm;display:flex;flex-direction:column}
.cover .logo{font-size:16pt}
.cover .mid{margin-top:auto;margin-bottom:auto}
.cover .eb{margin-bottom:6mm}
.cover h1{font:600 30pt/1.12 Poppins;letter-spacing:-.025em}
.cover h1 span{color:@RED@}
.cover .rule{width:16mm;height:1.6mm;background:@RED@;margin:9mm 0 7mm}
.cover .sub{font:400 11pt/1.6 Inter;color:#4A4A4A}
.cover .kw{margin-top:9mm;display:grid;gap:2.4mm}
.cover .kw div{font:500 9.5pt Poppins;color:@BLACK@;display:flex;align-items:center;gap:3mm;padding-bottom:2.4mm;border-bottom:.6pt solid #E5E5E5}
.cover .kw div b{color:@RED@;font-weight:600;width:7mm}
.cover .meta{border-top:.6pt solid #DCDCDC;padding-top:4mm;display:grid;grid-template-columns:1fr 1fr;gap:4mm;font-size:8pt;color:#6B6B6B}
.cover .meta b{display:block;font:600 9pt Poppins;color:@BLACK@}

/* page 2 */
.steps4{display:grid;grid-template-columns:repeat(4,1fr);border-top:1.4pt solid @BLACK@;margin-top:1mm}
.steps4 div{padding:4mm 4mm 0 0}
.steps4 div+div{padding-left:4mm;border-left:.6pt solid #DCDCDC}
.steps4 .k{font:600 8pt Poppins;color:@RED@;letter-spacing:.1em}
.steps4 h3{margin:1.5mm 0 1.5mm}
.steps4 p{font-size:8.6pt;line-height:1.5;color:#555}
.arrow{color:@RED@;font-weight:600}
.three{display:grid;grid-template-columns:repeat(3,1fr);gap:6mm}
.three h3{margin-bottom:1.5mm;padding-top:3mm;border-top:1.4pt solid @RED@}
.three p{font-size:8.8pt;line-height:1.55;color:#555}

/* page 3 */
.svc{display:grid;grid-template-columns:1fr 1fr;border-top:1.4pt solid @BLACK@}
.svc>div{padding:5mm 5mm 5mm 0;border-bottom:.6pt solid #DCDCDC}
.svc>div:nth-child(even){padding-left:5mm;border-left:.6pt solid #DCDCDC}
.svc .k{font:600 8pt Poppins;color:@RED@;letter-spacing:.1em}
.svc h3{margin:1.2mm 0 1.5mm;font-size:11.5pt}
.svc p{font-size:8.8pt;line-height:1.5;color:#555}
.svc ul{list-style:none;margin-top:2.5mm}
.svc li{font-size:8.4pt;color:@BLACK@;padding-left:4mm;position:relative;line-height:1.7}
.svc li:before{content:"";position:absolute;left:0;top:2.1mm;width:1.6mm;height:1.6mm;background:@RED@}
.inds{display:flex;flex-wrap:wrap;gap:0}
.inds span{font:500 9.5pt Poppins;color:@BLACK@;padding:2mm 4mm 2mm 0;margin-right:4mm;border-right:.6pt solid #DCDCDC}
.inds span:last-child{border-right:0}

/* page 4 */
.ob{counter-reset:o}
.ob>div{display:grid;grid-template-columns:12mm 1fr;gap:3mm;padding:3.6mm 0;border-bottom:.6pt solid #DCDCDC}
.ob>div:first-child{border-top:1.4pt solid @BLACK@}
.ob b{font:600 13pt/1 Poppins;color:@RED@}
.ob h3{margin-bottom:.8mm}
.ob p{font-size:8.8pt;line-height:1.5;color:#555}
.need{display:grid;grid-template-columns:1fr 1fr;gap:1.5mm 6mm;border-top:1.4pt solid @BLACK@;padding-top:3mm}
.need div{font-size:8.8pt;color:@BLACK@;padding-left:5mm;position:relative;line-height:1.55}
.need div:before{content:"";position:absolute;left:0;top:1.9mm;width:2.2mm;height:.9mm;background:@RED@}
.contact{position:absolute;left:0;right:0;bottom:0;height:86mm;background:@BLACK@;color:#fff;padding:12mm 18mm 0}
.contact .g{display:grid;grid-template-columns:1fr 34mm;gap:10mm;align-items:start}
.contact h2{font:600 20pt/1.15 Poppins;color:#fff;letter-spacing:-.02em}
.contact h2 span{color:@RED@}
.contact .s{font-size:9.5pt;color:#BDBDBD;margin-top:3mm}
.contact .cl{display:grid;grid-template-columns:1fr 1fr;gap:3mm 8mm;margin-top:7mm}
.contact .cl small{display:block;font:600 7pt Poppins;letter-spacing:.14em;text-transform:uppercase;color:@RED@}
.contact .cl b{font:500 10pt Poppins;color:#fff}
.contact .qr{background:#fff;padding:3mm;text-align:center;font:500 6.5pt Poppins;color:@BLACK@;letter-spacing:.06em;text-transform:uppercase}
.contact .qr img{width:100%;display:block;margin-bottom:2mm}
.contact .sig{margin-top:6mm;padding-top:4mm;border-top:.6pt solid #333;display:flex;justify-content:space-between;align-items:end}
.contact .sig b{font:600 11pt Poppins;color:#fff;display:block}
.contact .sig span{font-size:8.5pt;color:#BDBDBD}
.contact .legal{font-size:6.5pt;line-height:1.45;color:#8A8A8A;max-width:120mm;text-align:right}
'''.replace('@RED@', RED).replace('@BLACK@', BLACK)

def hdr(sec): return '<div class="hdr"><div class="logo"><i></i>ScapeMedia</div><span>%s</span></div>' % sec
def ftr(n): return '<div class="ftr"><span><b>ScapeMedia</b> &nbsp;&middot;&nbsp; Performance marketing, Jammu</span><span>scapemedia.in &nbsp;&middot;&nbsp; %02d</span></div>' % n

cover = '''<section class="pg cover"><div class="ph" style="background-image:url(%s)"></div>
<div class="in"><div class="logo"><i></i>ScapeMedia</div>
<div class="mid"><p class="eb">Capabilities &amp; client onboarding</p>
<h1>We turn ad spend into <span>business opportunities.</span></h1>
<div class="rule"></div>
<p class="sub">Meta Ads, lead generation and data-led optimisation for growing businesses in Jammu &amp; J&amp;K.</p>
<div class="kw"><div><b>01</b>Meta Ads</div><div><b>02</b>Lead generation</div><div><b>03</b>Sales</div><div><b>04</b>Data &amp; optimisation</div></div></div>
<div class="meta"><div><b>Karan Targotra</b>Founder, ScapeMedia</div><div><b>scapemedia.in</b>Jammu, Jammu &amp; Kashmir</div></div></div></section>''' % cover

p2 = '''<section class="pg">%s
<div class="sec"><div class="lab"><div class="n">01</div><h2>About ScapeMedia</h2></div>
<div><p class="lead">A performance marketing partner for businesses that measure success in leads and sales, not likes.</p>
<p class="muted" style="margin-top:4mm">ScapeMedia is a Jammu-based agency specialising in Meta advertising. We plan, run and optimise Facebook and Instagram campaigns around one question: is the spend bringing in qualified leads that turn into customers? Every decision we make is guided by data, tested in the market and reported in plain language.</p></div></div>
<div class="sec"><div class="lab"><div class="n">02</div><h2>Our approach</h2></div>
<div><p style="margin-bottom:5mm" class="muted">Advertising works when every stage is connected. We manage the full path from ad to sale.</p>
<div class="steps4">
<div><span class="k">STAGE 1</span><h3>Meta Ads</h3><p>Campaigns built around your business goal, audience and offer.</p></div>
<div><span class="k">STAGE 2</span><h3>Leads</h3><p>Lead forms and WhatsApp journeys that capture the right people.</p></div>
<div><span class="k">STAGE 3</span><h3>Follow-up</h3><p>A fast response process so no opportunity goes cold.</p></div>
<div><span class="k">STAGE 4</span><h3>Sales</h3><p>Results measured in customers, not clicks or reach.</p></div></div></div></div>
<div class="sec"><div class="lab"><div class="n">03</div><h2>Why ScapeMedia</h2></div>
<div class="three">
<div><h3>Specialist focus</h3><p>Meta advertising is our core discipline. Depth over breadth.</p></div>
<div><h3>Data-led decisions</h3><p>Every rupee is tracked, tested and optimised against cost per lead and sales.</p></div>
<div><h3>Local insight</h3><p>Based in Jammu, with a clear understanding of how customers in the region search, compare and buy.</p></div></div></div>
%s</section>''' % (hdr('Who we are'), ftr(2))

p3 = '''<section class="pg">%s
<div class="sec" style="border-top:0"><div class="lab"><div class="n">04</div><h2>Services</h2></div>
<div class="svc">
<div><span class="k">01</span><h3>Meta Ads management</h3><p>Strategy, setup and daily management of Facebook and Instagram campaigns.</p><ul><li>Campaign structure &amp; audiences</li><li>Budget planning &amp; pacing</li><li>Ongoing optimisation</li></ul></div>
<div><span class="k">02</span><h3>Lead generation</h3><p>Funnels that attract and capture qualified prospects for your sales team.</p><ul><li>Instant forms &amp; WhatsApp journeys</li><li>Lead qualification questions</li><li>Lead routing to your team</li></ul></div>
<div><span class="k">03</span><h3>Creative strategy</h3><p>Ad concepts built on what your customers care about, tested to find winners.</p><ul><li>Reels, Stories &amp; Feed creatives</li><li>Hook and offer testing</li><li>Ad copy</li></ul></div>
<div><span class="k">04</span><h3>Tracking &amp; reporting</h3><p>Clear measurement so every decision is based on real performance.</p><ul><li>Pixel &amp; conversion tracking</li><li>Cost per lead monitoring</li><li>Plain-language monthly reports</li></ul></div></div></div>
<div class="sec"><div class="lab"><div class="n">05</div><h2>Industries</h2></div>
<div><p class="muted" style="margin-bottom:3mm">Campaigns tailored to how each industry sells.</p>
<div class="inds"><span>Automotive</span><span>Real estate</span><span>Education</span><span>Healthcare</span><span>Hospitality</span><span>Retail</span></div></div></div>
<div class="sec"><div class="lab"><div class="n">06</div><h2>How we work</h2></div>
<div class="steps4">
<div><span class="k">STEP 1</span><h3>Strategy</h3><p>Market research, audience and offer definition, campaign plan.</p></div>
<div><span class="k">STEP 2</span><h3>Creative</h3><p>Ad concepts, creatives and copy built for the plan.</p></div>
<div><span class="k">STEP 3</span><h3>Launch</h3><p>Tracking set up, campaigns live and closely monitored.</p></div>
<div><span class="k">STEP 4</span><h3>Optimise</h3><p>Test, refine and scale what performs. Report every month.</p></div></div></div>
%s</section>''' % (hdr('What we do'), ftr(3))

p4 = '''<section class="pg">%s
<div class="sec" style="border-top:0"><div class="lab"><div class="n">07</div><h2>Getting started</h2></div>
<div class="ob">
<div><b>1</b><div><h3>Discovery call</h3><p>A short conversation about your business, goals and current marketing.</p></div></div>
<div><b>2</b><div><h3>Growth audit</h3><p>We review your ad account, audience and funnel, and identify opportunities.</p></div></div>
<div><b>3</b><div><h3>Strategy &amp; scope</h3><p>A written plan with objectives, scope and timeline, agreed before any spend.</p></div></div>
<div><b>4</b><div><h3>Launch</h3><p>Access set up, tracking verified and the first campaigns go live.</p></div></div></div></div>
<div class="sec"><div class="lab"><div class="n">08</div><h2>What we need</h2></div>
<div class="need"><div>Your business goals and key offers</div><div>Access to your Facebook Page &amp; Instagram</div><div>Access to your Meta ad account</div><div>A WhatsApp number for leads</div><div>Product photos and videos</div><div>Your monthly advertising budget</div></div></div>
<div class="contact"><div class="g"><div>
<h2>Let's grow <span>your business.</span></h2>
<p class="s">Book a free growth audit for your business.</p>
<div class="cl"><div><small>WhatsApp</small><b>+91 96825 14271</b></div><div><small>Email</small><b>karan@scapemedia.in</b></div><div><small>Website</small><b>scapemedia.in</b></div><div><small>Instagram</small><b>@karantargotra.a</b></div></div></div>
<div class="qr"><img src="%s" alt="">Scan to WhatsApp</div></div>
<div class="sig"><div><b>Karan Targotra</b><span>Founder, ScapeMedia &middot; Jammu, J&amp;K</span></div>
<div class="legal">Meta, Facebook and Instagram are trademarks of Meta Platforms, Inc. ScapeMedia is an independent agency and is not affiliated with Meta. Results depend on offer, budget, market and follow-up; no results are guaranteed.</div></div></div>
</section>''' % (hdr('Working together'), qrdata)

html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ScapeMedia | Capabilities &amp; Client Onboarding</title><style>%s</style></head><body>%s</body></html>' % (css, cover + p2 + p3 + p4)
open(OUT + 'ScapeMedia_Capabilities.html', 'w').write(html)
print('ok', len(html))
