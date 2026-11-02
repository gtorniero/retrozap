# Retrozap · Guia de identidade visual (Identidade 2)

Versão 2 · novembro de 2026 · no ar em retrozap.com.br desde 31/10/2026.
Este guia é para qualquer pessoa ou agente (Claude, DOT, designer) que vá criar conteúdo para redes sociais ou mexer no site. Se algo aqui conflitar com o site no ar, o site no ar vale e este guia deve ser corrigido.

---

## 1. A marca em uma frase

**Retrozap transforma a conversa do seu grupo (ou do casal) de WhatsApp numa cerimônia de premiação.** Tudo acontece no celular da pessoa; nenhuma mensagem sai do aparelho.

- Assinatura principal: **"Seu 2026, premiado."** (casal: **"O 2026 de vocês, premiado."**)
- Provocação de fechamento (rodapé dos cards): **"e o seu grupo? retrozap.com.br"** / casal: **"e o de vocês? retrozap.com.br"**
- Frase de apoio: **"Todo grupo tem uma história."** / casal: **"Toda história de amor merece um troféu."**
- Nunca descrever o produto como "Wrapped" (risco de marca). Use "retrospectiva", "cerimônia", "premiação".

---

## 2. Logo

### 2.1 Símbolo: a taça que fala
Uma taça de troféu cujo bojo tem **três pontinhos de "digitando..."** do chat. É o único símbolo da marca (substituiu o emoji 🏆 e o balão antigo).

SVG oficial (viewBox 120×120; troque `F` pela cor da taça e `D` pela cor dos pontinhos):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <path d="M30 14h60a8 8 0 0 1 8 8v26a38 38 0 0 1-76 0V22a8 8 0 0 1 8-8z" fill="F"/>
  <path d="M22 24H12v14a20 20 0 0 0 16 20M98 24h10v14a20 20 0 0 1-16 20" stroke="F" stroke-width="8" fill="none" stroke-linecap="round"/>
  <rect x="52" y="84" width="16" height="14" fill="F"/>
  <rect x="34" y="98" width="52" height="14" rx="6" fill="F"/>
  <circle cx="43" cy="46" r="7" fill="D"/>
  <circle cx="60" cy="46" r="7" fill="D"/>
  <circle cx="77" cy="46" r="7" fill="D"/>
</svg>
```

No site a função é `logoSVG(f, d)` em `fonte/zapped.html`; o mesmo desenho está em `ICONES['🏆']`, `fonte/build/trofeu.svg` (favicon/OG) e `fonte/marca/v2/icones-grupo/marca.svg`.

### 2.2 Combinações de cor permitidas

| Uso | Taça (F) | Pontinhos (D) | Fundo |
|---|---|---|---|
| Grupo, padrão | Manga `#FFC23C` | Noite `#1A0B2E` | Noite `#1A0B2E` |
| Grupo, invertido | Noite `#1A0B2E` | Manga `#FFC23C` | Manga `#FFC23C` |
| Casal, padrão | Cereja `#E0245E` | Creme `#FFF3EC` | Creme `#FFF3EC` |
| Casal sobre rosa | Vinho `#5E0B2B` | Rosa `#FF4F8B` | Rosa `#FF4F8B` |
| Dentro de botão | `currentColor` (cor do texto do botão) | cor de fundo do botão | — |

Regra: os pontinhos **sempre** têm a cor do fundo onde a taça está (parecem "furos").

### 2.3 Assinatura (lockup)
Taça + palavra **retrozap** em minúsculas, Bricolage Grotesque 800, letter-spacing −0,02em, mesma cor da taça. Taça com ~1,15× a altura da fonte, espaço de ~0,3em entre taça e palavra. Nada ao lado (as "barras" antigas do cabeçalho foram removidas).

### 2.4 Foto de perfil
Taça Manga sobre fundo Noite, centralizada, ocupando ~60% do quadro (o círculo do Instagram corta as bordas). Arquivos: `retrozap-perfil-trofeu.svg` no Drive.

