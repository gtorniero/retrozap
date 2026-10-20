// Worker do Retrozap V2: serve o site (pasta public) e responde às rotas /api/*.
import { onRequestPost as stats } from '../functions/api/stats.js';
import { onRequestPost as ideias } from '../functions/api/ideias.js';
import { config, criar, status, webhook, acesso, recuperar } from '../functions/api/pix.js';
import { painel, dados, salvar } from './admin.js';

const POST = { '/api/stats': stats, '/api/ideias': ideias, '/api/pix': criar, '/api/pix/status': status, '/api/mp-webhook': webhook, '/api/acesso': acesso, '/api/recuperar': recuperar, '/api/admin/negocio': salvar };
const GET = { '/api/cobranca': config, '/api/admin/dados': dados, '/admin': painel };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const rota = (request.method === 'POST' ? POST : request.method === 'GET' ? GET : {})[url.pathname];
    if (rota) return rota({ request, env });
    if (url.pathname.startsWith('/api/')) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { 'content-type': 'application/json' } });
    return env.ASSETS.fetch(request);
  }
};
