// Painel do Retrozap: GET /admin (página) e GET /api/admin/dados (números, protegido por senha).
// Só números agregados do D1 + Google Analytics + Search Console. Nenhuma mensagem de grupo existe no banco.
// Segredos (Cloudflare > Worker > Settings > Variables and Secrets):
//   ADMIN_SENHA  senha do painel (obrigatória; sem ela o painel fica desligado)
//   GOOGLE_SA    JSON da conta de serviço do Google (opcional: liga Analytics e Search Console)
// Variáveis: GA4_PROPERTY (número da propriedade do GA4) e GSC_SITE (padrão sc-domain:retrozap.com.br)
import { HISTORIA } from './historia.js';
const json = (obj, status = 200) => new Response(JSON.stringify(obj), {status, headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex'}});
const sha = async t => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(t))));

async function autorizado(request, env){
  if (!env.ADMIN_SENHA) return false;
  const [a, b] = await Promise.all([sha(request.headers.get('x-senha') || ''), sha(env.ADMIN_SENHA)]);
  let d = 0; for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

// consulta que não quebra se a tabela ainda não existe
const todas = async (env, sql, ...p) => { try { return (await env.DB.prepare(sql).bind(...p).all()).results || []; } catch { return []; } };
const uma = async (env, sql, ...p) => (await todas(env, sql, ...p))[0] || {};
const mascara = e => String(e || '').replace(/^(.{2}).*(@.*)$/, '$1•••$2');

async function site(env){
  if (!env.DB) return {erro: 'sem_banco'};
  const real = "COALESCE(estimado, 0) = 0";
  const [g, modos, gDia, c, cDia, ultimas, ideias, recentes] = await Promise.all([
    uma(env, `SELECT COUNT(*) AS total, SUM(criado >= date('now', '-6 days')) AS semana, SUM(criado = date('now')) AS hoje, SUM(base = '2026') AS ano FROM grupos WHERE ${real}`),
    todas(env, `SELECT modo, COUNT(*) AS n FROM grupos WHERE ${real} GROUP BY modo ORDER BY n DESC`),
    todas(env, `SELECT criado AS dia, COUNT(*) AS n FROM grupos WHERE ${real} AND criado >= date('now', '-29 days') GROUP BY criado`),
    uma(env, "SELECT SUM(status = 'pago') AS pagos, SUM(CASE WHEN status = 'pago' THEN CAST(valor AS REAL) ELSE 0 END) AS receita, COUNT(*) AS pix, COUNT(DISTINCT CASE WHEN status = 'pago' THEN email END) AS clientes, SUM(status = 'pago' AND pago >= date('now', '-6 days')) AS semana FROM compras WHERE modo = 'ligada'"),
    todas(env, "SELECT substr(pago, 1, 10) AS dia, COUNT(*) AS n FROM compras WHERE modo = 'ligada' AND status = 'pago' AND pago >= date('now', '-29 days') GROUP BY dia"),
    todas(env, "SELECT email, pago, valor FROM compras WHERE modo = 'ligada' AND status = 'pago' ORDER BY pago DESC LIMIT 8"),
    todas(env, 'SELECT tipo, COUNT(*) AS n FROM ideias GROUP BY tipo'),
    todas(env, "SELECT criado, tipo, texto FROM ideias WHERE tipo != 'novidades' ORDER BY criado DESC LIMIT 10")
  ]);
  return {grupos: g, modos, gDia, compras: c, cDia, ultimas: ultimas.map(u => ({...u, email: mascara(u.email)})), ideias, recentes};
}

// token do Google pela conta de serviço (JWT RS256 assinado aqui mesmo)
let tokenGoogle = null;
function googleToken(env){
  if (!tokenGoogle || tokenGoogle.ate < Date.now()) tokenGoogle = {ate: Date.now() + 50 * 60e3, t: novoToken(env).catch(e => { tokenGoogle = null; throw e; })};
  return tokenGoogle.t;
}
async function novoToken(env){
  const sa = JSON.parse(env.GOOGLE_SA);
  const b64 = o => btoa(typeof o === 'string' ? o : String.fromCharCode(...new Uint8Array(o))).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const agora = Math.floor(Date.now() / 1000);
  const corpo = b64(JSON.stringify({alg: 'RS256', typ: 'JWT'})) + '.' + b64(JSON.stringify({iss: sa.client_email, aud: 'https://oauth2.googleapis.com/token', iat: agora, exp: agora + 3600,
    scope: 'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly'}));
  const der = Uint8Array.from(atob(sa.private_key.replace(/-----[^-]+-----|\s/g, '')), ch => ch.charCodeAt(0));
  const chave = await crypto.subtle.importKey('pkcs8', der, {name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256'}, false, ['sign']);
  const jwt = corpo + '.' + b64(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', chave, new TextEncoder().encode(corpo)));
  const r = await fetch('https://oauth2.googleapis.com/token', {method: 'POST', headers: {'content-type': 'application/x-www-form-urlencoded'},
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt});
  const o = await r.json();
  if (!o.access_token) throw new Error('google_token: ' + (o.error_description || o.error || r.status));
  return o.access_token;
}
async function google(env, url, corpo){
  const r = await fetch(url, {method: 'POST', headers: {'content-type': 'application/json', Authorization: 'Bearer ' + await googleToken(env)}, body: JSON.stringify(corpo)});
  const o = await r.json();
  if (!r.ok) throw new Error(o?.error?.message || String(r.status));
  return o;
}
const linhas = o => (o.rows || []).map(r => [...(r.dimensionValues || []).map(v => v.value), ...(r.metricValues || []).map(v => Number(v.value))]);

async function analytics(env){
  if (!env.GOOGLE_SA || !env.GA4_PROPERTY) return {erro: 'nao_configurado'};
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(env.GA4_PROPERTY)}:runReport`;
  const periodo = [{startDate: '29daysAgo', endDate: 'today'}];
  const [dia, paginas, canais] = await Promise.all([
    google(env, url, {dateRanges: periodo, dimensions: [{name: 'date'}], metrics: [{name: 'activeUsers'}, {name: 'sessions'}, {name: 'screenPageViews'}]}),
    google(env, url, {dateRanges: periodo, dimensions: [{name: 'pagePath'}], metrics: [{name: 'screenPageViews'}], limit: 12, orderBys: [{metric: {metricName: 'screenPageViews'}, desc: true}]}),
    google(env, url, {dateRanges: periodo, dimensions: [{name: 'sessionDefaultChannelGroup'}], metrics: [{name: 'sessions'}], limit: 8, orderBys: [{metric: {metricName: 'sessions'}, desc: true}]})
  ]);
  const tot = await google(env, url, {dateRanges: periodo, metrics: [{name: 'activeUsers'}, {name: 'sessions'}, {name: 'screenPageViews'}]});
  return {total: linhas(tot)[0] || [0, 0, 0], dia: linhas(dia).map(([d, ...m]) => [`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`, ...m]), paginas: linhas(paginas), canais: linhas(canais)};
}

async function busca(env){
  if (!env.GOOGLE_SA) return {erro: 'nao_configurado'};
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(env.GSC_SITE || 'sc-domain:retrozap.com.br')}/searchAnalytics/query`;
  const d = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
  const periodo = {startDate: d(30), endDate: d(1)};
  const [dia, termos, tot] = await Promise.all([
    google(env, url, {...periodo, dimensions: ['date']}),
    google(env, url, {...periodo, dimensions: ['query'], rowLimit: 12}),
    google(env, url, periodo)
  ]);
  const r = (o, dim) => (o.rows || []).map(x => ({[dim]: x.keys?.[0], cliques: x.clicks, impressoes: x.impressions, ctr: x.ctr, posicao: x.position}));
  return {total: r(tot, 'k')[0] || {cliques: 0, impressoes: 0}, dia: r(dia, 'dia'), termos: r(termos, 'termo')};
}

const seguro = p => p.catch(e => ({erro: String(e?.message || e).slice(0, 200)}));

// barra quem não tem a senha (com atraso contra chute)
async function barra(request, env){
  if (!env.ADMIN_SENHA) return json({error: 'desligado'}, 503);
  if (!(await autorizado(request, env))){ await new Promise(r => setTimeout(r, 800)); return json({error: 'senha'}, 401); }
  return null;
}

export async function dados({request, env}){
  const nao = await barra(request, env); if (nao) return nao;
  const [s, a, b, n] = await Promise.all([seguro(site(env)), seguro(analytics(env)), seguro(busca(env)), env.DB ? uma(env, "SELECT v FROM config WHERE k = 'negocio'") : {}]);
  let negocio = null; try { negocio = n.v ? JSON.parse(n.v) : null; } catch {}
  return json({gerado: new Date().toISOString(), cobranca: env.COBRANCA || 'teste', site: s, analytics: a, busca: b, negocio, historia: HISTORIA});
}

// POST /api/admin/negocio: guarda os investimentos e premissas da aba Negócio (tabela config)
export async function salvar({request, env}){
  const nao = await barra(request, env); if (nao) return nao;
  if (!env.DB) return json({error: 'sem_banco'}, 503);
  const t = await request.text();
  if (t.length > 20000) return json({error: 'grande'}, 413);
  let o; try { o = JSON.parse(t); } catch { return json({error: 'bad_request'}, 400); }
  if (!o || typeof o !== 'object' || !Array.isArray(o.custos)) return json({error: 'bad_request'}, 400);
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS config (k TEXT PRIMARY KEY, v TEXT, atualizado TEXT)').run();
  await env.DB.prepare("INSERT OR REPLACE INTO config (k, v, atualizado) VALUES ('negocio', ?, ?)").bind(JSON.stringify(o), new Date().toISOString()).run();
  return json({ok: true});
}

export async function painel(){
  return new Response(PAGINA, {headers: {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'x-frame-options': 'DENY'}});
}

const PAGINA = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Painel Retrozap</title>
<style>
:root{--bg:#1A0B2E;--card:#2A1242;--borda:#3D1A5C;--txt:#F6F0FF;--txt2:#C9B8E0;--txt3:#9A86B8;--serie:#FFC23C;--serie2:#FF4F8B;--ok:#3DDC97;--alerta:#FFB547}
[hidden]{display:none!important}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:1100px;margin:0 auto;padding:20px 16px 60px}h1{font-size:22px;margin:0}h2{font-size:15px;margin:0 0 12px;color:var(--txt2);font-weight:600;text-transform:uppercase;letter-spacing:.06em}
header{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px}.sub{color:var(--txt3);font-size:13px}
section{margin-top:28px}.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}@media(min-width:700px){.grid{grid-template-columns:repeat(auto-fit,minmax(195px,1fr))}}.dois{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))}
.card{background:var(--card);border:1px solid var(--borda);border-radius:14px;padding:14px 16px;min-width:0}
.tile .v{font-size:clamp(21px,2.2vw,26px);white-space:nowrap;line-height:1.15;font-weight:700;font-variant-numeric:tabular-nums}.tile .l{color:var(--txt2);font-size:13px}.tile .d{color:var(--txt3);font-size:12px;margin-top:2px}
table{width:100%;border-collapse:collapse;font-size:13px}td,th{padding:6px 4px;border-bottom:1px solid var(--borda);text-align:left;vertical-align:top}th{color:var(--txt3);font-weight:500}td.n,th.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.aviso{color:var(--txt3);font-size:13px}.aviso b{color:var(--alerta)}a{color:var(--serie)}
.links{display:flex;flex-wrap:wrap;gap:8px}.links a{background:var(--card);border:1px solid var(--borda);border-radius:999px;padding:7px 12px;text-decoration:none;color:var(--txt);font-size:13px}
.links a:hover{border-color:var(--serie)}button,input{font:inherit}button{background:var(--serie);color:var(--bg);border:0;border-radius:10px;padding:9px 14px;font-weight:600;cursor:pointer}
button.sec{background:transparent;color:var(--txt2);border:1px solid var(--borda)}input{background:var(--card);border:1px solid var(--borda);color:var(--txt);border-radius:10px;padding:9px 12px;width:100%}
#login{max-width:340px;margin:18vh auto 0;display:grid;gap:10px}.graf{position:relative}.graf svg{display:block;width:100%;height:150px}.graf .ttl{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
.graf .ttl b{font-size:14px}.graf .ttl span{color:var(--txt3);font-size:12px}.eixo{fill:var(--txt3);font-size:10px}.tip{position:absolute;pointer-events:none;background:#0F0620;border:1px solid var(--borda);border-radius:8px;padding:5px 8px;font-size:12px;white-space:nowrap;display:none;z-index:2}
rect.alvo{fill:transparent}rect.alvo:hover+rect,rect.barra:hover{opacity:.8}.tag{display:inline-block;font-size:11px;padding:1px 7px;border-radius:999px;border:1px solid var(--borda);color:var(--txt2)}
.status{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--txt2)}.ponto{width:8px;height:8px;border-radius:50%;background:var(--ok)}.ponto.off{background:var(--alerta)}
.abas{display:flex;gap:4px;border-bottom:1px solid var(--borda);margin:-4px 0 4px}.abas button{background:transparent;color:var(--txt2);border-radius:10px 10px 0 0;border-bottom:2px solid transparent;padding:9px 16px}
.abas button[aria-selected="true"]{color:var(--txt);border-bottom-color:var(--serie)}.rola{overflow-x:auto}table.edit{min-width:760px}table.edit input,table.edit select{padding:6px 8px;border-radius:8px}
select{font:inherit;background:var(--card);border:1px solid var(--borda);color:var(--txt);border-radius:10px;padding:9px 10px}button.mini{padding:4px 10px}.campo{display:grid;gap:4px;font-size:12px;color:var(--txt2)}
</style></head><body><main>
<form id="login" hidden><h1>Painel Retrozap</h1><p class="sub">Digite a senha do painel (segredo ADMIN_SENHA na Cloudflare).</p><input id="senha" type="password" autocomplete="current-password" aria-label="Senha"><button>Entrar</button><p id="erro" class="aviso" role="alert"></p></form>
<div id="app" hidden></div></main>
<div class="tip" id="tip"></div>
<script>
const $ = s => document.querySelector(s), esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt = n => Number(n || 0).toLocaleString('pt-BR'), brl = n => Number(n || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), pct = n => (Number(n || 0) * 100).toLocaleString('pt-BR', {maximumFractionDigits: 1}) + '%';
let senha = ''; try { senha = localStorage.getItem('rz_admin') || ''; } catch {}
const tile = (v, l, d = '') => '<div class="card tile"><div class="v">' + v + '</div><div class="l">' + l + '</div>' + (d ? '<div class="d">' + d + '</div>' : '') + '</div>';
// últimos 30 dias, um ponto por dia (dias sem dado = 0)
const dias30 = (pares, ate = 0) => { const m = new Map(pares); return Array.from({length: 30}, (_, i) => { const d = new Date(Date.now() - (29 - i + ate) * 864e5).toISOString().slice(0, 10); return [d, m.get(d) || 0]; }); };
function barras(titulo, serie, rotulo){
  const W = 600, H = 150, base = H - 18, max = Math.max(1, ...serie.map(s => s[1])), bw = W / serie.length, soma = serie.reduce((a, s) => a + s[1], 0);
  const r = serie.map(([d, v], i) => { const h = v ? Math.max(3, v / max * (base - 10)) : 0, x = i * bw + 1;
    return '<rect class="alvo" x="' + (i * bw) + '" y="0" width="' + bw + '" height="' + base + '" data-t="' + esc(d.split('-').reverse().slice(0, 2).join('/') + ': ' + fmt(v) + ' ' + rotulo) + '"></rect>' +
      (h ? '<rect class="barra" x="' + x + '" y="' + (base - h) + '" width="' + Math.max(1, bw - 2) + '" height="' + h + '" rx="2" fill="var(--serie)"></rect>' : ''); }).join('');
  const ex = [0, 14, 29].map(i => '<text class="eixo" x="' + (i * bw + bw / 2) + '" y="' + (H - 4) + '" text-anchor="' + (i ? i === 29 ? 'end' : 'middle' : 'start') + '">' + serie[i][0].split('-').reverse().slice(0, 2).join('/') + '</text>').join('');
  return '<div class="card graf"><div class="ttl"><b>' + titulo + '</b><span>' + fmt(soma) + ' em 30 dias · máx. ' + fmt(max) + '/dia</span></div><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + esc(titulo) + ': ' + fmt(soma) + ' em 30 dias">' +
    '<line x1="0" x2="' + W + '" y1="' + base + '" y2="' + base + '" stroke="var(--borda)"></line>' + r + ex + '</svg></div>';
}
const tabela = (cab, rows) => '<table><thead><tr>' + cab.map(c => '<th' + (c[1] ? ' class="n"' : '') + '>' + c[0] + '</th>').join('') + '</tr></thead><tbody>' +
  (rows.length ? rows.map(r => '<tr>' + r.map((v, i) => '<td' + (cab[i][1] ? ' class="n"' : '') + '>' + v + '</td>').join('') + '</tr>').join('') : '<tr><td colspan="' + cab.length + '" class="aviso">Nada ainda.</td></tr>') + '</tbody></table>';