### 2.5 Não fazer
- Não usar o emoji 🏆 como logo, nem a taça com degradê, brilho, sombra ou contorno.
- Não esticar, girar ou trocar os 3 pontinhos por outro símbolo.
- Não usar roxo no modo casal.
- Não escrever "RetroZap", "Retro Zap" ou "RETROZAP" no logo: é sempre **retrozap** (no texto corrido, "Retrozap").

---

## 3. Cores

Cor chapada, sem degradê e sem confete de fundo. Duas "casas": **Grupo** (noite, escura) e **Casal** (creme, clara).

### 3.1 Casa Grupo (padrão)

| Nome | HEX | Variável CSS | Uso |
|---|---|---|---|
| Noite | `#1A0B2E` | `--noite` | fundo principal, texto sobre amarelo |
| Açaí | `#3D1A5C` | `--acai` | cartões, caixas, chips |
| Açaí 2 | `#2A1242` | `--acai-2` | caixas secundárias, itens desligados |
| Linha | `#4E2E6E` | `--linha` | bordas, divisórias |
| Manga | `#FFC23C` | `--manga` | destaque principal, botões, logo, números grandes |
| Chiclete | `#FF4F8B` | `--chiclete` | destaque secundário, tags |
| Goiaba | `#FF7A59` | `--goiaba` | fundo de ícones, apoio |
| Piscina | `#2EC4F1` | `--piscina` | fundo de ícones, apoio |
| Uva | `#A98BFF` | `--uva` | fundo de ícones, Fantasma/Procura-se |
| Areia | `#FFF4E0` | `--areia` | texto sobre escuro, fundos claros (jornal, como funciona) |
| Neblina | `#B9A8CC` | `--neblina` | texto secundário sobre escuro |

### 3.2 Casa Casal (`html.casal` no site)

| Nome | HEX | Uso |
|---|---|---|
| Creme | `#FFF3EC` | fundo principal |
| Rosa claro | `#FFD6E2` | caixas, cartões |
| Rosa claríssimo | `#FFE6EC` | caixas secundárias |
| Linha rosa | `#F4C3D1` | bordas |
| Rosa | `#FF4F8B` | fundo de destaque (Recibo), ícones |
| Cereja | `#E0245E` | logo, destaque grande |
| Cereja acessível | `#CC1D59` | botões e texto pequeno (passa contraste AA) |
| Cereja escuro | `#B5174D` | selos pequenos com texto creme |
| Vinho | `#5E0B2B` | texto principal, fundos escuros do casal |
| Vinho suave | `#87445C` | texto secundário |
| Pêssego | `#FFB59A` · `#FFE3D3` · `#FFC9D6` | fundos de ícones do casal |

**Proibido no casal:** roxo, Noite `#1A0B2E` e Manga como cor principal.

### 3.2.1 Exceção: Top Brasil (ranking)
O card/selo "TOP BRASIL" (só aparece quando o grupo ou casal está no Top 10% do Brasil) usa uma paleta própria, só nele:
- Grupo: verde Brasil `#0E4D33` / `#16613F` / `#2E6B4F`, amarelo `#FFD84D`, papel `#F5F1E8`, verde claro `#BFD8C8`. Selo no site: fundo `#0E4D33`, texto `#FFD84D`.
- Casal: creme `#FFF3EC`, vinho `#5E0B2B`, cereja `#E0245E`, rosa `#FFD6E2` / `#F2C6D3`, `#8A3A55`.
Não usar o verde fora do Top Brasil.

### 3.3 Pares de contraste aprovados (texto/fundo)
- Areia sobre Noite · Manga sobre Noite · Noite sobre Manga · Noite sobre Piscina · Noite sobre Uva · Noite sobre Chiclete · Noite sobre Areia
- Vinho sobre Creme · Vinho sobre Rosa · Creme sobre Vinho · Creme sobre Cereja acessível `#CC1D59` / `#B5174D`
- Evitar: Creme sobre `#E0245E` em texto pequeno (fica abaixo de AA), Areia sobre Manga, Manga sobre Areia.

