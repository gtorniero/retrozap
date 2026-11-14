# Ferramentas grátis do Retrozap (páginas de busca): gerador de nomes para grupo e sorteio de amigo secreto.
# Tudo roda no navegador: nenhum nome digitado aqui vai para servidor nenhum (nem para o nosso).
import json, html as _h

SITE = 'https://retrozap.com.br'
ORG = {"@type": "Organization", "@id": SITE + '/#org', "name": "Retrozap", "url": SITE + '/', "logo": {"@type": "ImageObject", "url": SITE + '/icon-512.png'}}

def webapp(nome, url, desc):
    return {"@context": "https://schema.org", "@type": "WebApplication", "name": nome, "url": url, "description": desc,
            "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any", "browserRequirements": "Requer um navegador atual",
            "inLanguage": "pt-BR", "isAccessibleForFree": True, "offers": {"@type": "Offer", "price": "0", "priceCurrency": "BRL"}, "publisher": ORG}

def faq_html(faq, titulo='Perguntas frequentes'):
    return f'<h2 id="perguntas">{titulo}</h2>' + ''.join(f'<h3>{q}</h3><p>{a}</p>' for q, a in faq)

def _js(codigo):
    # JSON dentro de <script>: nunca fecha a tag
    return codigo.replace('</', '<\\/')

