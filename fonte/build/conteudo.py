# Conteúdo editorial do Retrozap: artigos do blog e páginas institucionais novas.
# True quando a cobrança (R$ 8,99 Pix ou cartão) estiver ligada para todos (COBRANCA = "ligada" no wrangler.jsonc)
COBRANCA_PUBLICA = True
# Google Tag Manager (pixels de mídia paga: Meta, Google Ads, TikTok). Vazio = desligado. Ex.: 'GTM-ABC1234'
GTM_ID = 'GTM-NMLZBBQS'
CTA = '<p><a class="cta" href="/">Fazer a retrospectiva do meu grupo</a></p>'

# Perguntas rápidas do artigo da retrospectiva 2026 (visíveis no texto e no FAQPage)
FAQ_RETRO_2026 = [
 ('Quanto custa?', 'A retrospectiva do primeiro grupo é grátis. Para fazer outros grupos e a retrospectiva de casal, o acesso ilimitado custa R$ 8,99, pago uma vez só, no Pix ou no cartão.'),
 ('As mensagens saem do celular?', 'Não. O arquivo é lido pelo seu próprio navegador. Mensagens, nomes e telefones não são enviados para nenhum servidor.'),
 ('Funciona no iPhone e no Android?', 'Sim. O site aceita o arquivo .zip ou .txt que o WhatsApp gera nos dois e também funciona no computador.'),
 ('Dá para refazer depois?', 'Dá. Exporte a conversa de novo no fim de dezembro e faça outra vez para pegar o ano inteiro.')]

NOVOS = [
('whatsapp-wrapped', 'WhatsApp Wrapped: como fazer o "Wrapped" do seu grupo de WhatsApp',
 'O Spotify tem o Wrapped; o seu grupo de WhatsApp também pode ter. Veja como gerar a retrospectiva do grupo com prêmios, números e cards.', """
<h1>WhatsApp Wrapped: como fazer o "Wrapped" do seu grupo</h1>
<p class="small">Wrapped é marca do Spotify e WhatsApp é marca da WhatsApp LLC. O Retrozap não tem relação com essas empresas; usamos os nomes só para explicar a ideia.</p>
<p>Todo dezembro o feed se enche de retrospectivas de música. Mas o lugar onde o seu ano realmente aconteceu foi o grupo de WhatsApp: o rolê que quase não saiu, o áudio de quatro minutos, a tia do bom dia que não falhou um dia sequer. O WhatsApp não tem um "Wrapped" oficial, mas dá para fazer um, de graça e sem expor ninguém.</p>
<h2>O que entra no Wrapped do grupo</h2>
<ul><li><b>Os números do grupo:</b> mensagens desde o início, ano a ano, áudios, páginas e horas para ler tudo, e a gíria oficial.</li><li><b>O nosso 2026:</b> o ano comparado com 2025, o assunto mais falado e os destaques do ano.</li><li><b>Os prêmios:</b> O Tagarela, O Fantasma, Coruja da Madrugada, Rei do Kkkk, Tio do Bom Dia e outros, escolhidos para o tipo de grupo.</li><li><b>Os personagens:</b> quem é quem no grupo e o jeito de cada um falar.</li><li><b>O ranking:</b> como o seu grupo se compara aos outros grupos do Brasil.</li><li><b>O vídeo e os cards:</b> um vídeo curto e imagens prontas para mandar no próprio grupo ou postar nos stories.</li></ul>
<h2>Passo a passo</h2>
<ol><li>No WhatsApp, abra o grupo, toque no nome dele, role até o fim e escolha <b>Exportar conversa</b> e <b>Sem mídia</b>. <a href="/blog/como-exportar-conversa-whatsapp">Veja com fotos</a>.</li><li>Abra o <a href="/">Retrozap</a>, escolha o arquivo e o tipo de grupo: amigos, família, trabalho ou comunidade.</li><li>Confira a turma (dá para juntar contatos repetidos e tirar quem saiu).</li><li>Revele os prêmios um por um e mande o card de resumo no grupo.</li></ol>
<h2>E a privacidade?</h2>
<p>A leitura do arquivo acontece no seu navegador, como uma calculadora. As mensagens, os nomes e os telefones não são enviados para nenhum servidor. <a href="/blog/privacidade-ao-analisar-conversas-do-whatsapp">Entenda como funciona</a>.</p>
<h2>Dica para a revelação render</h2>
<p>Antes de mostrar os vencedores, mande no grupo a lista de categorias e peça palpites. Depois revele um prêmio por vez. Mais ideias em <a href="/blog/retrospectiva-do-grupo-de-whatsapp">como fazer a retrospectiva do grupo</a>.</p>
""" + CTA),

('retrospectiva-do-grupo-de-whatsapp', 'Retrospectiva do grupo do WhatsApp 2026: como fazer a do seu grupo',
 'Passo a passo para fazer a retrospectiva 2026 do seu grupo de WhatsApp: números do ano, prêmios para cada um e cards para mandar no grupo.', """
<h1>Retrospectiva do grupo do WhatsApp 2026: como fazer a do seu grupo</h1>
<p>Todo fim de ano a gente vê retrospectiva de música, de série, de exercício. Mas a história que mais rendeu no seu 2026 provavelmente aconteceu num grupo de WhatsApp: o churrasco que quase não saiu, o áudio de oito minutos, a figurinha que virou meme interno. Dá para transformar tudo isso numa retrospectiva divertida, em menos de um minuto e sem expor ninguém.</p>
<h2>Quando fazer a retrospectiva 2026</h2>
<p>Dezembro é o mês dela: dá tempo de revelar os prêmios antes do amigo secreto, da ceia ou do Réveillon, quando o grupo está mais animado. Se fizer antes, tudo bem: os números contam as mensagens de 2026 até o dia em que você exportou a conversa, e você pode refazer no fim do ano com um arquivo novo.</p>
<h2>1. Escolha o grupo certo</h2>
<p>Funciona melhor em grupos com bastante conversa: amigos, família, faculdade, time de futebol, condomínio. Um grupo com poucas mensagens gera números tímidos. Se o grupo é muito grande, como o do prédio inteiro, prefira categorias leves. Também dá para fazer a de um casal: veja a <a href="/blog/retrospectiva-de-namoro">retrospectiva de namoro</a>.</p>
<h2>2. Exporte a conversa</h2>
<p>No celular, abra o grupo, toque no nome dele, role até o fim e escolha <b>Exportar conversa</b> e depois <b>Sem mídia</b>. O arquivo sai em segundos. Tem um passo a passo detalhado em <a href="/blog/como-exportar-conversa-whatsapp">como exportar a conversa de um grupo</a> e um <a href="/como-exportar">vídeo de 45 segundos</a>.</p>
<h2>3. Gere os números e os prêmios de 2026</h2>
<p>No <a href="/">Retrozap</a>, você escolhe o arquivo e o tipo de grupo. A leitura acontece no seu navegador, as mensagens não saem do celular. Em menos de um minuto aparecem:</p>
<ul><li>há quanto tempo o grupo existe e as mensagens ano a ano;</li><li>o nosso 2026: mensagens, áudios e risadas do ano, comparados com o mesmo período de 2025 (se o grupo já existia);</li><li>a gíria oficial e o assunto mais falado do ano;</li><li>de 7 a 10 prêmios, conforme o tipo de grupo, como O Tagarela, O Fantasma e Boca-Suja;</li><li>os personagens do grupo, com o jeito de falar de cada um;</li><li>cards prontos para mandar no grupo e nos stories, e um vídeo curto (baixar o vídeo faz parte do acesso ilimitado).</li></ul>
<p>Os prêmios e as imagens usam só as mensagens de 2026. Se o grupo conversou pouco neste ano, o site usa a conversa inteira e avisa na tela.</p>
<h2>4. Faça suspense antes de revelar</h2>
<p>A graça está no momento da revelação. Antes de mostrar os vencedores, mande no grupo a lista de categorias e peça palpites. Depois, revele um prêmio por vez. Quem acertou mais ganha o direito de se gabar até o ano que vem. Precisa de mais ideias? Veja as <a href="/blog/ideias-de-premios-para-grupo-de-whatsapp">40 ideias de prêmios para o grupo</a>.</p>
<h2>5. Mande o resumo no grupo</h2>
<p>No fim, salve o card de resumo e mande no grupo ou nos stories. É o tipo de imagem que rende conversa por dias, e que todo mundo quer fazer para os outros grupos também. Para fechar o ano, junte com uma das <a href="/blog/mensagens-de-fim-de-ano-para-grupo">mensagens de fim de ano para o grupo</a>.</p>
<h2>Dica de etiqueta</h2>
<p>Retrospectiva boa é a que todo mundo ri junto. Evite expor conversas privadas, não poste os cards fora do grupo sem combinar e, se alguém não gostar de um prêmio, tire. A brincadeira só funciona com todo mundo dentro.</p>
<h2>Perguntas rápidas</h2>
""" + ''.join(f'<h3>{q}</h3><p>{a}</p>' for q, a in FAQ_RETRO_2026) + """
<p><a class="cta" href="/">Fazer a retrospectiva 2026 do meu grupo</a></p>
"""),

('premios-para-grupo-da-familia', '30 prêmios engraçados para o grupo da família',
 'Ideias de categorias carinhosas e divertidas para premiar o grupo da família no fim do ano.', """
<h1>30 prêmios engraçados para o grupo da família</h1>
<p>O grupo da família tem personagens que todo brasileiro reconhece: a tia do bom dia com flor, o tio das correntes, a mãe que pergunta se você chegou bem. Premiar essas figuras é um jeito carinhoso de fechar o ano. Aqui vão 30 ideias, das mais clássicas às mais específicas.</p>
<h2>Os clássicos</h2>
<ol><li><b>Tio(a) do Bom Dia:</b> o despertador oficial da família.</li><li><b>Mãe Coruja:</b> campeã do "chegou bem?".</li><li><b>Rei(nha) do Parabéns:</b> nunca esquece um aniversário.</li><li><b>Repórter da Família:</b> sempre manda a notícia antes de todo mundo.</li><li><b>Fotógrafo(a) Oficial:</b> registra cada almoço de domingo.</li><li><b>Visualiza e Não Responde:</b> está em todas, mas em silêncio.</li><li><b>Quem Mais Ama:</b> mais "te amo", "beijos" e corações.</li><li><b>Puxa-Assunto:</b> ressuscita o grupo depois de horas parado.</li><li><b>Podcaster da Família:</b> áudio de cinco minutos para dizer "ok".</li><li><b>Coruja da Madrugada:</b> manda mensagem às 3h da manhã.</li></ol>
<h2>Os que todo mundo vai reconhecer</h2>
<ol start="11"><li><b>Rei(nha) das Correntes:</b> "repassem para 10 pessoas".</li><li><b>Detetive de Fake News:</b> o primeiro a avisar que aquilo é falso.</li><li><b>Chef do Grupo:</b> mais fotos de comida e receitas.</li><li><b>Meteorologista:</b> sempre avisa que vai chover.</li><li><b>Agenda Humana:</b> lembra de todos os compromissos.</li><li><b>Figurinha de Ouro:</b> responde tudo com figurinha.</li><li><b>Rei(nha) do Emoji:</b> três emojis por mensagem, no mínimo.</li><li><b>Sumido(a) do Ano:</b> aparece só no Natal.</li><li><b>Conselheiro(a):</b> sempre tem uma opinião sobre a vida dos outros.</li><li><b>Mensagem de Voz em Viva-Voz:</b> grava áudio com a TV ligada.</li></ol>
<h2>Os mais carinhosos</h2>
<ol start="21"><li><b>Ponte da Família:</b> une quem mora longe.</li><li><b>Guardião(ã) das Memórias:</b> manda foto antiga toda semana.</li><li><b>Organizador(a) do Almoço:</b> sem essa pessoa não tem encontro.</li><li><b>Rei(nha) do Obrigado:</b> agradece tudo e todos.</li><li><b>Mais Orgulhoso(a):</b> compartilha cada conquista dos filhos e netos.</li><li><b>Pacificador(a):</b> acalma as discussões de política.</li><li><b>Rei(nha) do Áudio de Bom Dia:</b> o bom dia em versão falada.</li><li><b>Torcedor(a) Oficial:</b> comenta todo jogo do time.</li><li><b>Novato(a) do Ano:</b> o integrante mais recente, já à vontade.</li><li><b>Pilar da Família:</b> está sempre presente e segura a conversa.</li></ol>
<h2>Como premiar sem ninguém ficar chateado</h2>
<p>Combine antes que é brincadeira, prefira categorias de carinho a categorias de crítica e evite qualquer coisa sobre aparência, saúde ou dinheiro. Vários desses prêmios o <a href="/">Retrozap</a> calcula sozinho a partir da conversa, como o Tio do Bom Dia e o Rei do Parabéns.</p>
""" + CTA),

('premios-para-grupo-de-amigos', '30 prêmios para o grupo de amigos (do Tagarela ao Rei do Furo)',
 'Categorias engraçadas para premiar a galera: quem fala demais, quem some, quem cancela o rolê.', """
<h1>30 prêmios para o grupo de amigos</h1>
<p>O grupo de amigos é onde mora a resenha. É também onde estão os personagens mais fáceis de premiar: quem fala demais, quem só aparece para confirmar presença e quem sempre fura o rolê no último minuto. Aqui vão 30 categorias para a sua premiação.</p>
<h2>Os indispensáveis</h2>
<ol><li><b>O Tagarela:</b> mais mensagens no ano.</li><li><b>O Fantasma:</b> está no grupo, mas ninguém lembra a voz.</li><li><b>Rei do Furo:</b> "não vou conseguir", "fica pra próxima".</li><li><b>Organizador(a) do Rolê:</b> sem essa pessoa ninguém sai de casa.</li><li><b>Rei do Kkkk:</b> ri de tudo, sempre.</li><li><b>Boca-Suja:</b> o vocabulário mais criativo.</li><li><b>Coruja da Madrugada:</b> ativo entre meia-noite e 5h.</li><li><b>Figurinha de Ouro:</b> uma figurinha vale mais que mil palavras.</li><li><b>Mata-Conversa:</b> depois da mensagem dessa pessoa, silêncio.</li><li><b>Puxa-Assunto:</b> ressuscita o grupo do nada.</li></ol>
<h2>Para a resenha ficar completa</h2>
<ol start="11"><li><b>Podcaster do Grupo:</b> áudios que viram episódios.</li><li><b>Escritor(a) de Textão:</b> parágrafos onde todos mandam "ok".</li><li><b>O Arrependido:</b> mais mensagens apagadas.</li><li><b>Coração Mole:</b> "amo vocês" no meio da zoeira.</li><li><b>Influencer do Grupo:</b> mais links e vídeos compartilhados.</li><li><b>Atrasado(a) Oficial:</b> "tô saindo" quando ainda está no banho.</li><li><b>Rei do Print:</b> guarda prova de tudo.</li><li><b>Especialista em Tudo:</b> tem opinião sobre qualquer assunto.</li><li><b>Narrador(a) Esportivo:</b> comenta o jogo lance a lance.</li><li><b>Chef do Churrasco:</b> organiza e cobra o rateio.</li></ol>
<h2>Os prêmios de honra</h2>
<ol start="21"><li><b>Melhor Meme do Ano.</b></li><li><b>Mensagem Mais Polêmica.</b></li><li><b>Maior Sumiço:</b> quanto tempo alguém ficou sem aparecer.</li><li><b>Dia do Caos:</b> o dia com mais mensagens no ano.</li><li><b>Gíria Oficial:</b> "bora", "mano", "slk".</li><li><b>Frase do Ano:</b> a que mais se repetiu.</li><li><b>Dupla Inseparável:</b> quem mais conversa entre si.</li><li><b>Revelação do Ano:</b> quem entrou e já dominou.</li><li><b>Calado(a) que Surpreende:</b> fala pouco, mas quando fala é ouro.</li><li><b>Destaque do Grupo:</b> quem levou mais troféus.</li></ol>
<p>Boa parte dessas categorias o <a href="/">Retrozap</a> descobre sozinho, lendo a conversa no seu celular: do Tagarela ao Rei do Furo, passando pela gíria oficial e pelo dia de caos.</p>
""" + CTA),

('premios-para-grupo-do-trabalho', 'Prêmios para o grupo do trabalho: como brincar sem criar climão',
 'Categorias leves para o grupo do trabalho e o que evitar para a brincadeira não virar problema.', """
<h1>Prêmios para o grupo do trabalho: como brincar sem criar climão</h1>
<p>Premiar o grupo do trabalho pode ser ótimo para fechar o ano, desde que todo mundo saia rindo. A regra de ouro é simples: brinque com hábitos de comunicação, nunca com desempenho, aparência ou vida pessoal.</p>
<h2>Categorias que funcionam bem</h2>
<ul><li><b>Rei(nha) do "Ok":</b> respostas curtas e diretas.</li><li><b>Fora do Expediente:</b> mais mensagens depois das 19h e nos fins de semana.</li><li><b>Mestre(a) das Reuniões:</b> mais "call", "alinhar" e "pauta".</li><li><b>Salva-Vidas:</b> "pode deixar", "tá feito", "deixa comigo".</li><li><b>Locutor(a) Corporativo:</b> mais áudios no grupo do trabalho.</li><li><b>Madrugador(a):</b> abre o grupo todo dia.</li><li><b>Escritor(a) de Textão:</b> a mensagem mais longa do ano.</li><li><b>Rei(nha) do Emoji de Joinha:</b> 👍 como resposta universal.</li></ul>
<h2>O que evitar</h2>
<ul><li>Prêmios sobre quem trabalha menos ou erra mais.</li><li>Qualquer referência a aparência, saúde, religião, política ou salário.</li><li>Expor mensagens de colegas fora do grupo.</li><li>Categorias que só fazem sentido para uma "panelinha".</li></ul>
<h2>Como apresentar</h2>
<p>Funciona bem no fim de uma reunião de encerramento do ano, com os cards projetados. Avise antes que é brincadeira e deixe quem não quiser participar de fora. No <a href="/">Retrozap</a>, o modo Trabalho já vem com categorias leves e sem palavrões.</p>
""" + CTA),

('grupo-do-condominio', 'Grupo do condomínio: prêmios divertidos e regras de boa convivência',
 'Ideias de prêmios para o grupo do prédio e dicas para o grupo ser útil sem virar confusão.', """
<h1>Grupo do condomínio: prêmios divertidos e boa convivência</h1>
<p>O grupo do prédio é um mundo à parte: tem quem avisa da manutenção, quem vende sofá, quem reclama do barulho e quem dá as boas-vindas a cada vizinho novo. Uma premiação leve no fim do ano ajuda a criar clima de comunidade.</p>
<h2>Prêmios para o grupo do prédio</h2>
<ul><li><b>Síndico(a) de Plantão:</b> mais avisos, comunicados e lembretes.</li><li><b>Rei(nha) da Indicação:</b> sempre tem o contato do eletricista.</li><li><b>Classificados do Grupo:</b> vende, troca e doa de tudo.</li><li><b>Fiscal do Barulho:</b> sabe de onde vem cada furadeira.</li><li><b>Comitê de Boas-Vindas:</b> recebe cada morador novo.</li><li><b>Mais Agradecido(a):</b> "obrigado, vizinho!".</li><li><b>Achados e Perdidos:</b> "alguém viu uma chave no hall?".</li><li><b>Repórter do Prédio:</b> sabe tudo antes de todo mundo.</li></ul>
<h2>Regras para o grupo funcionar</h2>
<ol><li>Defina o objetivo: avisos, indicações e emergências.</li><li>Evite discussões longas; problemas sérios vão para a administração.</li><li>Nada de correntes e política.</li><li>Respeite horários: mensagem de madrugada só em emergência.</li><li>Antes de vender algo, veja se o grupo permite.</li></ol>
<p>No <a href="/">Retrozap</a>, o modo Comunidade tem essas categorias prontas, sempre com tom leve.</p>
""" + CTA),

('tipos-de-pessoas-em-grupos-de-whatsapp', '15 personagens que todo grupo de WhatsApp tem',
 'Do tagarela ao fantasma: os tipos de pessoa que aparecem em todo grupo, e como reconhecer cada um.', """
<h1>15 personagens que todo grupo de WhatsApp tem</h1>
<p>Não importa se é o grupo da família, da faculdade ou do futebol: alguns personagens aparecem em todos. Você com certeza vai reconhecer alguém. Talvez até você mesmo.</p>
<ol><li><b>O Tagarela:</b> responde tudo, comenta tudo e é responsável por um terço das mensagens.</li><li><b>O Fantasma:</b> está no grupo há anos e ninguém lembra a última vez que escreveu.</li><li><b>O Despertador:</b> abre o grupo todo dia com um bom dia.</li><li><b>A Coruja:</b> ativa quando todo mundo dorme.</li><li><b>O Podcaster:</b> áudios longos, de preferência andando na rua.</li><li><b>O Figurinheiro:</b> responde com figurinha antes de pensar.</li><li><b>O Organizador:</b> marca, confirma, cobra o rateio.</li><li><b>O Furão:</b> confirma presença e some no dia.</li><li><b>O Repórter:</b> manda a notícia antes de todo mundo.</li><li><b>O Escritor:</b> parágrafos onde os outros mandam "ok".</li><li><b>O Risonho:</b> "kkkkkkk" em tudo.</li><li><b>O Mata-Conversa:</b> depois da mensagem dele, silêncio total.</li><li><b>O Puxa-Assunto:</b> ressuscita o grupo do nada.</li><li><b>O Arrependido:</b> "esta mensagem foi apagada".</li><li><b>O Coração Mole:</b> "amo vocês" no meio da zoeira.</li></ol>
<h2>Quer saber quem é quem no seu grupo?</h2>
<p>O <a href="/">Retrozap</a> lê a conversa exportada direto no seu celular e mostra os personagens do grupo, com o jeito de falar de cada um, a gíria preferida e os emojis de estimação.</p>
""" + CTA),

('girias-mais-usadas-no-whatsapp', 'Gírias mais usadas no WhatsApp: o que significam',
 'Bora, mano, slk, mds, tmj: um guia rápido das gírias brasileiras que dominam os grupos.', """
<h1>Gírias mais usadas no WhatsApp e o que significam</h1>
<p>Cada grupo tem um dialeto próprio, mas algumas gírias aparecem em quase todos. Aqui vai um guia rápido, para ninguém ficar perdido na conversa.</p>
<ul><li><b>Bora:</b> "vamos". A gíria do convite e também a do furo, quando ninguém vai.</li><li><b>Mano / mana:</b> tratamento entre amigos, de qualquer idade.</li><li><b>Véi:</b> o "mano" do Centro-Oeste e do Nordeste.</li><li><b>Slk:</b> "sei lá", ou "você é louco", depende do contexto.</li><li><b>Mds:</b> "meu Deus", para surpresa ou indignação.</li><li><b>Tmj:</b> "tamo junto", apoio e parceria.</li><li><b>Sqn:</b> "só que não", ironia pura.</li><li><b>Pprt:</b> "papo reto", a verdade sem rodeio.</li><li><b>Tlgd:</b> "tá ligado?".</li><li><b>Vish / eita / oxe:</b> espanto, com sotaque.</li><li><b>Sextou:</b> chegou a sexta-feira.</li><li><b>Deu ruim:</b> algo deu errado.</li><li><b>De boa:</b> tranquilo, sem problema.</li><li><b>Resenha:</b> conversa boa, zoeira entre amigos.</li><li><b>Flopou:</b> não deu certo, não engajou.</li><li><b>Cringe:</b> vergonha alheia.</li></ul>
<h2>Qual é a gíria oficial do seu grupo?</h2>
<p>O <a href="/">Retrozap</a> conta as gírias mais usadas na conversa do seu grupo e mostra a vencedora no resumo, junto com a frase mais repetida do ano.</p>
""" + CTA),

('quem-mais-fala-no-grupo-do-whatsapp', 'Como saber quem mais fala no grupo do WhatsApp',
 'O WhatsApp não mostra estatísticas do grupo. Veja como descobrir quem mais manda mensagem, áudio e figurinha.', """
<h1>Como saber quem mais fala no grupo do WhatsApp</h1>
<p>O WhatsApp não tem uma tela de estatísticas: não mostra quem mais manda mensagem, quem mais grava áudio nem em que horário o grupo ferve. Mas dá para descobrir tudo isso a partir da conversa exportada.</p>
<h2>O jeito manual</h2>
<p>A conversa exportada é um arquivo de texto em que cada linha tem data, hora, nome e mensagem. Dá para abrir numa planilha e contar as linhas por pessoa, mas dá trabalho: mensagens com quebra de linha, áudios marcados como "áudio omitido", formatos diferentes entre iPhone e Android.</p>
<h2>O jeito rápido</h2>
<ol><li>Exporte a conversa do grupo sem mídia (<a href="/blog/como-exportar-conversa-whatsapp">veja como</a>).</li><li>Abra o <a href="/">Retrozap</a> e escolha o arquivo.</li><li>Em segundos aparecem quem mais fala, quem mais manda áudio, figurinha e foto, o horário de pico, o dia recorde e muito mais.</li></ol>
<h2>E a privacidade?</h2>
<p>A leitura acontece no seu navegador, como uma calculadora que roda no celular. As mensagens não são enviadas para nenhum servidor. Dá para testar: ative o modo avião depois de abrir o site, e a análise funciona igual.</p>
""" + CTA),

('como-reanimar-grupo-parado', '12 ideias para reanimar um grupo de WhatsApp parado',
 'O grupo morreu? Brincadeiras, perguntas e desafios para ressuscitar a conversa sem forçar a barra.', """
<h1>12 ideias para reanimar um grupo de WhatsApp parado</h1>
<p>Todo grupo tem fases de silêncio. Às vezes basta um empurrãozinho para a conversa voltar. Aqui vão 12 ideias que funcionam sem parecer forçado.</p>
<ol><li><b>Foto antiga:</b> mande uma foto de anos atrás e pergunte "quem lembra?".</li><li><b>Enquete:</b> a melhor pizza da cidade, o melhor filme do ano, o próximo destino.</li><li><b>Desafio da semana:</b> todo mundo manda a foto do almoço de hoje.</li><li><b>Top 3:</b> três músicas que definem o grupo.</li><li><b>Prêmios do grupo:</b> faça a <a href="/blog/retrospectiva-do-grupo-de-whatsapp">retrospectiva do grupo</a> e revele os vencedores.</li><li><b>Palpites:</b> mande a lista de categorias e peça para cada um apostar quem leva.</li><li><b>Pergunta impossível:</b> "se o grupo fosse uma série, qual seria?".</li><li><b>Data marcada:</b> proponha um encontro com data e local concretos.</li><li><b>Meme interno:</b> ressuscite uma piada antiga do grupo.</li><li><b>Playlist colaborativa:</b> cada um adiciona duas músicas.</li><li><b>Quem disse?:</b> cole uma frase antiga do grupo e peça para adivinharem o autor.</li><li><b>Jogo presencial:</b> combine uma noite de jogos de tabuleiro ou cartas.</li></ol>
<p>A ideia 5 costuma ser a mais certeira: ninguém resiste a saber quem é o Tagarela e quem é o Fantasma.</p>
""" + CTA),

('amigo-secreto-pelo-whatsapp', 'Como organizar amigo secreto pelo WhatsApp',
 'Passo a passo para organizar o amigo secreto do grupo pelo WhatsApp: sorteio, valor, data e lista de desejos.', """
<h1>Como organizar amigo secreto pelo WhatsApp</h1>
<p>O amigo secreto é a tradição de fim de ano que mais movimenta os grupos de WhatsApp. Com um pouco de organização, dá para fazer tudo pelo celular, sem confusão.</p>
<h2>1. Defina o básico no grupo</h2>
<ul><li><b>Quem participa:</b> faça uma lista e peça confirmação até uma data.</li><li><b>Valor:</b> combine um valor mínimo e máximo.</li><li><b>Data e local da troca:</b> marque com antecedência.</li></ul>
<h2>2. Faça o sorteio sem ninguém ver</h2>
<p>O ideal é usar um site ou app de sorteio de amigo secreto, que manda o nome sorteado para cada pessoa individualmente. Evite sortear no grupo: alguém sempre acaba vendo.</p>
<h2>3. Lista de desejos</h2>
<p>Peça para cada um mandar três sugestões de presente, de preferência num lugar que o sorteado consiga consultar sem revelar quem tirou quem.</p>
<h2>4. Dê um tempero</h2>
<ul><li><b>Amigo da onça:</b> presente engraçado até um valor baixo.</li><li><b>Tema:</b> só livros, só comida, só itens feitos à mão.</li><li><b>Dicas no grupo:</b> cada um dá uma dica sobre quem tirou ao longo da semana.</li></ul>
<h2>5. Feche o ano com a retrospectiva</h2>
<p>No dia da troca, aproveite e revele os prêmios do grupo: quem mais falou, quem mais sumiu, a gíria do ano. Dá para gerar tudo no <a href="/">Retrozap</a> e mostrar os cards no celular ou na TV.</p>
""" + CTA),

('jogos-para-jogar-com-amigos-e-familia', '6 jogos para animar o encontro com amigos e família',
 'Jogos de cartas rápidos de explicar para tirar o grupo do celular e levar a resenha para a mesa.', """
<h1>6 jogos para animar o encontro com amigos e família</h1>
<p class="small">Este artigo tem links de parceiro. Comprando pelo link, o Retrozap pode receber uma comissão, sem custo extra para você.</p>
<p>A resenha do grupo de WhatsApp fica ainda melhor ao vivo. Jogos de festa são o jeito mais fácil de tirar todo mundo do celular: regras que se explicam em um minuto, partidas curtas e muita risada. Separamos seis opções da Party Games, uma marca brasileira de jogos de cartas para grupos.</p>
<h2>1. O Jogo do Ranking</h2>
<p>A cada rodada, uma pessoa recebe cinco cartas com temas do dia a dia, como café, comida japonesa ou uma boa fofoca, e ordena em segredo do que mais gosta para o que menos gosta. O resto da mesa tenta adivinhar a ordem. É o jogo perfeito para descobrir o quanto vocês se conhecem.</p>
<h2>2. Segue o Fluxo</h2>
<p>Uma carta faz uma pergunta e cada um escreve a resposta que acha que a maioria vai dar, não necessariamente a sua. Quem pensou igual à maioria pontua. Vale de 4 a 8 pessoas e as partidas levam cerca de 30 minutos.</p>
<h2>3. Não Pode</h2>
<p>Em times, você precisa fazer sua equipe adivinhar uma palavra sem usar as cinco palavras proibidas da carta. Para 4 ou mais pessoas, a partir de 14 anos, cerca de 30 minutos por partida.</p>
<h2>4. Quem Disse Isso?</h2>
<p>Um jogo de trivia com frases de músicas, filmes, bordões da TV e slogans: os jogadores precisam adivinhar quem disse. Dá para aprender a jogar em menos de um minuto.</p>
<h2>5. LaLaLa</h2>
<p>Uma pessoa cantarola a melodia de uma música só com "lalala" e o time tenta adivinhar qual é. Não importa ser afinado: a graça está justamente na tentativa.</p>
<h2>6. Quem do Casal</h2>
<p>Para noites a dois ou com outros casais: perguntas sobre quem do casal faz o quê. Ótimo para descobrir quem sempre se atrasa e quem esquece as datas.</p>
<h2>Onde encontrar</h2>
<p>Todos estão no site da <a href="https://playpartygames.com.br/?utm_source=retrozap&amp;utm_medium=blog&amp;utm_campaign=jogos" target="_blank" rel="noopener sponsored">Party Games</a>. Use o cupom <b>RETROZAP</b> para ganhar desconto.</p>
<p>E antes do encontro, que tal descobrir quem é o Tagarela e quem é o Fantasma do grupo? É só fazer a retrospectiva no Retrozap.</p>
""" + CTA),
]

