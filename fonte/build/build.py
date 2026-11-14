import re, os, shutil, json, sys

BASE = os.path.dirname(os.path.abspath(__file__))
SCR = os.path.dirname(BASE)
OUT = os.path.join(SCR, os.environ.get('RZ_OUT', 'retrozap-site'))
PUB = os.path.join(OUT, 'public')
if os.path.exists(OUT): shutil.rmtree(OUT)
os.makedirs(os.path.join(PUB, 'assets'), exist_ok=True)
os.makedirs(os.path.join(PUB, 'blog'), exist_ok=True)
os.makedirs(os.path.join(OUT, 'functions', 'api'), exist_ok=True)

src = open(os.path.join(SCR, os.environ.get('RZ_SRC', 'zapped.html')), encoding='utf-8').read()
s = src
def rep(a, b, count=1):
    global s
    if a not in s: sys.exit('NAO ACHEI: ' + a[:90])
    s = s.replace(a, b, count)

# ---------- fontes e bibliotecas hospedadas no próprio site ----------
NM = os.path.join(SCR, 'fontes', 'node_modules')
shutil.copy(os.path.join(NM, '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2'), os.path.join(PUB, 'assets/bricolage.woff2'))
for w in (400, 500, 700):
    shutil.copy(os.path.join(NM, f'@fontsource/dm-sans/files/dm-sans-latin-{w}-normal.woff2'), os.path.join(PUB, f'assets/dmsans-{w}.woff2'))
shutil.copy(os.path.join(NM, 'jszip/dist/jszip.min.js'), os.path.join(PUB, 'assets/jszip.min.js'))
shutil.copy(os.path.join(NM, 'qrcode-generator/qrcode.js'), os.path.join(PUB, 'assets/qrcode.js'))
shutil.copy(os.path.join(NM, 'mp4-muxer/build/mp4-muxer.js'), os.path.join(PUB, 'assets/mp4-muxer-5.2.1.js'))
s = s.replace("const VIDEO_EXPORTAR = 'https://retrozap.com.br/assets/como-exportar-v1';", "const VIDEO_EXPORTAR = '/assets/como-exportar-v1';")
s = s.replace("const MUX_URL = 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.1/build/mp4-muxer.js';", "const MUX_URL = '/assets/mp4-muxer-5.2.1.js';")
shutil.copy(os.path.join(SCR, 'partygames.jpg'), os.path.join(PUB, 'assets/partygames.jpg'))
shutil.copy(os.path.join(SCR, 'como-exportar.mp4'), os.path.join(PUB, 'assets/como-exportar-v1.mp4'))
shutil.copy(os.path.join(SCR, 'como-exportar.jpg'), os.path.join(PUB, 'assets/como-exportar-v1.jpg'))
s = re.sub(r"const PATRO_IMG = '[^']*';", "const PATRO_IMG = '/assets/partygames.jpg';", s)
FONTES = """@font-face{font-family:'Bricolage Grotesque';src:url(/assets/bricolage.woff2) format('woff2');font-weight:200 800;font-display:swap}
@font-face{font-family:'DM Sans';src:url(/assets/dmsans-400.woff2) format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'DM Sans';src:url(/assets/dmsans-500.woff2) format('woff2');font-weight:500;font-display:swap}
@font-face{font-family:'DM Sans';src:url(/assets/dmsans-700.woff2) format('woff2');font-weight:700;font-display:swap}
"""

