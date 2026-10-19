// Cloudflare Pages Function: POST /api/stats
// Recebe SÓ NÚMEROS de um grupo (nunca nomes ou mensagens), guarda no banco D1 e devolve
// em que posição o grupo fica entre os grupos do mesmo tipo que já fizeram o Retrozap.
// Desde out/2026 os números são só do ano (campo base = '2026'); só a antiguidade (dias) usa o histórico todo e compara com todos.
//
// Configuração (uma vez, no painel da Cloudflare): Settings > Bindings > D1 database, nome da variável: DB.
// A tabela é criada sozinha na primeira chamada. Sem o banco ligado, a função responde {pronto:false} e o site segue normal.

const MIN_TIPO = 30;  // com 30+ grupos do mesmo tipo, compara só com eles
const MIN_TODOS = 10; // antes disso, compara com todos os grupos (amigos, família...) a partir de 10
const MIN_CASAL = 10; // casal só compara com casais, a partir de 10
const MODOS = ['amigos', 'familia', 'trabalho', 'comunidade', 'casal'];
// campo: [mínimo, máximo] aceitos
const CAMPOS = {
  total: [20, 5e6], por_dia: [0, 1e5], recorde: [1, 1e5], audios: [0, 5e6], figurinhas: [0, 5e6], membros: [2, 5000], dias: [1, 20000],
  risadas: [0, 100], madrugada: [0, 100], fora: [0, 100],                      // % das mensagens
  palavrao: [0, 1e4], furos: [0, 1e4], bomdia: [0, 1e4], parabens: [0, 1e4], apagadas: [0, 1e4], // a cada mil mensagens
  textao: [0, 1e4],                                                           // caracteres por mensagem
  amor: [0, 1e4], coracoes: [0, 1e4]                                          // casal: 'te amo' a cada mil textos, corações a cada 100 mensagens
};
let colunasOk = false;
const COMPARA = Object.keys(CAMPOS).filter(k => k !== 'membros');

const resposta = (obj, status = 200) => new Response(JSON.stringify(obj), {status, headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'}});

export async function onRequestPost({request, env}){
  if (!env.DB) return resposta({pronto: false, motivo: 'sem_banco'});
  let c; try { c = await request.json(); } catch { return resposta({error: 'bad_request'}, 400); }
  const id = String(c?.id || '');
  if (!/^[a-f0-9]{32}$/.test(id) || !MODOS.includes(c?.modo)) return resposta({error: 'bad_request'}, 400);
  const v = {};
  for (const [k, [min, max]] of Object.entries(CAMPOS)){
    const n = Number(c[k] ?? 0);
    if (!Number.isFinite(n) || n < min || n > max) return resposta({error: 'bad_request', campo: k}, 400);
    v[k] = n;
  }
  const cols = Object.keys(CAMPOS);
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS grupos (id TEXT PRIMARY KEY, modo TEXT NOT NULL, criado TEXT NOT NULL, ${cols.map(k => k + ' REAL').join(', ')})`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS grupos_modo ON grupos (modo)`).run();
  if (!colunasOk){ for (const k of ['amor REAL', 'coracoes REAL', 'base TEXT']) try { await env.DB.prepare(`ALTER TABLE grupos ADD COLUMN ${k}`).run(); } catch {} colunasOk = true; }
  const base = /^20\d\d$/.test(String(c.base || '')) ? String(c.base) : '';
  // o mesmo grupo enviado de novo só atualiza a linha (não conta duas vezes)
  await env.DB.prepare(`INSERT OR REPLACE INTO grupos (id, modo, criado, base, ${cols.join(', ')}) VALUES (?, ?, ?, ?, ${cols.map(() => '?').join(', ')})`)
    .bind(id, c.modo, new Date().toISOString().slice(0, 10), base, ...cols.map(k => v[k])).run();
  // só compara com quem mandou números do mesmo período
  const conta = (onde, ...extra) => env.DB.prepare(`SELECT COUNT(*) AS n, ${COMPARA.map(k => `SUM(${k} > ?) AS ${k}`).join(', ')} FROM grupos ${onde} AND COALESCE(base, '') = ?`)
    .bind(...COMPARA.map(k => v[k]), ...extra, base).first();
  let r = await conta('WHERE modo = ?', c.modo), escopo = 'tipo';
  // casal compara só com casais; os grupos nunca se comparam com casais
  if (c.modo !== 'casal' && (r?.n || 0) < MIN_TIPO){ r = await conta('WHERE modo != ?', 'casal'); escopo = 'todos'; }
  // antiguidade: o histórico todo de todos os envios (antigos e novos), no mesmo escopo
  const ant = await env.DB.prepare(`SELECT COUNT(*) AS n, SUM(dias > ?) AS d FROM grupos WHERE ${escopo === 'tipo' ? 'modo = ?' : 'modo != ?'}`).bind(v.dias, escopo === 'tipo' ? c.modo : 'casal').first();
  const n = r?.n || 0;
  if (n < (c.modo === 'casal' ? MIN_CASAL : escopo === 'tipo' ? MIN_TIPO : MIN_TODOS)) return resposta({pronto: false, n});
  // "Top X%": X = % de grupos com valor maior + o próprio. Métrica zerada não vira destaque.
  const top = {}; for (const k of COMPARA) top[k] = v[k] > 0 ? Math.max(1, Math.ceil(((r[k] || 0) + 1) / n * 100)) : 100;
  if (ant?.n) top.dias = Math.max(1, Math.ceil(((ant.d || 0) + 1) / ant.n * 100));
  return resposta({pronto: true, n, top, escopo});
}

export const onRequest = () => resposta({error: 'method_not_allowed'}, 405);
