// Cloudflare Pages Function: POST /api/stats
// Recebe SÓ NÚMEROS de um grupo (nunca nomes ou mensagens), guarda no banco D1 e devolve
// em que posição o grupo fica entre os grupos do mesmo tipo que já fizeram o Retrozap.
// Desde out/2026 os números são só do ano (campo base = '2026'); a antiguidade (dias) e os totais desde o início (hist_total, hist_audios) usam o histórico todo.
//
// Configuração (uma vez, no painel da Cloudflare): Settings > Bindings > D1 database, nome da variável: DB.
// A tabela é criada sozinha na primeira chamada. Sem o banco ligado, a função responde {pronto:false} e o site segue normal.

const MIN_TIPO = 30;  // com 30+ grupos do mesmo tipo, compara só com eles
const MIN_TODOS = 10; // antes disso, compara com todos os grupos (amigos, família...) a partir de 10
const MIN_CASAL = 30; // casal só compara com casais REAIS (sem estimativa), a partir de 30
const MODOS = ['amigos', 'familia', 'trabalho', 'comunidade', 'casal'];
// campo: [mínimo, máximo] aceitos
const CAMPOS = {
  total: [20, 5e6], por_dia: [0, 1e5], recorde: [1, 1e5], audios: [0, 5e6], figurinhas: [0, 5e6], membros: [2, 5000], dias: [1, 20000],
  risadas: [0, 100], madrugada: [0, 100], fora: [0, 100],                      // % das mensagens
  palavrao: [0, 1e4], furos: [0, 1e4], bomdia: [0, 1e4], parabens: [0, 1e4], apagadas: [0, 1e4], // a cada mil mensagens
  textao: [0, 1e4],                                                           // caracteres por mensagem
  amor: [0, 1e4], coracoes: [0, 1e4]                                          // casal: 'te amo' a cada mil textos, corações a cada 100 mensagens
};
let prontoDB = false, semeado = false;
const EST_ATE = 30; // enquanto houver menos de 30 envios reais do ano no escopo, usa também as estimativas
const RESUMO_MS = 4 * 3600e3; // o resumo do ranking (distribuição de cada métrica) é refeito no máximo a cada 4 horas
const QN = 200; // pontos de corte guardados por métrica (até 400 valores, guarda todos e o cálculo é exato)
async function prepara(env, cols){
  if (prontoDB) return;
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS grupos (id TEXT PRIMARY KEY, modo TEXT NOT NULL, criado TEXT NOT NULL, ${cols.map(k => k + ' REAL').join(', ')})`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS grupos_modo ON grupos (modo)`).run();
  for (const k of ['amor REAL', 'coracoes REAL', 'base TEXT', 'estimado INTEGER', 'hist_total REAL', 'hist_audios REAL']) try { await env.DB.prepare(`ALTER TABLE grupos ADD COLUMN ${k}`).run(); } catch {}
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS resumos (chave TEXT PRIMARY KEY, criado INTEGER, dados TEXT)').run();
  prontoDB = true;
}
// Uma vez: estima os números do ano a partir dos envios antigos (que tinham o histórico todo), para o ranking não começar vazio.
// Volume = média por dia × dias do ano (limitado à idade do grupo); proporções (risadas, madrugada...) ficam iguais.
async function semeia(env, cols, base){
  if (semeado || base !== '2026') return; semeado = true;
  if (await env.DB.prepare("SELECT 1 FROM resumos WHERE chave = 'semeado'").first()) return;
  const d = Math.max(1, Math.floor((Date.now() - Date.UTC(2026, 0, 1)) / 864e5)), vol = `MIN(1.0, por_dia * MIN(dias, ${d}) / MAX(total, 1))`;
  const expr = {total: `ROUND(por_dia * MIN(dias, ${d}))`, audios: `ROUND(audios * ${vol})`, figurinhas: `ROUND(figurinhas * ${vol})`, amor: 'NULL', coracoes: 'NULL'};
  const fonte = `FROM grupos WHERE COALESCE(base, '') = '' AND COALESCE(estimado, 0) = 0 AND modo != 'casal' AND por_dia * MIN(dias, ${d}) >= 20`;
  await env.DB.prepare(`INSERT OR IGNORE INTO grupos (id, modo, criado, base, estimado, ${cols.join(', ')}) SELECT id || '~e', modo, criado, '2026', 1, ${cols.map(k => expr[k] || k).join(', ')} ${fonte}`).run();
  // casais: ainda não há casais antigos; usa os grupos como estimativa de volume e proporções (membros = 2)
  await env.DB.prepare(`INSERT OR IGNORE INTO grupos (id, modo, criado, base, estimado, ${cols.join(', ')}) SELECT id || '~c', 'casal', criado, '2026', 1, ${cols.map(k => k === 'membros' ? '2' : expr[k] || k).join(', ')} ${fonte}`).run();
  await env.DB.prepare("INSERT OR REPLACE INTO resumos (chave, criado, dados) VALUES ('semeado', ?, '{}')").bind(Date.now()).run();
}
// distribuição compacta: todos os valores (até 2×QN) ou QN+1 pontos de corte
const cortes = vals => vals.length <= 2 * QN ? vals : Array.from({length: QN + 1}, (_, i) => vals[Math.round(i * (vals.length - 1) / QN)]);
// quantos valores são maiores que v (exato com a lista completa, aproximado com os cortes)
function acima(q, n, v){ let lo = 0, hi = q.length; while (lo < hi){ const m = (lo + hi) >> 1; if (q[m] <= v) lo = m + 1; else hi = m; } return q.length === n ? n - lo : Math.round(n * (1 - lo / q.length)); }
async function resumo(env, base, escopo, modo){
  const chave = `${base}|${escopo}|${modo}`;
  const r = await env.DB.prepare('SELECT criado, dados FROM resumos WHERE chave = ?').bind(chave).first();
  if (r){ const dd = JSON.parse(r.dados); if (Date.now() - r.criado < (dd.n < 200 ? 10 * 60e3 : RESUMO_MS)) return dd; } // no começo (poucos grupos) refaz a cada 10 min
  const onde = escopo === 'tipo' ? 'modo = ?' : 'modo != ?', arg = escopo === 'tipo' ? modo : 'casal';
  const rows = (await env.DB.prepare(`SELECT ${COMPARA.join(', ')}, COALESCE(estimado, 0) AS est FROM grupos WHERE ${onde} AND COALESCE(base, '') = ?`).bind(arg, base).all()).results || [];
  const reais = rows.filter(x => !x.est).length, est = modo !== 'casal' && reais < EST_ATE, conj = est ? rows : rows.filter(x => !x.est), m = {};
  for (const k of COMPARA){ if (k === 'dias') continue;
    const vals = conj.map(x => x[k]).filter(v => v != null).sort((a, b) => a - b);
    m[k] = {n: vals.length, q: cortes(vals), media: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null}; }
  // antiguidade: o histórico todo dos envios reais (antigos e novos), no mesmo escopo; com menos de 10 reais (ex.: casais no começo), usa também as estimativas
  let dd = ((await env.DB.prepare(`SELECT dias FROM grupos WHERE ${onde} AND COALESCE(estimado, 0) = 0`).bind(arg).all()).results || []).map(x => x.dias).filter(v => v != null);
  if (dd.length < MIN_TODOS && modo !== 'casal') dd = ((await env.DB.prepare(`SELECT dias FROM grupos WHERE ${onde}`).bind(arg).all()).results || []).map(x => x.dias).filter(v => v != null);
  dd.sort((a, b) => a - b);
  m.dias = {n: dd.length, q: cortes(dd)};
  // desde o início: envios novos mandam hist_*; os antigos (sem base) já tinham o histórico todo em total/audios
  for (const [k, antigo] of [['hist_total', 'total'], ['hist_audios', 'audios']]){
    const hv = ((await env.DB.prepare(`SELECT COALESCE(${k}, CASE WHEN COALESCE(base, '') = '' THEN ${antigo} END) AS v FROM grupos WHERE ${onde} AND COALESCE(estimado, 0) = 0`).bind(arg).all()).results || []).map(x => x.v).filter(v => v != null).sort((a, b) => a - b);
    m[k] = {n: hv.length, q: cortes(hv)};
  }
  const dados = {n: conj.length, est, m};
  await env.DB.prepare('INSERT OR REPLACE INTO resumos (chave, criado, dados) VALUES (?, ?, ?)').bind(chave, Date.now(), JSON.stringify(dados)).run();
  return dados;
}
const COMPARA = Object.keys(CAMPOS).filter(k => k !== 'membros');
const HIST = ['hist_total', 'hist_audios'];
const SEM_TIPO = ['audios', 'figurinhas'];