# ======================================================================
# Nomes para grupo de WhatsApp
# estilo: e = engraçado, c = carinhoso, s = simples
# [Ano] vira o ano atual no gerador; qualquer outro [..] vira o apelido digitado
# ======================================================================
NOMES = [
('familia', 'Família', 'Nomes para grupo da família',
 'Para o grupo que acorda com bom dia e foto de flor. Troque o [Sobrenome] pelo da sua família.', """
Família Reunida|s; Clã dos [Sobrenome]|s; Raízes|c; Casa da Vó|c; Almoço de Domingo|c; Família Unida Jamais Será Vencida|e;
Galho Torto da Árvore|e; Herdeiros do Nada|e; Família Buscapé|e; Tribo [Sobrenome]|s; Mesa Farta|c; Ninho|c; Família Margarina|e;
Sangue Bom|c; Grupo da Paz (por Enquanto)|e; Café na Casa da Tia|c; Os [Sobrenome] e Agregados|e; Família em Primeiro Lugar|c;
Lar Doce Grupo|c; Central da Família|s; Chegou Bem?|e; Mãe Mandou Avisar|e; Reunião de Família (Sem Briga)|e;
Os Que Se Amam (e Se Aguentam)|e; Família [Sobrenome] Oficial|s; Netos e Bisnetos|c; Abraço de Vó|c; Pudim de Domingo|c;
Os Mais Chegados|c; Árvore Genealógica|s"""),
('primos', 'Primos', 'Nomes para grupo de primos',
 'Primo é o amigo que veio de brinde com a família. Estes nomes servem para a turma que cresceu junta nas festas.', """
Primaiada|e; Os Primos|s; Primos Unidos|s; Primos e Primas|s; Conselho dos Primos|e; Liga dos Primos|e; Primos de Primeira|c;
Primos Desde o Berço|c; Bonde dos Primos|e; Netos da Vó|c; Crias da Vó|e; Mesa das Crianças (Até Hoje)|e; Os Primos Mais Legais|e;
Primos & Cia|s; Geração Neto|s; Primos Sem Juízo|e; Primos de Sangue, Amigos de Escolha|c; Herdeiros da Bagunça|e;
Primos pelo Mundo|c; Fofoca de Primo|e"""),
('amigos', 'Amigos', 'Nomes para grupo de amigos',
 'Para a turma da resenha, dos rolês e do "fica pra próxima".', """
Os de Sempre|s; Resenha|s; Bonde|s; Panelinha|e; Os Inseparáveis|c; Turma do Barulho|e; Só os Brabos|e; Conselho dos Sábios|e;
Amigos de Infância|c; Bando de Loucos|e; Os Sem Juízo|e; Diretoria|s; Sócios do Caos|e; Grupo de Apoio Emocional|e; Confraria|s;
QG|s; A Família que a Gente Escolheu|c; Plano B|s; Esquadrão|s; Mesa do Bar|s; Amizade Sem Prazo de Validade|c;
Desde Sempre, Para Sempre|c; Melhores Amigos|c; Rolê Aleatório|e; Só Gente Boa|c; Os Fiéis|c; Ninguém Solta a Mão de Ninguém|c;
Clube dos Cinco (ou Mais)|e; Liga Extraordinária|e; Amigos do Peito|c"""),
('engracados', 'Engraçados', 'Nomes engraçados e criativos para qualquer grupo',
 'Servem para qualquer turma que não se leva a sério. Bons para trocar o nome do grupo por uma semana e ver quem percebe.', """
Grupo Sem Nome|e; Ninguém Responde|e; Silenciado por 8 Horas|e; Áudio de 5 Minutos|e; Visualizou e Saiu|e; Kkkkkkk|e; Só Memes|e;
Tô Saindo (Não Tô)|e; Melhor Grupo do Zap|e; Grupo Teste (Que Virou Oficial)|e; Criado para um Churrasco em 2019|e; Respondo Depois|e;
Gente que Some|e; Os Sem Wi-Fi|e; Bom Dia Só Amanhã|e; Senta que Lá Vem História|e; Aqui Ninguém Trabalha|e; Figurinhas Proibidas|e;
Arquivo Morto (Que Não Morre)|e; Notificações Silenciadas|e; Lido às 3h da Manhã|e; Fala Muito, Faz Pouco|e; Comitê do Nada|e;
Ilustríssimos Desocupados|e; Diga Não ao Áudio Longo|e"""),
('fofoca', 'Fofoca', 'Nomes para grupo de fofoca',
 'Para o grupo onde a notícia chega antes do jornal. Use com moderação (e sem expor ninguém).', """
Central de Fofoca|e; Fofoca com Recibo|e; Rádio Corredor|e; Fofocalizando|e; Chá de Fofoca|e; Jornal da Resenha|e; Tô Sabendo|e;
Linha Direta|s; Plantão da Fofoca|e; Babado Forte|e; Me Conta Tudo|c; Fontes Confiáveis|e; Sigilo Absoluto (Só que Não)|e;
Print ou Não Aconteceu|e; Café com Fofoca|e"""),
('trabalho', 'Trabalho', 'Nomes para grupo do trabalho',
 'Leves, sem piada que possa constranger alguém. Troque o [Área] pelo nome do time ou do projeto.', """
Equipe [Área]|s; Time [Projeto]|s; Avisos da Equipe|s; Café com a Equipe|c; Força-Tarefa|s; Alinhamentos|s; Pauta do Dia|s;
Turma do Cafezinho|c; Happy Hour da Firma|e; Time dos Sonhos|c; Central de Avisos|s; Escritório Paralelo|e; Bastidores|s; Corredor|s;
Almoço da Firma|c; Reunião que Podia Ser Mensagem|e; Segunda-Feira Eterna|e; Sextou na Firma|e; Pode Deixar que Eu Faço|e;
Firma Unida|s; Departamento do Café|e; Entregas da Semana|s; Plantão [Área]|s; Turma do Home Office|s; Colegas, Mas Amigos|c"""),
('escola', 'Escola e faculdade', 'Nomes para grupo da escola e da faculdade',
 'Para a sala, o grupo de trabalho da faculdade e o grupo dos pais. O [Ano] vira o ano da turma.', """
Turma [Ano]|s; Formandos [Ano]|s; Calouros [Ano]|s; Terceirão Unido|s; Trabalho Final|s; Socorro, Prova|e; Resumos e Desesperos|e;
Mães e Pais da Turma|s; Revisão de Véspera|e; Fundão|e; Intervalo|s; TCC Sem Fim|e; Biblioteca Fantasma|e;
Grupo de Estudos (Só de Nome)|e; Vai Cair na Prova?|e; Colar Não Vale|e; Galera da Facul|s; Moradores da República|s;
Turma da Cantina|c; Amigos da Facul para a Vida|c; Matéria Acumulada|e; Diploma ou Nada|e; Reencontro da Turma|c;
Sala de Aula Virtual|s; Recreio Eterno|e"""),
('casal', 'Casal', 'Nomes para grupo de casal',
 'Para o grupo só de vocês dois (lista de mercado, contas, planos) ou com os amigos casais.', """
Nós Dois|c; Eu e Você|c; Casa Nossa|c; Dupla Imbatível|e; Amor e Boletos|e; Planos a Dois|s; Lista de Mercado e Amor|e;
Contas da Casa|s; Meu Bem e Eu|c; Ninho de Amor|c; Filme e Brigadeiro|e; Casal Mais Lindo do Zap|e; Diário de Nós|c; Viagens a Dois|s;
Família em Construção|c; Te Amo, Mas Responde|e; Dois Corações e um Wi-Fi|e; Nosso Cantinho|c; A Gente|c;
Para Sempre (e Mais um Dia)|c"""),
('futebol', 'Futebol e esporte', 'Nomes para grupo de futebol e esporte',
 'Para a pelada, o racha, o vôlei e o grupo da corrida que só corre no domingo.', """
Pelada de Quinta|s; Futebol dos Amigos|s; Racha de Domingo|s; Time da Firma|s; Vôlei de Praia|s; Beach Tennis da Galera|s;
Corredores de Fim de Semana|s; Pedal de Domingo|s; Bolão da Copa|s; Resenha Pós-Jogo|e; Craques Aposentados|e; Arquibancada|s;
Joelho Ruim FC|e; Academia Sem Desculpa|e; Trilheiros|s; Perna de Pau FC|e; Terceiro Tempo|e; Quem Paga a Quadra?|e;
Galácticos da Várzea|e; Torcida Organizada do Sofá|e"""),
('condominio', 'Condomínio', 'Nomes para grupo do condomínio e da vizinhança',
 'Claros e fáceis de achar: no grupo do prédio, o nome precisa dizer para que ele serve.', """
Moradores do [Prédio]|s; Vizinhos do Bloco A|s; Avisos do Condomínio|s; Vizinhança Solidária|c; Indicações do Prédio|s;
Classificados do Prédio|s; Pets do Condomínio|c; Caronas do Bairro|s; Feira de Trocas|s; Hall de Entrada|s;
Mães e Pais do Condomínio|s; Horta Comunitária|c; Bairro em Alerta|s; Encomendas e Achados|s; Quem Está Furando a Parede?|e;
Elevador Social|e; Vizinhos que Viraram Amigos|c; Rua [Nome] Unida|s; Portaria Virtual|s; Síndico Não Dorme|e"""),
('natal', 'Natal e fim de ano', 'Nomes para grupo de Natal, amigo secreto e Réveillon',
 'Para o grupo temporário da ceia, do amigo secreto ou da viagem da virada.', """
Amigo Secreto da Família|s; Amigo Secreto da Firma|s; Ceia dos [Sobrenome]|c; Natal em Família|c; Noite Feliz (e Barulhenta)|e;
Operação Ceia|e; Quem Traz a Farofa?|e; Réveillon da Galera|s; Contagem Regressiva|s; Pé na Areia na Virada|s;
Papai Noel Secreto|e; Amigo da Onça|e; Natal o Ano Todo|c; Uva-Passa Não|e; Ano Novo, Grupo Velho|e; Retrospectiva da Turma|s;
Confraternização|s; Pavê ou Pacomê|e; Especial de Fim de Ano|e; Brinde à Turma|c"""),
('viagem', 'Viagem', 'Nomes para grupo de viagem e eventos',
 'Para a viagem, o show, a despedida de solteiro e todo grupo com data para acabar.', """
Partiu [Destino]|s; Rumo à Praia|s; Mochilão|s; Casa de Praia|c; Carnaval [Ano]|s; Despedida de Solteiro(a)|e; Racha da Viagem|s;
Bate e Volta|s; Show do Ano|s; Ilha de Edição (Só as Fotos)|e; Mala Pronta|s; Quem Leva o Protetor?|e; Fotos da Viagem|s;
Aeroporto em 3, 2, 1|e; Pé na Estrada|c"""),
]

def _itens(txt):
    out = []
    for parte in txt.split(';'):
        parte = ' '.join(parte.split())
        if not parte: continue
        nome, est = parte.rsplit('|', 1)
        assert est in ('e', 'c', 's'), parte
        out.append((nome.strip(), est))
    return out

CATS_NOMES = [(cid, rot, tit, intro, _itens(txt)) for cid, rot, tit, intro, txt in NOMES]
_todos = [n.lower() for c in CATS_NOMES for n, _ in c[4]]
assert len(_todos) == len(set(_todos)), 'nome repetido na lista de nomes para grupo: ' + str([n for n in _todos if _todos.count(n) > 1])
TOTAL_NOMES = len(_todos)

