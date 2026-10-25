import asyncio, subprocess, sys, time
from playwright.async_api import async_playwright
import os
S=os.path.dirname(os.path.abspath(__file__)); PUB=sys.argv[1] if len(sys.argv)>1 else 'retrozap-site/public'
O='/tmp/shots-casal'; import os; os.makedirs(O,exist_ok=True)
srv=subprocess.Popen([sys.executable,'-m','http.server','8766','-d',PUB],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':390,'height':844})
    er=[]; pg.on('pageerror',lambda e: er.append(str(e)))
    await pg.goto('http://localhost:8766/?plano_teste=1'); await pg.wait_for_timeout(600)
    if await pg.query_selector('.cookies button'): await pg.click('.cookies button')
    await pg.screenshot(path=O+'/0-inicio.png',full_page=True)
    await pg.click('[data-esc=casal]'); await pg.wait_for_timeout(300); await pg.screenshot(path=O+'/0b-inicio-casal.png',full_page=True); await pg.click('#comecar'); await pg.wait_for_selector('#file',state='attached')
    await pg.screenshot(path=O+'/1-comecar-casal.png',full_page=True)
    await pg.set_input_files('#file',S+'/_chat_casal.txt'); await pg.wait_for_timeout(300)
    if await pg.query_selector('#start'): await pg.click('#start')
    await pg.wait_for_timeout(500); t0=time.time()
    for sel in ['#lbOk','#lbSim','#lbGo']:
      if await pg.query_selector(sel): await pg.click(sel); break
    await pg.wait_for_selector('#go',timeout=20000); print('analise s', round(time.time()-t0,2)); await pg.wait_for_timeout(400)
    await pg.screenshot(path=O+'/2-turma.png',full_page=True)
    await pg.click('#go'); await pg.wait_for_selector('.persona',timeout=30000); await pg.wait_for_timeout(1500)
    await pg.screenshot(path=O+'/3-conhecendo-gratis.png',full_page=True)
    print('persos', await pg.eval_on_selector_all('.perso',"es=>es.map(e=>e.className+':'+e.querySelector('h3').textContent)"))
    print('classif', await pg.eval_on_selector('.persona','e=>e.textContent.slice(0,80)'))
    await pg.click('#go'); await pg.wait_for_selector('#spNao'); await pg.click('#spNao'); await pg.wait_for_timeout(300); await pg.screenshot(path=O+'/4-categorias.png',full_page=True)
    print('spoiler foi direto ao 1º prêmio:', '/premios/' in pg.url)
    if '/premios/' not in pg.url: await pg.click('#go')
    await pg.wait_for_timeout(300); n=0; tit=[]
    while '/premios/' in pg.url and n<20:
      n+=1
      if await pg.query_selector('#rvl'): await pg.click('#rvl'); await pg.wait_for_timeout(2400)
      elif await pg.query_selector('.opt'): await pg.click('.opt')
      await pg.wait_for_timeout(300)
      tit.append(await pg.eval_on_selector('h1, h2','e=>e.textContent'))
      if n==2: await pg.screenshot(path=O+'/5-premio.png',full_page=True); await pg.click('#card'); await pg.wait_for_timeout(800); await pg.screenshot(path=O+'/6-card.png'); await pg.click('#cl')
      await pg.click('#next'); await pg.wait_for_timeout(300)
    print('premios',n,tit)
    i=0
    while await pg.query_selector('#rl') and await pg.is_visible('#rl') and i<15: i+=1; await pg.click('#rl'); await pg.wait_for_timeout(1300)
    await pg.wait_for_selector('#concluir',timeout=8000); await pg.wait_for_timeout(1200)
    await pg.screenshot(path=O+'/7-fim-gratis.png',full_page=True)
    print('livre trancada?', await pg.query_selector('.livre.trancado') is not None, '| personagens trancados:', len(await pg.query_selector_all('.perso.trancado')))
    import base64
    print('ordem', await pg.eval_on_selector_all('section.screen > *','es=>es.map(e=>(e.className||e.tagName).toString().slice(0,20))'))
    await pg.click('#vger'); await pg.wait_for_timeout(600); print('video paywall', await pg.query_selector('.patro') is not None)
    t0=time.time(); await pg.click('#pwX'); await pg.wait_for_timeout(50); print('fechou em', round(time.time()-t0,2), await pg.query_selector('.patro') is None)
    el=await pg.query_selector('#vlive'); await el.scroll_into_view_if_needed()
    for i in range(7):
      await el.screenshot(path=O+f'/v{i}.png'); await pg.wait_for_timeout(2900)
    for y in range(0, 14000, 700):
      await pg.evaluate(f'scrollTo(0,{y})'); await pg.wait_for_timeout(250)
    await pg.wait_for_timeout(1500)
    for sel,n in [('#rimg1','resumo'),('#rimg5','nos'),('#rimg4','n2026'),('#rimg3','trofeus')]:
      src=(await pg.eval_on_selector(sel,'e=>e.src')) if await pg.query_selector(sel) else ''
      if src.startswith('data:'): open(O+f'/card-{n}.png','wb').write(base64.b64decode(src.split(',')[1]))
      print(n, bool(src))
    await pg.screenshot(path=O+'/7b-fim.png',full_page=True)
    await pg.click('#planoTeste [data-plano=premium]'); await pg.wait_for_timeout(800)
    t1=time.time(); await pg.click('#vger'); await pg.wait_for_function("document.querySelector('#vmsg') && /baixado|Pronto!/.test(document.querySelector('#vmsg').textContent)", timeout=60000); print('video gerado em', round(time.time()-t1,1), 's', await pg.evaluate('window.Mp4Muxer ? "webcodecs" : "mediarecorder"'))
    print('video', await pg.text_content('#vger'), '|', await pg.text_content('#vmsg'))
    pal=await pg.query_selector_all('[data-pal]'); print('palavras', [await p.text_content() for p in pal])
    if pal:
      await pal[1].click(); await pg.wait_for_timeout(800); print('votou', await pg.eval_on_selector_all('[data-pal][aria-pressed=true]','es=>es.map(e=>e.textContent)'))
    await pg.fill('#lvP','caralho'); await pg.click('#lvF button'); print('bloq', await pg.text_content('#lvE'))
    for w in ['amor','pizza','saudade','cansado']:
      await pg.fill('#lvP',w); await pg.click('#lvF button'); await pg.wait_for_timeout(200)
    print('tentativas', await pg.text_content('#lvN'), '|', await pg.text_content('#lvE'))
    print('ERROS',er)
    await b.close()
asyncio.run(main()); srv.terminate()
