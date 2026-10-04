import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { expectedSha256 } from './helpers/expected.js';
import { fetchFresh } from './helpers/fetch.js';
import { arrange, cell, getState, move, openGame, rows } from './helpers/game.js';
import { isLive, targetUrl } from './helpers/target.js';

/** @param {string} url */
const withoutQuery = (url) => url.split(/[?#]/)[0];

test.describe('P1: the game works at its address', () => {
  test('P1: the address answers 200 and shows the game screen', async ({ page }) => {
    const response = await page.goto('./');

    expect(response?.status()).toBe(200);
    await expect(page.getByTestId('board')).toBeVisible();
    await expect(page.locator('[data-testid^="cell-"]')).toHaveCount(81);
    await expect(page.getByTestId('score')).toBeVisible();
    await expect(page.getByTestId('best-score')).toBeVisible();
    await expect(page.getByTestId('preview').getByTestId('preview-ball')).toHaveCount(3);
    await expect(page.getByTestId('new-game')).toBeVisible();
    await expect(page.getByTestId('sound-toggle')).toBeVisible();
  });

  test('P1: index.html is identical to the main address', async ({ request, baseURL }) => {
    const root = await fetchFresh(request, baseURL ?? './');
    const index = await fetchFresh(request, `${baseURL ?? './'}index.html`);

    expect(root.status()).toBe(200);
    expect(index.status()).toBe(200);
    expect((await index.body()).equals(await root.body())).toBe(true);
  });

  test('P1: the served file has the expected SHA-256', async ({ request, baseURL }) => {
    const response = await fetchFresh(request, baseURL ?? './');

    expect(response.status()).toBe(200);
    const sum = createHash('sha256')
      .update(await response.body())
      .digest('hex');
    expect(sum).toBe(expectedSha256());
  });

  test('P1: plain HTTP is redirected to HTTPS with a 301', async ({ request }) => {
    test.skip(!isLive, 'only the real hosting redirects to HTTPS');

    const response = await request.get(targetUrl.replace(/^https:/, 'http:'), {
      maxRedirects: 0,
      headers: { 'Cache-Control': 'no-cache' },
    });

    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toMatch(/^https:\/\//);
  });

  test('P1: loading the page makes no network request but the page itself', async ({ page }) => {
    const pageUrl = withoutQuery(new URL('./', targetUrl).href);
    /** @type {string[]} */
    const requests = [];
    page.on('request', (request) => requests.push(withoutQuery(request.url())));

    await openGame(page);

    const unexpected = requests.filter(
      (url) => url !== pageUrl && url !== `${pageUrl}index.html` && !url.endsWith('/favicon.ico'),
    );
    expect(unexpected).toEqual([]);
  });

  test('P1: moving a ball works and the console has no errors', async ({ page }) => {
    /** @type {string[]} */
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) {
        errors.push(message.text());
      }
    });

    await openGame(page);
    await arrange(page, {
      board: rows([[4, 4, 2]]),
      preview: [2, 3, 4],
    });
    await move(page, [4, 4], [4, 7]);

    await expect(cell(page, 4, 7)).toHaveAttribute('data-color', '2');
    await expect(cell(page, 4, 4)).toHaveAttribute('data-color', '0');
    expect(errors).toEqual([]);
  });

  test('P1: after a reload the board, score and preview are the same', async ({ page }) => {
    await openGame(page);
    await arrange(page, { board: rows([[4, 4, 2]]), preview: [2, 3, 4] });
    await move(page, [4, 4], [4, 7]);
    const before = await getState(page);

    await page.reload();
    await page.getByTestId('app').and(page.locator('[data-ready="true"]')).waitFor();
    const after = await getState(page);

    expect(after.board).toEqual(before.board);
    expect(after.score).toBe(before.score);
    expect(after.preview).toEqual(before.preview);
  });

  test('P1: the best score survives closing the tab and opening the address again', async ({
    context,
    page,
  }) => {
    // Four balls of color 1 plus one that completes the line.
    const line = /** @type {Array<[number, number, number]>} */ ([
      [8, 0, 1],
      [8, 1, 1],
      [8, 2, 1],
      [8, 3, 1],
      [6, 4, 1],
      [0, 0, 2],
    ]);
    await openGame(page);
    await arrange(page, { board: rows(line), score: 14, best: 20, preview: [2, 3, 4] });
    await move(page, [6, 4], [8, 4]);
    await expect(page.getByTestId('best-score')).toHaveText('24');

    await page.close();
    const reopened = await context.newPage();
    await openGame(reopened);

    await expect(reopened.getByTestId('best-score')).toHaveText('24');
  });
});