COMO_FUNCIONA = ('como-funciona.html', 'Como funciona o Retrozap', 'Do arquivo exportado do WhatsApp aos prêmios do grupo, em menos de um minuto, sem as mensagens saírem do celular.', """
<h1>Como funciona o Retrozap</h1>
<p>O Retrozap transforma a conversa de um grupo de WhatsApp numa retrospectiva divertida: números, prêmios, personagens e um resumo para mandar no grupo. Tudo em menos de um minuto, de graça, e sem as mensagens saírem do seu celular.</p>
<h2>1. Você exporta a conversa</h2>
<p>No WhatsApp, abra o grupo, toque no nome dele e escolha <b>Exportar conversa</b> e <b>Sem mídia</b>. O WhatsApp gera um arquivo .zip ou .txt. <a href="/blog/como-exportar-conversa-whatsapp">Veja o passo a passo</a>.</p>
<h2>2. O seu navegador lê o arquivo</h2>
<p>Quando você escolhe o arquivo no Retrozap, a leitura acontece no próprio navegador do seu celular ou computador, como uma calculadora. O arquivo e as mensagens não são enviados para nenhum servidor e somem quando você fecha a página.</p>
<h2>3. Você confere a turma</h2>
<p>Antes de começar, dá para ajustar o nome do grupo, juntar contatos repetidos (quando alguém trocou de número) e tirar quem já saiu.</p>
<h2>4. A cerimônia</h2>
<ul><li><b>Prólogo:</b> há quanto tempo o grupo existe e os principais números.</li><li><b>Categorias:</b> dez prêmios escolhidos para o tipo de grupo (amigos, família, trabalho ou comunidade), mais extras.</li><li><b>Revelação:</b> pódio, raspadinha, palpite e chute, um prêmio por vez.</li><li><b>Resumo:</b> os fatos mais engraçados do grupo e um card para os stories.</li><li><b>Personagens:</b> quem é quem no grupo, com o jeito de falar de cada um.</li></ul>
<h2>5. Você compartilha</h2>
<p>Cada prêmio e o resumo viram imagens prontas para mandar no WhatsApp ou postar nos stories.</p>
<h2>O que o Retrozap não faz</h2>
<ul><li>Não lê conversas privadas: só o arquivo que você escolhe.</li><li>Não guarda mensagens, nomes ou telefones.</li><li>Não tem relação com o WhatsApp ou a Meta.</li></ul>
""" + CTA)

