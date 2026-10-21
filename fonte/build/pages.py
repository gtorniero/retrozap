import os, json
from PIL import Image, ImageDraw, ImageFont

SCR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SCR, os.environ.get('RZ_OUT', 'retrozap-site')); PUB = os.path.join(OUT, 'public')
SITE = 'https://retrozap.com.br'
import datetime; HOJE = datetime.date.today().isoformat()

CSS = """@font-face{font-family:'Bricolage Grotesque';src:url(/assets/bricolage.woff2) format('woff2');font-weight:200 800;font-display:swap}
@font-face{font-family:'DM Sans';src:url(/assets/dmsans-400.woff2) format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'DM Sans';src:url(/assets/dmsans-700.woff2) format('woff2');font-weight:700;font-display:swap}
:root{--noite:#1A0B2E;--acai:#3D1A5C;--manga:#FFC23C;--areia:#FFF4E0;--neblina:#B9A8CC;--linha:#4E2E6E;color-scheme:dark}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--noite);color:var(--areia);font-family:'DM Sans',system-ui,sans-serif;font-size:17px;line-height:1.7;padding:0 max(16px,env(safe-area-inset-right,0px)) 48px max(16px,env(safe-area-inset-left,0px))}
main,header,footer{max-width:680px;margin:0 auto}
header{padding:18px 0;display:flex;justify-content:space-between;align-items:center}
.logo{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:26px;color:var(--manga);text-decoration:none}
.cta{background:var(--manga);color:var(--noite);border-radius:999px;padding:10px 18px;font-weight:700;text-decoration:none;font-size:15px}
h1,h2{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;line-height:1.1;text-wrap:balance}
h1{font-size:clamp(32px,8vw,46px);margin:16px 0}h2{font-size:24px;margin:32px 0 8px}
a{color:var(--manga)}p,li{color:var(--areia)}.small{color:var(--neblina);font-size:14px}
.cards{display:grid;gap:12px}.card{background:var(--acai);border-radius:16px;padding:16px 18px;text-decoration:none;color:var(--areia);display:block}
.card b{font-family:'Bricolage Grotesque',sans-serif;font-size:20px;display:block;margin-bottom:4px}
footer{display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center;font-size:13px;color:var(--neblina);padding-top:24px;margin-top:40px;border-top:1px solid var(--linha)}
footer a{color:var(--areia)}
footer a.seguro{font-weight:700;color:var(--manga);flex-basis:100%;text-align:center}
.marca{display:flex;flex-direction:column;align-items:center;gap:8px;flex-basis:100%;margin-top:16px;padding-top:16px;border-top:1px solid var(--linha)}
.marca p{margin:0;color:var(--neblina);text-align:center;font-size:12px}
.btw{width:180px;height:auto;display:block;opacity:.75}
.btw-t,.btw-n{fill:#fff}.btw-l{stroke:#fff}"""

import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import conteudo
COBRANCA_PUBLICA = conteudo.COBRANCA_PUBLICA
CSS += conteudo.CSS_EXTRA

