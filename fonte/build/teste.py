import asyncio, subprocess, time, sys, os
from playwright.async_api import async_playwright
PUB = sys.argv[1]; SHOTS = sys.argv[2]
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765', '-d', PUB], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width':390,'height':844}, device_scale_factor=1)
        erros = []
        pg.on('pageerror', lambda e: erros.append('PAGEERROR ' + str(e)))
        pg.on('console', lambda m: erros.append('CONSOLE ' + m.text) if m.type == 'error' and 'googlesyndication' not in m.text and 'ERR_' not in m.text and 'Failed to load resource' not in m.text else None)
        await pg.goto('http://localhost:8765/'); await pg.wait_for_timeout(600)
        await pg.screenshot(path=f'{SHOTS}/1-home.png', full_page=True)
        await pg.click('.cookies button')
        await pg.click('#demo'); await pg.wait_for_selector('#go', timeout=15000); await pg.wait_for_timeout(300)
        print('rota turma:', pg.url); await pg.screenshot(path=f'{SHOTS}/2-turma.png', full_page=True)
        # juntar duplicado
        await pg.click('[data-open]'); await pg.wait_for_timeout(200)
        await pg.click('#go'); await pg.wait_for_selector('.persona', timeout=20000); await pg.wait_for_timeout(1500)
        print('rota prologo:', pg.url); await pg.screenshot(path=f'{SHOTS}/3-prologo.png', full_page=True)
        await pg.screenshot(path=f'{SHOTS}/4-numeros.png', full_page=True)
        await pg.click('#go'); await pg.wait_for_timeout(300); print('rota categorias:', pg.url)
        if await pg.query_selector('#patroFecha'):
            await pg.screenshot(path=f'{SHOTS}/5b-patrocinio.png'); await pg.click('#patroFecha'); await pg.wait_for_timeout(200); print('patrocinio ok')
        await pg.screenshot(path=f'{SHOTS}/5-categorias.png', full_page=True)
        await pg.click('#go'); await pg.wait_for_timeout(300)
        n = 0
        while '/premios/' in pg.url and n < 30:
            n += 1
            if await pg.query_selector('#rvl'): await pg.click('#rvl'); await pg.wait_for_timeout(2400)
            elif await pg.query_selector('.opt'): await pg.click('.opt')
            elif await pg.query_selector('#all'): await pg.click('#all')
            elif await pg.query_selector('#ck'): await pg.click('#ck')
            await pg.wait_for_timeout(300)
            if n == 1:
                await pg.screenshot(path=f'{SHOTS}/6-premio.png', full_page=True)
                await pg.click('#card'); await pg.wait_for_timeout(800)
                await pg.screenshot(path=f'{SHOTS}/7-card.png')
                await pg.click('#cl')
            await pg.click('#next'); await pg.wait_for_timeout(300)
        print('premios revelados:', n, 'rota:', pg.url)
        if await pg.query_selector('#mais'):
            await pg.screenshot(path=f'{SHOTS}/8-bonus.png', full_page=True)
            await pg.click('#pular'); await pg.wait_for_timeout(500)
        if await pg.query_selector('#rl'):
            print('rota resumo:', pg.url)
            for k in range(14):
                t = await pg.inner_text('#rl'); await pg.click('#rl'); await pg.wait_for_timeout(1300)
                if k == 2: await pg.screenshot(path=f'{SHOTS}/8a-fato.png', full_page=True)
                if 'Ver o resumo' in t: break
            await pg.wait_for_timeout(2600)
            await pg.screenshot(path=f'{SHOTS}/8b-resumo.png', full_page=True)
            await pg.click('#voltar'); await pg.wait_for_timeout(500); print('voltar do resumo ->', pg.url)
            if await pg.query_selector('#next'): await pg.click('#next'); await pg.wait_for_timeout(500)
            for k in range(14):
                t = await pg.inner_text('#rl'); await pg.click('#rl'); await pg.wait_for_timeout(300)
                if 'Ver o resumo' in t: break
            await pg.wait_for_timeout(2600)
            await pg.click('#vf'); await pg.wait_for_timeout(500)
        print('rota final:', pg.url)
        await pg.screenshot(path=f'{SHOTS}/9-campeao.png', full_page=True)
        await pg.click('#rs'); await pg.wait_for_timeout(1200)
        src = await pg.eval_on_selector('.modal img', 'i => i.src')
        import base64; open(f'{SHOTS}/12-resumo.png','wb').write(base64.b64decode(src.split(',')[1]))
        await pg.click('#cl'); await pg.wait_for_timeout(200)
        await pg.click('#t10'); await pg.wait_for_timeout(1200)
        src = await pg.eval_on_selector('.modal img', 'i => i.src')
        open(f'{SHOTS}/13-top10.png','wb').write(base64.b64decode(src.split(',')[1]))
        await pg.click('#cl'); await pg.wait_for_timeout(200)
        if await pg.query_selector('#mais'):
            await pg.click('#mais'); await pg.wait_for_timeout(300); print('bonus:', pg.url)
            nb = 0
            while '/premios/' in pg.url and nb < 15:
                nb += 1
                if await pg.query_selector('#rvl'): await pg.click('#rvl'); await pg.wait_for_timeout(2400)
                elif await pg.query_selector('.opt'): await pg.click('.opt')
                await pg.wait_for_timeout(300)
                await pg.click('#next'); await pg.wait_for_timeout(300)
            print('bonus revelados:', nb, 'rota:', pg.url)
        elif await pg.query_selector('#vp'): await pg.click('#vp'); await pg.wait_for_timeout(400)
        await pg.screenshot(path=f'{SHOTS}/9b-personagens.png', full_page=True)
        print('titulos:', await pg.eval_on_selector_all('.perso h3', 'es => es.map(e => e.textContent)'))
        if await pg.query_selector('section #cp'):
            await pg.click('section #cp'); await pg.wait_for_timeout(300); print('custom:', pg.url)
            await pg.click('.pronta'); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f'{SHOTS}/10-crie.png', full_page=True)
            await pg.go_back(); await pg.wait_for_timeout(300); print('voltar ->', pg.url)
        else: print('sem crie sua categoria')
        # páginas legais e blog
        for u in ['/privacidade.html','/blog/index.html','/blog/como-exportar-conversa-whatsapp.html']:
            r = await pg.goto('http://localhost:8765' + u); print(u, r.status)
        await pg.screenshot(path=f'{SHOTS}/11-blog.png', full_page=True)
        print('ERROS:', [e for e in erros if 'adsbygoogle' not in e][:10])
        await b.close()
asyncio.run(main()); srv.terminate()
