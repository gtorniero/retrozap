// Cloudflare Pages Function: POST /api/stats
// Recebe SÓ NÚMEROS de um grupo (nunca nomes ou mensagens), guarda no banco D1 e devolve
// em que posição o grupo fica entre os grupos do mesmo tipo que já fizeram o Retrozap.
//
// Configuração (uma vez, no painel da Cloudflare): Settings > Bindings > D1 database, nome da variável: DB.
// A tabela é criada sozinha na primeira chamada. Sem o banco ligado, a função responde {pronto:false} e o site segue normal.

const MIN_AMOSTRA = 200; // só mostra comparação quando já houver grupos suficientes do mesmo tipo
const MODOS = ['amigos', 'familia', 'trabalho', 'comunidade'];
const CAMPOS = {total: [20, 5e6], por_dia: [0, 1e5], recorde: [1, 1e5], audios: [0, 5e6], membros: [2, 5000], dias: [1, 20000], figurinhas: [0, 5e6]};

const resposta = (obj, status = 200) => new Response(JSON.stringify(obj), {status, headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'}});

export async function onRequestPost({request, env}){
  if (!env.DB) return resposta({pronto: false, motivo: 'sem_banco'});
  let c; try { c = await request.json(); } catch { return resposta({error: 'bad_request'}, 400); }
  const id = String(c?.id || '');
  if (!/^[a-f0-9]{32}$/.test(id) || !MODOS.includes(c?.modo)) return resposta({error: 'bad_request'}, 400);
  const v = {};
  for (const [k, [min, max]] of Object.entries(CAMPOS)){
    const n = Number(c[k]);
    if (!Number.isFinite(n) || n < min || n > max) return resposta({error: 'bad_request'}, 400);
    v[k] = n;
  }
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS grupos (id TEXT PRIMARY KEY, modo TEXT NOT NULL, criado TEXT NOT NULL,
    total INTEGER, por_dia REAL, recorde INTEGER, audios INTEGER, membros INTEGER, dias INTEGER, figurinhas INTEGER)`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS grupos_modo ON grupos (modo)`).run();
  // o mesmo grupo enviado de novo só atualiza a linha (não conta duas vezes)
  await env.DB.prepare(`INSERT OR REPLACE INTO grupos (id, modo, criado, total, por_dia, recorde, audios, membros, dias, figurinhas)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, c.modo, new Date().toISOString().slice(0, 10),
    v.total, v.por_dia, v.recorde, v.audios, v.membros, v.dias, v.figurinhas).run();
  const r = await env.DB.prepare(`SELECT COUNT(*) AS n,
      SUM(total > ?) AS total, SUM(por_dia > ?) AS por_dia, SUM(recorde > ?) AS recorde, SUM(audios > ?) AS audios, SUM(figurinhas > ?) AS figurinhas
    FROM grupos WHERE modo = ?`).bind(v.total, v.por_dia, v.recorde, v.audios, v.figurinhas, c.modo).first();
  const n = r?.n || 0;
  if (n < MIN_AMOSTRA) return resposta({pronto: false, n});
  const top = k => Math.max(1, Math.ceil(((r[k] || 0) + 1) / n * 100)); // "Top X%"
  return resposta({pronto: true, n, top: {total: top('total'), por_dia: top('por_dia'), recorde: top('recorde'), audios: v.audios ? top('audios') : 100, figurinhas: v.figurinhas ? top('figurinhas') : 100}});
}

export const onRequest = () => resposta({error: 'method_not_allowed'}, 405);
