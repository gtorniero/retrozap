# /como-calculamos: metodologia do ranking e dos troféus, em linguagem simples (para usuários e imprensa).
# Escrito a partir do código: zapped.html (analyze, buildAwards, val, comparar, numerosDoGrupo, rankTxt) e stats.js.
# Se uma regra mudar no código, mude aqui também.

TITULO = 'Como calculamos o ranking e os troféus'
DESC = 'O que o Retrozap conta no seu celular, que números anônimos vão para o ranking, como sai o Top X% e as regras de cada troféu.'

FAQ_METODO = [
 ('O "Top X% do Brasil" vale para todos os grupos de WhatsApp do país?', 'Não. A comparação é com os grupos (ou casais) que fizeram a retrospectiva no Retrozap com a comparação ligada. Não é uma amostra de todos os grupos de WhatsApp do Brasil.'),
 ('Minhas mensagens são enviadas para montar o ranking?', 'Não. Só sobem números do grupo inteiro, como o total de mensagens do ano e a porcentagem de mensagens com risada. Mensagens, nomes, telefones e o arquivo da conversa não saem do celular.'),
 ('Dá para não participar do ranking?', 'Dá. Na tela da turma, a opção de comparar com outros grupos vem marcada e você pode desmarcar antes de começar. Sem ela, nada é enviado e a retrospectiva funciona igual, só sem as posições.'),
 ('Por que o ranking não apareceu para o meu grupo?', 'O ranking só aparece quando há grupos suficientes para comparar: pelo menos 10 grupos (ou 30 casais), contando o seu, e cada número precisa de pelo menos 10 valores para comparar. Também não aparece com a comparação desligada, sem internet ou com menos de 20 mensagens em 2026.'),
 ('Por que o troféu ficou com duas pessoas?', 'É empate técnico: as duas têm o mesmo valor ou, em contagens de 50 ou mais, a diferença entre elas é de até 3%.'),
 ('Por que o meu grupo não teve o troféu de Fantasma?', 'O Fantasma só sai quando alguém está na conversa há pelo menos 6 meses e mandou no máximo metade da sua parte justa das mensagens. Números sem nome salvo nunca concorrem. Se ninguém se encaixa, entra outra categoria no lugar.'),
 ('Por que os troféus usam só as mensagens de 2026?', 'Para o grupo de 10 anos não levar vantagem sobre o grupo novo. Se a conversa teve menos de 300 mensagens em 2026, o Retrozap usa a conversa inteira e avisa na tela.'),
]

def _faq(faq):
    return '<h2 id="perguntas">Perguntas frequentes</h2>' + ''.join(f'<h3>{q}</h3><p>{a}</p>' for q, a in faq)

