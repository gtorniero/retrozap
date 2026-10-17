// Worker do Retrozap V2: serve o site (pasta public) e responde a /api/stats.
import { onRequestPost } from '../functions/api/stats.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/stats') {
      if (request.method === 'POST') return onRequestPost({ request, env });
      return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
    }
    return env.ASSETS.fetch(request);
  }
};