FAQ_NOMES = [
 ('Qual é um bom nome para grupo de WhatsApp?', 'Um nome curto, de duas ou três palavras, que tenha a cara da turma e ainda faça sentido daqui a alguns anos. Piada interna funciona, desde que todo mundo entenda e ninguém se sinta zoado.'),
 ('Como mudar o nome do grupo no WhatsApp?', 'Abra o grupo e toque no nome dele, lá em cima. No iPhone, toque no nome de novo (ou em Editar), escreva o novo e salve. No Android, toque no nome ou no lápis, escreva e confirme. Todo mundo vê um aviso de que o nome mudou.'),
 ('Por que não consigo mudar o nome do grupo?', 'Provavelmente um administrador deixou a edição dos dados do grupo só para administradores. Peça para um deles trocar o nome ou liberar a opção nas configurações do grupo.'),
 ('Dá para colocar emoji no nome do grupo?', 'Dá. Um emoji no começo ajuda a achar o grupo na lista de conversas. Use um ou dois, sem exagero, para o nome não ficar difícil de ler.'),
 ('Como escolher o nome sem briga?', 'Separe três ou quatro favoritos e faça uma enquete no próprio grupo. Além de resolver a dúvida, já vira a primeira conversa da turma.'),
 ('O gerador de nomes é grátis?', 'É, e não precisa de cadastro. O gerador funciona no seu navegador: o que você digita no campo do apelido não é enviado para nenhum servidor.'),
]

def _lista_nomes(itens):
    return '<ol class="lista-nomes">' + ''.join(f'<li>{_h.escape(n)}</li>' for n, _ in itens) + '</ol>'

def nomes_corpo():
    dados = {"cats": [{"id": cid, "itens": [[n, e] for n, e in itens]} for cid, _, _, _, itens in CATS_NOMES]}
    opcoes = '<option value="todos">Qualquer tipo</option>' + ''.join(f'<option value="{cid}">{_h.escape(rot)}</option>' for cid, rot, _, _, _ in CATS_NOMES)
    atalhos = '<nav class="atalhos" aria-label="Ir para a lista"><ul>' + '<li><a href="#gerador-t">Gerador</a></li>' + ''.join(f'<li><a href="#{cid}">{_h.escape(rot)}</a></li>' for cid, rot, _, _, _ in CATS_NOMES) + '</ul></nav>'
    secoes = ''.join(f'<h2 id="{cid}">{_h.escape(tit)}</h2><p>{_h.escape(intro)}</p>{_lista_nomes(itens)}' for cid, _, tit, intro, itens in CATS_NOMES)
    return f"""
<h1>Nomes para grupo de WhatsApp: {TOTAL_NOMES} ideias e um gerador</h1>
<div class="resposta"><p><b>Resposta rápida:</b> um bom nome para grupo de WhatsApp é curto (duas ou três palavras), tem a cara da turma e ainda faz sentido daqui a alguns anos. Abaixo estão {TOTAL_NOMES} nomes originais, separados por tipo de grupo, e um gerador que sorteia nomes pelo estilo que você quiser.</p></div>
{atalhos}
<section class="ferramenta" aria-labelledby="gerador-t">
<h2 id="gerador-t">Gerador de nomes para grupo</h2>
<p>Escolha o tipo de grupo e o estilo. O gerador sorteia 5 nomes da lista; toque em <b>Copiar</b> e cole no nome do grupo.</p>
<form id="gerador" class="campos" novalidate>
<label for="gCat">Tipo de grupo</label>
<select id="gCat" name="gCat">{opcoes}</select>
<fieldset class="chips"><legend>Estilo</legend>
<label class="chip"><input type="radio" name="gEst" value="todos" checked><span>Qualquer</span></label>
<label class="chip"><input type="radio" name="gEst" value="e"><span>Engraçado</span></label>
<label class="chip"><input type="radio" name="gEst" value="c"><span>Carinhoso</span></label>
<label class="chip"><input type="radio" name="gEst" value="s"><span>Simples</span></label>
</fieldset>
<label for="gApelido">Sobrenome, apelido ou nome do time <span class="small">(opcional)</span></label>
<input id="gApelido" name="gApelido" maxlength="30" autocomplete="off" aria-describedby="gApelidoDica">
<p id="gApelidoDica" class="small">Entra no lugar do que aparece entre colchetes, como [Sobrenome].</p>
<button type="submit" class="bt">Gerar nomes</button>
</form>
<div id="gRes" hidden>
<h3 id="gResT" tabindex="-1">Nomes para o seu grupo</h3>
<ul class="nomes-gerados" id="gLista"></ul>
<button type="button" class="bt2" id="gMais">Gerar outros</button>
</div>
<p id="gMsg" class="small" role="status"></p>
<noscript><p>O gerador precisa do JavaScript ligado. A lista completa está logo abaixo.</p></noscript>
</section>
<h2>Como escolher um bom nome</h2>
<ul><li><b>Curto:</b> o nome aparece cortado na lista de conversas e nas notificações. Duas ou três palavras bastam.</li><li><b>Fácil de achar:</b> um emoji no começo ajuda a encontrar o grupo no meio de tantos outros.</li><li><b>Com a cara da turma:</b> piada interna funciona, desde que todo mundo entenda e ninguém se sinta zoado.</li><li><b>Pensando no futuro:</b> "Formatura 2026" fica estranho em 2030. Se o grupo vai durar, prefira algo atemporal.</li><li><b>Combinando com a foto:</b> nome e foto do grupo juntos contam a mesma história.</li><li><b>Avisando a mudança:</b> trocar o nome do nada confunde. Mande uma mensagem antes ou faça uma enquete.</li></ul>
{secoes}
<h2>Como mudar o nome do grupo no WhatsApp</h2>
<ol><li>Abra o grupo e toque no <b>nome dele</b>, lá em cima.</li><li>No iPhone, toque no nome de novo (ou em <b>Editar</b>). No Android, toque no nome ou no <b>lápis</b>.</li><li>Escreva o nome novo e toque em <b>Salvar</b> (ou <b>OK</b>).</li></ol>
<p>Se a opção não aparecer, um administrador limitou a edição dos dados do grupo. Peça para ele trocar o nome. Os nomes dos menus podem mudar um pouco conforme a versão do aplicativo.</p>
<h2>Depois do nome, a história</h2>
<p>Nome escolhido, grupo criado. Agora vale combinar o básico para ele não virar bagunça: veja um <a href="/blog/regras-para-grupo-de-whatsapp">modelo de regras para grupo</a> pronto para copiar. Se o grupo já existe há anos e anda quieto, tem <a href="/blog/brincadeiras-para-grupo-de-whatsapp">30 brincadeiras para fazer hoje</a>. Vai ter amigo secreto? Faça o <a href="/amigo-secreto">sorteio de amigo secreto pelo WhatsApp</a>, de graça.</p>
<div class="chamada"><h2>E quando o grupo já tiver história?</h2><p>Descubra quem é o Tagarela, quem é o Fantasma e qual é a gíria oficial da turma com a retrospectiva do grupo no Retrozap. A conversa é lida no seu celular e as mensagens não saem dele.</p><p><a class="cta" href="/">Fazer a retrospectiva do meu grupo</a></p></div>
{faq_html(FAQ_NOMES)}
<script>window.RZ_NOMES={_js(json.dumps(dados, ensure_ascii=False))};
{GERADOR_JS}</script>
"""