const falta = (o, como) => o.erro === 'nao_configurado' ? '<div class="card aviso"><b>Não configurado.</b> ' + como + '</div>' : '<div class="card aviso"><b>Erro:</b> ' + esc(o.erro) + '</div>';
const MODOS = {amigos: 'Amigos', familia: 'Família', trabalho: 'Trabalho', comunidade: 'Comunidade', casal: 'Casais'};
const LINKS = [['Cloudflare (Worker)', 'https://dash.cloudflare.com/?to=/:account/workers/services/view/retrozap-v2'], ['D1 retrozap', 'https://dash.cloudflare.com/?to=/:account/workers/d1'],
  ['Google Analytics', 'https://analytics.google.com/'], ['Search Console', 'https://search.google.com/search-console?resource_id=sc-domain:retrozap.com.br'], ['AdSense', 'https://www.google.com/adsense/'],
  ['Mercado Pago', 'https://www.mercadopago.com.br/activities'], ['GitHub', 'https://github.com/gtorniero/retrozap'], ['Instagram', 'https://www.instagram.com/'], ['TikTok Studio', 'https://www.tiktok.com/tiktokstudio'], ['Gmail', 'https://mail.google.com/']];

// ---------- aba Negócio: investimentos (salvos no D1), payback, linha do tempo e plano ----------
const PRECO = 4.99;
const NEG_PADRAO = {inicio: '2026-10-17', horasAntes: 0, valorHora: 0, taxa: 0.99, imposto: 0, extraMes: 0, extraAcum: 0, custos: [
  {nome: 'Claude (assinatura)', valor: 500, freq: 'mensal', desde: '2026-10-01', obs: ''},
  {nome: 'Empresa (abertura e manutenção)', valor: 1000, freq: 'anual', desde: '2026-10-01', obs: 'estimativa: confirmar'},
  {nome: 'Domínio retrozap.com.br', valor: 40, freq: 'anual', desde: '2026-10-01', obs: ''},
  {nome: 'Higgsfield', valor: 150, freq: 'mensal', desde: '2026-10-01', obs: 'estimativa: confirmar'},
  {nome: 'Outras plataformas', valor: 0, freq: 'mensal', desde: '2026-10-01', obs: 'Cloudflare, GitHub, Google e Mercado Pago no plano grátis'}]};