CORPO = """
<h1>Como calculamos o ranking e os troféus</h1>
<div class="resposta">
<p><b>Em resumo:</b></p>
<ul>
<li>O arquivo da conversa é lido pelo seu navegador. Todas as contas são feitas no seu celular ou computador.</li>
<li>Os troféus, os personagens e as imagens usam só as mensagens de 2026.</li>
<li>Para o ranking, saem só números do grupo inteiro, e só se a opção de comparar estiver marcada. Nunca saem mensagens, nomes ou telefones.</li>
<li>"Top X%" compara o seu grupo com os grupos que fizeram a retrospectiva no Retrozap, não com todos os grupos do Brasil.</li>
<li>Cada troféu tem um mínimo de mensagens para ser justo. Quando ninguém atinge o mínimo, entra outra categoria.</li>
</ul>
</div>
<p>Esta página explica, em linguagem simples, o que o Retrozap conta e como chega a cada número. Ela foi escrita a partir das regras que estão no código do site. Dúvidas de imprensa ou de usuários: <a href="mailto:contato@retrozap.com.br">contato@retrozap.com.br</a>.</p>

<h2>1. O que é calculado no seu celular</h2>
<p>Você exporta a conversa pelo próprio WhatsApp e escolhe o arquivo no Retrozap. O navegador lê o arquivo e conta, para cada pessoa e para o grupo: mensagens, áudios, figurinhas, fotos e vídeos, mensagens apagadas, horários, dias da semana, risadas, palavrões, "bom dia", "parabéns", mensagens de carinho e outras expressões de uma lista fechada. Os troféus, os personagens, o resumo, os cards e o vídeo saem dessas contas, no próprio aparelho.</p>
<p>Alguns cuidados na leitura:</p>
<ul>
<li>Avisos do sistema (quem entrou, quem saiu, quem mudou o nome do grupo) e chamadas perdidas não contam como mensagem.</li>
<li>A marca "&lt;mensagem editada&gt;" sai do texto. Enquete, contato e localização contam como mídia.</li>
<li>Mensagens apagadas contam, inclusive as que a própria pessoa que exportou apagou.</li>
<li>No Android, quando o arquivo "sem mídia" marca tudo como "&lt;Mídia oculta&gt;", não dá para saber o que era áudio, foto ou figurinha. Nesse caso, o Podcaster dá lugar ao Inimigo do Texto e áudios e figurinhas ficam fora do ranking.</li>
</ul>

<h2>2. 2026 ou desde o começo?</h2>
<ul>
<li><b>Só 2026:</b> os troféus, os personagens, a categoria livre, os cards e o vídeo. Assim o grupo antigo não leva vantagem sobre o novo.</li>
<li><b>Exceção:</b> se a conversa teve menos de 300 mensagens em 2026, tudo volta a usar a conversa inteira, e a tela das categorias avisa.</li>
<li><b>Desde o início:</b> há quanto tempo a conversa existe, as mensagens ano a ano e as linhas marcadas como "desde o início" no resumo.</li>
<li><b>Comparação com o ano anterior:</b> só com 2025, no mesmo período (até o mesmo dia e mês da última mensagem de 2026), e só se o grupo já existia em 1º de janeiro de 2025.</li>
</ul>

<h2>3. O que vai para o ranking (e o que nunca vai)</h2>
<p>Na tela da turma, a opção "Comparar meu grupo com outros grupos do Retrozap" vem marcada, e você pode desmarcar antes de começar. Com ela marcada, o site envia só números do grupo inteiro, calculados com as mensagens de 2026:</p>
<ul>
<li>o tipo de grupo (amigos, família, trabalho, comunidade ou casal);</li>
<li>o total de mensagens, a média por dia e o recorde em um dia;</li>
<li>a quantidade de áudios e de figurinhas e o número de integrantes;</li>
<li>porcentagens: mensagens com risada, de madrugada (0h às 5h) e fora do horário comercial (depois das 19h ou no fim de semana);</li>
<li>quantas vezes aparecem palavrões, furos ("não vou conseguir"), "bom dia", "parabéns" e mensagens apagadas a cada mil mensagens, e o tamanho médio das mensagens;</li>
<li>no modo Casal, também "te amo" e corações, em proporção;</li>
<li>há quantos dias a conversa existe e os totais de mensagens e áudios desde o início;</li>
<li>um código de 32 caracteres calculado a partir da data e da hora da primeira mensagem e do tipo de grupo. Ele não contém texto nem nome e serve para o mesmo grupo não contar duas vezes: se for enviado de novo, só atualiza os números.</li>
</ul>
<p><b>Nunca saem do aparelho:</b> mensagens, nomes, telefones, fotos, áudios, o arquivo da conversa e os resultados de cada pessoa. O grupo de exemplo nunca é enviado. Detalhes na <a href="/privacidade">política de privacidade</a>.</p>

<h2>4. Com quem o seu grupo é comparado</h2>
<ul>
<li><b>Grupos nunca são comparados com casais</b>, e casais só com casais.</li>
<li><b>Com 30 ou mais grupos do mesmo tipo</b> (contando o seu), o grupo é comparado só com eles: amigos com amigos, família com família.</li>
<li><b>Antes disso</b>, a comparação é com todos os grupos, de qualquer tipo, a partir de 10 grupos.</li>
<li><b>Casais:</b> o ranking só aparece a partir de 30 casais. Antes disso, a tela mostra "Ranking dos casais em formação".</li>
<li><b>Cada número precisa de pelo menos 10 valores</b> (contando o seu) para entrar. Com menos, aquele número fica de fora, em vez de mostrar uma posição sem base.</li>
<li><b>No começo do ano</b>, enquanto há menos de 30 grupos reais de 2026 para comparar, o ranking dos grupos também usa estimativas feitas a partir de envios anteriores, que tinham a conversa inteira: o volume do ano é estimado pela média por dia vezes os dias de 2026, e as proporções ficam iguais. Assim que há 30 grupos reais, as estimativas saem da conta. Casais nunca usam estimativas.</li>
<li>A base de comparação é atualizada de tempos em tempos: um grupo novo pode levar até 4 horas para entrar na conta dos outros.</li>
</ul>

<h2>5. Como sai o "Top X%"</h2>
<p>Para cada número, o Retrozap conta quantos grupos comparados têm um valor maior que o seu. A posição é esse número mais um, dividida pelo total de grupos comparados (incluindo o seu), arredondada para cima. Exemplo: se 4 de outros 99 grupos mandaram mais mensagens que o seu, ele está na posição 5 de 100, e aparece como <b>Top 5%</b>. O menor valor possível é Top 1%, e um número zerado nunca vira destaque. Com muitos grupos, a conta usa 200 pontos de corte da distribuição, e a posição fica aproximada.</p>
""" + """<table><caption>Como cada posição aparece na tela.</caption><thead><tr><th scope="col">Posição</th><th scope="col">O que aparece</th></tr></thead><tbody>
<tr><th scope="row">Até 50%</th><td>"Top X% do Brasil" (no casal, "dos casais do Brasil").</td></tr>
<tr><th scope="row">De 51% a 90%</th><td>"Mais mensagens que Y% dos grupos", com Y = 100 menos X.</td></tr>
<tr><th scope="row">Pior que 90%</th><td>Não aparece.</td></tr>
<tr><th scope="row">Há quanto tempo existe</th><td>"Grupo mais antigo que Y% dos grupos", a partir de 10%. Usa a conversa inteira.</td></tr>
</tbody></table>
<p>O "do Brasil" quer dizer: entre os grupos que fizeram a retrospectiva no Retrozap e deixaram a comparação ligada. O card Top Brasil e o Plantão do Zap só aparecem quando o grupo fica entre os 10% primeiros em algum número.</p>

<h2>6. As regras dos troféus</h2>
<h3>Mínimos para ser justo</h3>
<ul>
<li><b>Categorias de contagem</b> (como mais áudios ou mais mensagens apagadas): o vencedor precisa de pelo menos 5 e o grupo de pelo menos 10 no total. Em grupos de até 5 pessoas, 3 e 5. Se ninguém atinge, entra uma categoria reserva.</li>
<li><b>Categorias de porcentagem</b> (Rei do Kkkk e Boca-Suja): só concorre quem mandou um mínimo de mensagens de texto (5% das mensagens do grupo, mas nunca menos de 30 nem mais de 100; em grupos de até 5 pessoas, nunca menos de 15) e teve pelo menos 3 ocorrências. Assim, quem mandou 4 mensagens com risada não vira campeão de 100%.</li>
<li><b>Empate técnico:</b> quando os dois primeiros têm o mesmo valor ou, em contagens de 50 ou mais, a diferença é de até 3%, o troféu sai com os dois nomes.</li>
</ul>
<h3>Como alguns troféus são definidos</h3>
<ul>
<li><b>O Tagarela:</b> quem mais mandou mensagens.</li>
<li><b>Rei do Kkkk:</b> a maior porcentagem de mensagens de texto com risada. Contam kkk (três k ou mais), haha, rsrs, hehehe, hihi, huehue, hauahau e os emojis de risada. Veja <a href="/blog/kkkk-rsrs-hahaha-significado">o que cada risada quer dizer</a>.</li>
<li><b>Boca-Suja:</b> palavrões a cada 100 mensagens de texto, de uma lista fechada de palavrões comuns.</li>
<li><b>Puxa-Assunto:</b> quem manda a primeira mensagem depois de 6 horas ou mais de silêncio (inclusive de um dia para o outro), a partir das 7h, e recebe resposta de outra pessoa em até 2 horas.</li>
<li><b>O Fantasma:</b> quem menos falou, com três condições: aparece na conversa há pelo menos 6 meses, não é um número sem nome salvo e mandou no máximo metade da sua parte justa das mensagens (num grupo de 4 pessoas que falam, até 12,5%). Quem estava no grupo antes de 2026 e não falou nada no ano também concorre. Grupos com menos de 3 pessoas não têm Fantasma. Sem ninguém nessas condições, ninguém é chamado de fantasma.</li>
<li><b>Madrugada:</b> mensagens entre 0h e 5h. Para o Despertador, o dia começa às 5h, para quem manda boa-noite depois da meia-noite não virar despertador.</li>
</ul>
<p>Os prêmios são brincadeiras feitas a partir de contagens automáticas. Eles não avaliam o caráter, a saúde ou a vida de ninguém.</p>

<h2>7. O que o Retrozap nunca coleta</h2>
<ul><li>O texto das mensagens.</li><li>Nomes e telefones de quem está no grupo.</li><li>Fotos, áudios, vídeos e o arquivo da conversa.</li><li>Quem ganhou cada troféu.</li></ul>
<p>Dá para conferir: abra o site, ative o modo avião e faça a retrospectiva. Tudo funciona igual, só sem a comparação com outros grupos.</p>
""" + _faq(FAQ_METODO) + """
<div class="chamada"><h2>Quer ver os números do seu grupo?</h2><p>A conversa é lida no seu celular e as mensagens não saem dele. O primeiro grupo é grátis.</p><p><a class="cta" href="/">Fazer a retrospectiva do meu grupo</a></p></div>
"""

COMO_CALCULAMOS = ('como-calculamos.html', TITULO, DESC, CORPO)