GERADOR_JS = r"""(function(){
var D = window.RZ_NOMES, f = document.getElementById('gerador'); if (!f || !D) return;
var lista = document.getElementById('gLista'), res = document.getElementById('gRes'), msg = document.getElementById('gMsg'), tit = document.getElementById('gResT');
var ano = String(new Date().getFullYear()), ultimos = [];
function rnd(n){ var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do { crypto.getRandomValues(a); } while (a[0] >= lim); return a[0] % n; }
function embaralha(a){ for (var i = a.length - 1; i > 0; i--){ var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function preenche(n, ap){ return n.replace(/\[Ano\]/g, ano).replace(/\[[^\]]+\]/g, function(m){ return ap || m; }); }
function copia(txt, b){
  function fim(ok){
    msg.textContent = ok ? 'Copiado: ' + txt + '. Agora é só colar no nome do grupo.' : 'Não deu para copiar sozinho. Toque e segure o nome para copiar: ' + txt;
    if (ok){ b.firstChild.nodeValue = 'Copiado'; setTimeout(function(){ b.firstChild.nodeValue = 'Copiar'; }, 2000); }
    try { if (ok && typeof gtag === 'function') gtag('event', 'copiou_nome'); } catch (e) {}
  }
  function velho(){ var ok = false; try { var t = document.createElement('textarea'); t.value = txt; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); ok = document.execCommand('copy'); t.remove(); } catch (e) {} fim(ok); }
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(function(){ fim(true); }, velho); else velho();
}
function gera(focar){
  var cat = f.gCat.value, e = f.querySelector('input[name=gEst]:checked'), est = e ? e.value : 'todos';
  var ap = f.gApelido.value.replace(/\s+/g, ' ').trim().slice(0, 30);
  var base = []; D.cats.forEach(function(c){ if (cat === 'todos' || c.id === cat) base = base.concat(c.itens); });
  var pool = base.filter(function(x){ return est === 'todos' || x[1] === est; }), aviso = '';
  if (pool.length < 5){ aviso = 'Tem poucos nomes desse estilo nesse tipo de grupo, então completamos com outros. '; pool = pool.concat(base.filter(function(x){ return pool.indexOf(x) < 0; })); }
  var novos = embaralha(pool.filter(function(x){ return ultimos.indexOf(x[0]) < 0; }));
  if (novos.length < 5) novos = novos.concat(embaralha(pool.filter(function(x){ return ultimos.indexOf(x[0]) >= 0; })));
  var esc = novos.slice(0, 5), colchete = false; ultimos = esc.map(function(x){ return x[0]; });
  lista.textContent = '';
  esc.forEach(function(x){
    var nome = preenche(x[0], ap); if (/\[/.test(nome)) colchete = true;
    var li = document.createElement('li'), s = document.createElement('span'), b = document.createElement('button'), sr = document.createElement('span');
    s.className = 'nome'; s.textContent = nome;
    b.type = 'button'; b.className = 'bt2 copiar'; b.appendChild(document.createTextNode('Copiar')); sr.className = 'sr-only'; sr.textContent = ' o nome ' + nome; b.appendChild(sr);
    b.addEventListener('click', function(){ copia(nome, b); });
    li.appendChild(s); li.appendChild(b); lista.appendChild(li);
  });
  res.hidden = false;
  msg.textContent = aviso + (colchete ? 'Troque o que está entre colchetes pelo nome da turma, ou preencha o campo do apelido.' : '') + (focar ? '' : ' Mais 5 nomes na lista.');
  if (focar) tit.focus();
  try { if (typeof gtag === 'function') gtag('event', 'gerou_nomes', {categoria: cat, estilo: est}); } catch (e) {}
}
f.addEventListener('submit', function(ev){ ev.preventDefault(); gera(true); });
document.getElementById('gMais').addEventListener('click', function(){ gera(false); });
})();"""

# ======================================================================
# Sorteio de amigo secreto pelo WhatsApp (/amigo-secreto)
# O resultado de cada pessoa vai no próprio link, depois do # (o navegador não envia essa parte a servidor nenhum).
# ======================================================================
FAQ_AMIGO = [
 ('Como fazer o sorteio do amigo secreto pelo WhatsApp?', 'Escreva os nomes de quem vai participar, um por linha, e toque em Sortear. Depois toque em Mandar no WhatsApp ao lado de cada nome e escolha a conversa daquela pessoa. Cada link mostra só quem ela tirou.'),
 ('Alguém pode tirar o próprio nome?', 'Não. O sorteio nunca deixa uma pessoa tirar a si mesma.'),
 ('Precisa de cadastro ou do telefone das pessoas?', 'Não. Basta o nome ou um apelido. Você escolhe a conversa de cada pessoa no próprio WhatsApp, e nenhum telefone passa pelo site.'),
 ('Os nomes ficam salvos em algum servidor?', 'Não. O sorteio é feito pelo seu navegador e o resultado de cada pessoa vai dentro do próprio link, na parte depois do #, que o navegador não envia para servidor nenhum. Para você conseguir reenviar um link, o último sorteio fica guardado só neste aparelho, até você tocar em Apagar sorteio.'),
 ('Quem organiza fica sabendo quem tirou quem?', 'A página não mostra os pares para quem organiza. Mas cada link revela o amigo secreto daquela pessoa, então não abra os links dos outros. Se você também participa, abra só o seu.'),
 ('E se alguém perder o link?', 'Abra esta página no mesmo celular em que fez o sorteio: ele continua salvo, e é só mandar o link daquela pessoa de novo.'),
 ('Dá para refazer o sorteio?', 'Dá, no botão Refazer o sorteio. Os links antigos continuam mostrando o resultado antigo, então mande os novos para todo mundo. O código do sorteio aparece em cada link, para todos conferirem se estão no sorteio certo.'),
 ('Quantas pessoas podem participar?', 'De 3 a 100 pessoas. É grátis e não tem anúncio.'),
]

