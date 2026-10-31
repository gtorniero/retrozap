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
  try { if (window.rzMetaEvent) window.rzMetaEvent(nome, !!params.exemplo || !!state.sample); } catch {}
  try { if (configurado(CONFIG.GA_ID)) gtag('event', nome, params); } catch {}
  try { if (window.RZ_GTM) dataLayer.push(Object.assign({event: 'rz_' + nome}, params)); } catch {} // Tag Manager: gatilhos de conversão (rz_upload_ok, rz_compartilhou...)
}

/* ---------- Uma página por tela: cada tela conta como página vista ---------- */
function ir(rota){
  if (location.pathname !== rota) history.pushState({rota}, '', rota); // o GA conta a troca de tela como page_view
}
window.addEventListener('popstate', () => {
  if (location.pathname === '/') return inicio();
  if (!state.data) return home();
  voltarPilha();
});

/* ---------- Aviso de cookies ---------- */
function avisoCookies(){
  try { if (localStorage.getItem('rz_cookies') && localStorage.getItem('rz_marketing_v1')) return; } catch {}
  const b = document.createElement('div'); b.className = 'cookies';
  b.innerHTML = 'Usamos cookies para contar visitas. Se você aceitar, Google e Meta também poderão medir nossas campanhas e personalizar anúncios. Suas mensagens nunca saem do seu celular. <a href="/privacidade">Política de privacidade</a> <button class="btn btn-main mini" type="button" data-ck="sim">Aceitar</button> <button class="btn btn-ghost mini" type="button" data-ck="nao">Só o essencial</button>';
  b.querySelectorAll('[data-ck]').forEach(bt => bt.onclick = () => {
    const sim = bt.dataset.ck === 'sim'; try { localStorage.setItem('rz_cookies', bt.dataset.ck); } catch {}
    try { localStorage.setItem('rz_marketing_v1', bt.dataset.ck); window.dispatchEvent(new Event('rz:marketing-consent')); } catch {}
    try { gtag('consent', 'update', {ad_storage: sim ? 'granted' : 'denied', ad_user_data: sim ? 'granted' : 'denied', ad_personalization: sim ? 'granted' : 'denied', analytics_storage: sim ? 'granted' : 'denied'}); } catch {}
    b.remove(); document.body.classList.remove('has-cookies'); });
  document.body.appendChild(b); document.body.classList.add('has-cookies'); // espaço extra para o aviso não cobrir nenhum botão
}
