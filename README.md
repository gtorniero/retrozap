# Retrozap · site de produção

Site estático (HTML, CSS e JavaScript puros) + uma função pequena de servidor para a comparação entre grupos.
Hospedagem: Cloudflare Pages, ligado a este repositório do GitHub. Cada atualização no repositório publica o site sozinha.

```
public/                   ← o site (páginas, fontes, ícones, blog, _headers, _redirects)
functions/api/stats.js    ← comparação entre grupos ("Top 5% em mensagens"), só números anônimos
```

## Configuração na Cloudflare (uma vez)

1. **Workers & Pages > Create > Pages > Connect to Git** e escolha este repositório.
   - Framework preset: **None** · Build command: **vazio** · Build output directory: **public**
2. **Storage & Databases > D1 > Create database**, nome **retrozap**.
3. No projeto Pages: **Settings > Bindings > Add > D1 database**, variável **DB**, banco **retrozap**. Salve.
4. **Deployments > (último deploy) > ⋯ > Retry deployment**, para o banco passar a valer.

A tabela do banco é criada sozinha. A comparação só aparece no site quando houver pelo menos 200 grupos do mesmo tipo (ajuste em `MIN_AMOSTRA`, no `functions/api/stats.js`).

## Privacidade

As mensagens são lidas só no navegador de quem usa. A função `/api/stats` recebe apenas números (tipo de grupo, total de mensagens, média por dia, recorde em um dia, áudios, figurinhas, integrantes, dias), nunca nomes ou textos, e só quando a pessoa deixa marcada a opção "Comparar meu grupo com outros grupos".

## Opcional

- **Google Analytics 4:** troque `G-XXXXXXXXXX` no `public/index.html` (CONFIG).
- **Search Console:** envie `https://retrozap.com.br/sitemap.xml`.
