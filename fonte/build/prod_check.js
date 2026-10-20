
/* =====================================================================
   CONFIGURAÇÃO — troque só estes valores antes de publicar
   ===================================================================== */
const CONFIG = {
  SITE: 'https://retrozap.com.br',                 // seu domínio
  GA_ID: 'G-R8R1EN0KQN'                          // Google Analytics 4 > Administrador > Fluxos de dados (opcional)
};
const configurado = v => !!v && !/X{4}|^0+$/.test(v);

/* ---------- Analytics (só contagens, nunca nomes ou mensagens) ---------- */
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }
if (configurado(CONFIG.GA_ID)){ gtag('js', new Date()); gtag('config', CONFIG.GA_ID, {send_page_view: false, anonymize_ip: true}); } // a tag oficial fica no <head>
function evento(nome, params = {}){ try { if (configurado(CONFIG.GA_ID)) gtag('event', nome, params); } catch {} }

/* ---------- Uma página por tela: cada tela conta como página vista ---------- */
function ir(rota){
  if (location.pathname !== rota) history.pushState({rota}, '', rota);
  evento('page_view', {page_location: location.origin + rota, page_path: rota, page_title: document.title});
}
window.addEventListener('popstate', () => {
  if (location.pathname === '/') return inicio();
  if (!state.data) return home();
  voltarPilha();
});

/* ---------- Aviso de cookies ---------- */
function avisoCookies(){
  try { if (localStorage.getItem('rz_cookies')) return; } catch {}
  const b = document.createElement('div'); b.className = 'cookies';
  b.innerHTML = 'Usamos cookies para contar visitas e, se você aceitar, mostrar anúncios personalizados do Google. Suas mensagens nunca saem do seu celular. <a href="/privacidade">Política de privacidade</a> <button class="btn btn-main mini" type="button" data-ck="sim">Aceitar</button> <button class="btn btn-ghost mini" type="button" data-ck="nao">Só o essencial</button>';
  b.querySelectorAll('[data-ck]').forEach(bt => bt.onclick = () => {
    const sim = bt.dataset.ck === 'sim'; try { localStorage.setItem('rz_cookies', bt.dataset.ck); } catch {}
    try { gtag('consent', 'update', {ad_storage: sim ? 'granted' : 'denied', ad_user_data: sim ? 'granted' : 'denied', ad_personalization: sim ? 'granted' : 'denied', analytics_storage: sim ? 'granted' : 'denied'}); } catch {}
    b.remove(); document.body.classList.remove('has-cookies'); });
  document.body.appendChild(b); document.body.classList.add('has-cookies'); // espaço extra para o aviso não cobrir nenhum botão
}

/* ---------- utilidades ---------- */
const $ = s => document.querySelector(s);
const view = $('#view');
const fmt = n => Number(n).toLocaleString('pt-BR');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DIAS = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
const MODOS = {
  casal:{n:'Casal',e:'💘',c:'#E8336D'},
  amigos:{n:'Amigos',e:'🍻',c:'#FF4F8B'},
  familia:{n:'Família',e:'🏡',c:'#FF7A59'},
  trabalho:{n:'Trabalho',e:'💼',c:'#2EC4F1'},
  comunidade:{n:'Comunidade',e:'🏘️',c:'#A98BFF'}
};
const state = { arquivo:null, grupo:'', modo:'amigos', how:'iphone', data:null, awards:[], idx:0, sample:false };
function anchor(){} // sem anúncios
// botão Voltar: pilha das telas visitadas
const PILHA = []; let VOLTANDO = false;
function pilha(f, k){
  if (VOLTANDO){ VOLTANDO = false; } else if (!PILHA.length || PILHA[PILHA.length-1].k !== k) PILHA.push({f, k});
  const b = document.getElementById('voltar'); if (b) b.hidden = false;
}
function voltarPilha(){
  PILHA.pop(); const t = PILHA[PILHA.length-1];
  if (!t) return inicio();
  VOLTANDO = true; t.f();
}
function voltar(){ history.back(); } // o navegador volta e o popstate redesenha a tela anterior
function setSteps(n){ document.querySelectorAll('.steps i').forEach((el,i)=>el.classList.toggle('on', i<=n)); }
function setModo(m){ state.modo=m; if (m !== 'casal') state.ultimoGrupo = m; document.documentElement.style.setProperty('--modo', MODOS[m].c); document.documentElement.classList.toggle('casal', m === 'casal'); }

/* ---------- parser do export ---------- */
const STRIP = /[‎‏‪-‮⁦-⁩]/g;
const LINE = /^\[?(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::\d{2})?(?:\s?([ap])\.?\s?m\.?)?\]?\s*(?:-\s)?(.*)$/i;
async function parseChat(text, prog){
  const msgs = [], sys = [], grupo = new Set(); let cur = null, perdidas = 0;
  const linhas = text.replace(/\r/g,'').split('\n');
  let mesPrimeiro = false; // exports com data no formato americano (mês/dia)
  for (const raw of linhas.slice(0, 5000)){ const x = raw.replace(STRIP,'').match(LINE); if (!x) continue; if (+x[1] > 12) break; if (+x[2] > 12){ mesPrimeiro = true; break; } }
  const N = linhas.length, PASSO = 6000;
  for (let q = 0; q < N; q++){
    if (q % PASSO === 0 && q){ prog && prog(q/N, msgs.length); await sleep(0); }
    const raw = linhas[q];
    const l = raw.replace(STRIP,'').replace(/[  ]/g,' ');
    const m = l.match(LINE);
    if (m){
      let [, d, mo, y, h, mi, ap, rest] = m;
      y = +y; if (y < 100) y += 2000; h = +h;
      if (ap){ ap = ap.toLowerCase(); if (ap==='p' && h<12) h += 12; if (ap==='a' && h===12) h = 0; }
      if (mesPrimeiro) [d, mo] = [mo, d];
      const i = rest.indexOf(': '), t = new Date(y, +mo-1, +d, h, +mi);
      if (i < 1 || i > 60){ const ev = sysEvent(rest); if (ev) sys.push({...ev, t}); cur = null; continue; } // aviso do sistema (Android)
      // No iPhone, avisos do sistema vêm assinados por uma pessoa (ou pelo nome do grupo) e começam com um caractere invisível (U+200E).
      // Só a linha do aviso sai da contagem; a pessoa continua no grupo.
      const body = rest.slice(i+2), invisivel = /:\s\u200e/.test(raw);
      if (invisivel && kind(body) === 'text'){ const ev = sysEvent(body); if (ev) sys.push({...ev, t}); cur = null; continue; }
      cur = { t, a:rest.slice(0,i).replace(/^~\s*/,'').trim(), b:body };
      msgs.push(cur);
    } else if (/^\[?\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4}/.test(l)) perdidas++;
    else if (cur){ cur.b += '\n' + l; }
  }
  prog && prog(1, msgs.length);
  // fora da cerimônia: o nome do grupo (avisos do iPhone) e assistentes de IA
  const out = msgs.filter(m => !grupo.has(m.a) && !/^meta ?ai$/i.test(m.a));
  out.sys = sys; out.grupo = [...grupo]; out.perdidas = perdidas;
  return out;
}
const SYSRX = [
  [/^(.{1,60}?) saiu\.?$/i, 'saiu'],
  [/^(.{1,60}?) removeu (.{1,80})$/i, 'removido'],
  [/^(.{1,60}?) (?:mudou para um novo número|mudou (?:o|de) número)/i, 'numero'],
  [/^(.{1,60}?) (?:adicionou|entrou usando|criou (?:o )?grupo|mudou (?:o nome|a imagem|a descrição|o assunto|as configura))/i, 'outro'],
  [/criptografia de ponta a ponta|agora é (?:um )?admin|mensagens temporárias|apagou a imagem do grupo|fixou uma mensagem|mudou (?:o ícone|a foto) do grupo|você entrou|foi adicionad[oa]|código de segurança|configurações do grupo/i, 'outro']
];
function sysEvent(text){
  const t = text.trim(); if (t.includes('\n')) return null;
  for (const [rx, type] of SYSRX){ const m = t.match(rx); if (m) return {type, who: (type === 'removido' ? m[2] : (m[1] || '')).replace(/^~\s*/,'').replace(/\.$/,'').trim()}; }
  return null;
}
function kind(b){
  const t = b.toLowerCase();
  if (/\((?:arquivo anexado|file attached)\)|<anexado:|<attached:/.test(t)){ // exports "com mídia"
    if (/\.(?:opus|ogg|m4a|aac|mp3)\b|ptt-|-audio-/.test(t)) return 'audio';
    if (/\.webp\b|-sticker-|stk-/.test(t)) return 'sticker';
    if (/\.(?:jpe?g|png|heic|mp4|mov|gif)\b|-photo-|-video-|img-|vid-/.test(t)) return 'photo';
    return 'media';
  }
  if (/figurinha omitida|sticker omitted/.test(t)) return 'sticker';
  if (/áudio omitido|audio omitted|áudio ocultado/.test(t)) return 'audio';
  if (/imagem ocultada|imagem omitida|image omitted|vídeo omitido|video omitted|gif omitido|gif omitted/.test(t)) return 'photo';
  if (/<mídia oculta>|<media omitted>|<arquivo de mídia oculto>|<anexado:|documento omitido|document omitted|figurinha omitida|contato omitido|localização:/.test(t)) return 'media';
  if (/mensagem foi apagada|mensagem apagada|apagou esta mensagem|message was deleted/.test(t)) return 'deleted';
  return 'text';
}
const RX = {
  laugh:/k{3,}|(?:ha){2,}|(?:rs){2,}|(?:he){3,}|hue(?:hue)+/i,
  bomdia:/\bbom dia\b|\bbdia\b/i,
  parabens:/parab[ée]ns|feliz anivers/i,
  amo:/\bamo (?:vcs|voc[eê]s|vc|voc[eê]|todos|muito)\b|\bte amo\b|\bbeijos\b/i,
  palavrao:/\b(?:porra|caralho|carai|pqp|merda|foda|fdp|cacete|puta)\w*/gi,
  link:/https?:\/\//i,
  furo:/n[aã]o vou conseguir|n[aã]o vou poder|foi mal|fica pra pr[oó]xima|n[aã]o vai dar|vou furar/i,
  org:/\bbora\b|quem vai|vamos marcar|marcamos|onde vai ser/i,
  mae:/chegou bem|chegaram bem|cuidado|ju[ií]zo|avisa quando chegar|se agasalha/i,
  ok:/^(?:ok|okay|blz|beleza|fechado|show|certo|👍|👌)[.!]*$/i,
  reuniao:/\b(?:call|reuni[aã]o|alinhar|alinhamento|meet|pauta)\b/i,
  salva:/resolvido|pode deixar|t[aá] feito|j[aá] fiz|deixa comigo/i,
  aviso:/\baviso\b|comunicado|aten[cç][aã]o|informo|lembrete|lembrando que|manuten[cç][aã]o/i,
  perdido:/algu[eé]m viu|perdi\b|perdeu|achei|[eé] de algu[eé]m|encontr(ei|ado)/i,
  indica:/algu[eé]m indica|indico|recomendo|indica[cç][aã]o|telefone d[eoa]|contato d[eoa]/i,
  vende:/\bvendo\b|vende-se|desapego|doa[cç][aã]o|\bdoo\b|algu[eé]m quer|troco/i,
  barulho:/barulho|\bobra\b|furadeira|som alto|sil[eê]ncio|latindo|martelo/i,
  boasvindas:/bem[- ]vind/i,
  agradece:/obrigad|gratid[aã]o|valeu|agrade[cç]/i,
  fofoca:/n[aã]o v[aã]o acreditar|fiquei sabendo|ficaram sabendo|babado|fofoca|sabiam que|adivinha quem|contar uma coisa/i,
  teamo:/\bte amo\b|\bte adoro\b|\bamo voc[eê]\b|\bamo vc\b|\bte quero\b|\bmeu amor\b/i,
  apelido:/\b(?:amor|mor|mozão|mozao|bb|beb[eê]|vida|gato|gata|lindo|linda|princesa|nen[eé]m|chuchu|xuxu|vidinha|benzinho)\b/i,
  desculpa:/desculpa|perd[aã]o|me perdoa|foi mal|sinto muito/i,
  fome:/\b(?:fome|jantar|janta|almo[cç]o|pizza|ifood|comer|lanche|hamb[uú]rguer|sushi|a[cç]a[ií]|sobremesa|chocolate)\b/i,
  saudade:/saudade/i
};
const CORACOES = /❤️|❤|💕|💖|💗|💘|💞|💓|😍|🥰|😘|💋|🫶/gu;
const GIRIA = /(?<!\p{L})(mano|mana|véi|vei|vey|slk|mds|vish|vixe|oxe|oxente|eita|tmj|sqn|aff|affs|bagulho|parça|mó|topzera|sextou|partiu|crush|cringe|flopou|flopar|tankar|rolê|miga|migo|amg|trampo|firmeza|suave|demorou|pprt|tlgd|nóis|uai|bah|tchê|massa|arretado|visse|mermão|brabo|braba|zica|zoeira|resenha|lacrou|mitou|bora|de boa|deu ruim|tá ligado|ta ligado|sem condições|pode pá|é nóis)(?!\p{L})/giu;
const GIRIA_NORM = {vei:'véi', vey:'véi', affs:'aff', vixe:'vish', 'ta ligado':'tá ligado', oxente:'oxe'};
let DUR = {}; // duração dos áudios (s), só quando o export vem "com mídia"
const AUDIO_MEDIO = 35; // estimativa por áudio quando o export vem "sem mídia"
const DIAS_LONGO = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
// assuntos leves para descrever cada personagem
const TEMAS = [
  ['comida', /\b(comida|comer|almoco|jantar|pizza|churras\w*|hamburguer|sushi|fome|receita|restaurante|lanche)\b/],
  ['futebol', /\b(futebol|jogo|gol|time|timao|mengao|palmeiras|corinthians|flamengo|sao paulo|santos|gremio|inter|vasco|cruzeiro|campeonato|brasileirao)\b/],
  ['rolê e festa', /\b(role|festa|balada|bar|show|sextou|aniver\w*|churras\w*)\b/],
  ['cerveja e drinks', /\b(cerveja|breja|vinho|drink\w*|gin|cachaca|chopp|bebe\w*)\b/],
  ['trabalho', /\b(trabalho|trampo|reuniao|chefe|cliente|projeto|escritorio|home office|deadline|entrega)\b/],
  ['viagem', /\b(viagem|viajar|praia|ferias|voo|aeroporto|hotel|passagem|airbnb)\b/],
  ['séries e filmes', /\b(serie|filme|netflix|episodio|temporada|novela|cinema|bbb)\b/],
  ['bichos', /\b(cachorro|gato|pet|dog|gatinho|cachorrinho|veterinario)\b/],
  ['filhos e família', /\b(filho|filha|filhos|bebe|escola|mae|pai|vo|vovo|sogra)\b/],
  ['treino e saúde', /\b(treino|academia|corrida|correr|dieta|crossfit|pilates|medico|exame)\b/],
  ['dinheiro', /\b(dinheiro|pix|conta|boleto|preco|caro|barato|salario|grana)\b/],
  ['política', /\b(politica|eleicao|governo|presidente|deputado|lula|bolsonaro|stf)\b/]
];
const STOP = new Set('alguem alguém algum alguma nada coisa coisas quero queria acho achei fazer falar falou mesmo sempre nunca porque pouco assim outra outro outros pessoal galera tava tinha ficar dizer disse sabe olha verdade beleza obrigado obrigada valeu vamo vamos aqui lá depois antes agora ainda hoje amanhã ontem semana todos todas tudo cada dele dela vocês voces nosso nossa minha meu seus suas você voce também tambem então entao sobre entre desde mais menos muito muita bem bom boa dia noite para pela pelo como mais mas que isso esse essa este esta aqui ali tem ter tava estou está esta vou vai vamos com uma umas uns por sim não nao tudo todo toda quando onde quem porque pq muito muita bem também tambem então entao ainda depois agora hoje gente cara mano fazer foi ser sou era você voce vocês voces meu minha seu sua dele dela nos nós eles elas acho sabe aí ai pra pro tá ta já ja kkk mensagem omitida oculta figurinha áudio imagem'.split(' '));

async function analyze(msgs, prog){
  const P = {}, hours = Array(24).fill(0), days = Array(7).fill(0), words = {}, full = {}, emo = {}, porDia = {};
  let palavras = 0, risadas = 0, silencio = 0, silIni = null, audioN = 0, audioSeg = 0, audioMedidos = 0;
  const giria = {}, minSem = new Int32Array(7*1440);
  const get = a => P[a] || (P[a] = {name:a,count:0,text:0,chars:0,sticker:0,audio:0,photo:0,media:0,deleted:0,laugh:0,bomdia:0,parabens:0,amo:0,palavrao:0,link:0,furo:0,org:0,mae:0,ok:0,reuniao:0,salva:0,aviso:0,perdido:0,indica:0,vende:0,barulho:0,boasvindas:0,agradece:0,fofoca:0,audioMax:0,night:0,after:0,first:0,revive:0,kill:0,teamo:0,apelido:0,desculpa:0,fome:0,saudade:0,coracao:0,respT:0,respN:0,h:Array(24).fill(0),emo:{},words:{},y:{},wd:Array(7).fill(0),rep:{},ini:null,fim:null,giria:{},tema:{}});
  let prev = null, lastDay = '';
  for (let q = 0; q < msgs.length; q++){
    if (q % 5000 === 0 && q){ prog && prog(q/msgs.length); await sleep(0); }
    const m = msgs[q];
    const p = get(m.a), k = kind(m.b), h = m.t.getHours(), wd = m.t.getDay(), ano = m.t.getFullYear();
    minSem[wd*1440 + h*60 + m.t.getMinutes()]++;
    p.count++; p.h[h]++; p.wd[wd]++; p.y[ano] = (p.y[ano]||0) + 1; hours[h]++; days[wd]++;
    if (!p.ini || m.t < p.ini) p.ini = m.t; if (!p.fim || m.t > p.fim) p.fim = m.t;
    if (prev && prev.a !== m.a && m.t - prev.t < 30*60e3) p.rep[prev.a] = (p.rep[prev.a]||0) + 1;
    if (prev && prev.a !== m.a && m.t - prev.t < 12*3600e3){ p.respT += m.t - prev.t; p.respN++; } // tempo para responder
    if (k !== 'text'){ p[k]++; if (k==='media') p.photo++;
      if (k === 'audio'){ audioN++; const f = m.b.match(/[\w-]+\.(?:opus|ogg|m4a|aac|mp3)/i), seg = f && DUR[f[0]];
        if (seg){ audioSeg += seg; audioMedidos++; if (seg > p.audioMax) p.audioMax = seg; } }
    }
    else {
      const b = m.b.trim(); p.text++; p.chars += b.length; palavras += b.split(/\s+/).length;
      const semLink = b.toLowerCase().replace(/(?:https?:\/\/|www\.)\S+|\S+\.(?:com|br|net|org|ly|me|app|gl)\b\S*/g, ' '); // links não viram "jeito de falar"
      if (RX.laugh.test(b)) p.laugh++;
      for (const key of ['bomdia','parabens','amo','link','furo','org','mae','reuniao','salva','aviso','perdido','indica','vende','barulho','boasvindas','agradece','fofoca','teamo','apelido','desculpa','fome','saudade']) if (RX[key].test(b)) p[key]++;
      p.coracao += (b.match(CORACOES) || []).length;
      if (RX.ok.test(b)) p.ok++;
      const pw = b.match(RX.palavrao); if (pw) p.palavrao += pw.length;
      for (const g of semLink.match(GIRIA) || []){ const n = GIRIA_NORM[g] || g; giria[n] = (giria[n]||0) + 1; p.giria[n] = (p.giria[n]||0) + 1; }
      if (b.length > 3){ const bn = b.toLowerCase().normalize('NFD').replace(/\p{M}/gu,''); for (const [k, rx] of TEMAS) if (rx.test(bn)) p.tema[k] = (p.tema[k]||0) + 1; }
      for (const e of b.match(/\p{Extended_Pictographic}/gu) || []){ emo[e] = (emo[e]||0)+1; p.emo[e] = (p.emo[e]||0)+1; }
      if (!RX.laugh.test(b)){
        for (const w of semLink.normalize('NFC').match(/\p{L}{4,}/gu) || []) if (!STOP.has(w) && !/^(?:https?|www|http)$/.test(w)){ words[w] = (words[w]||0)+1; p.words[w] = (p.words[w]||0)+1; }
        const n = b.toLowerCase().replace(/[!?.]+$/,'');
        if (n.split(/\s+/).length >= 2 && n.length <= 40 && !RX.link.test(n)) full[n] = (full[n]||0)+1;
      }
    }
    if (h < 5) p.night++;
    if (h >= 19 || wd === 0 || wd === 6) p.after++;
    const dk = m.t.toDateString(); if (dk !== lastDay){ p.first++; lastDay = dk; }
    const dia = `${m.t.getFullYear()}-${String(m.t.getMonth()+1).padStart(2,'0')}-${String(m.t.getDate()).padStart(2,'0')}`; porDia[dia] = (porDia[dia]||0) + 1;
    if (prev && m.t - prev.t > silencio){ silencio = m.t - prev.t; silIni = prev.t; }
    if (prev && m.t - prev.t >= 3*3600e3){ p.revive++; get(prev.a).kill++; }
    prev = m;
  }
  const people = Object.values(P).sort((a,b)=>b.count-a.count);
  const top = o => Object.entries(o).sort((a,b)=>b[1]-a[1])[0];
  return { msgs, people, hours, days, total:msgs.length,
    start:new Date(msgs.reduce((a,m) => Math.min(a, +m.t), Infinity)), end:new Date(msgs.reduce((a,m) => Math.max(a, +m.t), -Infinity)),
    emoji:top(emo), word:top(words), lema:top(full),
    temas: Object.entries(words).sort((a,b) => b[1]-a[1]).slice(0, 3).map(e => e[0]),
    palavras, recorde: top(porDia), silencio, silIni, giria: top(giria), pico: picoSemana(days, minSem),
    audioN, audioMedidos, audioSeg: audioMedidos ? audioSeg + (audioN - audioMedidos)*(audioSeg/audioMedidos) : audioN*AUDIO_MEDIO };
}
function picoSemana(days, minSem){
  const wd = days.indexOf(Math.max(...days)); let melhorH = 0, mh = -1;
  for (let h = 0; h < 24; h++){ let s = 0; for (let i = 0; i < 60; i++) s += minSem[wd*1440 + h*60 + i]; if (s > mh){ mh = s; melhorH = h; } }
  let mm = 0; for (let i = 1; i < 60; i++) if (minSem[wd*1440 + melhorH*60 + i] > minSem[wd*1440 + melhorH*60 + mm]) mm = i;
  return {wd, h: melhorH, m: mm, txt: `${DIAS_LONGO[wd]}, às ${String(melhorH).padStart(2,'0')}:${String(mm).padStart(2,'0')}`};
}

/* ---------- prêmios ---------- */
// títulos com (a) são aplicados logo abaixo da lista: for (const a of AW) a.n = gtit(a.n)
const AW = [
 {m:['amigos','familia','trabalho','comunidade'],e:'🗣️',n:'O Tagarela',crit:'Mais mensagens enviadas',k:'count',u:'mensagens',mech:'podio',p:'{w} mandou {v} mensagens. Respira, {w}.'},
 {m:['amigos'],e:'🖼️',n:'Figurinha de Ouro',crit:'Mais figurinhas enviadas',k:'sticker',u:'figurinhas',mech:'chute',p:'{v} figurinhas. {w} se comunica por hieróglifos modernos.'},
 {m:['amigos'],e:'😂',n:'Rei do Kkkk',crit:'Quem mais ri: % das mensagens com kkk, haha ou rs',k:'laugh',pct:true,u:'das mensagens com risada',det:p => `${fmt(p.laugh)} risadas`,mech:'palpite',p:'{v} das mensagens de {w} têm risada. Plateia profissional.'},
 {m:['amigos'],e:'🤬',n:'Boca-Suja',crit:'Palavrões a cada 1.000 mensagens',k:'palavrao',rate:true,u:'por 1.000 msgs',mech:'raspadinha',p:'{v} palavrões a cada mil mensagens. A mãe de {w} está decepcionada.'},
 {m:['amigos','familia'],e:'🦉',n:'Coruja da Madrugada',crit:'Mais mensagens entre 0h e 5h',k:'night',u:'mensagens de madrugada',mech:'palpite',p:'{v} mensagens entre 0h e 5h. {w}, vai dormir.'},
 {m:['amigos'],e:'🙅',n:'Rei do Furo',crit:'"Não vou conseguir", "foi mal", "fica pra próxima"',k:'furo',u:'desculpas',mech:'palpite',p:'{v} furos registrados em cartório. Nunca foi o trânsito, {w}.'},
 {m:['amigos'],e:'🍻',n:'Organizador do Rolê',crit:'"Bora", "quem vai", "vamos marcar"',k:'org',u:'convocações',mech:'podio',p:'{w} convocou o grupo {v} vezes. Sem essa pessoa, ninguém saía de casa.'},
 {m:['amigos','familia'],e:'🔥',n:'Puxa-Assunto',crit:'Reabriu o grupo depois de 3h+ de silêncio',k:'revive',u:'ressurreições',mech:'palpite',p:'{w} ressuscitou o grupo {v} vezes. Desfibrilador humano.'},
 {m:['amigos'],e:'🪦',n:'Mata-Conversa',crit:'Mensagem seguida de 3h+ de silêncio',k:'kill',u:'conversas encerradas',mech:'raspadinha',p:'{v} conversas morreram depois de uma mensagem de {w}. Sem ressentimentos. Ou com.'},
 {m:['amigos'],e:'👻',n:'O Fantasma',crit:'Menos mensagens no grupo',k:'count',low:true,u:'mensagens',mech:'raspadinha',p:'Só {v} mensagens. {w} lê tudo e não fala nada. Respeitamos o mistério.'},
 {m:['amigos'],e:'💌',n:'Coração Mole',crit:'Mais "amo vcs" e declarações',k:'amo',u:'declarações',mech:'palpite',p:'{v} declarações de amor. Por trás da zoeira, {w} é puro sentimento.'},
 {m:['amigos'],e:'🗑️',n:'O Arrependido',crit:'Mais mensagens apagadas',k:'deleted',u:'mensagens apagadas',mech:'raspadinha',p:'{w} apagou {v} mensagens. O que será que tinha ali?'},
 {m:['amigos','familia'],e:'🎙️',n:'Podcaster do Grupo',crit:'Mais áudios enviados (e a fatia de cada um)',k:'audio',u:'áudios',fatia:true,mech:'podio',p:'{v} áudios, {s} de todos os áudios do grupo. {w} tem episódio novo toda semana.'},
 {m:['amigos','trabalho'],e:'📜',n:'Escritor de Textão',crit:'Maior média de caracteres por mensagem',k:'avg',u:'caracteres por mensagem',mech:'palpite',p:'Média de {v} caracteres por mensagem. {w} escreve como quem manda e-mail.'},
 {m:['familia'],e:'☀️',n:'Tio do Bom Dia',crit:'Mais "bom dia" enviados',k:'bomdia',u:'bons dias',mech:'chute',p:'{v} bons dias. O sol só nasce depois da mensagem de {w}.'},
 {m:['familia'],e:'🙏',n:'Mãe Coruja',crit:'"Chegou bem?", "cuidado", "juízo"',k:'mae',u:'preocupações',mech:'raspadinha',p:'{v} vezes cuidando de todo mundo. {w} é o GPS da família.'},
 {m:['familia'],e:'🎂',n:'Rei do Parabéns',crit:'Mais "parabéns" e "feliz aniversário"',k:'parabens',u:'parabéns',mech:'podio',p:'{w} nunca esquece um aniversário. {v} parabéns enviados.'},
 {m:['comunidade'],e:'📋',n:'Síndico de Plantão',crit:'Mais avisos, comunicados e lembretes',k:'aviso',u:'avisos',mech:'podio',p:'{v} avisos. {w} é o mural de recados oficial.'},
 {m:['comunidade'],e:'🔎',n:'Achados e Perdidos',crit:'"Alguém viu?", "perdi", "achei"',k:'perdido',u:'buscas',mech:'palpite',p:'{w} procurou ou achou alguma coisa {v} vezes. Detetive da comunidade.'},
 {m:['comunidade'],e:'🤝',n:'Rei da Indicação',crit:'"Alguém indica?", "recomendo", "contato de"',k:'indica',u:'indicações',mech:'podio',p:'{v} indicações. {w} tem o contato de todo mundo.'},
 {m:['comunidade'],e:'🏷️',n:'Classificados do Grupo',crit:'"Vendo", "desapego", "doação"',k:'vende',u:'anúncios',mech:'raspadinha',p:'{v} anúncios. {w} transformou o grupo numa feirinha.'},
 {m:['comunidade'],e:'🔊',n:'Fiscal do Barulho',crit:'"Barulho", "obra", "som alto"',k:'barulho',u:'reclamações de barulho',mech:'palpite',p:'{w} reclamou de barulho {v} vezes. O silêncio agradece.'},
 {m:['comunidade'],e:'👋',n:'Comitê de Boas-Vindas',crit:'Mais "bem-vindo" aos novos membros',k:'boasvindas',u:'boas-vindas',mech:'chute',p:'{v} boas-vindas. Ninguém entra no grupo sem um abraço de {w}.'},
 {m:['comunidade'],e:'🙏',n:'Mais Agradecido',crit:'"Obrigado", "valeu", "gratidão"',k:'agradece',u:'agradecimentos',mech:'raspadinha',p:'{v} agradecimentos. {w} é a educação em pessoa.'},
 {m:['comunidade'],e:'📰',n:'Repórter da Comunidade',crit:'Mais links e notícias compartilhados',k:'link',u:'links',mech:'palpite',p:'{v} links. {w} é a rádio local da comunidade.'},
 {m:['familia'],e:'📰',n:'Repórter da Família',crit:'Mais links compartilhados',k:'link',u:'links',mech:'palpite',p:'{v} links. {w} é a agência de notícias da família.'},
 {m:['familia'],e:'📸',n:'Fotógrafo Oficial',crit:'Mais fotos e vídeos',k:'photo',u:'fotos e vídeos',mech:'podio',p:'{v} fotos e vídeos. {w} documenta tudo.'},
 {m:['familia','comunidade'],e:'👀',n:'Visualiza e Não Responde',crit:'Menos mensagens no grupo',k:'count',low:true,u:'mensagens',mech:'palpite',p:'Só {v} mensagens. {w} está sempre online, mas nunca aqui.'},
 {m:['familia'],e:'💞',n:'Quem Mais Ama',crit:'"Te amo", "amo vcs", "beijos"',k:'amo',u:'declarações',mech:'podio',p:'{v} declarações. {w} é o abraço do grupo.'},
 {m:['trabalho'],e:'👍',n:'Rei do "Ok"',crit:'Respostas curtas: "ok", "blz", 👍',k:'ok',u:'respostas curtas',mech:'palpite',p:'{v} vezes "ok". {w} é eficiência pura.'},
 {m:['trabalho','familia','comunidade'],e:'☕',n:'Madrugador',crit:'Primeira mensagem do dia mais vezes',k:'first',u:'dias abrindo o grupo',mech:'podio',p:'{w} abriu o grupo em {v} dias. Antes do café, já tinha mandado mensagem.'},
 {m:['trabalho'],e:'🌙',n:'Fora do Expediente',crit:'Mensagens depois das 19h e nos fins de semana',k:'after',u:'mensagens fora do horário',mech:'chute',p:'{v} mensagens fora do expediente. {w}, desliga o celular.'},
 {m:['trabalho'],e:'📅',n:'Mestre das Reuniões',crit:'"Call", "reunião", "alinhar"',k:'reuniao',u:'convocações',mech:'chute',p:'{w} falou de reunião {v} vezes. Isso podia ter sido um e-mail.'},
 {m:['trabalho'],e:'🛟',n:'Salva-Vidas',crit:'"Resolvido", "pode deixar", "tá feito"',k:'salva',u:'resgates',mech:'podio',p:'{v} problemas resolvidos. {w} carrega o time nas costas.'},
 {m:['trabalho'],e:'🎙️',n:'Locutor Corporativo',crit:'Mais áudios no grupo do trabalho',k:'audio',u:'áudios',mech:'raspadinha',p:'{v} áudios no grupo do trabalho. Corajoso, {w}.'},
 {m:['casal'],e:'🗣️',n:'Tagarela do Casal',crit:'Mais mensagens enviadas',k:'count',u:'mensagens',mech:'palpite',p:'{w} mandou {v} mensagens. Quem ama fala. Muito.'},
 {m:['casal'],e:'💘',n:'Mais Romântico',crit:'"Te amo", "te adoro", "meu amor"',k:'teamo',u:'declarações',mech:'raspadinha',p:'{v} declarações de amor. {w} é poesia ambulante.'},
 {m:['casal'],e:'🥰',n:'Coração Ambulante',crit:'Mais emojis de coração ❤️😍🥰',k:'coracao',u:'corações',mech:'chute',p:'{v} corações enviados. O teclado de {w} só tem emoji apaixonado.'},
 {m:['casal'],e:'☀️',n:'Despertador do Amor',crit:'Quem manda a primeira mensagem do dia',k:'first',u:'dias puxando o papo',mech:'palpite',p:'{w} abriu a conversa em {v} dias. Bom dia com amor é com {w}.'},
 {m:['casal'],e:'⚡',n:'Resposta Relâmpago',crit:'Quem responde mais rápido',k:'resp',low:true,u:'min em média para responder',mech:'raspadinha',p:'{w} responde em {v} min, em média. Celular na mão 24 horas.'},
 {m:['casal'],e:'🐢',n:'Visualiza e Demora',crit:'Quem demora mais para responder',k:'resp',u:'min em média para responder',mech:'palpite',p:'Média de {v} min para responder. {w}, a gente vê o "online".'},
 {m:['casal'],e:'😂',n:'Risada Fácil',crit:'Mais mensagens com risada',k:'laugh',u:'risadas',mech:'chute',p:'{v} risadas. {w} ri até de piada ruim (principalmente das suas).'},
 {m:['casal'],e:'🍕',n:'Fominha',crit:'Mais papo de comida',k:'fome',u:'mensagens sobre comida',mech:'raspadinha',p:'{v} mensagens sobre comida. Com {w}, todo programa termina em comida.'},
 {m:['casal'],e:'🙏',n:'Pede Desculpas',crit:'"Desculpa", "perdão", "foi mal"',k:'desculpa',u:'pedidos de desculpa',mech:'palpite',p:'{w} pediu desculpas {v} vezes. Quem ama, se desculpa (às vezes).'},
 {m:['casal'],e:'🎙️',n:'Podcaster do Casal',crit:'Mais áudios enviados',k:'audio',u:'áudios',mech:'chute',p:'{v} áudios. {w} acha que mensagem de texto é coisa do passado.'},
 {m:['casal'],e:'🦉',n:'Coruja do Casal',crit:'Mais mensagens entre 0h e 5h',k:'night',u:'mensagens de madrugada',mech:'palpite',p:'{v} mensagens de madrugada. {w}, vai dormir (e deixa o outro dormir).'},
 {m:['casal'],e:'💬',n:'Apelido Fofo',crit:'"Amor", "bb", "vida", "neném"...',k:'apelido',u:'apelidos carinhosos',mech:'raspadinha',p:'{v} apelidos carinhosos. {w} esqueceu o nome verdadeiro do outro.'},
 {m:['casal'],e:'🥺',n:'Saudade Mode',crit:'Mais "saudade"',k:'saudade',u:'saudades',mech:'palpite',p:'{v} vezes "saudade". {w} sente falta até indo ao mercado.'},
 {m:['casal'],e:'🖼️',n:'Rei da Figurinha',crit:'Mais figurinhas enviadas',k:'sticker',u:'figurinhas',mech:'chute',p:'{v} figurinhas. A conversa de vocês é um álbum da Copa.'},
 {m:['casal'],e:'📸',n:'Fotógrafo do Casal',crit:'Mais fotos e vídeos',k:'photo',u:'fotos e vídeos',mech:'palpite',p:'{v} fotos e vídeos. {w} registra cada momento.'}
];
for (const a of AW) a.n = gtit(a.n);
function val(a, p){
  if (a.pct) return p.text >= 50 ? Math.round(p[a.k]/p.text*100) : null;
  if (a.rate) return p.text >= 30 ? Math.round(p[a.k]/p.text*10000)/10 : null;
  if (a.k === 'avg') return p.text >= 20 ? Math.round(p.chars/p.text) : null;
  if (a.k === 'resp') return p.respN >= 10 ? Math.max(1, Math.round(p.respT/p.respN/60000)) : null;
  return p[a.k];
}
function buildAwards(d){
  const list = [];
  for (const a of AW.filter(a => a.m.includes(state.modo))){
    if (a.low && d.people.length < 3 && state.modo !== 'casal') continue;
    const ranked = d.people.map(p => ({name:p.name, v:val(a,p), p})).filter(r => r.v !== null)
      .sort((x,y) => a.low ? x.v - y.v : y.v - x.v);
    if (!ranked.length || (!a.low && ranked[0].v <= 0)) continue;
    const total = d.people.reduce((s,p) => s + (a.rate || a.pct || a.k==='avg' ? 0 : p[a.k]), 0);
    list.push({...a, ranked, winner:ranked[0], total});
  }
  // cerimônia = só as categorias escolhidas para o modo, na ordem da lista (sem categorias extras)
  const escolhidas = PRINCIPAIS[state.modo].map(gtit);
  const shown = list.filter(a => escolhidas.includes(a.n)).sort((x, y) => escolhidas.indexOf(x.n) - escolhidas.indexOf(y.n));
  state.bonus = []; state.bonusShown = true; state.noBonus = false;
  return comHonra(shown, d);
}
function comHonra(lista, d){
  const shown = lista.filter(a => !a.honra);
  const won = new Set(shown.map(a => a.winner.name));
  const rest = d.people.filter(p => !won.has(p.name));
  return shown;
}
const PRINCIPAIS = {
  casal:['Tagarela do Casal','Mais Romântico','Coração Ambulante','Despertador do Amor','Resposta Relâmpago','Risada Fácil','Fominha','Pede Desculpas','Podcaster do Casal'],
  amigos:['O Tagarela','Podcaster do Grupo','Boca-Suja','Rei do Kkkk','Puxa-Assunto','O Fantasma','Coração Mole','O Arrependido'],
  familia:['O Tagarela','Tio do Bom Dia','Mãe Coruja','Rei do Parabéns','Repórter da Família','Fotógrafo Oficial','Visualiza e Não Responde','Quem Mais Ama','Puxa-Assunto','Podcaster do Grupo'],
  trabalho:['O Tagarela','Rei do "Ok"','Fora do Expediente','Mestre das Reuniões','Salva-Vidas','Locutor Corporativo','Madrugador'],
  comunidade:['O Tagarela','Rei da Indicação','Classificados do Grupo','Fiscal do Barulho','Comitê de Boas-Vindas','Mais Agradecido','Repórter da Comunidade','Visualiza e Não Responde','Síndico de Plantão','Achados e Perdidos']
};

