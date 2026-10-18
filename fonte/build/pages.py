import os, json
from PIL import Image, ImageDraw, ImageFont

SCR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SCR, os.environ.get('RZ_OUT', 'retrozap-site')); PUB = os.path.join(OUT, 'public')
SITE = 'https://retrozap.com.br'

CSS = """@font-face{font-family:'Bricolage Grotesque';src:url(/assets/bricolage.woff2) format('woff2');font-weight:200 800;font-display:swap}
@font-face{font-family:'DM Sans';src:url(/assets/dmsans-400.woff2) format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'DM Sans';src:url(/assets/dmsans-700.woff2) format('woff2');font-weight:700;font-display:swap}
:root{--noite:#1A0B2E;--acai:#3D1A5C;--manga:#FFC23C;--areia:#FFF4E0;--neblina:#B9A8CC;--linha:#4E2E6E;color-scheme:dark}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--noite);color:var(--areia);font-family:'DM Sans',system-ui,sans-serif;font-size:17px;line-height:1.7;padding:0 max(16px,env(safe-area-inset-right,0px)) 48px max(16px,env(safe-area-inset-left,0px))}
main,header,footer{max-width:680px;margin:0 auto}
header{padding:18px 0;display:flex;justify-content:space-between;align-items:center}
.logo{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:26px;color:var(--manga);text-decoration:none}
.cta{background:var(--manga);color:var(--noite);border-radius:999px;padding:10px 18px;font-weight:700;text-decoration:none;font-size:15px}
h1,h2{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;line-height:1.1;text-wrap:balance}
h1{font-size:clamp(32px,8vw,46px);margin:16px 0}h2{font-size:24px;margin:32px 0 8px}
a{color:var(--manga)}p,li{color:var(--areia)}.small{color:var(--neblina);font-size:14px}
.cards{display:grid;gap:12px}.card{background:var(--acai);border-radius:16px;padding:16px 18px;text-decoration:none;color:var(--areia);display:block}
.card b{font-family:'Bricolage Grotesque',sans-serif;font-size:20px;display:block;margin-bottom:4px}
footer{display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center;font-size:13px;color:var(--neblina);padding-top:24px;margin-top:40px;border-top:1px solid var(--linha)}
footer a{color:var(--areia)}"""

import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import conteudo
COBRANCA_PUBLICA = conteudo.COBRANCA_PUBLICA
CSS += conteudo.CSS_EXTRA

def page(path, title, desc, body, ad=True):
    url = SITE + '/' + path.replace('index.html', '').replace('.html', '')
    adhtml = ''
    html = f"""<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-R8R1EN0KQN"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', 'G-R8R1EN0KQN', {{anonymize_ip: true}});
</script>
<title>{title} · Retrozap</title><meta name="description" content="{desc}">
<link rel="canonical" href="{url}"><meta name="theme-color" content="#1A0B2E">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:image" content="{SITE}/og-retrozap.png">
<link rel="icon" href="/favicon.png" type="image/png">
<meta name="google-adsense-account" content="ca-pub-4039247360984618">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4039247360984618" crossorigin="anonymous"></script>
<style>{CSS}</style></head><body>
<header><a class="logo" href="/">retrozap 🏆</a><a class="cta" href="/">Fazer o meu grupo</a></header>
<main>{body.replace('<!--AD-->', adhtml)}</main>
<footer><a href="/">Início</a><a href="/como-funciona">Como funciona</a><a href="/perguntas-frequentes">Perguntas frequentes</a><a href="/blog/">Blog</a><a href="/ideias">Envie sua ideia</a><a href="/sobre">Sobre</a><a href="/privacidade">Privacidade</a><a href="/termos">Termos de uso</a><a href="/contato">Contato</a></footer>
</body></html>
"""
    full = os.path.join(PUB, path); os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w', encoding='utf-8').write(html)
    return url

urls = [SITE + '/']