# ---------- cabeçalho da página ----------
rep('<title>Retrozap</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n', '')
rep('<link rel="preconnect" href="https://fonts.googleapis.com">\n', '')
s = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com/css2[^"]*">\n', '', s)
rep('<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>', '<script src="/assets/jszip.min.js" defer></script>')
HEAD = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
@@MEDICAO@@@@GTM@@<title>Retrospectiva do grupo de WhatsApp 2026 · Retrozap</title>
<meta name="description" content="Quem fala mais, quem some e quem manda áudio de 5 minutos? A retrospectiva 2026 do seu grupo de WhatsApp, com prêmios e cards. A conversa fica no celular.">
<!-- telas internas e endereços que não existem abrem este mesmo arquivo: só o início aparece na busca -->
<script>if(location.pathname!=='/'){var r=document.createElement('meta');r.name='robots';r.content='noindex';document.head.appendChild(r)}</script>
<meta name="theme-color" content="#1A0B2E">
<link rel="canonical" href="https://retrozap.com.br/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Retrozap">
<meta property="og:title" content="Retrozap · Todo grupo tem uma história. Descubra a do seu.">
<meta property="og:description" content="A retrospectiva 2026 dos grupos de WhatsApp do Brasil. O primeiro grupo é grátis, e as mensagens não saem do celular.">
<meta property="og:image" content="https://retrozap.com.br/og-retrozap.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Retrozap: a retrospectiva do grupo de WhatsApp">
<meta property="og:url" content="https://retrozap.com.br/">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Retrozap · Todo grupo tem uma história. Descubra a do seu.">
<meta name="twitter:description" content="A retrospectiva 2026 dos grupos de WhatsApp do Brasil. O primeiro grupo é grátis, e as mensagens não saem do celular.">
<meta name="twitter:image" content="https://retrozap.com.br/og-retrozap.png">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="preload" href="/assets/bricolage.woff2" as="font" type="font/woff2" crossorigin>
<meta name="google-adsense-account" content="ca-pub-4039247360984618">
<!-- AdSense: no app o script só carrega depois do resultado, num bloco manual (ativaAnuncios), e nunca para quem tem o Premium -->
<script>(function(){var p=null;try{p=localStorage.getItem('rz_acesso')}catch(e){}if(p)document.documentElement.classList.add('premium')})();</script>
<style>.premium ins.adsbygoogle,.premium .anuncio,.premium .google-auto-placed,.premium .adsbygoogle-noablate{display:none!important}</style>
<!--LD-->
"""
import sys as _sys; _sys.path.insert(0, BASE); import conteudo as _ct
s = HEAD.replace('@@MEDICAO@@', _ct.head_medicao()).replace('@@GTM@@', _ct.gtm_head(getattr(_ct, 'GTM_ID', ''))) + s
rep('<style>\n', '<style>\n' + FONTES, 1)
rep('<div class="app">', '</head>\n<body>\n<div class="app">')
s = s.rstrip() + '\n</body>\n</html>\n'

# ---------- base CSS que o artefato recebia pronta ----------
rep("*{box-sizing:border-box}", "*{box-sizing:border-box}\nhtml{-webkit-text-size-adjust:100%}\nbody{margin:0}\nimg{max-width:100%}\n[hidden]{display:none!important}")
rep("@media (prefers-reduced-motion:reduce)", _ct.CSS_COOKIES + """.rodape a{color:var(--areia)}
body.has-cookies{padding-bottom:calc(170px + env(safe-area-inset-bottom,0px))}
.rodape{display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center;font-size:13px;color:var(--neblina);padding-top:24px;border-top:1px solid var(--linha);margin-top:12px}
@media (prefers-reduced-motion:reduce)""")

# ---------- código de produção ----------

rep('<script>\n/* ---------- utilidades ---------- */', '<script>\n' + _ct.consentimento_js() + '\n' + open(os.path.join(BASE, 'prod_head.js'), encoding='utf-8').read() + '\n/* ---------- utilidades ---------- */')


# rotas por tela
ROTAS = {"function inicio(){\n  anchor(true);": "ir('/');", "function home(){\n  anchor(true);": "ir('/arquivo');", "function story(){\n  anchor(true);": "ir('/conhecendo'); evento('prologo_visto');",
         "function fimTela(semFesta){\n  anchor(false);": "ir('/fim'); if (!semFesta && !state.finalMedido){ state.finalMedido = true; evento('final_visto', {modo: state.modo}); }",
         "function lineup(){\n  anchor(true);": "ir('/categorias');",
         "function award(){\n  anchor(true);": "ir('/premios/' + (state.idx + 1));", "function maisPremios(){\n  anchor(true);": "ir('/bonus');",
         "function suspense(){\n  anchor(false);": "ir('/resumo');",
         "function final(semFesta){\n  anchor(true);": "ir('/destaque'); if (!semFesta && !state.finalMedido){ state.finalMedido = true; evento('final_visto', {modo: state.modo}); }",
         "const custom = (texto = '') => {\n  anchor(true);": "ir('/crie-seu-premio');", "function roster(){\n  anchor(false);": "ir('/turma');",
         "function personagensTela(){\n  anchor(true);": "ir('/personagens'); evento('personagens_visto');"}
for k, v in ROTAS.items(): rep(k, k + '\n  ' + v)
rep("function voltar(){ voltarPilha(); }", "function voltar(){ history.back(); } // o navegador volta e o popstate redesenha a tela anterior")

# eventos
rep("  state.raw = msgs; state.alias = {};", "  if (!retomando) evento('upload_ok', {mensagens: msgs.length, modo: state.modo, exemplo: !!sample});\n  state.finalMedido = false;\n  state.raw = msgs; state.alias = {};")
rep("    home(); const err = $('#err'); err.hidden = false;", "    evento('upload_erro'); home(); const err = $('#err'); err.hidden = false;")
rep("  }catch(e){ V2.lendo = false;", "  }catch(e){ evento('upload_erro'); V2.lendo = false;")
rep("view.querySelectorAll('.mode').forEach(b => b.onclick = () => { const k = b.dataset.m;", "view.querySelectorAll('.mode').forEach(b => b.onclick = () => { const k = b.dataset.m; evento('modo_escolhido', {modo: k});")
rep("function showResult(a, extra=''){", "function showResult(a, extra=''){\n  evento('premio_revelado', {premio: a.n});")
rep("    $('#next').onclick = () => custom();\n    $('#back2').onclick = final;", "    evento('premio_criado');\n    $('#next').onclick = () => custom();\n    $('#back2').onclick = final;")

# IA: servidor próprio em vez do Claude

# janela do card sem dependências do Claude
rep("let DOWN = null;\nwindow.claude?.use?.('downloads').then(d => { DOWN = d; }).catch(() => {});\n", "")
i = s.index("  if (m.querySelector('#dl')) m.querySelector('#dl').onclick = async () => {")
j = s.index("  if (m.querySelector('#cp')) m.querySelector('#cp').onclick", i)
s = s[:i] + """  if (m.querySelector('#dl')) m.querySelector('#dl').onclick = () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    evento('card_salvo'); msg.textContent = 'Imagem salva! Agora é só mandar no grupo. 🏆';
  };