### 3.4 Tokens em código (copiar)
```json
{
  "grupo": {"fundo":"#1A0B2E","txt":"#FFF4E0","dest":"#FFC23C","destTxt":"#1A0B2E","sub":"#B9A8CC","caixa":"#3D1A5C","caixa2":"#2A1242","linha":"#4E2E6E",
            "apoio":{"chiclete":"#FF4F8B","goiaba":"#FF7A59","piscina":"#2EC4F1","uva":"#A98BFF"}},
  "casal": {"fundo":"#FFF3EC","txt":"#5E0B2B","dest":"#CC1D59","destTxt":"#FFF3EC","sub":"#87445C","caixa":"#FFD6E2","caixa2":"#FFE6EC","linha":"#F4C3D1",
            "apoio":{"rosa":"#FF4F8B","cereja":"#E0245E","pessego":"#FFB59A"}}
}
```
(É o mesmo objeto `K2()` usado nos cards em canvas.)

---

## 4. Tipografia

| Papel | Fonte | Peso | Detalhes |
|---|---|---|---|
| Títulos, números, logo | **Bricolage Grotesque** | 800 (500 em raros subtítulos) | letter-spacing −0,02 a −0,035em; entrelinha 0,95–1,05 |
| Texto, botões, rótulos | **DM Sans** | 400 / 500 / 700 | entrelinha 1,3–1,5 |
| Recibos, extratos, "máquina de escrever" | **DM Mono** (redes) / `ui-monospace, Menlo, Consolas` (site) | 400–500 | só em formatos de recibo, boletim, ficha |

- Google Fonts: `Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800` e `DM+Sans:wght@400;500;700`. No site publicado as fontes vêm de `/assets/bricolage.woff2` e `/assets/dmsans-*.woff2`.
- Rótulo/eyebrow: DM Sans 700, CAIXA ALTA, letter-spacing 0,16–0,18em, pequeno, na cor de destaque.
- Títulos curtos e grandes; ponto final em frases de efeito ("premiado.").
- Uma palavra em destaque de cor por título, no máximo (ex.: "Seu 2026, **premiado.**" em Manga).

---

## 5. Ícones

- Sistema próprio de **69 ícones** por casa, desenhados para substituir emoji. Estilo: quadrado arredondado colorido (raio 34 num viewBox −10…130), desenho chapado, contorno de 6px.
  - Grupo: contorno Noite `#1A0B2E`, preenchimento Areia `#FFF4E0`, fundos Piscina, Uva, Chiclete, Goiaba e Manga.
  - Casal: contorno Vinho `#5E0B2B`, preenchimento Rosa/Cereja, fundos `#FFD6E2`, `#FFC9D6`, `#FFE3D3`, `#FFB59A`.
- Arquivos: `fonte/marca/v2/icones-grupo/*.svg`, `fonte/marca/v2/icones-casal/*.svg`, folhas `folha-grupos.svg` e `folha-casais.svg` (também no Drive da marca).
- Principais: Tagarela = `speech-balloon`, Fantasma = `ghost`, Rei do Kkkk = `face-with-tears-of-joy`, Boca-Suja = `serious-face-with-symbols-covering-mouth`, Podcaster = `studio-microphone`, Coração Mole = `heart-hands`, Puxa-Assunto = `high-voltage-sign`, Apaga Mensagens = `wastebasket`, Privacidade = `lock`, Casal = `two-hearts`, Recibo = `receipt`, Mais Romântico = `heart-with-arrow`.
- Medalhas do pódio: `medalha-1.svg`, `medalha-2.svg`, `medalha-3.svg`.
- **Emoji nunca aparecem desenhados** em artes, cards ou telas. No site, todo emoji em texto é trocado por ícone (`trocaIcones`) e escondido de leitor de tela. Em legendas de post e mensagens de texto, emoji pode.