def page(path, title, desc, body, ad=True):
    url = SITE + '/' + path.replace('index.html', '').replace('.html', '')
    slot = getattr(conteudo, 'AD_SLOT_PAGINAS', '')
    adhtml = f'<div class="anuncio"><p class="small" style="margin:0">Publicidade</p><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4039247360984618" data-ad-slot="{slot}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(window.adsbygoogle=window.adsbygoogle||[]).push({{}});</script></div>' if (ad and slot) else ''
    html = f"""<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<!-- Consentimento (LGPD) + Google tag (gtag.js) -->
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}
(function(){{var ok=null;try{{ok=localStorage.getItem('rz_cookies');}}catch(e){{}}var ad=ok==='sim'?'granted':'denied';
gtag('consent','default',{{ad_storage:ad,ad_user_data:ad,ad_personalization:ad,analytics_storage:ok==='nao'?'denied':'granted'}});
if(ad==='denied'){{(window.adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=1;}}}})();</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-R8R1EN0KQN"></script>
<script>
  gtag('js', new Date());
  gtag('config', 'G-R8R1EN0KQN', {{anonymize_ip: true}});
</script>
<title>{title} · Retrozap</title><meta name="description" content="{desc}">
<link rel="canonical" href="{url}"><meta name="theme-color" content="#1A0B2E">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:image" content="{SITE}/og-retrozap.png">
<link rel="icon" href="/favicon.png" type="image/png">
<meta name="google-adsense-account" content="ca-pub-4039247360984618">
<!-- AdSense: não carrega para quem tem o Premium -->
<script>(function(){{var p=null;try{{p=localStorage.getItem('rz_acesso')}}catch(e){{}}if(p){{document.documentElement.classList.add('premium');return}}var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4039247360984618';document.head.appendChild(s)}})();</script>
<style>.premium ins.adsbygoogle,.premium .anuncio,.premium .google-auto-placed,.premium .adsbygoogle-noablate{{display:none!important}}</style>
<style>{CSS}</style></head><body>
<header><a class="logo" href="/">retrozap 🏆</a><a class="cta" href="/">Fazer o meu grupo</a></header>
<main>{body.replace('<!--AD-->', adhtml)}</main>
<footer><a href="/privacidade" class="seguro">🔒 É seguro?</a><a href="/">Início</a><a href="/como-funciona">Como funciona</a><a href="/perguntas-frequentes">Perguntas frequentes</a><a href="/blog/">Blog</a><a href="/ideias">Envie sua ideia</a><a href="/sobre">Sobre</a><a href="/privacidade">Privacidade</a><a href="/termos">Termos de uso</a><a href="/contato">Contato</a><div class="marca"><p>© 2026 Retrozap. Retrozap é uma marca da Beyond the Work Ideas.</p><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1486.5 97" class="btw" role="img" aria-label="Um projeto Beyond the Work" focusable="false"><path d="M30.4 67H30.1Q29.5 68.3 28.7 69.6Q27.8 70.8 26.5 71.8Q25.3 72.7 23.5 73.3Q21.8 73.9 19.5 73.9Q13.7 73.9 10.2 70.2Q6.6 66.4 6.6 59.7V35.8H12.4V58.7Q12.4 63.8 14.6 66.3Q16.8 68.8 21.2 68.8Q22.9 68.8 24.6 68.3Q26.2 67.9 27.5 67Q28.8 66.2 29.6 64.8Q30.4 63.5 30.4 61.6V35.8H36.1V73H30.4ZM47.1 73V35.8H52.4V40.2H52.7Q53.6 38 55.2 36.5Q56.7 35 59.8 35Q63.1 35 64.7 36.6Q66.2 38.2 66.6 40.8H66.8Q67.8 38.3 69.7 36.6Q71.6 35 74.9 35Q79.4 35 81 38.2Q82.5 41.3 82.5 47.2V73H77.2V48.2Q77.2 43.4 76.2 41.6Q75.2 39.7 72.6 39.7Q70.3 39.7 68.9 41.2Q67.5 42.7 67.5 45.7V73H62.1V48.2Q62.1 43.4 61.2 41.6Q60.2 39.7 57.7 39.7Q55.4 39.7 53.9 41.2Q52.4 42.7 52.4 45.7V73ZM136.4 35.8H142.2V41.9H142.5Q146.1 35 153.9 35Q160.8 35 164.6 40.1Q168.5 45.2 168.5 54.4Q168.5 63.6 164.6 68.8Q160.8 73.9 153.9 73.9Q146.1 73.9 142.5 67H142.2V87.4H136.4ZM151.7 68.8Q156.7 68.8 159.5 65.7Q162.3 62.6 162.3 57.6V51.3Q162.3 46.2 159.5 43.2Q156.7 40.1 151.7 40.1Q149.8 40.1 148 40.6Q146.3 41.1 145 42.1Q143.7 43 143 44.5Q142.2 45.9 142.2 47.7V61.1Q142.2 63 143 64.4Q143.7 65.8 145 66.8Q146.3 67.7 148 68.2Q149.8 68.8 151.7 68.8ZM178.3 68.1H189.2V40.7H178.3V35.8H195V45.2H195.3Q196.5 40.8 199.7 38.3Q202.9 35.8 207.9 35.8H213V41.6H206.1Q201.1 41.6 198 44.5Q195 47.4 195 52V68.1H209.4V73H178.3ZM237.6 73.9Q233.7 73.9 230.6 72.5Q227.4 71.1 225.3 68.6Q223.1 66 221.9 62.5Q220.8 58.9 220.8 54.4Q220.8 50 221.9 46.4Q223.1 42.8 225.3 40.3Q227.4 37.7 230.6 36.4Q233.7 35 237.6 35Q241.5 35 244.6 36.4Q247.8 37.7 249.9 40.3Q252.1 42.8 253.3 46.4Q254.4 50 254.4 54.4Q254.4 58.9 253.3 62.5Q252.1 66 249.9 68.6Q247.8 71.1 244.6 72.5Q241.5 73.9 237.6 73.9ZM237.6 68.9Q242.4 68.9 245.4 66Q248.3 63.1 248.3 57.1V51.8Q248.3 45.7 245.4 42.8Q242.4 40 237.6 40Q232.8 40 229.8 42.8Q226.9 45.7 226.9 51.8V57.1Q226.9 63.1 229.8 66Q232.8 68.9 237.6 68.9ZM266.5 82.5H284.5V40.7H265.9V35.8H290.3V78.9Q290.3 82.6 288.3 85Q286.3 87.4 282.1 87.4H266.5ZM287.4 27.6Q284.9 27.6 283.9 26.6Q282.9 25.6 282.9 24V22.8Q282.9 21.2 283.9 20.2Q284.9 19.1 287.4 19.1Q289.9 19.1 291 20.2Q292 21.2 292 22.8V24Q292 25.6 291 26.6Q289.9 27.6 287.4 27.6ZM324.6 73.9Q320.6 73.9 317.4 72.5Q314.2 71.1 311.9 68.6Q309.7 66 308.4 62.5Q307.2 58.9 307.2 54.5Q307.2 50 308.5 46.4Q309.7 42.8 312 40.3Q314.2 37.7 317.3 36.4Q320.5 35 324.3 35Q328 35 331.1 36.4Q334.2 37.7 336.3 40.1Q338.5 42.5 339.6 45.9Q340.8 49.2 340.8 53.1V55.9H313.3V57.6Q313.3 60 314.1 62.1Q314.9 64.2 316.3 65.7Q317.8 67.2 319.9 68.1Q322.1 68.9 324.6 68.9Q328.4 68.9 331.1 67.2Q333.9 65.4 335.3 62.4L339.6 65.3Q337.9 69 334 71.5Q330.2 73.9 324.6 73.9ZM324.3 39.7Q321.9 39.7 319.9 40.6Q317.9 41.5 316.4 43Q314.9 44.5 314.1 46.5Q313.3 48.6 313.3 51V51.5H334.6V50.8Q334.6 48.3 333.8 46.3Q333.1 44.3 331.7 42.8Q330.4 41.3 328.5 40.5Q326.6 39.7 324.3 39.7ZM369 73Q364.8 73 362.8 70.6Q360.8 68.2 360.8 64.5V40.7H348.4V35.8H357.6Q359.5 35.8 360.3 35.1Q361 34.3 361 32.5V22.7H366.6V35.8H383.5V40.7H366.6V68.1H383.5V73ZM410.4 73.9Q406.5 73.9 403.4 72.5Q400.2 71.1 398.1 68.6Q395.9 66 394.7 62.5Q393.6 58.9 393.6 54.4Q393.6 50 394.7 46.4Q395.9 42.8 398.1 40.3Q400.2 37.7 403.4 36.4Q406.5 35 410.4 35Q414.3 35 417.4 36.4Q420.6 37.7 422.7 40.3Q424.9 42.8 426.1 46.4Q427.2 50 427.2 54.4Q427.2 58.9 426.1 62.5Q424.9 66 422.7 68.6Q420.6 71.1 417.4 72.5Q414.3 73.9 410.4 73.9ZM410.4 68.9Q415.2 68.9 418.2 66Q421.1 63.1 421.1 57.1V51.8Q421.1 45.7 418.2 42.8Q415.2 40 410.4 40Q405.6 40 402.6 42.8Q399.7 45.7 399.7 51.8V57.1Q399.7 63.1 402.6 66Q405.6 68.9 410.4 68.9Z" class="btw-t"></path><line x1="525.7" y1="4.9" x2="603.5" y2="4.9" class="btw-l" stroke-width="9.7" stroke-linecap="round"></line><line x1="503.8" y1="36.5" x2="603.5" y2="36.5" class="btw-l" stroke-width="9.7" stroke-linecap="round"></line><line x1="481.9" y1="68.1" x2="603.5" y2="68.1" class="btw-l" stroke-width="9.7" stroke-linecap="round"></line><path d="M684.3 73.5V62.1H702.6Q707.6 62.1 710.2 59.3Q712.8 56.6 712.8 51.8Q712.8 47 710.2 44.4Q707.6 41.7 702.6 41.7H684.3V33H701.6Q708.9 33 714.6 34.8Q720.4 36.5 723.6 40.6Q726.9 44.7 726.9 51.6V53Q726.9 59.5 724 64Q721.2 68.6 715.5 71Q709.9 73.5 701.6 73.5ZM672.4 73.5V-0.5H686.3V73.5ZM684.3 39.4V30.7H699.9Q705 30.7 707.4 28Q709.8 25.3 709.8 20.8Q709.8 16.3 707.4 13.6Q705 10.9 699.9 10.9H684.3V-0.5H698.6Q711 -0.5 717.4 4.7Q723.9 9.9 723.9 19.6V21Q723.9 27.8 720.6 31.8Q717.4 35.9 711.7 37.6Q706 39.4 698.6 39.4ZM760.2 74.9Q753.2 74.9 748 72.5Q742.7 70.1 739.3 66Q735.8 62 734.1 57Q732.3 52 732.3 46.8V44.9Q732.3 39.5 734.1 34.5Q735.8 29.4 739.3 25.4Q742.7 21.5 747.8 19.1Q752.9 16.8 759.6 16.8Q768.4 16.8 774.4 20.6Q780.3 24.5 783.3 30.8Q786.3 37 786.3 44.2V49.2H738.2V40.7H777.6L773.3 44.9Q773.3 39.7 771.8 36Q770.3 32.3 767.3 30.3Q764.2 28.3 759.6 28.3Q755 28.3 751.8 30.4Q748.6 32.5 747 36.5Q745.3 40.4 745.3 45.9Q745.3 51 746.9 55Q748.5 58.9 751.8 61.1Q755.1 63.4 760.2 63.4Q765.3 63.4 768.5 61.3Q771.7 59.3 772.6 56.3H785.4Q784.2 61.9 780.8 66.1Q777.4 70.3 772.2 72.6Q766.9 74.9 760.2 74.9ZM792.1 94.4V82.5H802.3Q805.2 82.5 807.1 81.8Q809.1 81 810.4 79.3Q811.7 77.7 812.4 74.8L827 18.7H840.3L824.2 77.8Q822.6 83.9 819.7 87.6Q816.8 91.2 812.2 92.8Q807.7 94.4 801 94.4ZM809 71.8V60.8H820.6V71.8ZM804.3 71.8 786.7 18.7H800.7L817.4 71.8ZM871 74.9Q863.8 74.9 858.3 72.6Q852.8 70.3 849 66.3Q845.2 62.4 843.3 57.4Q841.3 52.4 841.3 47V44.9Q841.3 39.3 843.4 34.2Q845.4 29.2 849.3 25.2Q853.1 21.3 858.6 19Q864.1 16.8 871 16.8Q877.9 16.8 883.4 19Q888.9 21.3 892.8 25.2Q896.6 29.2 898.6 34.2Q900.6 39.3 900.6 44.9V47Q900.6 52.4 898.7 57.4Q896.7 62.4 892.9 66.3Q889.1 70.3 883.6 72.6Q878.1 74.9 871 74.9ZM871 63Q876.1 63 879.6 60.8Q883.1 58.5 884.9 54.6Q886.7 50.8 886.7 45.9Q886.7 40.9 884.9 37Q883 33.2 879.5 30.9Q875.9 28.7 871 28.7Q866.1 28.7 862.6 30.9Q859 33.2 857.1 37Q855.2 40.9 855.2 45.9Q855.2 50.8 857.1 54.6Q858.9 58.5 862.4 60.8Q865.9 63 871 63ZM909.1 73V18.7H920.1V42H919.1Q919.1 33.7 921.3 28.1Q923.5 22.6 927.8 19.8Q932.2 17 938.7 17H939.3Q949 17 954 23.2Q959 29.5 959 41.9V73H945.1V40.7Q945.1 35.7 942.2 32.6Q939.4 29.5 934.4 29.5Q929.3 29.5 926.1 32.6Q923 35.8 923 41.1V73ZM992.6 74.8Q986.9 74.8 982.1 72.7Q977.3 70.6 973.8 66.8Q970.3 63 968.4 58Q966.5 52.9 966.5 47V44.9Q966.5 39.1 968.4 34Q970.2 28.9 973.6 25.1Q976.9 21.3 981.7 19.1Q986.4 17 992.2 17Q998.6 17 1003.5 19.8Q1008.3 22.5 1011.2 28Q1014.1 33.5 1014.4 41.8L1010.3 37V0H1024.2V73H1013.2V49.9H1015.6Q1015.3 58.2 1012.2 63.8Q1009.1 69.3 1004.1 72Q999 74.8 992.6 74.8ZM995.7 63.1Q999.8 63.1 1003.2 61.2Q1006.6 59.4 1008.7 55.8Q1010.7 52.3 1010.7 47.5V43.5Q1010.7 38.7 1008.6 35.4Q1006.5 32.2 1003.1 30.4Q999.7 28.7 995.7 28.7Q991.2 28.7 987.8 30.8Q984.3 33 982.4 36.9Q980.4 40.8 980.4 46Q980.4 51.2 982.4 55Q984.4 58.9 987.9 61Q991.3 63.1 995.7 63.1ZM1077.8 73.7Q1070.2 73.7 1065.4 71.8Q1060.5 69.8 1058.2 65.2Q1055.8 60.5 1055.8 52.6L1055.8 3.4H1068.8L1068.8 53.5Q1068.8 57.5 1070.9 59.6Q1073 61.8 1077 61.8H1085.5V73.7ZM1047.2 28.9V18.7H1085.5V28.9ZM1093.5 73V0H1107.4V42.6H1105Q1105 34.4 1107.1 28.7Q1109.2 23 1113.3 20Q1117.5 17 1123.9 17H1124.5Q1133.8 17 1138.6 23.4Q1143.4 29.8 1143.4 42V73H1129.5V40.7Q1129.5 35.5 1126.5 32.5Q1123.6 29.5 1118.8 29.5Q1113.7 29.5 1110.5 32.8Q1107.4 36.2 1107.4 41.6V73ZM1178.8 74.9Q1171.8 74.9 1166.6 72.5Q1161.3 70.1 1157.9 66Q1154.4 62 1152.7 57Q1150.9 52 1150.9 46.8V44.9Q1150.9 39.5 1152.7 34.5Q1154.4 29.4 1157.9 25.4Q1161.3 21.5 1166.4 19.1Q1171.5 16.8 1178.2 16.8Q1187 16.8 1193 20.6Q1198.9 24.5 1201.9 30.8Q1204.9 37 1204.9 44.2V49.2H1156.8V40.7H1196.2L1191.9 44.9Q1191.9 39.7 1190.4 36Q1188.9 32.3 1185.9 30.3Q1182.8 28.3 1178.2 28.3Q1173.6 28.3 1170.4 30.4Q1167.2 32.5 1165.6 36.5Q1163.9 40.4 1163.9 45.9Q1163.9 51 1165.5 55Q1167.1 58.9 1170.4 61.1Q1173.7 63.4 1178.8 63.4Q1183.9 63.4 1187.1 61.3Q1190.3 59.3 1191.2 56.3H1204Q1202.8 61.9 1199.4 66.1Q1196 70.3 1190.8 72.6Q1185.5 74.9 1178.8 74.9ZM1243.8 73 1225.2 0H1239.8L1255 63.5L1251 61.2H1261L1256.7 63.5L1268.5 2.8H1280.8L1266 73ZM1287.3 73 1271.2 2.8H1284L1297.7 63.5L1293.3 61.2H1303.2L1299.3 63.5L1312.7 0H1326.5L1310 73ZM1356.7 74.9Q1349.5 74.9 1344 72.6Q1338.5 70.3 1334.7 66.3Q1330.9 62.4 1328.9 57.4Q1327 52.4 1327 47V44.9Q1327 39.3 1329 34.2Q1331.1 29.2 1334.9 25.2Q1338.8 21.3 1344.3 19Q1349.8 16.8 1356.7 16.8Q1363.6 16.8 1369.1 19Q1374.6 21.3 1378.4 25.2Q1382.3 29.2 1384.3 34.2Q1386.3 39.3 1386.3 44.9V47Q1386.3 52.4 1384.3 57.4Q1382.4 62.4 1378.6 66.3Q1374.8 70.3 1369.3 72.6Q1363.8 74.9 1356.7 74.9ZM1356.7 63Q1361.8 63 1365.3 60.8Q1368.8 58.5 1370.6 54.6Q1372.4 50.8 1372.4 45.9Q1372.4 40.9 1370.5 37Q1368.7 33.2 1365.1 30.9Q1361.6 28.7 1356.7 28.7Q1351.8 28.7 1348.2 30.9Q1344.7 33.2 1342.8 37Q1340.9 40.9 1340.9 45.9Q1340.9 50.8 1342.8 54.6Q1344.6 58.5 1348.1 60.8Q1351.6 63 1356.7 63ZM1394.8 73V18.7H1405.8V41.7H1405.4Q1405.4 30 1410.4 24Q1415.4 18 1425.1 18H1427.1V30.1H1423.3Q1416.3 30.1 1412.5 33.8Q1408.6 37.6 1408.6 44.7V73ZM1470.7 73 1452.5 47.6H1444.4L1467.5 18.7H1482L1460.7 45.4L1461 38.4L1486.4 73ZM1432.7 73V0H1446.6V73Z" class="btw-n"></path></svg></div></footer>
</body></html>
"""
    full = os.path.join(PUB, path); os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w', encoding='utf-8').write(html)
    return url