FAQ = [
 (('O Retrozap é grátis?', 'A retrospectiva do primeiro grupo é grátis. Para fazer quantos grupos quiser e a retrospectiva de casal, o acesso ilimitado custa R$ 8,99 no Pix ou no cartão, pago uma única vez.') if COBRANCA_PUBLICA else ('O Retrozap é grátis?', 'Sim. Você pode fazer a retrospectiva de quantos grupos quiser, sem pagar nada.')),
 ('Minhas mensagens são enviadas para algum servidor?', 'Não. A leitura do arquivo acontece no seu navegador. As mensagens, os nomes e os telefones não saem do seu celular ou computador.'),
 ('Funciona no iPhone e no Android?', 'Sim. O site aceita o .zip ou o .txt que o WhatsApp gera nos dois sistemas, e também funciona no computador.'),
 ('Preciso exportar com mídia?', 'Não. Exporte "Sem mídia": o arquivo fica pequeno e a análise é mais rápida. Com mídia, o site também consegue medir a duração dos áudios.'),
 ('Funciona com grupos muito grandes?', 'Sim. O site lê conversas com centenas de milhares de mensagens. Em celulares mais antigos, pode levar alguns segundos a mais.'),
 ('Por que alguns membros aparecem como número de telefone?', 'Isso acontece quando a pessoa não está salva nos seus contatos ou trocou de número. Na tela da turma, dá para juntar o número com o nome certo ou tirar da cerimônia.'),
 ('Quem saiu do grupo aparece nos prêmios?', 'Quem saiu fica fora da cerimônia por padrão, mas você pode incluir de volta na tela da turma.'),
 ('Como os prêmios são calculados?', 'Por contagens automáticas: número de mensagens, áudios, figurinhas, horários, palavras como "bom dia" e "parabéns", risadas e muito mais. São brincadeiras, não avaliações sobre ninguém.'),
 ('Posso mudar o nome do grupo que aparece nos cards?', 'Sim. O nome vem do arquivo exportado, mas você pode editar na tela da turma.'),
 ('Posso usar em grupo do trabalho?', 'Pode, com bom senso. O modo Trabalho tem categorias leves. Evite expor colegas e combine a brincadeira antes.'),
 ('O WhatsApp sabe que eu usei o Retrozap?', 'Não. O Retrozap usa apenas o arquivo que o próprio WhatsApp permite exportar. Não há nenhuma conexão com a sua conta.'),
 ('Tenho uma ideia de prêmio. Como sugiro?', 'Use a página <a href="/ideias">Envie sua ideia</a>. As melhores entram nas próximas versões.')
]
def faq_html():
    import json
    itens = ''.join(f'<h2>{q}</h2><p>{a}</p>' for q, a in FAQ)
    ld = json.dumps({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q, a in FAQ]}, ensure_ascii=False)
    return f'<h1>Perguntas frequentes</h1>{itens}<script type="application/ld+json">{ld}</script>' + CTA

IDEIAS = ('ideias.html', 'Envie sua ideia', 'Sugira um prêmio, uma categoria ou um recurso novo para o Retrozap.', """
<h1>Envie sua ideia</h1>
<p>Pensou num prêmio que todo grupo precisa ter? Numa categoria para o grupo da família? Num recurso novo? Conta pra gente. As melhores ideias entram nas próximas versões do Retrozap.</p>
<form id="ideia" class="form">
  <label for="tipo">Sua ideia é sobre</label>
  <select id="tipo" name="tipo"><option value="premio">Um prêmio ou categoria nova</option><option value="recurso">Um recurso novo no site</option><option value="problema">Algo que não funcionou</option><option value="outro">Outra coisa</option></select>
  <label for="texto">Conte sua ideia</label>
  <textarea id="texto" name="texto" rows="5" maxlength="600" required placeholder="Ex.: prêmio &quot;Rei do Pix&quot; para quem mais cobra o rateio"></textarea>
  <label for="contato">Seu e-mail ou WhatsApp <span class="small">(opcional, só se quiser resposta)</span></label>
  <input id="contato" name="contato" maxlength="120" autocomplete="email">
  <input type="text" name="site" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
  <button type="submit" class="cta" id="enviar">Enviar ideia</button>
  <p id="msg" class="small" role="status"></p>
</form>
<p class="small">Não coloque mensagens do seu grupo nem dados de outras pessoas aqui.</p>
<script>
document.getElementById('ideia').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, msg = document.getElementById('msg'), b = document.getElementById('enviar');
  const dados = {tipo: f.tipo.value, texto: f.texto.value.trim(), contato: f.contato.value.trim(), site: f.site.value};
  if (dados.texto.length < 5){ msg.textContent = 'Escreva um pouco mais sobre a ideia.'; return; }
  b.disabled = true; msg.textContent = 'Enviando...';
  try {
    const r = await fetch('/api/ideias', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(dados)});
    if (!r.ok) throw 0;
    f.reset(); msg.textContent = 'Recebido! Obrigado pela ideia. 🏆';
  } catch { msg.textContent = 'Não deu para enviar agora. Tente de novo ou escreva para contato@retrozap.com.br.'; }
  b.disabled = false;
});
</script>
""")

CSS_EXTRA = """
.form{display:flex;flex-direction:column;gap:8px;background:var(--acai);border-radius:16px;padding:18px;margin:16px 0}
.form label{font-weight:700;font-size:15px;margin-top:6px}
.form input,.form select,.form textarea{font:inherit;font-size:16px;color:var(--areia);background:var(--noite);border:1.5px solid var(--linha);border-radius:12px;padding:12px 14px;width:100%}
.form button{border:0;cursor:pointer;margin-top:10px;font:inherit;font-weight:700;font-size:16px;padding:14px 18px}
.form .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
ol,ul{padding-left:22px}li{margin:4px 0}
.resumo-priv{background:var(--acai);border:1px solid var(--linha);border-radius:16px;padding:16px 18px;margin:16px 0}
.resumo-priv ul{list-style:none;padding-left:0}.resumo-priv li{margin:10px 0}
h3{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:19px;line-height:1.2;margin:22px 0 6px}
code{font-size:14px;background:var(--acai);border-radius:6px;padding:2px 6px;overflow-wrap:anywhere}
.trilha{margin:8px 0 0}.trilha ol{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:4px}.trilha li{margin:0}.trilha li+li::before{content:'›';margin-right:4px}
.trilha a{color:var(--neblina)}.leia{margin-top:40px}.leia h2{margin-bottom:12px}
"""

# AdSense: IDs dos blocos de anúncio (AdSense > Anúncios > Por bloco de anúncios). Vazio = sem bloco nesse lugar.
AD_SLOT_PAGINAS = ''


def gtm_head(gtm_id):
    """Snippet do Google Tag Manager (vai logo depois do consentimento + gtag). Vazio = nada."""
    import os
    meta = '<script>' + open(os.path.join(os.path.dirname(__file__), 'meta_pixel.js'), encoding='utf-8').read() + '</script>\n'
    if not gtm_id: return meta
    return meta + ("<!-- GTM de mídia: só com aceite explícito e URL pública segura -->\n"
            "<script>(function(){function start(){try{if(window.RZ_GTM||localStorage.getItem('rz_marketing_v1')!=='sim'||!window.rzSafeMeasurementPage())return}catch(e){return}"
            "window.RZ_GTM=1;window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});"
            "var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id=" + gtm_id + "';document.head.appendChild(s)}"
            "window.addEventListener('rz:marketing-consent',start);window.addEventListener('rz:medicao-pronta',start);start()})();</script>\n")


def head_medicao(titulo='Retrozap'):
    """Consentimento (Consent Mode v2, padrão negado) + Google tag. Igual no app e nas páginas de conteúdo.
    ?btw_interno=1 grava um cookie de 1 ano que desliga GA4, pixel, GTM e Conversions API (compras de teste da equipe);
    ?btw_interno=0 apaga. O GA recebe só a origem de quem indicou a visita (nunca o endereço completo) e a URL sem
    parâmetros que não sejam de campanha."""
    import json
    return (r"""<!-- Consentimento (LGPD) + Google tag (gtag.js) -->
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
(function(){try{var q=location.search;if(/[?&]btw_interno=1(?:&|$)/.test(q))document.cookie='btw_interno=1; Max-Age=31536000; Path=/; SameSite=Lax; Secure';else if(/[?&]btw_interno=0(?:&|$)/.test(q))document.cookie='btw_interno=; Max-Age=0; Path=/; SameSite=Lax; Secure';window.RZ_INTERNO=/(?:^|;\s*)btw_interno=1(?:;|$)/.test(document.cookie)}catch(e){}
var ok=null;try{ok=localStorage.getItem('rz_cookies');}catch(e){}var mk=null;try{mk=localStorage.getItem('rz_marketing_v1');}catch(e){}var ad=ok==='sim'&&mk==='sim'?'granted':'denied';
gtag('consent','default',{ad_storage:ad,ad_user_data:ad,ad_personalization:ad,analytics_storage:ok==='sim'?'granted':'denied'});
if(ad==='denied'){(window.adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=1;}})();</script>
<script>if(!window.RZ_INTERNO&&/^(?:www\.)?retrozap\.com\.br$/.test(location.hostname)){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-R8R1EN0KQN';document.head.appendChild(s)}</script>
<script>
  gtag('js', new Date());
  gtag('config', 'G-R8R1EN0KQN', {page_title:@@TITULO@@,page_location:(function(){var u=new URL(location.href);u.hash='';for(var pair of Array.from(u.searchParams)){var k=pair[0],v=pair[1];if(/^utm_[a-z_]{2,20}$/.test(k)&&v.length<=200&&!/[@\u0000-\u001f]/.test(v))continue;if(/^(gclid|fbclid|gbraid|wbraid)$/.test(k)&&/^[a-z0-9_.-]{1,500}$/i.test(v))continue;u.searchParams.delete(k)}return u.origin+u.pathname+u.search})(),page_referrer:(function(){try{return document.referrer?new URL(document.referrer).origin+'/':''}catch(e){return''}})()});
</script>
""").replace('@@TITULO@@', json.dumps(titulo, ensure_ascii=False).replace('</', '<\\/'))


# Aviso de cookies: o mesmo componente no app e nas páginas de conteúdo (consentimento.js)
def consentimento_js():
    import os
    return open(os.path.join(os.path.dirname(__file__), 'consentimento.js'), encoding='utf-8').read()

CSS_COOKIES = """.cookies{position:fixed;left:0;right:0;bottom:0;z-index:30;background:var(--acai);border-top:1px solid var(--linha);box-shadow:0 -8px 24px rgba(10,4,20,.28);padding:12px max(16px,env(safe-area-inset-right,0px)) calc(12px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));font-size:14px;line-height:1.45;color:var(--areia);display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px 16px}
.cookies p{margin:0;flex:1 1 300px;max-width:560px;color:var(--areia);font-size:14px;line-height:1.45}
.cookies a{color:var(--areia);font-weight:700;text-decoration:underline;text-underline-offset:3px}
.ck-bts{display:flex;gap:10px;flex:1 1 260px;max-width:340px}
.ck-bt{flex:1 1 0;min-width:0;min-height:44px;border-radius:999px;padding:10px 14px;font:inherit;font-size:15px;font-weight:700;line-height:1.2;cursor:pointer}
.ck-nao{background:transparent;border:2px solid var(--neblina);color:var(--areia)}
.ck-sim{background:var(--manga);border:2px solid var(--manga);color:var(--noite)}
html.casal .ck-sim{color:#fff}
.ck-bt:focus-visible,.cookies a:focus-visible,.lk-ck:focus-visible{outline:3px solid var(--areia);outline-offset:2px}
.lk-ck{background:none;border:0;padding:0;min-height:24px;font:inherit;color:var(--areia);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
"""


# ---------- artigos novos (03/11/2026) ----------
AVISO_MARCA = '<p class="small">WhatsApp é marca da WhatsApp LLC. O Retrozap não tem relação com a empresa; usamos o nome só para explicar o passo a passo.</p>'
CTA_CASAL = '<p><a class="cta" href="/">Fazer a retrospectiva de vocês dois</a></p>'

