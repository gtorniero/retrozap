import asyncio, subprocess, time, sys, os
from playwright.async_api import async_playwright
PUB = sys.argv[1]; SHOTS = sys.argv[2]
os.makedirs(SHOTS, exist_ok=True)
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765', '-d', PUB], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
async def revelar(pg):
    if await pg.query_selector('#rvl'): await pg.click('#rvl'); await pg.wait_for_timeout(2400)
    elif await pg.query_selector('.opt'): await pg.click('.opt')
    await pg.wait_for_timeout(300)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=1)
        erros = []
        pg.on('pageerror', lambda e: erros.append('PAGEERROR ' + str(e)))
        pg.on('console', lambda m: erros.append('CONSOLE ' + m.text) if m.type == 'error' and 'googlesyndication' not in m.text and 'ERR_' not in m.text and 'Failed to load resource' not in m.text else None)
        await pg.goto('http://localhost:8765/'); await pg.wait_for_timeout(600)
        await pg.click('.cookies button')
        await pg.screenshot(path=f'{SHOTS}/0-inicio.png', full_page=True)
        await pg.click('#comecar'); await pg.wait_for_selector('#demo'); print('rota comecar:', pg.url)
        await pg.screenshot(path=f'{SHOTS}/1-home.png', full_page=True)
        await pg.click('#voltar'); await pg.wait_for_selector('#comecar'); print('voltar do comecar ->', pg.url)
        await pg.click('#comecar'); await pg.wait_for_selector('#demo')
        await pg.click('#demo'); await pg.wait_for_selector('#go', timeout=15000); await pg.wait_for_timeout(300)
        print('rota turma:', pg.url); await pg.screenshot(path=f'{SHOTS}/2-turma.png', full_page=True)
        await pg.click('[data-open]'); await pg.wait_for_timeout(200)
        await pg.click('#go'); await pg.wait_for_selector('.persona', timeout=20000); await pg.wait_for_timeout(1500)
        print('rota conhecendo:', pg.url); await pg.screenshot(path=f'{SHOTS}/3-conhecendo.png', full_page=True)
        print('titulos:', await pg.eval_on_selector_all('.perso h3', 'es => es.map(e => e.textContent)'))
        await pg.click('#go'); await pg.wait_for_timeout(300); print('rota categorias:', pg.url)
        await pg.wait_for_selector('#spNao'); await pg.screenshot(path=f'{SHOTS}/4-spoiler.png'); await pg.click('#spNao'); await pg.wait_for_timeout(200)
        await pg.screenshot(path=f'{SHOTS}/5-categorias.png', full_page=True)
        await pg.click('#go'); await pg.wait_for_timeout(300)
        n = 0
        while '/premios/' in pg.url and n < 30:
            n += 1
            await revelar(pg)
            if n == 1:
                await pg.screenshot(path=f'{SHOTS}/6-premio.png', full_page=True)
                await pg.click('#card'); await pg.wait_for_timeout(800)
                await pg.screenshot(path=f'{SHOTS}/7-card.png')
                await pg.click('#cl')
            await pg.click('#next'); await pg.wait_for_timeout(300)
        print('premios revelados:', n, 'rota:', pg.url)
        i = 0
        while await pg.query_selector('#rl') and await pg.is_visible('#rl') and i < 15:
            i += 1; await pg.click('#rl'); await pg.wait_for_timeout(1300)
            if i == 2: await pg.screenshot(path=f'{SHOTS}/8a-fato.png', full_page=True)
        await pg.wait_for_selector('#concluir', timeout=8000); await pg.wait_for_timeout(1500)
        print('rota fim:', pg.url, '| imagens:', await pg.eval_on_selector_all('.card-fim figcaption', 'es => es.map(e => e.textContent)'))
        await pg.screenshot(path=f'{SHOTS}/8b-fim.png', full_page=True)
        await pg.click('#sv3'); await pg.wait_for_timeout(1200); await pg.screenshot(path=f'{SHOTS}/13-top10.png'); await pg.click('#cl'); await pg.wait_for_timeout(200)
        # categorias extras (grupo de exemplo: liberadas sem pagar)
        if await pg.query_selector('#mais'):
            await pg.click('#mais'); await pg.wait_for_timeout(600); print('bonus:', pg.url)
            nb = 0
            while '/premios/' in pg.url and nb < 10:
                nb += 1; await revelar(pg); await pg.click('#next'); await pg.wait_for_timeout(300)
            print('bonus revelados:', nb, 'volta para:', pg.url)
        await pg.wait_for_selector('#concluir'); await pg.click('#concluir'); await pg.wait_for_selector('#obNovo')
        await pg.screenshot(path=f'{SHOTS}/9-obrigado.png')
        print('presente no pop-up?', await pg.query_selector('#obPres') is not None)
        await pg.click('#obNovo'); await pg.wait_for_selector('#demo')
        print('fazer de novo ->', pg.url)
        # páginas legais e blog
        for u in ['/privacidade.html','/blog/index.html','/blog/como-exportar-conversa-whatsapp.html']:
            r = await pg.goto('http://localhost:8765' + u); print(u, r.status)
        await pg.screenshot(path=f'{SHOTS}/11-blog.png', full_page=True)
        print('ERROS:', [e for e in erros if 'adsbygoogle' not in e][:10])
        await b.close()
asyncio.run(main()); srv.terminate()
