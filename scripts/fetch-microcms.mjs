import { mkdir, writeFile } from 'node:fs/promises';

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
  throw new Error('MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY are required.');
}

const endpoints = ['news', 'bot', 'history', 'members', 'gallery'];
const apiBase = `https://${serviceDomain}.microcms.io/api/v1`;

async function request(endpoint, query = '') {
  const response = await fetch(`${apiBase}/${endpoint}${query}`, {
    headers: { 'X-MICROCMS-API-KEY': apiKey },
  });

  if (!response.ok) {
    throw new Error(`${endpoint}: microCMS returned HTTP ${response.status}`);
  }

  return response.json();
}

async function fetchEndpoint(endpoint) {
  const firstPage = await request(endpoint);

  if (!Array.isArray(firstPage.contents)) {
    return firstPage;
  }

  const totalCount = firstPage.totalCount ?? firstPage.contents.length;
  const limit = 100;
  const contents = [];

  for (let offset = 0; offset < totalCount; offset += limit) {
    const page = await request(endpoint, `?limit=${limit}&offset=${offset}`);
    contents.push(...page.contents);
  }

  return contents;
}

await mkdir('data', { recursive: true });

for (const endpoint of endpoints) {
  const data = await fetchEndpoint(endpoint);
  await writeFile(`data/${endpoint}.json`, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Fetched ${endpoint}`);
}