const resposta = (obj, status = 200) => new Response(JSON.stringify(obj), {status, headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'}});

export async function onRequestPost({request, env}){
  if (!env.DB) return resposta({pronto: false, motivo: 'sem_banco'});
  if (env.RANKING === 'desligado') return resposta({pronto: false, motivo: 'desligado'}); // chave de emergência no painel (Variables)
  let c; try { c = await request.json(); } catch { return resposta({error: 'bad_request'}, 400); }
  const id = String(c?.id || '');
  if (!/^[a-f0-9]{32}$/.test(id) || !MODOS.includes(c?.modo)) return resposta({error: 'bad_request'}, 400);
  const v = {};
  for (const [k, [min, max]] of Object.entries(CAMPOS)){
    if (c[k] === null && SEM_TIPO.includes(k)){ v[k] = null; continue; } // Android sem mídia: não sabe o que é áudio/figurinha, fica fora da comparação
    const n = Number(c[k] ?? 0);
    if (!Number.isFinite(n) || n < min || n > max) return resposta({error: 'bad_request', campo: k}, 400);
    v[k] = n;
  }
  const cols = Object.keys(CAMPOS);
  await prepara(env, cols);
  // totais desde o início (opcionais: versões antigas do site não mandam)
  for (const k of HIST){ const n = Number(c[k]); v[k] = Number.isFinite(n) && n >= 0 && n <= 5e7 ? n : null; }
  const base = /^20\d\d$/.test(String(c.base || '')) ? String(c.base) : '';
  // compara com o resumo pronto (refeito no máximo a cada 4 h): cada envio lê 1 linha, não a tabela inteira
  let R = await resumo(env, base, 'tipo', c.modo), escopo = 'tipo';
  // casal compara só com casais; os grupos nunca se comparam com casais
  if (c.modo !== 'casal' && R.n + 1 < MIN_TIPO){ R = await resumo(env, base, 'todos', 'grupos'); escopo = 'todos'; }
  const n = R.n + 1, est = R.est; // + o próprio grupo
  // o mesmo grupo enviado de novo só atualiza a linha (não conta duas vezes)
  await env.DB.prepare(`INSERT OR REPLACE INTO grupos (id, modo, criado, base, ${[...cols, ...HIST].join(', ')}) VALUES (?, ?, ?, ?, ${[...cols, ...HIST].map(() => '?').join(', ')})`)
    .bind(id, c.modo, new Date().toISOString().slice(0, 10), base, ...cols.map(k => v[k]), ...HIST.map(k => v[k])).run();
  await env.DB.prepare('DELETE FROM grupos WHERE id = ?').bind(id + '~e').run(); // o grupo real substitui a estimativa dele
  await semeia(env, cols, base);
  if (n < (c.modo === 'casal' ? MIN_CASAL : escopo === 'tipo' ? MIN_TIPO : MIN_TODOS)) return resposta({pronto: false, n});
  // "Top X%": X = % de grupos com valor maior + o próprio. Métrica zerada não vira destaque.
  const top = {}, media = {};
  for (const k of [...COMPARA, ...HIST]){ const mk = R.m[k]; if (!mk || v[k] == null) continue; const nk = mk.n + 1;
    // sem base suficiente (menos de 10 para comparar) a métrica fica de fora: nunca devolve um "Top 100%" falso
    if (nk >= MIN_TODOS) top[k] = v[k] > 0 ? Math.max(1, Math.ceil((acima(mk.q, mk.n, v[k]) + 1) / nk * 100)) : 100;
    if (k !== 'dias' && mk.n >= MIN_TODOS && mk.media != null) media[k] = Math.round(mk.media * 100) / 100; }
  return resposta({pronto: true, n, top, media, escopo, estimado: est});
}

export const onRequest = () => resposta({error: 'method_not_allowed'}, 405);
