import json,base64,html
W='/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/scratchpad/pdfwork/'
b=lambda p:base64.b64encode(open(p,'rb').read()).decode()
wt={'Regular':400,'Medium':500,'SemiBold':600,'Bold':700}
css=''.join("@font-face{font-family:P;font-weight:%d;src:url(data:font/woff2;base64,%s)}"%(w,b(W+'node_modules/@fontsource/poppins/files/poppins-latin-%d-normal.woff2'%w)) for w in wt.values())
img={'Photo':'data:image/jpeg;base64,'+b(W+'fig_photo.jpg'),'QR':'data:image/png;base64,'+b(W+'fig_qr.png')}
css+="@page{size:595pt 842pt;margin:0}*{margin:0;padding:0;box-sizing:border-box}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.pg{width:595pt;height:842pt;position:relative;overflow:hidden;page-break-after:always}.n{position:absolute}.t{position:absolute;font-family:P}"
out=[]
for pg in json.load(open(W+'scene.json')):
    s=['<section class="pg" style="background:%s">'%pg['bg']]
    for n in pg['ns']:
        st='left:%spt;top:%spt;width:%spt;height:%spt;'%(n['x'],n['y'],n['w'],n['h'])
        if n['t'] in 'RE':
            bg=''
            if n.get('f')=='IMG': bg='background:url(%s) center/cover;'%img[n['nm']]
            elif n.get('f'): bg='background:%s;'%n['f']
            if n.get('s'): bg+='border:%spt solid %s;'%(n['sw'],n['s'])
            r='50%' if n['t']=='E' else '%spt'%n.get('r',0)
            s.append('<div class="n" style="%s%sborder-radius:%s"></div>'%(st,bg,r))
        else:
            lh='%s%%'%n['lh'] if n['lh'] else '1.5'
            al={'L':'left','C':'center','R':'right'}[n['al']]
            ws='nowrap' if n['ar']=='W' else 'normal'
            if n['ar']=='W': st='left:%spt;top:%spt;'%(n['x'],n['y'])
            else: st='left:%spt;top:%spt;width:%spt;'%(n['x'],n['y'],n['w'])
            txt=''.join('<span style="color:%s">%s</span>'%(c,html.escape(t)) for t,c in n['seg'])
            s.append('<div class="t" style="%sfont-size:%spt;font-weight:%d;line-height:%s;letter-spacing:%sem;text-align:%s;white-space:%s">%s</div>'%(st,n['fs'],wt[n['st']],lh,n['ls']/100,al,ws,txt))
    s.append('</section>');out.append(''.join(s))
open('/home/user/marketing.in/onboarding/ScapeMedia_Onboarding_Figma.html','w').write('<!doctype html><html><head><meta charset="utf-8"><title>ScapeMedia | Client Onboarding</title><style>%s</style></head><body>%s</body></html>'%(css,''.join(out)))
