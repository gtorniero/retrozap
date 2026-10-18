# Gera a imagem de prévia do link (WhatsApp, Instagram...) e os ícones com a fonte do site e o troféu 🏆
import asyncio, os, sys
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(D, os.environ.get('RZ_OUT', 'retrozap-site'), 'public')
import base64
def b64(f): return 'data:font/woff2;base64,' + base64.b64encode(open(f, 'rb').read()).decode()
A = os.path.join(PUB, 'assets'); EMO = os.path.join(D, 'fontes/node_modules/@fontsource/noto-color-emoji/files/noto-color-emoji-4-400-normal.woff2')
TROFEU = 'data:image/svg+xml;base64,' + base64.b64encode(open(os.path.join(D, 'build/trofeu.svg'), 'rb').read()).decode()
FONTES = f"""@font-face{{font-family:'Bricolage Grotesque';src:url({b64(A+'/bricolage.woff2')}) format('woff2');font-weight:200 800}}
@font-face{{font-family:'DM Sans';src:url({b64(A+'/dmsans-500.woff2')}) format('woff2');font-weight:500}}
@font-face{{font-family:'DM Sans';src:url({b64(A+'/dmsans-700.woff2')}) format('woff2');font-weight:700}}
@font-face{{font-family:'Emoji';src:url({b64(EMO)}) format('woff2')}}
*{{margin:0;box-sizing:border-box}}body{{background:#1A0B2E}}"""
CONFETE = ''.join(f'<i style="left:{(i*197)%1200}px;top:{(i*131)%630}px;background:{["#FFC23C","#FF4F8B","#FF7A59","#2EC4F1","#A98BFF"][i%5]};transform:rotate({(i*37)%180}deg)"></i>' for i in range(46))
OG = f"""<html><head><style>{FONTES}
.og{{width:1200px;height:630px;position:relative;overflow:hidden;background:radial-gradient(circle at 78% 30%,rgba(255,194,60,.28),transparent 45%),#1A0B2E;font-family:'DM Sans';color:#FFF4E0}}
.og i{{position:absolute;width:16px;height:6px;border-radius:2px;opacity:.55}}
.txt{{position:absolute;left:84px;top:110px;width:720px}}
.logo{{font-family:'Bricolage Grotesque';font-weight:800;font-size:132px;letter-spacing:-.03em;color:#FFC23C;line-height:1}}
h1{{font-family:'Bricolage Grotesque';font-weight:800;font-size:58px;line-height:1.08;margin-top:34px;letter-spacing:-.01em}}
h1 em{{font-style:normal;color:#FFC23C}}
p{{font-weight:700;font-size:27px;color:#B9A8CC;margin-top:30px}}
.trofeu{{position:absolute;right:60px;top:110px;width:380px;transform:rotate(12deg)}}
</style></head><body><div class="og">{CONFETE}<div class="txt"><div class="logo">retrozap</div>
<h1>Todo grupo tem uma história.<br><em>Descubra a do seu.</em></h1><p>A retrospectiva oficial dos grupos de WhatsApp</p></div>
<img class="trofeu" src="{TROFEU}"></div></body></html>"""
def ICONE(t): return f"""<html><head><style>{FONTES}.ic{{width:{t}px;height:{t}px;background:radial-gradient(circle at 50% 30%,rgba(255,194,60,.35),transparent 60%),#1A0B2E;display:flex;align-items:center;justify-content:center;font-family:'Emoji';font-size:{int(t*.68)}px;line-height:1}}</style></head><body><div class="ic"><img src="{TROFEU}" style="width:72%"></div></body></html>"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width':1200,'height':630})
        await pg.set_content(OG); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(PUB, 'og-retrozap.png'), clip={'x':0,'y':0,'width':1200,'height':630})
        for t in (192, 512, 180, 64):
            pg2 = await b.new_page(viewport={'width':t,'height':t})
            await pg2.set_content(ICONE(t)); await pg2.evaluate('document.fonts.ready'); await pg2.wait_for_timeout(400)
            nome = {192:'icon-192.png', 512:'icon-512.png', 180:'apple-touch-icon.png', 64:'favicon.png'}[t]
            await pg2.screenshot(path=os.path.join(PUB, nome), clip={'x':0,'y':0,'width':t,'height':t})
        await b.close()
asyncio.run(main())
for f in ('og-image.png', 'icon.svg'):
    try: os.remove(os.path.join(PUB, f))
    except FileNotFoundError: pass
print('og e ícones ok')
