const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(__dirname + '/meta_pixel.js', 'utf8');
function browser(choice, search = '', hash = '', existing = false, hostname = 'retrozap.com.br') {
  const storage = new Map(choice ? [['rz_marketing_v1', choice]] : [['rz_cookies', 'sim']]);
  const scripts = [], listeners = {};
  const window = {addEventListener: (n, f) => listeners[n] = f};
  if (existing) window.fbq = () => {};
  vm.runInNewContext(source, {
    window, localStorage: {getItem: k => storage.get(k)},
    location: {hostname, pathname: '/', search, hash},
    document: {createElement: () => ({}), head: {appendChild: s => scripts.push(s)}}
  });
  return {window, storage, scripts, listeners};
}
for (const choice of [undefined, 'nao']) assert.equal(browser(choice).scripts.length, 0);
assert.equal(browser('sim', '?ref=segredo').scripts.length, 0);
assert.equal(browser('sim', '', '#segredo').scripts.length, 0);
assert.equal(browser('sim', '', '', true).scripts.length, 0);
assert.equal(browser('sim', '', '', false, 'localhost').scripts.length, 0);
const b = browser('sim');
assert.equal(b.scripts.length, 1);
assert.equal(b.window.fbq.queue.filter(a => a[0] === 'track' && a[1] === 'PageView').length, 1);
const before = b.window.fbq.queue.length;
b.window.rzMetaEvent('nome_do_grupo');
b.window.rzMetaEvent('upload_ok', true);
assert.equal(b.window.fbq.queue.length, before);
b.window.rzMetaEvent('upload_ok', false, {email: 'privado', mensagens: 'segredo'});
assert.deepEqual(Array.from(b.window.fbq.queue.at(-1)), ['trackCustom', 'RetrospectivaIniciada']);
assert.equal(b.scripts.length, 1);
b.storage.set('rz_marketing_v1', 'nao');
b.listeners['rz:marketing-consent']();
assert.deepEqual(Array.from(b.window.fbq.queue.at(-1)), ['consent', 'revoke']);
const count = b.window.fbq.queue.length;
b.window.rzMetaEvent('final_visto');
assert.equal(b.window.fbq.queue.length, count);
console.log('OK: novo consentimento, recusa, URL sensível, duplicação, exemplo, parâmetros privados e revogação.');
