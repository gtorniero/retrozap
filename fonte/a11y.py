import asyncio, subprocess, time, sys, json
from playwright.async_api import async_playwright
AXE = open('fontes/node_modules/axe-core/axe.min.js').read()
srv = subprocess.Popen([sys.executable,'-m','http.server','8767','-d',sys.argv[1] if len(sys.argv)>1 else 'retrozap-site/public'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
res = {}
async def audit(pg, nome):
    await pg.add_script_tag(content=AXE)
    r = await pg.evaluate("async () => (await axe.run(document, {runOnly:['wcag2a','wcag2aa','best-practice']})).violations.map(v => ({id:v.id, impact:v.impact, n:v.nodes.length, help:v.help, ex:v.nodes.slice(0,2).map(x=>x.target.join(' ')+' | '+x.html.slice(0,90))}))")
    res[nome] = r
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width':390,'height':844})
        await pg.goto('http://localhost:8767/'); await pg.click('.cookies button'); await audit(pg,'inicio')
        await pg.click('#comecar'); await pg.wait_for_selector('#demo'); await audit(pg,'home')
        await pg.click('#demo'); await pg.wait_for_selector('#go'); await audit(pg,'turma')
        await pg.click('#go'); await pg.wait_for_selector('.persona', timeout=20000); await pg.wait_for_timeout(1500); await audit(pg,'conhecendo')
        await pg.click('#go'); await pg.wait_for_timeout(400); await audit(pg,'categorias')
        if await pg.query_selector('#patroFecha'): await pg.click('#patroFecha'); await pg.wait_for_timeout(200)
        await pg.click('#go'); await pg.wait_for_timeout(400); await audit(pg,'premio-antes')
        mechs=set()
        while '/premios/' in pg.url:
            h = await pg.inner_html('#game'); mechs.add(h[:60])
            if await pg.query_selector('#rvl'): await pg.click('#rvl'); await pg.wait_for_timeout(2400)
            if await pg.query_selector('#res:not([hidden])') is None:
                for sel in ['.pod button','#ck','.scratch canvas','#chk','button.opt']:
                    pass
            await pg.click('#next'); await pg.wait_for_timeout(300)
        if await pg.query_selector('#pular'): await pg.click('#pular'); await pg.wait_for_timeout(400)
        for k in range(14):
            t = await pg.inner_text('#rl'); await pg.click('#rl'); await pg.wait_for_timeout(300)
            if k==1: await audit(pg,'resumo-fato')
            if 'Ver o resumo' in t or not await pg.query_selector('#rl'): break
        await pg.wait_for_selector('#concluir'); await pg.wait_for_timeout(1500); await audit(pg,'fim')
        await pg.click('#sv1'); await pg.wait_for_timeout(1200); await audit(pg,'modal-card'); await pg.click('#cl'); await pg.wait_for_timeout(200)
        await pg.click('#concluir'); await pg.wait_for_selector('#obNovo'); await pg.wait_for_timeout(600); await audit(pg,'obrigado')
        await b.close()
asyncio.run(main()); srv.terminate()
for k,v in res.items():
    print('==',k, len(v))
    for x in v: print('  ',x['impact'],x['id'],x['n'],'|',x['help'],'|',x['ex'][:1])