urls = [SITE + '/']

urls.append(page('privacidade.html', 'Política de Privacidade', 'Como o Retrozap trata seus dados: as mensagens do seu grupo nunca saem do seu aparelho. Cookies, anúncios e seus direitos pela LGPD.', """
<h1>Política de Privacidade</h1>
<p class="small">Última atualização: 19 de outubro de 2026</p>
<div class="resumo-priv">
<h2 style="margin-top:0">Resumo em 30 segundos</h2>
<ul>
<li><b>🔒 Suas mensagens ficam no seu aparelho.</b> O arquivo do WhatsApp é lido pelo seu navegador. Nenhuma mensagem, nome ou telefone é enviado para nós.</li>
<li><b>📊 Só números, e só se você quiser.</b> Para comparar seu grupo (ou casal) com outros, enviamos números anônimos do grupo inteiro (como o total de mensagens). Dá para desmarcar.</li>
<li><b>🍪 Cookies de visitas e anúncios.</b> Usamos o Google Analytics para contar visitas e o Google AdSense para exibir anúncios. Anúncios personalizados só aparecem se você tocar em "Aceitar" no aviso de cookies.</li>
<li><b>✉️ Só guardamos o que você manda de propósito:</b> sugestões da página "Envie sua ideia", e-mails para o contato e, se você comprar o acesso ilimitado, o e-mail da compra.</li>
<li><b>💳 Pagamento pelo Mercado Pago.</b> O primeiro grupo é grátis; o acesso ilimitado custa R$ 4,99 no Pix, processado pelo Mercado Pago. Não recebemos dados do seu banco.</li>
<li><b>⚖️ Você tem direitos pela LGPD</b> e pode falar com a gente em <a href="mailto:contato@retrozap.com.br">contato@retrozap.com.br</a>.</li>
</ul>
</div>
<h2>1. Quem somos</h2>
<p>O Retrozap (retrozap.com.br) é um projeto independente de entretenimento, criado em São Paulo, sem relação com o WhatsApp ou a Meta. Somos o controlador dos poucos dados descritos aqui. Contato e encarregado de dados: <a href="mailto:contato@retrozap.com.br">contato@retrozap.com.br</a>.</p>
<h2>2. Suas mensagens não saem do seu aparelho</h2>
<p>Quando você escolhe o arquivo exportado do WhatsApp, a leitura e a análise acontecem inteiramente no seu navegador, como uma calculadora que roda no celular ou no computador. O arquivo, as mensagens, os nomes e os telefones <b>não são enviados aos nossos servidores, não são lidos por pessoas e não são guardados por nós</b>. Ao fechar a página, tudo é descartado. Os cards e o vídeo com os resultados também são gerados no seu aparelho; eles só são compartilhados se você decidir mandar. Vale o mesmo para o modo Casal: a conversa de vocês dois nunca sai do aparelho.</p>
<p>Os anúncios e as ferramentas de medição nunca têm acesso ao conteúdo do seu grupo.</p>
<h2>3. Comparação com outros grupos e casais (opcional, só números)</h2>
<p>Se a opção "Comparar meu grupo com outros grupos" estiver marcada na tela da turma, o site envia apenas números anônimos sobre o grupo inteiro: o tipo de grupo, o total de mensagens, a média por dia, o recorde de mensagens em um dia, a quantidade de áudios e de figurinhas, o número de integrantes, o número de dias da conversa e proporções (como a porcentagem de mensagens com risada ou de madrugada, e quantos "bom dia", parabéns, palavrões ou mensagens apagadas aparecem a cada mil mensagens; no modo Casal, também quantos "te amo" e corações aparecem, em proporção). Casais são comparados só com casais. Também vão os totais desde o início (mensagens e áudios). Junto vai um código gerado a partir da data e hora da primeira mensagem, para o mesmo grupo não ser contado duas vezes; ele não contém texto nem nome. A opção vem marcada. Nenhuma mensagem, nome, telefone ou conteúdo é enviado, e não é possível identificar o grupo ou as pessoas a partir desses números. Eles servem só para mostrar frases como "Top 5% mais risonhos entre os grupos de amigos". O grupo de exemplo nunca é enviado. Você pode desmarcar a opção antes de começar.</p>
<h2>4. Sugestões e contato</h2>
<p>Se você usar a página <a href="/ideias">Envie sua ideia</a>, guardamos o texto da sugestão, o tipo e, se você preencher, o e-mail ou WhatsApp para resposta. Usamos esses dados só para avaliar a ideia e responder. Se você pedir para receber as novidades no final da retrospectiva, guardamos o e-mail informado para enviar novidades e lançamentos do Retrozap e, eventualmente, ofertas de parceiros. Não vendemos nem repassamos o seu e-mail a ninguém, e é só pedir para sair a qualquer momento. Se você escrever para o nosso e-mail, guardamos a conversa para responder. Por favor, não envie mensagens do seu grupo nem dados de outras pessoas.</p>
<h3>Pagamento do acesso ilimitado</h3>
<p>A primeira retrospectiva é grátis. Para fazer outras, o acesso ilimitado custa R$ 4,99, pago uma única vez por Pix. O pagamento é processado pelo Mercado Pago, que trata os dados da transação conforme a <a href="https://www.mercadopago.com.br/privacidade" rel="noopener">política de privacidade do Mercado Pago</a>. Nós guardamos apenas o e-mail informado, o identificador da compra, o valor, a situação do pagamento e o código de acesso gerado. Não recebemos dados da sua conta bancária. Para lembrar que o primeiro grupo já foi feito e que o acesso foi liberado, o site guarda no seu navegador um código curto de cada grupo (calculado a partir da data da primeira mensagem, sem conteúdo), o código de acesso e o e-mail informado na compra. Isso fica só no seu aparelho e some se você limpar os dados do navegador.</p>
<h3>Quem nos ajuda a operar o site</h3>
<p>Usamos fornecedores que tratam dados em nosso nome: a Cloudflare (hospedagem do site e banco de dados dos números anônimos, sugestões, e-mails e compras), o Mercado Pago (pagamento) e o Google (medição de visitas e anúncios). Alguns desses servidores ficam fora do Brasil; nesses casos, a transferência segue as garantias previstas na LGPD e nos contratos desses fornecedores.</p>
<h2>5. Dados de uso (Google Analytics)</h2>
<p>Usamos o Google Analytics para entender, de forma agregada, quantas pessoas visitam o site, quais páginas acessam e quantas retrospectivas são concluídas. Registramos eventos como "prêmio revelado" ou "card compartilhado", sem nomes, mensagens ou conteúdo do grupo. O Google coleta dados técnicos como endereço IP aproximado, tipo de aparelho e navegador, conforme a <a href="https://policies.google.com/privacy" rel="noopener">política de privacidade do Google</a>.</p>
<h2>6. Cookies e publicidade (Google AdSense)</h2>
<p>Este site exibe anúncios do Google AdSense. Fornecedores terceiros, incluindo o Google, usam cookies para exibir anúncios com base em visitas anteriores do usuário a este e a outros sites. O uso de cookies de publicidade pelo Google permite que ele e seus parceiros exibam anúncios com base nessas visitas a este site e/ou a outros sites na Internet.</p>
<ul><li>Você pode desativar a publicidade personalizada nas <a href="https://adssettings.google.com" rel="noopener">Configurações de anúncios do Google</a>.</li>
<li>Também é possível desativar o uso de cookies de outros fornecedores para publicidade personalizada em <a href="https://www.aboutads.info/choices/" rel="noopener">aboutads.info</a>.</li>
<li>Saiba como o Google usa dados de sites parceiros em <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">policies.google.com/technologies/partner-sites</a>.</li>
<li>Você pode bloquear ou apagar cookies a qualquer momento nas configurações do seu navegador. O site continua funcionando normalmente.</li></ul>
<p>No primeiro acesso, o aviso de cookies pergunta a sua escolha. Com <b>"Aceitar"</b>, o Google pode mostrar anúncios personalizados. Com <b>"Só o essencial"</b>, os anúncios continuam, mas sem personalização e sem cookies de publicidade. Para mudar de ideia, limpe os dados do site no navegador e o aviso aparece de novo.</p>
<h2>7. Links de parceiros</h2>
<p>Alguns conteúdos têm links de parceiros, sempre sinalizados. Se você comprar por eles, o Retrozap pode receber uma comissão, sem custo extra para você. Ao sair do Retrozap, vale a política de privacidade do site de destino.</p>
<h2>8. Bases legais (LGPD)</h2>
<ul><li><b>Legítimo interesse:</b> medição de visitas e exibição de anúncios não personalizados, para manter o site gratuito.</li>
<li><b>Execução de contrato:</b> dados da compra do acesso ilimitado.</li>
<li><b>Consentimento:</b> anúncios personalizados (botão "Aceitar"), comparação com outros grupos ou casais (opção que você pode desmarcar) e dados que você envia de propósito (sugestões e e-mails).</li></ul>
<h2>9. Por quanto tempo guardamos</h2>
<ul><li>Mensagens do grupo: não guardamos.</li>
<li>Números anônimos da comparação: enquanto o recurso existir, só de forma agregada.</li>
<li>Sugestões e contatos: até 2 anos, ou antes, se você pedir a exclusão.</li>
<li>E-mail para novidades: até você pedir para sair.</li>
<li>Dados de compras: pelo prazo exigido pelas leis fiscais e de defesa do consumidor (até 5 anos).</li>
<li>Dados do Google Analytics e do AdSense: pelos prazos definidos pelo Google.</li></ul>
<h2>10. Seus direitos</h2>
<p>Pela LGPD, você pode pedir confirmação de tratamento, acesso, correção, anonimização ou exclusão dos seus dados, informações sobre compartilhamento e revogar consentimentos. É só escrever para <a href="mailto:contato@retrozap.com.br">contato@retrozap.com.br</a>. Como não guardamos as suas mensagens, não há conversa sua armazenada para ser apagada.</p>
<h2>11. Menores de idade</h2>
<p>O Retrozap não é direcionado a menores de 13 anos. A compra do acesso ilimitado é para maiores de 18 anos ou com autorização dos responsáveis. Não coletamos a idade de ninguém.</p>
<h2>12. Mudanças nesta política</h2>
<p>Se esta política mudar, a data no topo será atualizada. Mudanças importantes serão avisadas no site.</p>
""", ad=False))

