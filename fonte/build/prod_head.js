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
  if (['inicio','ja_tenho','caixa','sem_exportar','problema'].includes(params.de)) p.de = params.de;
  if (['ate_300','300_3000','mais_3000'].includes(params.faixa_msgs)) p.faixa_msgs = params.faixa_msgs;
  if (['zip','txt','outro'].includes(params.tipo)) p.tipo = params.tipo;
  if (typeof params.recarregou === 'boolean') p.recarregou = params.recarregou;
  if (exemplo) p.exemplo = true;
  try { if (window.rzMetaEvent && marketing) window.rzMetaEvent(nome, exemplo); } catch {}
  try { if (analytics && configurado(CONFIG.GA_ID)) gtag('event', nome, p); } catch {}
  try { if (marketing && window.RZ_GTM && !exemplo) dataLayer.push(Object.assign({event: 'rz_' + nome}, p)); } catch {}
}
function compraConfirmada(m){
  if (!m || !/^[a-f0-9]{64}$/.test(m.id) || !Number.isFinite(m.valor) || m.valor <= 0 || m.moeda !== 'BRL') return;
  try {
    if (localStorage.getItem('rz_cookies') !== 'sim' || localStorage.getItem('rz_venda_' + m.id)) return;
    // Não tentar medir em URL sensível; o servidor só fornece m para venda real aprovada.
    if (!window.rzSafeMeasurementPage?.()) return;
    localStorage.setItem('rz_venda_' + m.id, '1');
    gtag('event', 'purchase', {transaction_id:m.id,value:m.valor,currency:'BRL',page_title:'Retrozap',page_location:location.origin+location.pathname});
    if (localStorage.getItem('rz_marketing_v1') === 'sim') window.rzMetaPurchase?.(m.valor, m.id);
  } catch {} // Sem armazenamento, não arriscar duplicar venda.
}

/* ---------- Uma página por tela: cada tela conta como página vista ---------- */
function ir(rota){
  gtag('set', {page_title:'Retrozap',page_location:location.origin+rota,page_referrer:''});
  if (location.pathname !== rota) history.pushState({rota}, '', rota); // o GA conta a troca de tela como page_view
}
window.addEventListener('popstate', () => {
  if (location.pathname === '/') return inicio();
  voltarPilha();
});

/* ---------- Aviso de cookies ---------- */
function avisoCookies(forcar = false){
  if (document.querySelector('.cookies')) return;
  try { if (!forcar && localStorage.getItem('rz_cookies') && localStorage.getItem('rz_marketing_v1')) return; } catch {}
  const b = document.createElement('div'); b.className = 'cookies';
  b.innerHTML = 'Usamos cookies para contar visitas. Se você aceitar, Google e Meta também poderão medir nossas campanhas e personalizar anúncios. Suas mensagens nunca saem do seu celular. <a href="/privacidade">Política de privacidade</a> <button class="btn btn-main mini" type="button" data-ck="sim">Aceitar</button> <button class="btn btn-ghost mini" type="button" data-ck="nao">Só o essencial</button>';
  b.querySelectorAll('[data-ck]').forEach(bt => bt.onclick = () => {
    const sim = bt.dataset.ck === 'sim'; try { localStorage.setItem('rz_cookies', bt.dataset.ck); } catch {}
    try { localStorage.setItem('rz_marketing_v1', bt.dataset.ck); window.dispatchEvent(new Event('rz:marketing-consent')); } catch {}
    try { gtag('consent', 'update', {ad_storage: sim ? 'granted' : 'denied', ad_user_data: sim ? 'granted' : 'denied', ad_personalization: sim ? 'granted' : 'denied', analytics_storage: sim ? 'granted' : 'denied'}); } catch {}
    b.remove(); document.body.classList.remove('has-cookies'); });
  document.body.appendChild(b); document.body.classList.add('has-cookies'); // espaço extra para o aviso não cobrir nenhum botão
}

// Permite mudar/revogar a escolha sem apagar todo o site ou o código Premium.
// Fica como link discreto no rodapé do início (data-ckpref), não solto em todas as telas.
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-ckpref]')) avisoCookies(true); });
