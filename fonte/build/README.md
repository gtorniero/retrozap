# Retrozap V2 · Cloudflare Worker

Site estático (pasta `public`) + uma rota de servidor (`/api/stats`) para o ranking entre grupos.
Roda como **Cloudflare Worker** ligado a este repositório: cada push na `main` publica sozinho (`npx wrangler deploy`).

```
public/                   ← o site (páginas, fontes, ícones, blog, _headers)
src/index.js              ← o Worker: serve o site e responde /api/stats
functions/api/stats.js    ← lógica do ranking (só números anônimos)
wrangler.jsonc            ← configuração (nome do Worker, pasta do site, banco D1)
```

## Banco de dados
O banco D1 `retrozap` (variável `DB`) é criado sozinho na primeira publicação. A tabela é criada na primeira chamada.
O ranking só aparece quando houver pelo menos 200 grupos do mesmo tipo (`MIN_AMOSTRA` em `functions/api/stats.js`).

## Privacidade
As mensagens são lidas só no navegador de quem usa. `/api/stats` recebe apenas números do grupo inteiro, nunca nomes ou textos, e só quando a pessoa deixa marcada a opção "Comparar meu grupo com outros grupos".