urls.append(page('termos.html', 'Termos de Uso', 'Regras de uso do Retrozap, a premiação dos grupos de WhatsApp.', """
<h1>Termos de Uso</h1>
<p class="small">Última atualização: outubro de 2026</p>
<h2>1. O que é o Retrozap</h2>
<p>O Retrozap é um site de entretenimento que transforma o arquivo exportado de um grupo de WhatsApp em estatísticas, prêmios e cards. Os prêmios são brincadeiras baseadas em contagens automáticas e não são avaliações sérias sobre ninguém.</p>
""" + ('<p><b>Preço:</b> a primeira retrospectiva é grátis. O acesso ilimitado custa R$ 4,99, pago uma única vez por Pix pelo Mercado Pago, e vale para o navegador onde foi liberado (ou outro, com o código de acesso). Se tiver qualquer problema com a compra, escreva para <a href="mailto:contato@retrozap.com.br">contato@retrozap.com.br</a>.</p>' if COBRANCA_PUBLICA else '') + """
<h2>2. Seu papel</h2>
<ul><li>Use apenas exports de grupos dos quais você participa.</li>
<li>Pense nas outras pessoas antes de compartilhar cards: o grupo pode não gostar de ver certos resultados fora dele.</li>
<li>Não use o Retrozap para expor, humilhar ou perseguir ninguém. Categorias ofensivas são bloqueadas.</li></ul>
<h2>3. Sem garantias</h2>
<p>As análises dependem do formato do arquivo exportado e podem conter imprecisões. O serviço é oferecido como está, sem garantia de funcionamento contínuo.</p>
<h2>4. Marcas</h2>
<p>O Retrozap não tem relação com o WhatsApp ou a Meta. WhatsApp é marca de seus respectivos donos.</p>
<h2>5. Mudanças</h2>
<p>Estes termos podem ser atualizados. A data no topo indica a versão em vigor.</p>
<h2>6. Contato</h2>
<p><a href="mailto:contato@retrozap.com.br">contato@retrozap.com.br</a></p>
""", ad=False))