const PREMISSAS = [['taxa', 'Taxa do Mercado Pago no Pix (%)'], ['imposto', 'Imposto sobre a venda (%) · MEI = 0'], ['extraMes', 'AdSense + parcerias por mês (R$)'], ['extraAcum', 'Recebido fora do Pix até hoje (R$)'],
  ['inicio', 'Início do projeto', 'date'], ['horasAntes', 'Horas de trabalho antes do GitHub'], ['valorHora', 'Quanto vale sua hora (R$) · 0 = não contar']];
const MARCOS = [
  ['Antes do GitHub', 'V1: a cerimônia num arquivo só (zapped.html), arrastar e soltar a conversa, sem servidor'],
  ['17/10', 'Site no ar: blog com 11 artigos, perguntas frequentes, AdSense, LGPD e tutorial animado de exportar'],
  ['17–18/10', 'Cobrança: 1º grupo grátis, depois R$ 4,99 no Pix (Mercado Pago), código de acesso e recuperação por e-mail'],
  ['18/10', 'Novo fluxo da cerimônia (início, Ato I, categorias, prêmios), pódio de 3, ranking a partir de 10 grupos'],
  ['19/10', 'Retrozap Casais, Destaques 2026 Premium, categoria livre, vídeo para stories, SEO e cookies (LGPD)'],
  ['19/10', 'Ranking só com 2026 (com estimativas no começo) e Turma: quem sumiu, trocou de número ou saiu'],
  ['19–20/10', 'Vídeo de 20s também para grupos; 2026 em números + ranking numa imagem só'],
  ['20/10', 'AdSense some para quem é Premium; painel /admin com métricas, payback e este plano']];
