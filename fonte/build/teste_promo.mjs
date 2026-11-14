// Promoção de lançamento (R$ 13,99 → R$ 8,99 de 01/12 a 31/12, horário de Brasília).
// Simula a data trocando Date.now e responde no lugar do Mercado Pago e do Stripe: nenhuma rede, nenhuma cobrança real.
// Roda as duas cópias do preço: fonte/build/pix.js (Pages Functions) e fonte/build/worker/index.js (Worker que está no ar).
// Uso: node fonte/build/teste_promo.mjs
import assert from 'node:assert/strict';
import * as pix from './pix.js';
import worker from './worker/index.js';

const T = s => Date.parse(s);
const ANTES = T('2026-12-01T02:59:00Z'), INICIO = T('2026-12-01T03:00:00Z'), MEIO = T('2026-12-15T15:00:00Z'),
  ULTIMO = T('2027-01-01T02:59:00Z'), DEPOIS = T('2027-01-01T03:00:00Z'), HOJE = T('2026-11-14T15:00:00Z');
const realNow = Date.now, realFetch = globalThis.fetch;
const comData = (t, f) => async (...a) => { Date.now = () => t; try { return await f(...a); } finally { Date.now = realNow; } };

const db = {prepare(){ return {bind(){ return this; }, async run(){ return {meta: {changes: 1}}; }, async first(){ return null; }, async all(){ return {results: []}; }}; }};
const env = {COBRANCA: 'teste', MP_TOKEN: 'TEST-somente-teste', STRIPE_KEY: 'sk_test_somente_teste', DB: db,
  MP_API: 'https://mp.invalid/v1/orders', MP_PAY_API: 'https://mp.invalid/v1/payments', STRIPE_API: 'https://stripe.invalid/v1/checkout/sessions'};
// respostas falsas: guarda o valor que seria cobrado
let cobrado = [];
globalThis.fetch = async (url, op = {}) => {
  url = String(url);
  if (url.startsWith('https://mp.invalid/')){ const b = JSON.parse(op.body); cobrado.push(['pix', b.total_amount, b.transactions.payments[0].amount]);
    return Response.json({id: 'ORD-TESTE', transactions: {payments: [{payment_method: {qr_code: 'pix-teste', qr_code_base64: '', ticket_url: ''}}]}}); }
  if (url.startsWith('https://stripe.invalid/')){ cobrado.push(['cartao', new URLSearchParams(op.body).get('line_items[0][price_data][unit_amount]')]);
    return Response.json({id: 'cs_test_teste', url: 'https://stripe.invalid/pagar'}); }
  throw new Error('rede bloqueada no teste: ' + url);
};
const post = (rota, corpo) => new Request('https://retrozap.com.br' + rota, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(corpo)});

const copias = {
  'pix.js': {cobranca: () => pix.config({env}), pix: () => pix.criar({request: post('/api/pix', {email: 'teste@example.com'}), env}), cartao: () => pix.cartao({request: post('/api/cartao', {email: 'teste@example.com'}), env})},
  'worker/index.js': {cobranca: () => worker.fetch(new Request('https://retrozap.com.br/api/cobranca'), env), pix: () => worker.fetch(post('/api/pix', {email: 'teste@example.com'}), env), cartao: () => worker.fetch(post('/api/cartao', {email: 'teste@example.com'}), env)}
};

for (const [nome, api] of Object.entries(copias)){
  // fora da janela: preço cheio, sem promoção
  for (const t of [HOJE, ANTES, DEPOIS]){
    const c = await (await comData(t, api.cobranca)()).json();
    assert.equal(c.preco, '13,99', `${nome} ${new Date(t).toISOString()}`); assert.equal(c.precoCartao, '13,99'); assert.equal(c.promo, null);
    cobrado = []; await comData(t, api.pix)(); await comData(t, api.cartao)();
    assert.deepEqual(cobrado, [['pix', '13.99', '13.99'], ['cartao', '1399']], `${nome} cobra 13,99 fora da janela`);
  }
  // dentro da janela (00:00 de 01/12 até 23:59 de 31/12 em Brasília): 8,99 no Pix e no cartão, e o site recebe a promoção
  for (const t of [INICIO, MEIO, ULTIMO]){
    const c = await (await comData(t, api.cobranca)()).json();
    assert.equal(c.preco, '8,99', `${nome} ${new Date(t).toISOString()}`); assert.equal(c.precoCartao, '8,99');
    assert.deepEqual(c.promo, {de: '13,99', por: '8,99', fim: '2026-12-31'});
    cobrado = []; const p = await (await comData(t, api.pix)()).json(); await comData(t, api.cartao)();
    assert.equal(p.preco, '8,99');
    assert.deepEqual(cobrado, [['pix', '8.99', '8.99'], ['cartao', '899']], `${nome} cobra 8,99 na promoção`);
  }
  console.log(`OK ${nome}: 13,99 sem promoção antes de 01/12 e a partir de 01/01; 8,99 no Pix e no cartão de 01/12 a 31/12 (Brasília).`);
}
globalThis.fetch = realFetch;