/* ---------- telas ---------- */
/* ---------- tutorial animado: celular desenhado mostrando como exportar a conversa ---------- */
const TT_BOLHAS = `<div class="tt-chat">
  <div class="tt-b">Bora churras sábado? 🍖</div>
  <div class="tt-b me">Bora! Eu levo o carvão</div>
  <div class="tt-b">Quem leva a picanha? 👀</div>
  <div class="tt-b me">kkkkkk de novo isso</div>
</div>`;
const TT_SITE = (ok, fim) => `<div class="tt-url">🔒 retrozap.com.br</div>
  <div class="tt-site">
    <div class="tt-logo">retrozap 🏆</div>
    ${fim ? `<div class="tt-fim"><div style="font-size:44px">🏆</div><b>Prontos para a premiação!</b></div>`
    : `<div class="tt-drop${ok ? ' ok' : ' alvo'}">${ok ? '✅<span>Conversa do WhatsApp.zip</span>' : '📲<span>Toque para escolher o arquivo</span>'}</div>
       <div class="tt-cta${ok ? ' alvo' : ' off'}">🏆 Fazer a retrospectiva</div>`}
  </div>`;
// modo casal: troca os textos de grupo por textos de conversa a dois
const casalTxt = t => state.modo !== 'casal' ? t : String(t).replace(/Turma do Churras/g, 'Amor 💕').replace(/🍖/g, '💕').replace(/toque para dados do grupo/g, 'toque para dados do contato')
  .replace(/Toque no nome do grupo/g, 'Toque no nome da pessoa').replace(/Grupo · 6 membros/g, 'Contato').replace(/Bora churras sábado\?/g, 'Jantar hoje?').replace(/Bora! Eu levo o carvão/g, 'Bora! Eu escolho o lugar').replace(/Quem leva a picanha\?/g, 'Pizza ou japa?').replace(/kkkkkk de novo isso/g, 'Pizza, óbvio 😂').replace(/No grupo desde/g, 'Na conversa desde').replace(/a média do grupo/g, 'a média do casal')
  .replace(/\bdo grupo\b/g, 'da conversa').replace(/\bo grupo\b/g, 'a conversa').replace(/\bno grupo\b/g, 'na conversa');