---

## 6. Elementos e componentes

- **Cantos:** cartões 20–40px (`--raio:20px` no site), botões e tags totalmente arredondados (pílula).
- **Botão principal:** pílula Manga com texto Noite (casal: Cereja `#CC1D59` com texto Creme). Secundário: pílula Açaí com borda Linha.
- **Tag / etiqueta:** pílula pequena, DM Sans 700. Ex.: "Mídia especial", "Rara: só no Top 10%", "Troféu 3 de 8".
- **Selo do vencedor:** nome em Bricolage 800 dentro de um retângulo Manga levemente inclinado (casal: Cereja com texto Creme).
- **Pódio:** 1º Manga, 2º Chiclete, 3º Uva, com medalhas 1-2-3 em cima.
- **Duelo do casal:** duas colunas, quem ganhou fica em Cereja, o outro em Vinho; coração no meio.
- **Sombras:** só a sombra suave de "papel" em cards inclinados (0 30px 60px rgba(26,11,46,.35)). Nada de brilho ou glow.
- **Proibido:** degradê, confete de fundo, glassmorphism, neon, texto com contorno, fotos de banco de imagem.

---

## 7. Formatos de conteúdo (redes sociais)

| Formato | Tamanho | Área segura |
|---|---|---|
| Post do feed | 1080×1350 (4:5) | margem 70–80px; grade mostra 3:4 |
| Story / destaque | 1080×1920 | sem texto nos 220px de cima e nos 300px de baixo |
| Reels | 1080×1920, 30 fps, MP4 H.264 | sem texto nos 250px de cima e 350px de baixo; 15–21s |
| Capa de reel | 1080×1920 com a arte 4:5 centralizada (faixas de 285px da mesma cor em cima e embaixo) |
| Capa de destaque | 1080×1920, ícone de ~600px no centro, fundo chapado |
| Foto de perfil | 1080×1080, taça ~60% |
| Cards do site | 1080×1920 (9:16), gerados em canvas |

**Estrutura padrão de uma arte:** assinatura no topo à esquerda → eyebrow → título grande → conteúdo (card do site, lista ou número) → rodapé com **retrozap.com.br** (ou a provocação "e o seu grupo?").

**Mapa de cores por tema** (o que já está em uso):
- Lançamento / marca: Noite + Manga
- Como funciona / dicas: Areia ou Manga + Noite
- Grupos: Piscina + Noite
- Casais: Creme/Rosa + Vinho/Cereja
- Troféus: Noite + Manga
- Fantasma / Procura-se: Uva + Noite
- Privacidade: Noite + Manga, com Areia de apoio
- Dúvidas: Uva + Noite

**Dados de exemplo (únicos permitidos em material público):** grupo "Turma do Churras" (Pedrão, Lu, Bia, Caio, Rafa, Juninho), casal "Dani & Cris", grupo "Resenha da Facul" (gravações de tela). **Nunca** usar nomes, mensagens ou números de conversas reais, nem de testes com chats de amigos.

**Música:** os vídeos saem sem som; a música é escolhida no próprio Instagram/TikTok (áudio em alta).

---

## 8. Voz e texto

