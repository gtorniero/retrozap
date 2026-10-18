// Cloudflare Pages Function: POST /api/juri
// Julga uma categoria "descreva do seu jeito" com a API da Anthropic.
// Fica DESLIGADA até você configurar a variável ANTHROPIC_API_KEY no painel da Cloudflare
// (Workers & Pages > seu projeto > Settings > Variables and Secrets) e mudar CONFIG.IA_ATIVA para true no index.html.
//
// Variáveis opcionais:
//   MODELO        modelo usado (padrão: claude-haiku-5-5, o mais barato)
//   TETO_DIARIO   máximo de análises por dia (padrão: 300). Exige um KV ligado com o nome LIMITES.
//
// Privacidade: o pedido chega com os nomes já trocados por códigos (P1, P2...) e não é gravado em lugar nenhum.

const resposta = (obj, status = 200) => new Response(JSON.stringify(obj), {status, headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'}});

export async function onRequestPost({request, env}){
  if (!env.ANTHROPIC_API_KEY) return resposta({error: 'ia_desligada'}, 503);
  let corpo;
  try { corpo = await request.json(); } catch { return resposta({error: 'bad_request'}, 400); }
  const prompt = String(corpo?.prompt || '');
  if (prompt.length < 20 || prompt.length > 120000) return resposta({error: 'bad_request'}, 400);

  // teto de gasto diário (opcional)
  if (env.LIMITES){
    const chave = 'dia:' + new Date().toISOString().slice(0, 10);
    const usados = Number(await env.LIMITES.get(chave)) || 0;
    if (usados >= Number(env.TETO_DIARIO || 300)) return resposta({error: 'rate_limited'}, 429);
    await env.LIMITES.put(chave, String(usados + 1), {expirationTtl: 172800});
  }

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json'},
    body: JSON.stringify({
      model: env.MODELO || 'claude-haiku-5-5',
      max_tokens: 800,
      messages: [{role: 'user', content: prompt + '\n\nResponda somente com o JSON pedido, sem nenhum texto antes ou depois.'}]
    })
  });
  if (r.status === 429) return resposta({error: 'rate_limited'}, 429);
  if (!r.ok) return resposta({error: 'upstream_error'}, 502);
  const dados = await r.json();
  const texto = (dados.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  try { return resposta(JSON.parse(texto.slice(ini, fim + 1))); }
  catch { return resposta({error: 'invalid_json'}, 502); }
}

export const onRequest = () => resposta({error: 'method_not_allowed'}, 405);