urls.append(page('sobre.html', 'Sobre o Retrozap', 'A retrospectiva oficial dos grupos de WhatsApp do Brasil.', """
<h1>Todo grupo tem uma história</h1>
<p>No Brasil, grupo de WhatsApp é instituição. Tem o da família, que acorda com bom dia e foto de flor. O da firma, que ninguém silencia por medo. O dos amigos, que já brigou por futebol, por política e por quem pagou a última rodada. E o do prédio, que sempre tem alguém perguntando de quem é o barulho.</p>
<p>Todo grupo tem um tagarela, um fantasma, um rei da figurinha e alguém que só aparece para mandar áudio de quatro minutos. O Retrozap existe para dar a essas pessoas o reconhecimento que elas merecem: uma cerimônia de premiação com números, prêmios, personagens e cards para mandar no próprio grupo.</p>
<h2>Como funciona</h2>
<p>Você exporta a conversa do grupo pelo próprio WhatsApp, escolhe o arquivo no site e pronto. A análise acontece no seu celular, e as suas mensagens nunca são enviadas para ninguém.</p>
<h2>Feito no Brasil</h2>
<p>O Retrozap é um projeto independente, criado em São Paulo. Sugestões de categorias e parcerias: <a href="/contato">fale com a gente</a>.</p>
<!--AD-->
"""))