NOVOS += [
('mensagens-de-fim-de-ano-para-grupo', 'Mensagens de fim de ano para grupo de WhatsApp: 60 textos prontos',
 '60 mensagens de Natal e Ano Novo para mandar no grupo dos amigos, da família e do trabalho: curtas, carinhosas e engraçadas, prontas para copiar.', """
<h1>Mensagens de fim de ano para grupo de WhatsApp: 60 textos prontos</h1>
<p>Dezembro chega e o grupo vira uma chuva de "Feliz Natal" e "Próspero Ano Novo". Dá para fugir do texto genérico sem escrever uma carta. Separamos 60 mensagens prontas para copiar, divididas pelo tipo de grupo e pelo tom. Troque os nomes, ajuste uma palavra ou outra e pronto.</p>
<h2>Dicas antes de mandar</h2>
<ul><li><b>Pense no grupo, não em você:</b> o grupo do trabalho pede um tom diferente do grupo dos primos.</li><li><b>Curto ganha:</b> ninguém lê textão no meio de 200 mensagens de Natal.</li><li><b>Fale de algo que aconteceu:</b> citar o churrasco de março ou a viagem que quase deu errado vale mais que qualquer frase bonita.</li><li><b>Escolha a hora:</b> mandar antes da meia-noite evita que a mensagem se perca na enxurrada da virada.</li><li><b>Evite correntes:</b> nada de "repasse para 10 grupos". Veja <a href="/blog/como-evitar-brigas-no-grupo-da-familia">como deixar o grupo da família em paz</a>.</li></ul>
<h2>Para o grupo de amigos</h2>
<ol><li>Mais um ano sobrevivendo a esse grupo. Obrigado por todas as risadas, os áudios longos e os rolês que quase saíram. Feliz Natal, galera!</li><li>Se 2026 foi bom, foi porque vocês estavam nele. Que 2027 tenha mais encontros e menos "fica pra próxima".</li><li>Brindando a mais um ano de resenha. Feliz Ano Novo, meus amigos!</li><li>Ano que vem a gente marca aquela viagem. Desta vez é sério. Feliz 2027!</li><li>Obrigado por estarem comigo nas boas e nas ruins (e nas de madrugada). Boas festas!</li><li>Que o 2027 de vocês tenha a energia de uma sexta-feira e a paz de um domingo.</li><li>Amizade é isso: a gente some, volta, manda um meme e está tudo igual. Feliz Natal!</li><li>Meu desejo para 2027: todo mundo confirmando presença e todo mundo aparecendo.</li><li>Fechando o ano com a certeza de que tenho os melhores amigos. Os mais barulhentos também.</li><li>Feliz Ano Novo para quem divide comigo a fofoca, o rateio e a vida.</li><li>Que venham mais 365 dias de grupo lotado de mensagem. Feliz 2027, turma!</li><li>Obrigado por mais um ano de parceria. Que a gente continue junto em todos os próximos.</li></ol>
<!--AD-->
<h2>Para o grupo da família</h2>
<ol start="13"><li>Família, obrigado por mais um ano de cuidado, de almoço de domingo e de "chegou bem?". Feliz Natal a todos!</li><li>Que a mesa de vocês esteja cheia e o coração mais ainda. Boas festas, família!</li><li>Neste Natal, agradeço por ter nascido no meio dessa bagunça tão amorosa.</li><li>Que 2027 traga saúde para os mais velhos, juízo para os mais novos e paciência para todos.</li><li>Família é quem segura a gente quando o ano pesa. Obrigado por isso. Feliz Ano Novo!</li><li>Saudade de quem está longe e gratidão por quem está perto. Feliz Natal, família querida.</li><li>Que o próximo ano tenha mais encontros do que fotos de encontros.</li><li>Obrigado, vó, pelo bom dia de todo dia. Obrigado, família, por estarem sempre aqui.</li><li>Feliz Natal para a família mais unida (e mais barulhenta) que eu conheço.</li><li>Que 2027 seja leve, cheio de saúde e de motivos para a gente se reunir.</li><li>Entre uma briga de futebol e outra, a gente se ama. Boas festas!</li><li>Desejo a cada um de vocês um ano novo com tudo o que a gente pede na hora da virada.</li></ol>
<h2>Para o grupo do trabalho</h2>
<ol start="25"><li>Obrigado ao time por mais um ano de parceria. Boas festas e um 2027 de muitas conquistas!</li><li>Foi um prazer trabalhar com vocês em 2026. Descansem bem e voltem com tudo.</li><li>Que o recesso seja de desconexão total. Até o ano que vem, equipe!</li><li>Feliz Natal a todos! Obrigado pela paciência, pelas entregas e pelo cafezinho.</li><li>Fechamos o ano juntos. Que 2027 venha com bons projetos e pouca reunião.</li><li>Agradeço a cada um pela colaboração em 2026. Boas festas para vocês e suas famílias.</li><li>Equipe, foi um ano intenso. Que o próximo seja produtivo e mais tranquilo.</li><li>Desejo a todos um Natal de descanso e um Ano Novo cheio de saúde.</li><li>Obrigado por tornarem os dias de trabalho mais leves. Feliz 2027!</li><li>Que a gente comece 2027 com a mesma energia com que terminou 2026. Boas festas, time!</li><li>Recesso merecido! Celebrem muito e até janeiro.</li><li>Obrigado pela confiança e pelo trabalho em equipe. Um ótimo Ano Novo a todos.</li></ol>
<h2>Curtas, para mandar rápido</h2>
<ol start="37"><li>Feliz Natal, pessoal! 🎄</li><li>Boas festas a todos!</li><li>Feliz 2027, que venha com tudo!</li><li>Saúde, paz e muito amor no Ano Novo.</li><li>Obrigado por 2026. Bora para 2027!</li><li>Um Natal leve para todo mundo.</li><li>Que 2027 seja gentil com a gente.</li><li>Feliz Ano Novo! Que seja incrível.</li><li>Boas festas e até o ano que vem!</li><li>Muito amor e pouco boleto em 2027.</li><li>Que o novo ano traga só coisa boa.</li><li>Feliz Natal e um 2027 cheio de encontros!</li></ol>
<h2>Engraçadas, para quebrar o gelo</h2>
<ol start="49"><li>Desejo a todos um 2027 com mais mensagens respondidas e menos "visualizou e não respondeu".</li><li>Feliz Natal para todos, inclusive para quem silenciou este grupo em março.</li><li>Meta para 2027: o grupo marcar um encontro e o encontro acontecer.</li><li>Que em 2027 os áudios sejam menores que 5 minutos. Amém.</li><li>Ano novo, mesmo grupo, mesmas figurinhas. E é por isso que a gente ama.</li><li>Feliz Ano Novo! Prometo responder todas as mensagens de 2026 até fevereiro.</li><li>Que 2027 seja tão animado quanto este grupo às duas da manhã.</li><li>Boas festas! Lembrando que o amigo secreto não é desculpa para sumir.</li><li>Feliz Natal ao fantasma do grupo, onde quer que esteja.</li><li>Em 2027 eu vou ser mais organizado. Disse eu, em 2026, 2025 e 2024.</li><li>Que o ano novo traga mais "kkkk" e menos "deu ruim".</li><li>Feliz 2027! Que o rateio do churrasco seja pago no prazo.</li></ol>
<h2>Feche o ano com a retrospectiva do grupo</h2>
<p>Quer uma mensagem de fim de ano que ninguém vai ignorar? Mande os números do ano. O <a href="/">Retrozap</a> lê a conversa exportada direto no seu celular e mostra quantas mensagens o grupo trocou em 2026, quem mais falou, quem mais riu, o assunto do ano e os prêmios de cada um. Dá para mandar o card de resumo junto com o "Feliz Ano Novo".</p>
<p>Para preparar a cerimônia, veja <a href="/blog/retrospectiva-do-grupo-de-whatsapp">como fazer a retrospectiva do grupo</a> e, se for juntar todo mundo, <a href="/blog/amigo-secreto-pelo-whatsapp">como organizar o amigo secreto pelo WhatsApp</a>.</p>
""" + CTA),

('nomes-para-grupo-de-whatsapp', '150 nomes para grupo de WhatsApp: família, amigos, trabalho e mais',
 'Ideias de nomes para grupo de WhatsApp da família, dos amigos, do trabalho, da faculdade, do futebol, do prédio e da viagem, com dicas para escolher.', """
<h1>150 nomes para grupo de WhatsApp</h1>
<p>Todo grupo nasce com um nome provisório, tipo "Churrasco sábado", e anos depois continua com ele. Se você vai criar um grupo novo ou quer finalmente dar um nome à altura da turma, aqui vão 150 ideias, separadas por tipo de grupo. Onde aparece algo entre colchetes, troque pelo sobrenome, pelo ano ou pelo lugar de vocês.</p>
<h2>Como escolher um bom nome</h2>
<ul><li><b>Curto:</b> o nome aparece cortado na lista de conversas e nas notificações. Duas ou três palavras bastam.</li><li><b>Fácil de achar:</b> um emoji no começo ajuda a encontrar o grupo no meio de tantos outros.</li><li><b>Com a cara da turma:</b> uma piada interna funciona, desde que todo mundo entenda e ninguém se sinta zoado.</li><li><b>Pensando no futuro:</b> "Formatura 2026" vira estranho em 2030. Se o grupo vai durar, prefira algo atemporal.</li><li><b>Combinando com a foto:</b> nome e foto do grupo juntos contam a mesma história.</li><li><b>Avisando a mudança:</b> trocar o nome do nada confunde. Mande uma mensagem antes ou faça uma enquete.</li></ul>
<p>Não conseguiu decidir? Escolha três favoritos desta lista e coloque numa enquete no próprio grupo. Além de resolver a dúvida, já é a primeira conversa da turma.</p>
<h2>Nomes para grupo da família</h2>
<ol><li>Família Reunida</li><li>Os Mais Chegados</li><li>Clã dos [Sobrenome]</li><li>Raízes</li><li>Casa da Vó</li><li>Almoço de Domingo</li><li>Família Unida Jamais Será Vencida</li><li>Galho Torto da Árvore</li><li>Os Primos</li><li>Primaiada</li><li>Herdeiros do Nada</li><li>Família Buscapé</li><li>Tribo [Sobrenome]</li><li>Mesa Farta</li><li>Ninho</li><li>Bom Dia, Família</li><li>Os Parentes</li><li>Família Margarina</li><li>Sangue Bom</li><li>Árvore Genealógica</li><li>Família Doidinha</li><li>Netos da Vó [Nome]</li><li>Grupo da Paz (por enquanto)</li><li>Natal o Ano Todo</li><li>Café na Casa da Tia</li></ol>
<!--AD-->
<h2>Nomes para grupo de amigos</h2>
<ol start="26"><li>Os de Sempre</li><li>Resenha</li><li>Bonde</li><li>Panelinha</li><li>Os Inseparáveis</li><li>Turma do Barulho</li><li>Só os Brabos</li><li>Conselho dos Sábios</li><li>Amigos de Infância</li><li>Rolê Aleatório</li><li>Bando de Loucos</li><li>Melhores Amigos</li><li>Os Sem Juízo</li><li>Diretoria</li><li>Sócios do Caos</li><li>Grupo de Apoio Emocional</li><li>Resenha Infinita</li><li>Os Furões</li><li>Confraria</li><li>QG</li><li>A Família que a Gente Escolheu</li><li>Plano B</li><li>Esquadrão</li><li>Os Desocupados</li><li>Mesa do Bar</li></ol>
<h2>Nomes para trabalho e estudo</h2>
<h3>Trabalho</h3>
<ol start="51"><li>Equipe [Área]</li><li>Time [Projeto]</li><li>Avisos da Equipe</li><li>Café com a Equipe</li><li>Força-Tarefa</li><li>Squad [Nome]</li><li>Alinhamentos</li><li>Pauta do Dia</li><li>Turma do Cafezinho</li><li>Happy Hour</li><li>Plantão [Área]</li><li>Time dos Sonhos</li><li>Central de Avisos</li><li>Escritório Paralelo</li><li>Comercial em Ação</li><li>Operação [Projeto]</li><li>Ideias em Pauta</li><li>Bastidores</li><li>Corredor</li><li>Almoço da Firma</li></ol>
<h3>Faculdade e escola</h3>
<ol start="71"><li>Turma [Ano]</li><li>Formandos [Ano]</li><li>Calouros [Ano]</li><li>Sala [Número]</li><li>Trabalho Final</li><li>Socorro, Prova</li><li>Resumos e Desesperos</li><li>Pais do [Série]</li><li>Mães e Pais da Turma</li><li>Revisão de Véspera</li><li>Fundão</li><li>Intervalo</li><li>TCC Sem Fim</li><li>Biblioteca Fantasma</li><li>Grupo de Estudos (só de nome)</li></ol>
<h2>Nomes para esporte, prédio e viagem</h2>
<h3>Futebol e esporte</h3>
<ol start="86"><li>Pelada de Quinta</li><li>Futebol dos Amigos</li><li>Racha de Domingo</li><li>Time da Firma</li><li>Vôlei de Praia</li><li>Beach Tennis da Galera</li><li>Corredores de Fim de Semana</li><li>Pedal de Domingo</li><li>Bolão da Copa</li><li>Resenha Pós-Jogo</li><li>Craques Aposentados</li><li>Arquibancada</li><li>Joelho Ruim FC</li><li>Academia Sem Desculpa</li><li>Trilheiros</li></ol>
<h3>Prédio e vizinhança</h3>
<ol start="101"><li>Moradores do [Prédio]</li><li>Vizinhos do Bloco A</li><li>Avisos do Condomínio</li><li>Rua [Nome] Unida</li><li>Vizinhança Solidária</li><li>Indicações do Prédio</li><li>Classificados do Prédio</li><li>Pets do Condomínio</li><li>Caronas do Bairro</li><li>Feira de Trocas</li><li>Hall de Entrada</li><li>Mães e Pais do Condomínio</li><li>Horta Comunitária</li><li>Bairro em Alerta</li><li>Encomendas e Achados</li></ol>
<h3>Viagens e eventos</h3>
<ol start="116"><li>[Destino] [Ano]</li><li>Partiu [Destino]</li><li>Rumo à Praia</li><li>Mochilão</li><li>Contagem Regressiva</li><li>Casa de Praia</li><li>Carnaval [Ano]</li><li>Réveillon [Ano]</li><li>Despedida de Solteiro(a)</li><li>Chá de Bebê da [Nome]</li><li>Aniversário Surpresa (sem o aniversariante!)</li><li>Racha da Viagem</li><li>Bate e Volta</li><li>Show do Ano</li><li>Ilha de Edição (só as fotos)</li></ol>
<h2>Nomes engraçados para qualquer grupo</h2>
<ol start="131"><li>Grupo Sem Nome</li><li>Ninguém Responde</li><li>Silenciado por 8 Horas</li><li>Áudio de 5 Minutos</li><li>Visualizou e Saiu</li><li>Kkkkkkk</li><li>Só Memes</li><li>Tô Saindo (Não Tô)</li><li>Central de Fofoca</li><li>Fofoca com Recibo</li><li>Melhor Grupo do Zap</li><li>Grupo Teste (que virou oficial)</li><li>Criado para um Churrasco em 2019</li><li>Respondo Depois</li><li>Gente que Some</li><li>Os Sem Wi-Fi</li><li>Bom Dia Só Amanhã</li><li>Senta que Lá Vem História</li><li>Risada Garantida</li><li>Aqui Ninguém Trabalha</li></ol>
<h2>Depois do nome, a história</h2>
<p>Nome escolhido, grupo criado. Agora vale combinar o básico para ele não virar bagunça: veja um <a href="/blog/regras-para-grupo-de-whatsapp">modelo de regras para grupo</a> pronto para copiar. Se o grupo já existe há anos e anda quieto, tem <a href="/blog/brincadeiras-para-grupo-de-whatsapp">30 brincadeiras para fazer hoje</a>.</p>
<p>E quando o grupo já tiver histórico, dá para descobrir quem é o Tagarela, quem é o Fantasma e qual é a gíria oficial da turma com a <a href="/blog/retrospectiva-do-grupo-de-whatsapp">retrospectiva do grupo</a> no <a href="/">Retrozap</a>. A leitura acontece no seu celular e as mensagens não saem dele.</p>
""" + CTA),

('regras-para-grupo-de-whatsapp', 'Regras para grupo de WhatsApp: modelo pronto para copiar',
 'Modelos de regras para grupo de WhatsApp da família, do condomínio, do trabalho e da escola, e como aplicar com as ferramentas de administrador.', """
<h1>Regras para grupo de WhatsApp: modelo pronto para copiar</h1>
<p>Grupo sem combinado vira o lugar de tudo: corrente, briga de política, venda de rifa e áudio às três da manhã. Algumas regras simples, escritas no começo, evitam a maior parte das confusões. Abaixo estão modelos prontos para quatro tipos de grupo. Copie, ajuste e cole na descrição.</p>
<h2>Por que vale a pena ter regras</h2>
<ul><li><b>Todo mundo sabe o que esperar:</b> quem entra entende para que serve o grupo.</li><li><b>O administrador não vira vilão:</b> quando alguém sai da linha, a regra já estava lá; não é algo pessoal.</li><li><b>O grupo continua útil:</b> aviso importante não se perde no meio de 300 figurinhas.</li><li><b>Menos gente silenciando:</b> grupo organizado é grupo que as pessoas leem.</li></ul>
<p>O segredo é ter poucas regras. Cinco a oito itens, em frases curtas. Ninguém lê um regulamento de duas páginas.</p>
<h2>Modelo para grupo da família</h2>
<ol><li>Este grupo é para a gente se falar, combinar encontros e dividir boas notícias.</li><li>Política, religião e futebol com respeito. Se esquentar, a conversa continua no privado.</li><li>Antes de repassar notícia, confira se é verdade. Na dúvida, não mande.</li><li>Nada de corrente ("repasse para 10 pessoas").</li><li>Pedido de dinheiro por mensagem? Ligue para a pessoa antes. Golpe acontece.</li><li>Áudio é bem-vindo, mas, se passar de dois minutos, pense num resumo.</li><li>Aniversário de alguém? Parabéns no grupo e, se der, uma ligação.</li></ol>
<p>Para o grupo da família, tem um guia inteiro sobre <a href="/blog/como-evitar-brigas-no-grupo-da-familia">como evitar brigas por política, fake news e correntes</a>.</p>
<!--AD-->
<h2>Modelo para grupo do condomínio</h2>
<ol><li>Grupo para avisos, indicações e emergências dos moradores.</li><li>Reclamações sérias vão para o síndico ou a administração, não para o grupo.</li><li>Mensagens entre 22h e 7h só em emergência.</li><li>Vendas e anúncios só às [dia da semana] (ou: não são permitidos).</li><li>Sem política, correntes e propaganda.</li><li>Ao entrar, apresente-se com nome e apartamento.</li><li>Ao mudar, avise o administrador para sair do grupo.</li></ol>
<p>Ideias para deixar o grupo do prédio mais leve estão em <a href="/blog/grupo-do-condominio">grupo do condomínio: prêmios e boa convivência</a>.</p>
<h2>Modelo para grupo do trabalho</h2>
<ol><li>Grupo para recados rápidos da equipe. Assunto longo ou sensível vai por e-mail ou reunião.</li><li>Horário: de segunda a sexta, das [9h] às [18h]. Fora disso, só urgência.</li><li>Ninguém é obrigado a responder fora do expediente.</li><li>Sem dados de clientes, senhas ou documentos internos.</li><li>Elogio no grupo, crítica no privado.</li><li>Figurinha à vontade, desde que não atrapalhe os avisos.</li></ol>
<h2>Modelo para grupo de pais da escola</h2>
<ol><li>Grupo para avisos da turma: datas, materiais, passeios e eventos.</li><li>Problema com professor ou com outra criança: fale direto com a escola.</li><li>Não poste fotos de outras crianças sem autorização dos pais.</li><li>Evite "alguém sabe?" sem antes olhar o comunicado da escola.</li><li>Sem vendas, rifas ou correntes, a não ser de eventos da própria turma.</li><li>Mensagens até as [21h].</li></ol>
<h2>Como aplicar as regras na prática</h2>
<p>Regra escrita só funciona se estiver à vista e se o grupo tiver ferramentas para ela. O WhatsApp oferece algumas para quem é administrador. Os nomes podem mudar um pouco conforme a versão do aplicativo:</p>
<ul><li><b>Descrição do grupo:</b> cole as regras ali. Quem entra vê logo nas informações do grupo.</li><li><b>Fixar mensagem:</b> mande as regras e fixe no topo da conversa.</li><li><b>Só administradores enviam mensagens:</b> nas configurações do grupo, em "Enviar mensagens". Útil para grupos de aviso, como o do condomínio ou da escola.</li><li><b>Só administradores editam os dados do grupo:</b> evita que alguém troque o nome e a foto por brincadeira.</li><li><b>Aprovar novos participantes:</b> quem entra pelo link precisa de aprovação de um administrador.</li><li><b>Apagar para todos:</b> administradores podem apagar mensagens de outras pessoas no grupo, como uma corrente ou um golpe.</li><li><b>Mais de um administrador:</b> divida a tarefa. Assim ninguém fica sozinho na posição de chato.</li></ul>
<h3>Quando alguém descumpre</h3>
<p>Comece pelo privado, com calma: "Oi, a gente combinou X no grupo, tudo bem?". Só remova alguém se a pessoa insistir depois de avisada. E revise as regras de tempos em tempos: se ninguém respeita uma delas, talvez ela não faça sentido para aquele grupo.</p>
<h2>Regras também podem ser divertidas</h2>
<p>Grupo com regra não precisa ser grupo chato. Um bom jeito de aliviar o clima é fechar o ano com uma premiação: quem mandou mais mensagens, quem mais sumiu, quem mais deu bom dia. O <a href="/">Retrozap</a> calcula tudo a partir da conversa exportada, sem as mensagens saírem do seu celular. Veja também <a href="/blog/nomes-para-grupo-de-whatsapp">150 ideias de nomes para o grupo</a>.</p>
""" + CTA),
]

