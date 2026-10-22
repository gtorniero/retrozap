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
`/` início → `/comecar` → `/turma` (+ cobrança a partir do 2º grupo) → `/conhecendo` **Ato I**: classificação, gráfico de mensagens ano a ano e resumo desde o início (mensagens + Top X% desde o início, áudios + Top X% + quem mais manda, páginas + horas para ler, frase mais dita, gíria) → `/categorias` + `/premios/N` **Ato II** (amigos: Tagarela, Podcaster, Boca-Suja, Rei do Kkkk (% de risada), Puxa-Assunto, Fantasma, Coração Mole, Arrependido; sem categorias extras) → `/resumo` **Ato III · Gran Finale**: nosso 2026 (mensagens, áudios, risadas com vs anos anteriores e Top X%, assunto mais falado, Top 3 destaques: tagarela, revelação, fantasma; o vídeo saiu do Ato III) → `/fim` abre com **Mídias do grupo/de vocês** (carrossel com itens que espiam, setas nas laterais e Anterior/Próximo embaixo: vídeo, Troféus, Resumo, Nós dois no casal, Nosso 2026), depois **"Ainda não acabou!"** com Categorias extras (categoria livre) e personagens (1 grátis, resto Premium com cadeado) → "Concluir". Rodapé com a assinatura Beyond the Work (branca) só nas páginas de conteúdo (pages.py), não no app. Categoria livre: 5 tentativas. Pop-up "Agora é a hora" (spoiler) ao entrar nas categorias, uma vez por retrospectiva. Compartilhar leva texto com link de origem (?de=trofeu|spoiler|resumo|video|convite, &m=casal) e quem chega por ele vê "Agora é a vez do seu"; evento GA4 chegou_de_compartilhamento. Top X% de mensagens sempre aparece.
Regras (21/10): risada inclui hihi, hauahau e 😂🤣😆😹; "O Arrependido" virou "Apaga Mensagens"; sem mecânica de arrasto (chute → palpite); Escritório Paralelo só com dia útil 3× o fim de semana e 60%+ das mensagens 9h–18h em dia útil; id do ranking = data/hora da 1ª mensagem + modo, e o servidor compara antes de gravar; chamadas perdidas não contam, "<mensagem editada>" sai do texto, enquete/contato/localização = mídia, avisos de sistema em inglês reconhecidos; categoria por contagem precisa de vencedor 5+ e grupo 10+, senão entra reserva (RESERVAS por modo); empate técnico mostra os dois nomes; Puxa-Assunto ignora pausas na noite (0h–7h) e exige resposta em 30 min; dia do Despertador/Madrugador começa às 5h; saíram Classificados, Achados e Perdidos, Mãe Coruja e Síndico; troféus do vídeo calculados só com 2026 (buildAwards(compD, true)); taxa só em Boca-Suja (por 100 msgs) e Rei do Kkkk (%), concorre quem tem 100+ textos (ou 5% do grupo, mín. 30) e 3+ ocorrências; Fantasma só quem está há 6+ meses e não é número; Fantasma 2026 inclui quem tem 0 em 2026 (entrou antes de 2026); vs anos anteriores = só vs 2025 mesmo período, se o grupo existia em 1/1/2025; apagadas contam "You deleted this message"; Android sem mídia (semTipo) → Inimigo do Texto no lugar de Podcaster/Locutor, "mídias" no lugar de áudios, áudio/figurinha null no ranking; casal: ranking só com 30+ casais reais (sem estimativa), antes "Ranking dos casais em formação". Ranking: "Top X%" só até 50%; de 51% a 90% vira "Mais X que Y% dos grupos"; pior ou sem base (menos de 10 para comparar, o servidor omite) não aparece. Antiguidade: "Mais antigo que Y%" (casal: "Juntos há mais tempo que Y%"). Top X% desde o início: o site manda `hist_total` e `hist_audios`; `stats.js` compara com o histórico (envios antigos sem `base` contam pelo total).
Regras (22/10): personagens com título único (traço forte → traço leve 5+ → reservas Pilar/Observador/Sempre On/Parceiro de Conversa/Gente Boa/Equilibrado, cada uma 1 vez); "(a)" nos títulos fica como está; turma com 5+ números sem nome agrupa em `<details>` "+N números sem nome" (com "Tirar todos") e, com 13+ pessoas, botão de começar também no topo (`#go2`); recarregar retoma a tela (conversa no IndexedDB `retrozap`, tela em sessionStorage `rz_tela`, escolhas em `rz_esc`; aba nova apaga; Concluir apaga); grupo pequeno (até 5 pessoas): mínimo do vencedor 3 e do grupo 5, e completa até 6 categorias (do modo, depois EXTRAS_OK; EXTRAS_FORA nunca volta); botão "TOP categorias" sem número.
Barra fixa de botões (Revelar/Pular) sobe acima do aviso de cookies e do anúncio âncora do Google (`ajustaAcao`).

## Retrozap Casais (modo `casal`)
Início tem cards Grupos/Casais; `/comecar` passo 1 = grupo ou casal. Casal = tema claro rosa (`html.casal`), 8 categorias (sem Visualiza e Demora, Resposta Relâmpago e Risada Fácil; Podcaster por pódio com fatia; Mil Perguntas 🕵️ = mensagens que terminam em "?", campo `pergunta`), sem destaques, card "Nós dois" (um contra o outro, só 2026: mensagens, áudios, declarações, puxou o papo, mil perguntas), Nosso 2026 junto com 2026 em números, vídeo de ~28s para stories, também para grupos (grupo: abertura → mensagens de 2026 + posição no ranking + gráfico ano a ano → troféus em lista, um por vez: Tagarela, Boca-Suja, Puxa-Assunto, Fantasma, Coração Mole → outras métricas → assunto → Revelação só com mais de 5 pessoas; casal: começa nas mensagens + ranking + gráfico, 3 troféus de 3,2 s, um contra o outro lento com Tagarela, Mais romântico, Despertou a conversa e Mais boa noite (`boanoite`)) (gerado no aparelho em poucos segundos com WebCodecs + mp4-muxer em 720p/24 quadros; sem WebCodecs cai no MediaRecorder em tempo real; prévia grátis, baixar é Premium). Conversa de 2 pessoas no modo grupo pergunta "É um casal?". Ranking: casal só compara com casais (mín. 10); grupos nunca com casais.
**Premium:** personagens (1 grátis, resto embaçado), categoria livre (embaçada com cadeado), baixar o vídeo, grupos ilimitados, sem anúncios. Versão de teste: publicar `zapped.html` como Artifact; fora do site oficial aparece a chave 🧪 Grátis/Premium e o Pix é simulado (`?plano_teste=1` só vale em localhost).
LGPD: aviso de cookies com Aceitar / Só o essencial (Consent Mode v2: anúncio personalizado só com Aceitar). Controladora: BEYOND THE WORK PORTAIS DE CONTEUDO NA INTERNET LTDA (fantasia Beyond the Work Ideas), CNPJ 69.746.447/0001-00, R. Pais Leme 215 cj 1713, Pinheiros, SP; aparece em privacidade, termos, contato, rodapé das páginas e rodapé do início.

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