urls.append(page('privacidade.html', 'Política de Privacidade', 'Como o Retrozap trata seus dados: as mensagens do seu grupo nunca saem do seu aparelho. Cookies, anúncios e seus direitos pela LGPD.', """
<h1>Política de Privacidade</h1>
<p class="small">Última atualização: 18 de outubro de 2026</p>
<div class="resumo-priv">
<h2 style="margin-top:0">Resumo em 30 segundos</h2>
<ul>
<li><b>🔒 Suas mensagens ficam no seu aparelho.</b> O arquivo do WhatsApp é lido pelo seu navegador. Nenhuma mensagem, nome ou telefone é enviado para nós.</li>
<li><b>📊 Só números, e só se você quiser.</b> Para comparar seu grupo com outros, enviamos números anônimos do grupo inteiro (como o total de mensagens). Dá para desmarcar.</li>
<li><b>🍪 Cookies de visitas e anúncios.</b> Usamos o Google Analytics para contar visitas e o Google AdSense para exibir anúncios. O Google pode usar cookies para personalizar anúncios, e você pode desativar isso.</li>
<li><b>✉️ Só guardamos o que você manda de propósito:</b> sugestões da página "Envie sua ideia", e-mails para o contato e, se você comprar o acesso ilimitado, o e-mail da compra.</li>
<li><b>💳 Pagamento pelo Mercado Pago.</b> O primeiro grupo é grátis; o acesso ilimitado custa R$ 4,99 no Pix, processado pelo Mercado Pago. Não recebemos dados do seu banco.</li>
<li><b>⚖️ Você tem direitos pela LGPD</b> e pode falar com a gente em <a href="mailto:contato@retrozap.com.br">contato@retrozap.com.br</a>.</li>
</ul>
</div>
<h2>1. Quem somos</h2>
<p>O Retrozap (retrozap.com.br) é um projeto independente de entretenimento, criado em São Paulo, sem relação com o WhatsApp ou a Meta. Somos o controlador dos poucos dados descritos aqui. Contato e encarregado de dados: <a href="mailto:contato@retrozap.com.br">contato@retrozap.com.br</a>.</p>
<h2>2. Suas mensagens não saem do seu aparelho</h2>
<p>Quando você escolhe o arquivo exportado do WhatsApp, a leitura e a análise acontecem inteiramente no seu navegador, como uma calculadora que roda no celular ou no computador. O arquivo, as mensagens, os nomes e os telefones <b>não são enviados aos nossos servidores, não são lidos por pessoas e não são guardados por nós</b>. Ao fechar a página, tudo é descartado. Os cards com os resultados também são gerados no seu aparelho; eles só são compartilhados se você decidir mandar.</p>
<p>Os anúncios e as ferramentas de medição nunca têm acesso ao conteúdo do seu grupo.</p>
<h2>3. Comparação com outros grupos (opcional, só números)</h2>
<p>Se a opção "Comparar meu grupo com outros grupos" estiver marcada na tela da turma, o site envia apenas números anônimos sobre o grupo inteiro: o tipo de grupo, o total de mensagens, a média por dia, o recorde de mensagens em um dia, a quantidade de áudios e de figurinhas, o número de integrantes, o número de dias da conversa e proporções (como a porcentagem de mensagens com risada ou de madrugada, e quantos "bom dia", parabéns, palavrões ou mensagens apagadas aparecem a cada mil mensagens). Junto vai um código gerado a partir desses números, para o mesmo grupo não ser contado duas vezes. Nenhuma mensagem, nome, telefone ou conteúdo é enviado, e não é possível identificar o grupo ou as pessoas a partir desses números. Eles servem só para mostrar frases como "Top 5% mais risonhos entre os grupos de amigos". O grupo de exemplo nunca é enviado. Você pode desmarcar a opção antes de começar.</p>
<h2>4. Sugestões e contato</h2>
<p>Se você usar a página <a href="/ideias">Envie sua ideia</a>, guardamos o texto da sugestão, o tipo e, se você preencher, o e-mail ou WhatsApp para resposta. Usamos esses dados só para avaliar a ideia e responder. Se você escrever para o nosso e-mail, guardamos a conversa para responder. Por favor, não envie mensagens do seu grupo nem dados de outras pessoas.</p>
<h3>Pagamento do acesso ilimitado</h3>
<p>A primeira retrospectiva é grátis. Para fazer outras, o acesso ilimitado custa R$ 4,99, pago uma única vez por Pix. O pagamento é processado pelo Mercado Pago, que trata os dados da transação conforme a <a href="https://www.mercadopago.com.br/privacidade" rel="noopener">política de privacidade do Mercado Pago</a>. Nós guardamos apenas o e-mail informado, o identificador da compra, o valor, a situação do pagamento e o código de acesso gerado. Não recebemos dados da sua conta bancária. Para lembrar que o primeiro grupo já foi feito e que o acesso foi liberado, o site guarda no seu navegador um código curto de cada grupo (calculado a partir da data da primeira mensagem, sem conteúdo) e o código de acesso.</p>
<h2>5. Dados de uso (Google Analytics)</h2>
<p>Usamos o Google Analytics para entender, de forma agregada, quantas pessoas visitam o site, quais páginas acessam e quantas retrospectivas são concluídas. Registramos eventos como "prêmio revelado" ou "card compartilhado", sem nomes, mensagens ou conteúdo do grupo. O Google coleta dados técnicos como endereço IP aproximado, tipo de aparelho e navegador, conforme a <a href="https://policies.google.com/privacy" rel="noopener">política de privacidade do Google</a>.</p>
<h2>6. Cookies e publicidade (Google AdSense)</h2>
<p>Este site exibe anúncios do Google AdSense. Fornecedores terceiros, incluindo o Google, usam cookies para exibir anúncios com base em visitas anteriores do usuário a este e a outros sites. O uso de cookies de publicidade pelo Google permite que ele e seus parceiros exibam anúncios com base nessas visitas a este site e/ou a outros sites na Internet.</p>
<ul><li>Você pode desativar a publicidade personalizada nas <a href="https://adssettings.google.com" rel="noopener">Configurações de anúncios do Google</a>.</li>
<li>Também é possível desativar o uso de cookies de outros fornecedores para publicidade personalizada em <a href="https://www.aboutads.info/choices/" rel="noopener">aboutads.info</a>.</li>
<li>Saiba como o Google usa dados de sites parceiros em <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">policies.google.com/technologies/partner-sites</a>.</li>
<li>Você pode bloquear ou apagar cookies a qualquer momento nas configurações do seu navegador. O site continua funcionando normalmente.</li></ul>
<h2>7. Links de parceiros</h2>
<p>Alguns conteúdos têm links de parceiros, sempre sinalizados. Se você comprar por eles, o Retrozap pode receber uma comissão, sem custo extra para você. Ao sair do Retrozap, vale a política de privacidade do site de destino.</p>
<h2>8. Bases legais (LGPD)</h2>
<ul><li><b>Legítimo interesse:</b> medição de visitas e exibição de anúncios, para manter o site gratuito.</li>
<li><b>Execução de contrato:</b> dados da compra do acesso ilimitado.</li>
<li><b>Consentimento:</b> comparação com outros grupos (opção que você pode desmarcar) e dados que você envia de propósito (sugestões e e-mails).</li></ul>
<h2>9. Por quanto tempo guardamos</h2>
<ul><li>Mensagens do grupo: não guardamos.</li>
<li>Números anônimos da comparação: enquanto o recurso existir, só de forma agregada.</li>
<li>Sugestões e contatos: até 2 anos, ou antes, se você pedir a exclusão.</li>
<li>Dados de compras: pelo prazo exigido pelas leis fiscais e de defesa do consumidor (até 5 anos).</li>
<li>Dados do Google Analytics e do AdSense: pelos prazos definidos pelo Google.</li></ul>
<h2>10. Seus direitos</h2>
<p>Pela LGPD, você pode pedir confirmação de tratamento, acesso, correção, anonimização ou exclusão dos seus dados, informações sobre compartilhamento e revogar consentimentos. É só escrever para <a href="mailto:contato@retrozap.com.br">contato@retrozap.com.br</a>. Como não guardamos as suas mensagens, não há conversa sua armazenada para ser apagada.</p>
<h2>11. Menores de idade</h2>
<p>O Retrozap não é direcionado a menores de 13 anos.</p>
<h2>12. Mudanças nesta política</h2>
<p>Se esta política mudar, a data no topo será atualizada. Mudanças importantes serão avisadas no site.</p>
""", ad=False))