AMIGO_TITULO = 'Sorteio de amigo secreto pelo WhatsApp'
AMIGO_DESC = 'Sorteie o amigo secreto grátis e mande um link para cada pessoa no WhatsApp. Ninguém tira a si mesmo, sem cadastro e sem telefone. Os nomes ficam no seu celular.'

AMIGO_CORPO = """
<h1>Sorteio de amigo secreto pelo WhatsApp</h1>
<p class="so-org">Sorteie o amigo secreto em um minuto e mande para cada pessoa um link só dela no WhatsApp. Ninguém tira o próprio nome, não precisa de cadastro nem de telefone, e os nomes não saem do seu celular.</p>
<section id="revelar" class="ferramenta" aria-labelledby="rvT" hidden>
<div id="rvOk">
<p class="olho" id="rvEvento"></p>
<h2 id="rvT" tabindex="-1">Oi, <span id="rvDe"></span>! Seu amigo secreto está aqui</h2>
<p>Este link é só seu. Confira se ninguém está olhando a tela e toque no botão.</p>
<button type="button" class="bt" id="rvMostrar">Mostrar quem eu tirei</button>
<div id="rvCaixa" class="as-sorteado" tabindex="-1" hidden>
<p class="small">Você tirou</p>
<p class="as-grande" id="rvPara"></p>
<ul class="as-info" id="rvInfo"></ul>
<button type="button" class="bt2" id="rvEsconder">Esconder</button>
</div>
</div>
<div id="rvErro" hidden><h2>Este link não abriu</h2><p>Ele pode ter sido cortado ao copiar. Peça para quem organizou o sorteio mandar o seu link de novo.</p></div>
<p class="small">Depois da festa, que tal descobrir quem é o Tagarela e quem é o Fantasma do grupo? <a href="/">Faça a retrospectiva do grupo no Retrozap</a>.</p>
<p><a class="bt2" id="rvNovo" href="/amigo-secreto">Organizar outro sorteio</a></p>
</section>
<section id="asTool" class="ferramenta" aria-labelledby="asToolT">
<h2 id="asToolT">Faça o sorteio</h2>
<form id="asForm" class="campos" novalidate>
<label for="asNomes">Participantes <span class="small">(um nome por linha)</span></label>
<textarea id="asNomes" rows="6" maxlength="4000" autocomplete="off" spellcheck="false" aria-describedby="asNomesDica asErro" placeholder="Ana&#10;Bruno&#10;Caio&#10;Dani&#10;Edu"></textarea>
<p id="asNomesDica" class="small">De 3 a 100 pessoas. O primeiro nome ou um apelido já basta. Não precisa de telefone. <span id="asConta"></span></p>
<p id="asErro" class="erro" role="alert" hidden></p>
<label for="asEvento">Nome do sorteio <span class="small">(opcional)</span></label>
<input id="asEvento" maxlength="40" autocomplete="off" placeholder="Ex.: Amigo secreto da família">
<div class="duas">
<div><label for="asValor">Valor do presente até R$ <span class="small">(opcional)</span></label><input id="asValor" inputmode="decimal" maxlength="10" autocomplete="off" placeholder="Ex.: 50"></div>
<div><label for="asData">Data da troca <span class="small">(opcional)</span></label><input id="asData" type="date"></div>
</div>
<label for="asRecado">Recado para todos <span class="small">(opcional)</span></label>
<input id="asRecado" maxlength="120" autocomplete="off" placeholder="Ex.: Troca na casa da vó, às 20h">
<button type="submit" class="bt">Sortear</button>
</form>
<noscript><p>O sorteio precisa do JavaScript ligado no navegador.</p></noscript>
</section>
<section id="asResultado" class="ferramenta" aria-labelledby="asResT" hidden>
<h2 id="asResT" tabindex="-1">Sorteio feito! Agora mande um link para cada pessoa</h2>
<p>Toque em <b>Mandar no WhatsApp</b> e escolha a conversa daquela pessoa. Cada link mostra só quem ela tirou. Mande no privado, nunca no grupo, e <b>não abra os links dos outros</b>.</p>
<p class="small">Código do sorteio: <b id="asCod"></b>. Ele aparece no link de cada pessoa, para todos conferirem que é o sorteio certo. <span id="asSalvo"></span></p>
<ul id="asLista" class="as-lista"></ul>
<p id="asMsg" class="small" role="status"></p>
<div class="as-fim"><button type="button" class="bt2" id="asRefaz">Refazer o sorteio</button><button type="button" class="bt2" id="asApaga">Apagar sorteio deste aparelho</button></div>
</section>
<div class="resposta so-org"><p><b>Como funciona:</b> 1. escreva os nomes; 2. toque em Sortear; 3. mande o link de cada pessoa pelo WhatsApp. Cada link mostra só o amigo secreto daquela pessoa.</p></div>
<h2>Passo a passo</h2>
<ol><li><b>Combine no grupo</b> quem participa, o valor e a data da troca.</li><li><b>Escreva os nomes</b> acima, um por linha. Se tiver duas Anas, diferencie: "Ana Paula" e "Ana Lúcia".</li><li><b>Toque em Sortear.</b> A página não mostra quem tirou quem, nem para quem organiza.</li><li><b>Mande os links:</b> toque em Mandar no WhatsApp ao lado de cada nome e escolha a conversa daquela pessoa. Se preferir, copie o link e cole você mesmo.</li><li><b>Cada pessoa abre o próprio link</b> e toca em "Mostrar quem eu tirei".</li></ol>
<h2>Por que os nomes não saem do seu celular</h2>
<ul><li><b>O sorteio acontece no seu navegador.</b> A página não envia os nomes para nenhum servidor, nem para o nosso.</li><li><b>O resultado vai dentro do link</b>, na parte depois do #. O navegador não envia essa parte para servidor nenhum quando a pessoa abre o link.</li><li><b>Sem telefone:</b> você escolhe a conversa de cada pessoa no próprio WhatsApp.</li><li><b>O nome sorteado vai embaralhado no link</b>, para ninguém ler sem querer na conversa. Não é um cofre: quem abrir o link vê o resultado, por isso cada link vai só para a pessoa certa.</li><li><b>O último sorteio fica guardado só neste aparelho</b>, para você reenviar um link se alguém perder. O botão Apagar sorteio tira tudo.</li></ul>
<h2>Dicas para o amigo secreto dar certo</h2>
<ul><li><b>Valor com faixa:</b> combine um mínimo e um máximo, e ninguém fica sem graça na hora da troca.</li><li><b>Lista de desejos:</b> peça três sugestões de presente para cada um. Assim ninguém ganha a quinta caneca do ano.</li><li><b>Prazo para confirmar:</b> sorteie só depois que todo mundo confirmou. Quem entra depois obriga a refazer o sorteio.</li><li><b>Dicas no grupo:</b> durante a semana, cada um dá uma pista sobre quem tirou. Rende boas risadas.</li></ul>
<p>Mais ideias no guia de <a href="/blog/amigo-secreto-pelo-whatsapp">como organizar amigo secreto pelo WhatsApp</a>, nas <a href="/blog/mensagens-de-fim-de-ano-para-grupo">mensagens de fim de ano para o grupo</a> e nos <a href="/blog/nomes-para-grupo-de-whatsapp">nomes para o grupo do amigo secreto</a>.</p>
<div class="chamada"><h2>Depois da festa, faça a retrospectiva do grupo no Retrozap</h2><p>Quem mais falou em 2026, quem sumiu, quem mais riu e a gíria oficial da turma, com troféu para cada um. A conversa é lida no seu celular e as mensagens não saem dele. O primeiro grupo é grátis.</p><p><a class="cta" href="/">Fazer a retrospectiva do grupo</a></p></div>
""" + faq_html(FAQ_AMIGO) + """
<script>
""" + r"""(function(){
var $ = function(id){ return document.getElementById(id); };
var K = 'rz_amigo_secreto', PRAZO = 120 * 864e5, MIN = 3, MAX = 100, PRE = 'as1.';
function ev(n, p){ try { if (typeof gtag === 'function') gtag('event', n, p || {}); } catch (e) {} }
function guarda(d){ try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {} }
function lido(){ try { var d = JSON.parse(localStorage.getItem(K) || 'null'); if (d && d.v === 1 && d.ps && Date.now() - d.t < PRAZO) return d; } catch (e) {} return null; }
function apaga(){ try { localStorage.removeItem(K); } catch (e) {} }
function bytes(n){ return crypto.getRandomValues(new Uint8Array(n)); }
function rnd(n){ var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n; do { crypto.getRandomValues(a); } while (a[0] >= lim); return a[0] % n; }
function b64(u){ var s = ''; for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function de64(s){ s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
// embaralha os bytes do resultado (não é criptografia: só evita que o nome apareça legível no link)
function fluxo(s, n){ var x = s || 0x9e3779b9, o = new Uint8Array(n); for (var i = 0; i < n; i++){ x ^= x << 13; x ^= x >>> 17; x ^= x << 5; o[i] = x & 255; } return o; }
function semente(u){ return (u[0] << 24) | (u[1] << 16) | (u[2] << 8) | u[3]; }
function codifica(o){ var t = new TextEncoder().encode(JSON.stringify(o)), sal = bytes(4), k = fluxo(semente(sal), t.length), u = new Uint8Array(4 + t.length); u.set(sal); for (var i = 0; i < t.length; i++) u[4 + i] = t[i] ^ k[i]; return PRE + b64(u); }
function decodifica(h){ try { if (h.indexOf(PRE) !== 0) return null; var u = de64(h.slice(PRE.length)); if (u.length < 8) return null; var k = fluxo(semente(u), u.length - 4), t = new Uint8Array(u.length - 4); for (var i = 0; i < t.length; i++) t[i] = u[4 + i] ^ k[i]; var o = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(t)); return o && typeof o.d === 'string' && typeof o.p === 'string' && o.d && o.p ? o : null; } catch (e) { return null; } }
function limpa(s, n){ return String(s || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n || 40); }
function chave(s){ return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
function nomes(){ return $('asNomes').value.split(/[\n,;]+/).map(function(s){ return limpa(s); }).filter(Boolean); }
function dataBR(s){ return /^\d{4}-\d{2}-\d{2}$/.test(s || '') ? s.split('-').reverse().join('/') : ''; }
function valor(){ return limpa($('asValor').value, 10).replace(/[^\d.,]/g, ''); }
function hex(u){ var s = ''; for (var i = 0; i < u.length; i++) s += ('0' + u[i].toString(16)).slice(-2); return s.toUpperCase(); }
function base(){ return location.origin + location.pathname; }
function texto(p, d){ return 'Oi, ' + p.n + '! 🎁 Este é o seu link do ' + (d.e || 'amigo secreto') + ' (sorteio ' + d.c + '). Só você deve abrir:\n' + p.l; }
function sorteia(ls){ var a = ls.slice(), m = {}; for (var i = a.length - 1; i > 0; i--){ var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } a.forEach(function(n, i){ m[n] = a[(i + 1) % a.length]; }); return m; }
function conta(){ var n = nomes().length; $('asConta').textContent = n ? (n === 1 ? '1 pessoa até agora.' : n + ' pessoas até agora.') : ''; }
function erro(t){ var e = $('asErro'); e.textContent = t || ''; e.hidden = !t; $('asNomes').setAttribute('aria-invalid', t ? 'true' : 'false'); if (t) $('asNomes').focus(); }
function copia(txt, pronto){
  function velho(){ var ok = false; try { var t = document.createElement('textarea'); t.value = txt; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); ok = document.execCommand('copy'); t.remove(); } catch (e) {} pronto(ok); }
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(function(){ pronto(true); }, velho); else velho();
}
function marca(d, i, li){ d.ps[i].env = true; guarda(d); li.classList.add('enviado'); li.querySelector('.as-ok').textContent = 'Enviado'; }
function mostraResultado(d, focar){
  $('asCod').textContent = d.c;
  var quando = new Date(d.t); $('asSalvo').textContent = 'Sorteio de ' + quando.toLocaleDateString('pt-BR') + ', às ' + quando.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}) + ', salvo só neste aparelho.';
  var ul = $('asLista'); ul.textContent = '';
  d.ps.forEach(function(p, i){
    var li = document.createElement('li'); li.className = 'as-p' + (p.env ? ' enviado' : '');
    var topo = document.createElement('div'); topo.className = 'as-topo';
    var nm = document.createElement('span'); nm.className = 'as-nome'; nm.textContent = p.n;
    var ok = document.createElement('span'); ok.className = 'as-ok'; ok.textContent = p.env ? 'Enviado' : '';
    topo.appendChild(nm); topo.appendChild(ok);
    var ac = document.createElement('div'); ac.className = 'as-acoes';
    var a = document.createElement('a'); a.className = 'bt'; a.href = 'https://wa.me/?text=' + encodeURIComponent(texto(p, d)); a.target = '_blank'; a.rel = 'noopener';
    a.appendChild(document.createTextNode('Mandar no WhatsApp')); var s1 = document.createElement('span'); s1.className = 'sr-only'; s1.textContent = ' o link de ' + p.n; a.appendChild(s1);
    a.addEventListener('click', function(){ marca(d, i, li); ev('amigo_secreto_link', {canal: 'whatsapp'}); });
    var b = document.createElement('button'); b.type = 'button'; b.className = 'bt2';
    b.appendChild(document.createTextNode('Copiar link')); var s2 = document.createElement('span'); s2.className = 'sr-only'; s2.textContent = ' de ' + p.n; b.appendChild(s2);
    b.addEventListener('click', function(){ copia(p.l, function(okc){ $('asMsg').textContent = okc ? 'Link de ' + p.n + ' copiado. Cole na conversa com ' + p.n + '.' : 'Não deu para copiar sozinho. Use o botão Mandar no WhatsApp.'; if (okc){ marca(d, i, li); ev('amigo_secreto_link', {canal: 'copiar'}); } }); });
    ac.appendChild(a); ac.appendChild(b); li.appendChild(topo); li.appendChild(ac); ul.appendChild(li);
  });
  $('asResultado').hidden = false;
  if (focar) $('asResT').focus();
}
function sortear(){
  var ls = nomes();
  if (ls.length < MIN) return erro('Coloque pelo menos ' + MIN + ' nomes, um por linha.');
  if (ls.length > MAX) return erro('O sorteio aceita até ' + MAX + ' pessoas.');
  var vistos = {}, rep = [];
  ls.forEach(function(n){ var k = chave(n); if (vistos[k] && rep.indexOf(n) < 0) rep.push(n); vistos[k] = 1; });
  if (rep.length) return erro('Tem nome repetido: ' + rep.join(', ') + '. Diferencie, por exemplo, "Ana Paula" e "Ana Lúcia".');
  erro('');
  var antigo = lido();
  if (antigo && antigo.ps.some(function(p){ return p.env; }) && !confirm('Fazer um sorteio novo? Os links que você já mandou continuam mostrando o resultado antigo. Mande os novos para todo mundo.')) return;
  var d = {v: 1, t: Date.now(), c: hex(bytes(2)), e: limpa($('asEvento').value), val: valor(), dt: dataBR($('asData').value) ? $('asData').value : '', r: limpa($('asRecado').value, 120), nomes: $('asNomes').value.slice(0, 4000)};
  var m = sorteia(ls);
  d.ps = ls.map(function(n){ return {n: n, env: false, l: base() + '#' + codifica({d: n, p: m[n], c: d.c, e: d.e, v: d.val, dt: d.dt, r: d.r})}; });
  guarda(d); mostraResultado(d, true); ev('amigo_secreto_sorteio', {pessoas: ls.length});
}
function modoRevelar(h){
  var o = decodifica(h);
  document.querySelectorAll('.so-org').forEach(function(e){ e.hidden = true; });
  $('asTool').hidden = true; $('asResultado').hidden = true; $('revelar').hidden = false; $('rvNovo').href = location.pathname;
  if (!o){ $('rvOk').hidden = true; $('rvErro').hidden = false; return; }
  $('rvOk').hidden = false; $('rvErro').hidden = true; $('rvCaixa').hidden = true; $('rvMostrar').hidden = false;
  $('rvDe').textContent = o.d; $('rvEvento').textContent = (o.e || 'Amigo secreto') + (o.c ? ' · sorteio ' + o.c : '');
  var info = $('rvInfo'); info.textContent = '';
  [[o.v, 'Valor do presente: até R$ ' + o.v], [dataBR(o.dt), 'Troca: ' + dataBR(o.dt)], [o.r, 'Recado: ' + o.r]].forEach(function(x){ if (x[0]){ var li = document.createElement('li'); li.textContent = x[1]; info.appendChild(li); } });
  $('rvMostrar').onclick = function(){ $('rvPara').textContent = o.p; $('rvCaixa').hidden = false; $('rvMostrar').hidden = true; $('rvCaixa').focus(); ev('amigo_secreto_revelou'); };
  $('rvEsconder').onclick = function(){ $('rvPara').textContent = ''; $('rvCaixa').hidden = true; $('rvMostrar').hidden = false; $('rvMostrar').focus(); };
}
function modoOrganizar(){
  document.querySelectorAll('.so-org').forEach(function(e){ e.hidden = false; });
  $('revelar').hidden = true; $('asTool').hidden = false;
  var d = lido();
  if (d){ $('asNomes').value = d.nomes || d.ps.map(function(p){ return p.n; }).join('\n'); $('asEvento').value = d.e || ''; $('asValor').value = d.val || ''; $('asData').value = d.dt || ''; $('asRecado').value = d.r || ''; mostraResultado(d, false); }
  else $('asResultado').hidden = true;
  conta();
}
function inicia(){ var h = location.hash.slice(1); if (h.indexOf(PRE) === 0) modoRevelar(h); else modoOrganizar(); }
$('asForm').addEventListener('submit', function(e){ e.preventDefault(); sortear(); });
$('asNomes').addEventListener('input', conta);
$('asRefaz').addEventListener('click', function(){ if (confirm('Refazer o sorteio? Os links que você já mandou continuam mostrando o resultado antigo. Mande os novos para todo mundo.')){ apaga(); sortear(); } });
$('asApaga').addEventListener('click', function(){ if (!confirm('Apagar o sorteio deste aparelho? Os links que você já mandou continuam funcionando.')) return; apaga(); ['asNomes', 'asEvento', 'asValor', 'asData', 'asRecado'].forEach(function(id){ $(id).value = ''; }); $('asResultado').hidden = true; $('asMsg').textContent = ''; conta(); $('asNomes').focus(); });
window.addEventListener('hashchange', inicia);
inicia();
})();
</script>
"""

