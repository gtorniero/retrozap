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
  - APIs: `stats.js` (ranking só com números de 2026, campo `base`; 10+ grupos compara com todos; 30+ do mesmo tipo compara por tipo; casal só com casais, 10+; antiguidade usa o histórico todo), `ideias.js` (sugestões e e-mails de novidades, tipo `novidades`), `pix.js` (cobrança).
  - `fonte/build/worker/`: `index.js` (roteador) e `wrangler.jsonc` (var `COBRANCA`: `ligada`/`teste`/`desligada`).
  - Testes: `fonte/build/teste.py` (cerimônia completa) e `fonte/a11y.py` (axe, acessibilidade).
  - Teste do casal: `python3 build/testes/gera_casal.py` (gera conversa falsa Ana/Bruno) e `python3 build/testes/teste_casal.py retrozap-site/public` (fluxo casal completo, Premium, vídeo; tem que terminar com `ERROS []`). Local: `?plano_teste=1` liga a chave Grátis/Premium.

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
`/` início (cards Grupos/Casais + o que vai encontrar + "Vamos começar") → `/comecar` exportar e escolher arquivo (tutorial animado iPhone/Android, lembrete de privacidade) → `/turma` contatos (+ cobrança a partir do 2º grupo) → `/conhecendo` Ato I: classificação + 5 personagens → `/categorias` → `/premios/N` (10; trabalho tem 8) → `/resumo` fatos + ranking ("Top X%", básicos primeiro, some acima de 90%) → `/fim` seção Para compartilhar (vídeo, resumo, 2026 em números + ranking, top 10, Nós dois), categorias extras, categoria livre, Destaques 2026, "Concluir" → pop-up (e-mail de novidades + presente, fazer outro grupo).

## Retrozap Casais (modo `casal`)
Início tem cards Grupos/Casais; `/comecar` passo 1 = grupo ou casal. Casal = tema claro rosa (`html.casal`), 15 categorias próprias, card "Nós dois" (um contra o outro), vídeo de 20s para stories, também para grupos (MediaRecorder, gerado no aparelho; prévia grátis, baixar é Premium). Conversa de 2 pessoas no modo grupo pergunta "É um casal?". Ranking: casal só compara com casais (mín. 10); grupos nunca com casais.
**Premium:** 2 personagens grátis (resto embaçado), Destaques 2026 (2 grátis), categoria livre (1 palavra), categorias extras. Versão de teste: publicar `zapped.html` como Artifact; fora do site oficial aparece a chave 🧪 Grátis/Premium e o Pix é simulado (`?plano_teste=1` só vale em localhost).
LGPD: aviso de cookies com Aceitar / Só o essencial (Consent Mode v2: anúncio personalizado só com Aceitar). Pendente: nome do controlador na política (Gui decide).

## Cobrança (Mercado Pago, Pix R$ 4,99)
1º grupo grátis; depois paywall. Premium = grupos ilimitados + categorias extras. Código `RZ-XXXX-XXXX` salvo no navegador (`localStorage rz_acesso`); recuperar com código **ou e-mail do Pix**. `?zerar=1` limpa o navegador para testar; `?teste_cobranca=1` só vale com `COBRANCA=teste`. Envio de e-mail (Resend) está pronto mas **desligado** (sem `RESEND_KEY`) — Gui decidiu não usar.
Consultas úteis no D1: `SELECT * FROM compras WHERE modo='ligada' ORDER BY criado DESC;` · `SELECT contato, criado FROM ideias WHERE tipo='novidades';` · `SELECT COUNT(*) FROM grupos;`

## Outros
- Analytics GA4 `G-R8R1EN0KQN` (tag no `<head>` de todas as páginas). AdSense `ca-pub-4039247360984618` + `ads.txt`.
- **Anúncios:** AdSense não carrega para Premium (`rz_acesso`). Blocos prontos e desligados até ter os IDs: `ANUNCIOS = {inicio, categorias, intervalo, fim}` em `zapped.html` e `AD_SLOT_PAGINAS` em `conteudo.py`. Intervalo comercial na metade dos prêmios (contagem de 2s). `?simular_anuncios=1` mostra caixas de exemplo. Pendente: Gui mandar os 5 `data-ad-slot`; depois avaliar Ad Manager (anúncio premiado para baixar o vídeo).
- Parceiro Party Games (cupom RETROZAP, paga 7% das vendas): pop-up de patrocínio pronto mas desligado (`PATROCINIO_ATIVO = false`); presente do pop-up final foi retirado.
- Cache: páginas `no-cache`; `/assets/*` 1 dia. Se mudar um arquivo de /assets, trocar o nome.
- Gui prefere: mudanças aplicadas direto, sem explicar cada detalhe; testar antes de publicar; avisar o que ele precisa fazer no painel (Cloudflare/Mercado Pago) em passos curtos.

## Histórico e estado
Resumo de tudo que foi feito, decisões e pendências: doc `claude/estado-atual-retrozap.md` no Projeto Retrozap (claude.ai). Playbook de lançamento e escala: `claude/playbook-lancamento-escala.md`.
