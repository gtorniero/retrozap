// Worker do Retrozap V2: serve o site (pasta public) e responde às rotas /api/*.
import { onRequestPost as stats } from '../functions/api/stats.js';
import { onRequestPost as ideias } from '../functions/api/ideias.js';
import { config, criar, status, webhook, acesso, recuperar, cartao, stripeWebhook } from '../functions/api/pix.js';
import { painel, dados, salvar, funil } from './admin.js';

const POST = { '/api/stats': stats, '/api/ideias': ideias, '/api/pix': criar, '/api/pix/status': status, '/api/mp-webhook': webhook, '/api/acesso': acesso, '/api/recuperar': recuperar, '/api/cartao': cartao, '/api/stripe-webhook': stripeWebhook, '/api/admin/negocio': salvar };
const GET = { '/api/cobranca': config, '/api/admin/dados': dados, '/api/admin/funil': funil, '/admin': painel };

// Marco Civil da Internet (art. 15): registros de acesso (IP, data e hora, rota) guardados sob sigilo por 6 meses.
// Só nas rotas /api (onde a pessoa interage com o servidor). Nada da conversa passa por aqui.
let ACESSOS_OK = false;
async function registraAcesso(env, request, rota){
  if (!env.DB) return;
  try {
    if (!ACESSOS_OK){ await env.DB.prepare('CREATE TABLE IF NOT EXISTS acessos (quando INTEGER NOT NULL, ip TEXT, porta TEXT, rota TEXT)').run(); await env.DB.prepare('CREATE INDEX IF NOT EXISTS acessos_quando ON acessos (quando)').run(); ACESSOS_OK = true; }
    const h = request.headers;
    await env.DB.prepare('INSERT INTO acessos (quando, ip, porta, rota) VALUES (?, ?, ?, ?)').bind(Date.now(), h.get('cf-connecting-ip') || '', h.get('cf-connecting-port') || '', rota).run();
    if (Math.random() < .01) await env.DB.prepare('DELETE FROM acessos WHERE quando < ?').bind(Date.now() - 190*864e5).run(); // apaga o que passou de ~6 meses
  } catch {}
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/') && url.pathname !== '/api/mp-webhook' && url.pathname !== '/api/stripe-webhook') ctx?.waitUntil?.(registraAcesso(env, request, request.method + ' ' + url.pathname));
    const rota = (request.method === 'POST' ? POST : request.method === 'GET' ? GET : {})[url.pathname];
    if (rota) return rota({ request, env });
    if (url.pathname.startsWith('/api/')) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { 'content-type': 'application/json' } });
    return env.ASSETS.fetch(request);
  }
};
