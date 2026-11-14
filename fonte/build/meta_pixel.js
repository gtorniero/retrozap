/* Mensuração de mídia: só após novo aceite que menciona a Meta.
   Nunca passar state, parâmetros de evento, nomes, mensagens ou dados da compra. */
(function () {
  'use strict';
  var pixel = '1522604139713675';
  var started = false;
  // Nomes usados por conversões personalizadas, públicos e campanhas: nunca renomear nem mudar quando disparam.
  var allowed = {
    upload_ok: 'RetrospectivaIniciada',
    final_visto: 'RetrospectivaConcluida',
    compartilhou: 'MidiaCompartilhada',
    card_compartilhado: 'MidiaCompartilhada',
    card_salvo: 'MidiaSalva',
    pix_gerado: 'PixGerado',
    cartao_aberto: 'CheckoutAberto',
    view_offer: 'OfertaVista',
    checkout_attempt: 'TentativaCheckout',
    checkout_error: 'ErroCheckout'
  };
  // Evento padrão da Meta disparado logo depois do personalizado (o personalizado continua igual).
  var standard = {
    final_visto: 'Lead',
    view_offer: 'ViewContent',
    cartao_aberto: 'InitiateCheckout',
    pix_gerado: 'AddPaymentInfo'
  };
  // preço mostrado na oferta: o que o servidor mandou (window.RZ_PRECO) ou o preço cheio
  function price() { var p = Number(window.RZ_PRECO); return p > 0 && p < 1000 ? p : 13.99; }
  function standardData(name, extra) {
    if (name === 'final_visto') return {content_category: extra && extra.modo === 'casal' ? 'casal' : 'grupo'};
    var d = {value: price(), currency: 'BRL', content_ids: ['rz-premium'], content_type: 'product', content_category: 'premium'};
    if (name === 'cartao_aberto') { d.num_items = 1; d.payment = 'card'; }
    if (name === 'pix_gerado') d.payment = 'pix';
    return d;
  }
  // Sessão de teste ou interna (?btw_interno=1): nada vai para a Meta.
  var TEST = /[?&](?:teste_cartao|teste_cobranca|plano_teste|simular_anuncios|zerar)=/.test(location.search || '');
  function internal() { return TEST || !!window.RZ_INTERNO; }
  function consent() {
    try { return localStorage.getItem('rz_marketing_v1') === 'sim'; }
    catch (_) { return false; }
  }
  // Parâmetros que descrevem o anúncio ou o link compartilhado (nunca a pessoa). O resto sai da URL.
  function keep(k, v) {
    if (/^utm_[a-z_]{2,20}$/.test(k)) return v.length > 0 && v.length <= 200 && !/[@\u0000-\u001f]/.test(v);
    if (/^(?:fbclid|gclid|gbraid|wbraid)$/.test(k)) return /^[A-Za-z0-9_.-]{1,500}$/.test(v);
    if (k === 'de') return /^(?:trofeu|spoiler|resumo|video|convite)$/.test(v);
    if (k === 'm') return v === 'casal';
    return false;
  }
  function safeQuery() {
    var q = new URLSearchParams(location.search);
    for (var pair of q) if (!keep(pair[0], pair[1])) return false;
    return true;
  }
  function cleanQuery() {
    var q = new URLSearchParams(location.search), out = new URLSearchParams();
    for (var pair of q) if (keep(pair[0], pair[1])) out.append(pair[0], pair[1]);
    var s = out.toString();
    return s ? '?' + s : '';
  }
  function safeHash() { return !location.hash || location.hash === '#medicao'; }
  function safePage() {
    // O SDK envia a URL da página. Não carregar em sessões de teste/internas, com parâmetros
    // desconhecidos, fragmentos ou rotas fora desta lista pública.
    return !internal() && /^(?:www\.)?retrozap\.com\.br$/.test(location.hostname) && safeQuery() && safeHash() &&
      /^\/(?:|comecar|exportar|arquivo|crie-seu-premio|ideias|turma|conhecendo|categorias|premios\/\d+|resumo|fim|destaque|personagens|bonus|privacidade|termos|sobre|contato|como-funciona|como-exportar|perguntas-frequentes|blog\/(?:[a-z0-9-]+)?)$/.test(location.pathname);
  }
  // Em vez de perder a visita inteira, tira da URL o que não é de campanha (fbclid e UTMs ficam).
  function cleanUrl() {
    var target = location.pathname + cleanQuery() + (location.hash === '#medicao' ? location.hash : '');
    if (target === location.pathname + location.search + location.hash) return;
    try { history.replaceState(history.state, '', target); } catch (_) {}
  }
  function ready() {
    try { window.dispatchEvent(new Event('rz:medicao-pronta')); } catch (_) {}
  }
  function start() {
    if (!consent() || !safePage()) return false;
    if (started) return true;
    if (window.fbq) return false; // Não sobrescrever nem duplicar outra instalação.
    started = true;
    // Sem coleta automática de cliques/formulários ou correspondência avançada.
    var f = window.fbq = function () {
      f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments);
    };
    f.push = f; f.loaded = true; f.version = '2.0'; f.queue = [];
    window._fbq = f;
    f('set', 'autoConfig', false, pixel);
    f('consent', 'grant');
    f('init', pixel);
    f('track', 'PageView');
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
    return true;
  }
  function prepare() {
    if (internal() || !consent()) return;
    if (safePage()) { start(); return; }
    // O site lê os próprios parâmetros (retorno do cartão, testes) ao terminar de carregar; só depois a URL é limpa.
    var go = function () { cleanUrl(); start(); ready(); };
    if (typeof document !== 'undefined' && document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
    else go();
  }
  window.rzSafeMeasurementPage = safePage;
  window.rzMetaPurchase = function (value, id) {
    if (!Number.isFinite(value) || value <= 0 || !/^[a-f0-9]{64}$/.test(id) || !start()) return false;
    // eventID = o mesmo event_id que a Conversions API manda pelo servidor (deduplicação)
    window.fbq('track', 'Purchase', {value: value, currency: 'BRL', content_ids: ['rz-premium'], content_type: 'product', num_items: 1}, {eventID: id});
    return true;
  };
  window.rzMetaEvent = function (name, example, extra) {
    if (!allowed[name] || example || !start()) return;
    window.fbq('trackCustom', allowed[name]);
    if (standard[name]) window.fbq('track', standard[name], standardData(name, extra));
  };
  window.addEventListener('rz:marketing-consent', function () {
    if (consent()) { if (!internal() && !safePage()) cleanUrl(); if (start()) ready(); }
    else if (started) window.fbq('consent', 'revoke');
  });
  prepare();
})();
