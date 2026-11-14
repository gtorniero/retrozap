(()=>{'use strict';const brand='retrozap';const key='btw_meta_subject_'+brand;function currentSubject(){const v=document.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(key+'='))?.slice(key.length+1);return v&&/^[a-f0-9-]{36}$/.test(v)?v:localStorage.getItem(key)}function subject(){let id=currentSubject();if(!id){id=crypto.randomUUID();localStorage.setItem(key,id);document.cookie=key+'='+id+'; Max-Age=15552000; Secure; SameSite=Lax; Path=/; Domain=.'+brand+'.com.br'}return id;}function context(){try{if(window.RZ_INTERNO)return null;if(localStorage.getItem('btw_capi_choice_v1')!=='yes')return null;let c;if(brand==='retrozap')c={version:1,marketing:localStorage.getItem('rz_marketing_v1')==='sim',at:Date.now()};else c=JSON.parse(localStorage.getItem(brand==='quiddo'?'qd_consent_v1':'sd_consent_v1')||'null');if(c?.marketing!==true||c.version!==1||!Number.isFinite(c.at))return null;const out={version:1,marketing:true,at:c.at,subject:subject()};const click=new URLSearchParams(location.search).get('fbclid');if(click&&/^[A-Za-z0-9_-]{20,200}$/.test(click)&&!document.cookie.split(';').map(x=>x.trim()).some(x=>x.startsWith('_fbc=')&&x.endsWith('.'+click)))document.cookie='_fbc=fb.1.'+Date.now()+'.'+click+'; Max-Age=7776000; Secure; SameSite=Lax; Path=/; Domain=.'+brand+'.com.br';for(const [key,name] of [['fbp','_fbp'],['fbc','_fbc']]){const v=document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1);if(v&&/^fb\.\d\.\d{10,13}\.[A-Za-z0-9_-]{1,200}$/.test(v))out[key]=v}return out}catch{return null}}function revoke(){let id;try{id=currentSubject()}catch{}if(!id)return;const api=brand==='sportdna'?(window.SPORTDNA_PAYMENTS?.api||'')+'/meta/revoke':'/api/meta/revoke';void fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject:id}),keepalive:true}).catch(()=>{});}window.BTWMetaConsent=Object.freeze({context,revoke});window.addEventListener('storage',e=>{if(['rz_marketing_v1','qd_consent_v1','sd_consent_v1',null].includes(e.key)&&!context())revoke()});})();

/* ---------- Aviso de cookies (igual no app e nas páginas de conteúdo) ----------
   Padrão BTW (14/11/2026): uma frase curta + "Saiba mais"; "Aceitar" é o botão principal (cor da marca, à direita,
   foco inicial) e "Recusar" é o secundário, na mesma barra e do mesmo tamanho. Não responder = recusa.
   As chaves rz_cookies, rz_marketing_v1 e btw_capi_choice_v1 e a revogação da Conversions API não mudam. */
function medicaoLigada(){
  try { return localStorage.getItem('rz_cookies') === 'sim' && localStorage.getItem('rz_marketing_v1') === 'sim'; } catch { return false; }
}
// link do rodapé com o estado atual; tocar nele reabre o aviso (revogar é tão fácil quanto aceitar)
function marcaMedicao(){
  const t = 'Cookies: medição ' + (medicaoLigada() ? 'ligada' : 'desligada');
  document.querySelectorAll('[data-ckpref]').forEach(b => { if (b.textContent !== t) b.textContent = t; });
}
function folgaCookies(){
  // o fim da página ganha espaço para o último botão nunca ficar embaixo do aviso (no app, ajustaAcao também sobe a barra fixa)
  const ck = document.querySelector('.cookies');
  const pb = ck && ck.isConnected ? Math.round(ck.getBoundingClientRect().height + 24) + 'px' : '';
  if (document.body.style.paddingBottom !== pb) document.body.style.paddingBottom = pb;
}
function avisoCookies(forcar = false){
  const aberto = document.querySelector('.cookies');
  if (aberto){ if (forcar) try { aberto.querySelector('[data-ck="sim"]').focus(); } catch {} return; }
  try { if (!forcar && localStorage.getItem('btw_capi_choice_v1') && localStorage.getItem('rz_cookies') && localStorage.getItem('rz_marketing_v1')) return; } catch {}
  const antes = document.activeElement, noApp = !!document.querySelector('.app');
  const b = document.createElement('section'); b.className = 'cookies'; b.setAttribute('aria-label', 'Aviso de cookies');
  b.innerHTML = '<p>Usamos cookies do Google e da Meta para medir visitas, anúncios e compras. Sua conversa continua só no seu celular. '
    + (noApp ? '<a href="/privacidade#medicao" target="_blank" rel="noopener">Saiba mais<span class="sr-only"> (abre em outra aba)</span></a>' : '<a href="/privacidade#medicao">Saiba mais</a>')
    + '</p><div class="ck-bts"><button class="ck-bt ck-nao" type="button" data-ck="nao">Recusar</button><button class="ck-bt ck-sim" type="button" data-ck="sim">Aceitar</button></div>';
  b.querySelectorAll('[data-ck]').forEach(bt => bt.onclick = () => {
    const sim = bt.dataset.ck === 'sim';try{localStorage.setItem('btw_capi_choice_v1',sim?'yes':'no')}catch{} if(!sim)window.BTWMetaConsent?.revoke(); try { localStorage.setItem('rz_cookies', bt.dataset.ck); } catch {}
    try { localStorage.setItem('rz_marketing_v1', bt.dataset.ck); window.dispatchEvent(new Event('rz:marketing-consent'));if(sim)window.BTWMetaConsent?.context(); } catch {}
    try { gtag('consent', 'update', {ad_storage: sim ? 'granted' : 'denied', ad_user_data: sim ? 'granted' : 'denied', ad_personalization: sim ? 'granted' : 'denied', analytics_storage: sim ? 'granted' : 'denied'}); } catch {}
    b.remove(); document.body.classList.remove('has-cookies'); folgaCookies(); marcaMedicao();
    try { if (antes && antes !== document.body && antes.isConnected) antes.focus({preventScroll: true}); } catch {}
  });
  document.body.appendChild(b); document.body.classList.add('has-cookies'); folgaCookies(); // espaço extra para o aviso não cobrir nenhum botão
  try { b.querySelector('[data-ck="sim"]').focus({preventScroll: true}); } catch {}
}
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-ckpref]')) avisoCookies(true); });
addEventListener('resize', folgaCookies);