const TAGLINE = () => state.modo === 'casal' ? 'Toda história de amor merece um troféu · retrozap.com.br' : 'Todo grupo tem uma história · retrozap.com.br';
const nomePadrao = () => state.modo === 'casal' ? 'Nós dois' : 'Nosso grupo';
const TT_CENAS = {
  android: [
    {p:0, cap:'Toque nos três pontinhos ⋮', x:90, y:6.5, h:`<div class="tt-bar a"><span>←</span><i class="tt-av">🍖</i><b>Turma do Churras</b><span class="tt-r alvo">⋮</span></div>${TT_BOLHAS}`},
    {p:1, cap:'Toque em Mais', x:72, y:41, h:`<div class="tt-bar a"><span>←</span><i class="tt-av">🍖</i><b>Turma do Churras</b><span class="tt-r">⋮</span></div>${TT_BOLHAS}
      <div class="tt-menu"><div>Dados do grupo</div><div>Mídia do grupo</div><div>Pesquisar</div><div>Silenciar</div><div>Papel de parede</div><div class="alvo">Mais ›</div></div>`},
    {p:1, cap:'Toque em Exportar conversa', x:66, y:30.5, h:`<div class="tt-bar a"><span>←</span><i class="tt-av">🍖</i><b>Turma do Churras</b><span class="tt-r">⋮</span></div>${TT_BOLHAS}
      <div class="tt-menu"><div>Denunciar</div><div>Sair do grupo</div><div>Limpar conversa</div><div class="alvo">Exportar conversa</div><div>Adicionar atalho</div></div>`},
    {p:2, cap:'Escolha Sem mídia', x:30, y:57, h:`<div class="tt-bar a"><span>←</span><i class="tt-av">🍖</i><b>Turma do Churras</b><span class="tt-r">⋮</span></div>${TT_BOLHAS}
      <div class="tt-veu"></div><div class="tt-dlg"><b>Exportar conversa</b><p>Incluir mídia deixa o arquivo bem maior.</p><div class="tt-bts"><span class="alvo">SEM MÍDIA</span><span>INCLUIR MÍDIA</span></div></div>`},
    {p:3, cap:'Salve em Arquivos (Downloads)', x:62, y:84, h:`<div class="tt-bar a"><span>←</span><i class="tt-av">🍖</i><b>Turma do Churras</b><span class="tt-r">⋮</span></div>${TT_BOLHAS}
      <div class="tt-veu"></div><div class="tt-sheet"><small>Compartilhar</small><div class="tt-ics"><span><i>☁️</i>Drive</span><span><i>✉️</i>E-mail</span><span class="alvo"><i>📁</i>Arquivos</span><span><i>📶</i>Bluetooth</span></div></div>`},
    {p:4, cap:'No Retrozap, escolha o arquivo', x:50, y:45, h:TT_SITE(false)},
    {p:4, cap:'E toque em Fazer a retrospectiva', x:50, y:67, h:TT_SITE(true)},
    {p:4, cap:'Pronto! 🎉', h:TT_SITE(true, true), fim:true}
  ],
  iphone: [
    {p:0, cap:'Toque no nome do grupo', x:50, y:7, h:`<div class="tt-bar i"><span>‹</span><b class="alvo">Turma do Churras<small>toque para dados do grupo</small></b><span class="tt-r">📞</span></div>${TT_BOLHAS}`},
    {p:1, cap:'Role até o fim e toque em Exportar conversa', x:50, y:66, w:1400, h:`<div class="tt-bar i"><span>‹</span><b>Dados do grupo</b><span class="tt-r"></span></div>
      <div class="tt-info"><div class="tt-rol"><i class="tt-av g">🍖</i><b>Turma do Churras</b><small>Grupo · 6 membros</small>
      <div class="tt-lst"><div>Mídia, links e docs</div><div>Favoritas</div><div>Silenciar</div><div>Papel de parede</div></div>
      <div class="tt-lst"><div class="alvo az">Exportar conversa</div><div class="az">Limpar conversa</div></div>
      <div class="tt-lst"><div class="vm">Sair do grupo</div></div></div></div>`},
    {p:2, cap:'Escolha Sem mídia', x:50, y:79, h:`<div class="tt-bar i"><span>‹</span><b>Dados do grupo</b><span class="tt-r"></span></div>
      <div class="tt-veu"></div><div class="tt-acs"><div class="tt-ac"><div>Anexar mídia</div><div class="alvo">Sem mídia</div></div><div class="tt-ac"><div><b>Cancelar</b></div></div></div>`},
    {p:3, cap:'Toque em Salvar em Arquivos', x:50, y:86, h:`<div class="tt-bar i"><span>‹</span><b>Dados do grupo</b><span class="tt-r"></span></div>
      <div class="tt-veu"></div><div class="tt-sheet i"><small>Conversa do WhatsApp.zip</small><div class="tt-ics"><span><i>💬</i>Mensagens</span><span><i>✉️</i>Mail</span><span><i>📝</i>Notas</span></div>
      <div class="tt-lst"><div>Copiar</div><div class="alvo">Salvar em Arquivos</div></div></div>`},
    {p:3, cap:'E toque em Salvar', x:86, y:6.5, h:`<div class="tt-bar i"><span class="az">Cancelar</span><b>Arquivos</b><span class="tt-r az alvo" style="font-weight:700">Salvar</span></div>
      <div class="tt-info"><div class="tt-lst"><div>☁️ iCloud Drive</div><div>📱 No meu iPhone</div><div>📥 Downloads ✓</div></div></div>`},
    {p:4, cap:'No Retrozap, escolha o arquivo', x:50, y:45, h:TT_SITE(false)},
    {p:4, cap:'E toque em Fazer a retrospectiva', x:50, y:67, h:TT_SITE(true)},
    {p:4, cap:'Pronto! 🎉', h:TT_SITE(true, true), fim:true}
  ]
};
let TT_RUN = 0;
const TT_CALMO = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function tutorialHTML(){
  return `<div class="tt" aria-hidden="true">
    <div class="tt-phone"><div class="tt-scr" id="ttScr"></div><i class="tt-dedo" id="ttDedo"></i></div>
    <p class="tt-cap" id="ttCap"></p>
  </div>
  <div class="tt-ctl"><button class="tt-pp" id="ttPP" type="button"></button><button class="tt-pp" id="ttDeNovo" type="button">↺ Ver de novo</button></div>`;
}
function tutorial(how){
  const id = ++TT_RUN, cenas = TT_CENAS[how], scr = $('#ttScr'), dedo = $('#ttDedo'), cap = $('#ttCap'), pp = $('#ttPP'), dn = $('#ttDeNovo');
  const lis = view.querySelectorAll('ol.how li');
  let i = 0, tocando = !TT_CALMO(), tm = null;
  const vivo = () => id === TT_RUN && scr.isConnected;
  const espera = ms => new Promise(r => { tm = setTimeout(r, ms); });
  const pinta = c => {
    scr.innerHTML = casalTxt(c.h); cap.textContent = casalTxt(c.cap);
    lis.forEach((li, k) => li.classList.toggle('on', k === c.p));
    dedo.classList.remove('tap');
    dedo.style.opacity = c.fim ? 0 : 1;
  };
  const botao = () => { pp.textContent = tocando ? '⏸ Pausar animação' : '▶ Ver animação'; pp.setAttribute('aria-pressed', String(!tocando)); };
  async function ciclo(){
    while (vivo() && tocando){
      const c = cenas[i];
      pinta(c);
      if (!c.fim){
        await espera(c.w || 1100); if (!vivo() || !tocando) return;
        { const a = scr.querySelector('.alvo'), ph = scr.parentNode.getBoundingClientRect();
          if (a){ const r = a.getBoundingClientRect(); dedo.style.left = (r.left + r.width/2 - ph.left) + 'px'; dedo.style.top = (r.top + r.height/2 - ph.top) + 'px'; } }
        await espera(800); if (!vivo() || !tocando) return;
        dedo.classList.add('tap'); scr.querySelector('.alvo')?.classList.add('apertou');
        await espera(900);
      } else await espera(3000);
      if (!vivo() || !tocando) return;
      i = (i + 1) % cenas.length;
    }
  }
  pinta(cenas[0]); dedo.style.left = '50%'; dedo.style.top = '92%';
  botao();
  pp.onclick = () => { tocando = !tocando; clearTimeout(tm); botao(); if (tocando) ciclo(); };
  // ver de novo: a espera pendente nunca termina (clearTimeout), então o ciclo antigo para e um novo começa do zero
  dn.onclick = () => { clearTimeout(tm); i = 0; pinta(cenas[0]); dedo.style.left = '50%'; dedo.style.top = '92%'; tocando = true; botao(); tm = setTimeout(() => { if (vivo() && tocando) ciclo(); }, 800); };
  // começa depois de 2 s, para dar tempo de ver a primeira tela
  if (tocando) tm = setTimeout(() => { if (vivo() && tocando) ciclo(); }, 2000);
}
/* ---------- cobrança: 1º grupo grátis, depois R$ 4,99 (Pix) libera ilimitado neste navegador ---------- */
const TESTE_COBRANCA = /[?&]teste_cobranca=1/.test(location.search);
// ?zerar=1: este navegador volta a ser visitante novo (apaga grupos feitos e código de acesso guardados aqui)
if (/[?&]zerar=1/.test(location.search)) { try { localStorage.removeItem('rz_grupos'); localStorage.removeItem('rz_acesso'); } catch {} }
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); return true; } catch { return false; } };
// identidade do grupo: a primeira mensagem (continua igual quando o grupo cresce)
function idGrupo(){
  const r = state.raw || [], m = r.reduce((a, x) => (!a || x.t < a.t) ? x : a, null);
  const s = m ? `${+m.t}|${m.a}` : String(r.length); let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
async function precisaPagar(){
  if (state.sample || lsGet('rz_acesso')) return false;
  let grupos = []; try { grupos = JSON.parse(lsGet('rz_grupos') || '[]'); } catch {}
  const id = idGrupo();
  if (grupos.includes(id)) return false;
  let cfg = null;
  try { const r = await fetch('/api/cobranca', {cache: 'no-store'}); if (r.ok) cfg = await r.json(); } catch {}
  const ativa = cfg && cfg.pronto && (cfg.modo === 'ligada' || (cfg.modo === 'teste' && TESTE_COBRANCA));
  if (!ativa || grupos.length === 0){
    if (!grupos.includes(id)){ grupos.push(id); lsSet('rz_grupos', JSON.stringify(grupos.slice(-50))); }
    return false;
  }
  return true;
}
// ambiente de teste (prévia fora do site oficial): alterna Grátis/Premium e simula o Pix
// AdSense: IDs dos blocos (AdSense > Anúncios > Por bloco de anúncios). Vazio = sem anúncio nesse lugar. Premium nunca vê anúncio.
const ANUNCIOS = {inicio: '', categorias: '', intervalo: '', fim: ''};
// ?simular_anuncios=1 mostra caixas de exemplo no lugar dos anúncios (para ver o layout; nada é carregado do Google)
const SIMULA_ANUNCIOS = /[?&]simular_anuncios=1/.test(location.search);
function anuncio(onde){
  const slot = ANUNCIOS[onde];
  const semPremium = !lsGet('rz_acesso') && state.planoTeste !== 'premium'; // grupo de exemplo também vê anúncio
  if (SIMULA_ANUNCIOS && semPremium) return `<div class="anuncio"><p class="small" style="margin:0">Publicidade</p><div class="ad-sim">Anúncio de exemplo<br><small>${onde} · responsivo</small></div></div>`;
  if (!slot || !semPremium || AMBIENTE_TESTE) return '';
  return `<div class="anuncio" data-anuncio><p class="small" style="margin:0">Publicidade</p><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4039247360984618" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`;
}
function ativaAnuncios(){ view.querySelectorAll('[data-anuncio] ins:not([data-adsbygoogle-status])').forEach(() => { try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {} }); }
const AMBIENTE_TESTE = !/(^|\.)retrozap\.com\.br$|workers\.dev$|^localhost$|^127\./.test(location.hostname) || (/^localhost$|^127\./.test(location.hostname) && /[?&]plano_teste=1/.test(location.search)); // nunca no site oficial
if (AMBIENTE_TESTE) state.planoTeste = 'gratis';
const premiumLocal = () => state.planoTeste ? state.planoTeste === 'premium' : !!(state.sample || lsGet('rz_acesso'));
// premium liberado? (grupo de exemplo, código de acesso guardado ou cobrança desligada)
async function premiumLiberado(){
  if (state.planoTeste) return state.planoTeste === 'premium';
  if (state.sample || lsGet('rz_acesso')) return true;
  try { const r = await fetch('/api/cobranca', {cache: 'no-store'}); if (!r.ok) return true; const c = await r.json();
    return !(c.pronto && (c.modo === 'ligada' || (c.modo === 'teste' && TESTE_COBRANCA))); } catch { return true; }
}
let QR_LIB = null;
const carregaQR = () => QR_LIB || (QR_LIB = new Promise((ok, falha) => { const s = document.createElement('script'); s.src = '/assets/qrcode.js'; s.onload = () => ok(window.qrcode); s.onerror = falha; document.head.appendChild(s); }));
function paywall(seguir, ctx){
  const antes = document.activeElement, m = document.createElement('div');
  let vivo = true, tm = null;
  m.className = 'patro'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true'); m.setAttribute('aria-labelledby','pwT');
  const fecha = () => { vivo = false; clearTimeout(tm); m.remove(); try { antes?.focus(); } catch {} };
  const libera = codigo => {
    lsSet('rz_acesso', codigo); document.documentElement.classList.add('premium'); // some com os anúncios na hora
    try { if (typeof evento === 'function') evento('compra_ilimitado'); } catch {}
    caixa.innerHTML = `<div class="lemb-ic" aria-hidden="true">🎉</div>
      <h2 id="pwT" style="font-size:26px;margin:0">Liberado!</h2>
      <p class="lemb-tx">Agora é ilimitado neste navegador, com todos os personagens, a categoria livre e o vídeo. Para usar em outro celular, digite este código ou o e-mail que você usou no Pix:</p>
      <div class="pw-cod">${esc(codigo)}</div>
      <button type="button" class="btn btn-ghost" id="pwCopC">Copiar código</button>
      <button type="button" class="btn btn-main" id="pwSeg">Continuar a retrospectiva 🏆</button>`;
    caixa.querySelector('#pwCopC').onclick = e => { navigator.clipboard?.writeText(codigo).then(() => { e.target.textContent = 'Copiado ✓'; }).catch(() => {}); };
    caixa.querySelector('#pwSeg').onclick = () => { fecha(); seguir(); };
    caixa.querySelector('#pwSeg').focus();
  };
  m.innerHTML = `<div class="patro-box lemb pw" aria-live="polite"></div>`;
  const caixa = m.firstElementChild;
  const inicio = () => {
    caixa.innerHTML = `<button type="button" class="pw-x" id="pwX" aria-label="Fechar">✕</button>
      <p class="pw-ctx">${{personagens: '🔒 Os outros personagens são Premium', video: '🔒 Baixar o vídeo é Premium', livre: '🔒 A categoria livre é Premium', destaques: '🔒 O resto da retrospectiva 2026 é Premium'}[ctx] || '🎁 Seu primeiro grupo foi por nossa conta'}</p>
      <h2 id="pwT" class="pw-tit">Acesso ilimitado.<br><em>Pague 1x só.</em></h2>
      <div class="pw-preco"><b>R$ 4,99</b><span>não dá nem pro cafezinho do editor ☕</span></div>
      <ul class="pw-lista">
        <li><span aria-hidden="true">♾️</span><div><b>Quantos grupos quiser</b>Família, amigos, trabalho, condomínio, a pelada de quinta...</div></li>
        <li><span aria-hidden="true">🎭</span><div><b>Todos os personagens</b>Ninguém escapa: cada um com seu título, jeito de falar e manias.</div></li>
        <li><span aria-hidden="true">🚫</span><div><b>Sem anúncios</b>Nada de intervalo comercial: só a cerimônia.</div></li>
        <li><span aria-hidden="true">🎬</span><div><b>Vídeo da retrospectiva</b>30 segundos com o ano em números, os troféus e os destaques, pronto para os stories.</div></li>
        <li><span aria-hidden="true">🔎</span><div><b>Categoria livre</b>Você escolhe a palavra e descobre quem mais falou ela.</div></li>
        <li><span aria-hidden="true">💕</span><div><b>Retrozap Casais</b>A retrospectiva de vocês dois, quantas vezes quiser.</div></li>
        <li><span aria-hidden="true">🚀</span><div><b>Tudo o que vier de novo</b>Novidades Premium já incluídas, sem pagar de novo.</div></li>
        <li><span aria-hidden="true">🔥</span><div><b>Seus grupos nunca mais vão ser os mesmos</b>Prepare-se para agitar (muito) a conversa.</div></li>
      </ul>
      <p class="small" style="margin:0">Pagamento único no Pix · sem assinatura · liberado na hora</p>
      <label class="pw-lb" for="pwEm">Seu e-mail (para o comprovante)</label>
      <input id="pwEm" type="email" inputmode="email" autocomplete="email" placeholder="voce@email.com" class="pw-in">
      <p class="err" id="pwErr" hidden></p>
      <button type="button" class="btn btn-main" id="pwPix">🔓 Liberar tudo por R$ 4,99</button>
      <button type="button" class="pw-lk" id="pwTenho">Já paguei, tenho um código</button>
      <p class="small" style="margin:0">Continua igual: suas mensagens não saem do seu celular. O pagamento é processado pelo Mercado Pago.</p>`;
    caixa.querySelector('#pwX').onclick = fecha;
    caixa.querySelector('#pwTenho').onclick = codigoTela;
    const em = caixa.querySelector('#pwEm'), err = caixa.querySelector('#pwErr'), bt = caixa.querySelector('#pwPix');
    em.value = lsGet('rz_email') || '';
    bt.onclick = async () => {
      const email = em.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){ err.hidden = false; err.textContent = 'Confira o e-mail.'; em.focus(); return; }
      lsSet('rz_email', email);
      if (AMBIENTE_TESTE){ state.planoTeste = 'premium'; marcaPlano(); return libera('RZ-TEST-TEST'); } // prévia: pagamento simulado
      bt.disabled = true; bt.textContent = 'Gerando o Pix...'; err.hidden = true;
      try {
        const r = await fetch('/api/pix', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({email})});
        const j = await r.json();
        if (!r.ok || !j.ref) throw new Error(j.error === 'email' ? 'Confira o e-mail.' : 'Não consegui gerar o Pix agora. Tente de novo em instantes.' + (TESTE_COBRANCA ? ` [${r.status}${j.detalhe ? ': ' + j.detalhe : ''}]` : ''));
        try { if (typeof evento === 'function') evento('pix_gerado'); } catch {}
        pixTela(j);
      } catch (e) { bt.disabled = false; bt.textContent = '🔓 Liberar tudo por R$ 4,99'; err.hidden = false; err.textContent = e.message || 'Sem conexão. Tente de novo.'; }
    };
    caixa.querySelector('#pwX').focus({preventScroll:true}); requestAnimationFrame(() => { m.scrollTop = 0; });
  };
  const pixTela = j => {
    caixa.innerHTML = `<button type="button" class="pw-x" id="pwX" aria-label="Fechar">✕</button>
      <h2 id="pwT" style="font-size:22px;margin:0">Pague R$ 4,99 no Pix</h2>
      <div class="pw-qr" id="pwQr" role="img" aria-label="QR code do Pix">${j.qr64 ? `<img src="data:image/png;base64,${j.qr64}" alt="">` : ''}</div>
      <p class="small" style="margin:0">Escaneie no app do banco ou use o Pix copia e cola:</p>
      <button type="button" class="btn btn-main" id="pwCop">📋 Copiar código Pix</button>
      ${j.link ? `<a class="pw-lk" href="${esc(j.link)}" target="_blank" rel="noopener">Abrir a página do Pix</a>` : ''}
      <p class="pw-esp"><span class="pw-dot" aria-hidden="true"></span> Aguardando o pagamento... a confirmação chega aqui sozinha.</p>`;
    caixa.querySelector('#pwX').onclick = fecha;
    caixa.querySelector('#pwCop').onclick = e => { navigator.clipboard?.writeText(j.qr).then(() => { e.target.textContent = 'Copiado ✓ Cole no app do banco'; }).catch(() => {}); };
    if (!j.qr64 && j.qr) carregaQR().then(q => { const g = q(0, 'M'); g.addData(j.qr); g.make(); const el = caixa.querySelector('#pwQr'); if (el) el.innerHTML = g.createSvgTag({cellSize: 4, margin: 2, scalable: true}); }).catch(() => {});
    const t0 = Date.now();
    const volta = () => { if (!document.hidden && vivo){ clearTimeout(tm); confere(); } };
    document.addEventListener('visibilitychange', volta);
    const confere = async () => {
      if (!vivo) return;
      // aba escondida (pessoa no app do banco): não consulta; confere assim que ela volta
      if (!document.hidden) try {
        const r = await fetch('/api/pix/status', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({ref: j.ref})});
        const s = await r.json();
        if (s.pago && s.codigo) return libera(s.codigo);
      } catch {}
      // consulta a cada 3 s no começo e vai espaçando (menos carga no servidor se viralizar)
      const passou = Date.now() - t0;
      if (passou < 30*60e3) tm = setTimeout(confere, passou < 2*60e3 ? 3000 : passou < 10*60e3 ? 8000 : 20000);
      else { const p = caixa.querySelector('.pw-esp'); if (p) p.textContent = 'O Pix expirou. Feche e gere outro.'; }
    };
    tm = setTimeout(confere, 3000);
  };
  const codigoTela = () => {
    caixa.innerHTML = `<button type="button" class="pw-x" id="pwX" aria-label="Fechar">✕</button>
      <h2 id="pwT" style="font-size:22px;margin:0">Recuperar acesso</h2>
      <label class="pw-lb" for="pwCod">Digite o código (RZ-XXXX-XXXX) ou o e-mail que você usou no Pix</label>
      <input id="pwCod" class="pw-in" placeholder="RZ-XXXX-XXXX ou voce@email.com" autocapitalize="none" autocomplete="off">
      <p class="err" id="pwErr" hidden></p>
      <button type="button" class="btn btn-main" id="pwOk">Liberar</button>
      <button type="button" class="pw-lk" id="pwVolta">← Voltar</button>
      <p class="small" style="margin:0">Não lembra o e-mail? Escreva para <a href="mailto:contato@retrozap.com.br" style="color:var(--areia)">contato@retrozap.com.br</a>.</p>`;
    caixa.querySelector('#pwX').onclick = fecha;
    caixa.querySelector('#pwVolta').onclick = inicio;
    const inp = caixa.querySelector('#pwCod'), err = caixa.querySelector('#pwErr'), bt = caixa.querySelector('#pwOk');
    bt.onclick = async () => {
      const v = inp.value.trim(), porEmail = v.includes('@'), codigo = v.toUpperCase();
      bt.disabled = true; err.hidden = true;
      try {
        const r = await fetch('/api/acesso', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(porEmail ? {email: v} : {codigo})});
        const s = await r.json();
        if (s.ok) return libera(porEmail ? s.codigo : codigo);
        err.hidden = false; err.textContent = porEmail ? 'Não achei uma compra paga com esse e-mail. Confira e tente de novo.' : 'Código não encontrado. Confira e tente de novo.';
      } catch { err.hidden = false; err.textContent = 'Sem conexão. Tente de novo.'; }
      bt.disabled = false;
    };
    inp.focus();
  };
  document.body.appendChild(m);
  m.addEventListener('keydown', e => { if (e.key === 'Escape') fecha(); });
  inicio();
}
// abre o app do WhatsApp: no Android o Chrome só aceita o formato intent:// (whatsapp:// vazio é ignorado)
function linkAbreWhats(){
  if (/Android/i.test(navigator.userAgent)) return 'intent://send/#Intent;scheme=whatsapp;S.browser_fallback_url=' + encodeURIComponent('https://www.whatsapp.com/download') + ';end';
  return 'whatsapp://send';
}
// página inicial: o que a pessoa vai encontrar + Vamos começar
function inicio(){
  anchor(true);
  ir('/');
  PILHA.length = 0; const vb = document.getElementById('voltar'); if (vb) vb.hidden = true;
  setSteps(0); state.data = null; const cs = state.modo === 'casal';
  view.innerHTML = `
  <section class="screen hero">
    ${cs ? `<p class="eyebrow">A retrospectiva dos casais do Brasil</p>
    <h1>Toda história de amor tem números. <em>Descubra os de vocês.</em></h1>
    <p class="lead">Quem manda mais "te amo", quem demora para responder, quem pede desculpas: cada um leva o seu troféu. 💘</p>` : `<p class="eyebrow">A retrospectiva oficial dos grupos do Brasil</p>
    <h1>Todo grupo tem uma história. <em>Descubra a do seu.</em></h1>
    <p class="lead">Quem fala demais, quem some, quem manda figurinha às 3 da manhã: cada um leva o seu troféu. 🏆</p>`}
    <div class="badge"><span aria-hidden="true">🔒</span><span><b>Suas mensagens não saem do seu celular.</b> Tudo é analisado aqui no navegador. A gente não recebe, não lê e não guarda nenhuma mensagem. <a href="/privacidade" style="color:var(--areia)">Entenda</a></span></div>
    <div class="escolha" role="group" aria-label="O que você quer analisar?">
      <button type="button" class="esc esc-g" data-esc="grupo" aria-pressed="${!cs}"><span class="em" aria-hidden="true">🏆</span><b>Grupos</b><span>Amigos, família, trabalho, condomínio</span></button>
      <button type="button" class="esc esc-c" data-esc="casal" aria-pressed="${cs}"><i class="novo">Novo</i><span class="em" aria-hidden="true">💘</span><b>Casais</b><span>A retrospectiva de vocês dois</span></button>
    </div>
    <div class="panel oque">
      <p class="ask">O que você vai encontrar</p>
      ${cs ? `<ol class="oque-l">
        <li><span class="em" aria-hidden="true">🎭</span><div><b>Os personagens do casal</b><span>Quem é quem na relação e o jeito de cada um falar.</span></div></li>
        <li><span class="em" aria-hidden="true">🏆</span><div><b>10 categorias com troféus</b><span>Do Mais Romântico ao Visualiza e Demora, com card para mandar um para o outro.</span></div></li>
        <li><span class="em" aria-hidden="true">🎬</span><div><b>Os números de vocês e um vídeo para os stories</b><span>Quem manda mais o quê, e como vocês se comparam aos casais do Brasil.</span></div></li>
      </ol>` : `<ol class="oque-l">
        <li><span class="em" aria-hidden="true">🎭</span><div><b>Os personagens do grupo</b><span>Conhecendo o grupo: quem é quem e o jeito de cada um falar.</span></div></li>
        <li><span class="em" aria-hidden="true">🏆</span><div><b>10 categorias com troféus</b><span>Do Tagarela ao Fantasma, com pódio e card para mandar no grupo.</span></div></li>
        <li><span class="em" aria-hidden="true">📊</span><div><b>Os números do grupo e o ranking</b><span>Mensagens, áudios, figurinhas e como o grupo se compara aos grupos do Brasil.</span></div></li>
      </ol>`}
    </div>
    <button class="btn btn-main" id="comecar">${cs ? 'Começar a retrospectiva do casal →' : 'Vamos começar →'}</button>
    <section class="seo-home" aria-labelledby="seo-t">
      <h2 id="seo-t">Como fazer a retrospectiva do seu grupo de WhatsApp</h2>
      <p>O Retrozap é o "Wrapped" do seu grupo de WhatsApp: transforma a conversa em números, prêmios e um resumo para mandar no grupo. Funciona com grupo de amigos, da família, do trabalho e do condomínio.</p>
      <ol>
        <li><b>Exporte a conversa.</b> No WhatsApp, abra o grupo, toque no nome dele e escolha Exportar conversa, Sem mídia. <a href="/blog/como-exportar-conversa-whatsapp">Passo a passo</a>.</li>
        <li><b>Escolha o arquivo aqui.</b> A leitura acontece no seu navegador, em menos de um minuto, e as mensagens não saem do celular.</li>
        <li><b>Revele os prêmios e mande o card no grupo.</b> Quem mais fala, quem some, a tia do bom dia e o coruja da madrugada levam o troféu.</li>
      </ol>
      <h2>Perguntas frequentes</h2>
      <details><summary>O Retrozap é grátis?</summary><p>A primeira retrospectiva é grátis. Para fazer quantos grupos quiser, o acesso ilimitado custa R$ 4,99, pago uma única vez no Pix.</p></details>
      <details><summary>Minhas mensagens são enviadas para algum servidor?</summary><p>Não. A leitura do arquivo acontece no seu navegador. As mensagens, os nomes e os telefones não saem do seu celular ou computador.</p></details>
      <details><summary>Funciona no iPhone e no Android?</summary><p>Sim. O site aceita o .zip ou o .txt que o WhatsApp gera nos dois sistemas, e também funciona no computador.</p></details>
      <details><summary>Funciona com a conversa de um casal?</summary><p>Sim. No Retrozap Casais, a retrospectiva é de vocês dois: quem manda mais "te amo", quem demora para responder, o card "Nós dois" e um vídeo para os stories.</p></details>
      <details><summary>Quais prêmios o grupo pode ganhar?</summary><p>São 10 categorias escolhidas para o tipo de grupo, como O Tagarela, O Fantasma, Coruja da Madrugada e Tio do Bom Dia, além do ranking do grupo comparado a outros grupos do Brasil.</p></details>
    </section>
    ${anuncio('inicio')}
    <nav class="rodape" aria-label="Links do site"><a href="/privacidade" class="seguro">🔒 É seguro?</a><a href="/como-funciona">Como funciona</a><a href="/perguntas-frequentes">Perguntas frequentes</a><a href="/blog/">Blog</a><a href="/ideias">Envie sua ideia</a><a href="/sobre">Sobre</a><a href="/privacidade">Privacidade</a><a href="/termos">Termos de uso</a><a href="/contato">Contato</a></nav>
  </section>`;
  $('#comecar').onclick = () => home(); ativaAnuncios();
  view.querySelectorAll('[data-esc]').forEach(b => b.onclick = () => { const k = b.dataset.esc; setModo(k === 'casal' ? 'casal' : (state.ultimoGrupo || 'amigos')); const y = scrollY; inicio(); scrollTo(0, y); view.querySelector(`[data-esc="${k}"]`)?.focus({preventScroll: true}); });
  window.scrollTo(0,0);
}
function home(){
  anchor(true);
  ir('/comecar');
  PILHA.length = 0; PILHA.push({f: inicio, k: 'inicio'}); pilha(home, 'comecar');
  setSteps(0); state.data = null;
  view.innerHTML = `
  <section class="screen">
    <p class="eyebrow">Passo a passo</p>
    <h1 style="font-size:clamp(30px,8vw,40px)">${state.modo === 'casal' ? 'Traga a conversa de vocês dois 💕' : 'Traga a conversa do seu grupo'}</h1>
    <div class="panel">
      <p class="ask" id="passo1">1. É de um grupo ou de um casal?</p>
      <div class="tipo-conversa" role="group" aria-labelledby="passo1">
        <button type="button" data-tipo="grupo" aria-pressed="${state.modo !== 'casal'}">🏆 Grupo</button>
        <button type="button" data-tipo="casal" aria-pressed="${state.modo === 'casal'}">💘 Casal</button>
      </div>
    </div>
    <div class="panel">
      <p class="ask">2. Exporte a conversa do WhatsApp</p>
      <div class="tabs" role="tablist">
        <button role="tab" id="tab-iphone" aria-selected="${state.how==='iphone'}" data-h="iphone">iPhone</button>
        <button role="tab" id="tab-android" aria-selected="${state.how==='android'}" data-h="android">Android</button>
      </div>
      ${tutorialHTML()}
      ${state.how==='iphone' ? `<ol class="how">
        <li>${state.modo === 'casal' ? 'Abra a conversa e toque no <b>nome da pessoa</b> lá em cima.' : 'Abra o grupo e toque no <b>nome do grupo</b> lá em cima.'}</li>
        <li>Role até o fim e toque em <b>Exportar conversa</b>.</li>
        <li>Escolha <b>Sem mídia</b>.</li>
        <li>Toque em <b>Salvar em Arquivos</b>.</li></ol>`
      : `<ol class="how">
        <li>Abra ${state.modo === 'casal' ? 'a conversa' : 'o grupo'} e toque nos <b>três pontinhos ⋮</b>.</li>
        <li>Toque em <b>Mais</b> e depois em <b>Exportar conversa</b>.</li>
        <li>Escolha <b>Sem mídia</b>.</li>
        <li>Salve em <b>Downloads</b> ou no Drive.</li></ol>`}
      <a class="btn btn-wa" href="${linkAbreWhats()}" style="text-decoration:none"><i class="ic-wa" aria-hidden="true"></i>Abrir o WhatsApp para exportar</a>
    </div>
    <label class="drop${state.arquivo ? ' ok' : ''}" for="file">
      <span class="big" aria-hidden="true">${state.arquivo ? '✅' : '📲'}</span>
      <b>3. Toque para escolher o arquivo</b>
      <span class="small" id="fname">${state.arquivo ? 'Arquivo escolhido: ' + esc(state.arquivo.name) : 'Aceita o .zip ou o .txt que o WhatsApp gera'}</span>
      <input type="file" id="file">
    </label>
    <div class="badge priv"><span aria-hidden="true">🔒</span><span><b>Suas mensagens não saem do seu celular.</b> Tudo é analisado aqui no navegador. A gente não recebe, não lê e não guarda nenhuma mensagem. <a href="/privacidade" style="color:var(--areia)">Entenda</a></span></div>
    ${state.modo === 'casal' ? '' : `<div class="panel">
      <p class="ask">4. Que tipo de grupo é?</p>
      <div class="modes" role="group" aria-label="Tipo de grupo">
        ${Object.entries(MODOS).filter(([k]) => k !== 'casal').map(([k,m]) => `<button class="mode" data-m="${k}" style="--c:${m.c}" aria-pressed="${state.modo===k}"><span class="em">${m.e}</span>${m.n}</button>`).join('')}
      </div>
    </div>`}
    <button class="btn btn-main" id="start"${state.arquivo ? '' : ' disabled'}>${state.modo === 'casal' ? '💕 Fazer a retrospectiva do casal' : '🏆 Fazer a retrospectiva'}</button>
    <p class="err" id="err" hidden></p>
    <div class="btn-row"><button class="btn btn-ghost" id="demo">${state.modo === 'casal' ? '👀 Ver com um casal de exemplo' : '👀 Ver com um grupo de exemplo'}</button></div>
    <p class="small">O grupo de exemplo é inventado, para você ver como funciona antes de usar o seu.</p>
    <nav class="rodape" aria-label="Links do site"><a href="/privacidade" class="seguro">🔒 É seguro?</a><a href="/como-funciona">Como funciona</a><a href="/perguntas-frequentes">Perguntas frequentes</a><a href="/blog/">Blog</a><a href="/ideias">Envie sua ideia</a><a href="/sobre">Sobre</a><a href="/privacidade">Privacidade</a><a href="/termos">Termos de uso</a><a href="/contato">Contato</a></nav>
  </section>`;
  view.querySelectorAll('.mode').forEach(b => b.onclick = () => { const y = scrollY, k = b.dataset.m; evento('modo_escolhido', {modo: k}); setModo(k); home(); scrollTo(0, y); view.querySelector(`[data-m="${k}"]`)?.focus({preventScroll:true}); });
  view.querySelectorAll('[data-h]').forEach(b => b.onclick = () => { const y = scrollY, k = b.dataset.h; state.how = k; home(); scrollTo(0, y); view.querySelector(`[data-h="${k}"]`)?.focus({preventScroll:true}); });
  $('#file').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    state.arquivo = f; state.bytes = null;
    // Android: lê já na escolha, porque o acesso ao arquivo pode expirar depois
    f.arrayBuffer().then(b => { if (state.arquivo === f) state.bytes = b; }).catch(() => {}); const lb = view.querySelector('.drop'); lb.classList.add('ok'); lb.querySelector('.big').textContent = '✅';
    $('#fname').textContent = 'Arquivo escolhido: ' + f.name; $('#start').disabled = false; $('#err').hidden = true;
    (view.querySelector('.modes') || $('#start')).scrollIntoView({behavior:'smooth', block:'center'});
  };
  $('#start').onclick = () => state.arquivo && lembrete(() => readFile(state.arquivo));
  view.querySelectorAll('[data-tipo]').forEach(b => b.onclick = () => { const k = b.dataset.tipo, y = scrollY; setModo(k === 'casal' ? 'casal' : (state.ultimoGrupo || 'amigos')); home(); scrollTo(0, y); view.querySelector(`[data-tipo="${k}"]`)?.focus({preventScroll: true}); });
  tutorial(state.how);
  $('#demo').onclick = () => { DUR = {}; run(state.modo === 'casal' ? demoCasal() : demoChat(), true); };
  window.scrollTo(0,0);
}
// duração de cada áudio .opus do zip (só exports "com mídia"): lê a última página Ogg do arquivo
async function duracoes(zip){
  const out = {}, lista = Object.values(zip.files).filter(z => /\.(?:opus|ogg)$/i.test(z.name)).slice(0, 5000);
  for (const z of lista){
    try {
      const b = await z.async('uint8array');
      for (let i = b.length - 27; i >= 0; i--){
        if (b[i]===0x4F && b[i+1]===0x67 && b[i+2]===0x67 && b[i+3]===0x53){
          let g = 0; for (let j = 7; j >= 0; j--) g = g*256 + b[i+6+j];
          if (g > 0 && g < 48000*3600) out[z.name.split('/').pop()] = g/48000; break;
        }
      }
    } catch {}
  }
  return out;
}
// nome do grupo pelo nome do arquivo do export ("Conversa do WhatsApp com X", "WhatsApp Chat - X")
// corta em até n caracteres sem partir emoji/bandeira ao meio
function cortaNome(s, n = 40){
  s = String(s || '');
  let gs; try { gs = [...new Intl.Segmenter('pt-BR', {granularity: 'grapheme'}).segment(s)].map(x => x.segment); } catch { gs = [...s]; }
  const out = []; let len = 0;
  for (const g of gs){ if (len + g.length > n) break; out.push(g); len += g.length; }
  // tira bandeira pela metade (uma letra regional sozinha)
  while (out.length && /^[\u{1F1E6}-\u{1F1FF}]$/u.test(out[out.length - 1])) out.pop();
  return out.join('').trim();
}
function nomeDoArquivo(nome){
  const n = limpaTxt(String(nome || '').split('/').pop()).replace(/\.(zip|txt)$/i, '').trim();
  const m = n.match(/^(?:Conversa do WhatsApp com|Conversa do WhatsApp -|WhatsApp Chat with|WhatsApp Chat -|Chat de WhatsApp con|Chat de WhatsApp -)\s*(.+)$/i);
  return m ? cortaNome(limpaTxt(m[1])) : '';
}
// ou pelo último "mudou o nome do grupo para ..." / "criou o grupo ..."
function nomeDaConversa(text){
  const rx = /(?:mudou o nome(?: do grupo)?(?: de [“"][^”"]*[”"])? para|mudou o assunto(?: de [“"][^”"]*[”"])? para|criou (?:o )?grupo|changed the (?:group name|subject)(?: from [“"][^”"]*[”"])? to|created group) [“"]([^”"\n]{1,40})[”"]/gi;
  let m, ult = ''; while ((m = rx.exec(text))) ult = limpaTxt(m[1]); return ult;
}
async function readFile(f){
  DUR = {}; state.grupo = nomeDoArquivo(f.name);
  const err = $('#err');
  try{
    let text;
    let buf = state.arquivo === f && state.bytes;
    if (!buf){
      try { buf = await f.arrayBuffer(); }
      catch { throw new Error('O celular não deixou o site abrir esse arquivo. Escolha o arquivo de novo (de preferência salvo em Downloads) e toque em Fazer a retrospectiva.'); }
    }
    const u8 = new Uint8Array(buf);
    // zip pelo conteúdo (PK), não pelo nome: no Android o nome às vezes chega sem extensão
    if (u8[0] === 0x50 && u8[1] === 0x4B){
      const zip = await JSZip.loadAsync(buf);
      const txts = Object.values(zip.files).filter(z => !z.dir && /\.txt$/i.test(z.name) && !/(^|\/)__MACOSX\//.test(z.name));
      const entry = txts.find(z => /^(?:.*\/)?(?:_chat|Conversa do WhatsApp|WhatsApp Chat|Chat de WhatsApp)/i.test(z.name)) || txts.sort((a, b) => (b._data?.uncompressedSize || 0) - (a._data?.uncompressedSize || 0))[0];
      if (!entry) throw new Error('Não achei a conversa dentro do .zip. Exporte de novo escolhendo "Sem mídia".');
      text = await entry.async('string');
      if (!state.grupo) state.grupo = nomeDoArquivo(entry.name);
      DUR = await duracoes(zip);
    } else {
      // texto: UTF-8 (com ou sem BOM) ou UTF-16, que alguns Androids geram
      const bom16 = (u8[0] === 0xFF && u8[1] === 0xFE) || (u8[0] === 0xFE && u8[1] === 0xFF);
      text = new TextDecoder(bom16 ? (u8[0] === 0xFF ? 'utf-16le' : 'utf-16be') : 'utf-8').decode(u8);
    }
    text = text.replace(/^\uFEFF/, '');
    run(text, false);
  }catch(e){ evento('upload_erro'); err.hidden = false; err.textContent = e.message || 'Não consegui abrir esse arquivo. Tente exportar de novo.'; }
}
function carregando(titulo){
  { const vb = document.getElementById('voltar'); if (vb) vb.hidden = true; }
  anchor(false);
  view.innerHTML = `<section class="loader"><div class="trofinho" aria-hidden="true">🏆</div><h2 id="lf">${titulo}</h2>
    <div class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="pb"></i></div>
    <p class="cd" id="cd">calculando o tempo...</p><p class="small" id="pt"></p><p class="small">Tudo acontecendo no seu celular 🔒</p></section>`;
  const t0 = performance.now();
  return (frac, txt) => {
    const pb = $('#pb'); if (!pb) return;
    pb.style.width = Math.round(frac*100) + '%'; pb.parentNode.setAttribute('aria-valuenow', Math.round(frac*100));
    const gasto = performance.now() - t0, falta = frac > .02 ? gasto/frac*(1-frac) : null;
    $('#cd').textContent = frac >= 1 ? 'pronto!' : falta === null ? 'calculando o tempo...' : `faltam ~${Math.max(1, Math.ceil(falta/1000))} s`;
    if (txt) $('#pt').textContent = txt;
  };
}
async function run(text, sample){
  setSteps(1); state.sample = sample;
  const prog = carregando('Lendo a conversa inteira, do começo ao fim...');
  const t0 = performance.now();
  const msgs = await parseChat(text, (f, n) => prog(f, `${fmt(n)} mensagens lidas`));
  if (performance.now() - t0 < 900) await sleep(900 - (performance.now() - t0));
  if (msgs.length < 20 || new Set(msgs.map(m=>m.a)).size < 2){
    evento('upload_erro'); home(); const err = $('#err'); err.hidden = false;
    err.textContent = 'Esse arquivo não parece um export de grupo. Confira o passo a passo e tente de novo.'; return;
  }
  if (sample) state.grupo = state.modo === 'casal' ? 'Nosso Cantinho 💕' : 'Turma do Churras'; else if (!state.grupo) state.grupo = nomeDaConversa(text);
  evento('upload_ok', {mensagens: msgs.length, modo: state.modo, exemplo: !!sample});
  state.raw = msgs; state.alias = {}; state.hidden = new Set(); state.ctx = ''; state.intervaloVisto = false; state.livreUsadas = 0; state.palavra26 = null; state.intervaloAd = false;
  state.left = new Set(msgs.sys.filter(e => e.type === 'saiu' || e.type === 'removido').map(e => e.who));
  state.changed = new Set(msgs.sys.filter(e => e.type === 'numero').map(e => e.who));
  const autores = new Set(msgs.map(m => m.a));
  for (const n of state.left) if (autores.has(n)) state.hidden.add(n);
  if (state.modo === 'casal' && autores.has(state.grupo)) state.grupo = ''; // "Conversa com Fulano" não vira nome do casal
  // escolheu "grupo", mas a conversa tem só 2 pessoas: pergunta se é um casal
  if (!sample && state.modo !== 'casal' && [...autores].filter(n => !state.hidden.has(n)).length === 2) return perguntaCasal([...autores].filter(n => !state.hidden.has(n)), roster);
  roster();
}
function perguntaCasal(nomes, seguir){
  const m = document.createElement('div');
  m.className = 'patro'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true'); m.setAttribute('aria-labelledby','pcT'); m.setAttribute('aria-describedby','pcD');
  m.innerHTML = `<div class="patro-box lemb">
    <div class="lemb-ic" aria-hidden="true">💘</div>
    <h2 id="pcT" style="font-size:26px;margin:0">É um casal?</h2>
    <p class="lemb-tx" id="pcD">Essa conversa tem só duas pessoas: <b>${esc(nomes[0])}</b> e <b>${esc(nomes[1])}</b>. Se for um casal, a retrospectiva fica no modo Casal, com categorias de casal, o card "Nós dois" e o vídeo para os stories.</p>
    <button type="button" class="btn btn-main" id="pcSim">💘 Sim, somos um casal</button>
    <button type="button" class="btn btn-ghost" id="pcNao">Não, seguir como conversa normal</button>
  </div>`;
  document.body.appendChild(m);
  const vai = casal => { if (casal){ setModo('casal'); if (state.grupo === nomes[0] || state.grupo === nomes[1] || !state.grupo) state.grupo = ''; } m.remove(); seguir(); };
  m.querySelector('#pcSim').onclick = () => vai(true);
  m.querySelector('#pcNao').onclick = () => vai(false);
  m.addEventListener('keydown', e => { if (e.key === 'Escape') vai(false); });
  m.querySelector('#pcSim').focus();
}
const isFone = n => /^\+?[\d\s()\-]{8,}$/.test(n);
function roster(){
  anchor(false);
  ir('/turma');
  pilha(roster, 'turma');
  setSteps(1);
  const raw = state.raw, end = new Date(raw.reduce((a,m) => Math.max(a, +m.t), -Infinity)), info = {};
  for (const m of raw){
    const r = info[m.a] || (info[m.a] = {n:m.a, c:0, first:m.t, last:m.t, h:Array(24).fill(0), voc:{}, ts:[]});
    r.ts.push(+m.t);
    r.c++; if (m.t < r.first) r.first = m.t; if (m.t > r.last) r.last = m.t; r.h[m.t.getHours()]++;
    if (kind(m.b) === 'text') for (const w of (norm(m.b).match(/[\p{L}\p{Extended_Pictographic}]{3,}|\p{Extended_Pictographic}/gu) || [])) if (!STOP.has(w)) r.voc[w] = (r.voc[w]||0) + 1;
  }
  const todos = Object.values(info).sort((a,b) => b.c - a.c);
  for (const r of todos) r.ts.sort((a,b) => a - b);
  const numeros = todos.filter(r => isFone(r.n)), pessoas = todos.filter(r => !isFone(r.n));
  const meses = r => Math.floor((end - r.last) / (30*864e5));
  const mmaa = t => t.toLocaleDateString('pt-BR', {month:'short', year:'numeric'});
  const dentro = todos.filter(r => !state.hidden.has(r.n) && !state.alias[r.n]).length;
  const sug = {}; for (const x of numeros) sug[x.n] = sugerir(x, pessoas, raw);
  view.innerHTML = `<section class="screen">
    ${state.sample ? `<span class="sample">${state.modo === 'casal' ? 'Casal de exemplo' : 'Grupo de exemplo'}</span>` : ''}
    <p class="eyebrow">Antes de começar · ${state.modo === 'casal' ? 'Confira os nomes' : 'Confira a turma'}</p>
    <h1 style="font-size:36px">${dentro} pessoas na cerimônia</h1>
    <div class="panel"><label class="ask" for="gn">${state.modo === 'casal' ? 'Nome do casal' : 'Nome do grupo'} <span class="small">(aparece nos cards)</span></label>
      <input id="gn" type="text" maxlength="44" value="${esc(state.grupo)}" placeholder="Ex.: Família Silva" autocomplete="off" style="width:100%;padding:14px 16px;border-radius:14px;border:1.5px solid var(--linha);background:var(--noite);color:var(--areia);font:inherit;font-size:17px"></div>
    ${numeros.length ? `<h2 style="font-size:24px">📞 Números desconhecidos</h2>
    <p class="small">Costumam ser alguém que trocou de número. Comparamos quando cada um falou e o jeito de escrever para sugerir quem é.</p>
    <div class="mems">${numeros.map((x,i) => {
      const s = sug[x.n], junto = state.alias[x.n], fora = state.hidden.has(x.n);
      return `<div class="mem${junto || fora ? ' off' : ''}">
        <b>${esc(x.n)}</b><span class="small">${fmt(x.c)} mensagens · de ${mmaa(x.first)} a ${mmaa(x.last)}</span>
        ${junto ? `<p>🔗 Contando como <b>${esc(junto)}</b></p><button type="button" class="btn btn-ghost mini" data-undo="${i}">Desfazer</button>`
        : fora ? `<p>Fora da cerimônia</p><button type="button" class="btn btn-ghost mini" data-undo="${i}">Desfazer</button>`
        : `${s ? `<p class="hint">Parece ser <b>${esc(s.nome)}</b>: ${juntar(s.motivos)}.</p>
            <div class="btn-row"><button type="button" class="btn btn-main mini" data-ok="${i}">✅ É ${esc(s.nome)}</button><button type="button" class="btn btn-ghost mini" data-out="${i}">Tirar da cerimônia</button></div>`
          : `<p class="hint">Não conseguimos descobrir quem é.</p><button type="button" class="btn btn-ghost mini" data-out="${i}">Tirar da cerimônia</button>`}
          <label class="small" for="pick-${i}">${s ? 'Não é? Escolha quem é:' : 'Se souber, escolha quem é:'}</label>
          <select id="pick-${i}" data-pick="${i}"><option value="">Escolher pessoa</option>${pessoas.map(p => `<option>${esc(p.n)}</option>`).join('')}</select>`}
      </div>`; }).join('')}</div>` : ''}
    <h2 style="font-size:24px">${state.modo === 'casal' ? '💘 Vocês dois' : '👥 Integrantes'}</h2>
    <p class="small">${state.modo === 'casal' ? 'Se a mesma pessoa aparece duas vezes (trocou de número), toque em "Contato duplicado?".' : 'Desmarque quem não está mais no grupo. Se alguém aparece duas vezes, toque em "Contato duplicado?".'}</p>
    <div class="btn-row"${state.modo === 'casal' ? ' hidden' : ''}><button class="btn btn-ghost mini" id="inat">💤 Tirar quem não fala há 12+ meses</button><button class="btn btn-ghost mini" id="todos">Incluir todo mundo</button></div>
    <div class="mems">${pessoas.filter(r => !state.alias[r.n]).map(r => {
      const i = pessoas.indexOf(r), off = state.hidden.has(r.n), b = [];
      if (state.left.has(r.n)) b.push('🚪 Saiu do grupo');
      const sumido = meses(r) >= 12;
      const juntos = pessoas.filter(x => state.alias[x.n] === r.n), nums = numeros.filter(x => state.alias[x.n] === r.n);
      const total = r.c + juntos.reduce((s,x) => s + x.c, 0) + nums.reduce((s,x) => s + x.c, 0);
      const aberto = state.aberto === r.n;
      const pal = n => norm(n).split(/[^\p{L}]+/u).filter(w => w.length >= 3), meu = pal(r.n);
      const depois = x => x.first > r.last ? 1 : 0;
      const opcoes = pessoas.filter(x => x.n !== r.n && !state.alias[x.n]).sort((x, y) => (pal(y.n).some(w => meu.includes(w)) - pal(x.n).some(w => meu.includes(w))) || (depois(y) - depois(x)) || x.n.localeCompare(y.n));
      return `<div class="mem${off ? ' off' : ''}${sumido && !off ? ' alerta' : ''}">
        <div class="mem-line">
          <input type="checkbox" id="in-${i}" data-in="${i}" ${off ? '' : 'checked'} aria-label="Incluir ${esc(r.n)} na cerimônia">
          <div class="mem-name">
            <b>${esc(r.n)}</b><span class="small">${fmt(total)} mensagens${nums.length ? ' + número antigo' : ''} · última em ${mmaa(r.last)}</span>
            ${b.length ? `<span class="chips">${b.map(x => `<span class="chip warn">${x}</span>`).join('')}</span>` : ''}
            ${sumido ? `<span class="sumido">⚠️ <b>Sem falar há ${meses(r)} meses.</b> ${off ? 'Fora da cerimônia.' : 'Trocou de número ou saiu do grupo?'}
              ${off ? '' : `<span class="sumido-bts"><button type="button" class="btn btn-main mini" data-open="${i}" aria-expanded="${aberto}">${aberto ? 'Cancelar' : '🔗 Trocou de número (duplicado)'}</button><button type="button" class="btn btn-ghost mini" data-tira="${i}">🚪 Saiu: tirar da cerimônia</button></span>`}</span>` : ''}
            ${sumido && !off ? '' : `<button type="button" class="lnk dup" data-open="${i}" aria-expanded="${aberto}">${aberto ? 'Cancelar' : 'Contato duplicado?'}</button>`}
          </div>
        </div>
        ${juntos.length ? `<p class="small">🔗 Inclui ${juntos.map(j => esc(j.n)).join(', ')} · <button type="button" class="lnk" data-sep="${i}">Separar</button></p>` : ''}
        ${aberto ? `<div class="merge">
          <label class="small" for="mg-${i}">${esc(r.n)} é a mesma pessoa que... <span class="small">(junta na hora e fica o nome com mais mensagens)</span></label>
          <select id="mg-${i}" data-mg="${i}"><option value="">Escolher pessoa</option>${opcoes.map(x => `<option>${esc(x.n)}</option>`).join('')}</select>
        </div>` : ''}
      </div>`; }).join('')}</div>
    <label class="optin"><input type="checkbox" id="cmp"${state.comparar === false ? '' : ' checked'}><span>📊 ${state.modo === 'casal' ? 'Comparar com outros casais do Retrozap' : 'Comparar meu grupo com outros grupos do Retrozap'}<span class="small">Só números anônimos, como o total de mensagens. Nenhuma mensagem e nenhum nome saem do celular.</span></span></label>
    <p class="err" id="rerr" hidden></p>
    <button class="btn btn-main" id="go">Tudo certo, começar →</button>
  </section>`;
  const redraw = () => { const y = scrollY; roster(); scrollTo(0, y); };
  view.querySelectorAll('[data-open]').forEach(bt => bt.onclick = () => { const n = pessoas[+bt.dataset.open].n; state.aberto = state.aberto === n ? null : n; state.mgAlvo = null; redraw(); });
  view.querySelectorAll('[data-mg]').forEach(sl => sl.onchange = () => { if (!sl.value) return;
    const a = state.aberto, b = sl.value, tot = n => pessoas.filter(x => x.n === n || state.alias[x.n] === n).reduce((t, x) => t + x.c, 0);
    const fica = tot(a) >= tot(b) ? a : b, sai = fica === a ? b : a;
    for (const k of Object.keys(state.alias)) if (state.alias[k] === sai) state.alias[k] = fica;
    state.alias[sai] = fica; state.hidden.delete(fica); state.aberto = null; state.mgAlvo = null; redraw(); });
  view.querySelectorAll('[data-tira]').forEach(bt => bt.onclick = () => { state.hidden.add(pessoas[+bt.dataset.tira].n); redraw(); });
  view.querySelectorAll('[data-keep]').forEach(bt => bt.onclick = () => {
    const a = state.aberto, b = state.mgAlvo, fica = bt.dataset.keep === 'a' ? a : b, sai = fica === a ? b : a;
    for (const k of Object.keys(state.alias)) if (state.alias[k] === sai) state.alias[k] = fica;
    state.alias[sai] = fica; state.hidden.delete(fica);
    state.aberto = null; state.mgAlvo = null; redraw();
  });
  view.querySelectorAll('[data-sep]').forEach(bt => bt.onclick = () => { const n = pessoas[+bt.dataset.sep].n; for (const p of pessoas) if (state.alias[p.n] === n) delete state.alias[p.n]; redraw(); });
  view.querySelectorAll('[data-in]').forEach(c => c.onchange = () => { const n = pessoas[+c.dataset.in].n; c.checked ? state.hidden.delete(n) : state.hidden.add(n); redraw(); });
  view.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => { const x = numeros[+b.dataset.ok]; state.alias[x.n] = sug[x.n].nome; redraw(); });
  view.querySelectorAll('[data-out]').forEach(b => b.onclick = () => { state.hidden.add(numeros[+b.dataset.out].n); redraw(); });
  view.querySelectorAll('[data-undo]').forEach(b => b.onclick = () => { const n = numeros[+b.dataset.undo].n; delete state.alias[n]; state.hidden.delete(n); redraw(); });
  view.querySelectorAll('[data-pick]').forEach(sl => sl.onchange = () => { if (sl.value){ state.alias[numeros[+sl.dataset.pick].n] = sl.value; redraw(); } });
  $('#inat').onclick = () => { pessoas.forEach(r => { if (meses(r) >= 12) state.hidden.add(r.n); }); redraw(); };
  $('#todos').onclick = () => { state.hidden.clear(); state.alias = {}; redraw(); };
  $('#go').onclick = async () => {
    { const g = $('#go'); g.disabled = true; const pagar = await precisaPagar(); g.disabled = false; if (pagar) return paywall(() => $('#go').click()); }
    const msgs = state.raw.filter(m => !state.hidden.has(m.a) && !state.hidden.has(state.alias[m.a])).map(m => ({t:m.t, a:state.alias[m.a] || m.a, b:m.b}));
    if (new Set(msgs.map(m => m.a)).size < 2){ const e = $('#rerr'); e.hidden = false; e.textContent = 'Deixe pelo menos duas pessoas na cerimônia.'; return; }
    if (state.modo === 'casal' && new Set(msgs.map(m => m.a)).size > 2){ const e = $('#rerr'); e.hidden = false; e.textContent = 'No modo casal, deixe só as duas pessoas da conversa (ou volte e escolha "Um grupo").'; return; }
    msgs.sys = state.raw.sys; msgs.perdidas = state.raw.perdidas;
    const prog = carregando('Analisando todas as mensagens...');
    state.data = await analyze(msgs, f => prog(f, `${fmt(Math.round(f*msgs.length))} de ${fmt(msgs.length)} mensagens analisadas`));
    state.data.perdidas = state.raw.perdidas || 0;
    state.compP = comparar(state.data); // em segundo plano; a resposta aparece no Ato I e no Gran Finale
    prog(1); await sleep(300);
    state.awards = buildAwards(state.data); state.idx = 0;
    story();
  };
  $('#gn').oninput = e => { state.grupo = cortaNome(limpaTxt(e.target.value), 44); };
  $('#cmp').onchange = e => { state.comparar = e.target.checked; };
  window.scrollTo(0,0);
}
// Sugere quem é um número desconhecido: alguém que começou a falar quando o número parou,
// que quase não falava ao mesmo tempo que ele e que escreve parecido (horários, palavras, emojis).
function sugerir(x, pessoas, raw){
  const ate = (ts, v) => { let lo = 0, hi = ts.length; while (lo < hi){ const md = (lo + hi) >> 1; if (ts[md] <= v) lo = md + 1; else hi = md; } return lo; }; // quantos horários ≤ v
  const cos = (a, b) => { let s = 0, na = 0, nb = 0; for (let i = 0; i < a.length; i++){ s += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; } return na && nb ? s / Math.sqrt(na*nb) : 0; };
  const topo = v => new Set(Object.entries(v).sort((a,b) => b[1]-a[1]).slice(0, 25).map(e => e[0]));
  const tx = topo(x.voc), trocas = (raw.sys || []).filter(e => e.type === 'numero');
  let melhor = null;
  for (const p of pessoas){
    const junto = (ate(p.ts, +x.last) - ate(p.ts, +x.first - 1)) / p.c;
    if (junto > .25) continue; // falavam ao mesmo tempo: provavelmente pessoas diferentes
    const tp = topo(p.voc), comuns = [...tx].filter(w => tp.has(w)).length;
    const estilo = .5*cos(x.h, p.h) + .5*(comuns / Math.max(1, Math.min(tx.size, tp.size)));
    const passou = p.first >= new Date(+x.last - 60*864e5);
    const aviso = trocas.some(e => e.who === p.n && Math.abs(e.t - x.last) < 90*864e5);
    const score = (1 - junto)*.3 + estilo*.4 + (passou ? .2 : 0) + (aviso ? .4 : 0);
    const motivos = [];
    if (aviso) motivos.push(`${p.n} avisou que trocou de número nessa época`);
    if (passou) motivos.push(`começou a falar quando este número parou`);
    if (estilo > .45) motivos.push('escreve parecido');
    if (!melhor || score > melhor.score) melhor = {nome:p.n, score, motivos};
  }
  return melhor && melhor.score >= .55 && melhor.motivos.length ? melhor : null;
}

const juntar = arr => arr.length > 1 ? arr.slice(0,-1).join(', ') + ' e ' + arr.at(-1) : (arr[0] || '');
// mensagens por ano (gráfico do Ato I e do card de resumo)
function porAno(d){
  if (d._anos) return d._anos; const o = {};
  for (const m of d.msgs){ const y = m.t.getFullYear(); o[y] = (o[y]||0) + 1; }
  return (d._anos = Object.entries(o).map(([y, n]) => ({y: +y, n})).sort((a, b) => a.y - b.y).slice(-10));
}
const curto = n => n >= 1e6 ? nfmt1(n/1e6) + ' mi' : n >= 1e4 ? fmt(Math.round(n/1000)) + ' mil' : fmt(n);
function graficoAnos(d){
  const L = porAno(d), mx = Math.max(1, ...L.map(x => x.n)), parcial = d.end.getFullYear() === L.at(-1)?.y && d.end.getMonth() < 11;
  return `<div class="anos" role="img" aria-label="Mensagens por ano: ${L.map(x => `${x.y}, ${fmt(x.n)}`).join('; ')}">${L.map(x => `<div class="ano${x.y === ANO_MOMENTO ? ' atual' : ''}" aria-hidden="true"><span class="v">${curto(x.n)}</span><i style="height:${Math.max(3, Math.round(x.n/mx*100))}%"></i><span class="y">${x.y}</span></div>`).join('')}</div>
    ${parcial ? `<p class="small" style="margin:0">${L.at(-1).y} vai até ${d.end.toLocaleDateString('pt-BR', {day:'numeric', month:'long'})}.</p>` : ''}`;
}
// posição no ranking (Top X%), quando o servidor responde; null = não mostra
const topDe = k => { const t = state.comp?.top?.[k]; return t && (t <= 90 || k === 'hist_total' || k === 'total') ? t : null; };
const quemBrasil = () => state.modo === 'casal' ? 'dos casais do Brasil' : 'do Brasil';
function quemAudio(d){
  const tot = d.people.reduce((s, p) => s + p.audio, 0); if (!tot) return [];
  return d.people.filter(p => p.audio > 0).sort((a, b) => b.audio - a.audio).slice(0, 3).map(p => ({n: p.name, pct: Math.round(p.audio/tot*100)}));
}
// resumo desde o início: mensagens, áudios, páginas + horas para ler, frase mais dita e gíria
function resumoInicio(d){
  const lv = livro(d), au = audios(d), fr = frase(d), desde = d.start.toLocaleDateString('pt-BR', {month:'long', year:'numeric'});
  const dias = Math.max(1, Math.round((d.end - d.start)/864e5) + 1), md = d.total/dias, f = [];
  f.push({e:'💬', big:`${fmt(d.total)} mensagens`, sub:`desde ${desde} · média de ${md >= 10 ? fmt(Math.round(md)) : md.toFixed(1).replace('.', ',')} por dia`, top:'hist_total'});
  if (au){ const q = quemAudio(d); f.push({e:'🎧', big:`${fmt(d.audioN)} áudios`, sub:`${au.txt} · ${au.comp.replace(/^[\d.]+ áudios · /, '')}`, top:'hist_audios',
    quem: q.length ? `${state.modo === 'casal' ? 'Quem manda mais' : 'Quem mais manda'}: ${q.map(x => `${x.n} ${x.pct}%`).join(' · ')}` : ''}); }
  f.push({e:'📚', big:`${fmt(lv.pags)} ${lv.pags === 1 ? 'página' : 'páginas'} · ${tempoLeitura(d.palavras)}`, sub:`se ${state.modo === 'casal' ? 'a conversa' : 'o grupo'} virasse livro · ${tempoLeitura(d.palavras)} para ler tudo, sem parar · ${lv.comp}`});
  if (fr) f.push({e:'🗣️', big:fr.txt, sub:fr.sub});
  if (d.giria && d.giria[1] >= 3) f.push({e:'🤙', big:`“${d.giria[0]}”`, sub:`a gíria oficial · ${fmt(d.giria[1])} vezes`});
  return f;
}
const itemRes = x => `<div class="res-i"><span aria-hidden="true">${x.e}</span><div><b>${esc(x.big)}</b><span class="small">${esc(x.sub)}</span>${x.quem ? `<span class="quem">🎙️ ${esc(x.quem)}</span>` : ''}${x.top ? `<span class="pills" data-top="${x.top}" hidden></span>` : ''}</div></div>`;
function preencheTops(){
  view.querySelectorAll('[data-top]').forEach(el => { const t = topDe(el.dataset.top);
    if (t){ el.innerHTML = `<span class="pill pos">🏅 Top ${t}% ${quemBrasil()} · desde o início</span>`; el.hidden = false; } });
}
function story(){
  anchor(true);
  ir('/conhecendo'); evento('prologo_visto');
  pilha(story, 'prologo');
  const d = state.data, P = d.people, tot = d.total, m = state.modo; setSteps(1);
  const nome = classificar(d, m), [em, porque] = PERSONAS[nome];
  const dias = Math.max(1, Math.round((d.end - d.start)/864e5) + 1);
  const anos = Math.floor(dias/365), meses = Math.floor((dias % 365)/30.4);
  const dur = [anos ? `${anos} ${anos > 1 ? 'anos' : 'ano'}` : '', meses ? `${meses} ${meses > 1 ? 'meses' : 'mês'}` : ''].filter(Boolean).join(' e ') || `${dias} dias`;
  const dataLonga = t => t.toLocaleDateString('pt-BR', {day:'numeric', month:'long', year:'numeric'});
  const b = x => `<b>${esc(x)}</b>`;
  const quem = m === 'casal' ? (P[1] ? `${b(P[0].name)} e ${b(P[1].name)}` : b(P[0].name)) : state.grupo ? b(state.grupo) : 'Esse grupo';
  const papo = {casal:'o amor nunca ficou sem assunto', amigos:'a resenha nunca parou', familia:'a família nunca ficou sem assunto', trabalho:'o expediente nunca acabou de verdade', comunidade:'a vizinhança nunca ficou em silêncio'}[m];
  const ps = [m === 'casal' ? `${quem} conversam há ${dur}, e ${papo}.` : `${quem} existe há ${dur}, e ${papo}.`];
  view.innerHTML = `<section class="screen">
    ${state.sample ? `<span class="sample">${m === 'casal' ? 'Casal de exemplo' : 'Grupo de exemplo'}</span>` : ''}
    <p class="eyebrow">Ato I · Conhecendo ${m === 'casal' ? 'o casal' : 'o grupo'}</p>
    <div class="persona"><span class="em" aria-hidden="true">${em}</span><div><span class="small">A classificação ${m === 'casal' ? 'do casal' : 'do grupo'} é</span><h1>${nome}</h1><span class="small">${porque}</span></div></div>
    <div class="tale">${ps.map((p,i) => `<p style="animation-delay:${i*.35}s">${p}</p>`).join('')}</div>
    <div class="badge"><span aria-hidden="true">📅</span><span>A primeira mensagem foi em <b>${dataLonga(d.start)}</b>. A última, em <b>${dataLonga(d.end)}</b>.${d.perdidas ? ` ${fmt(d.perdidas)} linhas não puderam ser lidas.` : ''}</span></div>
    <div class="panel"><h2 style="font-size:22px;margin:0">📈 Mensagens ano a ano</h2>${graficoAnos(d)}</div>
    <h2 style="font-size:26px;margin:4px 0 0">${m === 'casal' ? 'O resumo de vocês' : 'O resumo do grupo'} <span class="tag-periodo">desde o início</span></h2>
    <div class="res-l">${resumoInicio(d).map(itemRes).join('')}</div>
    <p class="lead" style="text-align:center;font-size:20px"><b style="color:var(--areia)">${m === 'casal' ? 'Quem é mais romântico? Quem ri mais? Quem pede desculpas?' : 'Quem fala mais? Quem some? Quem manda áudio de 5 minutos?'}</b><br>Tudo isso vai ser revelado agora.</p>
    <button class="btn btn-main" id="go">Ver as categorias →</button>
  </section>`;
  $('#go').onclick = lineup;
  preencheTops(); (state.compP || Promise.resolve()).then(() => { if (view.querySelector('[data-top]')) preencheTops(); });
  window.scrollTo(0,0);
}
function stats(){ story(); } // os números agora fazem parte do prólogo
const PERSONAS = {
  'Resenha da Madrugada':['🌙','Mais de 12% das mensagens saem entre meia-noite e 5h da manhã.'],
  'Fábrica de Risada':['😂','Mais de 20% das mensagens têm risada.'],
  'Museu da Figurinha':['🖼️','Figurinhas passam de 8% de tudo o que é enviado.'],
  'Rádio do Grupo':['🎙️','Áudios passam de 5% das mensagens.'],
  'Escritório Paralelo':['💼','O grupo fala quase o dobro nos dias úteis do que no fim de semana.'],
  'Resenha Raiz':['🍻','Amigos com conversa equilibrada: nenhum hábito domina.'],
  'Família Unida e Barulhenta':['🏡','Família ativa, sem um hábito que domine a conversa.'],
  'O Time que Não Desliga':['🌙','Mais de 35% das mensagens chegam depois das 19h ou no fim de semana.'],
  'Expediente Raiz':['💼','A conversa acontece no horário comercial; o fim de semana é sagrado.'],
  'Time Engajado':['🚀','Time que conversa com frequência, sem exagero de horário.'],
  'Central de Avisos':['📋','Muitos avisos, lembretes e comunicados.'],
  'Feirinha do Bairro':['🏷️','Anúncios de venda, desapego e doação dominam a conversa.'],
  'Comunidade Ativa':['🏘️','Comunidade que conversa, se ajuda e troca indicações.'],
  'Casal Grudento':['🫶','Mais de 40 mensagens por dia. Vocês não desgrudam.'],
  'Casal Coruja':['🌙','Mais de 12% das mensagens saem de madrugada.'],
  'Casal Meme':['😂','Risada em mais de 20% das mensagens. O amor é uma piada interna.'],
  'Casal Podcast':['🎙️','Áudios passam de 5% das mensagens.'],
  'Casal Romântico':['💘','Declarações de amor em mais de 3% das mensagens.'],
  'Casal Equilibrado':['💞','Amor, rotina e conversa na medida certa.']
};
const PERSONAS_MODO = {
  amigos:['Resenha da Madrugada','Fábrica de Risada','Museu da Figurinha','Rádio do Grupo','Escritório Paralelo','Resenha Raiz'],
  familia:['Resenha da Madrugada','Fábrica de Risada','Museu da Figurinha','Rádio do Grupo','Escritório Paralelo','Família Unida e Barulhenta'],
  trabalho:['O Time que Não Desliga','Expediente Raiz','Time Engajado'],
  comunidade:['Feirinha do Bairro','Central de Avisos','Comunidade Ativa'],
  casal:['Casal Grudento','Casal Coruja','Casal Meme','Casal Podcast','Casal Romântico','Casal Equilibrado']
};
const CONTEXTOS = {
  amigos:['da escola','da faculdade','de infância','do futebol','do trabalho','da balada'],
  familia:['da família toda','dos primos','dos irmãos','de pais e filhos'],
  trabalho:['do time','da empresa','de um projeto','com clientes'],
  comunidade:['do prédio','do bairro','da escola dos filhos','de um hobby','de corrida','de pets'],
  casal:['namorando','casados','ficando','à distância','juntos há anos']
};
function classificar(d, m){
  const P = d.people, tot = d.total, sum = k => P.reduce((s,p) => s + p[k], 0), texts = sum('text') || 1;
  const util = (d.days[1]+d.days[2]+d.days[3]+d.days[4]+d.days[5])/5, fds = (d.days[0]+d.days[6])/2;
  const night = sum('night')/tot, laugh = sum('laugh')/texts, stick = sum('sticker')/tot, audio = sum('audio')/tot, after = sum('after')/tot;
  if (m === 'casal'){ const dias = Math.max(1, (d.end - d.start)/864e5); return tot/dias > 40 ? 'Casal Grudento' : night > .12 ? 'Casal Coruja' : laugh > .2 ? 'Casal Meme' : audio > .05 ? 'Casal Podcast' : sum('teamo')/texts > .03 ? 'Casal Romântico' : 'Casal Equilibrado'; }
  if (m === 'trabalho') return after > .35 ? 'O Time que Não Desliga' : util > fds*2 ? 'Expediente Raiz' : 'Time Engajado';
  if (m === 'comunidade') return sum('vende') > sum('aviso') && sum('vende') > 5 ? 'Feirinha do Bairro' : sum('aviso') > 5 ? 'Central de Avisos' : 'Comunidade Ativa';
  if (night > .12) return 'Resenha da Madrugada';
  if (laugh > .2) return 'Fábrica de Risada';
  if (stick > .08) return 'Museu da Figurinha';
  if (audio > .05) return 'Rádio do Grupo';
  if (util > fds*1.8) return 'Escritório Paralelo';
  return m === 'familia' ? 'Família Unida e Barulhenta' : 'Resenha Raiz';
}

function lineup(){
  anchor(true);
  ir('/categorias');
  pilha(lineup, 'categorias');
  setSteps(2);
  const ativos = state.awards.filter(a => !a.honra), bonus = state.bonus || [];
  const linha = (a, tag) => `<div class="cat${tag ? ' bon' : ''}"><span class="em" aria-hidden="true">${a.e}</span><div class="ct"><b>${a.n}</b><span class="small">${esc(a.crit)}</span></div>${tag ? '<span class="st">extra</span>' : ''}</div>`;
  view.innerHTML = `<section class="screen">
    ${state.sample ? `<span class="sample">${state.modo === 'casal' ? 'Casal de exemplo' : 'Grupo de exemplo'}</span>` : ''}
    <p class="eyebrow">Ato II · As categorias</p>
    <h1 style="font-size:36px">${ativos.length} troféus em disputa. Quem leva?</h1>
    <p class="lead">As categorias do modo ${MODOS[state.modo].n}. Uma por vez: dê seu palpite, raspe ou revele.</p>
    <div class="spoiler">
      <b class="sp-t">👀 Mas antes, que tal um spoiler no grupo?</b>
      <span>Mande a imagem com as categorias no seu grupo e que comecem os palpites.</span>
      <button class="btn" id="spoil" type="button">📲 Mandar o spoiler no grupo</button>
    </div>
    <div class="cats">${ativos.map(a => linha(a)).join('')}</div>
    ${anuncio('categorias')}
    <button class="btn btn-main" id="go">🥁 Começar a revelação</button>
  </section>`;
  intervaloComercial(); ativaAnuncios();
  $('#spoil').onclick = () => openCard(() => drawSpoiler(ativos), convite('spoiler', ativos.length), `Spoiler${state.grupo ? ' do grupo ' + state.grupo : ''}: os ${ativos.length} troféus em disputa são ${juntar(ativos.map(a => a.n))}. Quem leva cada um?`);
  $('#go').onclick = award;
  window.scrollTo(0,0);
}

function award(){
  anchor(true);
  ir('/premios/' + (state.idx + 1));
  { const i = state.idx; pilha(() => { state.idx = i; award(); }, 'premio' + i); }
  setSteps(2);
  const a = state.awards[state.idx], n = state.awards.length;
  if (a.honra){
    view.innerHTML = `<section class="screen">
      <p class="count">Prêmio ${state.idx+1} de ${n}</p>
      <div class="award"><div class="em" aria-hidden="true">✨</div><h1 class="h-award">${a.n}</h1><p class="crit">${a.crit}</p>
        <div class="chips" style="justify-content:center">${a.people.map(p=>`<span class="chip">${esc(p.name)} · ${fmt(p.count)} msgs</span>`).join('')}</div>
        <p class="frase">Presença confirmada na cerimônia. Todo grupo precisa de vocês.</p></div>
      <div class="nav"><button class="btn btn-main" id="next">Próximo →</button></div></section>`;
    $('#next').onclick = next; return;
  }
  view.innerHTML = `<section class="screen">
    ${state.sample ? `<span class="sample">${state.modo === 'casal' ? 'Casal de exemplo' : 'Grupo de exemplo'}</span>` : ''}
    <p class="count">Ato II · Categoria ${state.idx+1} de ${n}</p>
    <div class="award">
      <div class="em" aria-hidden="true">${a.e}</div>
      <h1 class="h-award">${a.n}</h1>
      <p class="crit">${esc(a.crit)}</p>
      <div id="game" style="width:100%;display:flex;flex-direction:column;align-items:center;gap:12px"></div>
      <div id="res" class="reveal" aria-live="polite" hidden></div>
    </div>
    <div class="acao"><button class="btn btn-main" id="rvl"></button><button class="btn btn-ghost" id="next" style="flex:0 0 auto">${state.idx === n-1 ? 'Pular para o final' : 'Pular →'}</button></div>
  </section>`;
  view.querySelector('section').classList.add('com-acao');
  $('#next').onclick = next;
  const jogo = ({podio, palpite, raspadinha, chute})[a.mech](a, $('#game'));
  $('#rvl').textContent = jogo.txt; $('#rvl').onclick = () => { $('#rvl').disabled = true; jogo.fn(); };
  window.scrollTo(0,0);
}
function next(){
  state.idx++;
  const meio = Math.ceil(state.awards.filter(a => !a.honra).length / 2);
  if (state.idx === meio && !state.intervaloAd && anuncio('intervalo')) return intervaloAnuncio();
  if (state.idx < state.awards.length) return award();
  if (state.noBonus) return fimTela(true);
  suspense();
}
// O auge: o resumo do grupo, revelado fato a fato, terminando no card para mandar no WhatsApp
function altResumo(d){
  return `Resumo ${state.modo === 'casal' ? 'do casal' : 'do grupo'}${state.grupo ? ' ' + state.grupo : ''}, desde o início: ` + resumoInicio(d).map(x => `${x.big} (${x.sub})`).join('; ') + `. Mensagens por ano: ${porAno(d).map(x => `${x.y}: ${fmt(x.n)}`).join(', ')}.`;
}

// Ato III · Gran Finale: o nosso 2026 (mensagens, áudios, risadas, assunto, destaques) e o vídeo
function fatosFinale(){
  const so26 = !!state.compD, D = state.data, casal = state.modo === 'casal', f = [];
  const pills = x => [x.vs && {c: x.up === true ? 'sobe' : x.up === false ? 'desce' : 'igual', t: x.vs}, x.top && {c: 'pos', t: `🏅 Top ${x.top}% ${quemBrasil()}`}].filter(Boolean);
  const PIADA = {
    figurinhas: () => 'Quando faltam palavras, sobra figurinha.', fotos: () => 'Tudo documentado. Nada fica sem prova.', palavrao: () => 'A mãe de alguém aqui está decepcionada.', apagadas: () => 'O que será que tinha ali?', madrugada: () => 'Alguém aqui dorme?', bomdia: () => 'O sol só nasce depois do bom dia do grupo.',
    amor: () => 'Declarações registradas em cartório.', coracoes: () => 'O teclado de vocês só tem coração.',
    total: x => x.up === true ? (casal ? 'Vocês estão mais grudados do que nunca.' : 'O grupo está mais falante do que nunca.') : x.up === false ? 'Menos papo, mais vida real? Duvido.' : casal ? 'Quem ama fala. Muito.' : 'Nem um dia de paz.',
    audios: () => 'E ninguém ouviu em 2x. Mentira.',
    risadas: () => casal ? 'O amor é uma piada interna.' : 'Rir é o idioma oficial do grupo.'};
  if (so26) for (const x of nums26(4))
    f.push({e: x.e, big: fmt(x.n), num: x.n, sub: `${x.k === 'total' ? 'mensagens' : x.t} em ${ANO_MOMENTO} · ${ate26()}`, pills: pills(x), piada: (PIADA[x.k] || PIADA.audios)(x)});
  else { const s = k => D.people.reduce((t, p) => t + (p[k] || 0), 0);
    for (const [e, n, t, k] of [['💬', D.total, 'mensagens', 'total'], ['🎧', s('audio'), 'áudios', 'audios'], ['😂', s('laugh'), 'risadas', 'risadas'], ['🖼️', s('sticker'), 'figurinhas', 'figurinhas']].filter(x => x[1] >= 3).slice(0, 4)) f.push({e, big: fmt(n), num: n, sub: `${t} desde o início`, pills: [], piada: PIADA[k]({})}); }
  const as = assunto26();
  if (as) f.push({e: as.e, big: as.txt, sub: `o assunto mais falado ${so26 ? 'de ' + ANO_MOMENTO : 'desde o início'} · ${fmt(as.n)} mensagens`, piada: casal ? 'Já sabem o programa do fim de semana.' : 'Os assuntos que nunca morrem.'});
  const ds = destaques26('fantasma');
  if (ds.length) f.push({e: '🏅', destaques: ds, piada: 'Ninguém foi poupado.'});
  if (videoSuportado()) f.push({video: true});
  return f;
}
function suspense(){
  anchor(false);
  ir('/resumo');
  pilha(suspense, 'resumo');
  setSteps(3);
  const d = state.data, fatos = fatosFinale(), casal = state.modo === 'casal', so26 = !!state.compD;
  let i = -1;
  view.innerHTML = `<section class="screen wr" style="align-items:center;text-align:center">
    ${state.sample ? `<span class="sample">${casal ? 'Casal de exemplo' : 'Grupo de exemplo'}</span>` : ''}
    <h1 class="sr-only">Gran Finale: o nosso ${ANO_MOMENTO}</h1>
    <p class="eyebrow" aria-hidden="true">Ato III · Gran Finale</p>
    <div class="dots" aria-hidden="true">${fatos.map(() => '<i></i>').join('')}</div>
    <div id="sl" class="slide" aria-live="polite">
      <div class="crown" style="font-size:84px" aria-hidden="true"><span class="tambor">🥁</span></div>
      <h1 style="font-size:34px">${so26 ? `Agora, o nosso ${ANO_MOMENTO}` : 'Agora, os números finais'}</h1>
      <p class="lead">${so26 ? `Como foi ${casal ? 'o ano de vocês' : 'o ano do grupo'}, comparado com os anos anteriores e com ${casal ? 'os casais' : 'os grupos'} do Brasil.` : 'Os números que ninguém pediu, mas que todo mundo vai querer mandar no grupo.'}</p>
    </div>
    <button class="btn btn-main" id="rl" style="width:100%">Começar →</button>
  </section>`;
  const sl = $('#sl'), bt = $('#rl'), dots = view.querySelectorAll('.dots i');
  const conta = (el, alvo, txt) => {
    const t0 = performance.now(), dur = 900;
    const passo = agora => { if (!el.isConnected) return; const p = Math.min(1, (agora - t0)/dur); el.textContent = p < 1 ? fmt(Math.round(alvo*(1 - Math.pow(1 - p, 3)))) + txt.replace(/^[\d.]+/, '') : txt; if (p < 1) requestAnimationFrame(passo); };
    requestAnimationFrame(passo);
  };
  const mostra = x => {
    if (x.video){
      sl.innerHTML = `<h2 style="font-size:30px;margin:0">🎬 O vídeo ${casal ? 'de vocês' : 'do grupo'}</h2><p class="small" style="margin:0">Tudo isso e os troféus em ${Math.round(cenasVideo(d).T.fim + 2.6)} segundos, pronto para os stories.</p>${videoHTML(casal)}
        <div class="ainda"><b>⏭️ Ainda não acabou!</b><span>Na próxima tela: todas as imagens para compartilhar, a categoria livre (você cria a sua) e ${casal ? 'quem é quem no casal' : 'os personagens do grupo'}.</span></div>`;
      ligaVideo(d, casal, () => { if (sl.isConnected) mostra(x); });
      return;
    }
    sl.innerHTML = x.destaques
      ? `<div class="em-g" aria-hidden="true">${x.e}</div><h2 style="font-size:30px">Top 3 destaques de ${ANO_MOMENTO}</h2>
         <div class="dest">${x.destaques.map(y => `<div><span aria-hidden="true">${y.e}</span><div><span class="small">${esc(y.t)}</span><b>${esc(y.n)}</b><span class="small">${esc(y.v)}</span></div></div>`).join('')}</div>
         <p class="piada">${esc(x.piada)}</p>`
      : `<div class="em-g" aria-hidden="true">${x.e}</div><div class="big" id="bg">${esc(x.big)}</div><p class="sub">${esc(x.sub)}</p>
         ${x.pills?.length ? `<div class="pills" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">${x.pills.map(p => `<span class="pill ${p.c}">${esc(p.t)}</span>`).join('')}</div>` : ''}
         <p class="piada">${esc(x.piada)}</p>`;
    if (x.num && /^[\d.]+/.test(x.big)) conta($('#bg'), x.num, x.big);
  };
  bt.onclick = () => {
    i++;
    if (i < fatos.length){ dots[i].classList.add('on'); mostra(fatos[i]); bt.textContent = i === fatos.length - 1 ? 'Continuar: ainda tem mais →' : 'Próximo →'; }
    else if (sl.isConnected) fimTela();
    window.scrollTo(0,0);
  };
  window.scrollTo(0,0);
}
// vídeo de ~30 s (prévia tocando + baixar). Usado no Gran Finale e na seção Para compartilhar.
function videoHTML(casal){
  if (!videoSuportado()) return '';
  return `<figure class="card-fim video-fim"><figcaption>🎬 Vídeo ${casal ? 'do casal' : 'do grupo'} <span class="small">· ${state.data ? Math.round(cenasVideo(state.data).T.fim + 2.6) : 30} segundos · ${state.compD ? 'foco em ' + ANO_MOMENTO : 'desde o início'}</span></figcaption>
    <canvas id="vlive" class="rimg" width="540" height="960" role="img" aria-label="Prévia do vídeo ${casal ? 'do casal' : 'do grupo'}: ${ANO_MOMENTO} em números${casal ? ' e um contra o outro' : ' e os destaques'}"></canvas>
    <p class="small" id="vmsg" role="status" style="margin:0">${premiumLocal() ? 'Toque em Baixar para gerar o vídeo (leva uns 30 segundos).' : 'A prévia é grátis. Para baixar e postar o vídeo, é Premium.'}</p>
    <div class="btn-row"><button type="button" class="btn btn-main" id="vger">${premiumLocal() ? '⬇️ Baixar o vídeo' : '🔒 Baixar o vídeo'}</button><button type="button" class="btn btn-wa" id="vsh" hidden>📤 Compartilhar</button><button type="button" class="btn btn-ghost" id="vsv" hidden>⬇️ Salvar</button></div></figure>`;
}
function ligaVideo(d, casal, refaz){
  if ($('#vlive')) tocaPrevia($('#vlive'), d);
  if (!$('#vger')) return;
  let vid = null;
  $('#vger').onclick = async () => {
    const bt = $('#vger'), msg = $('#vmsg');
    if (!premiumLocal() && !state.videoOk){ bt.disabled = true; const ok = await premiumLiberado(); bt.disabled = false;
      if (ok) state.videoOk = true; else return paywall(refaz, 'video'); }
    bt.disabled = true;
    try {
      vid = await gravarVideo(d, t => { bt.textContent = `🎬 Preparando o vídeo... ${Math.max(0, Math.ceil(VID_DUR - t))}s`; });
      bt.textContent = '🔁 Gerar de novo'; $('#vsh').hidden = false; $('#vsv').hidden = false;
      msg.textContent = vid.ext === 'mp4' ? 'Pronto! Mande no WhatsApp ou poste nos stories.' : 'Pronto! Se o Instagram não aceitar, mande pelo WhatsApp.';
    } catch { msg.textContent = 'Não deu para gravar o vídeo neste navegador. Use as imagens.'; bt.textContent = '🎬 Gerar o vídeo'; }
    bt.disabled = false;
  };
  $('#vsh').onclick = async () => { if (!vid) return; const f = new File([vid.blob], `retrozap-${casal ? 'casal' : 'grupo'}.${vid.ext}`, {type: vid.blob.type});
    try { if (navigator.canShare?.({files:[f]})){ await navigator.share({files:[f], text: convite('resumo')}); return; } } catch (e){ if (e?.name === 'AbortError') return; }
    $('#vmsg').textContent = 'Seu navegador não compartilha vídeo direto. Toque em Salvar e mande pelo app.'; };
  $('#vsv').onclick = async () => { if (!vid) return; const nome = `retrozap-${casal ? 'casal' : 'grupo'}.${vid.ext}`;
    const dw = DOWN || await window.claude?.use?.('downloads').catch(() => null);
    if (dw){ try { await dw.save({filename: nome, data: vid.blob}); $('#vmsg').textContent = 'Vídeo salvo!'; return; } catch {} }
    const a = document.createElement('a'); a.href = URL.createObjectURL(vid.blob); a.download = nome; document.body.appendChild(a); a.click(); a.remove(); };
}
// final: para compartilhar (vídeo e imagens) e extras (categoria livre e personagens)
// categoria livre: a pessoa digita uma palavra e vê quem mais falou (tudo calculado aqui no aparelho)
const LIVRE_MAX = 5;
const livreRestam = () => Math.max(0, LIVRE_MAX - (state.livreUsadas || 0));
// libera palavrões leves (porra, cacete, pqp, merda, droga...) e bloqueia o resto: ofensas, racismo, xenofobia, conteúdo sexual
const palavraProibida = w => PALAVRAO_FORTE.test(norm(w).replace(/[^\p{L}\p{N}]/gu, ''));
function contaPalavra(d, palavra){
  const w = norm(palavra).replace(/[^\p{L}\p{N}]/gu, ''), rx = new RegExp(`(^|[^\\p{L}\\p{N}])${w}(s|es)?(?=[^\\p{L}\\p{N}]|$)`, 'gu'), c = {};
  for (const m of d.msgs){ if (kind(m.b) !== 'text') continue; const n = (norm(m.b).match(rx) || []).length; if (n) c[m.a] = (c[m.a]||0) + n; }
  return Object.entries(c).sort((x, y) => y[1] - x[1]);
}
const FILA_IMG = []; let filaRodando = false;
function imgSobDemanda(el, fz){
  if (!el) return;
  const vai = () => { FILA_IMG.push(() => { if (el.isConnected) el.src = fz(); }); rodaFilaImg(); };
  try { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)){ io.disconnect(); vai(); } }, {rootMargin: '900px 0px'}); io.observe(el); } catch { vai(); }
}
function rodaFilaImg(){
  if (filaRodando) return; filaRodando = true;
  const passo = () => { const f = FILA_IMG.shift(); if (!f){ filaRodando = false; return; } document.fonts.ready.then(() => { try { f(); } catch {} setTimeout(passo, 80); }); };
  passo();
}
const liberado = () => premiumLocal() || (!state.planoTeste && !!state.premOk);
function fimTela(semFesta){
  anchor(false);
  ir('/fim'); if (!semFesta) evento('final_visto', {modo: state.modo});
  pilha(() => fimTela(true), 'fim');
  setSteps(3);
  const d = state.data, casal = state.modo === 'casal' && d.people.length === 2, so26 = !!state.compD, livre = liberado();
  const fig = (id, cap, per, alt) => `<figure class="card-fim"><figcaption>${cap} <span class="small">· ${per}</span></figcaption><img id="rimg${id}" class="rimg" alt="${esc(alt)}">
    <div class="btn-row"><button type="button" class="btn btn-wa" id="wa${id}"><i class="ic-wa" aria-hidden="true"></i>WhatsApp</button><button type="button" class="btn btn-ghost" id="sv${id}">⬇️ Salvar</button></div></figure>`;
  const persos = personagens(d, campeao().by);
  view.innerHTML = `<section class="screen wr" style="align-items:center;text-align:center">
    ${state.sample ? `<span class="sample">${state.modo === 'casal' ? 'Casal de exemplo' : 'Grupo de exemplo'}</span>` : ''}
    <p class="eyebrow">${esc(state.grupo || nomePadrao())}</p>
    <h1 style="font-size:clamp(30px,9vw,40px);margin:0">Ainda não acabou! 👀</h1>
    <div class="passos">
      <button type="button" class="passo" data-ir="cmpT"><span aria-hidden="true">📲</span><b>Baixe as mídias</b><small>vídeo e imagens para mandar ${casal ? 'um para o outro' : 'no grupo'}</small></button>
      <button type="button" class="passo" data-ir="lvT"><span aria-hidden="true">🔎</span><b>Crie novas categorias</b><small>escolha a palavra e veja quem mais falou</small></button>
      <button type="button" class="passo" data-ir="psT"><span aria-hidden="true">🎭</span><b>Descubra os personagens</b><small>${casal ? 'quem é quem nessa relação' : 'quem é quem no grupo'}</small></button>
    </div>
    <section class="compartilhar" aria-labelledby="cmpT">
      <h2 id="cmpT">📲 Para compartilhar</h2>
      <p class="small">${casal ? 'Vídeo e imagens prontos para mandar um para o outro e postar nos stories.' : 'Vídeo e imagens prontos para mandar no grupo e postar nos stories.'} Tudo é feito aqui no seu celular.</p>
      ${videoHTML(casal)}
      <div class="duas">
        ${fig(3, `🏆 Troféus ${casal ? 'do casal' : 'do grupo'}`, 'desde o início', altTop10())}
        ${fig(1, `📸 Resumo ${casal ? 'do casal' : 'do grupo'}`, 'desde o início', altResumo(d))}
        ${casal ? fig(5, '💞 Nós dois: um contra o outro', so26 ? 'só ' + ANO_MOMENTO : 'desde o início', altCasal(d)) : ''}
        ${so26 ? fig(4, `🗓️ Nosso ${ANO_MOMENTO}`, 'só ' + ANO_MOMENTO, altNosso2026()) : ''}
      </div>
    </section>
    <section class="extras" aria-labelledby="exT">
      <h2 id="exT">✨ Extra</h2>
      <div class="panel livre${livre ? '' : ' trancado'}" style="width:100%">
        <h3 id="lvT" style="font-size:24px;margin:0">🔎 Categoria livre${premiumLocal() ? '' : ' <span class="tag-periodo">🔒 Premium</span>'}</h3>
        <p class="small" style="margin:0">Crie sua própria categoria: escolha uma palavra e descubra quem ${casal ? 'de vocês dois' : 'do grupo'} mais falou ela. <span class="tag-periodo">desde o início</span></p>
        ${livre ? '' : '<button type="button" class="btn btn-main destrava" id="livreLock">🔓 Liberar a categoria livre</button>'}
        <div class="lv-corpo"${livre ? '' : ' aria-hidden="true" inert'}>
          <div class="vota" aria-label="Sugestões">${(casal ? ['saudade', 'amor', 'pizza', 'cansado'] : ['cerveja', 'bora', 'trabalho', 'futebol']).map(w => `<button type="button" class="chip" data-sug="${w}">${w}</button>`).join('')}</div>
          <p class="small" id="lvN" style="margin:0">${livreRestam()} de ${LIVRE_MAX} tentativas</p>
          <form id="lvF" class="livre-f"><label for="lvP" class="sr-only">Uma palavra</label><input id="lvP" maxlength="24" autocomplete="off" autocapitalize="none" placeholder="${casal ? 'ex.: saudade' : 'ex.: cerveja'}"><button type="submit" class="btn btn-main">Ver quem ganha</button></form>
          <p class="err" id="lvE" hidden></p>
          <div id="lvR" aria-live="polite"></div>
        </div>
      </div>
      <div class="panel" style="width:100%;text-align:left">
        <h3 id="psT" style="font-size:24px;margin:0;text-align:center">🎭 ${casal ? 'Quem é quem' : 'Os personagens do grupo'}${livre ? '' : ' <span class="tag-periodo">🔒 Premium</span>'}</h3>
        <p class="small" style="margin:0;text-align:center">${casal ? 'O jeito de cada um nessa relação.' : 'Os 5 que mais movimentam o grupo, e o que faz cada um ser quem é.'}</p>
        <div class="persos">${persos.map((x, i) => { const tr = i >= 1 && !livre; return `<div class="perso${tr ? ' trancado' : ''}">
          <div class="ph"><span class="em" aria-hidden="true">${x.e}</span><div><span class="small">${esc(x.nome)}</span><h3${tr ? ' aria-hidden="true"' : ''}>${x.titulo}</h3></div></div>
          ${tr ? '<button type="button" class="btn btn-main destrava" data-unlock>🔓 Ver todos os personagens</button>' : ''}
          <p class="bio"${tr ? ' aria-hidden="true"' : ''}>${esc(casalTxt(x.texto))}</p>
          ${x.fala.length || x.emojis.length ? `<div class="fala"${tr ? ' aria-hidden="true"' : ''}><span class="rot">Jeito de falar</span><div class="chips">${x.fala.map(f => `<span class="chip">${esc(f)}</span>`).join('')}${x.emojis.length ? `<span class="chip emo">${x.emojis.join(' ')}</span>` : ''}</div></div>` : ''}
          <ul${tr ? ' aria-hidden="true"' : ''}>${x.fatos.map(f => `<li>${esc(casalTxt(f))}</li>`).join('')}</ul></div>`; }).join('')}</div>
      </div>
    </section>
    ${anuncio('fim')}
    <button class="btn btn-main" id="concluir" style="width:100%">Concluir 🎉</button>
  </section>`;
  // imagens desenhadas sob demanda, uma de cada vez, quando chegam perto da tela (deixa a página e os pop-ups leves)
  [['#rimg1', () => drawResumo(d)], ['#rimg3', () => drawTop10()], ['#rimg4', () => drawNosso2026()], ['#rimg5', () => drawCasal(d)]].forEach(([sel, fz]) => imgSobDemanda($(sel), fz));
  ligaVideo(d, casal, () => fimTela(true));
  ativaAnuncios();
  const liga = (id, fz, nome, alt) => { if (!$('#wa' + id)) return;
    $('#wa' + id).onclick = () => mandarWhats(paraBlob(fz()), nome, convite('resumo'), null, () => openCard(fz, convite('resumo'), alt));
    $('#sv' + id).onclick = () => openCard(fz, convite('resumo'), alt); };
  liga(1, () => drawResumo(d), 'retrozap-resumo.png', altResumo(d));
  liga(3, () => drawTop10(), 'retrozap-trofeus.png', altTop10());
  liga(4, () => drawNosso2026(), `retrozap-${ANO_MOMENTO}.png`, so26 ? altNosso2026() : '');
  liga(5, () => drawCasal(d), 'retrozap-nos-dois.png', casal ? altCasal(d) : '');
  const destrava = tipo => () => paywall(() => { const y = scrollY; fimTela(true); scrollTo(0, y); }, tipo);
  $('#livreLock')?.addEventListener('click', destrava('livre'));
  view.querySelectorAll('.perso.trancado').forEach(cd => { cd.style.cursor = 'pointer'; cd.onclick = destrava('personagens'); });
  // cobrança desligada ou grupo de exemplo: libera os extras sem pagar
  if (!livre) premiumLiberado().then(ok => { if (ok && !state.planoTeste && $('#concluir')){ state.premOk = true; const y = scrollY; fimTela(true); scrollTo(0, y); } });
  view.querySelectorAll('[data-sug]').forEach(bt => bt.onclick = () => { $('#lvP').value = bt.dataset.sug; $('#lvF').requestSubmit(); });
  $('#lvF').onsubmit = e => {
    e.preventDefault(); const er = $('#lvE'), out = $('#lvR'), w = $('#lvP').value.trim();
    er.hidden = true; out.innerHTML = '';
    if (!liberado()) return destrava('livre')();
    if (!w) return;
    if (/\s/.test(w)){ er.hidden = false; er.textContent = 'Só uma palavra 😉'; return; }
    if (norm(w).replace(/[^\p{L}\p{N}]/gu, '').length < 2){ er.hidden = false; er.textContent = 'Escreva uma palavra com pelo menos 2 letras.'; return; }
    if (palavraProibida(w)){ er.hidden = false; er.textContent = 'Essa palavra não dá 😅 Escolha outra (não conta como tentativa).'; return; }
    if (livreRestam() <= 0){ er.hidden = false; er.textContent = `Você já usou as ${LIVRE_MAX} tentativas desta retrospectiva.`; return; }
    try { if (typeof evento === 'function') evento('categoria_livre'); } catch {}
    const r = contaPalavra(d, w), tot = r.reduce((x, y) => x + y[1], 0);
    if (!tot){ out.innerHTML = `<p class="small">Ninguém falou "${esc(w)}". Tenta outra palavra! (não conta como tentativa)</p>`; return; }
    state.livreUsadas = (state.livreUsadas || 0) + 1; $('#lvN').textContent = `${livreRestam()} de ${LIVRE_MAX} tentativas`;
    const md = ['🥇','🥈','🥉'], mx = r[0][1], vez = n => `${fmt(n)} ${n === 1 ? 'vez' : 'vezes'}`;
    out.innerHTML = `<p class="lv-tit">Quem mais falou <b>"${esc(w)}"</b>: ${vez(tot)} no total</p>
      <ol class="lv-l">${r.slice(0, 5).map(([n, v], i) => `<li><span aria-hidden="true">${md[i] || '·'}</span><b>${esc(n)}</b><span class="lv-bar"><i style="width:${Math.max(4, v/mx*100)}%"></i></span><span class="num">${vez(v)}</span></li>`).join('')}</ol>
      <button type="button" class="btn btn-ghost" id="lvC">🃏 Gerar card</button>`;
    $('#lvC').onclick = () => openCard(() => drawCard({emoji:'🔎', title:`Quem mais falou "${w}"`, winner: r[0][0], line: vez(r[0][1]),
      podio: r.length > 1 ? r.slice(1, 3).map(([n, v], i) => `${md[i+1]} ${n} · ${fmt(v)}`) : null}), convite('resumo'), `Categoria livre: quem mais falou "${w}" foi ${r[0][0]}, ${vez(r[0][1])}.`);
  };
  view.querySelectorAll('[data-ir]').forEach(b => b.onclick = () => document.getElementById(b.dataset.ir)?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'}));
  $('#concluir').onclick = () => obrigado();
  if (!semFesta){ confetti(); window.scrollTo(0,0); }
}
// pop-up final: novidades por e-mail, presente para o grupo, fazer de novo
const PRESENTE_LINK = 'https://playpartygames.com.br/?utm_source=retrozap&utm_medium=presente&utm_campaign=final';
function obrigado(){
  const ev = n => { try { if (typeof evento === 'function') evento(n); } catch {} };
  const antes = document.activeElement, m = document.createElement('div');
  m.className = 'patro'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true'); m.setAttribute('aria-labelledby','obT');
  m.innerHTML = '<div class="patro-box lemb pw" aria-live="polite"></div>';
  const caixa = m.firstElementChild;
  const fecha = () => { m.remove(); try { antes?.focus(); } catch {} };
  const denovo = () => { fecha(); state.arquivo = null; state.grupo = ''; state.bonusShown = false; state.noBonus = false; home(); };
  const principal = () => {
    caixa.innerHTML = `<button type="button" class="pw-x" id="obX" aria-label="Fechar">✕</button>
      <div class="lemb-ic" aria-hidden="true">🏆</div>
      <h2 id="obT" style="font-size:26px;margin:0">Valeu por usar o Retrozap!</h2>
      <p class="lemb-tx">Esperamos que o grupo tenha se divertido (e se ofendido só um pouquinho).</p>
      <form id="obForm" class="ob-form">
        <label class="pw-lb" for="obEm">📬 Deixe seu e-mail para receber as próximas novidades e ganhe um presente 🎁 para se divertir com o grupo 👀</label>
        <div class="ob-linha"><input id="obEm" class="pw-in" type="email" inputmode="email" autocomplete="email" placeholder="seu@email.com"><button type="submit" class="btn btn-main" id="obOk">Quero 🎁</button></div>
        <p class="small" id="obMsg" style="margin:0"></p>
      </form>
      <button type="button" class="btn btn-main ob-denovo" id="obNovo">🔁 Fazer a retrospectiva de outro grupo</button>`;
    caixa.querySelector('#obX').onclick = fecha;
    caixa.querySelector('#obNovo').onclick = denovo;
    caixa.querySelector('#obForm').onsubmit = async e => {
      e.preventDefault();
      const email = caixa.querySelector('#obEm').value.trim(), msg = caixa.querySelector('#obMsg');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){ msg.textContent = 'Confira o e-mail.'; return; }
      caixa.querySelector('#obOk').disabled = true;
      try {
        const r = await fetch('/api/ideias', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({tipo: 'novidades', texto: 'Quero receber as novidades e o presente do Retrozap', contato: email})});
        if (!r.ok) throw 0;
        msg.textContent = 'Pronto! Seu presente vai chegar no seu e-mail. 🎁'; ev('novidades_email');
      } catch { msg.textContent = 'Não consegui salvar agora. Tente de novo.'; caixa.querySelector('#obOk').disabled = false; }
    };
    caixa.querySelector('#obNovo').focus();
  };
  const presente = () => {
    ev('presente_visto');
    caixa.innerHTML = `<button type="button" class="pw-x" id="obX" aria-label="Fechar">✕</button>
      <h2 id="obT" style="font-size:24px;margin:0">🎁 Um presente para o grupo</h2>
      <a href="${PRESENTE_LINK}" target="_blank" rel="noopener sponsored" class="patro-img" id="obImg"><img src="${PATRO_IMG}" alt="Party Games: os melhores jogos em família, casais e amigos. Cupom RETROZAP."></a>
      <p class="lemb-tx">Oferta especial para se divertir com <b>amigos, família e casais</b>. Use o cupom:</p>
      <button type="button" class="pw-cod" id="obCupom" aria-label="Copiar o cupom RETROZAP">RETROZAP</button>
      <a href="${PRESENTE_LINK}" target="_blank" rel="noopener sponsored" class="btn btn-main" id="obIr" style="text-decoration:none">🎲 Ver os jogos da Party Games</a>
      <button type="button" class="pw-lk" id="obVolta">← Voltar</button>
      <p class="small" style="margin:0">Link de parceiro: o Retrozap pode receber uma comissão, sem custo extra para você.</p>`;
    caixa.querySelector('#obX').onclick = fecha;
    caixa.querySelector('#obVolta').onclick = principal;
    caixa.querySelector('#obCupom').onclick = e => { navigator.clipboard?.writeText('RETROZAP').then(() => { e.target.textContent = 'Copiado ✓'; }).catch(() => {}); };
    caixa.querySelectorAll('a').forEach(a => a.addEventListener('click', () => ev('presente_clique')));
    caixa.querySelector('#obIr').focus();
  };
  document.body.appendChild(m);
  m.addEventListener('keydown', e => { if (e.key === 'Escape') fecha(); });
  m.addEventListener('click', e => { if (e.target === m) fecha(); });
  principal();
}
function maisPremios(){
  anchor(true);
  ir('/bonus');
  pilha(maisPremios, 'bonus');
  setSteps(2);
  const b = state.bonus;
  view.innerHTML = `<section class="screen">
    ${state.sample ? `<span class="sample">${state.modo === 'casal' ? 'Casal de exemplo' : 'Grupo de exemplo'}</span>` : ''}
    <p class="eyebrow">Ato bônus</p>
    <div class="crown" style="font-size:72px;text-align:center" aria-hidden="true">🎁</div>
    <h1 style="font-size:34px;text-align:center">Ainda tem ${b.length} prêmios guardados</h1>
    <div class="chips" style="justify-content:center">${b.map(a => `<span class="chip">${a.e} ${a.n}</span>`).join('')}</div>
    <button class="btn btn-main" id="mais">🎁 Ver mais prêmios</button>
    <button class="btn btn-ghost" id="pular">Pular para os personagens →</button>
  </section>`;
  $('#mais').onclick = () => {
    state.bonusShown = true; state.noBonus = true;
    const antes = state.awards.filter(a => !a.honra), inicio = antes.length;
    state.awards = comHonra(antes.concat(b), state.data);
    state.idx = inicio; award();
  };
  $('#pular').onclick = () => { state.bonusShown = true; personagensTela(); };
  window.scrollTo(0,0);
}
// Cada jogo devolve a ação do botão amarelo fixo (sempre no mesmo lugar, embaixo da tela)
function podio(a, g){
  g.innerHTML = `<div class="podium" id="pd"></div>`;
  const order = [1,0,2], heights = {0:150,1:110,2:80};
  $('#pd').innerHTML = order.filter(i => a.ranked[i]).map(i => `<div class="pod p${i+1}" data-i="${i}"><span class="who">${esc(a.ranked[i].name)}</span><span class="v">${vfmt(a,a.ranked[i].v)}</span><div class="blk" style="height:${heights[i]}px">${i+1}º</div></div>`).join('');
  return {txt:'🥁 Revelar o pódio', fn: async () => {
    for (const i of [2,1,0]){ const el = g.querySelector(`[data-i="${i}"]`); if (el){ el.classList.add('up'); await sleep(700); } }
    showResult(a);
  }};
}
function palpite(a, g){
  const pool = a.ranked.slice(0,6).map(r=>r.name).sort(() => Math.random()-.5);
  g.innerHTML = `<p class="ask">Quem você acha que levou?</p><div class="opts">${pool.map(n=>`<button class="opt">${esc(n)}</button>`).join('')}</div>`;
  const marca = b => {
    const ok = b && b.textContent === a.winner.name;
    g.querySelectorAll('.opt').forEach(o => { o.disabled = true; if (o.textContent === a.winner.name) o.classList.add('right'); });
    if (b && !ok) b.classList.add('wrong');
    showResult(a, b ? `<p class="ask">${ok ? 'Acertou! Você conhece esse grupo. 🎯' : 'Errou! Ninguém esperava. Nem a gente. 😅'}</p>` : '');
  };
  g.querySelectorAll('.opt').forEach(b => b.onclick = () => marca(b));
  return {txt:'🥁 Revelar sem palpitar', fn: () => marca(null)};
}
function raspadinha(a, g){
  g.innerHTML = `<p class="ask">Raspe com o dedo para descobrir</p><div class="scratch" aria-hidden="true"><span class="under">${esc(a.winner.name)}</span><canvas></canvas></div>`;
  const cv = g.querySelector('canvas'), box = cv.getBoundingClientRect(), dpr = devicePixelRatio || 1;
  cv.width = box.width*dpr; cv.height = box.height*dpr;
  const c = cv.getContext('2d'); c.scale(dpr,dpr);
  c.fillStyle = CV().ouro; c.fillRect(0,0,box.width,box.height);
  c.fillStyle = corFundo(); c.font = '800 22px "Bricolage Grotesque", sans-serif'; c.textAlign = 'center';
  c.fillText('🪙 RASPE AQUI 🪙', box.width/2, box.height/2+8);
  let down = false, done = false, moves = 0;
  const finish = () => { if (done) return; done = true; cv.remove(); showResult(a); };
  const scratch = e => {
    if (!down || done) return; const r = cv.getBoundingClientRect();
    c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(e.clientX-r.left, e.clientY-r.top, 26, 0, 7); c.fill();
    if (++moves % 10 === 0){
      const px = c.getImageData(0,0,cv.width,cv.height).data; let clear = 0, tot = 0;
      for (let i=3;i<px.length;i+=64){ tot++; if (px[i]===0) clear++; }
      if (clear/tot > .5) finish();
    }
  };
  cv.addEventListener('pointerdown', e => { down = true; cv.setPointerCapture(e.pointerId); scratch(e); });
  cv.addEventListener('pointermove', scratch);
  cv.addEventListener('pointerup', () => down = false);
  return {txt:'🪙 Raspar tudo', fn: finish};
}
function chute(a, g){
  const max = Math.max(10, Math.ceil(a.total*2/10)*10), start = Math.round(max/4);
  g.innerHTML = `<div class="guess"><p class="ask">Chute: quantas ${a.u} o grupo inteiro mandou?</p>
    <output id="gv">${fmt(start)}</output><label class="small" for="rg">Arraste para chutar</label>
    <input type="range" id="rg" min="0" max="${max}" step="${Math.max(1,Math.round(max/200))}" value="${start}"></div>`;
  $('#rg').oninput = e => $('#gv').textContent = fmt(e.target.value);
  return {txt:'🎯 Chutar e revelar', fn: () => {
    const gv = +$('#rg').value, diff = Math.abs(gv - a.total);
    g.innerHTML = `<p class="ask">O grupo mandou <b style="color:var(--manga)">${fmt(a.total)}</b> ${a.u}. Você chutou ${fmt(gv)}.</p><p class="small">${diff <= a.total*.15 ? 'Na trave! Vidente do grupo 🔮' : 'Errou feio, mas errou com convicção.'}</p>`;
    showResult(a);
  }};
}
const vfmt = (a,v) => a.pct ? v + '%' : a.rate ? v.toLocaleString('pt-BR') : fmt(v);
const vunid = (a, v) => `${vfmt(a, v)} ${a.u}`;
const fatia = (a, v) => a.total ? Math.round(v/a.total*100) + '%' : '';
function detalhe(a, r){ return a.det && r.p ? a.det(r.p) : a.fatia && a.total ? `${fatia(a, r.v)} dos ${a.u}` : ''; }
function phrase(a){ return a.p.replaceAll('{w}', a.winner.name).replaceAll('{v}', vfmt(a, a.winner.v)).replaceAll('{s}', fatia(a, a.winner.v)); }
function showResult(a, extra=''){
  evento('premio_revelado', {premio: a.n});
  const res = $('#res'); res.hidden = false;
  res.innerHTML = `${extra}<div class="selo">${esc(a.winner.name)}</div>
    <p class="frase">${esc(phrase(a))}</p>
    <div class="top3">${a.ranked.slice(0,3).map((r,i)=>`<div><span>${['🥇','🥈','🥉'][i]} ${esc(r.name)}</span><span>${vunid(a, r.v)}${detalhe(a, r) ? `<small> · ${esc(detalhe(a, r))}</small>` : ''}</span></div>`).join('')}</div>
    <button class="btn btn-main" id="card" style="width:100%">📲 Gerar card para o grupo</button>`;
  $('#card').onclick = () => openCard(() => cardAward(a), convite('premio', a), `Card do prêmio ${a.n}: ${a.winner.name}, com ${vunid(a, a.winner.v)}`);
  const nx = $('#next'), rv = $('#rvl'); if (rv) rv.remove();
  if (nx){ nx.classList.replace('btn-ghost','btn-main'); nx.style.flex = '1'; nx.textContent = state.idx < state.awards.length-1 ? 'Próximo prêmio →' : 'Ir para o Gran Finale 🥁'; }
  confetti();
}
/* mecânicas */
function principais(){ const b = state.bonus || []; return state.awards.filter(a => !a.honra && !b.includes(a)).slice(0, 10); }
function campeao(){
  const by = {}; for (const a of state.awards.filter(a => !a.honra)) (by[a.winner.name] = by[a.winner.name] || []).push(a);
  return {by, champ: Object.entries(by).sort((x,y) => y[1].length - x[1].length)[0]};
}
function final(semFesta){
  anchor(true);
  ir('/destaque'); if (!semFesta) evento('final_visto', {modo: state.modo});
  pilha(() => final(), 'destaque');
  setSteps(3);
  const d = state.data, {champ} = campeao(), b = state.bonus || [], temBonus = b.length && !state.bonusShown;
  view.innerHTML = `<section class="screen final">
    ${state.sample ? `<span class="sample">${state.modo === 'casal' ? 'Casal de exemplo' : 'Grupo de exemplo'}</span>` : ''}
    <p class="eyebrow">Ato III · O destaque</p>
    <div class="crown" aria-hidden="true">👑</div>
    <h1 style="font-size:38px;text-align:center">O destaque do grupo é ${esc(champ[0])}</h1>
    <p class="lead" style="text-align:center">${champ[1].length} troféus: ${champ[1].map(a=>gtit(a.n, champ[0])).join(', ')}. Um verdadeiro monopólio.</p>
    <p class="ask" style="text-align:center;margin:6px 0 0">📲 Imagens para mandar no grupo e nos stories</p>
    <button class="btn btn-main" id="rs">✨ Resumo do grupo em imagem</button>
    ${destaquesBrasil().length ? '<button class="btn btn-main" id="rk">🏅 Ranking do grupo em imagem</button>' : ''}
    <button class="btn btn-main" id="t10">🏆 Top 10 categorias e ganhadores</button>
    ${temBonus ? `<div class="panel" style="text-align:center;margin-top:8px">
      <div style="font-size:52px" aria-hidden="true">🎁</div>
      <h2 style="font-size:26px;margin:0">Ainda tem ${b.length} prêmios guardados</h2>
      <div class="chips" style="justify-content:center">${b.map(a => `<span class="chip">${a.e} ${a.n}</span>`).join('')}</div>
      <button class="btn btn-main" id="mais">🎁 Ver os prêmios bônus</button>
      <button class="btn btn-ghost" id="pular">Pular para os personagens →</button>
    </div>` : '<button class="btn btn-main" id="vp">Ver os personagens do grupo →</button>'}
  </section>`;
  $('#rs').onclick = () => openCard(() => drawResumo(d), convite('resumo'), altResumo(d));
  $('#rk')?.addEventListener('click', () => openCard(() => drawComparacao(d), convite('ranking'), altComparacao()));
  $('#t10').onclick = () => openCard(() => drawTop10(), convite('resumo'), altTop10());
  if (temBonus){
    $('#mais').onclick = () => {
      state.bonusShown = true; state.noBonus = true;
      const antes = state.awards.filter(a => !a.honra), inicio = antes.length;
      state.awards = comHonra(antes.concat(b), d);
      state.idx = inicio; award();
    };
    $('#pular').onclick = () => { state.bonusShown = true; personagensTela(); };
  } else $('#vp').onclick = () => personagensTela();
  if (!semFesta){ confetti(); window.scrollTo(0,0); }
}
function personagensTela(){
  anchor(true);
  ir('/personagens'); evento('personagens_visto');
  pilha(personagensTela, 'final');
  setSteps(3);
  const d = state.data, {by} = campeao();
  view.innerHTML = `<section class="screen final">
    ${state.sample ? `<span class="sample">${state.modo === 'casal' ? 'Casal de exemplo' : 'Grupo de exemplo'}</span>` : ''}
    <p class="eyebrow">Final · Os personagens</p>
    <h1 style="font-size:36px;text-align:center">Os personagens do grupo</h1>
    <p class="lead">Os 5 que mais movimentam o grupo, e o que faz cada um ser quem é.</p>
    <div class="persos">${personagens(d, by).map(x => `<div class="perso">
      <div class="ph"><span class="em" aria-hidden="true">${x.e}</span><div><span class="small">${esc(x.nome)}</span><h3>${x.titulo}</h3></div></div>
      <p class="bio">${esc(x.texto)}</p>
      ${x.fala.length || x.emojis.length ? `<div class="fala"><span class="rot">Jeito de falar</span><div class="chips">${x.fala.map(f => `<span class="chip">${esc(f)}</span>`).join('')}${x.emojis.length ? `<span class="chip emo">${x.emojis.join(' ')}</span>` : ''}</div></div>` : ''}
      <ul>${x.fatos.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>`).join('')}</div>
    <button class="btn btn-ghost" id="vd">← Voltar às imagens do grupo</button>
    <a class="btn btn-ghost" id="conv" href="https://wa.me/?text=${encodeURIComponent(convite('amigos'))}" target="_blank" rel="noopener" style="text-align:center;text-decoration:none">📣 Chamar a galera para fazer o grupo deles</a>
    <button class="btn btn-ghost" id="again">Fazer outro grupo</button>
  </section>`;
  $('#vd').onclick = () => final(true);
  $('#again').onclick = () => { state.arquivo = null; state.grupo = ''; home(); };
  confetti(); window.scrollTo(0,0);
}
function altTop10(){ return `Troféus ${state.modo === 'casal' ? 'do casal' : 'do grupo'}${state.grupo ? ' ' + state.grupo : ''}: ${principais().map(a => `${gtit(a.n, a.winner.name)}: ${a.winner.name}`).join('; ')}.`; }
function drawTop10(){
  const W = 1080, H = 1920, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  const BR = '"Bricolage Grotesque", sans-serif', DM = '"DM Sans", sans-serif';
  fundo(c, W, H, 1100);
  c.textAlign = 'center';
  c.fillStyle = CV().ouro; c.font = `800 48px ${BR}`; c.fillText(state.modo === 'casal' ? 'retrozap 💕' : 'retrozap 🏆', W/2, 100);
  c.fillStyle = CV().sub; c.font = `700 30px ${DM}`; c.fillText(`${state.modo === 'casal' ? 'TROFÉUS DO CASAL' : 'TROFÉUS DO GRUPO'} · ${periodo()}`, W/2, 172, 980);
  c.fillStyle = CV().txt; caber(c, limpaTxt(state.grupo || nomePadrao()), W/2, 250, 940, 800, 60, BR);
  const ps = principais(), topo = 300, base = 1790, passo = (base - topo)/Math.max(ps.length, 1), alt = passo - 14;
  ps.forEach((a, i) => {
    const y = topo + i*passo;
    c.fillStyle = CV().caixa; c.beginPath(); c.roundRect(70, y, W-140, alt, 26); c.fill();
    c.textAlign = 'left';
    c.fillStyle = CV().ouro; c.font = `800 ${Math.round(alt*.34)}px ${BR}`; c.fillText(String(i + 1), 100, y + alt*.62);
    c.font = `${Math.round(alt*.46)}px serif`; c.fillStyle = CV().txt; c.fillText(a.e, 168, y + alt*.66);
    c.fillStyle = CV().sub; caber(c, gtit(a.n, a.winner.name).toUpperCase(), 270, y + alt*.42, 720, 700, Math.round(alt*.2), DM);
    c.fillStyle = CV().ouro; caber(c, a.winner.name, 270, y + alt*.8, 720, 800, Math.round(alt*.34), BR);
  });
  c.textAlign = 'center'; c.fillStyle = CV().txt; c.font = `700 36px ${DM}`; c.fillText(TAGLINE(), W/2, 1868);
  return cv.toDataURL('image/png');
}

function tempoLeitura(palavras){
  const min = palavras / 200; // leitura média de 200 palavras por minuto
  if (min < 60) return Math.max(1, Math.round(min)) + ' min';
  const h = min / 60; return h < 48 ? Math.round(h) + (Math.round(h) === 1 ? ' hora' : ' horas') : Math.round(h/24) + ' dias';
}
/* ---------- resumo do grupo (stories e quadrado) ---------- */
const nfmt1 = x => x < 10 ? x.toFixed(1).replace('.', ',').replace(',0', '') : fmt(Math.round(x));
function duracaoTxt(seg){
  const h = seg/3600;
  if (h >= 1.5) return fmt(Math.round(h)) + ' horas';
  if (h >= 1) return '1 hora';
  return Math.max(1, Math.round(seg/60)) + ' min';
}
// o momento mais marcante de 2026: o dia em que o grupo "parou" (volume acima do normal, gente falando, risadas, fotos)
const ANO_MOMENTO = 2026;
// temas que podem lembrar um ano difícil (saúde, perdas, conflitos): nunca viram "palavra do ano"
const SENSIVEL = /^(morte|morreu|morrer|falec|luto$|velori|enterro|sepult|hospital|internad|internac|cirurgi|cancer|quimio|tumor|doenc|doent|exame|medic|consulta|remedio|diagnost|tratament|terapi|psicolog|psiquiatr|depress|ansied|gravidez|aborto|uti$|covid|virus|dengue|demiss|demitid|desempreg|divorci|separac|brigamos|brigou|briguei|traic|policia|delegac|assalt|roubo$|roubad|acident|enfermeir|clinica|dor$|dores$|sangue|biopsia|ultrassom|fertil|embri)/;
const PALAVRAO_FORTE = /^(caralh|buceta|xoxot|piroc|cuzao|cuzinh|arrombad|fdp$|filhadaput|puta$|putas$|puto$|vadia|vagabund|viad|bicha$|bichas$|boiola|sapatao|traveco|macac|crioul|neguinh|paraiba$|retardad|mongol|aleijad|estupr|nazi|hitler|tesao|gozar|gozei|foder|fodid|fudid|transar|piranh|corno|otari|imbecil|idiot|babac|pica$|rola$|pau$|cu$)/;
const MOMENTOS_ATIVOS = false; // desligado: alto risco de errar o assunto ou destacar um dia difícil
const TEMAS_MOMENTO = [
  ['luto', null, /faleceu|falecimento|morreu|velorio|sepultamento|luto|meus sentimentos|descanse em paz/],
  ['bebe', ['👶', 'chegada de um bebê'], /nasceu|bebe|gravida|gravidez|maternidade|parto|cha de bebe/],
  ['casamento', ['💍', 'casamento à vista'], /casamento|casou|casar|noiv|alianca|pedido de casamento/],
  ['aniversario', ['🎂', 'aniversário'], /parabens|feliz aniversario|niver|muitos anos de vida|felicidades/],
  ['jogo', ['⚽', 'dia de jogo'], /\bgo+l+\b|campeao|titulo|jogo|partida|classificou|final do|juiz|penalti/],
  ['viagem', ['✈️', 'viagem ou rolê'], /viagem|aeroporto|praia|chegamos|voo|hotel|role|festa|show/],
  ['noticia', ['📰', 'notícia que agitou todo mundo'], /noticia|viu isso|urgente|saiu agora|ta sabendo|olha isso/]
];
function momentoMarcante(d){
  if (!MOMENTOS_ATIVOS) return (d._momentos = [], d._momento = null);
  if (d._momento !== undefined) return d._momento;
  const norm = x => x.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  const dias = {};
  for (const m of d.msgs){
    if (m.t.getFullYear() !== ANO_MOMENTO) continue;
    const k = m.t.getFullYear() + '-' + String(m.t.getMonth()+1).padStart(2,'0') + '-' + String(m.t.getDate()).padStart(2,'0');
    const x = dias[k] || (dias[k] = {k, t: m.t, n: 0, risos: 0, midia: 0, quem: {}, emo: {}, tema: {}});
    x.n++; x.quem[m.a] = (x.quem[m.a] || 0) + 1;
    const tipo = kind(m.b);
    if (tipo === 'photo' || tipo === 'media') x.midia++;
    if (tipo !== 'text') continue;
    if (RX.laugh.test(m.b)) x.risos++;
    for (const e of m.b.match(/\p{Extended_Pictographic}/gu) || []) x.emo[e] = (x.emo[e] || 0) + 1;
    const b = norm(m.b);
    for (const [k2, , rx] of TEMAS_MOMENTO) if (rx.test(b)) x.tema[k2] = (x.tema[k2] || 0) + 1;
  }
  const lista = Object.values(dias);
  if (lista.length < 10) return (d._momento = null); // pouca conversa em 2026 para comparar
  const ns = lista.map(x => x.n).sort((a,b) => a - b), normal = Math.max(1, ns[Math.floor(ns.length/2)]);
  const pessoas = Math.max(2, d.people.length);
  const cands = [];
  for (const x of lista){
    if ((x.tema.luto || 0) >= 2) continue; // dia triste não vira "momento marcante"
    const falaram = Object.keys(x.quem).length, vezes = x.n / normal;
    if (x.n < 20 || vezes < 2.5) continue;
    cands.push({...x, vezes, falaram, score: vezes * (0.6 + falaram/pessoas) + x.risos/Math.max(10, x.n) * 3 + Math.min(x.midia, 30)/10});
  }
  const monta = melhor => {
    const temaTop = Object.entries(melhor.tema).filter(([k]) => k !== 'luto').sort((a,b) => b[1] - a[1])[0];
    let tema = temaTop && temaTop[1] >= 3 ? TEMAS_MOMENTO.find(t => t[0] === temaTop[0])[1] : null;
    if (!tema) tema = melhor.risos / melhor.n > .2 ? ['😂', 'zoeira pura'] : melhor.midia >= 10 ? ['📸', 'chuva de fotos'] : ['💬', 'conversa que não acabava'];
    const quem = Object.entries(melhor.quem).sort((a,b) => b[1] - a[1])[0][0];
    const emoji = Object.entries(melhor.emo).sort((a,b) => b[1] - a[1])[0]?.[0] || '';
    const data = melhor.t.toLocaleDateString('pt-BR', {day: 'numeric', month: 'long'});
    return {data, n: melhor.n, vezes: Math.round(melhor.vezes), falaram: melhor.falaram, risos: melhor.risos, midia: melhor.midia, tema, quem, emoji};
  };
  d._momentos = cands.sort((a,b) => b.score - a.score).slice(0, 3).map(monta);
  return (d._momento = d._momentos[0] || null);
}

function livro(d){
  const pags = Math.max(1, Math.round(d.palavras/300)), hp = d.palavras/77000; // 300 palavras por página; Harry Potter e a Pedra Filosofal ≈ 77 mil palavras
  const comp = hp >= .95 ? `o mesmo que ${nfmt1(hp)} ${Math.round(hp*10) === 10 ? 'livro' : 'livros'} do Harry Potter`
    : d.palavras >= 15000 ? `o mesmo que ${nfmt1(d.palavras/15000)} vezes O Pequeno Príncipe`
    : `${fmt(d.palavras)} palavras escritas`;
  return {pags, txt: `Um livro de ${fmt(pags)} ${pags === 1 ? 'página' : 'páginas'}`, comp};
}
function audios(d){
  if (!d.audioN) return null;
  const exato = d.audioMedidos > 0, h = d.audioSeg/3600;
  const comp = h >= 20 ? `daria para ir e voltar de Lisboa de avião ${h >= 40 ? Math.floor(h/20) + ' vezes' : '1 vez'}`
    : h >= 2 ? `daria para ir de SP ao Rio de avião ${Math.floor(h)} vezes`
    : `o mesmo que ${Math.max(1, Math.round(d.audioSeg/210))} músicas seguidas`;
  return {txt: `${exato ? '' : '≈ '}${duracaoTxt(d.audioSeg)} de áudio`, comp: `${fmt(d.audioN)} áudios · ${comp}`};
}
function frase(d){
  if (d.lema && d.lema[1] >= 3) return {txt: `“${d.lema[0]}”`, sub: `a frase mais dita · ${fmt(d.lema[1])} vezes`};
  if (d.temas.length) return {txt: d.temas.join(' · '), sub: 'os assuntos do grupo'};
  return null;
}
function vibe(d){
  const s = k => d.people.reduce((a,p) => a + (p[k]||0), 0), tot = Math.max(1, d.total), tx = Math.max(1, s('text')), m = state.modo;
  const night = s('night')/tot, after = s('after')/tot, laugh = s('laugh')/tx, fds = (d.days[0] + d.days[6])/tot;
  if (s('furo') >= 3 && s('org') >= 3 && s('furo') >= s('org')*.4) return {txt:'Planejadores de Rolês Cancelados', e:'🙅'};
  if (m === 'trabalho' && after > .35) return laugh > .08 ? {txt:'Procrastinação Produtiva', e:'🛋️'} : {txt:'Networking do Boteco', e:'🍻'};
  const cand = [
    ['Fofoca', s('fofoca')/tx/.008, '🗣️'], ['Caos', laugh/.12, '🤪'], ['Figurinhas', s('sticker')/tot/.08, '🖼️'],
    ['Áudios de 5 Minutos', s('audio')/tot/.05, '🎙️'], ['Bom Dia e Correntes', s('bomdia')/tx/.04, '☀️'], ['Memes', s('link')/tx/.04, '📲'],
    ['Indicações e Desapegos', (s('indica') + s('vende'))/tx/.02, '🏘️'], ['Palavrões', s('palavrao')/tx/.03, '🤬'],
    ['Parabéns', s('parabens')/tx/.02, '🎂'], ['Reuniões', s('reuniao')/tx/.03, '📅'], ['Amor', s('amo')/tx/.02, '💖']
  ].sort((a,b) => b[1] - a[1]);
  const pad = {casal:['Amor e Memes','💕'], amigos:['Zoeira','😎'], familia:['Amor e Correntes','💖'], trabalho:['Prazos e Cafezinho','☕'], comunidade:['Avisos e Vizinhança','🏘️']}[m] || ['Zoeira','😎'];
  let txt = cand[0][1] >= 1 ? cand[0][0] : pad[0], e = cand[0][1] >= 1 ? cand[0][2] : pad[1];
  if (cand[0][1] >= 1 && cand[1][1] >= .8 && !/ e /.test(txt) && !/ e /.test(cand[1][0])) txt += ' e ' + cand[1][0];
  const pico = d.hours.indexOf(Math.max(...d.hours));
  if (night > .06) { txt += ' Madrugada Adentro'; e = '🌙'; }
  else if (pico >= 5 && pico <= 9) { txt += ' Antes do Café'; e = '☀️'; }
  else if (fds > .45) { txt += ' de Fim de Semana'; e = '🎉'; }
  return {txt, e};
}
function destaques(d){
  const ps = d.people.filter(p => p.count > 0), out = [], dono = ps[0];
  out.push({e:'🎤', t:'Fala Mais', n:dono.name, v:`${Math.round(dono.count/Math.max(1,d.total)*100)}% das mensagens`});
  const voz = [...ps].sort((a,b) => (b.audioMax - a.audioMax) || (b.audio - a.audio))[0];
  if (voz && voz.audioMax) out.push({e:'🎙️', t:'Podcast Humano', n:voz.name, v:`áudio de ${Math.floor(voz.audioMax/60)}min ${String(Math.round(voz.audioMax%60)).padStart(2,'0')}s`});
  else if (voz && voz.audio) out.push({e:'🎙️', t:'Podcast Humano', n:voz.name, v:`${fmt(voz.audio)} áudios`});
  const fant = ps[ps.length - 1];
  if (ps.length >= 3 && fant !== dono) out.push({e:'👻', t:'O Fantasma', n:fant.name, v:`só ${fmt(fant.count)} ${fant.count === 1 ? 'mensagem' : 'mensagens'}`});
  return out;
}
const corFundo = () => state.modo === 'casal' ? '#FFEAF1' : '#1A0B2E';
// cores dos cards: noite + ouro no grupo; rosa claro + pink no casal
const CV = () => state.modo === 'casal'
  ? {txt:'#3B1230', ouro:'#D81B60', sub:'#8E5B74', caixa:'rgba(255,255,255,.82)', brilho:a => `rgba(232,51,109,${a})`, A:'#E8336D', B:'#8E44D9'}
  : {txt:'#FFF4E0', ouro:'#FFC23C', sub:'#B9A8CC', caixa:'rgba(61,26,92,.88)', brilho:a => `rgba(255,194,60,${a})`, A:'#FFC23C', B:'#2EC4F1'};
function coracao(c, x, y, t){ c.beginPath(); c.moveTo(x, y + t*.35); c.bezierCurveTo(x, y - t*.3, x - t, y - t*.3, x - t, y + t*.25); c.bezierCurveTo(x - t, y + t*.75, x, y + t*1.1, x, y + t*1.35); c.bezierCurveTo(x, y + t*1.1, x + t, y + t*.75, x + t, y + t*.25); c.bezierCurveTo(x + t, y - t*.3, x, y - t*.3, x, y + t*.35); c.fill(); }
// período que o card cobre: a conversa inteira ou só 2026
const mesAno = t => `${MESES[t.getMonth()].slice(0,3)}/${t.getFullYear()}`;
const periodo = () => { const d = state.data; return d ? `DESDE O INÍCIO · ${mesAno(d.start).toUpperCase()} → ${mesAno(d.end).toUpperCase()}` : ''; };
const periodo26 = () => { const d = state.data; return d && d.end.getFullYear() === ANO_MOMENTO ? `SÓ ${ANO_MOMENTO} · JAN → ${MESES[d.end.getMonth()].slice(0,3).toUpperCase()}` : `SÓ ${ANO_MOMENTO}`; };
function fundo(c, W, H, raio){
  c.fillStyle = corFundo(); c.fillRect(0,0,W,H);
  const g = c.createRadialGradient(W/2,0,60,W/2,0,raio); g.addColorStop(0,CV().brilho(.30)); g.addColorStop(1,CV().brilho(0)); c.fillStyle = g; c.fillRect(0,0,W,H);
  const cols = ['#FFC23C','#FF4F8B','#FF7A59','#2EC4F1','#A98BFF']; let sd = 7;
  const casal = state.modo === 'casal', rosas = ['#E8336D','#FF8FB1','#F06292','#C2185B','#FFB3C8'];
  for (let i=0;i<Math.round(H/(casal ? 30 : 22));i++){ sd = (sd*9301+49297)%233280; const r = sd/233280; c.save(); c.translate(r*W, (i*211)%H);
    if (casal){ c.globalAlpha = .28; c.fillStyle = rosas[i%5]; c.rotate((r-.5)*.8); coracao(c, 0, 0, 10 + (i%4)*5); }
    else { c.fillStyle = cols[i%5]; c.globalAlpha = .5; c.rotate(r*6); c.fillRect(-8,-3,16,6); }
    c.restore(); }
  c.globalAlpha = 1; c.fillStyle = MODOS[state.modo].c; c.fillRect(0,0,W,16);
}
// texto que encolhe até caber na largura
// remove marcas invisíveis de direção (vêm no nome do arquivo exportado pelo iPhone e desalinham o texto)
function limpaTxt(s){ return String(s || '').replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '').replace(/[​‌‎‏‪-‮⁦-⁩﻿]/g, '').replace(/\s+/g, ' ').trim(); }
// texto que encolhe até caber na largura, posicionado à mão (o centro automático falha no Safari com emoji)
function caber(c, txt, x, y, maxW, peso, tam, fam){
  txt = limpaTxt(txt);
  let t = tam; do { c.font = `${peso} ${t}px ${fam}`; t -= 2; } while (c.measureText(txt).width > maxW && t > 22);
  const w = Math.min(c.measureText(txt).width, maxW), al = c.textAlign;
  const x0 = al === 'center' ? x - w/2 : (al === 'right' || al === 'end') ? x - w : x;
  c.save(); c.direction = 'ltr'; c.textAlign = 'left'; c.fillText(txt, x0, y, maxW); c.restore();
}
function drawResumo(d){
  const W = 1080, H = 1920, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  const BR = '"Bricolage Grotesque", sans-serif', DM = '"DM Sans", sans-serif';
  fundo(c, W, H, 1100);
  const v = vibe(d), lv = livro(d), au = audios(d), fr = frase(d), desde = d.start.toLocaleDateString('pt-BR', {month:'short', year:'numeric'}).replace('.', '');
  c.textAlign = 'center';
  c.fillStyle = CV().ouro; c.font = `800 48px ${BR}`; c.fillText(state.modo === 'casal' ? 'retrozap 💕' : 'retrozap 🏆', W/2, 100);
  c.fillStyle = CV().sub; c.font = `700 30px ${DM}`; c.fillText(`${state.modo === 'casal' ? 'RESUMO DO CASAL' : 'RESUMO DO GRUPO'} · ${periodo()}`, W/2, 175, 980);
  c.fillStyle = CV().ouro;
  const nomeT = limpaTxt(state.grupo || nomePadrao());
  let tam = 84; c.font = `800 ${tam}px ${BR}`;
  while (tam > 50 && linhasDe(c, nomeT, 960) > 2){ tam -= 4; c.font = `800 ${tam}px ${BR}`; }
  const nl = Math.min(2, wrap(c, nomeT, W/2, 285, 960, Math.round(tam * 1.1)));
  const linhas = resumoInicio(d).map(x => { const t = x.top && topDe(x.top);
    return [x.e, x.big, x.quem ? `${x.quem.replace(/^Quem mais manda: |^Quem manda mais: /, 'quem mais manda: ')}` : t ? `${x.sub} · Top ${t}% ${quemBrasil()}` : x.sub]; });
  const topo = 285 + (nl - 1)*92 + 75, base = 1490, passo = Math.min(215, (base - topo)/linhas.length), alt = passo - 14;
  let y = topo;
  for (const [ic, num, rot] of linhas){
    c.fillStyle = CV().caixa; c.beginPath(); c.roundRect(70, y, W-140, alt, 28); c.fill();
    c.textAlign = 'left'; c.font = `${Math.round(alt*.48)}px serif`; c.fillStyle = CV().txt; c.fillText(ic, 105, y + alt*.66);
    c.fillStyle = CV().ouro; caber(c, num, 225, y + alt*.52, 760, 800, Math.round(alt*.38), BR);
    c.fillStyle = CV().sub; caber(c, rot, 225, y + alt*.84, 760, 500, Math.round(alt*.22), DM);
    y += passo;
  }
  // mensagens ano a ano
  const L = porAno(d), mx = Math.max(1, ...L.map(x => x.n)), gx = 90, gw = W - 180, bw = Math.min(110, gw/L.length - 16), y0 = 1560, gh = 200;
  c.textAlign = 'center'; c.fillStyle = CV().sub; c.font = `700 28px ${DM}`; c.fillText('MENSAGENS ANO A ANO', W/2, y0 - 20);
  L.forEach((x, i) => {
    const cx = gx + (i + .5)*gw/L.length, h = Math.max(6, x.n/mx*gh), by = y0 + 30 + gh - h;
    c.fillStyle = x.y === ANO_MOMENTO ? CV().ouro : CV().brilho(.55); c.beginPath(); c.roundRect(cx - bw/2, by, bw, h, 12); c.fill();
    c.fillStyle = CV().txt; c.font = `700 ${L.length > 7 ? 20 : 24}px ${DM}`; c.fillText(curto(x.n), cx, by - 10);
    c.fillStyle = CV().sub; c.font = `700 ${L.length > 7 ? 20 : 24}px ${DM}`; c.fillText(String(x.y), cx, y0 + gh + 62);
  });
  c.fillStyle = CV().txt; c.font = `700 36px ${DM}`; c.fillText(TAGLINE(), W/2, 1868);
  return cv.toDataURL('image/png');
}
function drawResumoQ(d){
  const W = 1080, H = 1080, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  const BR = '"Bricolage Grotesque", sans-serif', DM = '"DM Sans", sans-serif';
  fundo(c, W, H, 800);
  const v = vibe(d), lv = livro(d), fr = frase(d), desde = d.start.toLocaleDateString('pt-BR', {month:'short', year:'numeric'}).replace('.', '');
  c.textAlign = 'center';
  c.fillStyle = CV().ouro; c.font = `800 40px ${BR}`; c.fillText(state.modo === 'casal' ? 'retrozap 💕' : 'retrozap 🏆', W/2, 76);
  c.fillStyle = CV().sub; c.font = `700 24px ${DM}`; c.fillText(`${state.modo === 'casal' ? 'RESUMO DO CASAL' : 'RESUMO DO GRUPO'} · ${periodo()}`, W/2, 130, 1000);
  c.fillStyle = CV().ouro; caber(c, state.grupo || nomePadrao(), W/2, 215, 960, 800, 64, BR);
  const tiles = [
    ['💬', fmt(d.total), `mensagens desde ${desde}`],
    ['📚', `${fmt(lv.pags)} páginas`, /Harry|Príncipe/.test(lv.comp) ? lv.comp : 'se o grupo fosse um livro'],
    ['⏱️', tempoLeitura(d.palavras), 'para ler tudo, sem parar'],
    momentoMarcante(d) && ['🌟', momentoMarcante(d).data, `o dia mais marcante de ${ANO_MOMENTO} · ${momentoMarcante(d).vezes}× um dia normal`],
    fr ? ['🗣️', fr.txt, fr.sub] : ['😂', fmt(d.people.reduce((s,p) => s + p.laugh, 0)), 'mensagens com risada']
  ];
  tiles.forEach(([ic, num, rot], i) => {
    const x = 70 + (i % 2)*480, y = 280 + Math.floor(i/2)*345, w = 460, h = 325, cx = x + w/2;
    c.fillStyle = CV().caixa; c.beginPath(); c.roundRect(x, y, w, h, 30); c.fill();
    c.fillStyle = CV().txt; c.font = '68px serif'; c.fillText(ic, cx, y + 95);
    c.fillStyle = CV().ouro; caber(c, num, cx, y + 190, w - 40, 800, 56, BR);
    c.fillStyle = CV().sub; c.font = `500 27px ${DM}`; wrap(c, rot, cx, y + 245, w - 50, 34);
  });
  c.fillStyle = CV().txt; c.font = `700 30px ${DM}`; c.fillText(TAGLINE(), W/2, 1048);
  return cv.toDataURL('image/png');
}

/* ---------- títulos com (a): "O Locutor(a)", "Rei(nha) do Parabéns" ---------- */
function gtit(t){
  return t.replace(/(^|\s)Rei(?!\(nha\))(?=\s|$)/g, '$1Rei(nha)')
    .replace(/(Locutor|Escritor|Organizador|Madrugador|Risonho|Figurinheiro|Fotógrafo|Agradecido|Arrependido|Síndico|Objetivo|Corporativo|Dono|Tio|Romântico)(?!\p{L}|\(a\))/gu, '$1(a)');
}

// Card de spoiler: as categorias em disputa, para o grupo palpitar antes da revelação
function drawSpoiler(lista){
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  const BR = '"Bricolage Grotesque", sans-serif', DM = '"DM Sans", sans-serif';
  fundo(c, W, H, 900);
  c.textAlign = 'center';
  c.fillStyle = CV().ouro; c.font = `800 46px ${BR}`; c.fillText(state.modo === 'casal' ? 'retrozap 💕' : 'retrozap 🏆', W/2, 92);
  if (state.grupo){ c.fillStyle = CV().txt; caber(c, state.grupo, W/2, 152, 940, 700, 40, DM); }
  c.font = '120px serif'; c.fillText('👀', W/2, 300);
  c.fillStyle = CV().ouro; c.font = `800 110px ${BR}`; c.fillText('SPOILER!', W/2, 418);
  c.fillStyle = CV().sub; c.font = `700 30px ${DM}`; c.fillText(`OS ${lista.length} TROFÉUS EM DISPUTA`, W/2, 476);
  const linhas = Math.ceil(lista.length/2), alt = Math.min(118, 620/linhas), y0 = 510;
  lista.forEach((a, i) => {
    const col = i % 2, lin = Math.floor(i/2), x = 70 + col*480, y = y0 + lin*alt;
    c.fillStyle = CV().caixa; c.beginPath(); c.roundRect(x, y, 460, alt - 14, 22); c.fill();
    c.textAlign = 'left'; c.font = `${Math.round(alt*.42)}px serif`; c.fillStyle = CV().txt; c.fillText(a.e, x + 22, y + alt*.6);
    c.fillStyle = CV().txt; caber(c, a.n, x + 22 + alt*.6, y + alt*.56, 460 - 44 - alt*.6, 800, 30, BR);
  });
  c.textAlign = 'center';
  const yb = y0 + linhas*alt + 52;
  c.fillStyle = CV().txt; c.font = `700 38px ${DM}`; c.fillText('Quem leva cada um? Mandem os palpites 👇', W/2, yb, 960);
  c.fillStyle = CV().sub; c.font = `500 30px ${DM}`; c.fillText('Todo grupo tem uma história.', W/2, H - 92);
  c.fillStyle = CV().ouro; c.font = `700 32px ${DM}`; c.fillText('Descubra a do seu em www.retrozap.com.br', W/2, H - 46);
  return cv.toDataURL('image/png');
}

/* ---------- comparação com outros grupos (só números anônimos; no site com servidor) ---------- */
async function comparar(d){
  state.comp = null; state.compD = null;
  // a comparação usa só as mensagens de 2026 (grupo de 10 anos não leva vantagem); a antiguidade usa o histórico todo
  const m26 = d.msgs.filter(m => m.t.getFullYear() === ANO_MOMENTO);
  if (m26.length >= 20) try { state.compD = await analyze(m26); } catch {}
  state.compAnos = [];
  if (state.compD){ const ult = m26.reduce((a, m) => m.t > a ? m.t : a, m26[0].t);
    for (let y = ANO_MOMENTO - 1; y >= ANO_MOMENTO - 3; y--){
      const lim = new Date(y, ult.getMonth(), ult.getDate(), 23, 59, 59), my = d.msgs.filter(m => m.t.getFullYear() === y && m.t <= lim);
      if (my.length >= 50) try { const a = await analyze(my); a.ano = y; state.compAnos.push(a); } catch {} } }
  // grupo de exemplo e prévia: média simulada a partir dos próprios números (só para ver o layout)
  const simula = top => { const nums = state.compD ? numerosDoGrupo(state.compD) : {}; const f = [.72, 1.25, .9, 1.4, .8, 1.1];
    return {pronto:true, n:1000, exemplo:true, escopo:'tipo', top, media: Object.fromEntries(Object.entries(nums).map(([k, v], i) => [k, Math.round(v * f[i % f.length] * 100)/100]))}; };
  if (state.comparar === false) return;
  // grupo de exemplo: comparação simulada, e nada é enviado ao banco
  if (state.sample){ state.comp = {...simula({}), top:{risadas:3, palavrao:2, furos:4, por_dia:6, madrugada:7, recorde:9, audios:12, total:4, figurinhas:38, textao:60, apagadas:41, dias:30, bomdia:70, parabens:55, fora:80, amor:3, coracoes:5, hist_total:7, hist_audios:11}}; return; }
  if (!state.compD){ if (AMBIENTE_TESTE) state.comp = {pronto:true, n:120, exemplo:true, escopo:'tipo', top:{dias:45}}; return; }
  try {
    const base = `${+d.start}|${d.total}|${d.people.length}|${state.modo}`;
    const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(base)))].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
    const r = await fetch('/api/stats', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({id: h, modo: state.modo, base: String(ANO_MOMENTO), ...numerosDoGrupo(state.compD), dias: Math.max(1, Math.round((d.end - d.start)/864e5) + 1), hist_total: d.total, hist_audios: d.people.reduce((t, p) => t + p.audio, 0)})});
    const j = await r.json(); if (j && j.pronto) state.comp = j;
  } catch {}
  // prévia (sem servidor): ranking simulado só para ver o layout
  if (!state.comp && AMBIENTE_TESTE) state.comp = simula({total:8, audios:22, figurinhas:15, risadas:31, por_dia:6, madrugada:40, amor:3, coracoes:5, recorde:12, dias:45, hist_total:9, hist_audios:14});
}
// os únicos dados que saem do celular: contas do grupo inteiro, sem nomes nem textos
function numerosDoGrupo(d){
  const s = k => d.people.reduce((a,p) => a + (p[k] || 0), 0), tot = Math.max(1, d.total), tx = Math.max(1, s('text'));
  const dias = Math.max(1, Math.round((d.end - d.start)/864e5) + 1), r2 = x => Math.round(x*100)/100;
  return {total: d.total, por_dia: r2(d.total/dias), recorde: d.recorde ? d.recorde[1] : 1, audios: s('audio'), figurinhas: s('sticker'),
    membros: Math.max(2, d.people.length), dias, risadas: r2(s('laugh')/tx*100), madrugada: r2(s('night')/tot*100), fora: r2(s('after')/tot*100),
    palavrao: r2(s('palavrao')/tx*1000), furos: r2(s('furo')/tx*1000), bomdia: r2(s('bomdia')/tx*1000), parabens: r2(s('parabens')/tx*1000),
    apagadas: r2(s('deleted')/tot*1000), textao: r2(s('chars')/tx), amor: r2(s('teamo')/tx*1000), coracoes: r2(s('coracao')/tot*100)};
}
// as comparações, com texto engraçado; m = tipos de grupo em que a métrica aparece
const RANKING = [
  {k:'risadas', e:'😂', t:'mais risonhos'},
  {k:'por_dia', e:'💬', t:'mais tagarelas'},
  {k:'madrugada', e:'🦉', t:'mais insones'},
  {k:'palavrao', e:'🤬', t:'mais boca-suja', m:['amigos','familia','comunidade']},
  {k:'furos', e:'🙅', t:'em rolê cancelado', m:['amigos']},
  {k:'bomdia', e:'☀️', t:'em bom dia', m:['familia','comunidade']},
  {k:'parabens', e:'🎂', t:'em parabéns', m:['familia']},
  {k:'fora', e:'🌙', t:'em mensagem fora do expediente', m:['trabalho']},
  {k:'textao', e:'📜', t:'em textão'},
  {k:'audios', e:'🎙️', t:'em podcast não solicitado'},
  {k:'figurinhas', e:'🖼️', t:'em figurinha'},
  {k:'recorde', e:'🔥', t:'em dia de caos'},
  {k:'apagadas', e:'🗑️', t:'em mensagens apagadas'},
  {k:'total', e:'📨', t:'em mensagens'},
  {k:'amor', e:'💘', t:'em declarações de amor', m:['casal']},
  {k:'coracoes', e:'❤️', t:'em coraçõezinhos', m:['casal']},
  {k:'dias', e:'📅', t:'', antigo:true}
];
// as melhores posições do grupo (até 6), da melhor para a pior
function destaquesBrasil(){
  const c = state.comp; if (!c) return [];
  const tipo = {casal:'de casais', amigos:'de amigos', familia:'de família', trabalho:'de trabalho', comunidade:'de comunidade'}[state.modo];
  const sub = (state.modo === 'casal' ? `entre os casais do Retrozap em ${ANO_MOMENTO}${c.exemplo ? ' (simulação)' : ''}` : `entre os grupos ${c.escopo === 'todos' ? '' : tipo + ' '}no Retrozap em ${ANO_MOMENTO}${c.exemplo ? ' (simulação do exemplo)' : ''}`) + (c.estimado ? ' · estimativa inicial' : '');
  const dTot = state.data, d = state.compD || state.data, soma = k => d ? d.people.reduce((t,p) => t + (p[k] || 0), 0) : 0;
  const dias = d ? Math.max(1, Math.round((d.end - d.start)/864e5) + 1) : 1, txs = Math.max(1, soma('text')), diasTot = dTot ? Math.max(1, Math.round((dTot.end - dTot.start)/864e5) + 1) : 1;
  const NUM = {total: () => `${fmt(d.total)} mensagens`, audios: () => `${fmt(soma('audio'))} áudios`, figurinhas: () => `${fmt(soma('sticker'))} figurinhas`,
    risadas: () => `${fmt(soma('laugh'))} mensagens com risada`, palavrao: () => `${fmt(soma('palavrao'))} palavrões`,
    por_dia: () => `${(d.total/dias).toLocaleString('pt-BR', {maximumFractionDigits: 1})} mensagens por dia`, madrugada: () => `${fmt(soma('night'))} mensagens de madrugada`,
    furos: () => `${fmt(soma('furo'))} furos`, bomdia: () => `${fmt(soma('bomdia'))} bons dias`, parabens: () => `${fmt(soma('parabens'))} parabéns`,
    fora: () => `${fmt(soma('after'))} mensagens fora do expediente`, textao: () => `${fmt(Math.round(soma('chars')/txs))} caracteres por mensagem`,
    recorde: () => d.recorde ? `${fmt(d.recorde[1])} mensagens num dia só` : '', apagadas: () => `${fmt(soma('deleted'))} mensagens apagadas`, dias: () => `${fmt(diasTot)} dias de conversa`, amor: () => `${fmt(soma('teamo'))} declarações de amor`, coracoes: () => `${fmt(soma('coracao'))} coraçõezinhos`};
  const BASICOS = ['total', 'audios', 'figurinhas'];
  const lista = RANKING.filter(x => (!x.m || x.m.includes(state.modo)) && c.top[x.k] != null && c.top[x.k] <= 90)
    .map(x => ({k:x.k, e:x.e, top:c.top[x.k], big: x.antigo ? `Mais antigo que ${100 - c.top[x.k]}%` : `Top ${c.top[x.k]}%`, rot: x.antigo ? 'dos grupos' : x.t,
      txt: x.antigo ? `Mais antigo que ${100 - c.top[x.k]}% dos grupos` : `Top ${c.top[x.k]}% ${x.t}`, num: d && NUM[x.k] ? NUM[x.k]() : '', sub}));
  // primeiro os básicos (mensagens, áudios, figurinhas), depois o que mais destaca
  return [...BASICOS.map(k => lista.find(x => x.k === k)).filter(Boolean), ...lista.filter(x => !BASICOS.includes(x.k)).sort((a,b) => a.top - b.top)].slice(0, 8);
}
// imagem 2: nosso grupo no ranking
function drawComparacao(d){
  const W = 1080, H = 1920, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  const BR = '"Bricolage Grotesque", sans-serif', DM = '"DM Sans", sans-serif', lista = destaquesBrasil();
  const tipo = {casal:'DE CASAIS', amigos:'DE AMIGOS', familia:'DE FAMÍLIA', trabalho:'DE TRABALHO', comunidade:'DE COMUNIDADE'}[state.modo];
  fundo(c, W, H, 1100);
  c.textAlign = 'center';
  c.fillStyle = CV().ouro; c.font = `800 48px ${BR}`; c.fillText(state.modo === 'casal' ? 'retrozap 💕' : 'retrozap 🏆', W/2, 100);
  if (state.grupo){ c.fillStyle = CV().txt; caber(c, state.grupo, W/2, 178, 960, 800, 62, BR); }
  c.font = '120px serif'; c.fillText('🏅', W/2, 340);
  c.fillStyle = CV().ouro; c.font = `800 78px ${BR}`; c.fillText(state.modo === 'casal' ? 'NÓS DOIS' : 'NOSSO GRUPO', W/2, 450); c.fillText('NO RANKING', W/2, 535);
  c.fillStyle = CV().sub; c.font = `700 30px ${DM}`; c.fillText(`${state.modo === 'casal' ? 'ENTRE OS CASAIS DO RETROZAP' : state.comp?.escopo === 'todos' ? 'ENTRE OS GRUPOS DO RETROZAP' : `ENTRE OS GRUPOS ${tipo} DO RETROZAP`} · ${periodo26()}`, W/2, 595, 980);
  const y0 = 650, passo = Math.min(190, 1040/Math.max(1, lista.length)), alt = passo - 18;
  lista.forEach((x, i) => {
    const y = y0 + i*passo;
    c.fillStyle = CV().caixa; c.beginPath(); c.roundRect(70, y, W-140, alt, 30); c.fill();
    c.textAlign = 'left'; c.font = `${Math.round(alt*.45)}px serif`; c.fillStyle = CV().txt; c.fillText(x.e, 105, y + alt*.64);
    c.fillStyle = CV().ouro; caber(c, x.big, 240, y + alt*.5, 740, 800, Math.round(alt*.38), BR);
    c.fillStyle = CV().txt; caber(c, x.num ? `${x.rot} · ${x.num}` : x.rot, 240, y + alt*.84, 740, 700, Math.round(alt*.22), DM);
  });
  c.textAlign = 'center';
  if (state.comp?.exemplo){ c.fillStyle = CV().sub; c.font = `500 26px ${DM}`; c.fillText('simulação do grupo de exemplo', W/2, 1745); }
  c.fillStyle = CV().sub; c.font = `500 30px ${DM}`; c.fillText('E o seu grupo, em que posição fica?', W/2, 1800);
  c.fillStyle = CV().txt; c.font = `700 36px ${DM}`; c.fillText(TAGLINE(), W/2, 1868);
  return cv.toDataURL('image/png');
}

const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
// card "Nosso 2026": o ano em números (vs anos anteriores e Top X% do Brasil), frase e gíria do ano e, nos grupos, o top 3 destaques
function nosso2026(){
  const d = state.compD; if (!d) return {nums: [], txt: [], ds: []};
  const nums = nums26(4), txt = [], as = assunto26();
  if (as) txt.push({e: as.e, big: as.txt, sub: `o assunto mais falado · ${fmt(as.n)} mensagens`});
  const ms = Array(12).fill(0); for (const m of d.msgs) ms[m.t.getMonth()]++;
  const mi = ms.indexOf(Math.max(...ms)); if (ms[mi] > 0) txt.push({e:'📈', big: MESES[mi], sub: `o mês mais agitado · ${fmt(ms[mi])} mensagens`});
  if (d.lema && d.lema[1] >= 3) txt.push({e:'🗣️', big:`“${d.lema[0]}”`, sub:`a frase mais dita · ${fmt(d.lema[1])} vezes`});
  if (d.giria && d.giria[1] >= 3) txt.push({e:'🤙', big:`“${d.giria[0]}”`, sub:`a gíria oficial · ${fmt(d.giria[1])} vezes`});
  return {nums, txt, ds: destaques26('sumico')};
}
function altNosso2026(){ const {nums, txt, ds} = nosso2026();
  return `Nosso ${ANO_MOMENTO}${state.grupo ? ', ' + state.grupo : ''}: ` + [...nums.map(x => `${fmt(x.n)} ${x.t}${x.vs ? ', ' + x.vs : ''}${x.top ? `, Top ${x.top}% ${quemBrasil()}` : ''}`),
    ...txt.map(x => `${x.sub.split(' · ')[0]}: ${x.big}`), ...ds.map(x => `${x.t}: ${x.n}`)].join('; ') + '.'; }
function drawNosso2026(){
  const W = 1080, H = 1920, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  const BR = '"Bricolage Grotesque", sans-serif', DM = '"DM Sans", sans-serif', K = CV(), casal = state.modo === 'casal', {nums, txt, ds} = nosso2026();
  fundo(c, W, H, 1000); c.textAlign = 'center';
  c.fillStyle = K.ouro; c.font = `800 46px ${BR}`; c.fillText(casal ? 'retrozap 💕' : 'retrozap 🏆', W/2, 96);
  c.fillStyle = K.txt; caber(c, limpaTxt(state.grupo || nomePadrao()), W/2, 172, 960, 800, 54, BR);
  c.fillStyle = K.ouro; c.font = `800 100px ${BR}`; c.fillText(casal ? `O NOSSO ${ANO_MOMENTO}` : `NOSSO ${ANO_MOMENTO}`, W/2, 290, 980);
  c.fillStyle = K.sub; caber(c, `${periodo26()} · VS ANOS ANTERIORES E ${casal ? 'OS CASAIS' : 'OS GRUPOS'} DO BRASIL`, W/2, 340, 980, 700, 26, DM);
  // números em grade 2 × 2 (sempre começa por mensagens)
  const tw = (W - 100 - 16)/2, th = 262, y0 = 380;
  nums.forEach((x, i) => {
    const tx = 50 + (i % 2)*(tw + 16), ty = y0 + Math.floor(i/2)*(th + 16);
    c.fillStyle = K.caixa; c.beginPath(); c.roundRect(tx, ty, tw, th, 30); c.fill();
    c.textAlign = 'left'; c.font = '54px serif'; c.fillStyle = K.txt; c.fillText(x.e, tx + 26, ty + 74);
    c.fillStyle = K.ouro; caber(c, fmt(x.n), tx + 100, ty + 78, tw - 124, 800, 68, BR);
    c.fillStyle = K.txt; caber(c, x.t, tx + 28, ty + 124, tw - 56, 700, 30, DM);
    let py = ty + 148;
    const selo = (t, fill, cor) => { let fs = 24; c.font = `800 ${fs}px ${DM}`; let w = c.measureText(t).width + 36; while (w > tw - 56 && fs > 16){ fs -= 2; c.font = `800 ${fs}px ${DM}`; w = c.measureText(t).width + 36; }
      c.fillStyle = fill; c.beginPath(); c.roundRect(tx + 28, py, w, 44, 22); c.fill(); c.fillStyle = cor; c.fillText(t, tx + 46, py + 30); py += 54; };
    if (x.vs) selo(x.vs, corTend(x), '#FFFFFF');
    if (x.top) selo(`🏅 Top ${x.top}% ${quemBrasil()}`, K.txt, casal ? '#FFFFFF' : '#1A0B2E');
    c.textAlign = 'center';
  });
  let y = y0 + Math.ceil(nums.length/2)*(th + 16) + 4;
  const fim = ds.length ? 1572 : 1820, passo = Math.min(200, (fim - y)/Math.max(1, txt.length)), h = passo - 16;
  for (const x of txt){
    c.fillStyle = K.caixa; c.beginPath(); c.roundRect(50, y, W - 100, h, 30); c.fill();
    c.textAlign = 'left'; c.font = `${Math.round(h*.42)}px serif`; c.fillStyle = K.txt; c.fillText(x.e, 80, y + h*.64);
    c.fillStyle = K.ouro; caber(c, x.big, 190, y + h*.5, 800, 800, Math.round(h*.34), BR);
    c.fillStyle = K.sub; caber(c, x.sub, 192, y + h*.82, 800, 600, Math.round(h*.17), DM);
    c.textAlign = 'center'; y += passo;
  }
  if (ds.length){
    const bw = (W - 100 - (ds.length - 1)*16)/ds.length;
    c.textAlign = 'center'; c.fillStyle = K.sub; c.font = `700 28px ${DM}`; c.fillText(`TOP ${ds.length} DESTAQUES DE ${ANO_MOMENTO}`, W/2, 1610);
    ds.forEach((x, i) => {
      const bx = 50 + i*(bw + 16), cx = bx + bw/2;
      c.fillStyle = K.brilho(.14); c.beginPath(); c.roundRect(bx, 1630, bw, 196, 26); c.fill();
      c.fillStyle = K.txt; c.font = '50px serif'; c.fillText(x.e, cx, 1690);
      c.fillStyle = K.sub; caber(c, x.t.replace(` de ${ANO_MOMENTO}`, '').toUpperCase(), cx, 1726, bw - 24, 700, 22, DM);
      c.fillStyle = K.ouro; caber(c, x.n, cx, 1768, bw - 24, 800, 36, BR);
      c.fillStyle = K.txt; caber(c, x.v, cx, 1802, bw - 24, 500, 20, DM);
    });
  }
  c.fillStyle = K.txt; c.font = `700 30px ${DM}`; c.fillText(TAGLINE(), W/2, 1880);
  return cv.toDataURL('image/png');
}

// card do casal: quem manda mais o quê (sem rótulo de gênero, só os nomes)
function categoriasCasal(d){
  const src = state.compD && state.compD.people.length ? state.compD : d, achar = n => src.people.find(p => p.name === n) || {};
  const a = achar(d.people[0].name), b = achar(d.people[1].name);
  const L = [['💬','Mensagens','count'],['🎙️','Áudios','audio'],['💘','Declarações de amor','teamo'],['🌅','Puxou o papo do dia','first'],['🗑️','Apagou mensagem','deleted']]
    .map(([e, t, k]) => ({e, t, a: a[k]||0, b: b[k]||0}));
  return {msg: L[0], cats: L};
}
function altCasal(d){ const [a, b] = d.people, {cats} = categoriasCasal(d);
  return `${a.name} contra ${b.name}: ` + cats.map(x => `${x.t}: ${a.name} ${x.fmt ? x.fmt(x.a) : x.a}, ${b.name} ${x.fmt ? x.fmt(x.b) : x.b}`).join('; ') + '.'; }
function drawCasal(d){
  const W = 1080, H = 1920, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  const BR = '"Bricolage Grotesque", sans-serif', DM = '"DM Sans", sans-serif', K = CV(), [a, b] = d.people, {cats} = categoriasCasal(d);
  fundo(c, W, H, 1000); c.textAlign = 'center';
  c.fillStyle = K.ouro; c.font = `800 46px ${BR}`; c.fillText('retrozap 💕', W/2, 96);
  c.fillStyle = K.sub; c.font = `700 26px ${DM}`; c.fillText(`UM CONTRA O OUTRO · ${state.compD ? periodo26() : periodo()}`, W/2, 146, 980);
  // os dois frente a frente
  c.fillStyle = K.A; c.beginPath(); c.roundRect(50, 190, 430, 170, 40); c.fill();
  c.fillStyle = K.B; c.beginPath(); c.roundRect(W - 480, 190, 430, 170, 40); c.fill();
  c.fillStyle = '#FFFFFF'; caber(c, a.name, 265, 300, 380, 800, 64, BR); caber(c, b.name, W - 265, 300, 380, 800, 64, BR);
  c.fillStyle = K.ouro; coracao(c, W/2, 222, 52); c.fillStyle = '#FFFFFF'; c.font = `800 30px ${BR}`; c.fillText('VS', W/2, 268);
  let ga = 0, gb = 0, y = 410;
  const passo = Math.min(250, 1330 / cats.length);
  for (const x of cats){
    const ta = x.menor ? x.a < x.b : x.a > x.b, tb = x.menor ? x.b < x.a : x.b > x.a; if (ta) ga++; if (tb) gb++;
    const f = x.fmt || fmt, h = passo - 20;
    c.fillStyle = K.caixa; c.beginPath(); c.roundRect(50, y, W - 100, h, 32); c.fill();
    c.textAlign = 'center'; c.fillStyle = K.txt; caber(c, `${x.e} ${x.t}`, W/2, y + 46, 700, 700, 30, DM);
    if (x.menor){ c.fillStyle = K.sub; caber(c, 'quem responde mais rápido ganha', W/2, y + 78, 700, 600, 22, DM); }
    c.font = `800 ${Math.round(h*.27)}px ${BR}`;
    c.textAlign = 'left'; c.fillStyle = K.A; c.fillText(f(x.a) + (ta ? ' 👑' : ''), 90, y + h*.72);
    c.textAlign = 'right'; c.fillStyle = K.B; c.fillText((tb ? '👑 ' : '') + f(x.b), W - 90, y + h*.72);
    c.textAlign = 'center';
    // barrinha: quanto cada um tem do total (no tempo de resposta, o mais rápido fica com a parte maior)
    const va = x.menor ? x.b : x.a, vb = x.menor ? x.a : x.b, t = Math.max(1, va + vb), bx = 370, bw = W - 740, wa = bw * va / t;
    c.save(); c.beginPath(); c.roundRect(bx, y + h*.58, bw, 22, 11); c.clip(); c.fillStyle = K.A; c.fillRect(bx, y + h*.58, wa, 22); c.fillStyle = K.B; c.fillRect(bx + wa, y + h*.58, bw - wa, 22); c.restore();
    y += passo;
  }
  // placar
  c.fillStyle = K.txt; c.font = `800 52px ${BR}`;
  c.fillText(ga === gb ? `Empate: ${ga} a ${gb} 💞` : `Placar: ${limpaTxt(ga > gb ? a.name : b.name).split(' ')[0]} ${Math.max(ga, gb)} a ${Math.min(ga, gb)}`, W/2, y + 60, 980);
  c.fillStyle = K.txt; c.font = `700 34px ${DM}`; c.fillText(TAGLINE(), W/2, 1880);
  return cv.toDataURL('image/png');
}

// 2026 em números, comparado com a média dos casais do Retrozap (mesmas unidades enviadas para o ranking)
function quemMedia(){ if (state.modo === 'casal') return 'dos casais'; const t = {amigos:'de amigos', familia:'de família', trabalho:'de trabalho', comunidade:'de comunidade'}[state.modo]; return state.comp?.escopo === 'tipo' && t ? `dos grupos ${t}` : 'dos grupos'; }
function numeros2026(){
  const d = state.compD; if (!d) return [];
  const s = k => d.people.reduce((t, p) => t + (p[k] || 0), 0), top = state.comp?.top || {};
  const anos = state.compAnos || [], CAMPO = {total:'count', amor:'teamo', coracoes:'coracao', risadas:'laugh', audios:'audio', figurinhas:'sticker', madrugada:'night', bomdia:'bomdia', fotos:'photo', palavrao:'palavrao', apagadas:'deleted'};
  const rotAnos = anos.length === 1 ? `${anos[0].ano}` : 'anos anteriores';
  const L = {total:['💬', d.total, 'mensagens em 2026'], audios:['🎧', s('audio'), 'áudios'], risadas:['😂', s('laugh'), 'risadas'], amor:['💘', s('teamo'), 'declarações de amor'],
    coracoes:['❤️', s('coracao'), 'corações e beijinhos'], figurinhas:['🖼️', s('sticker'), 'figurinhas'], madrugada:['🦉', s('night'), 'mensagens de madrugada'], bomdia:['☀️', s('bomdia'), 'bons dias'],
    fotos:['📸', s('photo'), 'fotos e vídeos'], palavrao:['🤬', s('palavrao'), 'palavrões'], apagadas:['🗑️', s('deleted'), 'mensagens apagadas']};
  // sempre começa por mensagens
  const ordem = state.modo === 'casal' ? ['total', 'audios', 'risadas', 'amor', 'coracoes', 'figurinhas', 'fotos', 'apagadas'] : ['total', 'audios', 'risadas', 'figurinhas', 'fotos', 'palavrao', 'madrugada', 'bomdia', 'apagadas'];
  return ordem.map(k => [k, ...L[k]]).filter(x => x[2] > 0).map(([k, e, n, t]) => {
    // comparação com os próprios anos anteriores (mesmo período), não com os outros grupos
    let vs = null, up = null, r = null;
    if (anos.length){ const f = CAMPO[k], ant = anos.reduce((t, a) => t + a.people.reduce((u, p) => u + (p[f] || 0), 0), 0) / anos.length;
      if (ant >= 5){ r = n/ant - 1; up = r >= .05 ? true : r <= -.05 ? false : null; vs = up === true ? `+${Math.round(r*100)}% vs ${rotAnos}` : up === false ? `−${Math.round(-r*100)}% vs ${rotAnos}` : `= ${rotAnos}`; } }
    return {e, n, t, k, vs, up, r, top: top[k] && (top[k] <= 50 || k === 'total') ? top[k] : null};
  });
}
const num26 = k => numeros2026().find(x => x.k === k) || null;
// os números de destaque do ano: mensagens sempre primeiro, depois o que tiver volume (áudios, risadas, figurinhas...)
const nums26 = (max = 4) => numeros2026().filter(x => x.k === 'total' || x.n >= 3).slice(0, max);
// assunto mais falado em 2026 (temas do dia a dia; nada sensível)
const EMO_TEMA = {comida:'🍔', futebol:'⚽', 'rolê e festa':'🎉', 'cerveja e drinks':'🍻', trabalho:'💼', viagem:'✈️', 'séries e filmes':'🎬', bichos:'🐶', 'filhos e família':'👨‍👩‍👧', 'treino e saúde':'🏋️', dinheiro:'💸', 'política':'🗳️'};
function assunto26(){
  const d = state.compD || state.data; if (!d) return null; const t = {};
  for (const p of d.people) for (const [k, n] of Object.entries(p.tema || {})) t[k] = (t[k]||0) + n;
  const x = Object.entries(t).sort((a, b) => b[1] - a[1])[0];
  return x && x[1] >= 5 ? {txt: x[0], n: x[1], e: EMO_TEMA[x[0]] || '💭'} : null;
}
// Top 3 destaques de 2026: tagarela, revelação (quem mais cresceu vs 2025, fora o tagarela) e fantasma/sumiço
function destaques26(ultimo){
  const D = state.data, d = state.compD; if (!d || state.modo === 'casal' || d.people.length < 3) return [];
  const A = ANO_MOMENTO, B = A - 1, pct = x => `${Math.round(x*100)}%`, out = [], tag = d.people[0];
  out.push({e:'🗣️', t:'Tagarela de 2026', n: tag.name, v: `${fmt(tag.count)} mensagens · ${pct(tag.count/Math.max(1, d.total))} do grupo`});
  const m26 = d.total, m25 = D.msgs.filter(m => m.t.getFullYear() === B).length;
  const s = D.people.map(p => ({n: p.name, a: (p.y[A]||0)/Math.max(1, m26), b: (p.y[B]||0)/Math.max(1, m25), c: p.y[A]||0}));
  if (m25 >= 100){ const rev = s.filter(x => x.n !== tag.name && x.c >= 20).sort((x, y) => (y.a - y.b) - (x.a - x.b))[0];
    if (rev && rev.a - rev.b > .01) out.push({e:'🚀', t:'Revelação de 2026', n: rev.n, v: `de ${pct(rev.b)} para ${pct(rev.a)} das mensagens`}); }
  if (ultimo === 'sumico' && m25 >= 100){ const sum = s.filter(x => x.n !== tag.name && x.b >= .03 && !out.some(o => o.n === x.n)).sort((x, y) => (x.a - x.b) - (y.a - y.b))[0];
    if (sum && sum.b - sum.a > .01){ out.push({e:'🫥', t:'Sumiço de 2026', n: sum.n, v: `de ${pct(sum.b)} para ${pct(sum.a)} das mensagens`}); return out; } }
  const fant = [...d.people].reverse().find(p => p.name !== tag.name && !out.some(o => o.n === p.name));
  if (fant) out.push({e:'👻', t: ultimo === 'sumico' ? 'Sumiço de 2026' : 'Fantasma de 2026', n: fant.name, v: `só ${fmt(fant.count)} ${fant.count === 1 ? 'mensagem' : 'mensagens'} em 2026`});
  return out;
}
const ate26 = () => { const d = state.compD; return d ? `até ${d.end.getDate()} de ${MESES[d.end.getMonth()]}` : ''; };
// linhas da imagem: melhor resultado primeiro (Top X% bom, depois quem mais cresceu)
const COR_SOBE = '#15803D', COR_DESCE = '#B91C1C', COR_IGUAL = '#6B5B7B';
const corTend = x => x.up === true ? COR_SOBE : x.up === false ? COR_DESCE : COR_IGUAL;
const ordem26 = () => numeros2026();
function altRanking2026(){ return `${ANO_MOMENTO} em números${state.grupo ? ' de ' + state.grupo : ''}: ${ordem26().map(x => `${fmt(x.n)} ${x.t}${x.vs ? ', ' + x.vs : ''}${x.top ? `, Top ${x.top}% ${quemMedia()}` : ''}`).join('; ')}.`; }
function drawRanking2026(){
  const W = 1080, H = 1920, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  const BR = '"Bricolage Grotesque", sans-serif', DM = '"DM Sans", sans-serif', K = CV(), casal = state.modo === 'casal';
  const lista = ordem26(), txtPill = casal ? '#FFFFFF' : '#1A0B2E', ant = destaquesBrasil().find(x => x.k === 'dias');
  fundo(c, W, H, 1000); c.textAlign = 'center';
  c.fillStyle = K.ouro; c.font = `800 46px ${BR}`; c.fillText(casal ? 'retrozap 💕' : 'retrozap 🏆', W/2, 96);
  c.fillStyle = K.txt; caber(c, limpaTxt(state.grupo || nomePadrao()), W/2, 175, 960, 800, 56, BR);
  c.fillStyle = K.ouro; c.font = `800 92px ${BR}`; c.fillText(`${ANO_MOMENTO} EM NÚMEROS`, W/2, 300, 980);
  c.fillStyle = K.sub; caber(c, `${periodo26()} · VS ANOS ANTERIORES E ${casal ? 'OS CASAIS' : 'OS GRUPOS'} DO RETROZAP`, W/2, 352, 980, 700, 26, DM);
  const fim = ant ? 1700 : 1810, passo = Math.min(230, (fim - 400) / Math.max(1, lista.length)), h = passo - 20;
  lista.forEach((x, i) => {
    const y = 400 + i*passo;
    c.fillStyle = K.caixa; c.beginPath(); c.roundRect(50, y, W - 100, h, 32); c.fill();
    c.textAlign = 'left'; c.font = `${Math.round(h*.38)}px serif`; c.fillText(x.e, 80, y + h*.55);
    c.fillStyle = K.ouro; c.font = `800 ${Math.round(h*.32)}px ${BR}`; c.fillText(fmt(x.n), 210, y + h*.4);
    c.fillStyle = K.txt; c.font = `700 ${Math.round(h*.14)}px ${DM}`; c.fillText(x.t, 212, y + h*.6);
    let px = 210; const py = y + h*.7, ph = h*.22;
    const selo = (txt, fill, cor) => { c.font = `800 ${Math.round(h*.12)}px ${DM}`; const tw = c.measureText(txt).width + 40; c.fillStyle = fill; c.beginPath(); c.roundRect(px, py, tw, ph, ph/2); c.fill(); c.fillStyle = cor; c.fillText(txt, px + 20, py + ph*.7); px += tw + 12; };
    if (x.vs) selo(x.vs, corTend(x), '#FFFFFF');
    if (x.top) selo(`🏅 Top ${x.top}% do Brasil`, K.txt, casal ? '#FFFFFF' : '#1A0B2E');
    c.textAlign = 'center';
  });
  if (ant){ c.fillStyle = K.caixa; c.beginPath(); c.roundRect(50, 1720, W - 100, 100, 32); c.fill(); c.fillStyle = K.txt; caber(c, `📅 ${ant.txt} do Retrozap · ${ant.num}`, W/2, 1785, 940, 700, 32, DM); }
  c.fillStyle = K.txt; c.font = `700 30px ${DM}`; c.fillText(TAGLINE(), W/2, 1880);
  return cv.toDataURL('image/png');
}

// ---------- vídeo de ~30 s para os stories (casal e grupo) ----------
let VID_DUR = 30; // recalculado por cenasVideo (cerca de 30 s)
function cenasVideo(d){
  const casal = state.modo === 'casal' && d.people.length === 2, [a, b] = d.people, soma = k => d.people.reduce((t, p) => t + (p[k] || 0), 0);
  let num = nums26(4);
  if (!num.length) num = (casal ? [['💬', soma('count'), 'mensagens trocadas'], ['🎧', soma('audio'), 'áudios'], ['😂', soma('laugh'), 'risadas'], ['💘', soma('teamo'), 'declarações de amor']]
    : [['💬', soma('count'), 'mensagens'], ['🎧', soma('audio'), 'áudios'], ['😂', soma('laugh'), 'risadas'], ['🖼️', soma('sticker'), 'figurinhas']])
    .filter(x => x[1] > 0).map(([e, n, t]) => ({e, n, t}));
  const hl = casal ? [] : destaques26('fantasma').map(x => ({e: x.e, t: x.t, nome: x.n, linha: x.v}));
  const cats = principais().filter(x => x.winner).slice(0, 6).map(x => ({e: x.e, t: gtit(x.n, x.winner.name), nome: x.winner.name, linha: vunid(x, x.winner.v)}));
  const duelo = casal ? categoriasCasal(d).cats : [];
  const as = assunto26();
  // linha do tempo (~30 s): abertura, números, assunto, troféus (top 6), destaques (grupo) ou um contra o outro (casal), fim
  const T = {num: 2.6}; T.as = T.num + 1.2 + num.length*1.4; T.cat = T.as + (as ? 2 : 0); T.hl = T.cat + cats.length*1.8; T.fim = T.hl + (casal ? 5 : hl.length*2);
  VID_DUR = Math.round((T.fim + 2.6)*10)/10;
  return {casal, a, b, num, hl, cats, duelo, as, T, so26: !!state.compD, grupo: limpaTxt(state.grupo || nomePadrao()), q: quemMedia()};
}
const d_pessoas = cz => state.data ? state.data.people.length : 0;
function frameVideo(c, t, cz){
  const W = 1080, H = 1920, K = CV(), BR = '"Bricolage Grotesque", sans-serif', DM = '"DM Sans", sans-serif', T = cz.T;
  const cl = x => Math.max(0, Math.min(1, x)), ease = x => 1 - Math.pow(1 - cl(x), 3), ent = (t0, dur = .6) => ease((t - t0)/dur);
  fundo(c, W, H, 1000); c.textAlign = 'center'; c.globalAlpha = 1;
  c.fillStyle = K.ouro; c.font = `800 46px ${BR}`; c.fillText(cz.casal ? 'retrozap 💕' : 'retrozap 🏆', W/2, 110);
  const nomeA = limpaTxt(cz.a.name), nomeB = limpaTxt(cz.b?.name || ''), txtPill = cz.casal ? '#FFFFFF' : '#1A0B2E';
  const cena = (t0, t1, f) => { if (t < t0 || t >= t1) return; const fade = Math.min(cl((t - t0)/.35), cl((t1 - t)/.3)); c.save(); c.globalAlpha = fade; f(t - t0); c.restore(); };
  // 1. abertura
  if (!cz.casal) cena(0, T.num, () => {
    const p = (1 + .05*Math.sin(t*5)) * ent(0, .8); c.save(); c.translate(W/2, 660); c.scale(p, p); c.font = '320px serif'; c.fillText(MODOS[state.modo]?.e || '🏆', 0, 110); c.restore();
    c.fillStyle = K.txt; caber(c, cz.grupo, W/2, 1080 + 60*(1 - ent(.4, .8)), 940, 800, 100, BR);
    c.save(); c.globalAlpha *= ent(1); c.fillStyle = K.ouro; caber(c, cz.so26 ? `O NOSSO ${ANO_MOMENTO}` : 'A RETROSPECTIVA DO GRUPO', W/2, 1190, 900, 800, 52, BR);
    c.fillStyle = K.sub; caber(c, `${d_pessoas(cz)} pessoas · ${MODOS[state.modo]?.n || 'grupo'}`, W/2, 1260, 900, 700, 34, DM); c.restore();
  });
  if (cz.casal) cena(0, T.num, () => {
    const p = 1 + .06*Math.sin(t*5); c.fillStyle = K.A; c.save(); c.translate(W/2, 640); c.scale(p*ent(0, .8), p*ent(0, .8)); coracao(c, 0, -150, 150); c.restore();
    const e = ent(.4, .8);
    c.fillStyle = K.A; caber(c, nomeA, W/2 - 600*(1 - e), 1020, 900, 800, 96, BR);
    c.fillStyle = K.ouro; c.font = `800 70px ${BR}`; c.fillText('&', W/2, 1120);
    c.fillStyle = K.B; caber(c, nomeB, W/2 + 600*(1 - e), 1230, 900, 800, 96, BR);
    c.save(); c.globalAlpha *= ent(1); c.fillStyle = K.sub; caber(c, cz.so26 ? `O NOSSO ${ANO_MOMENTO}` : 'A NOSSA RETROSPECTIVA', W/2, 1360, 900, 700, 36, DM); c.restore();
  });
  // 2. o ano em números: vs anos anteriores e ranking do Brasil
  cena(T.num, T.as, u => {
    c.fillStyle = K.txt; c.font = `800 80px ${BR}`; c.fillText(cz.so26 ? `${ANO_MOMENTO} EM NÚMEROS` : 'EM NÚMEROS', W/2, 270);
    if (cz.num.some(x => x.vs || x.top)){ c.fillStyle = K.sub; caber(c, `vs anos anteriores e ${cz.casal ? 'os casais' : 'os grupos'} do Brasil`, W/2, 325, 900, 700, 32, DM); }
    cz.num.forEach((x, i) => {
      const t0 = .3 + i*.7, e = ent(T.num + t0), y = 380 + i*290 + 60*(1 - e);
      c.save(); c.globalAlpha *= e; c.textAlign = 'left';
      c.fillStyle = K.caixa; c.beginPath(); c.roundRect(70, y, W - 140, 262, 36); c.fill();
      c.font = '84px serif'; c.fillText(x.e, 105, y + 120);
      c.fillStyle = K.ouro; c.font = `800 86px ${BR}`; c.fillText(fmt(Math.round(x.n * ease((u - t0)/1.4))), 235, y + 100);
      c.fillStyle = K.txt; c.font = `700 36px ${DM}`; c.fillText(x.t, 237, y + 150);
      let px = 235; const sel = [x.vs && [x.vs, corTend(x), '#FFFFFF'], x.top && [`🏅 Top ${x.top}% ${quemBrasil()}`, K.A, txtPill]].filter(Boolean);
      for (const [txt, fill, cor] of sel){ let fs = 30; c.font = `800 ${fs}px ${DM}`; let tw = c.measureText(txt).width + 50;
        while (px + tw > W - 90 && fs > 18){ fs -= 2; c.font = `800 ${fs}px ${DM}`; tw = c.measureText(txt).width + 50; }
        c.fillStyle = fill; c.beginPath(); c.roundRect(px, y + 178, tw, 58, 29); c.fill(); c.fillStyle = cor; c.fillText(txt, px + 25, y + 218); px += tw + 12; }
      c.restore(); c.textAlign = 'center';
    });
  });
  // 3. assunto mais falado
  if (cz.as) cena(T.as, T.cat, () => {
    c.fillStyle = K.sub; c.font = `700 34px ${DM}`; c.fillText(`O ASSUNTO MAIS FALADO${cz.so26 ? ' DE ' + ANO_MOMENTO : ''}`, W/2, 330);
    c.save(); c.translate(W/2, 640); const sc = .6 + .4*ent(T.as); c.scale(sc, sc); c.font = '260px serif'; c.fillText(cz.as.e, 0, 90); c.restore();
    c.fillStyle = K.ouro; caber(c, cz.as.txt.toUpperCase(), W/2, 960, 940, 800, 110, BR);
    c.fillStyle = K.txt; caber(c, `${fmt(cz.as.n)} mensagens sobre isso`, W/2, 1050, 900, 700, 40, DM);
  });
  // 4. troféus: top 6 categorias (1,8 s cada)
  cz.cats.forEach((x, i) => {
    const t0 = T.cat + i*1.8, cor = !cz.casal ? K.ouro : x.nome === cz.a.name ? K.A : K.B;
    cena(t0, t0 + 1.8, () => {
      c.fillStyle = K.sub; c.font = `700 34px ${DM}`; c.fillText(`TROFÉU ${i + 1} DE ${cz.cats.length}`, W/2, 330);
      c.save(); c.translate(W/2, 640); const sc = .6 + .4*ent(t0, .4); c.scale(sc, sc); c.font = '260px serif'; c.fillText(x.e, 0, 90); c.restore();
      c.fillStyle = K.txt; caber(c, x.t.toUpperCase(), W/2, 900, 940, 800, 74, BR);
      c.save(); c.globalAlpha *= ent(t0 + .25, .4);
      c.fillStyle = cor; c.beginPath(); c.roundRect(170, 980, W - 340, 190, 48); c.fill();
      c.fillStyle = txtPill; caber(c, limpaTxt(x.nome), W/2, 1110, 680, 800, 96, BR);
      c.fillStyle = K.txt; caber(c, x.linha, W/2, 1260, 900, 700, 40, DM); c.restore();
    });
  });
  // 5a. grupo: top 3 destaques de 2026 (2 s cada)
  cz.hl.forEach((x, i) => {
    const t0 = T.hl + i*2;
    cena(t0, t0 + 2, u => {
      c.fillStyle = K.sub; c.font = `700 34px ${DM}`; c.fillText(`DESTAQUE ${i + 1} DE ${cz.hl.length} · ${ANO_MOMENTO}`, W/2, 330);
      c.save(); c.translate(W/2, 640); const sc = .6 + .4*ent(t0); c.scale(sc, sc); c.font = '260px serif'; c.fillText(x.e, 0, 90); c.restore();
      c.fillStyle = K.txt; caber(c, x.t.toUpperCase(), W/2, 900, 940, 800, 74, BR);
      c.save(); c.globalAlpha *= ent(t0 + .35);
      c.fillStyle = K.ouro; c.beginPath(); c.roundRect(170, 980, W - 340, 190, 48); c.fill();
      c.fillStyle = txtPill; caber(c, limpaTxt(x.nome), W/2, 1110, 680, 800, 96, BR);
      c.fillStyle = K.txt; caber(c, x.linha, W/2, 1260, 900, 700, 40, DM); c.restore();
    });
  });
  // 5b. casal: um contra o outro
  if (cz.casal) cena(T.hl, T.fim, u => {
    c.fillStyle = K.txt; c.font = `800 72px ${BR}`; c.fillText('UM CONTRA O OUTRO', W/2, 270, 980);
    c.fillStyle = K.A; caber(c, nomeA, W/2 - 230, 360, 400, 800, 52, BR); c.fillStyle = K.B; caber(c, nomeB, W/2 + 230, 360, 400, 800, 52, BR);
    cz.duelo.forEach((x, i) => {
      const e = ent(T.hl + .3 + i*.5), y = 420 + i*250 + 40*(1 - e), ta = x.a > x.b, tb = x.b > x.a;
      c.save(); c.globalAlpha *= e;
      c.fillStyle = K.caixa; c.beginPath(); c.roundRect(70, y, W - 140, 220, 36); c.fill();
      c.fillStyle = K.txt; caber(c, `${x.e} ${x.t}`, W/2, y + 62, 800, 700, 38, DM);
      c.font = `800 72px ${BR}`; c.textAlign = 'left'; c.fillStyle = K.A; c.fillText(fmt(x.a) + (ta ? ' 👑' : ''), 110, y + 170);
      c.textAlign = 'right'; c.fillStyle = K.B; c.fillText((tb ? '👑 ' : '') + fmt(x.b), W - 110, y + 170); c.textAlign = 'center';
      c.restore();
    });
  });
  // 5. fim
  cena(T.fim, VID_DUR + .01, () => {
    const p = 1 + .06*Math.sin(t*6); c.save(); c.translate(W/2, 760); c.scale(p, p);
    if (cz.casal){ c.fillStyle = K.A; coracao(c, 0, -120, 120); } else { c.font = '220px serif'; c.fillText('🏆', 0, 70); } c.restore();
    c.fillStyle = K.txt; c.font = `800 70px ${BR}`; c.fillText(cz.casal ? 'E vocês?' : 'E o seu grupo?', W/2, 1060);
    c.fillStyle = K.sub; caber(c, cz.casal ? 'Façam a retrospectiva do casal' : 'Faça a retrospectiva do seu grupo', W/2, 1130, 900, 700, 40, DM);
    c.fillStyle = K.ouro; c.font = `800 64px ${BR}`; c.fillText('retrozap.com.br', W/2, 1260);
  });
  c.fillStyle = K.txt; c.font = `700 30px ${DM}`; c.fillText(TAGLINE(), W/2, 1870);
}
// prévia do vídeo tocando na página (metade da resolução, pausa fora da tela e com pop-up aberto)
function tocaPrevia(cv, d){
  const c = cv.getContext('2d'), cz = cenasVideo(d); let ini = performance.now(), vis = true, parado = 0;
  c.setTransform(cv.width/1080, 0, 0, cv.height/1920, 0, 0);
  try { new IntersectionObserver(es => { vis = es.some(e => e.isIntersecting); }).observe(cv); } catch {}
  const loop = now => {
    if (!cv.isConnected) return;
    const pausa = !vis || document.hidden || document.querySelector('.patro');
    if (pausa){ parado = parado || now; } else { if (parado){ ini += now - parado; parado = 0; } frameVideo(c, ((now - ini)/1000) % VID_DUR, cz); }
    requestAnimationFrame(loop);
  };
  document.fonts.ready.then(() => requestAnimationFrame(loop));
}
const videoSuportado = () => typeof MediaRecorder !== 'undefined' && !!HTMLCanvasElement.prototype.captureStream;
async function gravarVideo(d, prog){
  await document.fonts.ready;
  const cz = cenasVideo(d), cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920; const c = cv.getContext('2d');
  const tipo = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find(x => MediaRecorder.isTypeSupported?.(x)) || '';
  frameVideo(c, 0, cz);
  const rec = new MediaRecorder(cv.captureStream(30), tipo ? {mimeType: tipo, videoBitsPerSecond: 6e6} : undefined), partes = [];
  rec.ondataavailable = e => e.data.size && partes.push(e.data);
  const pronto = new Promise(r => rec.onstop = r);
  rec.start(250); const ini = performance.now();
  await new Promise(fim => { const passo = () => { const t = (performance.now() - ini)/1000; frameVideo(c, Math.min(t, VID_DUR), cz); prog?.(t);
    if (t < VID_DUR + .05) requestAnimationFrame(passo); else fim(); }; requestAnimationFrame(passo); });
  rec.stop(); await pronto;
  const mime = (rec.mimeType || tipo || 'video/webm').split(';')[0];
  return {blob: new Blob(partes, {type: mime}), ext: mime.includes('mp4') ? 'mp4' : 'webm'};
}
function altComparacao(){ return `Nosso grupo${state.grupo ? ' ' + state.grupo : ''} no ranking do Retrozap: ${destaquesBrasil().map(x => x.txt).join('; ')}.`; }

/* ---------- patrocínio: "intervalo comercial" na entrada das categorias ---------- */
const PATRO_IMG = '/assets/partygames.jpg';
const PATRO_LINK = 'https://playpartygames.com.br/?utm_source=retrozap&utm_medium=popup&utm_campaign=intervalo';
// Desligado até fechar o patrocínio. Para ligar: true. O pop-up está pronto e aprovado no visual.
const PATROCINIO_ATIVO = false;
// nudge de privacidade antes de ler o arquivo (uma vez por visita)
let LEMBRETE_VISTO = false;
function lembrete(seguir){
  if (LEMBRETE_VISTO) return seguir();
  const antes = document.activeElement, m = document.createElement('div');
  m.className = 'patro'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true'); m.setAttribute('aria-labelledby','lbT'); m.setAttribute('aria-describedby','lbD');
  m.innerHTML = `<div class="patro-box lemb">
    <div class="lemb-ic" aria-hidden="true">🔒</div>
    <p class="eyebrow" style="margin:0" id="lbT">Lembrete</p>
    <p class="lemb-tx" id="lbD">A gente <b>não lê nem guarda</b> nenhuma mensagem sua. Tudo é analisado aqui no seu navegador e funciona até em <b>modo avião ✈️</b>.</p>
    <button type="button" class="btn btn-main" id="lbOk">Entendi, bora! 🏆</button>
    <a href="/privacidade" class="small" style="color:var(--neblina)">Ver a política de privacidade</a>
  </div>`;
  document.body.appendChild(m);
  const fecha = () => { m.remove(); try { antes?.focus(); } catch {} };
  m.querySelector('#lbOk').onclick = () => { LEMBRETE_VISTO = true; fecha(); seguir(); };
  m.addEventListener('click', e => { if (e.target === m) fecha(); });
  m.addEventListener('keydown', e => { if (e.key === 'Escape') fecha(); });
  m.querySelector('#lbOk').focus();
}
// intervalo na metade dos prêmios: um anúncio e "a cerimônia volta já" (Premium não vê)
function intervaloAnuncio(){
  state.intervaloAd = true; anchor(true); setSteps(2);
  view.innerHTML = `<section class="screen" style="align-items:center;text-align:center">
    <p class="eyebrow">Intervalo comercial</p>
    <div class="em-g" aria-hidden="true">☕</div>
    <h1 style="font-size:32px">A cerimônia volta já</h1>
    <p class="lead">Faltam ${state.awards.filter(a => !a.honra).length - state.idx} troféus.</p>
    ${anuncio('intervalo')}
    <p class="small" style="margin:0">Com o Premium não tem intervalo. 😉</p>
    <button class="btn btn-main" id="go" style="width:100%" disabled>Voltando em 2…</button>
  </section>`;
  ativaAnuncios();
  const bt = $('#go'); let n = 2;
  const tic = setInterval(() => { if (!bt.isConnected) return clearInterval(tic); n--; if (n > 0) bt.textContent = `Voltando em ${n}…`; else { clearInterval(tic); bt.disabled = false; bt.textContent = 'Voltar para a cerimônia →'; bt.focus(); } }, 1000);
  bt.onclick = award;
  window.scrollTo(0,0);
}
function intervaloComercial(){
  if (!PATROCINIO_ATIVO) return;
  if (state.intervaloVisto) return; state.intervaloVisto = true;
  const ev = (n) => { try { if (typeof evento === 'function') evento(n); } catch {} };
  const antes = document.activeElement, m = document.createElement('div');
  m.className = 'patro'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true'); m.setAttribute('aria-label','Intervalo comercial. Oferecimento: Party Games');
  m.innerHTML = `<div class="patro-box">
    <p class="eyebrow" style="margin:0">Intervalo comercial</p>
    <p class="patro-of">Oferecimento: <b>Party Games</b></p>
    <a href="${PATRO_LINK}" target="_blank" rel="noopener sponsored" class="patro-img"><img src="${PATRO_IMG}" alt="Party Games: os melhores jogos em família, casais e amigos. 10% de desconto com o código RETROZAP. playpartygames.com.br"></a>
    <a href="${PATRO_LINK}" target="_blank" rel="noopener sponsored" class="btn btn-main" id="patroIr" style="text-decoration:none">🎲 Ver os jogos com 10% off</a>
    <button type="button" class="btn btn-ghost" id="patroFecha">Continuar para as categorias →</button>
  </div>`;
  document.body.appendChild(m); ev('patrocinio_visto');
  const fecha = () => { m.remove(); try { antes?.focus(); } catch {} };
  m.querySelector('#patroFecha').onclick = fecha;
  m.querySelectorAll('a').forEach(a => a.addEventListener('click', () => ev('patrocinio_clique')));
  m.addEventListener('click', e => { if (e.target === m) fecha(); });
  m.addEventListener('keydown', e => { if (e.key === 'Escape') fecha(); });
  m.querySelector('#patroFecha').focus();
}

/* ---------- personagens (top 5) ---------- */
const TRACOS = [
  ['night','Coruja da Madrugada','🦉', p => p.night/p.count, 'mensagens de madrugada', 'manda mensagem enquanto todo mundo dorme'],
  ['laugh','O Risonho','😂', p => p.laugh/Math.max(1,p.text), 'risadas', 'transforma qualquer assunto em gargalhada'],
  ['sticker','O Figurinheiro','🖼️', p => p.sticker/p.count, 'figurinhas', 'responde com figurinha antes de pensar'],
  ['audio','O Locutor','🎙️', p => p.audio/p.count, 'áudios', 'prefere falar a digitar'],
  ['chars','O Escritor','📜', p => p.chars/Math.max(1,p.text), 'tamanho das mensagens', 'escreve parágrafos onde os outros mandam "ok"'],
  ['org','O Organizador','🍻', p => p.org/p.count, 'convites para o rolê', 'é quem tira os planos do papel'],
  ['amo','O Coração Mole','💌', p => p.amo/p.count, 'declarações de carinho', 'é puro carinho por trás da zoeira'],
  ['first','O Despertador','☀️', p => p.first/p.count, 'primeira mensagem do dia', 'abre o grupo todo dia'],
  ['revive','O Puxa-Assunto','🔥', p => p.revive/p.count, 'ressuscitar o grupo', 'acorda o grupo quando tudo fica quieto'],
  ['link','O Repórter','📰', p => p.link/p.count, 'links compartilhados', 'traz as notícias e os vídeos do dia'],
  ['palavrao','O Sem Filtro','🤬', p => p.palavrao/Math.max(1,p.text), 'palavrões', 'fala o que pensa, do jeito que pensa'],
  ['aviso','O Síndico','📋', p => p.aviso/p.count, 'avisos e lembretes', 'mantém todo mundo informado'],
  ['ok','O Objetivo','👍', p => p.ok/Math.max(1,p.text), 'respostas curtas', 'resolve tudo em duas letras']
];
for (const t of TRACOS) t[1] = gtit(t[1]);
function personagens(d, by){
  const P = d.people, grupo = {count:0, text:0};
  for (const p of P) for (const k of Object.keys(p)) if (typeof p[k] === 'number') grupo[k] = (grupo[k]||0) + p[k];
  const usados = new Set(), top = o => Object.entries(o).sort((a,b) => b[1]-a[1]);
  const mesAno = t => t.toLocaleDateString('pt-BR', {month:'long', year:'numeric'});
  const gRiso = grupo.laugh / Math.max(1, grupo.text), gTam = grupo.chars / Math.max(1, grupo.text);
  return P.slice(0,5).map(p => {
    const opcoes = TRACOS.filter(t => !(t[0] === 'palavrao' && (state.modo === 'familia' || state.modo === 'trabalho')))
      .map(t => { const g = t[3](grupo); const ok = t[0] === 'chars' ? p.text >= 20 : p[t[0]] >= 5; return {t, score: ok && g > 0 ? t[3](p)/g : 0}; })
      .filter(o => o.score > 1.15).sort((a,b) => b.score - a.score);
    const esc1 = opcoes.find(o => !usados.has(o.t[0])), esc2 = opcoes.find(o => o !== esc1 && o.t[0] !== esc1?.t[0]);
    let titulo = 'O Pilar do Grupo', e = '🧱', resumo = `${p.name} está sempre presente e segura a conversa.`;
    if (esc1){ usados.add(esc1.t[0]); [, titulo, e] = esc1.t; resumo = `${p.name} ${esc1.t[5]}.`; }
    titulo = gtit(titulo, p.name);
    const pct = Math.round(p.count/d.total*100), tx = Math.max(1, p.text);
    const riso = p.laugh/tx, tam = p.chars/tx;
    const parceiros = top(p.rep).filter(([n]) => n !== p.name).slice(0, 2).map(([n]) => n);
    const midia = [['sticker','figurinhas'],['audio','áudios'],['photo','fotos e vídeos']].sort((a,b) => p[b[0]] - p[a[0]])[0];
    // jeito de falar: gírias, palavra e emojis de estimação
    const girias = top(p.giria).filter(([, n]) => n >= 3).slice(0, 2).map(([g]) => `“${g}”`);
    const fw = top(p.words).find(([w, n]) => n >= 3 && !girias.includes(`“${w}”`));
    const emojis = top(p.emo).filter(([, n]) => n >= 2).slice(0, 3).map(([x]) => x);
    const fala = [...girias, ...(fw ? [`“${fw[0]}”`] : [])].slice(0, 3);
    // mood: até dois traços, do mais marcante
    const mood = [];
    if (riso > gRiso*1.25) mood.push('risada fácil');
    if (p.amo/p.count > (grupo.amo||0)/Math.max(1,grupo.count)*1.4 && p.amo >= 3) mood.push('carinho');
    if (state.modo === 'amigos' && p.palavrao/tx > (grupo.palavrao||0)/Math.max(1,grupo.text)*1.4 && p.palavrao >= 5) mood.push('zero filtro');
    if (p.night/p.count > (grupo.night||0)/Math.max(1,grupo.count)*1.4 && p.night >= 5) mood.push('alma noturna');
    if (tam > gTam*1.3) mood.push('textão'); else if (tam < gTam*.7) mood.push('direto ao ponto');
    // não repete na vibe o que as frases já dizem
    const ditos = new Set([esc1?.t[0], esc2?.t[0]]), MOOD_DE = {laugh:'risada fácil', amo:'carinho', palavrao:'zero filtro', night:'alma noturna', chars:'textão', ok:'direto ao ponto'};
    for (const [k, m] of Object.entries(MOOD_DE)) if (ditos.has(k) && mood.includes(m)) mood.splice(mood.indexOf(m), 1);
    if (!mood.length && !esc1) mood.push(riso < gRiso*.6 ? 'mais na sua' : 'na paz');
    // assunto favorito, em relação ao resto do grupo
    const gt = {}; for (const q of P) for (const [k, n] of Object.entries(q.tema || {})) gt[k] = (gt[k]||0) + n;
    const tema = Object.entries(p.tema || {}).filter(([, n]) => n >= 4)
      .map(([k, n]) => [k, (n/tx)/((gt[k]||1)/Math.max(1, grupo.text)) * Math.log(n + 1)]).sort((a,b) => b[1] - a[1])[0]?.[0];
    const vibe = [mood.length ? `Vibe: ${juntar(mood.slice(0, 2))}.` : '', tema ? `Assunto favorito: ${tema}.` : ''].filter(Boolean).join(' ');
    const fatos = [`${pct}% das mensagens do grupo · ${fmt(p.count)} no total`, `No grupo desde ${mesAno(p.ini)}`];
    if (esc1) fatos.push(`${esc1.score.toFixed(1).replace('.',',')}× a média do grupo em ${esc1.t[4]}`);
    else if (p[midia[0]] >= 5) fatos.push(`${fmt(p[midia[0]])} ${midia[1]}`);
    if (parceiros.length) fatos.push(`Mais conversa com ${juntar(parceiros)}`);
    // segunda frase: outro lado marcante, ou o peso da pessoa no grupo
    const lado = esc2 ? `E ainda ${esc2.t[5]}.` : pct >= 25 ? 'É quem mais segura a conversa do grupo.' : p[midia[0]] >= 20 ? `Quando faltam palavras, manda ${midia[1]}.` : '';
    return {nome:p.name, titulo, e, fatos, texto:[resumo, lado, vibe].filter(Boolean).join(' '), fala, emojis};
  });
}

/* ---------- cards 1080x1080 ---------- */
function linhasDe(c, text, maxW){
  const words = text.split(' '); let line = '', n = 1;
  for (const w of words){ const t = line ? line+' '+w : w; if (c.measureText(t).width > maxW && line){ n++; line = w; } else line = t; }
  return n;
}
function wrap(c, text, x, y, maxW, lh){
  const words = text.split(' '); let line = '', lines = [];
  for (const w of words){ const t = line ? line+' '+w : w; if (c.measureText(t).width > maxW && line){ lines.push(line); line = w; } else line = t; }
  lines.push(line);
  const al = c.textAlign;
  lines.forEach((l,i) => { const w = c.measureText(l).width, x0 = al === 'center' ? x - w/2 : (al === 'right' || al === 'end') ? x - w : x;
    c.save(); c.direction = 'ltr'; c.textAlign = 'left'; c.fillText(l, x0, y + i*lh); c.restore(); });
  return lines.length;
}
function cardAward(a){ return drawCard({podio: (a.ranked || []).length > 1 ? a.ranked.slice(1,3).map((r,i) => `${['🥈','🥉'][i]} ${r.name} · ${vfmt(a, r.v)}`) : null, emoji:a.e, title:gtit(a.n, a.winner.name), winner:a.winner.name, line:`${vunid(a, a.winner.v)}${a.fatia && a.total ? ` · ${fatia(a, a.winner.v)} do grupo` : ''}${a.custom ? ' · categoria criada pelo grupo' : ''}`}); }

/* ---------- Crie seu prêmio (grátis no lançamento) ---------- */
const BLOCK = /feio|feia|burr|idiot|gord|nojent|lixo|retardad|imbecil|otari|macac|viad|bicha|piranha|vagabund|corno|baleia|aleijad|pobre|doente|religi|gay|lesbic/;
const norm = s => s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
const R = {
  reclama:/\baff\b|que saco|odeio|nao aguento|cansad|absurdo|ridicul|pessim|ninguem merece|que raiva|\bchato\b|que droga/,
  conselho:/(voce|vc) deveria|se eu fosse (voce|vc)|minha dica|fica a dica|melhor (voce|vc)|conselho|recomendo|faz assim/,
  atraso:/to chegando|atrasad|5 min|cinco minutos|ja to indo|saindo agora|to no uber|chego em/,
  drama:/socorro|morri|pelo amor|nao acredito|meu deus|que odio|chorando|desisto|nao aguento mais/,
  fofoca:/(voces|vcs) viram|fiquei sabendo|fofoca|babado|\bbafo\b|sabiam que|contaram que|adivinha/,
  otimista:/vai dar certo|partiu|\bbora\b|\btop\b|demais|incrivel|amei|sensacional|\bvamo\b|bora que/,
  corrente:/compartilhe|repasse|repassem|urgente|atencao|nao deixe de|envie para|encaminh/,
  agradece:/obrigad|gratidao|deus abencoe|valeu|agradec/,
  urgente:/urgente|\basap\b|pra ontem|prioridade|o quanto antes|correndo/,
  desculpa:/desculp|foi mal|perdao|me enganei|erro meu/
};
const PRONTAS = {
  amigos:[['😤','Reclamão Oficial','Quem mais reclama da vida','reclama'],['🧠','Conselheiro do Grupo','Quem mais dá conselho','conselho'],['⏰','Rei do Atraso','Quem mais chega atrasado','atraso'],['🎭','Drama do Grupo','Quem mais faz drama','drama'],['👀','Fofoqueiro Oficial','Quem mais traz fofoca','fofoca'],['☀️','Otimista do Rolê','Quem mais anima a galera','otimista']],
  familia:[['😤','Reclamão Oficial','Quem mais reclama da vida','reclama'],['🧠','Conselheiro da Família','Quem mais dá conselho','conselho'],['🔗','Rei da Corrente','Quem mais manda corrente','corrente'],['🎭','Drama da Família','Quem mais faz drama','drama'],['🙏','Mais Agradecido','Quem mais agradece','agradece'],['👀','Fofoqueiro Oficial','Quem mais traz fofoca','fofoca']],
  comunidade:[['😤','Reclamão Oficial','Quem mais reclama','reclama'],['🙏','Mais Agradecido','Quem mais agradece','agradece'],['👀','Fofoqueiro Oficial','Quem mais traz fofoca','fofoca'],['☀️','Otimista da Comunidade','Quem mais anima o grupo','otimista'],['🧠','Conselheiro','Quem mais dá conselho','conselho'],['🚨','Rei do Urgente','Quem mais pede tudo pra ontem','urgente']],
  trabalho:[['😤','Reclamão Oficial','Quem mais reclama','reclama'],['🚨','Rei do Urgente','Quem mais pede tudo pra ontem','urgente'],['🙏','Mais Agradecido','Quem mais agradece o time','agradece'],['☀️','Otimista do Time','Quem mais anima o time','otimista'],['🙇','Mestre das Desculpas','Quem mais pede desculpas','desculpa'],['⏰','Rei do Atraso','Quem mais chega atrasado','atraso']]
};
const IDEIAS = {
  amigos:['quem mais fala de comida','quem mais puxa briga por futebol','quem mais some quando a conta chega','quem mais conta histórias absurdas'],
  familia:['quem mais manda receita','quem mais fala do tempo e da chuva','quem mais organiza o almoço de domingo','quem mais manda notícia'],
  comunidade:['quem mais reclama do elevador','quem mais organiza eventos','quem mais fala de pets','quem mais pede coisa emprestada'],
  trabalho:['quem mais pede ajuda','quem mais comemora as vitórias do time','quem mais fala de café','quem mais marca reunião em cima da hora']
};
const custom = (texto = '') => {
  anchor(true);
  ir('/crie-seu-premio');
  pilha(() => custom(), 'custom');
  setSteps(3);
  view.innerHTML = `<section class="screen">
    ${state.sample ? `<span class="sample">${state.modo === 'casal' ? 'Casal de exemplo' : 'Grupo de exemplo'}</span>` : ''}
    <p class="eyebrow">Crie sua categoria · grátis no lançamento</p>
    <h1 style="font-size:38px">Escolha mais uma categoria. A gente descobre quem leva.</h1>
    <div class="panel">
      <p class="ask">Escolha uma categoria pronta</p>
      <div class="prontas">${PRONTAS[state.modo].map((x,i) => `<button type="button" class="pronta" data-p="${i}"><span class="em" aria-hidden="true">${x[0]}</span><b>${x[1]}</b><span class="small">${x[2]}</span></button>`).join('')}</div>
    </div>
    <p class="err" id="cerr" hidden></p>
    <button class="btn btn-ghost" id="back">← Voltar ao destaque</button>
  </section>`;
  $('#back').onclick = final;
  view.querySelectorAll('.pronta').forEach(b => b.onclick = () => {
    const [e, n, crit, key] = PRONTAS[state.modo][+b.dataset.p], counts = {};
    for (const m of state.data.msgs) if (kind(m.b) === 'text' && R[key].test(norm(m.b))) counts[m.a] = (counts[m.a]||0) + 1;
    const ranked = Object.entries(counts).map(([name,v]) => ({name, v})).sort((x,y) => y.v - x.v);
    if (!ranked.length){ const er = $('#cerr'); er.hidden = false; er.textContent = `Ninguém no grupo se encaixou em "${n}". Tente outra.`; return; }
    reveal({e, n, crit, u:'mensagens', ranked, winner:ranked[0], total:ranked.reduce((s,r)=>s+r.v,0), p:'{w} levou com {v} mensagens. Prêmio criado pelo próprio grupo.'});
  });
  function reveal(a){
    a.custom = true; a.mech = 'podio';
    view.innerHTML = `<section class="screen">
      ${state.sample ? `<span class="sample">${state.modo === 'casal' ? 'Casal de exemplo' : 'Grupo de exemplo'}</span>` : ''}
      <p class="count">Prêmio criado pelo grupo${a.nota ? ' · ' + esc(a.nota) : ''}</p>
      <div class="award"><div class="em" aria-hidden="true">${esc(a.e)}</div><h2>${esc(a.n)}</h2><p class="crit">${esc(a.crit)}</p>
        <div id="game" style="width:100%;display:flex;flex-direction:column;align-items:center;gap:12px"></div>
        <div id="res" class="reveal" aria-live="polite" hidden></div></div>
      <div class="nav"><button class="btn btn-ghost" id="next">Criar outro prêmio</button></div>
      <button class="btn btn-ghost" id="back2">← Voltar ao destaque</button>
    </section>`;
    evento('premio_criado');
    $('#next').onclick = () => custom();
    $('#back2').onclick = final;
    podio(a, $('#game')).fn(); window.scrollTo(0,0);
  }
};

function drawCard({emoji, title, winner, line, small, podio}){
  const cv = document.createElement('canvas'); cv.width = cv.height = 1080; const c = cv.getContext('2d');
  const modo = MODOS[state.modo].c;
  c.fillStyle = corFundo(); c.fillRect(0,0,1080,1080);
  const g = c.createRadialGradient(540,0,50,540,0,800); g.addColorStop(0,CV().brilho(.28)); g.addColorStop(1,CV().brilho(0));
  c.fillStyle = g; c.fillRect(0,0,1080,1080);
  const cols = ['#FFC23C','#FF4F8B','#FF7A59','#2EC4F1','#FFF4E0']; let s = 11;
  const casal = state.modo === 'casal', rosas = ['#E8336D','#FF8FB1','#F06292','#C2185B','#FFB3C8'];
  for (let i=0;i<(casal ? 40 : 70);i++){ s = (s*9301+49297)%233280; const r = s/233280; c.save(); c.translate(r*1080, ((i*137)%1080));
    if (casal){ c.fillStyle = rosas[i%5]; c.globalAlpha = .3; c.rotate((r-.5)*.8); coracao(c, 0, 0, 9 + (i%4)*5); }
    else { c.fillStyle = cols[i%5]; c.globalAlpha = .7; c.rotate(r*6); c.fillRect(-7,-3,14,6); }
    c.restore(); }
  c.globalAlpha = 1;
  c.fillStyle = modo; c.fillRect(0,0,1080,16);
  c.textAlign = 'center'; c.fillStyle = CV().ouro; c.font = '800 52px "Bricolage Grotesque", sans-serif'; c.fillText(state.modo === 'casal' ? 'retrozap 💕' : 'retrozap 🏆', 540, 100);
  if (state.grupo){ c.fillStyle = CV().txt; caber(c, state.grupo, 540, 158, 900, 700, 38, '"DM Sans", sans-serif'); c.fillStyle = CV().ouro; }
  c.font = '230px serif'; c.fillText(emoji, 540, 400);
  c.fillStyle = CV().txt; c.font = '800 66px "Bricolage Grotesque", sans-serif'; wrap(c, title.toUpperCase(), 540, 510, 900, 72);
  c.save(); c.translate(540, 680); c.rotate(-0.07);
  c.font = `800 ${small?64:96}px "Bricolage Grotesque", sans-serif`;
  const w = Math.min(960, c.measureText(winner).width + 80);
  c.fillStyle = modo; c.fillRect(-w/2+14, -86+14, w, 140);
  c.fillStyle = CV().ouro; c.fillRect(-w/2, -86, w, 140);
  c.fillStyle = corFundo(); c.fillText(winner, 0, small?10:22, 900);
  c.restore();
  c.fillStyle = CV().sub; c.font = '500 44px "DM Sans", sans-serif'; c.fillText(line, 540, podio?.length ? 820 : 850, 980);
  if (podio?.length){ c.fillStyle = CV().txt; c.font = '700 40px "DM Sans", sans-serif'; c.fillText(podio.join('     '), 540, 905, 980); }
  if (periodo()){ c.fillStyle = CV().sub; c.font = '700 26px "DM Sans", sans-serif'; c.fillText(periodo(), 540, 962, 980); }
  c.fillStyle = CV().txt; c.font = '700 34px "DM Sans", sans-serif'; c.fillText(TAGLINE(), 540, 1010);
  return cv.toDataURL('image/png');
}
function paraBlob(url){
  const [cab, b64] = url.split(','), bin = atob(b64), arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], {type: cab.match(/:(.*?);/)[1]});
}
let nCard = 0;
/* ---------- WhatsApp: imagem + convite ---------- */
const LINK = 'https://retrozap.com.br';
function convite(tipo, x){
  if (tipo === 'premio') return `Saiu o resultado no nosso grupo: ${x.winner.name} levou "${x.n}" 🏆😂 Descubra quem leva cada prêmio no SEU grupo, de graça e sem as mensagens saírem do celular: ${LINK}`;
  if (tipo === 'destaque') return `${x} é o destaque do nosso grupo 👑 Descubra quem é o destaque do SEU grupo no Retrozap: ${LINK}`;
  if (tipo === 'ranking'){ const b = destaquesBrasil()[0], ti = {casal:'de casais', amigos:'de amigos', familia:'de família', trabalho:'de trabalho', comunidade:'de comunidade'}[state.modo];
    const frase = !b ? 'tem posição no ranking' : b.k === 'dias' ? `é ${b.txt.toLowerCase()} ${ti}` : `está no ${b.txt} entre os grupos ${ti}`;
    return `Nosso grupo ${frase} do Retrozap 😂🏆 Descubra a posição do SEU grupo. É grátis: retrozap.com.br`; }
  if (tipo === 'spoiler') return `👀 SPOILER! Fiz a retrospectiva do nosso grupo no Retrozap e esses são os ${x} troféus em disputa. Quem leva cada um? Mandem os palpites! Todo grupo tem uma história, descubra a do seu em www.retrozap.com.br`;
  if (tipo === 'amigos') return 'Fiz a retrospectiva do meu grupo no Retrozap! Faz a do seu: quem é o tagarela, quem é o fantasma, qual é a vibe do grupo. É grátis e rápido: https://retrozap.com.br';
  return 'Esse é o resumo do nosso grupo 😂🏆 Descubra a vibe, as histórias e as curiosidades do SEU grupo no Retrozap. É grátis: retrozap.com.br';
}
// Celular: abre a lista de apps com a imagem + o convite (escolhe WhatsApp, Instagram...).
// Computador: copia a imagem e abre o WhatsApp com o convite escrito; é só escolher a conversa e colar.
async function mandarWhats(blob, nome, texto, msg, semNada){
  const f = new File([blob], nome, {type:'image/png'});
  let pode = false; try { pode = !!navigator.canShare?.({files:[f]}); } catch {}
  if (pode){
    try { await navigator.share({files:[f], text:texto}); evento('card_compartilhado'); return 'ok'; }
    catch (e){ if (e?.name === 'AbortError') return 'cancelado'; }
  }
  if (semNada) return semNada();
  let copiou = false;
  try { await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]); copiou = true; } catch {}
  window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener'); evento('card_whatsapp_web');
  if (msg) msg.textContent = copiou ? 'Abrimos o WhatsApp com o convite escrito. Escolha a conversa e cole a imagem (Ctrl+V ou Cmd+V).' : 'Abrimos o WhatsApp com o convite escrito. Salve a imagem e anexe na conversa.';
  return 'computador';
}
async function openCard(fazer, texto = convite('resumo'), alt = 'Card para compartilhar no grupo'){
  evento('card_gerado');
  await document.fonts.ready; // desenha só depois das fontes carregarem
  const url = typeof fazer === 'function' ? fazer() : fazer, blob = paraBlob(url), nome = `retrozap-card-${++nCard}.png`;
  let celular = false;
  try { celular = !!navigator.canShare?.({files:[new File([blob], nome, {type:'image/png'})]}); } catch {}
  const m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role','dialog'); m.setAttribute('aria-label','Card para compartilhar'); m.setAttribute('aria-modal','true');
  const antes = document.activeElement;
  m.innerHTML = `<img src="${url}" alt="${esc(alt)}">
    <div class="btn-row" style="width:min(86vw,420px)">
      <button class="btn btn-main btn-wa" id="sh"><i class="ic-wa" aria-hidden="true"></i>Mandar no WhatsApp</button>
      <button class="btn btn-ghost" id="dl">⬇️ Salvar imagem</button>
      <button class="btn btn-ghost" id="cp">📋 Copiar imagem</button>
      <button class="btn btn-ghost" id="cl">Fechar</button>
    </div>
    <p id="msg">${celular ? 'A imagem vai junto com um convite para a galera fazer o grupo deles. Também dá para escolher o Instagram.' : 'Abre o WhatsApp com o convite escrito; a imagem já vai copiada, é só colar.'}</p>`;
  document.body.appendChild(m);
  const msg = m.querySelector('#msg');
  const fecha = () => { m.remove(); try { antes?.focus(); } catch {} };
  m.querySelector('#cl').onclick = fecha;
  m.addEventListener('keydown', e => {
    if (e.key === 'Escape') return fecha();
    if (e.key !== 'Tab') return;
    const bs = [...m.querySelectorAll('button')], i = bs.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0){ e.preventDefault(); bs[bs.length-1].focus(); }
    else if (!e.shiftKey && i === bs.length - 1){ e.preventDefault(); bs[0].focus(); }
  });
  m.querySelector('#sh').focus();
  m.querySelector('#sh').addEventListener('click', async () => {
    const r = await mandarWhats(blob, nome, texto, msg);
    if (r === 'ok') msg.textContent = 'Mandado! 🏆';
  });
  m.querySelector('#dl').onclick = () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    evento('card_salvo'); msg.textContent = 'Imagem salva! Agora é só mandar no grupo. 🏆';
  };
  m.querySelector('#cp').onclick = async () => {
    try { await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]); msg.textContent = 'Imagem copiada! Cole no WhatsApp com Ctrl+V (ou Cmd+V).'; evento('card_copiado'); }
    catch { msg.textContent = 'Seu navegador não deixou copiar a imagem. Clique com o botão direito nela e escolha "Copiar imagem".'; }
  };
}

/* ---------- confete ---------- */
function confetti(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = $('#confetti'), c = cv.getContext('2d'); cv.width = innerWidth; cv.height = innerHeight;
  const casal = state.modo === 'casal', cols = casal ? ['#E8336D','#FF8FB1','#FFC2D4','#C2185B','#FFFFFF'] : ['#FFC23C','#FF4F8B','#FF7A59','#2EC4F1','#FFF4E0'];
  const ps = Array.from({length:120}, () => ({x:innerWidth/2, y:innerHeight*.35, vx:(Math.random()-.5)*14, vy:-Math.random()*14-4, r:Math.random()*6, c:cols[Math.random()*5|0], s:Math.random()*.3}));
  let t = 0; (function f(){ c.clearRect(0,0,cv.width,cv.height);
    for (const p of ps){ p.x += p.vx; p.y += p.vy; p.vy += .45; p.r += p.s; c.save(); c.translate(p.x,p.y); c.rotate(p.r); c.fillStyle = p.c; if (casal){ c.font = '16px serif'; c.fillText('❤', -6, 6); } else c.fillRect(-5,-3,10,6); c.restore(); }
    if (++t < 110) requestAnimationFrame(f); else c.clearRect(0,0,cv.width,cv.height); })();
}

/* ---------- casal de exemplo (inventado, nomes neutros) ---------- */
function demoCasal(){
  let s = 11; const rnd = () => (s = (s*16807) % 2147483647) / 2147483647;
  const P = [
    {n:'Dani', w:52, h:[7,23], m:['figurinha omitida','figurinha omitida','imagem ocultada'], t:['bom dia amor ☀️','te amo ❤️','chegou bem?','saudade de vc 🥰','kkkkkk','to com fome','oq vamos jantar hoje?','amorzinho 😘','vc viu isso?','desculpa, tava em reunião','pizza ou japa?','to saindo agora','te amo muito 💕','que dia longo','me liga quando puder']},
    {n:'Cris', w:48, h:[8,1], m:['áudio omitido','áudio omitido','imagem ocultada'], t:['bom diaaa','te amo também ❤️','kkkk','to morrendo de fome','japa!!','meu bem 💕','haha','saudades','desculpa a demora','vamos no cinema sábado?','chegando em 10 min','dorme bem 😘','to com saudade','olha que lindo','amo vc']}
  ];
  const pad = n => String(n).padStart(2,'0'), base = new Date(2024,8,1).getTime(), dias = 770, out = [];
  let ult = null;
  for (let i = 0; i < 9000; i++){
    const day = Math.floor(rnd()*dias), q = rnd() < (ult === 'Dani' ? .55 : .45) ? P[1] : P[0]; ult = q.n;
    let h = q.h[0] + Math.floor(rnd()*(((q.h[1] + 24 - q.h[0]) % 24) + 1)); h %= 24;
    const t = new Date(base + day*864e5); t.setHours(h, Math.floor(rnd()*60));
    const body = rnd() < .14 ? q.m[Math.floor(rnd()*q.m.length)] : q.t[Math.floor(rnd()*q.t.length)];
    out.push({t, line:`${pad(t.getDate())}/${pad(t.getMonth()+1)}/${t.getFullYear()} ${pad(t.getHours())}:${pad(t.getMinutes())} - ${q.n}: ${body}`});
  }
  // um dia especial em 2026: aniversário de namoro
  const festa = ['FELIZ 1 ANO, AMOR!!! 💕','Feliz aniversário de namoro!! ❤️','Te amo muito 🥰','<Mídia oculta>','Olha essa foto nossa','kkkkkk que vergonha','Melhor ano da minha vida','Jantar hoje à noite?','Já reservei!!','💕💕💕'];
  for (let i = 0; i < 60; i++){ const t = new Date(2026,5,12,8 + Math.floor(i/5), (i*7) % 60), nome = i % 2 ? 'Cris' : 'Dani';
    out.push({t, line:`${pad(t.getDate())}/${pad(t.getMonth()+1)}/${t.getFullYear()} ${pad(t.getHours())}:${pad(t.getMinutes())} - ${nome}: ${festa[i % festa.length]}`}); }
  out.sort((a,b) => a.t - b.t);
  return '01/09/2024 08:00 - As mensagens e as ligações são protegidas com a criptografia de ponta a ponta.\n' + out.map(o => o.line).join('\n');
}
/* ---------- grupo de exemplo (inventado) ---------- */
function demoChat(){
  let s = 7; const rnd = () => (s = (s*16807) % 2147483647) / 2147483647;
  const P = [
    {n:'Pedrão',w:30,h:[9,23],t:['porra, que jogo ontem','bora hoje no bar?','quem vai sábado?','caralho kkkk','vamos marcar o churras','cês viram isso? https://youtu.be/abc','absurdo isso aí','pqp kkkkkk','bom dia seus vagabundos ☀️','foda demais 🔥','seja bem-vindo, Tiago!']},
    {n:'Lu',w:22,h:[8,22],t:['kkkkkkkkk','hahahaha morri','kkkk socorro','amo vcs 💖','chegou bem?','parabéns!!! 🎂🎉','kkkkk não acredito','bom dia grupo ☀️','amo vcs 💖','vendo bicicleta aro 29, alguém quer?','desapego: sofá em ótimo estado']},
    {n:'Caio',w:18,h:[10,20],m:['figurinha omitida','figurinha omitida','imagem ocultada'],t:['ok','blz','👍','pode deixar','tá feito','call às 15h?','reunião amanhã?','alguém indica um eletricista?','recomendo o João, contato dele: 9999-0000']},
    {n:'Bia',w:14,h:[7,21],m:['áudio omitido','áudio omitido','imagem ocultada','vídeo omitido'],t:['gente, deixa eu contar uma coisa que aconteceu hoje no trabalho porque vocês não vão acreditar, foi surreal do começo ao fim','bom dia ☀️','cuidado na estrada hein','juízo vocês','parabéns, amor! 🎂','atenção: amanhã tem manutenção na caixa d’água','lembrete: reunião de condomínio quinta']},
    {n:'Juninho',w:12,h:[0,4],t:['alguém acordado?','não consigo dormir','kkkk','que fome 🍕','Esta mensagem foi apagada','vamos marcar o futebol?','alguém acordado?','que barulho de obra é esse??']},
    {n:'Tiago',w:3,h:[10,22],max:440,t:['e aí galera','bora!','kkkk','valeu pessoal']},
    {n:'Rafa',w:4,h:[12,19],t:['foi mal galera, não vou conseguir','fica pra próxima','não vai dar hoje','amo vcs','alguém viu uma chave perdida no hall?','obrigado gente!']}
  ];
  const tw = P.reduce((x,p)=>x+p.w,0), pad = n => String(n).padStart(2,'0'), base = new Date(2024,0,1).getTime(), out = [];
  for (let i=0;i<2600;i++){
    let r = rnd()*tw, p = P[0]; for (const q of P){ if ((r -= q.w) < 0){ p = q; break; } }
    const day = Math.floor(rnd()*(p.max || 1013)), h = p.h[0] + Math.floor(rnd()*(p.h[1]-p.h[0]+1));
    const t = new Date(base + day*864e5); t.setHours(h, Math.floor(rnd()*60));
    const body = p.m && rnd() < .35 ? p.m[Math.floor(rnd()*p.m.length)] : p.t[Math.floor(rnd()*p.t.length)];
    const nome = p.n === 'Rafa' && day < 520 ? '+55 11 98877-1234' : p.n;
    out.push({t, line:`${pad(t.getDate())}/${pad(t.getMonth()+1)}/${t.getFullYear()} ${pad(t.getHours())}:${pad(t.getMinutes())} - ${nome}: ${body}`});
  }
  // um dia de festa em 2026 para o "momento mais marcante" aparecer no exemplo
  { const festa = ['PARABÉNS PEDRÃO!!! 🎂🎉','Parabéns meu amigo!! 🥳','kkkkkk o bolo caiu','Feliz aniversário!! Muitos anos de vida 🎉','Manda foto do bolo','<Mídia oculta>','kkkkkkkk não acredito','Parabéns!!! 🎂','Que dia hein','Bora comemorar hoje!','<Mídia oculta>','Felicidades, Pedrão!! 🥂'];
    const quem = ['Lu','Caio','Bia','Rafa','Juninho','Pedrão'];
    for (let i = 0; i < 70; i++){ const t = new Date(2026,2,14,9 + Math.floor(i/6), (i*7) % 60); const nome = quem[i % quem.length], body = festa[i % festa.length];
      out.push({t, line:`${pad(t.getDate())}/${pad(t.getMonth()+1)}/${t.getFullYear()} ${pad(t.getHours())}:${pad(t.getMinutes())} - ${nome}: ${body}`}); } }
  out.push({t:new Date(2025,2,16,10,0), line:'16/03/2025 10:00 - Tiago saiu'});
  out.push({t:new Date(2025,5,4,9,0), line:'04/06/2025 09:00 - Rafa mudou para um novo número. Toque para enviar uma mensagem ou adicionar o novo número.'});
  out.sort((a,b) => a.t-b.t);
  return '01/01/2024 08:00 - As mensagens e as ligações são protegidas com a criptografia de ponta a ponta.\n' + out.map(o=>o.line).join('\n');
}

// a barra fixa de botões (Revelar / Pular) sobe acima do aviso de cookies e do anúncio âncora do Google, para nunca ficar coberta
function ajustaAcao(){
  let h = 0;
  const ck = document.querySelector('.cookies'); if (ck && ck.isConnected) h = Math.max(h, ck.getBoundingClientRect().height);
  // o fim da página também ganha espaço para o último botão nunca ficar embaixo do aviso de cookies
  const pb = ck && ck.isConnected ? Math.round(ck.getBoundingClientRect().height + 24) + 'px' : ''; if (document.body.style.paddingBottom !== pb) document.body.style.paddingBottom = pb;
  for (const el of document.querySelectorAll('ins.adsbygoogle, .adsbygoogle-noablate')){
    if (el.closest('.screen')) continue; const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect(); if (r.height > 10 && r.top > innerHeight/2 && r.top < innerHeight) h = Math.max(h, innerHeight - r.top);
  }
  const v = Math.round(h) + 'px'; if (document.documentElement.style.getPropertyValue('--acao-base') !== v) document.documentElement.style.setProperty('--acao-base', v);
}
setInterval(ajustaAcao, 800); addEventListener('resize', ajustaAcao); document.addEventListener('click', () => setTimeout(ajustaAcao, 50), true);
$('#home').onclick = inicio;
$('#voltar').onclick = () => voltar();
setModo('amigos');
if (location.pathname !== '/') history.replaceState({}, '', '/');
inicio(); avisoCookies();
// prévia: alternar o plano para ver como fica grátis x premium
function marcaPlano(){ document.querySelectorAll('#planoTeste button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.plano === state.planoTeste))); }
if (AMBIENTE_TESTE){
  const t = document.createElement('div'); t.id = 'planoTeste'; t.setAttribute('role', 'group'); t.setAttribute('aria-label', 'Versão de teste: plano');
  t.innerHTML = '<span>🧪 Teste</span><button type="button" data-plano="gratis">Grátis</button><button type="button" data-plano="premium">Premium</button>';
  document.body.appendChild(t); marcaPlano();
  t.querySelectorAll('button').forEach(b => b.onclick = () => { state.planoTeste = b.dataset.plano; marcaPlano(); const topo = PILHA[PILHA.length-1]; if (topo) topo.f(); });
}
