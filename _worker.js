// Cloudflare Pages advanced-mode worker.
// Serves the static site and proxies EDHREC JSON at /api/edhrec/pages/... (CORS fallback).
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/edhrec/')) {
      const path = url.pathname.slice('/api/edhrec/'.length);
      // Only allow EDHREC page JSON — nothing else can be proxied.
      if (!/^pages\/[a-z0-9\-\/]+\.json$/.test(path)) {
        return new Response('Bad path', { status: 400 });
      }
      const upstream = await fetch('https://json.edhrec.com/' + path, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'PhyrexianDeckForge/1.0 (+phyrexian-mtg.blogspot.com)' },
        cf: { cacheTtl: 21600, cacheEverything: true },
      });
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'access-control-allow-origin': '*',
          'cache-control': 'public, max-age=3600',
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