urls.append(page('termos.html', 'Termos de Uso', 'Regras de uso do Retrozap, a premiação dos grupos de WhatsApp.', """
<h1>Termos de Uso</h1>
<p class="small">Última atualização: outubro de 2026</p>
<h2>1. O que é o Retrozap</h2>
<p>O Retrozap é um site de entretenimento que transforma o arquivo exportado de um grupo de WhatsApp em estatísticas, prêmios e cards. Os prêmios são brincadeiras baseadas em contagens automáticas e não são avaliações sérias sobre ninguém.</p>
""" + ('<p><b>Preço:</b> a primeira retrospectiva é grátis. O acesso ilimitado custa R$ 4,99, pago uma única vez por Pix pelo Mercado Pago, e vale para o navegador onde foi liberado (ou outro, com o código de acesso). Se tiver qualquer problema com a compra, escreva para <a href="mailto:contato@retrozap.com.br">contato@retrozap.com.br</a>.</p>' if COBRANCA_PUBLICA else '') + """
<h2>2. Seu papel</h2>
<ul><li>Use apenas exports de grupos dos quais você participa.</li>
<li>Pense nas outras pessoas antes de compartilhar cards: o grupo pode não gostar de ver certos resultados fora dele.</li>
<li>Não use o Retrozap para expor, humilhar ou perseguir ninguém. Categorias ofensivas são bloqueadas.</li></ul>
<h2>3. Sem garantias</h2>
<p>As análises dependem do formato do arquivo exportado e podem conter imprecisões. O serviço é oferecido como está, sem garantia de funcionamento contínuo.</p>
<h2>4. Marcas</h2>
<p>O Retrozap não tem relação com o WhatsApp ou a Meta. WhatsApp é marca de seus respectivos donos.</p>
<h2>5. Mudanças</h2>
<p>Estes termos podem ser atualizados. A data no topo indica a versão em vigor.</p>
<h2>6. Contato</h2>
<p><a href="mailto:contato@retrozap.com.br">contato@retrozap.com.br</a></p>
""", ad=False))