let NEG = null, DADOS = null;
const num = v => Number(String(v ?? '').replace(',', '.')) || 0;
const meses = desde => { const a = new Date(desde + 'T12:00:00'), b = new Date(); return isNaN(a) || a > b ? (isNaN(a) ? 1 : 0) : (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth() + 1; };
const gasto = c => c.freq === 'mensal' ? num(c.valor) * meses(c.desde) : c.freq === 'anual' ? num(c.valor) * Math.ceil(meses(c.desde) / 12) : meses(c.desde) ? num(c.valor) : 0;
const brl0 = n => Number(n || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL', maximumFractionDigits: 0});
const quando = m => m <= 0 ? 'Já se pagou' : !isFinite(m) ? 'Sem payback' : m < 1 ? '< 1 mês' : Math.ceil(m) + (Math.ceil(m) === 1 ? ' mês' : ' meses');
function conta(){
  const n = NEG, c = DADOS.site?.compras || {}, liq = PRECO * (1 - num(n.taxa) / 100 - num(n.imposto) / 100);
  const custoMes = n.custos.reduce((a, x) => a + (x.freq === 'mensal' ? num(x.valor) : x.freq === 'anual' ? num(x.valor) / 12 : 0), 0);
  const investido = n.custos.reduce((a, x) => a + gasto(x), 0), horas = num(n.horasAntes) + (DADOS.historia?.horas || 0), tempo = horas * num(n.valorHora);
  const vendas30 = (DADOS.site?.cDia || []).reduce((a, x) => a + x.n, 0), recebido = (c.pagos || 0) * liq + num(n.extraAcum);
  const saldo = recebido - investido, recMes = vendas30 * liq + num(n.extraMes), lucro = recMes - custoMes;
  const pay = (sd, l) => sd >= 0 ? 0 : l > 0 ? -sd / l : Infinity;
  return {liq, custoMes, investido, horas, tempo, vendas30, recebido, saldo, recMes, lucro, pay, payback: pay(saldo, lucro), equilibrio: Math.max(0, Math.ceil((custoMes - num(n.extraMes)) / liq))};
}
function calcNegocio(){
  const k = conta(), n = NEG, grupos = DADOS.site?.grupos?.total || 0, pagos = DADOS.site?.compras?.pagos || 0;
  let h = '<section><h2>Payback</h2><div class="grid">' + tile(brl0(k.investido), 'Investido até hoje', 'custo fixo de ' + brl(k.custoMes) + '/mês') + tile(brl0(k.recebido), 'Recebido (líquido)', fmt(pagos) + ' vendas × ' + brl(k.liq)) +
    tile((k.saldo < 0 ? '−' : '+') + brl0(Math.abs(k.saldo)), 'Saldo', k.saldo < 0 ? 'falta recuperar' : 'já no lucro') +
    tile(fmt(k.equilibrio), 'Vendas/mês para empatar', '≈ ' + fmt(Math.ceil(k.equilibrio / 30)) + ' por dia') + tile(quando(k.payback), 'Payback no ritmo atual', fmt(k.vendas30) + ' vendas nos últimos 30 dias' + (isFinite(k.payback) ? '' : ': ainda não cobre o custo fixo'));
  if (num(n.valorHora)) h += tile(brl0(k.tempo), 'Seu tempo', fmt(k.horas) + ' h × ' + brl(n.valorHora)) + tile(quando(k.pay(k.saldo - k.tempo, k.lucro)), 'Payback contando seu tempo');
  h += '</div>';
  const cen = [[k.vendas30, 'Ritmo atual'], [k.equilibrio, 'Empate'], [300, ''], [1000, ''], [3000, '']].filter((x, i, l) => l.findIndex(y => y[0] === x[0]) === i);
  h += '<div class="card" style="margin-top:12px"><b>Cenários (vendas por mês)</b><div class="rola">' + tabela([['Vendas/mês'], ['Receita líquida/mês', 1], ['Lucro/mês', 1], ['Payback', 1]], cen.map(([v, t]) => {
    const l = v * k.liq + num(n.extraMes) - k.custoMes; return [fmt(v) + (t ? ' <span class="tag">' + t + '</span>' : ''), brl(v * k.liq + num(n.extraMes)), (l < 0 ? '−' : '') + brl(Math.abs(l)), quando(k.pay(k.saldo, l))]; })) + '</div>' +
    '<p class="aviso">Payback = quanto falta recuperar ÷ lucro do mês. Retrospectiva vende no fim do ano: dezembro e janeiro devem concentrar boa parte das vendas.</p></div></section>';
  $('#neg-pay').innerHTML = h; h = '';
  // linha do tempo
  const hi = DADOS.historia || {}, dias = Math.max(1, Math.round((Date.now() - new Date(n.inicio + 'T00:00:00')) / 864e5));
  h += '<section><h2>Como chegamos aqui</h2><div class="grid">' + tile(fmt(dias), 'Dias de projeto', 'desde ' + new Date(n.inicio + 'T12:00:00').toLocaleDateString('pt-BR')) + tile(fmt(hi.commits), 'Versões publicadas', 'commits em ' + fmt(hi.dias) + ' dias') +
    tile(fmt(k.horas) + ' h', 'Horas de trabalho', (num(n.horasAntes) ? fmt(n.horasAntes) + ' h antes + ' : '') + fmt(hi.horas) + ' h no GitHub (estimativa mínima)') + tile(fmt(hi.sessoes), 'Sessões de trabalho', 'pelo intervalo entre versões') +
    tile(pct(grupos ? pagos / grupos : 0), 'Vendas por grupo no ranking', 'aproximado') + '</div>' +
    '<div class="card" style="margin-top:12px"><b>Linha do tempo</b>' + tabela([['Quando'], ['O que entrou']], MARCOS.map(([q, t]) => ['<span style="white-space:nowrap">' + q + '</span>', t])) + '</div></section>';
  // plano de negócio
  const meta = Math.max(0, Math.ceil((-Math.min(0, k.saldo) + 3 * k.custoMes) / k.liq));
  const P = [['Resumo', 'O Retrozap transforma o export de um grupo de WhatsApp numa retrospectiva estilo Wrapped (personagens, prêmios, ranking, cards e vídeo), lida 100% no navegador. 1º grupo grátis; R$ 4,99 no Pix libera grupos ilimitados e extras.'],
    ['Oportunidade', 'O Brasil tem mais de 140 milhões de pessoas no WhatsApp e a vida social acontece nos grupos. Retrospectivas viralizam no fim do ano (Spotify Wrapped) e não existe uma para grupos de WhatsApp, em português e com privacidade.'],
    ['Público', 'Grupos de amigos (18–35 anos), famílias, trabalho e comunidades. Casais como segundo produto: presente e datas comemorativas.'],
    ['Diferencial', 'Nenhuma mensagem sai do celular; humor brasileiro; cards e vídeo prontos para stories. Cada grupo tem vários membros que veem o resultado, então um uso puxa outros.'],
    ['Receita', 'Premium por Pix (R$ 4,99, pagamento único) · AdSense para quem não é Premium · parceria Party Games (7% das vendas, desligada) · próximas: pacote Casais no Dia dos Namorados (12/06) e preço por temporada.'],
    ['Aquisição', 'Cards e vídeo compartilhados levam o endereço do site · Reels e TikTok com exemplos · SEO (blog, “WhatsApp Wrapped”) · datas: dezembro/janeiro (retrospectiva), Dia dos Namorados, aniversários de grupo.'],
    ['Metas', 'Empatar: ' + fmt(k.equilibrio) + ' vendas/mês. Temporada dez–jan: ' + fmt(meta) + ' vendas pagam todo o investimento e 3 meses de custo fixo. Acompanhar: grupos/dia, Pix gerado → pago, vendas por grupo.'],
    ['Riscos', 'WhatsApp mudar o formato do export · venda concentrada no fim do ano · pagamento único (pouca recorrência) · cópia da ideia · custo fixo alto para a receita atual (a assinatura do Claude é o maior custo: dá para baixar o plano fora da temporada).'],
    ['Próximos passos', 'Ligar Analytics e Search Console no painel · Instagram e TikTok · preparar a campanha de dezembro · testar preço (ex.: R$ 9,90 no Casais) · e-mail para a lista de novidades no lançamento da temporada.']];
  h += '<section><h2>Plano de negócio</h2><div class="dois">' + P.map(([t, x]) => '<div class="card"><b>' + t + '</b><p style="margin:6px 0 0;color:var(--txt2)">' + x + '</p></div>').join('') + '</div></section>';
  $('#neg-resto').innerHTML = h;
  NEG.custos.forEach((c, i) => { const e = $('#tot' + i); if (e) e.textContent = brl(gasto(c)); });
}
function formNegocio(){
  const linha = (c, i) => '<tr><td><input data-i="' + i + '" data-c="nome" value="' + esc(c.nome) + '" aria-label="Item"></td><td><input data-i="' + i + '" data-c="valor" inputmode="decimal" value="' + esc(c.valor) + '" aria-label="Valor em reais" style="width:90px"></td>' +
    '<td><select data-i="' + i + '" data-c="freq" aria-label="Frequência">' + ['mensal', 'anual', 'único'].map(f => '<option' + (c.freq === f ? ' selected' : '') + '>' + f + '</option>').join('') + '</select></td>' +
    '<td><input type="date" data-i="' + i + '" data-c="desde" value="' + esc(c.desde) + '" aria-label="Desde"></td><td class="n" id="tot' + i + '"></td><td><input data-i="' + i + '" data-c="obs" value="' + esc(c.obs) + '" aria-label="Observação"></td>' +
    '<td><button class="sec mini" data-tira="' + i + '" aria-label="Remover ' + esc(c.nome) + '">×</button></td></tr>';
  $('#neg-form').innerHTML = '<section><h2>Investimentos</h2><div class="card"><div class="rola"><table class="edit"><thead><tr><th>Item</th><th>Valor (R$)</th><th>Frequência</th><th>Desde</th><th class="n">Até hoje</th><th>Observação</th><th></th></tr></thead><tbody>' +
    NEG.custos.map(linha).join('') + '</tbody></table></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="sec" id="mais">+ Adicionar item</button></div>' +
    '<div class="grid" style="margin-top:14px">' + PREMISSAS.map(([k, t, tipo]) => '<label class="campo">' + t + '<input data-p="' + k + '" ' + (tipo ? 'type="' + tipo + '"' : 'inputmode="decimal"') + ' value="' + esc(NEG[k]) + '"></label>').join('') + '</div>' +
    '<div style="display:flex;gap:10px;align-items:center;margin-top:12px"><button id="salvar">Salvar</button><span id="salvo" class="aviso" role="status"></span></div></div></section>';
  $('#neg-form').oninput = $('#neg-form').onchange = e => { const t = e.target;
    if (t.dataset.c) NEG.custos[t.dataset.i][t.dataset.c] = t.value; else if (t.dataset.p) NEG[t.dataset.p] = t.value; else return;
    $('#salvo').textContent = 'Alterações não salvas.'; calcNegocio(); };
  $('#neg-form').onclick = e => { const t = e.target;
    if (t.id === 'mais'){ NEG.custos.push({nome: '', valor: 0, freq: 'mensal', desde: new Date().toISOString().slice(0, 10), obs: ''}); formNegocio(); calcNegocio(); }
    if (t.dataset.tira){ NEG.custos.splice(Number(t.dataset.tira), 1); formNegocio(); calcNegocio(); $('#salvo').textContent = 'Alterações não salvas.'; }
    if (t.id === 'salvar') salvaNegocio(); };
}
async function salvaNegocio(){
  $('#salvo').textContent = 'Salvando…';
  const r = await fetch('/api/admin/negocio', {method: 'POST', headers: {'x-senha': senha, 'content-type': 'application/json'}, body: JSON.stringify(NEG)}).catch(() => null);
  $('#salvo').textContent = r?.ok ? 'Salvo.' : 'Não consegui salvar. Tente de novo.';
}
function negocio(d){
  DADOS = d; NEG = Object.assign(JSON.parse(JSON.stringify(NEG_PADRAO)), d.negocio || {});
  formNegocio(); calcNegocio();
}

function render(d){
  const s = d.site || {}, g = s.grupos || {}, c = s.compras || {}, a = d.analytics || {}, b = d.busca || {}, ide = Object.fromEntries((s.ideias || []).map(x => [x.tipo, x.n]));
  const conv = c.pix ? (c.pagos || 0) / c.pix : 0, sug = Object.entries(ide).filter(([t]) => t !== 'novidades').reduce((x, [, n]) => x + n, 0);
  let h = '<header><div><h1>Painel Retrozap</h1><div class="sub">Atualizado ' + new Date(d.gerado).toLocaleString('pt-BR') + '</div></div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
    '<span class="status"><span class="ponto' + (d.cobranca === 'ligada' ? '' : ' off') + '"></span>Cobrança ' + esc(d.cobranca) + '</span><button class="sec" id="sair">Sair</button><button id="atualizar">Atualizar</button></div></header>' +
    '<nav class="abas" role="tablist"><button role="tab" data-aba="m">Métricas</button><button role="tab" data-aba="n">Negócio</button></nav><div id="aba-m" role="tabpanel">';
  h += '<section><h2>Links</h2><div class="links">' + LINKS.map(([t, u]) => '<a href="' + u + '" target="_blank" rel="noopener">' + t + ' ↗</a>').join('') + '</div></section>';
  if (s.erro) h += '<section><h2>Site</h2>' + falta(s) + '</section>';
  else {
    h += '<section><h2>Site</h2><div class="grid">' + tile(fmt(g.total), 'Grupos no ranking', fmt(g.semana) + ' nos últimos 7 dias · ' + fmt(g.hoje) + ' hoje') +
      tile(fmt(c.clientes), 'Clientes premium', fmt(c.pagos) + ' pagamentos') + tile(brl0(c.receita), 'Receita bruta (Pix)', fmt(c.semana) + ' pagos nos últimos 7 dias') +
      tile(pct(conv), 'Pix gerado → pago', fmt(c.pix) + ' Pix gerados') + tile(fmt(ide.novidades), 'E-mails de novidades') + tile(fmt(sug), 'Sugestões recebidas') + '</div>';
    h += '<div class="dois" style="margin-top:12px">' + barras('Grupos por dia', dias30((s.gDia || []).map(x => [x.dia, x.n])), 'grupos') + barras('Pagamentos por dia', dias30((s.cDia || []).map(x => [x.dia, x.n])), 'pagos') + '</div>';
    h += '<div class="dois" style="margin-top:12px"><div class="card"><b>Grupos por tipo</b>' + tabela([['Tipo'], ['Grupos', 1], ['%', 1]], (s.modos || []).map(m => [MODOS[m.modo] || esc(m.modo), fmt(m.n), pct(m.n / (g.total || 1))])) + '</div>' +
      '<div class="card"><b>Últimos pagamentos</b>' + tabela([['E-mail'], ['Quando', 1], ['Valor', 1]], (s.ultimas || []).map(u => [esc(u.email), new Date(u.pago).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'}), brl(u.valor)])) + '</div></div>';
    h += '<div class="card" style="margin-top:12px"><b>Sugestões recentes</b>' + tabela([['Quando'], ['Tipo'], ['Texto']], (s.recentes || []).map(r => [new Date(r.criado).toLocaleDateString('pt-BR'), '<span class="tag">' + esc(r.tipo) + '</span>', esc(r.texto)])) + '</div>';
    h += '<p class="aviso">“Grupos no ranking” conta só quem aceitou entrar na comparação (o resto nunca sai do celular). Para todos os acessos, veja o Analytics.</p></section>';
  }
  h += '<section><h2>Google Analytics · 30 dias</h2>';
  if (a.erro) h += falta(a, 'Crie a conta de serviço, coloque o JSON no segredo GOOGLE_SA e o número da propriedade na variável GA4_PROPERTY.');
  else h += '<div class="grid">' + tile(fmt(a.total[0]), 'Usuários ativos') + tile(fmt(a.total[1]), 'Sessões') + tile(fmt(a.total[2]), 'Visualizações') + '</div><div class="dois" style="margin-top:12px">' +
    barras('Usuários por dia', dias30(a.dia.map(x => [x[0], x[1]])), 'usuários') + '<div class="card"><b>Origem das sessões</b>' + tabela([['Canal'], ['Sessões', 1]], a.canais.map(x => [esc(x[0]), fmt(x[1])])) + '</div></div>' +
    '<div class="card" style="margin-top:12px"><b>Páginas mais vistas</b>' + tabela([['Página'], ['Visualizações', 1]], a.paginas.map(x => [esc(x[0]), fmt(x[1])])) + '</div>';
  h += '</section><section><h2>Google Search · 30 dias</h2>';
  if (b.erro) h += falta(b, 'Usa a mesma conta de serviço (GOOGLE_SA); adicione o e-mail dela como usuário no Search Console.');
  else h += '<div class="grid">' + tile(fmt(b.total.cliques), 'Cliques') + tile(fmt(b.total.impressoes), 'Impressões') + tile(pct(b.total.ctr), 'CTR') + tile((b.total.posicao || 0).toLocaleString('pt-BR', {maximumFractionDigits: 1}), 'Posição média') + '</div>' +
    '<div class="dois" style="margin-top:12px">' + barras('Cliques por dia', dias30(b.dia.map(x => [x.dia, x.cliques]), 1), 'cliques') + '<div class="card"><b>O que buscaram</b>' +
    tabela([['Termo'], ['Cliques', 1], ['Impr.', 1], ['Pos.', 1]], b.termos.map(x => [esc(x.termo), fmt(x.cliques), fmt(x.impressoes), x.posicao.toLocaleString('pt-BR', {maximumFractionDigits: 1})])) + '</div></div>' +
    '<p class="aviso">O Google libera os dados de busca com 2–3 dias de atraso.</p>';
  h += '</section></div><div id="aba-n" role="tabpanel"><div id="neg-pay"></div><div id="neg-form"></div><div id="neg-resto"></div></div>';
  $('#app').innerHTML = h;
  negocio(d);
  const aba = a => { try { localStorage.setItem('rz_aba', a); } catch {} document.querySelectorAll('[data-aba]').forEach(b => b.setAttribute('aria-selected', b.dataset.aba === a)); $('#aba-m').hidden = a !== 'm'; $('#aba-n').hidden = a !== 'n'; };
  document.querySelectorAll('[data-aba]').forEach(b => b.onclick = () => aba(b.dataset.aba));
  let a0 = 'm'; try { a0 = localStorage.getItem('rz_aba') || 'm'; } catch {} aba(a0); $('#app').hidden = false; $('#login').hidden = true;
  $('#atualizar').onclick = carrega; $('#sair').onclick = () => { try { localStorage.removeItem('rz_admin'); } catch {} senha = ''; $('#app').hidden = true; $('#login').hidden = false; };
}
async function carrega(){
  if (!senha){ $('#login').hidden = false; return; }
  const r = await fetch('/api/admin/dados', {headers: {'x-senha': senha}}).catch(() => null);
  if (r?.ok) return render(await r.json());
  $('#app').hidden = true; $('#login').hidden = false;
  $('#erro').textContent = r?.status === 401 ? 'Senha errada.' : r?.status === 503 ? 'Painel desligado: crie o segredo ADMIN_SENHA na Cloudflare.' : 'Não consegui carregar. Tente de novo.';
}
$('#login').onsubmit = e => { e.preventDefault(); senha = $('#senha').value; try { localStorage.setItem('rz_admin', senha); } catch {} carrega(); };
const tip = $('#tip');
document.addEventListener('mousemove', e => { const t = e.target.closest?.('[data-t]'); if (!t){ tip.style.display = 'none'; return; }
  tip.textContent = t.dataset.t; tip.style.display = 'block'; tip.style.left = Math.min(e.pageX + 12, innerWidth - tip.offsetWidth - 8) + 'px'; tip.style.top = (e.pageY - 34) + 'px'; });
carrega();
</script></body></html>`;
