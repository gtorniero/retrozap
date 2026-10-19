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
if (configurado(CONFIG.GA_ID)){ gtag('js', new Date()); gtag('config', CONFIG.GA_ID, {send_page_view: false, anonymize_ip: true}); } // a tag oficial fica no <head>
function evento(nome, params = {}){ try { if (configurado(CONFIG.GA_ID)) gtag('event', nome, params); } catch {} }

/* ---------- Uma página por tela: cada tela conta como página vista ---------- */
function ir(rota){
  if (location.pathname !== rota) history.pushState({rota}, '', rota);
  evento('page_view', {page_location: location.origin + rota, page_path: rota, page_title: document.title});
}
window.addEventListener('popstate', () => {
  if (location.pathname === '/') return inicio();
  if (!state.data) return home();
  voltarPilha();
});

/* ---------- Aviso de cookies ---------- */
function avisoCookies(){
  try { if (localStorage.getItem('rz_cookies')) return; } catch {}
  const b = document.createElement('div'); b.className = 'cookies';
  b.innerHTML = 'Usamos cookies para contar visitas e, se você aceitar, mostrar anúncios personalizados do Google. Suas mensagens nunca saem do seu celular. <a href="/privacidade">Política de privacidade</a> <button class="btn btn-main mini" type="button" data-ck="sim">Aceitar</button> <button class="btn btn-ghost mini" type="button" data-ck="nao">Só o essencial</button>';
  b.querySelectorAll('[data-ck]').forEach(bt => bt.onclick = () => {
    const sim = bt.dataset.ck === 'sim'; try { localStorage.setItem('rz_cookies', bt.dataset.ck); } catch {}
    try { gtag('consent', 'update', {ad_storage: sim ? 'granted' : 'denied', ad_user_data: sim ? 'granted' : 'denied', ad_personalization: sim ? 'granted' : 'denied', analytics_storage: sim ? 'granted' : 'denied'}); } catch {}
    b.remove(); document.body.classList.remove('has-cookies'); });
  document.body.appendChild(b); document.body.classList.add('has-cookies'); // espaço extra para o aviso não cobrir nenhum botão
}