NOVOS += [
('brincadeiras-para-grupo-de-whatsapp', '30 brincadeiras para grupo de WhatsApp (para fazer hoje)',
 'Brincadeiras rápidas para grupo de WhatsApp: com texto, foto, áudio, adivinhação e desafios da semana. Funcionam com amigos, família e trabalho.', """
<h1>30 brincadeiras para grupo de WhatsApp (para fazer hoje)</h1>
<p>Nem toda brincadeira precisa de planejamento. As 30 ideias abaixo começam com uma única mensagem e funcionam em grupo de amigos, da família e até do trabalho, ajustando o tom. Escolha uma, mande agora e veja quem morde a isca primeiro.</p>
<h2>Como puxar a brincadeira sem forçar</h2>
<ul><li><b>Comece você:</b> responda a própria brincadeira primeiro. Fica mais fácil para os outros entrarem.</li><li><b>Explique em uma linha:</b> regra que precisa de parágrafo não pega.</li><li><b>Escolha a hora:</b> fim de tarde e noite costumam render mais do que o meio do expediente.</li><li><b>Não cobre resposta:</b> quem quiser entra. Marcar o fantasma do grupo é permitido, com carinho.</li></ul>
<h2>Rápidas, só com texto</h2>
<ol><li><b>Complete a frase:</b> "Este grupo sem mim seria...".</li><li><b>Meu dia em 3 emojis:</b> cada um descreve o dia só com emojis, e os outros tentam traduzir.</li><li><b>Duas verdades e uma mentira:</b> cada um conta três fatos sobre si, e o grupo descobre qual é o falso.</li><li><b>Isso ou aquilo:</b> praia ou montanha, pizza ou hambúrguer, áudio ou texto. Uma pergunta por rodada.</li><li><b>Quem do grupo é mais provável de...:</b> "...esquecer o próprio aniversário?", "...ser famoso?". Dá para fazer com a enquete do WhatsApp.</li><li><b>Filme em emojis:</b> alguém manda um filme só com emojis, e quem acertar manda o próximo.</li><li><b>Música em emojis:</b> a mesma ideia, com músicas. Funk, sertanejo e pagode rendem ótimas charadas.</li><li><b>Alfabeto do tema:</b> escolha um tema (comida, cidade, novela) e cada um manda uma palavra seguindo a ordem do alfabeto.</li></ol>
<h2>Com fotos e áudios</h2>
<ol start="9"><li><b>Quinta foto da galeria:</b> cada um manda a quinta foto mais recente, sem trapaça (e sem nada constrangedor, combinado?).</li><li><b>Vista da janela:</b> todo mundo manda a vista de onde está agora.</li><li><b>Geladeira aberta:</b> uma foto da geladeira e o grupo julga a dieta de cada um.</li><li><b>Quem é o bebê?:</b> cada um manda uma foto de criança no privado para uma pessoa, que posta todas e o grupo adivinha quem é quem.</li><li><b>Trava-língua em áudio:</b> "O rato roeu a roupa do rei de Roma", três vezes rápido.</li><li><b>Cantarola e adivinha:</b> um áudio cantarolando uma música só com "lalalá", e o grupo tenta acertar.</li><li><b>Narração esportiva:</b> narre em áudio algo bobo do seu dia, como um gol de Copa.</li><li><b>Tela inicial:</b> print da tela inicial do celular. Diz muito sobre cada um.</li></ol>
<!--AD-->
<h2>Para adivinhar</h2>
<ol start="17"><li><b>Quem sou eu?:</b> alguém pensa numa pessoa famosa e o grupo só pode fazer perguntas de sim ou não.</li><li><b>Onde estou?:</b> foto de um detalhe de um lugar que todos conhecem, e o grupo adivinha onde é.</li><li><b>Charada do dia:</b> uma charada por dia, e a resposta só no dia seguinte.</li><li><b>Vinte perguntas:</b> alguém pensa num objeto, e o grupo tem até 20 perguntas para descobrir.</li><li><b>Stop pelo grupo:</b> sorteie uma letra e as categorias (nome, cidade, fruta, marca). Quem completar primeiro manda "stop".</li><li><b>Quiz da história do grupo:</b> "Em que ano foi aquele churrasco da chuva?", "Quem mandou o primeiro áudio?".</li><li><b>Bolão dos prêmios:</b> todo mundo aposta quem foi o Tagarela, o Fantasma e o Rei do Kkkk do ano. Depois, a <a href="/blog/retrospectiva-do-grupo-de-whatsapp">retrospectiva do grupo</a> revela quem acertou.</li></ol>
<h2>Desafios para a semana toda</h2>
<ol start="24"><li><b>Sete dias, sete temas:</b> segunda é "café da manhã", terça é "sapato", quarta é "algo azul", e por aí vai.</li><li><b>Indicação da semana:</b> cada semana, alguém indica um livro, um filme ou uma série, e quem assistir comenta.</li><li><b>Bolão sem dinheiro:</b> palpites para o jogo do fim de semana, para o reality ou para a premiação de cinema. O prêmio é o direito de se gabar.</li><li><b>História coletiva:</b> alguém começa uma história com uma frase e cada um continua de onde o anterior parou.</li><li><b>Desafio da água:</b> cada um manda a garrafa vazia do dia. Leve e saudável.</li><li><b>Caça ao meme mais antigo:</b> quem achar o meme mais antigo do grupo, rolando a conversa, ganha.</li><li><b>Cápsula do tempo:</b> cada um escreve uma previsão para o ano que vem. Fixe a mensagem e releia em dezembro.</li></ol>
<h2>Para todo mundo entrar na brincadeira</h2>
<p>Em grupo grande, prefira brincadeiras rápidas e com enquete, que dão para responder com um toque. Em grupo de trabalho, fique nas leves, como isso ou aquilo, indicação da semana e vista da janela. Na família, quiz da história e quem é o bebê costumam fazer até os mais quietos aparecerem.</p>
<p>Se o grupo está parado há meses, comece pelas <a href="/blog/como-reanimar-grupo-parado">12 ideias para reanimar um grupo parado</a>. E se a brincadeira for virar encontro, veja <a href="/blog/jogos-para-jogar-com-amigos-e-familia">jogos para animar o encontro</a>.</p>
<p>Uma última ideia, que vale por várias: no fim do ano, faça a cerimônia de prêmios do grupo no <a href="/">Retrozap</a>. Ele lê a conversa no seu celular e mostra quem mais falou, quem mais riu e quem sumiu. Os palpites da brincadeira 23 finalmente têm resposta.</p>
""" + CTA),

('perguntas-para-casal', '100 perguntas para casal: para conhecer, rir e relembrar',
 '100 perguntas para fazer ao namorado ou à namorada: para se conhecer melhor, rir juntos, relembrar a história de vocês e falar do futuro.', """
<h1>100 perguntas para casal: para conhecer, rir e relembrar</h1>
<p>Mesmo quem está junto há anos ainda tem muita coisa para descobrir um sobre o outro. Uma boa pergunta transforma um jantar comum numa conversa que vocês vão lembrar. Separamos 100 perguntas em quatro climas: para se conhecer, para rir, para relembrar e para falar do futuro.</p>
<h2>Como usar as perguntas</h2>
<ul><li><b>No jantar ou na estrada:</b> uma pergunta por vez, sem pressa. Viagem de carro é o lugar perfeito.</li><li><b>Sorteio:</b> escolham um número de 1 a 100 e respondam o que cair.</li><li><b>Pelo WhatsApp:</b> mande uma pergunta por dia no meio do expediente. Vira um respiro na rotina.</li><li><b>Os dois respondem:</b> quem pergunta também responde. Vale para todas.</li><li><b>Sem julgamento:</b> resposta sincera merece escuta, não debate.</li></ul>
<h2>Para se conhecer melhor</h2>
<ol><li>Qual foi sua primeira impressão de mim?</li><li>Qual lembrança de infância você mais gosta?</li><li>O que faz você se sentir amado(a) de verdade?</li><li>Qual sonho você ainda não contou para ninguém?</li><li>Do que você tem medo?</li><li>Como seria o seu domingo perfeito?</li><li>Que hábito meu você acha mais fofo?</li><li>Qual música te lembra de mim?</li><li>O que você faria com um ano sabático?</li><li>Quem mais te marcou na adolescência?</li><li>Qual é a sua comida de conforto?</li><li>O que você gostaria de aprender este ano?</li><li>Qual elogio você nunca esqueceu?</li><li>Como você gosta de ser cuidado(a) quando está doente?</li><li>O que te irrita e você não costuma falar?</li><li>Qual viagem mudou o seu jeito de ver as coisas?</li><li>Do que você mais se orgulha?</li><li>Qual é o seu jeito preferido de fazer as pazes?</li><li>Qual foi o presente mais especial que você já recebeu?</li><li>Que conselho você daria para você aos 15 anos?</li><li>Qual é a sua maior mania?</li><li>O que você acha que eu ainda não sei sobre você?</li><li>Qual livro, filme ou série diz muito sobre você?</li><li>Qual é a sua tradição de família preferida?</li><li>Como você sabe que está tudo bem entre a gente?</li></ol>
<h2>Para rir juntos</h2>
<ol start="26"><li>Qual foi o maior mico que você já pagou na minha frente?</li><li>Se a gente fosse um casal de novela, qual seria o nome da novela?</li><li>Quem de nós dois sobreviveria mais tempo num apocalipse zumbi?</li><li>Qual foi a coisa mais estranha que você já comeu?</li><li>Que apelido meu você mais odeia (e usa mesmo assim)?</li><li>Se eu fosse um animal, qual seria?</li><li>Qual é a pior música que você sabe a letra inteira?</li><li>Quem de nós dois ronca mais? Seja honesto(a).</li><li>Qual foi a desculpa mais esfarrapada que você já deu?</li><li>Se a gente tivesse um programa de culinária, qual seria o prato de estreia?</li><li>Qual é o meu pior hábito na cozinha?</li><li>Quem demora mais para se arrumar?</li><li>Qual foi o motivo mais bobo de uma briga nossa?</li><li>Se você trocasse de corpo comigo por um dia, o que faria primeiro?</li><li>Qual pessoa famosa você acha parecida comigo?</li><li>Que figurinha resume o nosso relacionamento?</li><li>Qual foi a mensagem mais sem noção que você já me mandou?</li><li>Quem de nós dois perderia num jogo de mímica?</li><li>Qual seria o título do filme da nossa vida?</li><li>Que superpoder inútil você gostaria de ter?</li><li>Quem fica mais dramático quando está gripado?</li><li>O que você faria com um dia inteiro sem celular?</li><li>Qual bordão meu você mais imita?</li><li>Quem de nós dois manda mais áudio longo?</li><li>Se a gente abrisse um negócio juntos, o que seria?</li></ol>
<!--AD-->
<h2>Para relembrar a história de vocês</h2>
<ol start="51"><li>Onde e quando foi o nosso primeiro encontro?</li><li>O que você pensou no nosso primeiro beijo?</li><li>Qual foi a primeira mensagem que você me mandou?</li><li>Quando você percebeu que estava gostando de mim?</li><li>Qual é a sua foto preferida de nós dois?</li><li>Qual viagem nossa você repetiria amanhã?</li><li>Qual foi o dia mais engraçado que passamos juntos?</li><li>Como foi me apresentar para a sua família?</li><li>Qual presente meu você mais guardou?</li><li>Qual foi o nosso maior perrengue juntos?</li><li>Que música tocou num momento importante para a gente?</li><li>Qual foi o primeiro filme que vimos juntos?</li><li>Como foi a nossa primeira briga de verdade e como resolvemos?</li><li>Qual foi o melhor aniversário que passamos juntos?</li><li>De qual piada interna nossa você mais ri?</li><li>Qual foi a comida mais marcante que comemos juntos?</li><li>Qual foi a primeira coisa que você comprou pensando em mim?</li><li>Teve algum dia em que você sentiu muito orgulho de mim?</li><li>Qual foi o melhor conselho que eu já te dei?</li><li>Que lugar da cidade tem a nossa cara?</li><li>Qual foi o momento mais difícil que a gente superou?</li><li>Qual foi o "eu te amo" mais inesperado?</li><li>Que hábito a gente criou junto sem perceber?</li><li>O que mudou em você desde que a gente começou?</li><li>Em que dia você pensou "é essa pessoa"?</li></ol>
<h2>Para falar do futuro</h2>
<ol start="76"><li>Onde você se imagina morando daqui a cinco anos?</li><li>Qual viagem a gente precisa fazer juntos um dia?</li><li>Como seria a nossa casa dos sonhos?</li><li>Que tradição você quer que a gente crie?</li><li>O que você quer aprender junto comigo?</li><li>Como você imagina a gente velhinhos?</li><li>Qual meta a gente pode ter para o próximo ano?</li><li>Bicho de estimação: sim ou não? Qual?</li><li>O que a gente deveria fazer mais vezes?</li><li>E o que a gente deveria fazer menos?</li><li>Como você quer comemorar o nosso próximo aniversário de namoro?</li><li>Que sonho seu eu posso ajudar a realizar?</li><li>Qual hábito você gostaria que a gente mudasse?</li><li>Como a gente pode dividir melhor as tarefas de casa?</li><li>Como seria o nosso fim de semana perfeito daqui a dez anos?</li><li>Que lugar do Brasil a gente ainda precisa conhecer?</li><li>Como seria a festa para comemorar uma conquista grande nossa?</li><li>Qual é o seu maior plano para os próximos anos?</li><li>Como você quer que eu te apoie quando estiver difícil?</li><li>O que a gente quer guardar para sempre deste momento?</li><li>Que conselho a gente daria para um casal que está começando?</li><li>Qual foto a gente ainda precisa tirar?</li><li>O que você nunca quer que mude entre a gente?</li><li>Que promessa pequena você me faz para este ano?</li><li>Se a gente escrevesse uma carta para nós dois daqui a dez anos, o que ela diria?</li></ol>
<h2>Algumas respostas a conversa de vocês já sabe</h2>
<p>Quem manda mais mensagem? Quem dá bom dia primeiro? Quem faz mais perguntas? Quem diz mais "te amo"? Vocês podem discutir por horas, ou conferir na conversa do WhatsApp. O modo Casais do <a href="/">Retrozap</a> lê a conversa exportada no próprio celular e entrega prêmios como Tagarela do Casal, Mais Romântico, Despertador do Amor e Mil Perguntas, além de um placar de vocês dois. A retrospectiva de casal faz parte do acesso ilimitado, com pagamento único.</p>
<p>Gostou da ideia? Veja <a href="/blog/retrospectiva-de-namoro">como fazer uma retrospectiva de namoro</a> e mais <a href="/blog/presente-criativo-para-namorado">presentes criativos e baratos para namorado(a)</a>. Para ir além das perguntas, o jogo <a href="/blog/jogos-para-jogar-com-amigos-e-familia">Quem do Casal</a> também rende boas risadas.</p>
""" + CTA_CASAL),

('retrospectiva-de-namoro', 'Retrospectiva de namoro: como fazer uma com a conversa de vocês no WhatsApp',
 'Ideia de presente para aniversário de namoro e Dia dos Namorados: transforme a conversa do casal no WhatsApp em números, prêmios e cards. Passo a passo e outras ideias.', """
<h1>Retrospectiva de namoro: como fazer uma com a conversa de vocês</h1>
<p>A história de um casal está espalhada em fotos, viagens e datas. Mas o dia a dia está quase todo num lugar só: a conversa do WhatsApp. O primeiro "oi", os bons-dias, os áudios de saudade, as brigas bobas e as pazes. Transformar isso numa retrospectiva é um presente pessoal, barato e que ninguém mais conseguiria dar.</p>
<h2>Por que a conversa é o melhor material</h2>
<ul><li><b>Tem tudo registrado:</b> datas, horários, quem puxou o assunto, quem respondeu primeiro.</li><li><b>Mostra o que a memória esquece:</b> quantas mensagens vocês trocaram, em que mês conversaram mais, quantas vezes disseram "te amo".</li><li><b>É só de vocês:</b> nenhum outro casal tem os mesmos números.</li><li><b>Combina com qualquer data:</b> aniversário de namoro, Dia dos Namorados, Natal ou um "só porque sim".</li></ul>
<h2>O que entra numa retrospectiva de namoro</h2>
<ul><li>Há quanto tempo vocês conversam e quantas mensagens trocaram em cada ano.</li><li>Quem manda mais mensagem e quem manda mais áudio.</li><li>Quem puxa o papo de manhã e quem dá mais boa-noite.</li><li>Quem é mais romântico, com contagem de declarações.</li><li>Quem faz mais perguntas e quem mais pede desculpas.</li><li>O ano de vocês em números, com cards para guardar ou mandar um para o outro.</li></ul>
<!--AD-->
<h2>Passo a passo no Retrozap Casais</h2>
<ol><li><b>Exporte a conversa de vocês.</b> No WhatsApp, abra a conversa, toque no nome da pessoa e escolha Exportar conversa, Sem mídia. <a href="/blog/como-exportar-conversa-whatsapp">Veja o passo a passo com vídeo</a>.</li><li><b>Abra o <a href="/">Retrozap</a> e escolha Casais.</b> Toque em Começar e escolha o arquivo que você salvou.</li><li><b>Confira os dados.</b> O site mostra quantas mensagens encontrou e o período. Dá para editar o nome do casal.</li><li><b>Veja a primeira parte.</b> Há quanto tempo vocês conversam e o gráfico de mensagens ano a ano aparecem antes de qualquer pagamento.</li><li><b>Libere os prêmios.</b> A retrospectiva de casal faz parte do acesso ilimitado, com pagamento único no Pix ou no cartão.</li><li><b>Revele um prêmio por vez:</b> Tagarela do Casal, Mais Romântico, Despertador do Amor, Mil Perguntas, Podcaster do Casal e outros.</li><li><b>Guarde os cards e o vídeo.</b> No fim aparecem o placar de vocês dois, cards como o Recibo do amor e um vídeo curto para os stories.</li></ol>
<p>A leitura do arquivo acontece no seu celular. As mensagens de vocês não são enviadas para nenhum servidor. <a href="/blog/privacidade-ao-analisar-conversas-do-whatsapp">Entenda como funciona</a>.</p>
<h2>Como entregar o presente</h2>
<ul><li><b>Revelação ao vivo:</b> no jantar, peça para a outra pessoa dar palpite antes de cada prêmio. Quem acertar mais escolhe a sobremesa.</li><li><b>Cards impressos:</b> imprima os cards e monte um mural ou coloque num porta-retrato.</li><li><b>Junto com uma carta:</b> os números contam o quanto vocês conversam; a carta conta o que isso significa.</li><li><b>Às 0h da data:</b> mande o vídeo no exato minuto em que começa o aniversário de namoro.</li><li><b>Como abertura de uma surpresa:</b> o último card avisa "agora olhe para trás".</li></ul>
<h2>Outras ideias de retrospectiva</h2>
<ul><li><b>Álbum de fotos:</b> uma foto por mês, com uma legenda curta escrita à mão.</li><li><b>Linha do tempo:</b> datas marcantes num papel comprido, do primeiro encontro até hoje.</li><li><b>Playlist da relação:</b> uma música para cada fase, com a ordem contando a história.</li><li><b>Pote das memórias:</b> papeizinhos com lembranças para abrir um por semana.</li><li><b>Recriar o primeiro encontro:</b> mesmo lugar, mesmo pedido, outra conversa.</li><li><b>Prints favoritos:</b> as mensagens mais engraçadas ou mais fofas, num caderninho.</li></ul>
<p>Mais ideias em <a href="/blog/presente-criativo-para-namorado">25 presentes criativos e baratos</a> e, para a conversa no jantar, <a href="/blog/perguntas-para-casal">100 perguntas para casal</a>.</p>
<h2>Dúvidas comuns</h2>
<p><b>A gente conversa pouco pelo WhatsApp. Funciona?</b> Funciona melhor com bastante conversa. Se vocês moram juntos e quase não trocam mensagem, os números ficam tímidos, mas ainda dá para ver quem puxa o papo e quem manda mais "boa noite". Se o arquivo vier muito curto, o site avisa.</p>
<p><b>Preciso exportar com fotos e áudios?</b> Não. Sem mídia o arquivo fica leve e todas as contagens funcionam do mesmo jeito.</p>
<p><b>A outra pessoa fica sabendo?</b> Não. Exportar a conversa não manda aviso para ninguém, então a surpresa está garantida até a hora da revelação.</p>
<p><b>Dá para testar antes?</b> Dá. No início do site tem um exemplo com uma conversa fictícia, para você ver como fica antes de usar a de vocês.</p>
<h2>Um cuidado importante</h2>
<p>A conversa é dos dois. Faça a retrospectiva com a conversa de vocês e combine antes de postar qualquer card fora do casal. O que é fofo entre duas pessoas nem sempre precisa estar nos stories.</p>
""" + CTA_CASAL),
]

