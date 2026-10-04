import { expect, test } from '@playwright/test';
import { arrange, getState, move, rows } from './helpers/game.js';

const KEY = 'kulki.best.v1';
// Four balls of color 1 in row 8 plus one that completes the line; a bystander keeps the board non-empty.
const LINE = /** @type {Array<[number, number, number]>} */ ([
  [8, 0, 1],
  [8, 1, 1],
  [8, 2, 1],
  [8, 3, 1],
  [6, 4, 1],
  [0, 0, 2],
]);

/** @param {import('@playwright/test').Page} page */
const stored = (page) => page.evaluate((key) => localStorage.getItem(key), KEY);

test.describe('S7: best score', () => {
  test('S7: the first launch shows a best score of 0', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('best-score')).toHaveText('0');
    expect((await getState(page)).best).toBe(0);
  });

  test('S7: a beaten best score is stored and survives a reload', async ({ page }) => {
    await arrange(page, { board: rows(LINE), score: 14, best: 20 });
    await move(page, [6, 4], [8, 4]);
    await expect(page.getByTestId('best-score')).toHaveText('24');
    expect(await stored(page)).toBe('24');

    await page.reload();
    await expect(page.getByTestId('app').and(page.locator('[data-ready="true"]'))).toBeVisible();
    await expect(page.getByTestId('best-score')).toHaveText('24');
    await expect(page.getByTestId('score')).toHaveText('0');
  });

  test('S7: a best score that is not beaten stays at its value', async ({ page }) => {
    await arrange(page, { board: rows(LINE), score: 10, best: 50 });
    await move(page, [6, 4], [8, 4]);
    await expect(page.getByTestId('best-score')).toHaveText('50');
    expect(await stored(page)).toBe('50');
  });

  for (const value of ['abc', '-5', '1.5', '', '9007199254740993']) {
    test(`S7: an invalid stored value ${JSON.stringify(value)} reads as 0 without an error message`, async ({
      page,
    }) => {
      await page.addInitScript(
        ([key, v]) => localStorage.setItem(key, v),
        /** @type {[string, string]} */ ([KEY, value]),
      );
      await page.goto('/');
      await expect(page.getByTestId('best-score')).toHaveText('0');
      await expect(page.getByRole('alert')).toHaveCount(0);
    });
  }

  test('S7: unavailable storage reads as 0 and the game still works', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(globalThis, 'localStorage', {
        get() {
          throw new Error('SecurityError');
        },
      });
    });
    await page.goto('/');
    await expect(page.getByTestId('best-score')).toHaveText('0');
    await expect(page.getByRole('alert')).toHaveCount(0);
    await page.evaluate(() => {
      const api = /** @type {any} */ (globalThis).__kulki;
      api.setState({ board: ['11111....', ...Array(8).fill('.........')], score: 3, best: 9 });
    });
    await expect(page.getByTestId('best-score')).toHaveText('9');
  });

  test('S7: the end-of-game message announces a new record', async ({ page }) => {
    await arrange(page, {
      board: Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)).join(''),
      ),
      score: 42,
      best: 42,
      over: true,
      record: true,
    });
    await expect(page.getByTestId('game-over')).toBeVisible();
    await expect(page.getByTestId('game-over-record')).toBeVisible();
  });

  test('S7: the end-of-game message has no record info when the best score was not beaten', async ({
    page,
  }) => {
    await arrange(page, {
      board: Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)).join(''),
      ),
      score: 42,
      best: 100,
      over: true,
    });
    await expect(page.getByTestId('game-over')).toBeVisible();
    await expect(page.getByTestId('game-over-record')).toHaveCount(0);
  });

  test('S7: beating the best score in play sets the record flag', async ({ page }) => {
    await arrange(page, { board: rows(LINE), score: 0, best: 5 });
    await move(page, [6, 4], [8, 4]);
    expect((await getState(page)).record).toBe(true);
  });

  test('S7: not beating the best score leaves the record flag off', async ({ page }) => {
    await arrange(page, { board: rows(LINE), score: 0, best: 50 });
    await move(page, [6, 4], [8, 4]);
    expect((await getState(page)).record).toBe(false);
  });
});
