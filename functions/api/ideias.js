// POST /api/ideias: guarda sugestões enviadas pela página "Envie sua ideia" no banco D1 (tabela ideias).
// Para ler: Cloudflare > Storage & Databases > D1 > retrozap > Console:  SELECT * FROM ideias ORDER BY criado DESC;
const resposta = (obj, status = 200) => new Response(JSON.stringify(obj), {status, headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'}});
const TIPOS = ['premio', 'recurso', 'problema', 'outro'];

export async function onRequestPost({request, env}){
  let c; try { c = await request.json(); } catch { return resposta({error: 'bad_request'}, 400); }
  if (c?.site) return resposta({ok: true}); // robô preencheu o campo escondido
  const tipo = TIPOS.includes(c?.tipo) ? c.tipo : 'outro';
  const texto = String(c?.texto || '').trim().slice(0, 600), contato = String(c?.contato || '').trim().slice(0, 120);
  if (texto.length < 5) return resposta({error: 'bad_request'}, 400);
  if (!env.DB) return resposta({error: 'sem_banco'}, 503);
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS ideias (id INTEGER PRIMARY KEY AUTOINCREMENT, criado TEXT NOT NULL, tipo TEXT, texto TEXT NOT NULL, contato TEXT)').run();
  await env.DB.prepare('INSERT INTO ideias (criado, tipo, texto, contato) VALUES (?, ?, ?, ?)').bind(new Date().toISOString(), tipo, texto, contato).run();
  return resposta({ok: true});
}