NOVOS += [
('presente-criativo-para-namorado', '25 presentes criativos e baratos para namorado(a)',
 'Ideias de presentes criativos e baratos para namorado ou namorada: feitos à mão, experiências, digitais e comidinhas para aniversário de namoro, Natal e Dia dos Namorados.', """
<h1>25 presentes criativos e baratos para namorado(a)</h1>
<p>Presente que marca não é o mais caro, é o que só você poderia ter dado. Juntamos 25 ideias criativas que cabem no bolso e funcionam para aniversário de namoro, Natal, Dia dos Namorados ou para uma surpresa no meio da semana.</p>
<h2>Como escolher o presente certo</h2>
<ul><li><b>Pense no que a pessoa comenta:</b> aquela vontade que ela citou de passagem é uma pista melhor que qualquer lista.</li><li><b>Personalize:</b> um detalhe que só vocês entendem vale mais que um objeto caro.</li><li><b>Tempo também é presente:</b> uma tarde planejada com carinho costuma ser lembrada por mais tempo que um objeto.</li><li><b>Combine com o momento:</b> namoro novo pede algo leve; anos juntos pedem algo que conte a história de vocês.</li><li><b>Defina um teto antes:</b> com o valor na cabeça, fica mais fácil gastar a criatividade em vez do cartão.</li></ul>
<p>Uma boa regra é juntar duas coisas da lista: algo para guardar (uma carta, um objeto) e algo para viver (uma experiência, uma comida). O objeto lembra o dia; o dia dá sentido ao objeto.</p>
<h2>Feitos à mão</h2>
<ol><li><b>Carta escrita à mão:</b> parece simples, e é exatamente por isso que emociona. Uma versão ambiciosa: 12 cartas, uma para abrir em cada mês.</li><li><b>Pote das memórias:</b> papeizinhos com lembranças, piadas internas e motivos para amar, para abrir um por dia.</li><li><b>Vales de presente:</b> vale uma massagem, vale escolher o filme sem discussão, vale um café na cama.</li><li><b>Scrapbook:</b> fotos, ingressos de cinema e bilhetinhos colados num caderno.</li><li><b>Caderninho dos motivos:</b> um motivo por página para gostar da pessoa.</li><li><b>Quadro com uma frase de vocês:</b> aquela mensagem que virou bordão do casal, escrita com capricho e emoldurada.</li></ol>
<h2>Experiências</h2>
<ol start="7"><li><b>Piquenique surpresa:</b> toalha, comidinhas e um parque. Custa pouco e rende muito.</li><li><b>Turistas na própria cidade:</b> monte um roteiro com lugares que vocês nunca visitaram por estarem perto demais.</li><li><b>Aula juntos:</b> cerâmica, dança, culinária. Muitos lugares têm aula avulsa ou experimental.</li><li><b>Cinema em casa temático:</b> o filme preferido da pessoa, pipoca e uma decoração combinando.</li><li><b>Nascer do sol:</b> uma trilha leve ou um mirante bem cedo, com café na garrafa térmica.</li><li><b>Noite de jogos a dois:</b> um jogo de cartas ou de perguntas para casal. Veja <a href="/blog/jogos-para-jogar-com-amigos-e-familia">algumas sugestões de jogos</a>.</li></ol>
<!--AD-->
<h2>Digitais</h2>
<ol start="13"><li><b>Retrospectiva da conversa de vocês:</b> o modo Casais do <a href="/">Retrozap</a> transforma a conversa do WhatsApp em números, prêmios e cards: quem manda mais mensagem, quem é mais romântico, quem dá bom dia primeiro. A leitura acontece no celular e a conversa não sai dele. Faz parte do acesso ilimitado, com pagamento único. <a href="/blog/retrospectiva-de-namoro">Veja como fazer</a>.</li><li><b>Playlist comentada:</b> uma música para cada fase do namoro, com uma frase explicando a escolha.</li><li><b>Vídeo de recados:</b> peça para amigos e família gravarem uma mensagem curta e junte tudo num vídeo.</li><li><b>Álbum digital do ano:</b> as melhores fotos de vocês, organizadas por mês, com legenda.</li><li><b>Caça ao tesouro pelo WhatsApp:</b> pistas mandadas ao longo do dia levam até a surpresa final.</li></ol>
<h2>Comidinhas</h2>
<ol start="18"><li><b>Café da manhã na cama:</b> o clássico que nunca falha, ainda mais com bilhete na bandeja.</li><li><b>O prato do primeiro encontro:</b> recrie em casa o que vocês comeram no primeiro encontro.</li><li><b>Kit dos petiscos favoritos:</b> uma caixa com tudo o que a pessoa ama e não compra para si.</li><li><b>Doce feito por você:</b> bolo, brigadeiro ou cookie. Se der errado, vira história.</li></ol>
<h2>Pequenos objetos com significado</h2>
<ol start="22"><li><b>Planta com bilhete:</b> "cuide de mim como cuida da gente".</li><li><b>Quebra-cabeça com uma foto de vocês:</b> o presente vem com a atividade da noite.</li><li><b>Mapa do céu de uma data especial:</b> impresso, mostra como estavam as estrelas no dia em que vocês se conheceram.</li><li><b>Livro com dedicatória:</b> um livro que marcou você, com trechos sublinhados e comentários nas margens.</li></ol>
<h2>Para cada data</h2>
<ul><li><b>Aniversário de namoro:</b> retrospectiva, carta, recriar o primeiro encontro.</li><li><b>Dia dos Namorados (12 de junho):</b> piquenique, cinema em casa, caça ao tesouro.</li><li><b>Natal:</b> pote das memórias, álbum do ano, kit de petiscos.</li><li><b>Sem data nenhuma:</b> um vale ou um bilhete. Surpresa fora de época vale em dobro.</li></ul>
<p>Seja qual for a escolha, capriche na entrega: um bilhete escrito à mão, um embrulho improvisado com papel de jornal ou uma pista para encontrar o presente pela casa. A forma de entregar muitas vezes é o que a pessoa mais conta para os amigos depois.</p>
<p>E se a ideia for passar a noite conversando, use as <a href="/blog/perguntas-para-casal">100 perguntas para casal</a>. Combinam com qualquer presente desta lista.</p>
""" + CTA_CASAL),

('kkkk-rsrs-hahaha-significado', 'Kkkk, rsrs, hahaha: o jeito brasileiro de rir no WhatsApp',
 'O que significam kkkk, rsrs, hahaha, hehe e huehue, a escala de intensidade da risada, as variações e os emojis 😂🤣. E quem é o Rei do Kkkk do seu grupo.', """
<h1>Kkkk, rsrs, hahaha: o jeito brasileiro de rir no WhatsApp</h1>
<p>Brasileiro não ri por escrito de um jeito só. Tem o "kkkk", o "rsrs", o "hahaha", o "hehe" e aquela sequência de letras aleatórias que só significa uma coisa: a pessoa caiu da cadeira. Cada forma carrega um tom diferente, e quem erra o tom passa por sério, irônico ou sem graça. Este é um guia rápido da risada digital brasileira.</p>
<h2>Por que o brasileiro ri com k</h2>
<p>Em português, a letra k se chama "cá". Escrever "kkkk" soa como "cácácácá", uma gargalhada. É mais rápido de digitar que "hahaha", funciona com uma tecla só e virou a risada padrão do Brasil na internet.</p>
<p>Curiosamente, os coreanos chegaram a uma solução parecida: lá a risada escrita é "ㅋㅋㅋ", uma letra que também tem som de k. Em outros lugares, a lógica é a mesma, com outras letras: "jajaja" em espanhol, "555" na Tailândia (o número 5 se fala "há") e "www" no Japão.</p>
<h2>O dicionário da risada</h2>
<ul><li><b>kkkk:</b> a risada padrão. Serve para quase tudo, do meme bobo à piada interna.</li><li><b>rsrs:</b> abreviação de "risos". Mais contida, educada. Às vezes é só um jeito simpático de suavizar a frase.</li><li><b>hahaha:</b> a risada universal. Para muita gente soa um pouco mais medida que o "kkkk".</li><li><b>hehe:</b> risadinha. Pode ser timidez, pode ser malícia, pode ser "não achei tanta graça".</li><li><b>hihi:</b> risada tímida e fofa.</li><li><b>huehue:</b> ficou famosa nos jogos online. É a risada da zoeira.</li><li><b>hauahau, ashuashua:</b> o teclado esmagado. Ninguém escreve isso calmo.</li><li><b>KKKKKK:</b> em maiúsculas, é gargalhada de verdade.</li><li><b>k:</b> um k sozinho é quase um ponto final. Seco, irônico, às vezes passivo-agressivo.</li></ul>
<!--AD-->
<h2>A escala de intensidade</h2>
<p>Não existe régua oficial, mas qualquer brasileiro reconhece esta escala:</p>
<ol><li><b>k</b>: entendi, segue o baile.</li><li><b>kk</b>: achei engraçadinho.</li><li><b>kkkk</b>: ri de verdade.</li><li><b>kkkkkkkkk</b>: ri alto, alguém do lado perguntou o que era.</li><li><b>KKKKKKKKKKK</b>: gargalhada.</li><li><b>kkkkjsjsjsjsks</b>: perdi o controle dos dedos.</li><li><b>"tô chorando", "morri", "não tô respirando"</b>: o nível máximo, quando as letras já não dão conta.</li></ol>
<p>A regra geral: quanto mais letras, mais engraçado. E quanto mais bagunçadas, mais sincera a risada.</p>
<h2>Variações, gerações e sotaques</h2>
<p>Não há pesquisa definitiva sobre quem ri de qual jeito, mas algumas diferenças todo mundo percebe no próprio grupo:</p>
<ul><li><b>O "rsrs" lembra os primeiros anos da internet</b> e aparece muito nos grupos da família.</li><li><b>O "kkkk" domina os grupos de amigos</b>, em todas as idades.</li><li><b>O "hahaha" aparece mais em conversas de trabalho</b>, onde soa mais neutro.</li><li><b>Cada grupo cria a sua:</b> tem turma que só ri com "kkkj", tem quem ri com "auhsuahs", tem quem responde tudo com figurinha.</li></ul>
<p>Vale lembrar que risada é contexto. Um "rsrs" no grupo da família é carinho. O mesmo "rsrs" numa discussão pode soar como deboche.</p>
<h3>Como não errar o tom</h3>
<ul><li><b>Espelhe o grupo:</b> se todo mundo ri com "kkkk", um "rsrs" pode soar distante. No grupo da tia, o contrário.</li><li><b>Em conversa séria, evite o "k" sozinho:</b> ele quase sempre soa como deboche.</li><li><b>No trabalho, menos é mais:</b> um "haha" ou um emoji resolvem sem parecer que você está rindo do chefe.</li><li><b>Risada não substitui resposta:</b> "kkkk" para uma pergunta direta deixa a pessoa sem saber o que você pensa.</li></ul>
<h2>E os emojis?</h2>
<ul><li><b>😂 Rosto com lágrimas de alegria:</b> o clássico. Muita gente mais nova acha que ele ficou "de tiozão" e troca por 💀 ou 😭.</li><li><b>🤣 Rolando de rir:</b> um degrau acima do 😂.</li><li><b>😆 Olhos apertados:</b> risada aberta, mais leve.</li><li><b>😹 Gato rindo:</b> a risada de quem ama gato e figurinha.</li></ul>
<h2>Quem é o Rei do Kkkk do seu grupo?</h2>
<p>No <a href="/">Retrozap</a>, o prêmio <b>Rei do Kkkk</b> vai para quem tem a maior porcentagem de mensagens com risada. Entram kkkk, rsrs, haha, hihi, hauahau e os emojis 😂🤣😆😹. Por ser porcentagem, quem fala pouco mas ri em tudo tem chance contra o Tagarela, e só concorre quem mandou um mínimo de mensagens para a conta ser justa. A conversa é lida no seu celular, sem sair dele.</p>
<p>Gosta do assunto? Veja também as <a href="/blog/girias-mais-usadas-no-whatsapp">gírias mais usadas no WhatsApp</a>, os <a href="/blog/tipos-de-pessoas-em-grupos-de-whatsapp">15 personagens que todo grupo tem</a> e mais <a href="/blog/premios-para-grupo-de-amigos">prêmios para o grupo de amigos</a>.</p>
""" + CTA),

('frases-de-bom-dia-para-grupo', 'Bom dia para grupo: 50 frases (sem ser o tio do bom dia chato)',
 '50 frases de bom dia para grupo de WhatsApp: curtas, engraçadas, para a família, para o trabalho, para segunda e sexta. E as regras para o bom dia não irritar ninguém.', """
<h1>Bom dia para grupo: 50 frases (sem ser o tio do bom dia chato)</h1>
<p>Todo grupo tem alguém que abre o dia. Às vezes é a tia com a foto de flor, às vezes o amigo que manda "bom dia" às 6h antes de correr. O bom dia é um gesto simpático, desde que não vire spam. Aqui estão 50 frases para variar o repertório e algumas regras para ninguém silenciar o grupo por sua causa.</p>
<h2>As regras do bom dia que não irrita</h2>
<ul><li><b>Um por dia basta:</b> se alguém já deu bom dia, reaja à mensagem em vez de mandar outro.</li><li><b>Texto antes de imagem pesada:</b> figura animada enorme gasta dados e memória de todo mundo.</li><li><b>Nada de corrente:</b> "bom dia, repasse para 10 grupos" não é bom dia, é corrente.</li><li><b>Respeite o horário:</b> às 5h da manhã, o celular de alguém vai tocar.</li><li><b>Varie:</b> a mesma frase todo dia vira papel de parede. Use as de baixo.</li><li><b>Não cobre resposta:</b> bom dia é presente, não pergunta.</li></ul>
<h2>Curtas</h2>
<ol><li>Bom dia, pessoal!</li><li>Bom dia, grupo! Que o dia seja leve.</li><li>Bom dia! Bora que hoje rende.</li><li>Café tomado, bom dia a todos!</li><li>Bom dia! Que hoje dê tudo certo.</li><li>Bom dia, turma. Força e paciência.</li><li>Bom dia! Um dia de cada vez.</li><li>Bom diaaa! Sol lá fora e aqui também.</li><li>Bom dia! Que hoje seja gentil com a gente.</li><li>Bom dia, gente boa!</li></ol>
<!--AD-->
<h2>Engraçadas</h2>
<ol start="11"><li>Bom dia para todos, menos para o despertador.</li><li>Bom dia! Acordei. É isso, essa é a notícia.</li><li>Bom dia, grupo! Já estou no terceiro café e ainda não funcionei.</li><li>Bom dia para quem já levantou. Para quem não levantou, até mais tarde.</li><li>Bom dia! Hoje eu vou ser produtivo. Mentira, mas bom dia.</li><li>Bom dia, pessoal. Meu corpo acordou, minha alma ainda está na cama.</li><li>Bom dia! Se alguém precisar de mim, estou fingindo que estou bem.</li><li>Bom dia a todos que leram esta mensagem com a cara amassada.</li><li>Bom dia! O sol nasceu e eu também, com muito custo.</li><li>Bom dia, grupo. Hoje é dia de sorrir e de ver se tem pão em casa.</li></ol>
<h2>Para o grupo da família</h2>
<ol start="21"><li>Bom dia, família! Que Deus abençoe o dia de todos.</li><li>Bom dia, minha gente querida. Saúde e paz para todos.</li><li>Bom dia, família! Saudade de vocês logo cedo.</li><li>Bom dia! Já tomaram água hoje?</li><li>Bom dia, família. Que o almoço de domingo chegue logo.</li><li>Bom dia a todos! Que hoje ninguém esqueça o guarda-chuva.</li><li>Bom dia! Mãe, já acordei, pode ficar tranquila.</li><li>Bom dia, família abençoada. Um beijo em cada um.</li><li>Bom dia! Que o dia de vocês seja tão bom quanto o café da vó.</li><li>Bom dia, família! Contem as novidades.</li></ol>
<h2>Para o grupo do trabalho</h2>
<ol start="31"><li>Bom dia, equipe!</li><li>Bom dia, time. Bora para mais um dia.</li><li>Bom dia a todos! Bom trabalho hoje.</li><li>Bom dia, pessoal. Qualquer coisa, estou por aqui.</li><li>Bom dia! Que o dia seja produtivo e tranquilo.</li><li>Bom dia, time! Café pronto, metas também.</li><li>Bom dia! Hoje tem reunião às 10h, não esqueçam.</li><li>Bom dia a todos. Que hoje seja menos e-mail e mais solução.</li><li>Bom dia, equipe! Vamos com tudo.</li><li>Bom dia, pessoal! Boa semana para todos.</li></ol>
<h2>Para segunda e sexta</h2>
<ol start="41"><li>Bom dia! Segunda-feira chegou, sejamos fortes.</li><li>Bom dia, grupo. Segunda é só um dia, a gente sobrevive.</li><li>Bom dia! Que a segunda seja leve e a semana passe rápido.</li><li>Bom dia, segunda. Não te esperava, mas vamos lá.</li><li>Bom dia! Começando a semana com café e esperança.</li><li>Bom dia e sextou! Falta pouco.</li><li>Bom dia! Hoje é sexta e eu estou com a energia de sábado.</li><li>Bom dia, grupo! Sexta-feira, quem vai fazer o quê?</li><li>Bom dia! Sexta-feira é o domingo da semana útil.</li><li>Bom dia e bom fim de semana antecipado a todos!</li></ol>
<h2>Você é o Tio do Bom Dia do seu grupo?</h2>
<p>No modo família do <a href="/">Retrozap</a>, o prêmio <b>Tio do Bom Dia</b> vai para quem mais mandou "bom dia" no grupo. O site conta direto na conversa exportada, no seu celular, e mostra o vencedor com o número de bons-dias do ano. Spoiler: quase nunca é quem todo mundo imagina.</p>
<p>Veja também <a href="/blog/premios-para-grupo-da-familia">30 prêmios engraçados para o grupo da família</a>, <a href="/blog/mensagens-de-fim-de-ano-para-grupo">mensagens de fim de ano para o grupo</a> e <a href="/blog/regras-para-grupo-de-whatsapp">regras para o grupo</a>, caso o bom dia esteja virando bagunça.</p>
""" + CTA),
]

