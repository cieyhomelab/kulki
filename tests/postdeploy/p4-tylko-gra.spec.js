import { expect, test } from '@playwright/test';
import { fetchFresh, msToDeadline } from './helpers/fetch.js';
import { openGame } from './helpers/game.js';

const NOT_PUBLISHED = [
  'README.md',
  'README.html',
  'AGENTS.md',
  'AGENTS.html',
  'SDLC.html',
  'CODE_REVIEW.html',
  'BACKWARD_COMPATIBILITY.html',
  'LICENSE',
  'package.json',
  'src/main.js',
  'src/index.html',
  'dist/index.html',
  'docs/adr/0001-stos-technologiczny.html',
  '.ai/specs/2026-10-04-gra-w-kulki.md',
  '.ai/specs/2026-10-04-publikacja-na-github-pages.md',
];

test('P4: nothing but the game is published (404 for repository files)', async ({
  request,
  baseURL,
}) => {
  test.setTimeout(msToDeadline() + 10_000);

  // Retries until the deadline: the previous publication may still be cached for a moment.
  await expect(async () => {
    /** @type {Record<string, number>} */
    const statuses = {};
    for (const path of NOT_PUBLISHED) {
      statuses[path] = (await fetchFresh(request, `${baseURL ?? './'}${path}`)).status();
    }
    expect(statuses).toEqual(Object.fromEntries(NOT_PUBLISHED.map((path) => [path, 404])));
  }).toPass({ timeout: msToDeadline(), intervals: [500, 1000, 2000] });
});

test('P4: the page at the game address is the game, not the README', async ({
  request,
  baseURL,
  page,
}) => {
  const html = await (await fetchFresh(request, baseURL ?? './')).text();
  expect(html).not.toContain('Jak zagrać');
  expect(html).not.toContain('Praca nad kodem');

  await openGame(page);
  await expect(page.getByTestId('board')).toBeVisible();
  const text = await page.locator('body').innerText();
  expect(text).not.toContain('Jak zagrać');
  expect(text).not.toContain('Praca nad kodem');
});
