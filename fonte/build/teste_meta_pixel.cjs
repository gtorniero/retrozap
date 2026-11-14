const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(__dirname + '/meta_pixel.js', 'utf8');
function browser(choice, search = '', hash = '', existing = false, hostname = 'retrozap.com.br', pathname = '/', extra = {}) {
  const storage = new Map(choice ? [['rz_marketing_v1', choice]] : [['rz_cookies', 'sim']]);
  const scripts = [], listeners = {}, fired = [];
  const window = Object.assign({addEventListener: (n, f) => listeners[n] = f, dispatchEvent: e => fired.push(e.type)}, extra);
  if (existing) window.fbq = () => {};
  const location = {hostname, pathname, search, hash};
  // replaceState muda a URL como no navegador (a limpeza de parâmetros desconhecidos usa isso)
  const history = {state: null, replaceState(_s, _t, url) { const u = new URL(url, 'https://' + hostname); location.pathname = u.pathname; location.search = u.search; location.hash = u.hash; }};
  vm.runInNewContext(source, {
    URLSearchParams, URL, Event: class { constructor(type) { this.type = type; } }, window, history, localStorage: {getItem: k => storage.get(k)},
    location, document: {createElement: () => ({}), head: {appendChild: s => scripts.push(s)}}
  });
  return {window, storage, scripts, listeners, location, fired};
}
const last = b => Array.from(b.window.fbq.queue.at(-1));
const tracked = (b, name) => b.window.fbq.queue.filter(a => (a[0] === 'track' || a[0] === 'trackCustom') && a[1] === name);
for (const choice of [undefined, 'nao']) assert.equal(browser(choice).scripts.length, 0);
// Parâmetro desconhecido não derruba mais a medição: ele sai da URL e o pixel carrega com a URL limpa.
let x = browser('sim', '?ref=segredo');
assert.equal(x.scripts.length, 1); assert.equal(x.location.search, ''); assert.deepEqual(x.fired, ['rz:medicao-pronta']);
x = browser('sim', '?utm_source=instagram&utm_medium=paid_social&utm_campaign=teste_01&fbclid=abc123');
assert.equal(x.scripts.length, 1); assert.equal(x.location.search, '?utm_source=instagram&utm_medium=paid_social&utm_campaign=teste_01&fbclid=abc123');
// UTM com espaço e acento (nome da campanha da Meta) e fbclid continuam; o resto sai
x = browser('sim', '?utm_campaign=Black%20Friday%20A%C3%A7%C3%A3o&utm_id=120212345678901234&fbclid=IwAR0abc_DEF-123&ad_id=999&email=pessoa%40example.com');
assert.equal(x.scripts.length, 1);
const q = new URLSearchParams(x.location.search);
assert.equal(q.get('utm_campaign'), 'Black Friday Ação'); assert.equal(q.get('utm_id'), '120212345678901234'); assert.equal(q.get('fbclid'), 'IwAR0abc_DEF-123');
assert.equal(q.get('ad_id'), null); assert(!x.location.search.includes('example'));
x = browser('sim', '?utm_source=pessoa%40email.com');
assert.equal(x.scripts.length, 1); assert(!x.location.search.includes('email'));
x = browser('sim', '?cartao=ok&ref=privado');
assert.equal(x.scripts.length, 1); assert(!x.location.search.includes('privado'));
assert.equal(browser('sim', '?de=convite&m=casal').scripts.length, 1);
x = browser('sim', '', '#segredo'); assert.equal(x.scripts.length, 1); assert.equal(x.location.hash, '');
x = browser('sim', '', '#medicao', false, 'retrozap.com.br', '/privacidade'); assert.equal(x.scripts.length, 1); assert.equal(x.location.hash, '#medicao');
// Sessões de teste e o modo interno da equipe nunca medem (e a URL de teste não é mexida)
for (const flag of ['?teste_cartao=1', '?teste_cobranca=1', '?plano_teste=1', '?simular_anuncios=1', '?zerar=1']) {
  x = browser('sim', flag); assert.equal(x.scripts.length, 0, flag); assert.equal(x.location.search, flag);
  x.window.rzMetaEvent('upload_ok', false); assert.equal(x.scripts.length, 0, flag);
}
x = browser('sim', '', '', false, 'retrozap.com.br', '/', {RZ_INTERNO: true}); assert.equal(x.scripts.length, 0);
assert.equal(x.window.rzMetaPurchase(8.99, 'a'.repeat(64)), false);
assert.equal(browser('sim', '', '', true).scripts.length, 0);
assert.equal(browser('sim', '', '', false, 'localhost').scripts.length, 0);
const b = browser('sim');
assert.equal(b.scripts.length, 1);
assert.equal(b.window.fbq.queue.filter(a => a[0] === 'track' && a[1] === 'PageView').length, 1);
const before = b.window.fbq.queue.length;
b.window.rzMetaEvent('nome_do_grupo');
b.window.rzMetaEvent('upload_ok', true);
b.window.rzMetaEvent('final_visto', true, {modo: 'casal'});
assert.equal(b.window.fbq.queue.length, before);
b.window.rzMetaEvent('upload_ok', false, {email: 'privado', mensagens: 'segredo'});
assert.deepEqual(last(b), ['trackCustom', 'RetrospectivaIniciada']);
// Eventos padrão junto com os personalizados (os personalizados não mudam de nome nem de momento)
b.window.rzMetaEvent('final_visto', false, {modo: 'casal', nome: 'PRIVADO'});
assert.deepEqual(Array.from(b.window.fbq.queue.at(-2)), ['trackCustom', 'RetrospectivaConcluida']);
assert.deepEqual(JSON.parse(JSON.stringify(last(b))), ['track', 'Lead', {content_category: 'casal'}]);
b.window.rzMetaEvent('final_visto', false, {modo: 'PRIVADO'});
assert.deepEqual(JSON.parse(JSON.stringify(last(b))), ['track', 'Lead', {content_category: 'grupo'}]);
const money = {value: 13.99, currency: 'BRL', content_ids: ['rz-premium'], content_type: 'product', content_category: 'premium'};
for (const [ev, custom, std, more] of [['view_offer', 'OfertaVista', 'ViewContent', {}], ['cartao_aberto', 'CheckoutAberto', 'InitiateCheckout', {num_items: 1, payment: 'card'}], ['pix_gerado', 'PixGerado', 'AddPaymentInfo', {payment: 'pix'}]]) {
  b.window.rzMetaEvent(ev, false, {email: 'PRIVADO'});
  assert.deepEqual(Array.from(b.window.fbq.queue.at(-2)), ['trackCustom', custom]);
  assert.deepEqual(JSON.parse(JSON.stringify(last(b))), ['track', std, Object.assign({}, money, more)]);
}
for (const ev of ['checkout_attempt', 'checkout_error', 'card_salvo', 'compartilhou']) { const n = b.window.fbq.queue.length; b.window.rzMetaEvent(ev, false); assert.equal(b.window.fbq.queue.length, n + 1, ev); assert.equal(last(b)[0], 'trackCustom'); }
// na promoção, a oferta vale o preço que o servidor mandou
b.window.RZ_PRECO = 8.99; b.window.rzMetaEvent('view_offer', false); assert.equal(last(b)[2].value, 8.99); delete b.window.RZ_PRECO;
assert.equal(tracked(b, 'Purchase').length, 0);
assert.equal(b.window.rzMetaPurchase(8.99, 'RZ-SEGREDO'), false);
assert.equal(b.window.rzMetaPurchase(8.99, 'b'.repeat(64)), true);
assert.deepEqual(JSON.parse(JSON.stringify(last(b))), ['track', 'Purchase', {value: 8.99, currency: 'BRL', content_ids: ['rz-premium'], content_type: 'product', num_items: 1}, {eventID: 'b'.repeat(64)}]);
assert.equal(b.scripts.length, 1);
b.storage.set('rz_marketing_v1', 'nao');
b.listeners['rz:marketing-consent']();
assert.deepEqual(last(b), ['consent', 'revoke']);
const count = b.window.fbq.queue.length;
b.window.rzMetaEvent('final_visto');
assert.equal(b.window.fbq.queue.length, count);
// Aceite depois de chegar com parâmetro desconhecido: limpa a URL e liga
x = browser(undefined, '?cartao=volta&utm_source=meta');
assert.equal(x.scripts.length, 0); assert.equal(x.location.search, '?cartao=volta&utm_source=meta');
x.storage.set('rz_marketing_v1', 'sim'); x.listeners['rz:marketing-consent']();
assert.equal(x.scripts.length, 1); assert.equal(x.location.search, '?utm_source=meta');
console.log('OK: consentimento, recusa, limpeza de URL, sessões de teste/internas, duplicação, exemplo, eventos padrão, compra com eventID e revogação.');

// O onboarding atual envia upload_ok ainda em /arquivo. Rotas públicas não podem bloquear esse evento.
for (const path of ['/comecar','/exportar','/arquivo','/crie-seu-premio','/ideias']) {
 const x=browser('sim','','',false,'retrozap.com.br',path);
 assert.equal(x.window.rzSafeMeasurementPage(),true,path);
 x.window.rzMetaEvent('upload_ok',false);
 assert.equal(x.window.fbq.queue.filter(a=>a[0]==='trackCustom'&&a[1]==='RetrospectivaIniciada').length,1,path);
 const y=browser('sim','?email=private%40example.invalid','',false,'retrozap.com.br',path);
 assert.equal(y.scripts.length,1); assert.equal(y.location.search,'');
 assert.equal(browser('nao','','',false,'retrozap.com.br',path).scripts.length,0);
}
for (const path of ['/admin','/private','/arquivo/private-name']) assert.equal(browser('sim','','',false,'retrozap.com.br',path).scripts.length,0);