NOVOS += [
('como-evitar-brigas-no-grupo-da-familia', 'Grupo da família: como evitar brigas (política, fake news e correntes)',
 'Como manter a paz no grupo da família no WhatsApp: combinados que funcionam, política sem briga, como checar fake news, correntes, golpes e dicas para o administrador.', """
<h1>Grupo da família: como evitar brigas (política, fake news e correntes)</h1>
<p>O grupo da família é o lugar do bom dia, das fotos do almoço e dos parabéns. E também, de vez em quando, o lugar da briga de política, da notícia falsa e da corrente que promete azar para quem não repassar. Dá para manter a paz sem calar ninguém. Aqui vai um guia prático.</p>
<h2>Por que o grupo da família briga</h2>
<ul><li><b>Gerações diferentes, linguagens diferentes:</b> o "rsrs" da tia e o "kkkk" do sobrinho podem soar como ironia um para o outro.</li><li><b>Texto não tem tom de voz:</b> uma frase curta parece grosseira mesmo quando não é.</li><li><b>Todo mundo lê, ninguém conversa:</b> uma discussão entre duas pessoas vira um palco com plateia.</li><li><b>Assuntos que mexem com valores:</b> política, religião e futebol pegam fogo rápido.</li><li><b>Notícias que chegam prontas:</b> correntes e textos encaminhados raramente vêm com fonte.</li></ul>
<h2>Combinados que funcionam</h2>
<ol><li><b>Combine o objetivo do grupo:</b> "aqui é para notícias da família, encontros e parabéns" já resolve muita coisa.</li><li><b>Assunto polêmico vai para o privado:</b> quem quiser debater pode, mas a dois.</li><li><b>Na dúvida, não encaminhe:</b> se não sabe se é verdade, não mande.</li><li><b>Sem correntes:</b> nem as de oração com ameaça, nem as de "repasse para 10 pessoas".</li><li><b>Pausa antes de responder:</b> se ficou irritado com uma mensagem, espere dez minutos.</li><li><b>Prefira ligar:</b> desentendimento por texto se resolve muito melhor por voz.</li></ol>
<p>Tem um <a href="/blog/regras-para-grupo-de-whatsapp">modelo de regras para grupo da família</a> pronto para copiar e colar na descrição.</p>
<!--AD-->
<h2>Política sem briga</h2>
<p>Proibir política costuma funcionar melhor que tentar moderar cada discussão. Se a família prefere conversar sobre o assunto, alguns cuidados ajudam:</p>
<ul><li>Fale do tema, não da pessoa. "Discordo dessa proposta" é diferente de "você não entende nada".</li><li>Nada de apelido para candidato ou para quem vota nele.</li><li>Ninguém precisa ganhar a discussão. Ninguém muda de voto por mensagem de grupo.</li><li>Em época de eleição, um grupo separado para quem quer debater salva o grupo principal.</li></ul>
<h2>Fake news: como checar em 5 passos</h2>
<ol><li><b>Desconfie do tom:</b> texto alarmista, em letras maiúsculas e pedindo para repassar "antes que apaguem" é sinal de alerta.</li><li><b>Olhe a data:</b> muita notícia verdadeira volta a circular anos depois, fora de contexto.</li><li><b>Procure a fonte:</b> se é verdade, algum veículo conhecido ou órgão oficial publicou. Pesquise a frase principal no buscador.</li><li><b>Consulte quem checa:</b> agências como Agência Lupa, Aos Fatos, Fato ou Fake (g1), Estadão Verifica e Projeto Comprova publicam checagens dos boatos mais compartilhados.</li><li><b>Confira a imagem:</b> a busca reversa de imagens, como a do Google Lens, mostra onde e quando a foto apareceu pela primeira vez.</li></ol>
<p>Repare também no aviso "Encaminhada com frequência" que o WhatsApp mostra em mensagens que passaram por muitas conversas. Não quer dizer que é falsa, mas pede atenção redobrada.</p>
<h3>Como corrigir sem humilhar</h3>
<p>Se alguém mandou uma notícia falsa, responda com o link da checagem e um tom leve: "Tia, vi que isso aqui já foi desmentido, olha só". Melhor ainda: mande no privado. Ninguém gosta de ser corrigido na frente da família inteira.</p>
<h2>Correntes e golpes</h2>
<ul><li><b>Correntes de azar ou de bênção:</b> não precisa repassar. Nada acontece.</li><li><b>Boatos clássicos:</b> de tempos em tempos volta o aviso de que o WhatsApp vai passar a cobrar ou vai apagar contas. Confira em fontes oficiais antes de acreditar.</li><li><b>"Mudei de número":</b> golpe comum em que alguém se passa por um parente e pede dinheiro. Ligue para o número antigo antes de qualquer Pix.</li><li><b>Links de prêmio e promoção:</b> se é bom demais para ser verdade, provavelmente é golpe. Não toque no link.</li></ul>
<h2>Dicas para quem administra o grupo</h2>
<ul><li>Coloque os combinados na descrição e fixe uma mensagem com eles.</li><li>Tenha mais de um administrador, de gerações diferentes.</li><li>Use "apagar para todos" em golpes e correntes, e explique no grupo por quê.</li><li>Em datas tensas, como eleições, dá para deixar só os administradores enviando mensagens por um tempo.</li><li>Quando a briga já começou, uma mensagem curta e neutra ajuda: "Pessoal, vamos continuar isso no privado?". Depois, mude de assunto com algo leve.</li></ul>
<p>E nada como uma boa risada para desfazer climão. No fim do ano, faça a cerimônia de prêmios do grupo com o <a href="/">Retrozap</a>: Tio do Bom Dia, Rei do Parabéns, Repórter da Família. Ideias em <a href="/blog/premios-para-grupo-da-familia">30 prêmios para o grupo da família</a> e <a href="/blog/frases-de-bom-dia-para-grupo">50 frases de bom dia</a>.</p>
""" + CTA),

('como-ler-conversa-exportada-do-whatsapp', 'Como abrir e ler a conversa exportada do WhatsApp (.txt e .zip)',
 'Como abrir o arquivo .zip ou .txt da conversa exportada do WhatsApp no iPhone, no Android e no computador, como é o formato do arquivo e um jeito fácil de ler tudo.', """
<h1>Como abrir e ler a conversa exportada do WhatsApp</h1>
""" + AVISO_MARCA + """
<p>Você exportou a conversa e agora tem um arquivo com um nome como "Conversa do WhatsApp com Família.txt" ou "WhatsApp Chat - Família.zip". E agora? Este guia mostra como abrir o arquivo no celular e no computador, como ele é por dentro e por que ler milhares de mensagens em texto puro é tão cansativo.</p>
<h2>O que vem no arquivo</h2>
<ul><li><b>No iPhone:</b> o WhatsApp gera um <b>.zip</b>. Dentro dele está o <b>_chat.txt</b>, com todas as mensagens, e, se você exportou com mídia, as fotos, os áudios e os vídeos.</li><li><b>No Android:</b> o arquivo costuma vir como <b>.txt</b> quando é sem mídia. Com mídia, pode vir como .zip ou como vários arquivos.</li><li><b>O texto é o mesmo:</b> cada mensagem tem data, hora, nome de quem mandou e o conteúdo.</li></ul>
<p>Ainda não exportou? Veja <a href="/blog/como-exportar-conversa-whatsapp">como exportar a conversa no iPhone e no Android</a>. Se a opção não aparece, tem um guia com <a href="/blog/exportar-conversa-whatsapp-nao-aparece">7 causas e soluções</a>.</p>
<h2>Como abrir no celular</h2>
<h3>iPhone</h3>
<ol><li>Abra o app <b>Arquivos</b> e vá até onde você salvou (normalmente em Downloads ou Recentes).</li><li>Toque no arquivo .zip. O iPhone cria uma pasta com o mesmo nome ao lado.</li><li>Abra a pasta e toque em <b>_chat.txt</b>. O texto aparece numa prévia.</li></ol>
<h3>Android</h3>
<ol><li>Abra o gerenciador de arquivos do celular (Arquivos, Meus arquivos ou similar) e vá até Downloads, ou abra o Google Drive se salvou lá.</li><li>Se for .zip, toque nele e escolha <b>Extrair</b>.</li><li>Toque no .txt e escolha um app que abra texto.</li></ol>
<p>Em conversas grandes, a prévia do celular pode demorar ou travar. É normal: são dezenas de milhares de linhas.</p>
<!--AD-->
<h2>Como abrir no computador</h2>
<ul><li><b>Windows:</b> clique com o botão direito no .zip, escolha <b>Extrair tudo</b> e abra o .txt com o Bloco de Notas.</li><li><b>Mac:</b> dê dois cliques no .zip para descompactar e abra o .txt no TextEdit.</li><li><b>Acentos estranhos?</b> Abra o arquivo escolhendo a codificação UTF-8. Editores de texto mais novos fazem isso sozinhos.</li><li><b>Planilha:</b> dá para importar o .txt no Excel ou no Planilhas Google, mas as mensagens com várias linhas bagunçam as colunas.</li></ul>
<h2>Como é o formato por dentro</h2>
<p>O formato muda conforme o aparelho e o idioma. Um exemplo com nomes fictícios, no iPhone:</p>
<p><code>[02/11/2026, 21:14:03] Ana: alguém vai no churrasco sábado?</code><br><code>[02/11/2026, 21:15:40] Bruno: eu vou kkkk</code></p>
<p>E no Android:</p>
<p><code>02/11/2026 21:14 - Ana: alguém vai no churrasco sábado?</code><br><code>02/11/2026 21:15 - Bruno: eu vou kkkk</code></p>
<p>Além das mensagens, o arquivo tem:</p>
<ul><li><b>Avisos do sistema:</b> quem entrou, quem saiu, quem mudou o nome do grupo e o aviso de criptografia no começo.</li><li><b>Mídia omitida:</b> no export sem mídia, foto, áudio e figurinha viram uma linha como "&lt;Mídia oculta&gt;" ou "imagem ocultada", conforme o aparelho.</li><li><b>Mensagens apagadas e editadas:</b> aparecem com avisos como "Esta mensagem foi apagada" ou a marca de mensagem editada.</li><li><b>Nomes como no seu celular:</b> quem não está nos seus contatos aparece pelo número de telefone.</li></ul>
<h3>Dá para procurar uma mensagem específica?</h3>
<p>Dá. Com o .txt aberto no computador, use Ctrl+F (ou Cmd+F no Mac) e busque uma palavra ou uma data, como "25/12/2025". No celular, a própria conversa do WhatsApp tem uma busca melhor para isso; o arquivo exportado serve mais para guardar e analisar.</p>
<h2>Por que é tão difícil de ler</h2>
<ul><li><b>Tamanho:</b> um grupo ativo há anos chega fácil a dezenas de milhares de mensagens. Rolar tudo isso é impraticável.</li><li><b>Mensagens quebradas:</b> uma mensagem com vários parágrafos ocupa várias linhas, e só a primeira tem data e nome.</li><li><b>Formatos diferentes:</b> iPhone e Android, português e inglês, dia/mês ou mês/dia. Cada combinação muda o arquivo.</li><li><b>Sem contexto visual:</b> não há balões, fotos nem respostas encadeadas. Só texto corrido.</li><li><b>Caracteres invisíveis:</b> alguns aparelhos inserem marcas invisíveis no texto, que atrapalham buscas e planilhas.</li></ul>
<h2>O jeito fácil: deixar o navegador ler para você</h2>
<p>O <a href="/">Retrozap</a> lê o .zip ou o .txt direto, sem precisar descompactar, reconhece os formatos do iPhone e do Android e transforma a conversa em números: quem mais fala, horários, mensagens por ano, gíria oficial e os prêmios do grupo. Tudo acontece no seu navegador; as mensagens não são enviadas para nenhum servidor. <a href="/blog/privacidade-ao-analisar-conversas-do-whatsapp">Entenda como a leitura funciona sem expor ninguém</a>.</p>
<p>Quer só saber quem mais manda mensagem? Veja <a href="/blog/quem-mais-fala-no-grupo-do-whatsapp">como saber quem mais fala no grupo</a>.</p>
""" + CTA),

('exportar-conversa-whatsapp-nao-aparece', 'Exportar conversa do WhatsApp não aparece? 7 causas e soluções',
 'A opção Exportar conversa sumiu, travou ou gerou um arquivo pequeno? Veja 7 causas comuns, como Privacidade avançada da conversa, WhatsApp Web e app desatualizado, e como resolver.', """
<h1>Exportar conversa do WhatsApp não aparece? 7 causas e soluções</h1>
""" + AVISO_MARCA + """
<p>Você abriu o grupo, procurou "Exportar conversa" e nada. Ou a opção apareceu, mas o arquivo veio pequeno demais. Calma: quase sempre é uma destas sete causas, e a maioria se resolve em um minuto.</p>
<h2>Antes de tudo: o caminho certo</h2>
<ul><li><b>iPhone:</b> abra a conversa, toque no nome do grupo (ou da pessoa) no topo, role até o fim e toque em <b>Exportar conversa</b>.</li><li><b>Android:</b> abra a conversa, toque nos três pontinhos (⋮), depois em <b>Mais</b> e em <b>Exportar conversa</b>.</li><li><b>WhatsApp Business:</b> o caminho é o mesmo.</li></ul>
<p>Tem um <a href="/blog/como-exportar-conversa-whatsapp">passo a passo com vídeo</a> para os dois sistemas.</p>
<h2>A opção não aparece</h2>
<h3>1. Alguém ligou a Privacidade avançada da conversa</h3>
<p>É a causa mais comum hoje. Quando alguém ativa a <b>Privacidade avançada da conversa</b>, o WhatsApp bloqueia a exportação para todos os participantes daquela conversa. <b>Solução:</b> quem ativou (ou um administrador, conforme as configurações do grupo) precisa desligar a opção nas informações do grupo. Depois disso, o Exportar conversa volta a aparecer. Se ninguém lembra quem ligou, procure a opção nas informações do grupo: ela mostra se está ativa. Vale combinar com o grupo antes de desligar, já que a função existe justamente para proteger a conversa.</p>
<h3>2. Você está no WhatsApp Web ou no computador</h3>
<p>A exportação de conversa é um recurso do aplicativo no celular. No WhatsApp Web e no aplicativo de computador, a opção normalmente não existe. <b>Solução:</b> exporte pelo celular e, se precisar, mande o arquivo para o computador depois.</p>
<h3>3. O aplicativo está desatualizado</h3>
<p>Menus mudam de lugar entre versões, e versões antigas podem esconder opções. <b>Solução:</b> atualize o WhatsApp pela App Store ou pela Google Play e tente de novo.</p>
<h3>4. Você está procurando no menu errado</h3>
<p>No Android, a opção fica escondida em <b>Mais</b>, dentro dos três pontinhos. No iPhone, ela fica no fim da tela de informações, depois da lista de participantes, que em grupos grandes é bem comprida. <b>Solução:</b> role até o final, sem pressa.</p>
<!--AD-->
<h2>A exportação começa, mas dá problema</h2>
<h3>5. A conversa é grande demais com mídia</h3>
<p>Exportar com fotos, áudios e vídeos gera um arquivo enorme, que pode demorar, falhar por falta de espaço ou nem caber no lugar onde você vai salvar. A Central de Ajuda do WhatsApp já informou limites de cerca de 10 mil mensagens recentes ao exportar com mídia e de cerca de 40 mil sem mídia. Esses números podem mudar com o tempo. <b>Solução:</b> escolha <b>Sem mídia</b>. O arquivo fica leve e, para retrospectivas e estatísticas, o texto é o que importa.</p>
<h3>6. O celular bloqueia o compartilhamento</h3>
<p>Celulares corporativos ou com restrições de segurança às vezes impedem salvar ou compartilhar arquivos de certos apps. Pouco espaço livre também pode travar a exportação. <b>Solução:</b> libere espaço, tente salvar em outro lugar (Arquivos, Downloads ou Drive) ou exporte de um celular pessoal.</p>
<h2>O arquivo veio, mas incompleto</h2>
<h3>7. As mensagens antigas não estão no seu celular</h3>
<p>O export só inclui o que está no aparelho de quem exportou. A conversa começa "no meio" quando você entrou no grupo depois, trocou de celular sem restaurar o backup, apagou mensagens antigas ou quando o grupo usa mensagens temporárias, que somem depois de um tempo. <b>Solução:</b> peça para quem está no grupo há mais tempo, e nunca perdeu o histórico, exportar a conversa.</p>
<p>No Retrozap, se o arquivo tiver pouquíssimas mensagens, o site avisa que provavelmente é esse o motivo.</p>
<h2>Exportei, mas não acho o arquivo</h2>
<ul><li><b>iPhone:</b> procure no app Arquivos, em Recentes ou Downloads. Se você mandou para si mesmo por outro app, ele estará lá.</li><li><b>Android:</b> procure em Arquivos ou Meus arquivos, na pasta Downloads, ou no Google Drive se salvou lá.</li><li><b>O nome</b> começa com "Conversa do WhatsApp" ou "WhatsApp Chat".</li></ul>
<p>Para abrir e entender o que tem dentro, veja <a href="/blog/como-ler-conversa-exportada-do-whatsapp">como abrir e ler a conversa exportada</a>.</p>
<h2>Deu certo? Agora a parte divertida</h2>
<p>Com o arquivo em mãos, abra o <a href="/">Retrozap</a> e escolha o arquivo: o site monta a retrospectiva do grupo com números, prêmios e cards. A leitura acontece no seu navegador e as mensagens não saem do celular. <a href="/blog/privacidade-ao-analisar-conversas-do-whatsapp">Veja por que é seguro</a>.</p>
""" + CTA),
]

