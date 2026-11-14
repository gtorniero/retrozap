/* =====================================================================
   CONFIGURAÇÃO — troque só estes valores antes de publicar
   ===================================================================== */
const CONFIG = {
  SITE: 'https://retrozap.com.br',                 // seu domínio
  GA_ID: 'G-R8R1EN0KQN'                          // Google Analytics 4 > Administrador > Fluxos de dados (opcional)
};
const configurado = v => !!v && !/X{4}|^0+$/.test(v);

/* ---------- Analytics (só contagens, nunca nomes ou mensagens) ---------- */
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }
// a tag oficial do Google (gtag js + config) fica no <head>; cada tela nova vira page_view sozinha (medição otimizada: mudanças no histórico)
function evento(nome, params = {}){
  // Sem eventos antes de aceitar; não copiar parâmetros livres nem conteúdo do grupo.
  let analytics = false, marketing = false;
  try { analytics = localStorage.getItem('rz_cookies') === 'sim'; marketing = localStorage.getItem('rz_marketing_v1') === 'sim'; } catch {}
  const exemplo = !!params.exemplo || !!state.sample;
  const p = {};
  if (['amigos','familia','trabalho','comunidade','casal'].includes(params.modo)) p.modo = params.modo;
  if (['image','video'].includes(params.tipo)) p.tipo = params.tipo;
  if (['trofeu','spoiler','resumo','video','convite'].includes(params.origem)) p.origem = params.origem;
  // funil do onboarding (ob2_*): só valores de uma lista fechada, nunca texto livre
  if (['iphone','android'].includes(params.aparelho)) p.aparelho = params.aparelho;
  if (['ok','pouca_conversa','formato_invalido','zip_sem_conversa','nao_abriu','erro_leitura'].includes(params.resultado)) p.resultado = params.resultado;
  if (['inicio','ja_tenho','caixa','sem_exportar','problema','nao_achei'].includes(params.de)) p.de = params.de;
  if (['sem_exportar','nao_achei'].includes(params.qual)) p.qual = params.qual;
  if (Number.isInteger(params.passo) && params.passo > 0 && params.passo < 10) p.passo = params.passo;
  if (['ate_300','300_3000','mais_3000'].includes(params.faixa_msgs)) p.faixa_msgs = params.faixa_msgs;
  if (['zip','txt','outro'].includes(params.tipo)) p.tipo = params.tipo;
  if (typeof params.recarregou === 'boolean') p.recarregou = params.recarregou;
  if (['video','personagens','livre','destaques','second_group','casal'].includes(params.offer_context)) p.offer_context = params.offer_context;
  if (['pix','card'].includes(params.payment_type)) p.payment_type = params.payment_type;
  if (['invalid_email','network','unavailable','rejected','invalid_response'].includes(params.error_category)) p.error_category = params.error_category;
  if (exemplo) p.exemplo = true;
  if (window.RZ_INTERNO) return; // modo interno (?btw_interno=1): nada de GA4, pixel ou GTM
  // a Meta recebe só o nome do evento (e grupo/casal no Lead); nunca os parâmetros livres
  try { if (window.rzMetaEvent && marketing) window.rzMetaEvent(nome, exemplo, {modo: p.modo}); } catch {}
  try { if (analytics && configurado(CONFIG.GA_ID)){ gtag('event', nome, p); if (GA_ECOMMERCE[nome] && !exemplo) gtag('event', GA_ECOMMERCE[nome], itemPremium(nome)); } } catch {}
  try { if (marketing && window.RZ_GTM && !exemplo) dataLayer.push(Object.assign({event: 'rz_' + nome}, p)); } catch {}
}
// eventos recomendados de e-commerce do GA4, disparados junto com os nossos (os nossos continuam iguais)
// preço mostrado na oferta: o que o servidor mandou (window.RZ_PRECO, via /api/cobranca) ou o preço cheio; a compra usa o valor real do servidor
const precoPremium = () => { const p = Number(window.RZ_PRECO); return p > 0 && p < 1000 ? p : 13.99; };
const GA_ECOMMERCE = {view_offer: 'view_item', checkout_attempt: 'begin_checkout', pix_gerado: 'add_payment_info', cartao_aberto: 'add_payment_info'};
function itemPremium(nome){
  const preco = precoPremium(), d = {currency: 'BRL', value: preco, items: [{item_id: 'rz-premium', item_name: 'Retrozap Premium', price: preco, quantity: 1}]};
  if (nome === 'pix_gerado') d.payment_type = 'pix';
  if (nome === 'cartao_aberto') d.payment_type = 'card';
  return d;
}
function compraConfirmada(m){
  if (!m || !/^[a-f0-9]{64}$/.test(m.id) || !Number.isFinite(m.valor) || m.valor <= 0 || m.moeda !== 'BRL' || window.RZ_INTERNO) return;
  try {
    if (localStorage.getItem('rz_cookies') !== 'sim' || localStorage.getItem('rz_venda_' + m.id)) return;
    // Não tentar medir em URL sensível; o servidor só fornece m para venda real aprovada.
    if (!window.rzSafeMeasurementPage?.()) return;
    localStorage.setItem('rz_venda_' + m.id, '1');
    gtag('event', 'purchase', {transaction_id:m.id,value:m.valor,currency:'BRL',items:[{item_id:'rz-premium',item_name:'Retrozap Premium',price:m.valor,quantity:1}],page_title:'Retrozap',page_location:location.origin+location.pathname});
    if (localStorage.getItem('rz_marketing_v1') === 'sim'){
      window.rzMetaPurchase?.(m.valor, m.id); // mesmo event_id da Conversions API (deduplicação)
      // para a conversão do Google Ads no GTM: valor e id irreversível da venda, nada mais
      if (window.RZ_GTM) dataLayer.push({event: 'rz_purchase', value: m.valor, currency: 'BRL', transaction_id: m.id});
    }
  } catch {} // Sem armazenamento, não arriscar duplicar venda.
}

/* ---------- Uma página por tela: cada tela conta como página vista ---------- */
function ir(rota){
  // a página anterior é uma rota do próprio site (sem parâmetros), para o GA não perder a origem da visita
  gtag('set', {page_title:'Retrozap',page_location:location.origin+rota,page_referrer:location.origin+location.pathname});
  if (location.pathname !== rota) history.pushState({rota}, '', rota); // o GA conta a troca de tela como page_view
}
window.addEventListener('popstate', () => {
  if (location.pathname === '/') return inicio();
  voltarPilha();
});

/* ---------- Aviso de cookies: fica em consentimento.js (o mesmo das páginas de conteúdo) ---------- */