AMIGO_SECRETO = ('amigo-secreto.html', AMIGO_TITULO, AMIGO_DESC, AMIGO_CORPO)

CSS_FERRAMENTAS = """
[hidden]{display:none!important}
.resposta{background:var(--acai);border:1px solid var(--linha);border-left:6px solid var(--manga);border-radius:16px;padding:10px 18px;margin:18px 0}
.resposta p{margin:8px 0}
table{width:100%;border-collapse:collapse;font-size:15px;line-height:1.45;margin:12px 0 8px}
caption{caption-side:top;text-align:left;color:var(--neblina);font-size:14px;padding:0 0 6px}
th,td{text-align:left;vertical-align:top;padding:9px 10px;border-bottom:1px solid var(--linha);overflow-wrap:anywhere}
thead th{background:var(--acai);color:var(--manga);font-weight:700}
tbody th{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:16px;color:var(--areia);white-space:normal}
td i{color:var(--neblina)}
.chamada{background:var(--manga);border-radius:20px;padding:6px 20px 14px;margin:32px 0}
.chamada h2{color:var(--noite);margin-top:14px}.chamada p{color:var(--noite)}.chamada a{color:var(--noite)}
.chamada .cta{background:var(--noite);color:var(--manga);display:inline-block}
.atalhos ul{list-style:none;padding:0;margin:8px 0 4px;display:flex;flex-wrap:wrap;gap:8px}.atalhos li{margin:0}
.atalhos a{display:inline-flex;align-items:center;min-height:44px;padding:8px 16px;border-radius:999px;background:var(--acai);border:1px solid var(--linha);color:var(--areia);text-decoration:none;font-weight:700;font-size:15px}
ol.lista-nomes{columns:2 240px;column-gap:32px}.lista-nomes li{break-inside:avoid}
.ferramenta{background:var(--acai);border:1px solid var(--linha);border-radius:20px;padding:4px 18px 16px;margin:22px 0}
.ferramenta h2{margin-top:16px}.ferramenta [tabindex="-1"]:focus{outline:none}
.campos{display:flex;flex-direction:column;gap:6px;margin:8px 0}
.campos label{font-weight:700;font-size:15px;margin-top:8px}
.campos input,.campos select,.campos textarea{font:inherit;font-size:16px;color:var(--areia);background:var(--noite);border:1.5px solid var(--neblina);border-radius:12px;padding:11px 14px;width:100%;min-height:48px}
.campos textarea{line-height:1.5;resize:vertical}
.campos ::placeholder{color:var(--neblina);opacity:1}
.campos p{margin:2px 0}.campos .bt{margin-top:14px;align-self:flex-start}
.duas{display:grid;gap:0 12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))}.duas>div{display:flex;flex-direction:column;gap:6px}
.chips{display:flex;flex-wrap:wrap;gap:8px;border:0;padding:0;margin:8px 0 0;min-width:0}
.chips legend{font-weight:700;font-size:15px;padding:0;margin-bottom:6px}
.chip{position:relative;margin:0!important}.chip input{position:absolute;opacity:0;width:1px;height:1px;margin:0}
.chip span{display:inline-flex;align-items:center;min-height:44px;padding:8px 16px;border-radius:999px;border:2px solid var(--linha);background:var(--noite);color:var(--areia);font-weight:700;cursor:pointer}
.chip input:checked+span{background:var(--manga);border-color:var(--manga);color:var(--noite)}
.chip input:focus-visible+span{outline:3px solid var(--areia);outline-offset:2px}
.bt,.bt2{display:inline-flex;align-items:center;justify-content:center;min-height:48px;border-radius:999px;padding:11px 20px;font:inherit;font-weight:700;font-size:16px;line-height:1.2;text-decoration:none;cursor:pointer;text-align:center}
.bt{background:var(--manga);color:var(--noite);border:2px solid var(--manga)}
.bt2{background:var(--noite);color:var(--areia);border:2px solid var(--neblina)}
a:focus-visible,button:focus-visible,select:focus-visible,input:focus-visible,textarea:focus-visible,summary:focus-visible{outline:3px solid var(--areia);outline-offset:2px}
.nomes-gerados{list-style:none;padding:0;margin:10px 0 14px;display:grid;gap:8px}
.nomes-gerados li{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--noite);border-radius:14px;padding:8px 8px 8px 16px;margin:0}
.nomes-gerados .nome{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:19px;line-height:1.2;overflow-wrap:anywhere}
.copiar{flex:none;padding:10px 16px}
.erro{border-left:5px solid #FF4F8B;background:var(--noite);border-radius:10px;padding:8px 12px;font-weight:700}
.olho{font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--neblina);margin:16px 0 0}
.as-lista{list-style:none;padding:0;margin:12px 0;display:grid;gap:10px}
.as-p{background:var(--noite);border-radius:16px;padding:12px 14px;margin:0;display:grid;gap:10px}
.as-topo{display:flex;align-items:center;justify-content:space-between;gap:10px}
.as-nome{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:20px;line-height:1.2;overflow-wrap:anywhere}
.as-ok:not(:empty){background:var(--areia);color:var(--noite);border-radius:999px;padding:2px 12px;font-size:14px;font-weight:700}
.as-acoes{display:flex;flex-wrap:wrap;gap:8px}.as-acoes>*{flex:1 1 190px}
.as-fim{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}
.as-sorteado{background:var(--manga);border-radius:20px;padding:14px 18px 18px;margin:14px 0;text-align:center}
.as-sorteado p,.as-sorteado li,.as-sorteado .small{color:var(--noite)}
.as-sorteado:focus{outline:3px solid var(--areia);outline-offset:3px}
.as-grande{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:clamp(36px,11vw,56px);line-height:1.05;margin:4px 0 10px;overflow-wrap:anywhere}
.as-info{list-style:none;padding:0;margin:0 0 14px;font-weight:700}
.as-sorteado .bt2{background:var(--noite);border-color:var(--noite)}
.cards-ferramentas{margin-bottom:8px}
"""
