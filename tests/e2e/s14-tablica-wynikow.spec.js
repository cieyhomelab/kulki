import { expect, test } from '@playwright/test';
import { arrange, rows } from './helpers/game.js';
import { readFit } from './helpers/font.js';

const BALLS = /** @type {Array<[number, number, number]>} */ ([[0, 0, 1]]);

/**
 * Shows the end-of-game message with the new-record line, on a full board without lines.
 * @param {import('@playwright/test').Page} page
 */
async function endGameWithRecord(page) {
  const board = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)).join(''),
  );
  await arrange(page, { board, score: 999999, best: 10, over: true, record: true });
  await expect(page.getByTestId('game-over-record')).toBeVisible();
}

/**
 * Whether the element lies completely inside the window.
 * @param {import('@playwright/test').Page} page
 * @param {string} id
 */
function insideWindow(page, id) {
  return page.getByTestId(id).evaluate((el) => {
    const r = el.getBoundingClientRect();
    const w = globalThis.window;
    return r.left >= 0 && r.top >= 0 && r.right <= w.innerWidth && r.bottom <= w.innerHeight;
  });
}

test.describe('S14: scoreboard and 1024×768 layout', () => {
  test('S14: the number is larger than the caption in both score panels', async ({ page }) => {
    await arrange(page, { board: rows(BALLS), score: 120, best: 340, preview: [1, 2, 3] });
    await page.evaluate(() => globalThis.document.fonts.ready);

    for (const id of ['score', 'best-score']) {
      const sizes = await page.evaluate((name) => {
        const size = (/** @type {string} */ testId) =>
          parseFloat(
            globalThis.getComputedStyle(
              /** @type {Element} */ (
                globalThis.document.querySelector(`[data-testid="${testId}"]`)
              ),
            ).fontSize,
          );
        return { value: size(name), label: size(`${name}-label`) };
      }, id);
      expect(sizes.value, id).toBeGreaterThan(sizes.label);
    }
  });

  test('S14: score 0 and a six-digit score fit entirely in their panels', async ({ page }) => {
    for (const [score, best] of [
      [0, 0],
      [999999, 999999],
    ]) {
      await arrange(page, { board: rows(BALLS), score, best, preview: [1, 2, 3] });
      await page.evaluate(() => globalThis.document.fonts.ready);
      for (const id of ['score', 'best-score']) {
        const fit = await page.evaluate((name) => {
          const q = (/** @type {string} */ testId) =>
            /** @type {HTMLElement} */ (
              globalThis.document.querySelector(`[data-testid="${testId}"]`)
            );
          const panel = q(`${name}-panel`).getBoundingClientRect();
          const value = q(name);
          const r = value.getBoundingClientRect();
          return {
            inside:
              r.left >= panel.left &&
              r.right <= panel.right &&
              r.top >= panel.top &&
              r.bottom <= panel.bottom,
            clipped: value.scrollWidth > value.clientWidth,
          };
        }, id);
        expect(fit, `${id} at ${score}`).toEqual({ inside: true, clipped: false });
      }
    }
  });

  test('S14: the whole game fits in 1024×768 without scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await arrange(page, { board: rows(BALLS), score: 999999, best: 999999, preview: [1, 2, 3] });
    await page.evaluate(() => globalThis.document.fonts.ready);

    const ids = [
      'title',
      'score-panel',
      'score-label',
      'score',
      'best-score-panel',
      'best-score-label',
      'best-score',
      'preview',
      'preview-label',
      'new-game',
      'sound-toggle',
      'board',
    ];
    expect(await readFit(page, ids)).toEqual({ scrollsX: false, scrollsY: false, clipped: [] });
    for (const id of ids) expect(await insideWindow(page, id), id).toBe(true);
  });

  test('S14: the question and the record message fit in 1024×768 inside the window', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await arrange(page, { board: rows(BALLS), score: 999999, best: 999999, preview: [1, 2, 3] });
    await page.getByTestId('new-game').click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    await page.evaluate(() => globalThis.document.fonts.ready);
    const confirmIds = [
      'confirm-dialog',
      'confirm-yes',
      'confirm-no',
      'board',
      'new-game',
      'sound-toggle',
      'best-score-panel',
    ];
    expect(await readFit(page, confirmIds)).toEqual({
      scrollsX: false,
      scrollsY: false,
      clipped: [],
    });
    for (const id of confirmIds) expect(await insideWindow(page, id), id).toBe(true);

    await endGameWithRecord(page);
    await page.evaluate(() => globalThis.document.fonts.ready);
    const overIds = [
      'game-over',
      'game-over-new-game',
      'game-over-record',
      'game-over-score',
      'board',
      'new-game',
      'sound-toggle',
    ];
    expect(await readFit(page, overIds)).toEqual({ scrollsX: false, scrollsY: false, clipped: [] });
    for (const id of overIds) expect(await insideWindow(page, id), id).toBe(true);
  });

  test('S14: the dialogs do not cover the board or the buttons', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await arrange(page, { board: rows(BALLS), score: 5, best: 9, preview: [1, 2, 3] });
    await page.getByTestId('new-game').click();
    const dialog = /** @type {{ y: number; height: number; x: number; width: number }} */ (
      await page.getByTestId('confirm-dialog').boundingBox()
    );
    for (const id of ['board', 'new-game', 'sound-toggle']) {
      const box = /** @type {{ y: number; height: number; x: number; width: number }} */ (
        await page.getByTestId(id).boundingBox()
      );
      const overlaps =
        dialog.x < box.x + box.width &&
        box.x < dialog.x + dialog.width &&
        dialog.y < box.y + box.height &&
        box.y < dialog.y + dialog.height;
      expect(overlaps, id).toBe(false);
    }
  });

  test('S14: the scoreboard elements exist and keep their ids', async ({ page }) => {
    await arrange(page, { board: rows(BALLS), score: 7, best: 9, preview: [1, 2, 3] });

    await expect(page.getByTestId('title')).toHaveText('KULKI');
    expect(await page.getByTestId('title').evaluate((el) => el.tagName)).toBe('H1');
    await expect(page.getByTestId('score-label')).toHaveText('Wynik');
    await expect(page.getByTestId('best-score-label')).toHaveText('Najlepszy wynik');
    await expect(page.getByTestId('preview-label')).toHaveText('Następne kulki');
    await expect(page.getByTestId('score-panel').getByTestId('score-label')).toBeVisible();
    await expect(page.getByTestId('score-panel').getByTestId('score')).toHaveText('7');
    await expect(
      page.getByTestId('best-score-panel').getByTestId('best-score-label'),
    ).toBeVisible();
    await expect(page.getByTestId('best-score-panel').getByTestId('best-score')).toHaveText('9');
    await expect(page.getByTestId('preview').getByTestId('preview-label')).toBeVisible();
    await expect(page.getByTestId('preview').getByTestId('preview-ball')).toHaveCount(3);
  });

  test('S14: the visible text and its order are unchanged', async ({ page }) => {
    await arrange(page, { board: rows(BALLS), score: 7, best: 9, preview: [1, 2, 3] });

    const text = await page.getByTestId('app').innerText();
    expect(text.split('\n').filter(Boolean)).toEqual([
      'KULKI',
      'Wynik',
      '7',
      'Najlepszy wynik',
      '9',
      'Następne kulki',
      'Nowa gra',
      'Dźwięk: włączony',
    ]);
  });
});
