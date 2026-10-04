import { expect, test } from '@playwright/test';

/** @param {import('@playwright/test').Page} page */
const getState = (page) => page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getState());

/**
 * Loads a board and selects the ball at (0,0).
 * @param {import('@playwright/test').Page} page
 * @param {string[]} board
 */
async function setup(page, board) {
  await page.goto('/');
  await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');
  await page.evaluate(
    (b) =>
      /** @type {any} */ (globalThis).__kulki.setState({ board: b, score: 7, preview: [2, 3, 4] }),
    board,
  );
  await page.getByTestId('cell-0-0').click();
}

const WALLED = [
  '1.2......',
  '2........',
  '.........',
  '.........',
  '.........',
  '.........',
  '.........',
  '.........',
  '.........',
];
const DIAGONAL = [
  '12.......',
  '2........',
  '.........',
  '.........',
  '.........',
  '.........',
  '.........',
  '.........',
  '.........',
];

test.describe('S3: refused move', () => {
  test('S3: with no path the ball stays selected, score and balls are unchanged', async ({
    page,
  }) => {
    await setup(
      page,
      WALLED.map((r, i) => (i === 0 ? '13.......' : r)),
    );
    const before = await getState(page);
    await page.getByTestId('cell-5-5').click();
    await expect(page.getByTestId('cell-0-0')).toHaveAttribute('data-selected', 'true');
    await expect(page.getByTestId('cell-0-0')).toHaveAttribute('data-color', '1');
    const after = await getState(page);
    expect(after.board).toEqual(before.board);
    expect(after.score).toBe(7);
    expect(after.preview).toEqual([2, 3, 4]);
    expect(after.selected).toEqual({ row: 0, col: 0 });
    expect(after.animating).toBe(false);
  });

  test('S3: the refusal signal appears and disappears by itself within 1 second', async ({
    page,
  }) => {
    await setup(
      page,
      WALLED.map((r, i) => (i === 0 ? '13.......' : r)),
    );
    const board = page.getByTestId('board');
    await page.getByTestId('cell-5-5').click();
    await expect(board).toHaveAttribute('data-rejected', 'true');
    expect((await getState(page)).rejected).toBe(true);
    const duration = await page.evaluate(async () => {
      const el = /** @type {HTMLElement} */ (
        globalThis.document.querySelector('[data-testid="board"]')
      );
      const start = performance.now();
      while (el.dataset.rejected !== 'false') {
        await new Promise((resolve) => globalThis.requestAnimationFrame(resolve));
      }
      return performance.now() - start;
    });
    expect(duration).toBeLessThanOrEqual(1000);
    await expect(board).toHaveAttribute('data-rejected', 'false');
    await expect(page.getByTestId('cell-0-0')).toHaveAttribute('data-selected', 'true');
  });

  test('S3: a diagonal-only connection counts as no path', async ({ page }) => {
    await setup(page, DIAGONAL);
    const before = await getState(page);
    await page.getByTestId('cell-1-1').click();
    await expect(page.getByTestId('board')).toHaveAttribute('data-rejected', 'true');
    const after = await getState(page);
    expect(after.board).toEqual(before.board);
    expect(after.selected).toEqual({ row: 0, col: 0 });
    expect(after.score).toBe(7);
  });
});