urls.append(page('contato.html', 'Contato', 'Fale com o Retrozap: sugestões, parcerias e privacidade.', """
<h1>Fale com a gente</h1>
<p>Sugestões de categorias, problemas com algum arquivo, parcerias com marcas ou dúvidas sobre privacidade:</p>
<p><a href="mailto:contato@retrozap.com.br">contato@retrozap.com.br</a></p>
<p class="small">Se algum export não funcionou, conte se ele veio de iPhone ou Android. Nunca envie o arquivo da conversa por e-mail.</p>
""", ad=False))

ARTIGOS = [
('como-exportar-conversa-whatsapp', 'Como exportar a conversa de um grupo do WhatsApp (iPhone e Android)',
 'Passo a passo para exportar a conversa de um grupo do WhatsApp sem mídia, no iPhone e no Android, e o que fazer quando não funciona.', """
<h1>Como exportar a conversa de um grupo do WhatsApp</h1>
<p>Exportar a conversa é o jeito oficial do WhatsApp de gerar um arquivo com todo o histórico de um grupo. Ele serve para guardar memórias, fazer backup de algo importante ou, no nosso caso, descobrir quem é o tagarela do grupo. O recurso existe no app de celular, não no WhatsApp Web.</p>
<h2>No iPhone</h2>
<ol><li>Abra o grupo no WhatsApp.</li><li>Toque no nome do grupo, no topo da tela.</li><li>Role até o fim e toque em <b>Exportar conversa</b>.</li><li>Escolha <b>Sem mídia</b>. O arquivo fica bem mais leve e tem tudo o que importa.</li><li>Toque em <b>Salvar em Arquivos</b>. O WhatsApp cria um arquivo .zip.</li></ol>
<h2>No Android</h2>
<ol><li>Abra o grupo e toque nos três pontinhos, no canto superior direito.</li><li>Toque em <b>Mais</b> e depois em <b>Exportar conversa</b>.</li><li>Escolha <b>Sem mídia</b>.</li><li>Salve em Downloads ou no Google Drive.</li></ol>
<!--AD-->
<h2>Não aparece a opção de exportar?</h2>
<p>Se alguém ativou a <b>Privacidade avançada da conversa</b> no grupo, a exportação fica bloqueada para todos os participantes. Peça para quem ativou desligar a opção nas informações do grupo.</p>
<h2>O arquivo começa no meio da conversa</h2>
<p>O export só inclui as mensagens que ainda estão no celular de quem exportou. Quem entrou no grupo depois, trocou de aparelho sem backup ou apagou mensagens antigas vai gerar um arquivo mais curto. Para pegar a história completa, peça para alguém que está no grupo desde o começo fazer o export.</p>
<h2>É seguro?</h2>
<p>O arquivo fica no seu celular. No Retrozap, ele é lido pelo seu próprio navegador: as mensagens não são enviadas para nenhum servidor. Mesmo assim, trate o export como algo pessoal e não envie o arquivo para quem não é do grupo.</p>
<p><a class="cta" href="/">Fazer a cerimônia do meu grupo</a></p>
"""),
('ideias-de-premios-para-grupo-de-whatsapp', '40 ideias de prêmios para o seu grupo de WhatsApp',
 'Categorias de premiação para grupos de amigos, família, trabalho e condomínio: do Tagarela ao Fiscal do Barulho.', """
<h1>40 ideias de prêmios para o seu grupo de WhatsApp</h1>
<p>Premiar o grupo no fim do ano virou tradição em muita turma. Para ajudar, separamos ideias por tipo de grupo. No Retrozap, várias delas são calculadas sozinhas a partir da conversa, e você ainda pode criar a sua.</p>
<h2>Grupo de amigos</h2>
<ul><li><b>O Tagarela:</b> quem mais manda mensagem.</li><li><b>Figurinha de Ouro:</b> quem responde tudo com figurinha.</li><li><b>Coruja da Madrugada:</b> quem aparece entre meia-noite e 5h.</li><li><b>Rei do Furo:</b> campeão do "não vou conseguir".</li><li><b>Organizador do Rolê:</b> quem mais chama para sair.</li><li><b>Puxa-Assunto:</b> quem ressuscita o grupo depois de horas de silêncio.</li><li><b>Mata-Conversa:</b> a mensagem depois da qual ninguém mais fala.</li><li><b>Coração Mole:</b> quem mais manda "amo vcs".</li><li><b>Podcaster do Grupo:</b> o rei dos áudios longos.</li><li><b>O Fantasma:</b> quem lê tudo e não fala nada.</li></ul>
<!--AD-->
<h2>Grupo da família</h2>
<ul><li><b>Tio do Bom Dia:</b> o despertador oficial da família.</li><li><b>Mãe Coruja:</b> campeã do "chegou bem?".</li><li><b>Rei do Parabéns:</b> nunca esquece um aniversário.</li><li><b>Repórter da Família:</b> manda todas as notícias.</li><li><b>Fotógrafo Oficial:</b> documenta cada almoço de domingo.</li><li><b>Quem Mais Ama:</b> o abraço do grupo.</li></ul>
<h2>Grupo do trabalho</h2>
<ul><li><b>Rei do "Ok":</b> eficiência em duas letras.</li><li><b>Fora do Expediente:</b> manda mensagem às 22h de sábado.</li><li><b>Mestre das Reuniões:</b> "bora fazer uma call?".</li><li><b>Salva-Vidas:</b> o "pode deixar" do time.</li></ul>
<h2>Grupo do prédio ou do bairro</h2>
<ul><li><b>Síndico de Plantão:</b> mural de recados ambulante.</li><li><b>Achados e Perdidos:</b> "alguém viu uma chave no hall?".</li><li><b>Rei da Indicação:</b> tem o contato de todo eletricista.</li><li><b>Fiscal do Barulho:</b> sabe de onde vem cada furadeira.</li><li><b>Comitê de Boas-Vindas:</b> recebe todo vizinho novo.</li></ul>
<h2>Regras de ouro</h2>
<p>Prêmio bom provoca, mas não humilha. Evite categorias sobre aparência, saúde, religião, dinheiro ou vida íntima de alguém. A graça é todo mundo rir junto, inclusive quem ganhou.</p>
<p><a class="cta" href="/">Descobrir os vencedores do meu grupo</a></p>
"""),
('privacidade-ao-analisar-conversas-do-whatsapp', 'Dá para analisar a conversa do WhatsApp sem expor ninguém?',
 'Como o Retrozap analisa grupos de WhatsApp sem enviar suas mensagens para servidores, e cuidados para compartilhar os resultados.', """
<h1>Dá para analisar a conversa do WhatsApp sem expor ninguém?</h1>
<p>Dá, e foi assim que o Retrozap foi construído. A maioria dos sites que analisam conversas pede que você envie o arquivo para um servidor. Aqui, a análise roda no seu próprio navegador, como uma calculadora que funciona dentro do celular.</p>
<h2>Como funciona na prática</h2>
<p>Quando você escolhe o arquivo exportado, o navegador abre o .zip, lê as mensagens e faz as contas ali mesmo: quem falou mais, em que horário, quantas figurinhas, quantas risadas. Nenhuma mensagem é enviada pela internet. Um jeito simples de confirmar: abra o site, ative o modo avião e faça a análise. Funciona igual (só a comparação com outros grupos fica de fora).</p>
<!--AD-->
<h2>E a comparação com outros grupos?</h2>
<p>Para dizer se o seu grupo está no "Top 5% em mensagens", o site envia só números anônimos (total de mensagens, recorde em um dia, quantidade de áudios). Nenhuma mensagem e nenhum nome. E dá para desmarcar essa opção antes de começar. Com a opção desmarcada, o teste do modo avião funciona igual.</p>
<h2>Cuidados ao compartilhar</h2>
<ul><li>Os cards mostram nomes e números. Mande no próprio grupo antes de postar em qualquer outro lugar.</li><li>Em grupos de trabalho e de prédio, prefira categorias leves.</li><li>Se alguém do grupo não gostar, apague. A brincadeira só funciona se todo mundo estiver rindo.</li></ul>
<p><a class="cta" href="/">Fazer a cerimônia do meu grupo</a></p>
""")]
ARTIGOS = ARTIGOS + conteudo.NOVOS
urls.append(page(*conteudo.COMO_FUNCIONA))
urls.append(page('perguntas-frequentes.html', 'Perguntas frequentes', 'Dúvidas sobre o Retrozap: privacidade, como exportar a conversa, iPhone e Android, prêmios e mais.', conteudo.faq_html()))
urls.append(page(*conteudo.IDEIAS))
lista = ''.join(f'<a class="card" href="/blog/{slug}"><b>{t}</b><span class="small">{d}</span></a>' for slug, t, d, _ in ARTIGOS)
urls.append(page('blog/index.html', 'Blog do Retrozap', 'Dicas para grupos de WhatsApp: retrospectiva do grupo, ideias de prêmios, brincadeiras, gírias, jogos e privacidade.', f'<h1>Blog do Retrozap</h1><div class="cards">{lista}</div><!--AD-->'))
for slug, t, d, body in ARTIGOS:
    urls.append(page(f'blog/{slug}.html', t, d, body))

