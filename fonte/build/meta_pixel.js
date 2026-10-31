/* Mensuração de mídia: só após novo aceite que menciona a Meta.
   Nunca passar state, parâmetros de evento, nomes, mensagens ou dados da compra. */
(function () {
  'use strict';
  var pixel = '1522604139713675';
  var started = false;
  var allowed = {
    upload_ok: 'RetrospectivaIniciada',
    final_visto: 'RetrospectivaConcluida',
    compartilhou: 'MidiaCompartilhada',
    pix_gerado: 'PixGerado',
    cartao_aberto: 'CheckoutAberto'
  };
  function consent() {
    try { return localStorage.getItem('rz_marketing_v1') === 'sim'; }
    catch (_) { return false; }
  }
  function safePage() {
    // O SDK envia a URL da página. Não carregar em retornos de pagamento,
    // links com parâmetros, fragmentos ou rotas fora desta lista pública.
    return /^(?:www\.)?retrozap\.com\.br$/.test(location.hostname) && !location.search && !location.hash &&
      /^\/(?:|comecar|turma|conhecendo|categorias|premios\/\d+|resumo|fim|destaque|personagens|bonus|privacidade|termos|sobre|contato|como-funciona|como-exportar|perguntas-frequentes|blog\/(?:[a-z0-9-]+)?)$/.test(location.pathname);
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
  window.rzMetaEvent = function (name, example) {
    if (!allowed[name] || example || !start()) return;
    window.fbq('trackCustom', allowed[name]);
  };
  window.addEventListener('rz:marketing-consent', function () {
    if (consent()) start();
    else if (started) window.fbq('consent', 'revoke');
  });
  start();
})();