urls.append(page('sobre.html', 'Sobre o Retrozap', 'A retrospectiva oficial dos grupos de WhatsApp do Brasil.', """
<h1>Todo grupo tem uma história</h1>
<p>No Brasil, grupo de WhatsApp é instituição. Tem o da família, que acorda com bom dia e foto de flor. O da firma, que ninguém silencia por medo. O dos amigos, que já brigou por futebol, por política e por quem pagou a última rodada. E o do prédio, que sempre tem alguém perguntando de quem é o barulho.</p>
<p>Todo grupo tem um tagarela, um fantasma, um rei da figurinha e alguém que só aparece para mandar áudio de quatro minutos. O Retrozap existe para dar a essas pessoas o reconhecimento que elas merecem: uma cerimônia de premiação com números, prêmios, personagens e cards para mandar no próprio grupo.</p>
<h2>Como funciona</h2>
<p>Você exporta a conversa do grupo pelo próprio WhatsApp, escolhe o arquivo no site e pronto. A análise acontece no seu celular, e as suas mensagens nunca são enviadas para ninguém.</p>
<h2>Feito no Brasil</h2>
<p>O Retrozap é um projeto independente, criado em São Paulo. Sugestões de categorias e parcerias: <a href="/contato">fale com a gente</a>.</p>
<!--AD-->
"""))

urls.append(page('contato.html', 'Contato', 'Fale com o Retrozap: sugestões, parcerias e privacidade.', """
<h1>Fale com a gente</h1>
<p>Sugestões de categorias, problemas com algum arquivo, parcerias com marcas ou dúvidas sobre privacidade:</p>
<p><a href="mailto:contato@retrozap.com.br">contato@retrozap.com.br</a></p>
<p class="small">Se algum export não funcionou, conte se ele veio de iPhone ou Android. Nunca envie o arquivo da conversa por e-mail.</p>
""", ad=False))

