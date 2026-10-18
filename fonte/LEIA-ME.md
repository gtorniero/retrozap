# Fonte do Retrozap (backup)

Esta pasta guarda os arquivos-fonte que geram o site. Ela **não** é publicada: o Worker só serve `public/`.

- `zapped.html`: o site inteiro (cerimônia, cards, cobrança). É o arquivo principal a editar.
- `build/`: scripts que montam o site final
  - `build.py` gera `public/index.html` a partir de `zapped.html`
  - `pages.py` + `conteudo.py`: páginas (privacidade, termos, blog, FAQ...)
  - `og.py`: imagem de prévia do link e ícones
  - `stats.js`, `ideias.js`, `pix.js`: APIs (ranking, ideias, Pix/Mercado Pago)
  - `worker/`: Worker e `wrangler.jsonc`
  - `teste.py`: teste da cerimônia completa; `../a11y.py`: acessibilidade
- `fontes/package.json`: fontes e bibliotecas usadas no build

## Como remontar o site

Os scripts esperam esta estrutura numa pasta de trabalho:

```
pasta/
  zapped.html
  partygames.jpg
  build/            (esta pasta)
  fontes/           (rodar `npm install` aqui dentro)
```

Depois: `bash build/montar.sh` gera `retrozap-site/`. Copie o conteúdo de `retrozap-site/` para a raiz deste repositório e faça o push: o Cloudflare publica sozinho.

Segredos (como o token do Mercado Pago `MP_TOKEN`) **não** ficam aqui: estão só no Cloudflare.
