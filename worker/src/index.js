const ENDPOINTS = new Set(['news', 'bot', 'history', 'members', 'gallery']);

function json(data, status = 200, origin = '*') {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'cache-control': 'public, max-age=30',
    },
  });
}

async function fetchMicroCMS(endpoint, env) {
  const serviceDomain = env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = env.MICROCMS_API_KEY;

  if (!serviceDomain || !apiKey) {
    return json({ message: 'Worker is not configured.' }, 500, env.ALLOWED_ORIGIN);
  }

  const response = await fetch(`https://${serviceDomain}.microcms.io/api/v1/${endpoint}`, {
    headers: {
      'X-MICROCMS-API-KEY': apiKey,
    },
  });

  if (!response.ok) {
    return json({ message: `microCMS returned HTTP ${response.status}` }, response.status, env.ALLOWED_ORIGIN);
  }

  const data = await response.json();
  return json(data.contents || data, 200, env.ALLOWED_ORIGIN);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'access-control-allow-origin': env.ALLOWED_ORIGIN || '*',
          'access-control-allow-methods': 'GET, OPTIONS',
          'access-control-allow-headers': 'content-type',
        },
      });
    }

    if (request.method !== 'GET') {
      return json({ message: 'Method not allowed.' }, 405, env.ALLOWED_ORIGIN);
    }

    const endpoint = url.pathname.replace(/^\/+|\/+$/g, '');

    if (!ENDPOINTS.has(endpoint)) {
      return json({
        message: 'Not found.',
        endpoints: [...ENDPOINTS].map((name) => `/${name}`),
      }, 404, env.ALLOWED_ORIGIN);
    }

    return fetchMicroCMS(endpoint, env);
  },
};