ARTIGOS = [
('como-exportar-conversa-whatsapp', 'Como exportar a conversa de um grupo do WhatsApp (iPhone e Android)',
 'Passo a passo para exportar a conversa de um grupo do WhatsApp sem mídia, no iPhone e no Android, e o que fazer quando não funciona.', """
<h1>Como exportar a conversa de um grupo do WhatsApp</h1>
<p>Exportar a conversa é o jeito oficial do WhatsApp de gerar um arquivo com todo o histórico de um grupo. Ele serve para guardar memórias, fazer backup de algo importante ou, no nosso caso, descobrir quem é o tagarela do grupo. O recurso existe no app de celular, não no WhatsApp Web.</p>
<h2>No iPhone</h2>
<ol><li>Abra o grupo no WhatsApp.</li><li>Toque no nome do grupo, no topo da tela.</li><li>Role até o fim e toque em <b>Exportar conversa</b>.</li><li>Escolha <b>Sem mídia</b>. O arquivo fica bem mais leve e tem tudo o que importa.</li><li>Toque em <b>Salvar em Arquivos</b>. O WhatsApp cria um arquivo .zip.</li></ol>
<h2>No Android</h2>
<ol><li>Abra o grupo e toque nos três pontinhos, no canto superior direito.</li><li>Toque em <b>Mais</b> e depois em <b>Exportar conversa</b>.</li><li>Escolha <b>Sem mídia</b>.</li><li>Salve em Downloads ou no Google Drive.</li></ol>
<!--AD-->
<h2>Não aparece a opção de exportar?</h2>
<p>Se alguém ativou a <b>Privacidade avançada da conversa</b> no grupo, a exportação fica bloqueada para todos os participantes. Peça para quem ativou desligar a opção nas informações do grupo.</p>
<h2>O arquivo começa no meio da conversa</h2>
<p>O export só inclui as mensagens que ainda estão no celular de quem exportou. Quem entrou no grupo depois, trocou de aparelho sem backup ou apagou mensagens antigas vai gerar um arquivo mais curto. Para pegar a história completa, peça para alguém que está no grupo desde o começo fazer o export.</p>
<h2>É seguro?</h2>
<p>O arquivo fica no seu celular. No Retrozap, ele é lido pelo seu próprio navegador: as mensagens não são enviadas para nenhum servidor. Mesmo assim, trate o export como algo pessoal e não envie o arquivo para quem não é do grupo.</p>
<p><a class="cta" href="/">Fazer a cerimônia do meu grupo</a></p>
"""),
('ideias-de-premios-para-grupo-de-whatsapp', '40 ideias de prêmios para o seu grupo de WhatsApp',
 'Categorias de premiação para grupos de amigos, família, trabalho e condomínio: do Tagarela ao Fiscal do Barulho.', """
<h1>40 ideias de prêmios para o seu grupo de WhatsApp</h1>
<p>Premiar o grupo no fim do ano virou tradição em muita turma. Para ajudar, separamos ideias por tipo de grupo. No Retrozap, várias delas são calculadas sozinhas a partir da conversa, e você ainda pode criar a sua.</p>
<h2>Grupo de amigos</h2>
<ul><li><b>O Tagarela:</b> quem mais manda mensagem.</li><li><b>Figurinha de Ouro:</b> quem responde tudo com figurinha.</li><li><b>Coruja da Madrugada:</b> quem aparece entre meia-noite e 5h.</li><li><b>Rei do Furo:</b> campeão do "não vou conseguir".</li><li><b>Organizador do Rolê:</b> quem mais chama para sair.</li><li><b>Puxa-Assunto:</b> quem ressuscita o grupo depois de horas de silêncio.</li><li><b>Mata-Conversa:</b> a mensagem depois da qual ninguém mais fala.</li><li><b>Coração Mole:</b> quem mais manda "amo vcs".</li><li><b>Podcaster do Grupo:</b> o rei dos áudios longos.</li><li><b>O Fantasma:</b> quem lê tudo e não fala nada.</li></ul>
<!--AD-->
<h2>Grupo da família</h2>
<ul><li><b>Tio do Bom Dia:</b> o despertador oficial da família.</li><li><b>Mãe Coruja:</b> campeã do "chegou bem?".</li><li><b>Rei do Parabéns:</b> nunca esquece um aniversário.</li><li><b>Repórter da Família:</b> manda todas as notícias.</li><li><b>Fotógrafo Oficial:</b> documenta cada almoço de domingo.</li><li><b>Quem Mais Ama:</b> o abraço do grupo.</li></ul>
<h2>Grupo do trabalho</h2>
<ul><li><b>Rei do "Ok":</b> eficiência em duas letras.</li><li><b>Fora do Expediente:</b> manda mensagem às 22h de sábado.</li><li><b>Mestre das Reuniões:</b> "bora fazer uma call?".</li><li><b>Salva-Vidas:</b> o "pode deixar" do time.</li></ul>
<h2>Grupo do prédio ou do bairro</h2>
<ul><li><b>Síndico de Plantão:</b> mural de recados ambulante.</li><li><b>Achados e Perdidos:</b> "alguém viu uma chave no hall?".</li><li><b>Rei da Indicação:</b> tem o contato de todo eletricista.</li><li><b>Fiscal do Barulho:</b> sabe de onde vem cada furadeira.</li><li><b>Comitê de Boas-Vindas:</b> recebe todo vizinho novo.</li></ul>
<h2>Regras de ouro</h2>
<p>Prêmio bom provoca, mas não humilha. Evite categorias sobre aparência, saúde, religião, dinheiro ou vida íntima de alguém. A graça é todo mundo rir junto, inclusive quem ganhou.</p>
<p><a class="cta" href="/">Descobrir os vencedores do meu grupo</a></p>
"""),
('privacidade-ao-analisar-conversas-do-whatsapp', 'Dá para analisar a conversa do WhatsApp sem expor ninguém?',
 'Como o Retrozap analisa grupos de WhatsApp sem enviar suas mensagens para servidores, e cuidados para compartilhar os resultados.', """
<h1>Dá para analisar a conversa do WhatsApp sem expor ninguém?</h1>
<p>Dá, e foi assim que o Retrozap foi construído. A maioria dos sites que analisam conversas pede que você envie o arquivo para um servidor. Aqui, a análise roda no seu próprio navegador, como uma calculadora que funciona dentro do celular.</p>
<h2>Como funciona na prática</h2>
<p>Quando você escolhe o arquivo exportado, o navegador abre o .zip, lê as mensagens e faz as contas ali mesmo: quem falou mais, em que horário, quantas figurinhas, quantas risadas. Nenhuma mensagem é enviada pela internet. Um jeito simples de confirmar: abra o site, ative o modo avião e faça a análise. Funciona igual (só a comparação com outros grupos fica de fora).</p>
<!--AD-->
<h2>E a comparação com outros grupos?</h2>
<p>Para dizer se o seu grupo está no "Top 5% em mensagens", o site envia só números anônimos (total de mensagens, recorde em um dia, quantidade de áudios). Nenhuma mensagem e nenhum nome. E dá para desmarcar essa opção antes de começar. Com a opção desmarcada, o teste do modo avião funciona igual.</p>
<h2>Cuidados ao compartilhar</h2>
<ul><li>Os cards mostram nomes e números. Mande no próprio grupo antes de postar em qualquer outro lugar.</li><li>Em grupos de trabalho e de prédio, prefira categorias leves.</li><li>Se alguém do grupo não gostar, apague. A brincadeira só funciona se todo mundo estiver rindo.</li></ul>
<p><a class="cta" href="/">Fazer a cerimônia do meu grupo</a></p>
""")]
ARTIGOS = ARTIGOS + conteudo.NOVOS
urls.append(page(*conteudo.COMO_FUNCIONA))
urls.append(page('perguntas-frequentes.html', 'Perguntas frequentes', 'Dúvidas sobre o Retrozap: privacidade, como exportar a conversa, iPhone e Android, prêmios e mais.', conteudo.faq_html()))
urls.append(page(*conteudo.IDEIAS))
lista = ''.join(f'<a class="card" href="/blog/{slug}"><b>{t}</b><span class="small">{d}</span></a>' for slug, t, d, _ in ARTIGOS)
urls.append(page('blog/index.html', 'Blog do Retrozap', 'Dicas para grupos de WhatsApp: retrospectiva do grupo, ideias de prêmios, brincadeiras, gírias, jogos e privacidade.', f'<h1>Blog do Retrozap</h1><div class="cards">{lista}</div><!--AD-->'))
for slug, t, d, body in ARTIGOS:
    urls.append(page(f'blog/{slug}.html', t, d, body))

