import { expect, test } from '@playwright/test';
import { arrange } from './helpers/game.js';

const PANELS = ['score-panel', 'best-score-panel', 'preview', 'new-game', 'sound-toggle'];

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} id
 */
async function rect(page, id) {
  const box = await page.getByTestId(id).boundingBox();
  expect(box, id).not.toBeNull();
  return /** @type {NonNullable<typeof box>} */ (box);
}

for (const size of [
  { width: 1024, height: 768 },
  { width: 1920, height: 1080 },
]) {
  test.describe(`S17: layout at ${size.width}x${size.height}`, () => {
    test.use({ viewport: size });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');
      await page.evaluate(() => globalThis.document.fonts.ready);
    });

    test('S17: title sits above the board, flush with its left edge', async ({ page }) => {
      const title = await rect(page, 'title');
      const board = await rect(page, 'board');
      const cell = await rect(page, 'cell-0-0');
      expect(title.y + title.height).toBeLessThanOrEqual(board.y);
      expect(Math.abs(title.x - board.x)).toBeLessThanOrEqual(cell.width);
    });

    test('S17: panels and buttons stack right of the board, in order, without overlap', async ({
      page,
    }) => {
      const board = await rect(page, 'board');
      const title = await rect(page, 'title');
      const cell = await rect(page, 'cell-0-0');
      const boxes = [];
      for (const id of PANELS) boxes.push(await rect(page, id));
      boxes.forEach((b) => expect(b.x).toBeGreaterThanOrEqual(board.x + board.width));
      for (let i = 1; i < boxes.length; i += 1) {
        expect(boxes[i].y).toBeGreaterThanOrEqual(boxes[i - 1].y + boxes[i - 1].height);
      }
      expect(boxes[0].y).toBeGreaterThanOrEqual(title.y);
      expect(boxes[0].y).toBeLessThanOrEqual(board.y + cell.height);
    });

    test('S17: has 81 cells and fits without scrolling or clipped text', async ({ page }) => {
      expect(await page.locator('[data-testid^="cell-"]').count()).toBe(81);
      const fit = await page.evaluate(() => {
        const root = globalThis.document.documentElement;
        const clipped = [...globalThis.document.querySelectorAll('[data-testid="app"] *')].filter(
          (n) => n.scrollWidth > n.clientWidth + 1 && n.clientWidth > 0,
        );
        return {
          x: root.scrollWidth - root.clientWidth,
          y: root.scrollHeight - root.clientHeight,
          clipped: clipped.map((n) => n.getAttribute('data-testid')),
        };
      });
      expect(fit).toEqual({ x: 0, y: 0, clipped: [] });
      for (const id of ['title', 'board', ...PANELS]) {
        const b = await rect(page, id);
        expect(b.x).toBeGreaterThanOrEqual(0);
        expect(b.y).toBeGreaterThanOrEqual(0);
        expect(b.x + b.width).toBeLessThanOrEqual(size.width);
        expect(b.y + b.height).toBeLessThanOrEqual(size.height);
      }
    });

    test('S17: the game is centred horizontally', async ({ page }) => {
      const board = await rect(page, 'board');
      const side = await rect(page, 'sidebar');
      const cell = await rect(page, 'cell-0-0');
      const left = board.x;
      const right = size.width - (side.x + side.width);
      expect(Math.abs(left - right)).toBeLessThanOrEqual(cell.width);
    });

    test('S17: visible text keeps its order and the title reads KULKI', async ({ page }) => {
      const text = await page.locator('body').innerText();
      expect(text.replace(/\s+/g, ' ').trim()).toBe(
        'KULKI Wynik 0 Najlepszy wynik 0 Następne kulki Nowa gra Dźwięk: włączony',
      );
      await expect(page.getByTestId('title')).toHaveText('KULKI');
    });
  });
}

test.describe('S17: six-digit score and the tallest window at 1024x768', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('S17: a six-digit score fits its panels', async ({ page }) => {
    await arrange(page, { board: Array(9).fill('.'.repeat(9)), score: 999999 });
    await page.evaluate(() => globalThis.document.fonts.ready);
    for (const id of ['score', 'best-score']) {
      const fits = await page
        .getByTestId(id)
        .evaluate((el) => el.scrollWidth <= el.clientWidth && el.getBoundingClientRect().width > 0);
      expect(fits, id).toBe(true);
      const value = await rect(page, id);
      const panel = await rect(page, `${id}-panel`);
      expect(value.x + value.width).toBeLessThanOrEqual(panel.x + panel.width);
    }
    await expect(page.getByTestId('score')).toHaveText('999999');
  });

  test('S17: confirmation sits in the sidebar and covers no board cell, panel or button', async ({
    page,
  }) => {
    await arrange(page, { board: ['1' + '.'.repeat(8), ...Array(8).fill('.'.repeat(9))] });
    await page.getByTestId('new-game').click();
    const dialog = await rect(page, 'confirm-dialog');
    const others = [...PANELS, 'board'];
    for (const id of others) {
      const b = await rect(page, id);
      const overlap =
        dialog.x < b.x + b.width &&
        b.x < dialog.x + dialog.width &&
        dialog.y < b.y + b.height &&
        b.y < dialog.y + dialog.height;
      expect(overlap, id).toBe(false);
    }
  });
});