# ---------- arquivos técnicos ----------
open(os.path.join(PUB, 'ads.txt'), 'w').write('google.com, pub-4039247360984618, DIRECT, f08c47fec0942fa0\n')
open(os.path.join(PUB, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n')
open(os.path.join(PUB, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{u}</loc><lastmod>{HOJE}</lastmod></url>\n' for u in urls) + '</urlset>\n')
json.dump({"name":"Retrozap","short_name":"Retrozap","description":"A retrospectiva oficial dos grupos de WhatsApp","start_url":"/","display":"standalone","background_color":"#1A0B2E","theme_color":"#1A0B2E","lang":"pt-BR",
           "icons":[{"src":"/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"/icon-512.png","sizes":"512x512","type":"image/png"},{"src":"/apple-touch-icon.png","sizes":"180x180","type":"image/png"}]},
          open(os.path.join(PUB, 'manifest.webmanifest'), 'w'), ensure_ascii=False, indent=2)
open(os.path.join(PUB, '_headers'), 'w').write("""/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: SAMEORIGIN
  Cache-Control: no-cache

/assets/*
  ! Cache-Control
  Cache-Control: public, max-age=86400
""")
# páginas: o navegador sempre confere se há versão nova (no-cache); arquivos de /assets: guardados por 1 dia
# rotas da cerimônia caem no index (as páginas legais e o blog são arquivos próprios)
open(os.path.join(PUB, '_redirects'), 'w').write('\n'.join(f'{r} /index.html 200' for r in ['/comecar','/turma','/conhecendo','/prologo','/numeros','/categorias','/premios/*','/bonus','/resumo','/fim','/destaque','/crie-seu-premio']) + '\n')

# ---------- ícones e imagem de compartilhamento ----------
open(os.path.join(PUB, 'icon.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1A0B2E"/><path d="M20 14h24v6h6v6c0 7-5 12-11 13-2 4-4 6-5 7v5h7v5H23v-5h7v-5c-1-1-3-3-5-7-6-1-11-6-11-13v-6h6zm-1 10v2c0 3 2 6 4 7-1-3-1-6-1-9zm26 0c0 3 0 6-1 9 2-1 4-4 4-7v-2z" fill="#FFC23C"/></svg>')
BRI = os.path.join(SCR, 'fontes', 'node_modules', '@fontsource-variable', 'bricolage-grotesque', 'files')
def fonte(tam):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(f): return ImageFont.truetype(f, tam)
    return ImageFont.load_default()
def trofeu(d, cx, cy, k, cor):
    d.rounded_rectangle([cx-20*k, cy-22*k, cx+20*k, cy+4*k], radius=int(10*k), fill=cor)
    d.ellipse([cx-30*k, cy-18*k, cx-14*k, cy-2*k], outline=cor, width=max(2,int(4*k)))
    d.ellipse([cx+14*k, cy-18*k, cx+30*k, cy-2*k], outline=cor, width=max(2,int(4*k)))
    d.rectangle([cx-4*k, cy+4*k, cx+4*k, cy+14*k], fill=cor)
    d.rounded_rectangle([cx-14*k, cy+14*k, cx+14*k, cy+22*k], radius=int(3*k), fill=cor)
for tam in (192, 512):
    im = Image.new('RGB', (tam, tam), '#1A0B2E'); d = ImageDraw.Draw(im)
    trofeu(d, tam/2, tam/2 - tam*0.02, tam/80, '#FFC23C'); im.save(os.path.join(PUB, f'icon-{tam}.png'))
og = Image.new('RGB', (1200, 630), '#1A0B2E'); d = ImageDraw.Draw(og)
for i, c in enumerate(['#FFC23C','#FF4F8B','#FF7A59','#2EC4F1','#A98BFF']*8):
    x = (i*197) % 1200; y = (i*131) % 630; d.rectangle([x, y, x+14, y+6], fill=c)
d.rectangle([0, 0, 1200, 14], fill='#FF4F8B')
trofeu(d, 1000, 300, 5, '#FFC23C')
d.text((80, 150), 'retrozap', font=fonte(120), fill='#FFC23C')
d.text((84, 310), 'Todo grupo tem uma história.', font=fonte(48), fill='#FFF4E0')
d.text((84, 375), 'Descubra a do seu.', font=fonte(48), fill='#FFF4E0')
d.text((84, 480), 'A retrospectiva oficial dos grupos de WhatsApp', font=fonte(30), fill='#B9A8CC')
og.save(os.path.join(PUB, 'og-image.png'))
print('paginas ok:', len(urls))