""" + s[j:]
rep("    try { await navigator.share({files:[f], text:texto}); return 'ok'; }", "    try { await navigator.share({files:[f], text:texto}); evento('card_compartilhado'); return 'ok'; }")
rep("  window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener');", "  window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener'); evento('card_whatsapp_web');")
rep("msg.textContent = 'Imagem copiada! Cole no WhatsApp com Ctrl+V (ou Cmd+V).';", "msg.textContent = 'Imagem copiada! Cole no WhatsApp com Ctrl+V (ou Cmd+V).'; evento('card_copiado');")
rep("async function openCard(fazer, texto = convite('resumo'), alt = 'Card para compartilhar no grupo'){", "async function openCard(fazer, texto = convite('resumo'), alt = 'Card para compartilhar no grupo'){\n  evento('card_gerado');")

# rodapé e textos de protótipo
# (o rodapé do antigo /comecar saiu com o onboarding v2; o início já tem o rodapé)
rep("$('#voltar').onclick = () => voltar();\nsetModo('amigos'); inicio();", "$('#voltar').onclick = () => voltar();\nsetModo('amigos');\nif (location.pathname !== '/') history.replaceState({}, '', '/');\ninicio(); avisoCookies();")
rep("<p>No site final, este botão abre o WhatsApp direto com a imagem. Aqui no protótipo, toque e segure a imagem para salvar.</p>", "") if "No site final, este botão" in s else None

# ---------- SEO: home pré-renderizada + dados estruturados ----------
import html as _html
_i = s.index("function inicio(){"); _a = s.index("view.innerHTML = `", _i) + len("view.innerHTML = `"); _b = s.index("`;", _a)
HERO = s[_a:_b]
if '${' in HERO:  # a home tem a versão Grupos e Casais: pré-renderiza a de Grupos (a que abre primeiro)
    import subprocess
    HERO = subprocess.run(['node', '-e', 'const cs = false, ORIGEM = null, anuncio = () => "", logoSVG = () => "", icHeart = () => ""; process.stdout.write(eval("`" + require("fs").readFileSync(0, "utf8") + "`"))'], input=HERO, capture_output=True, text=True, check=True).stdout
    if '${' in HERO: sys.exit('inicio() ainda tem interpolacao')
rep('<main id="view" tabindex="-1"></main>', '<main id="view" tabindex="-1">' + HERO + '</main>')
_faq = [(_html.unescape(re.sub('<[^>]+>', '', q)), _html.unescape(re.sub('<[^>]+>', '', a))) for q, a in re.findall(r'<details><summary>(.*?)</summary><p>(.*?)</p></details>', HERO)]
LD = {"@context": "https://schema.org", "@graph": [
  {"@type": "WebSite", "@id": "https://retrozap.com.br/#site", "name": "Retrozap", "alternateName": ["Retrozap Brasil", "retrozap.com.br"], "url": "https://retrozap.com.br/", "inLanguage": "pt-BR", "publisher": {"@id": "https://retrozap.com.br/#org"}},
  {"@type": "Organization", "@id": "https://retrozap.com.br/#org", "name": "Retrozap", "legalName": "BEYOND THE WORK PORTAIS DE CONTEUDO NA INTERNET LTDA", "taxID": "69.746.447/0001-00", "url": "https://retrozap.com.br/", "logo": "https://retrozap.com.br/icon-512.png", "email": "contato@retrozap.com.br",
   "address": {"@type": "PostalAddress", "streetAddress": "Rua Pais Leme, 215, conjunto 1713", "addressLocality": "São Paulo", "addressRegion": "SP", "postalCode": "05424-150", "addressCountry": "BR"}},
  {"@type": "WebApplication", "@id": "https://retrozap.com.br/#app", "name": "Retrozap", "url": "https://retrozap.com.br/", "description": "Retrospectiva do grupo de WhatsApp: prêmios, números e cards para mandar no grupo. A conversa é lida no navegador e não sai do celular.", "applicationCategory": "EntertainmentApplication", "operatingSystem": "Any", "browserRequirements": "Requer um navegador atual", "image": "https://retrozap.com.br/og-retrozap.png", "inLanguage": "pt-BR", "publisher": {"@id": "https://retrozap.com.br/#org"},
   "offers": [{"@type": "Offer", "name": "Retrospectiva do primeiro grupo", "price": "0", "priceCurrency": "BRL", "availability": "https://schema.org/InStock", "url": "https://retrozap.com.br/"},
              {"@type": "Offer", "name": "Acesso ilimitado (Premium): grupos ilimitados, casais, personagens, categoria livre e vídeo, sem anúncios", "sku": "rz-premium", "price": "13.99", "priceCurrency": "BRL", "availability": "https://schema.org/InStock", "url": "https://retrozap.com.br/", "seller": {"@id": "https://retrozap.com.br/#org"}}]},
  ] + ([{"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in _faq]}] if _faq else [])}
rep('<!--LD-->', '<script type="application/ld+json">' + json.dumps(LD, ensure_ascii=False).replace('</', '<\\/') + '</script>')

# sobras do artefato que não podem ir para produção
for proibido in ['window.claude', 'SAMPLE', 'DOWN', 'simulação', 'protótipo', 'Protótipo']:
    for linha in s.split('\n'):
        if proibido in linha:
            print('ATENCAO sobra:', proibido, '→', linha.strip()[:120])

open(os.path.join(PUB, 'index.html'), 'w', encoding='utf-8').write(s)
m = re.findall(r'<script>(.*?)</script>', s, re.S)
open(os.path.join(SCR, 'build', 'prod_check.js'), 'w').write(m[-1])
print('index.html ok', len(s))
