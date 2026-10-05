import { expect, test } from '@playwright/test';
import { arrange } from './helpers/game.js';
import { contrast, luminance, readTextColors } from './helpers/contrast.js';

const EMPTY = Array(9).fill('.........');
const BALL_COLORS = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#00acc1', '#1e53d6', '#8e24aa'];

/** @param {import('@playwright/test').Page} page */
const readLook = (page) =>
  page.evaluate(() => {
    const css = (/** @type {Element} */ el) => globalThis.getComputedStyle(el);
    const q = (/** @type {string} */ id) =>
      /** @type {Element} */ (globalThis.document.querySelector(`[data-testid="${id}"]`));
    return {
      page: css(globalThis.document.body).backgroundColor,
      scheme: css(globalThis.document.documentElement).colorScheme,
      title: css(/** @type {Element} */ (globalThis.document.querySelector('h1'))).color,
      score: css(q('score')).color,
      board: css(q('board')).backgroundColor,
      cell: css(q('cell-0-0')).backgroundColor,
      cellBorder: css(q('cell-0-0')).borderTopColor,
      button: css(q('new-game')).color,
      buttonBg: css(q('new-game')).backgroundColor,
      buttonBorder: css(q('new-game')).borderTopColor,
    };
  });

test.describe('S14: palette and a single dark theme', () => {
  test('S14: looks the same in the light and the dark system theme, and the page is dark', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await arrange(page, { board: EMPTY, score: 5, preview: [1, 2, 3] });
    const light = await readLook(page);
    await page.emulateMedia({ colorScheme: 'dark' });
    await arrange(page, { board: EMPTY, score: 5, preview: [1, 2, 3] });
    const dark = await readLook(page);

    expect(dark).toEqual(light);
    const bg = /** @type {RegExpMatchArray} */ (light.page.match(/\d+/g)).slice(0, 3).map(Number);
    expect(luminance(bg)).toBeLessThanOrEqual(0.05);
  });

  test('S14: every text reaches contrast 4.5:1 on its solid background', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await arrange(page, { board: EMPTY, score: 5, preview: [1, 2, 3] });
    await page.getByTestId('new-game').click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    const withQuestion = /** @type {any[]} */ (await readTextColors(page));
    await page.getByTestId('confirm-no').click();

    const board = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)).join(''),
    );
    await arrange(page, { board, score: 50, best: 10, over: true, record: true });
    await expect(page.getByTestId('game-over-record')).toBeVisible();
    const gameOver = /** @type {any[]} */ (await readTextColors(page));

    const all = [...withQuestion, ...gameOver];
    expect(all.length).toBeGreaterThan(10);
    for (const item of all) {
      expect(item.backgroundImage, item.text).toBe('none');
      expect(contrast(item.color, item.background), item.text).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('S14: the seven ball colours are unchanged', async ({ page }) => {
    await arrange(page, { board: EMPTY, score: 0, preview: [1, 2, 3] });
    const colors = await page.evaluate(() => {
      const style = globalThis.getComputedStyle(globalThis.document.documentElement);
      return [1, 2, 3, 4, 5, 6, 7].map((n) => style.getPropertyValue(`--c${n}`).trim());
    });
    expect(colors).toEqual(BALL_COLORS);
  });
});