# Data de publicação de cada artigo (JSON-LD). Artigo novo sem data aqui usa a data do build.
PUBLICADO = {s: '2026-10-17' for s in ['como-exportar-conversa-whatsapp', 'ideias-de-premios-para-grupo-de-whatsapp', 'privacidade-ao-analisar-conversas-do-whatsapp', 'retrospectiva-do-grupo-de-whatsapp', 'premios-para-grupo-da-familia', 'premios-para-grupo-de-amigos', 'premios-para-grupo-do-trabalho', 'grupo-do-condominio', 'tipos-de-pessoas-em-grupos-de-whatsapp', 'girias-mais-usadas-no-whatsapp', 'quem-mais-fala-no-grupo-do-whatsapp', 'como-reanimar-grupo-parado', 'amigo-secreto-pelo-whatsapp', 'jogos-para-jogar-com-amigos-e-familia']}
PUBLICADO['whatsapp-wrapped'] = '2026-10-19'
# Última mudança relevante de conteúdo (dateModified e lastmod do sitemap). Sem data aqui = data de publicação.
MODIFICADO = {'retrospectiva-do-grupo-de-whatsapp': '2026-11-14'}
# Perguntas e respostas visíveis no artigo que também viram FAQPage (JSON-LD)
FAQ_ARTIGO = {'retrospectiva-do-grupo-de-whatsapp': FAQ_RETRO_2026}
# Última mudança relevante das páginas fixas (lastmod do sitemap)
ATUALIZADO = {'': '2026-11-14', 'privacidade': '2026-11-14', 'termos': '2026-10-22', 'sobre': '2026-10-17', 'contato': '2026-10-22',
 'como-exportar': '2026-10-25', 'como-funciona': '2026-11-03', 'perguntas-frequentes': '2026-11-01', 'ideias': '2026-10-22', 'blog/': '2026-11-14'}

# <title> mais curto (até ~60 caracteres, busca principal antes da marca) quando o título da página é longo ou repete a marca.
# O título completo continua no h1, no og:title e no card do blog.
TITULO_SEO = {
 'blog/index.html': 'Blog do Retrozap: dicas para grupos de WhatsApp',
 'como-funciona.html': 'Como funciona a retrospectiva do WhatsApp · Retrozap',
 'sobre.html': 'Sobre o Retrozap',
 'blog/retrospectiva-do-grupo-de-whatsapp.html': 'Retrospectiva do grupo do WhatsApp 2026 · Retrozap',
 'blog/brincadeiras-para-grupo-de-whatsapp.html': '30 brincadeiras para grupo de WhatsApp · Retrozap',
 'blog/como-evitar-brigas-no-grupo-da-familia.html': 'Grupo da família: como evitar brigas · Retrozap',
 'blog/como-exportar-conversa-whatsapp.html': 'Como exportar conversa de grupo do WhatsApp · Retrozap',
 'blog/como-ler-conversa-exportada-do-whatsapp.html': 'Como abrir a conversa exportada do WhatsApp · Retrozap',
 'blog/como-reanimar-grupo-parado.html': '12 ideias para reanimar grupo de WhatsApp · Retrozap',
 'blog/exportar-conversa-whatsapp-nao-aparece.html': 'Exportar conversa do WhatsApp não aparece? 7 soluções',
 'blog/frases-de-bom-dia-para-grupo.html': 'Bom dia para grupo: 50 frases para mandar · Retrozap',
 'blog/grupo-do-condominio.html': 'Grupo do condomínio: prêmios e regras · Retrozap',
 'blog/ideias-de-premios-para-grupo-de-whatsapp.html': '40 ideias de prêmios para grupo de WhatsApp · Retrozap',
 'blog/jogos-para-jogar-com-amigos-e-familia.html': '6 jogos para animar amigos e família · Retrozap',
 'blog/kkkk-rsrs-hahaha-significado.html': 'Kkkk, rsrs, hahaha: como o brasileiro ri no WhatsApp',
 'blog/mensagens-de-fim-de-ano-para-grupo.html': 'Mensagens de fim de ano para grupo: 60 textos prontos',
 'blog/nomes-para-grupo-de-whatsapp.html': '150 nomes para grupo de WhatsApp · Retrozap',
 'blog/perguntas-para-casal.html': '100 perguntas para casal · Retrozap',
 'blog/premios-para-grupo-de-amigos.html': '30 prêmios para o grupo de amigos · Retrozap',
 'blog/premios-para-grupo-do-trabalho.html': 'Prêmios para o grupo do trabalho · Retrozap',
 'blog/privacidade-ao-analisar-conversas-do-whatsapp.html': 'Analisar conversa do WhatsApp sem expor ninguém · Retrozap',
 'blog/regras-para-grupo-de-whatsapp.html': 'Regras para grupo de WhatsApp: modelo pronto · Retrozap',
 'blog/retrospectiva-de-namoro.html': 'Retrospectiva de namoro pelo WhatsApp · Retrozap',
 'blog/whatsapp-wrapped.html': 'WhatsApp Wrapped: a retrospectiva do grupo · Retrozap',
}
# meta description mais curta (até ~155) quando a descrição da página é longa; a completa continua no card do blog
DESC_SEO = {
 'blog/como-evitar-brigas-no-grupo-da-familia.html': 'Como manter a paz no grupo da família: combinados que funcionam, política sem briga, fake news, correntes e dicas para o administrador.',
 'blog/como-ler-conversa-exportada-do-whatsapp.html': 'Como abrir o .zip ou .txt da conversa exportada do WhatsApp no iPhone, no Android e no computador, e um jeito fácil de ler tudo.',
 'blog/exportar-conversa-whatsapp-nao-aparece.html': 'Exportar conversa sumiu, travou ou gerou um arquivo pequeno? 7 causas comuns, como a Privacidade avançada da conversa, e como resolver.',
 'blog/frases-de-bom-dia-para-grupo.html': '50 frases de bom dia para grupo de WhatsApp: curtas, engraçadas, para a família e o trabalho. E as regras para o bom dia não irritar ninguém.',
 'blog/kkkk-rsrs-hahaha-significado.html': 'O que significam kkkk, rsrs, hahaha, hehe e huehue, a escala da risada e os emojis. E quem é o Rei do Kkkk do seu grupo.',
 'blog/presente-criativo-para-namorado.html': 'Presentes criativos e baratos para namorado ou namorada: feitos à mão, experiências e ideias digitais para o aniversário de namoro e o Natal.',
 'blog/retrospectiva-de-namoro.html': 'Presente para aniversário de namoro: transforme a conversa do casal no WhatsApp em números, prêmios e cards. Passo a passo e outras ideias.',
}
PUBLICADO.update({s: '2026-11-03' for s in ['mensagens-de-fim-de-ano-para-grupo', 'nomes-para-grupo-de-whatsapp', 'regras-para-grupo-de-whatsapp', 'brincadeiras-para-grupo-de-whatsapp', 'perguntas-para-casal', 'retrospectiva-de-namoro', 'presente-criativo-para-namorado', 'kkkk-rsrs-hahaha-significado', 'frases-de-bom-dia-para-grupo', 'como-evitar-brigas-no-grupo-da-familia', 'como-ler-conversa-exportada-do-whatsapp', 'exportar-conversa-whatsapp-nao-aparece']})

# "Leia também" no fim de cada artigo: 3 posts relacionados por slug
LEIA_TAMBEM = {
 'como-exportar-conversa-whatsapp': ['exportar-conversa-whatsapp-nao-aparece', 'como-ler-conversa-exportada-do-whatsapp', 'retrospectiva-do-grupo-de-whatsapp'],
 'ideias-de-premios-para-grupo-de-whatsapp': ['premios-para-grupo-de-amigos', 'premios-para-grupo-da-familia', 'retrospectiva-do-grupo-de-whatsapp'],
 'privacidade-ao-analisar-conversas-do-whatsapp': ['como-exportar-conversa-whatsapp', 'como-ler-conversa-exportada-do-whatsapp', 'quem-mais-fala-no-grupo-do-whatsapp'],
 'whatsapp-wrapped': ['retrospectiva-do-grupo-de-whatsapp', 'mensagens-de-fim-de-ano-para-grupo', 'ideias-de-premios-para-grupo-de-whatsapp'],
 'retrospectiva-do-grupo-de-whatsapp': ['mensagens-de-fim-de-ano-para-grupo', 'ideias-de-premios-para-grupo-de-whatsapp', 'como-exportar-conversa-whatsapp'],
 'premios-para-grupo-da-familia': ['como-evitar-brigas-no-grupo-da-familia', 'frases-de-bom-dia-para-grupo', 'retrospectiva-do-grupo-de-whatsapp'],
 'premios-para-grupo-de-amigos': ['kkkk-rsrs-hahaha-significado', 'tipos-de-pessoas-em-grupos-de-whatsapp', 'brincadeiras-para-grupo-de-whatsapp'],
 'premios-para-grupo-do-trabalho': ['regras-para-grupo-de-whatsapp', 'ideias-de-premios-para-grupo-de-whatsapp', 'mensagens-de-fim-de-ano-para-grupo'],
 'grupo-do-condominio': ['regras-para-grupo-de-whatsapp', 'nomes-para-grupo-de-whatsapp', 'ideias-de-premios-para-grupo-de-whatsapp'],
 'tipos-de-pessoas-em-grupos-de-whatsapp': ['quem-mais-fala-no-grupo-do-whatsapp', 'kkkk-rsrs-hahaha-significado', 'premios-para-grupo-de-amigos'],
 'girias-mais-usadas-no-whatsapp': ['kkkk-rsrs-hahaha-significado', 'tipos-de-pessoas-em-grupos-de-whatsapp', 'frases-de-bom-dia-para-grupo'],
 'quem-mais-fala-no-grupo-do-whatsapp': ['como-ler-conversa-exportada-do-whatsapp', 'tipos-de-pessoas-em-grupos-de-whatsapp', 'retrospectiva-do-grupo-de-whatsapp'],
 'como-reanimar-grupo-parado': ['brincadeiras-para-grupo-de-whatsapp', 'jogos-para-jogar-com-amigos-e-familia', 'nomes-para-grupo-de-whatsapp'],
 'amigo-secreto-pelo-whatsapp': ['mensagens-de-fim-de-ano-para-grupo', 'jogos-para-jogar-com-amigos-e-familia', 'retrospectiva-do-grupo-de-whatsapp'],
 'jogos-para-jogar-com-amigos-e-familia': ['brincadeiras-para-grupo-de-whatsapp', 'perguntas-para-casal', 'amigo-secreto-pelo-whatsapp'],
 'mensagens-de-fim-de-ano-para-grupo': ['retrospectiva-do-grupo-de-whatsapp', 'amigo-secreto-pelo-whatsapp', 'frases-de-bom-dia-para-grupo'],
 'nomes-para-grupo-de-whatsapp': ['regras-para-grupo-de-whatsapp', 'brincadeiras-para-grupo-de-whatsapp', 'como-reanimar-grupo-parado'],
 'regras-para-grupo-de-whatsapp': ['como-evitar-brigas-no-grupo-da-familia', 'grupo-do-condominio', 'nomes-para-grupo-de-whatsapp'],
 'brincadeiras-para-grupo-de-whatsapp': ['como-reanimar-grupo-parado', 'jogos-para-jogar-com-amigos-e-familia', 'retrospectiva-do-grupo-de-whatsapp'],
 'perguntas-para-casal': ['retrospectiva-de-namoro', 'presente-criativo-para-namorado', 'jogos-para-jogar-com-amigos-e-familia'],
 'retrospectiva-de-namoro': ['presente-criativo-para-namorado', 'perguntas-para-casal', 'como-exportar-conversa-whatsapp'],
 'presente-criativo-para-namorado': ['retrospectiva-de-namoro', 'perguntas-para-casal', 'jogos-para-jogar-com-amigos-e-familia'],
 'kkkk-rsrs-hahaha-significado': ['girias-mais-usadas-no-whatsapp', 'tipos-de-pessoas-em-grupos-de-whatsapp', 'premios-para-grupo-de-amigos'],
 'frases-de-bom-dia-para-grupo': ['premios-para-grupo-da-familia', 'mensagens-de-fim-de-ano-para-grupo', 'como-evitar-brigas-no-grupo-da-familia'],
 'como-evitar-brigas-no-grupo-da-familia': ['regras-para-grupo-de-whatsapp', 'premios-para-grupo-da-familia', 'frases-de-bom-dia-para-grupo'],
 'como-ler-conversa-exportada-do-whatsapp': ['exportar-conversa-whatsapp-nao-aparece', 'quem-mais-fala-no-grupo-do-whatsapp', 'privacidade-ao-analisar-conversas-do-whatsapp'],
 'exportar-conversa-whatsapp-nao-aparece': ['como-exportar-conversa-whatsapp', 'como-ler-conversa-exportada-do-whatsapp', 'privacidade-ao-analisar-conversas-do-whatsapp'],
}

# Seções do índice do blog (todo artigo precisa estar em uma)
SECOES_BLOG = [
 ('Retrospectiva e prêmios', ['retrospectiva-do-grupo-de-whatsapp', 'whatsapp-wrapped', 'ideias-de-premios-para-grupo-de-whatsapp', 'premios-para-grupo-de-amigos', 'premios-para-grupo-da-familia', 'premios-para-grupo-do-trabalho', 'grupo-do-condominio', 'tipos-de-pessoas-em-grupos-de-whatsapp', 'quem-mais-fala-no-grupo-do-whatsapp', 'kkkk-rsrs-hahaha-significado', 'girias-mais-usadas-no-whatsapp']),
 ('Casais', ['retrospectiva-de-namoro', 'perguntas-para-casal', 'presente-criativo-para-namorado']),
 ('Dicas para grupos', ['mensagens-de-fim-de-ano-para-grupo', 'amigo-secreto-pelo-whatsapp', 'brincadeiras-para-grupo-de-whatsapp', 'como-reanimar-grupo-parado', 'nomes-para-grupo-de-whatsapp', 'regras-para-grupo-de-whatsapp', 'como-evitar-brigas-no-grupo-da-familia', 'frases-de-bom-dia-para-grupo', 'jogos-para-jogar-com-amigos-e-familia']),
 ('Exportar e privacidade', ['como-exportar-conversa-whatsapp', 'exportar-conversa-whatsapp-nao-aparece', 'como-ler-conversa-exportada-do-whatsapp', 'privacidade-ao-analisar-conversas-do-whatsapp']),
]
