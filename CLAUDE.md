# Retrozap — guia para o Claude

Site **retrozap.com.br**: lê o export de um grupo de WhatsApp **no navegador** (nada sai do celular) e monta uma cerimônia estilo Wrapped: personagens, 10 categorias com troféus, resumo, ranking comparado a outros grupos e cards para compartilhar. Dono: Gui. Respostas em **português do Brasil**, curtas e diretas.

## Regras que não podem quebrar
- **Privacidade:** nenhuma mensagem, nome ou telefone do grupo sai do aparelho. Só sobem: números anônimos do grupo inteiro (ranking, com opt-in), sugestões/e-mails que a pessoa digita de propósito e dados de compra (e-mail, id, código).
- **Nunca** colocar segredos no repositório. `MP_TOKEN` (Mercado Pago) fica só em Cloudflare > Worker > Settings > Variables and Secrets.
- Antes de qualquer mudança grande, salvar backup: `git push origin main:refs/heads/backup-AAAA-MM-DD` (tags são bloqueadas no ambiente do Claude).
- Outra sessão pode ter dado push: sempre `git pull` antes de editar e de publicar.

## Onde fica cada coisa
- **Raiz do repo = site publicado** (gerado; não editar à mão):
  - `public/` páginas e assets (`index.html` é a cerimônia inteira), `src/index.js` Worker (rotas /api), `functions/api/*.js` APIs, `wrangler.jsonc`.
- **`fonte/` = código-fonte (editar aqui)** — não é publicado:
  - `fonte/zapped.html`: o app inteiro (HTML+CSS+JS num arquivo). **Arquivo principal.**
  - `fonte/build/build.py`: transforma `zapped.html` em `public/index.html` (troca CDN por /assets, injeta `prod_head.js` com Analytics/rotas/cookies, AdSense, rodapé).
  - `fonte/build/pages.py` + `conteudo.py`: páginas (privacidade, termos, FAQ, blog, ideias), `_headers`, sitemap, ads.txt. `COBRANCA_PUBLICA` em conteudo.py controla textos de preço.
  - `fonte/build/og.py`: imagem de prévia e ícones (Playwright).
  - APIs: `stats.js` (ranking: 10+ grupos compara com todos; 30+ do mesmo tipo compara por tipo), `ideias.js` (sugestões e e-mails de novidades, tipo `novidades`), `pix.js` (cobrança).
  - `fonte/build/worker/`: `index.js` (roteador) e `wrangler.jsonc` (var `COBRANCA`: `ligada`/`teste`/`desligada`).
  - Testes: `fonte/build/teste.py` (cerimônia completa) e `fonte/a11y.py` (axe, acessibilidade).

## Como montar e publicar
```sh
cd fonte/fontes && npm install && cd ..        # fontes, jszip, qrcode, axe (1ª vez)
pip install playwright --break-system-packages  # se faltar (Chromium já vem no ambiente)
bash build/montar.sh                           # gera fonte/retrozap-site/
python3 build/teste.py retrozap-site/public /tmp/shots   # tem que terminar com ERROS: []
python3 a11y.py retrozap-site/public           # todas as telas com 0 violações
cp -r retrozap-site/. ../ && rm -rf retrozap-site ../.wrangler   # copia para a raiz
cd .. && git add -A && git commit && git push origin main         # Cloudflare publica sozinho (~1-2 min)
```
Workers Builds (Cloudflare) roda `npx wrangler deploy` a cada push na `main` do `gtorniero/retrozap`. Worker: **retrozap-v2** (domínio retrozap.com.br; www redireciona por Redirect Rule). D1: banco `retrozap` (tabelas `grupos`, `ideias`, `compras`, `envios`).

## Fluxo do site (telas e rotas)
`/` início (o que vai encontrar + "Vamos começar") → `/comecar` exportar e escolher arquivo (tutorial animado iPhone/Android, lembrete de privacidade) → `/turma` contatos (+ cobrança a partir do 2º grupo) → `/conhecendo` Ato I: classificação + 5 personagens → `/categorias` → `/premios/N` (10; trabalho tem 8) → `/resumo` fatos + ranking ("Top X%", básicos primeiro, some acima de 90%) → `/fim` categorias bloqueadas (premium), 3 imagens (resumo, ranking, top 10), "Concluir" → pop-up (e-mail de novidades + presente, fazer outro grupo).

## Cobrança (Mercado Pago, Pix R$ 4,99)
1º grupo grátis; depois paywall. Premium = grupos ilimitados + categorias extras. Código `RZ-XXXX-XXXX` salvo no navegador (`localStorage rz_acesso`); recuperar com código **ou e-mail do Pix**. `?zerar=1` limpa o navegador para testar; `?teste_cobranca=1` só vale com `COBRANCA=teste`. Envio de e-mail (Resend) está pronto mas **desligado** (sem `RESEND_KEY`) — Gui decidiu não usar.
Consultas úteis no D1: `SELECT * FROM compras WHERE modo='ligada' ORDER BY criado DESC;` · `SELECT contato, criado FROM ideias WHERE tipo='novidades';` · `SELECT COUNT(*) FROM grupos;`

## Outros
- Analytics GA4 `G-R8R1EN0KQN` (tag no `<head>` de todas as páginas). AdSense `ca-pub-4039247360984618` + `ads.txt`.
- Parceiro Party Games (cupom RETROZAP, paga 7% das vendas): pop-up de patrocínio pronto mas desligado (`PATROCINIO_ATIVO = false`); presente do pop-up final foi retirado.
- Cache: páginas `no-cache`; `/assets/*` 1 dia. Se mudar um arquivo de /assets, trocar o nome.
- Gui prefere: mudanças aplicadas direto, sem explicar cada detalhe; testar antes de publicar; avisar o que ele precisa fazer no painel (Cloudflare/Mercado Pago) em passos curtos.
