import { expect, test } from '@playwright/test';
import { freezeAt } from './helpers/ball.js';
import { arrange, cell, getState, move, rows } from './helpers/game.js';
import { describeResult, measureGameBalls, rectOfTestId } from './helpers/scanlines.js';

const BOARD = rows([
  [4, 4, 2],
  [8, 8, 3],
]);

/** @param {import('./helpers/scanlines.js').Result} r */
function expectClean(r) {
  expect(r.discPixels, 'balls were measured').toBeGreaterThan(0);
  expect(r.discBad + r.surroundBad + r.emptyBad + r.linedBad, describeResult(r)).toBe(0);
}

/** @param {import('@playwright/test').Page} page */
const settled = async (page) => {
  await page.evaluate(() => globalThis.document.fonts.ready);
  await page.locator('[data-testid="board"][data-animating="false"]').waitFor();
};

/**
 * Cells that hold a ball in a board snapshot, as `[row, col]`.
 * @param {string[]} board
 * @returns {Array<[number, number]>}
 */
const occupied = (board) =>
  board.flatMap((line, r) =>
    [...line].flatMap((ch, c) => (ch === '.' ? [] : [/** @type {[number, number]} */ ([r, c])])),
  );

test.describe('S23: a moving ball has no scanlines', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
  });

  for (const [name, fraction] of [
    ['highest point of the bounce', 0.5],
    ['lowest, flattest point of the bounce', 0],
  ]) {
    test(`S23: a bouncing ball is free of lines at the ${name}`, async ({ page }) => {
      await arrange(page, { board: BOARD, score: 1, preview: [1, 2, 3] });
      await settled(page);
      await cell(page, 4, 4).click();
      await expect(cell(page, 4, 4)).toHaveAttribute('data-bouncing', 'true');
      await freezeAt(page, 4, 4, Number(fraction));
      const result = await measureGameBalls(page);
      expectClean(result);
      expect(result.surroundPixels).toBeGreaterThan(0);
    });
  }

  test('S23: with reduced motion a selected ball is free of lines', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await arrange(page, { board: BOARD, score: 1, preview: [1, 2, 3] });
    await settled(page);
    await cell(page, 4, 4).click();
    await expect(cell(page, 4, 4)).toHaveAttribute('data-selected', 'true');
    await expect(cell(page, 4, 4)).toHaveAttribute('data-bouncing', 'false');
    expectClean(await measureGameBalls(page));
  });

  test('S23: after a move without a line the new ball and the spawned balls have none, the old field has lines on its whole interior', async ({
    page,
  }) => {
    await arrange(page, { board: BOARD, score: 1, preview: [1, 2, 3] });
    const before = occupied((await getState(page)).board);
    await move(page, [4, 4], [6, 4]);
    await settled(page);
    const after = occupied((await getState(page)).board);
    expect(after).toHaveLength(before.length + 3);
    await expect(cell(page, 4, 4)).toHaveAttribute('data-color', '0');
    const left = await rectOfTestId(page, 'cell-4-4');
    const result = await measureGameBalls(page, { extra: { emptyAreas: [left] } });
    expectClean(result);
    expect(result.emptyPixels).toBeGreaterThan(0);
  });

  test('S23: after a line is cleared the fields of the cleared balls have lines on their whole interior', async ({
    page,
  }) => {
    await arrange(page, {
      board: rows([
        [8, 0, 1],
        [8, 1, 1],
        [8, 2, 1],
        [8, 3, 1],
        [6, 4, 1],
        [0, 8, 2],
      ]),
      score: 3,
      preview: [2, 3, 4],
    });
    await move(page, [6, 4], [8, 4]);
    await settled(page);
    const fields = await Promise.all(
      [0, 1, 2, 3, 4].map((col) => rectOfTestId(page, `cell-8-${col}`)),
    );
    const result = await measureGameBalls(page, { extra: { emptyAreas: fields } });
    expectClean(result);
    expect(result.emptyPixels).toBeGreaterThan(0);
  });

  test('S23: after a refused move the selected ball is still free of lines', async ({ page }) => {
    await arrange(page, {
      board: rows([
        [0, 0, 1],
        [0, 1, 2],
        [1, 0, 2],
      ]),
      score: 1,
      preview: [1, 2, 3],
    });
    await settled(page);
    await cell(page, 0, 0).click();
    await cell(page, 8, 8).click();
    await expect(page.getByTestId('board')).toHaveAttribute('data-rejected', 'false');
    await expect(cell(page, 0, 0)).toHaveAttribute('data-selected', 'true');
    await expect(cell(page, 0, 0)).toHaveAttribute('data-bouncing', 'true');
    await freezeAt(page, 0, 0, 0.5);
    expectClean(await measureGameBalls(page));
  });

  test('S23: the new preview after the spawn is free of lines', async ({ page }) => {
    await arrange(page, { board: BOARD, score: 1, preview: [1, 2, 3] }, [0, 0, 0, 0.5, 0.5, 0.5]);
    await move(page, [4, 4], [6, 4]);
    await settled(page);
    const result = await measureGameBalls(page, {
      only: (t) => t.kind === 'preview',
    });
    expect(result.discPixels).toBeGreaterThan(0);
    expectClean(result);
  });
});
