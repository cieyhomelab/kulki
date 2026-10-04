import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { expectedSha256, expectedVersion } from './helpers/expected.js';

// Every fetch bypasses caches: a unique query parameter plus no-cache.
/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} url
 */
function fetchFresh(request, url) {
  return request.get(`${url}?nocache=${Math.random().toString(36).slice(2)}`, {
    headers: { 'Cache-Control': 'no-cache' },
  });
}

test('P1: the served file has the expected SHA-256', async ({ request, baseURL }) => {
  const response = await fetchFresh(request, baseURL ?? './');

  expect(response.status()).toBe(200);
  const sum = createHash('sha256')
    .update(await response.body())
    .digest('hex');
  expect(sum).toBe(expectedSha256());
});

test('P1: index.html is identical to the main address', async ({ request, baseURL }) => {
  const root = await fetchFresh(request, baseURL ?? './');
  const index = await fetchFresh(request, `${baseURL ?? './'}index.html`);

  expect(index.status()).toBe(200);
  expect((await index.body()).equals(await root.body())).toBe(true);
});

test('P2: the version marker equals the expected version', async ({ request, baseURL }) => {
  const html = await (await fetchFresh(request, baseURL ?? './')).text();
  const markers = [...html.matchAll(/<meta name="kulki-version" content="([^"]*)" \/>/g)];

  expect(markers.map((match) => match[1])).toEqual([expectedVersion]);
});
