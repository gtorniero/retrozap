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
// token limpo: sem espaços, aspas ou "Bearer" colados por engano
const tok = env => String(env.MP_TOKEN || '').trim().replace(/^['"]|['"]$/g, '').replace(/^Bearer\s+/i, '').trim();
const formaTok = env => { const t = tok(env); return `token ${t.slice(0, 8)}… (${t.length} caracteres)`; };
const aleatorio = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
const pago = o => o && (o.status === 'approved' || o.status === 'processed' || /accredited|approved/.test(o.status_detail || '') || (o.transactions?.payments || []).some(p => p.status === 'processed' || /accredited|approved/.test(p.status_detail || '')));

const MP_PAY = 'https://api.mercadopago.com/v1/payments';
async function consultaOrdem(env, id){
  // "pay:123" = pagamento pela API clássica (/v1/payments); senão, order da API de Orders
  const url = id.startsWith('pay:') ? `${env.MP_PAY_API || MP_PAY}/${encodeURIComponent(id.slice(4))}` : `${env.MP_API || MP_PADRAO}/${encodeURIComponent(id)}`;
  const r = await fetch(url, {headers: {Authorization: `Bearer ${tok(env)}`}});
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
  const up = await env.DB.prepare("UPDATE compras SET status = 'pago', codigo = ?, pago = ? WHERE ref = ? AND status != 'pago'").bind(codigo, new Date().toISOString(), ref).run();
  // só quem efetivamente marcou como pago manda o e-mail (evita e-mail duplicado)
  if (up?.meta?.changes) await enviaCodigo(env, c.email, codigo);
  return (await env.DB.prepare('SELECT codigo FROM compras WHERE ref = ?').bind(ref).first())?.codigo || codigo;
}

// e-mail com o código de acesso (Resend). Sem o segredo RESEND_KEY, simplesmente não envia.
// Remetente: variável EMAIL_DE (padrão "Retrozap <codigo@retrozap.com.br>"), domínio verificado no Resend.
async function enviaCodigo(env, email, codigo){
  if (!env.RESEND_KEY || !email) return false;
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#1A0B2E">
    <h1 style="color:#1A0B2E">Seu acesso premium do Retrozap 🏆</h1>
    <p>Valeu pela compra! Seu acesso está liberado: <b>grupos ilimitados</b> e <b>categorias extras</b>.</p>
    <p>Guarde este código para usar em outro celular ou navegador:</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:2px;background:#FFC23C;padding:14px;border-radius:12px;text-align:center">${codigo}</p>
    <p>Como usar: no Retrozap, quando aparecer o pagamento, toque em <b>"Já paguei, tenho um código"</b> e digite o código acima.</p>
    <p><a href="https://retrozap.com.br" style="color:#7A3FC2">retrozap.com.br</a> · Todo grupo tem uma história.</p>
    <p style="font-size:12px;color:#777">Suas mensagens nunca saem do seu celular. Dúvidas: contato@retrozap.com.br</p></div>`;
  try {
    const r = await fetch(env.RESEND_API || 'https://api.resend.com/emails', {method: 'POST',
      headers: {'content-type': 'application/json', Authorization: `Bearer ${env.RESEND_KEY}`},
      body: JSON.stringify({from: env.EMAIL_DE || 'Retrozap <codigo@retrozap.com.br>', to: [email], reply_to: 'contato@retrozap.com.br',
        subject: 'Seu código de acesso do Retrozap 🏆', html, text: `Seu acesso premium do Retrozap está liberado. Código: ${codigo}. No site, toque em "Já paguei, tenho um código" e digite o código. retrozap.com.br`})});
    if (!r.ok) console.log('resend erro', r.status, (await r.text()).slice(0, 300));
    return r.ok;
  } catch (e) { console.log('resend falhou', String(e)); return false; }
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
  const teste = modo(env) === 'teste';
  // credencial de teste: comprador de teste e APRO (aprova sozinho)
  const payer = teste ? {email: 'test@testuser.com', first_name: 'APRO'} : {email};
  const corpo = {
    type: 'online', processing_mode: 'automatic', total_amount: PRECO, external_reference: ref,
    description: 'Retrozap: grupos ilimitados',
    payer,
    transactions: {payments: [{amount: PRECO, payment_method: {id: 'pix', type: 'bank_transfer'}, expiration_time: 'PT30M'}]}
  };
  const cab = {'content-type': 'application/json', accept: 'application/json', Authorization: `Bearer ${tok(env)}`};
  const motivo = (st, o) => `${st} ${o?.message || o?.error || ''} ${(o?.errors || o?.cause || []).map(e => e.message || e.description || e.code || '').join('; ')}`.trim().slice(0, 300);
  // 1) API de Orders
  let r = await fetch(env.MP_API || MP_PADRAO, {method: 'POST', headers: {...cab, 'X-Idempotency-Key': ref}, body: JSON.stringify(corpo)});
  let o = await r.json().catch(() => null), ordem, pm;
  const erros = [];
  if (r.ok && o?.id){ ordem = o.id; pm = o.transactions?.payments?.[0]?.payment_method || {}; }
  else {
    erros.push('orders: ' + motivo(r.status, o));
    // 2) API clássica de pagamentos
    const classico = {transaction_amount: 4.99, description: corpo.description, payment_method_id: 'pix', external_reference: ref, payer,
      date_of_expiration: new Date(Date.now() + 30*60e3).toISOString().replace('Z', '-00:00')};
    r = await fetch(env.MP_PAY_API || MP_PAY, {method: 'POST', headers: {...cab, 'X-Idempotency-Key': ref + '-p'}, body: JSON.stringify(classico)});
    o = await r.json().catch(() => null);
    if (r.ok && o?.id){ ordem = 'pay:' + o.id; const t = o.point_of_interaction?.transaction_data || {}; pm = {qr_code: t.qr_code, qr_code_base64: t.qr_code_base64, ticket_url: t.ticket_url}; }
    else erros.push('payments: ' + motivo(r.status, o));
  }
  if (!ordem){ console.log('mp erro', erros.join(' | ')); return json({error: 'mp', detalhe: teste ? erros.join(' | ') + ' | ' + formaTok(env) : undefined}, 502); }
  await env.DB.prepare('INSERT INTO compras (ref, ordem, email, status, criado, valor, modo) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(ref, ordem, email, 'pendente', new Date().toISOString(), PRECO, modo(env)).run();
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
  const linha = await env.DB.prepare('SELECT ref FROM compras WHERE ordem = ? OR ordem = ?').bind(id, 'pay:' + id).first();
  if (linha) await confirma(env, linha.ref);
  return json({ok: true});
}

const AMIGOS_HASH = ['b86dd5b2692c26982629e053cc68993bbe6b043a732546d972013bfcc0c9f5c5'];

// POST /api/acesso {codigo}: confere um código digitado (recuperar acesso em outro navegador)
export async function acesso({request, env}){
  if (!env.DB) return json({ok: false}, 503);
  let c; try { c = await request.json(); } catch { return json({ok: false}, 400); }
  await tabela(env);
  // pelo e-mail usado no Pix: devolve o código da compra paga mais recente (simples; dá para melhorar se escalar)
  const email = String(c?.email || '').trim().toLowerCase().slice(0, 120);
  if (email){
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ok: false});
    const filtro = modo(env) === 'ligada' ? " AND modo = 'ligada'" : '';
    const l = await env.DB.prepare(`SELECT codigo FROM compras WHERE email = ? AND status = 'pago'${filtro} ORDER BY pago DESC LIMIT 1`).bind(email).first();
    return json(l?.codigo ? {ok: true, codigo: l.codigo} : {ok: false});
  }
  const codigo = String(c?.codigo || '').trim().toUpperCase().slice(0, 40);
  // código fixo de amigos e família: sempre libera. Só o hash fica aqui; o código em si nunca entra no repositório.
  // Para trocar ou revogar: gerar outro código e substituir o hash (ou usar o segredo CODIGOS_AMIGOS, separados por vírgula).
  if (codigo.startsWith('RZ-AMIGOS-')){
    const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codigo)))].map(x => x.toString(16).padStart(2, '0')).join('');
    const extras = String(env.CODIGOS_AMIGOS || '').toUpperCase().split(',').map(x => x.trim()).filter(Boolean);
    return json({ok: AMIGOS_HASH.includes(h) || extras.includes(codigo)});
  }
  if (!/^RZ-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codigo)) return json({ok: false});
  // com a cobrança ligada, códigos gerados no modo teste não valem
  const linha = modo(env) === 'ligada'
    ? await env.DB.prepare("SELECT ref FROM compras WHERE codigo = ? AND status = 'pago' AND modo = 'ligada'").bind(codigo).first()
    : await env.DB.prepare("SELECT ref FROM compras WHERE codigo = ? AND status = 'pago'").bind(codigo).first();
  return json({ok: !!linha});
}

// POST /api/recuperar {email}: reenvia o código para o e-mail da compra (resposta sempre igual, para não revelar quem comprou)
export async function recuperar({request, env}){
  if (!env.DB) return json({ok: true});
  let c; try { c = await request.json(); } catch { return json({ok: true}); }
  const email = String(c?.email || '').trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ok: false, error: 'email'}, 400);
  await tabela(env);
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS envios (email TEXT PRIMARY KEY, quando INTEGER)').run();
  const ult = await env.DB.prepare('SELECT quando FROM envios WHERE email = ?').bind(email).first();
  if (ult && Date.now() - ult.quando < 2*60e3) return json({ok: true}); // no máximo 1 reenvio a cada 2 minutos
  const filtro = modo(env) === 'ligada' ? " AND modo = 'ligada'" : '';
  const linha = await env.DB.prepare(`SELECT codigo FROM compras WHERE email = ? AND status = 'pago'${filtro} ORDER BY pago DESC LIMIT 1`).bind(email).first();
  if (linha?.codigo){
    await env.DB.prepare('INSERT OR REPLACE INTO envios (email, quando) VALUES (?, ?)').bind(email, Date.now()).run();
    await enviaCodigo(env, email, linha.codigo);
  }
  return json({ok: true});
}