# ---------- arquivos técnicos ----------
open(os.path.join(PUB, 'ads.txt'), 'w').write('google.com, pub-4039247360984618, DIRECT, f08c47fec0942fa0\n')
open(os.path.join(PUB, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n')
open(os.path.join(PUB, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{u}</loc></url>\n' for u in urls) + '</urlset>\n')
json.dump({"name":"Retrozap","short_name":"Retrozap","description":"A retrospectiva oficial dos grupos de WhatsApp","start_url":"/","display":"standalone","background_color":"#1A0B2E","theme_color":"#1A0B2E","lang":"pt-BR",
           "icons":[{"src":"/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"/icon-512.png","sizes":"512x512","type":"image/png"},{"src":"/apple-touch-icon.png","sizes":"180x180","type":"image/png"}]},
          open(os.path.join(PUB, 'manifest.webmanifest'), 'w'), ensure_ascii=False, indent=2)
open(os.path.join(PUB, '_headers'), 'w').write("""/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: SAMEORIGIN
  Cache-Control: no-cache

/assets/*
  ! Cache-Control
  Cache-Control: public, max-age=86400
""")
# páginas: o navegador sempre confere se há versão nova (no-cache); arquivos de /assets: guardados por 1 dia
# rotas da cerimônia caem no index (as páginas legais e o blog são arquivos próprios)
open(os.path.join(PUB, '_redirects'), 'w').write('\n'.join(f'{r} /index.html 200' for r in ['/turma','/prologo','/numeros','/categorias','/premios/*','/bonus','/resumo','/destaque','/crie-seu-premio']) + '\n')

# ---------- ícones e imagem de compartilhamento ----------
open(os.path.join(PUB, 'icon.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1A0B2E"/><path d="M20 14h24v6h6v6c0 7-5 12-11 13-2 4-4 6-5 7v5h7v5H23v-5h7v-5c-1-1-3-3-5-7-6-1-11-6-11-13v-6h6zm-1 10v2c0 3 2 6 4 7-1-3-1-6-1-9zm26 0c0 3 0 6-1 9 2-1 4-4 4-7v-2z" fill="#FFC23C"/></svg>')
BRI = os.path.join(SCR, 'fontes', 'node_modules', '@fontsource-variable', 'bricolage-grotesque', 'files')
def fonte(tam):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(f): return ImageFont.truetype(f, tam)
    return ImageFont.load_default()
def trofeu(d, cx, cy, k, cor):
    d.rounded_rectangle([cx-20*k, cy-22*k, cx+20*k, cy+4*k], radius=int(10*k), fill=cor)
    d.ellipse([cx-30*k, cy-18*k, cx-14*k, cy-2*k], outline=cor, width=max(2,int(4*k)))
    d.ellipse([cx+14*k, cy-18*k, cx+30*k, cy-2*k], outline=cor, width=max(2,int(4*k)))
    d.rectangle([cx-4*k, cy+4*k, cx+4*k, cy+14*k], fill=cor)
    d.rounded_rectangle([cx-14*k, cy+14*k, cx+14*k, cy+22*k], radius=int(3*k), fill=cor)
for tam in (192, 512):
    im = Image.new('RGB', (tam, tam), '#1A0B2E'); d = ImageDraw.Draw(im)
    trofeu(d, tam/2, tam/2 - tam*0.02, tam/80, '#FFC23C'); im.save(os.path.join(PUB, f'icon-{tam}.png'))
og = Image.new('RGB', (1200, 630), '#1A0B2E'); d = ImageDraw.Draw(og)
for i, c in enumerate(['#FFC23C','#FF4F8B','#FF7A59','#2EC4F1','#A98BFF']*8):
    x = (i*197) % 1200; y = (i*131) % 630; d.rectangle([x, y, x+14, y+6], fill=c)
d.rectangle([0, 0, 1200, 14], fill='#FF4F8B')
trofeu(d, 1000, 300, 5, '#FFC23C')
d.text((80, 150), 'retrozap', font=fonte(120), fill='#FFC23C')
d.text((84, 310), 'Todo grupo tem uma história.', font=fonte(48), fill='#FFF4E0')
d.text((84, 375), 'Descubra a do seu.', font=fonte(48), fill='#FFF4E0')
d.text((84, 480), 'A retrospectiva oficial dos grupos de WhatsApp', font=fonte(30), fill='#B9A8CC')
og.save(os.path.join(PUB, 'og-image.png'))
print('paginas ok:', len(urls))