- Português do Brasil, informal, frases curtas, humor de grupo de amigos. Ex.: "Visualiza, não responde, some há meses. O Retrozap encontra."
- Sempre deixar claro: **funciona no celular, em 2 minutos, e a conversa não sai do aparelho.**
- Preço (quando citar): **1º grupo grátis**; acesso completo **R$ 8,99, no Pix ou no cartão** (preço único desde 01/11/2026), pagamento único: grupos ilimitados, casal, mídias especiais, personagens, vídeo para baixar, sem anúncios. **Casal é sempre pago.** Confira o preço atual em `CLAUDE.md` antes de publicar.
- Privacidade: dizer "nenhuma mensagem, nome ou telefone sai do seu celular; só números anônimos do grupo inteiro vão para o ranking, e só se você deixar". Não prometer mais que isso.
- Empresa: Beyond the Work Ideas (BEYOND THE WORK PORTAIS DE CONTEUDO NA INTERNET LTDA), CNPJ 69.746.447/0001-00, São Paulo.
- Nomes das categorias como no site: O Tagarela, Podcaster do Grupo, Boca-Suja, Rei(nha) do Kkkk, Puxa-Assunto, O Fantasma, Coração Mole, Apaga Mensagens. Casal: Tagarela do Casal, Mais Romântico(a), Despertador do Amor, Mil Perguntas etc.
- "Mídia especial" = Recibo do amor, Boletim do casal, Horóscopo do casal, Diário da Turma, Procura-se, As mais tocadas. "Urgente / Plantão do Zap" e "Top Brasil" = só quando o grupo (ou casal) está no Top 10% do Brasil em alguma métrica.
- Os números do site são do ano (2026); "desde o início" só aparece no Ato I e nas linhas marcadas assim.
- Os cards novos dizem que são do WhatsApp só em texto (sem logo nem verde do WhatsApp). Nunca usar logo, ícone ou verde da marca WhatsApp nas artes.

---

## 9. Mudanças no site (para agentes)

- **Arquivo principal:** `fonte/zapped.html` (HTML+CSS+JS num arquivo só). Não editar a raiz do repo à mão: ela é gerada.
- **Cores:** variáveis em `:root` (grupo) e `html.casal{...}` (casal), no topo do `<style>`. A camada visual da identidade 2 fica no fim do `<style>` ("identidade 2"). Mude a variável, não a cor solta.
- **Logo:** `logoSVG(f, d)`; o cabeçalho é re-renderizado em `setModo` (grupo Manga/Noite, casal `#E0245E`/`#FFF3EC`).
- **Ícones:** objeto `ICONES` (emoji → SVG por casa) + `trocaIcones()`. Para um novo ícone, desenhe nas duas casas no mesmo estilo e registre no `ICONES`; nunca deixe emoji solto na tela.
- **Cards (canvas 1080×1920):** use `K2()` para cores, `BR2`/`DM2`/`MO2` para fontes, `marcaC()` para o logo, `iconeC()` para ícones, `seloC()` para o selo do vencedor, `rodape3()` para o rodapé. Cada card tem um `alt*` com o texto alternativo.
- **Acessibilidade (WCAG 2.2 AA):** contraste mínimo 4,5:1 em texto pequeno, foco visível Manga, emoji/ícones com `aria-hidden`, nada vazando de caixas em 320px de largura.
- **Fluxo obrigatório:** `git pull` → backup `git push origin main:refs/heads/backup-AAAA-MM-DD` (mudança grande) → editar `fonte/` → `bash build/montar.sh` → `python3 build/teste.py retrozap-site/public /tmp/shots` (ERROS: []) → `python3 a11y.py retrozap-site/public` (0 violações) → teste do casal (`ERROS []`) → copiar para a raiz → commit e push na `main` (Cloudflare publica em ~2 min). Detalhes em `CLAUDE.md` na raiz do repo.
- **Assets:** arquivos em `/assets` têm cache de 1 dia; ao trocar um, mude o nome (ex.: `como-exportar-v1.mp4` → `v2`).

---

## 10. Onde estão os arquivos

- Repositório `gtorniero/retrozap`: `fonte/zapped.html`, `fonte/marca/v2/` (ícones e folhas), `fonte/build/trofeu.svg`, este guia em `fonte/marca/GUIA-IDENTIDADE.md`.
- Drive (pasta de identidade): este guia, `design-tokens.json`, SVGs do logo.
- Drive "Instagram · identidade 2": pack de posts, destaques e reels + legendas.
- Canvas de design "Retrozap Recibos e Formatos Virais" (claude.ai): estudos dos cards virais.
