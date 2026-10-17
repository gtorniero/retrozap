// Worker do Retrozap V2: serve o site (pasta public) e responde a /api/stats e /api/ideias.
import { onRequestPost as stats } from '../functions/api/stats.js';
import { onRequestPost as ideias } from '../functions/api/ideias.js';

const ROTAS = { '/api/stats': stats, '/api/ideias': ideias };

export default {
  async fetch(request, env) {
    const url = new URL(request.url), rota = ROTAS[url.pathname];
    if (rota) {
      if (request.method === 'POST') return rota({ request, env });
      return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
    }
    return env.ASSETS.fetch(request);
  }
};
