// Cobrança do Retrozap: R$ 4,99 por Pix (Mercado Pago, API de Orders) libera grupos ilimitados naquele navegador.
// Nenhuma mensagem passa por aqui: só e-mail do pagador, identificador da compra e o código de acesso.
// Segredo MP_TOKEN (Access Token) fica em Cloudflare > Worker > Settings > Variables and Secrets.
// Variável COBRANCA (wrangler.jsonc): "teste" = só aparece com ?teste_cobranca=1 e aprova sozinho (APRO); "ligada" = vale para todos.
// Ver compras: Cloudflare > D1 > retrozap > Console:  SELECT * FROM compras ORDER BY criado DESC;
const PRECO = '4.99';
const MP_PADRAO = 'https://api.mercadopago.com/v1/orders';
const json = (obj, status = 200) => new Response(JSON.stringify(obj), {status, headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'}});
const modo = env => (env.COBRANCA === 'ligada' ? 'ligada' : env.COBRANCA === 'desligada' ? 'desligada' : 'teste');
const tabela = env => env.DB.prepare('CREATE TABLE IF NOT EXISTS compras (ref TEXT PRIMARY KEY, ordem TEXT, email TEXT, status TEXT, codigo TEXT, criado TEXT, pago TEXT, valor TEXT, modo TEXT)').run();
const aleatorio = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
const pago = o => o && (o.status === 'processed' || /accredited|approved/.test(o.status_detail || '') || (o.transactions?.payments || []).some(p => p.status === 'processed' || /accredited|approved/.test(p.status_detail || '')));

async function consultaOrdem(env, id){
  const r = await fetch(`${env.MP_API || MP_PADRAO}/${encodeURIComponent(id)}`, {headers: {Authorization: `Bearer ${env.MP_TOKEN}`}});
  return r.ok ? r.json() : null;
}
// marca como paga e cria o código (uma vez só)
async function confirma(env, ref){
  const c = await env.DB.prepare('SELECT * FROM compras WHERE ref = ?').bind(ref).first();
  if (!c) return null;
  if (c.status === 'pago') return c.codigo;
  const o = await consultaOrdem(env, c.ordem);
  if (!pago(o)) return null;
  const codigo = 'RZ-' + aleatorio(4) + '-' + aleatorio(4);
  await env.DB.prepare("UPDATE compras SET status = 'pago', codigo = ?, pago = ? WHERE ref = ? AND status != 'pago'").bind(codigo, new Date().toISOString(), ref).run();
  return (await env.DB.prepare('SELECT codigo FROM compras WHERE ref = ?').bind(ref).first())?.codigo || codigo;
}

// GET /api/cobranca: o site pergunta se a cobrança está valendo
export async function config({env}){
  return json({modo: modo(env), pronto: !!(env.MP_TOKEN && env.DB), preco: '4,99'});
}

// POST /api/pix {email}: cria o Pix e devolve o QR
export async function criar({request, env}){
  if (!env.MP_TOKEN || !env.DB) return json({error: 'indisponivel'}, 503);
  if (modo(env) === 'desligada') return json({error: 'desligada'}, 403);
  let c; try { c = await request.json(); } catch { return json({error: 'bad_request'}, 400); }
  const email = String(c?.email || '').trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({error: 'email'}, 400);
  await tabela(env);
  const ref = crypto.randomUUID();
  const payer = {email};
  if (modo(env) === 'teste') payer.first_name = 'APRO'; // credencial de teste: aprova sozinho
  const corpo = {
    type: 'online', processing_mode: 'automatic', total_amount: PRECO, external_reference: ref,
    description: 'Retrozap: grupos ilimitados',
    payer,
    transactions: {payments: [{amount: PRECO, payment_method: {id: 'pix', type: 'bank_transfer'}, expiration_time: 'PT30M'}]}
  };
  const r = await fetch(env.MP_API || MP_PADRAO, {method: 'POST', headers: {'content-type': 'application/json', accept: 'application/json', Authorization: `Bearer ${env.MP_TOKEN}`, 'X-Idempotency-Key': ref}, body: JSON.stringify(corpo)});
  const o = await r.json().catch(() => null);
  if (!r.ok || !o?.id){ console.log('mp erro', r.status, JSON.stringify(o).slice(0, 500)); return json({error: 'mp'}, 502); }
  const pm = o.transactions?.payments?.[0]?.payment_method || {};
  await env.DB.prepare('INSERT INTO compras (ref, ordem, email, status, criado, valor, modo) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(ref, o.id, email, 'pendente', new Date().toISOString(), PRECO, modo(env)).run();
  return json({ref, qr: pm.qr_code || '', qr64: pm.qr_code_base64 || '', link: pm.ticket_url || ''});
}

// POST /api/pix/status {ref}: o site pergunta a cada poucos segundos se já pagou
export async function status({request, env}){
  if (!env.MP_TOKEN || !env.DB) return json({error: 'indisponivel'}, 503);
  let c; try { c = await request.json(); } catch { return json({error: 'bad_request'}, 400); }
  const ref = String(c?.ref || '').slice(0, 60);
  if (!ref) return json({error: 'bad_request'}, 400);
  await tabela(env);
  const codigo = await confirma(env, ref);
  return json(codigo ? {pago: true, codigo} : {pago: false});
}

// POST /api/mp-webhook: aviso do Mercado Pago (opcional; a confirmação é sempre conferida direto na API)
export async function webhook({request, env}){
  if (!env.MP_TOKEN || !env.DB) return json({ok: true});
  let c; try { c = await request.json(); } catch { return json({ok: true}); }
  const id = String(c?.data?.id || '').slice(0, 80);
  if (!id) return json({ok: true});
  await tabela(env);
  const linha = await env.DB.prepare('SELECT ref FROM compras WHERE ordem = ?').bind(id).first();
  if (linha) await confirma(env, linha.ref);
  return json({ok: true});
}

// POST /api/acesso {codigo}: confere um código digitado (recuperar acesso em outro navegador)
export async function acesso({request, env}){
  if (!env.DB) return json({ok: false}, 503);
  let c; try { c = await request.json(); } catch { return json({ok: false}, 400); }
  const codigo = String(c?.codigo || '').trim().toUpperCase().slice(0, 20);
  if (!/^RZ-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codigo)) return json({ok: false});
  await tabela(env);
  const linha = await env.DB.prepare("SELECT ref FROM compras WHERE codigo = ? AND status = 'pago'").bind(codigo).first();
  return json({ok: !!linha});
}
