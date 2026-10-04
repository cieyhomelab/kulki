import { expect, test } from '@playwright/test';

/** @param {import("@playwright/test").Page} page @param {number} row @param {number} col */
const cell = (page, row, col) => page.getByTestId(`cell-${row}-${col}`);
/** @param {import('@playwright/test').Page} page */
const getState = (page) => page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getState());

test.describe('S2: moving a ball', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');
    // Spawned balls land on the first empty cells, far from the cells used below.
    await page.evaluate(() => {
      const api = /** @type {any} */ (globalThis).__kulki;
      api.setRandom({ queue: [0, 0, 0, 0, 0, 0] });
      api.setState({
        board: [
          '.........',
          '.........',
          '.........',
          '.........',
          '....2....',
          '.........',
          '.........',
          '.........',
          '1.......3',
        ],
        preview: [2, 3, 4],
      });
    });
  });

  test('S2: clicking a ball highlights it', async ({ page }) => {
    await cell(page, 8, 0).click();
    await expect(cell(page, 8, 0)).toHaveAttribute('data-selected', 'true');
    expect((await getState(page)).selected).toEqual({ row: 8, col: 0 });
  });

  test('S2: clicking another ball moves the selection and nothing moves', async ({ page }) => {
    const before = (await getState(page)).board;
    await cell(page, 8, 0).click();
    await cell(page, 4, 4).click();
    await expect(cell(page, 4, 4)).toHaveAttribute('data-selected', 'true');
    await expect(cell(page, 8, 0)).toHaveAttribute('data-selected', 'false');
    const state = await getState(page);
    expect(state.board).toEqual(before);
    expect(state.selected).toEqual({ row: 4, col: 4 });
  });

  test('S2: clicking the selected ball again clears the selection', async ({ page }) => {
    await cell(page, 8, 0).click();
    await cell(page, 8, 0).click();
    await expect(cell(page, 8, 0)).toHaveAttribute('data-selected', 'false');
    expect((await getState(page)).selected).toBeNull();
  });

  test('S2: clicking an empty cell with nothing selected changes nothing', async ({ page }) => {
    const before = await getState(page);
    await cell(page, 6, 6).click();
    expect(await getState(page)).toEqual(before);
  });

  test('S2: a ball moves to the clicked empty cell and the selection disappears', async ({
    page,
  }) => {
    await cell(page, 8, 0).click();
    await cell(page, 7, 5).click();
    await expect(page.getByTestId('board')).toHaveAttribute('data-animating', 'false');
    await expect(cell(page, 7, 5)).toHaveAttribute('data-color', '1');
    await expect(cell(page, 8, 0)).toHaveAttribute('data-color', '0');
    await expect(page.locator('[data-selected="true"]')).toHaveCount(0);
    const state = await getState(page);
    expect(state.selected).toBeNull();
    expect(state.board[7][5]).toBe('1');
    expect(state.board[8][0]).toBe('.');
  });

  test('S2: clicks are ignored during the move animation', async ({ page }) => {
    await cell(page, 8, 0).click();
    // A long path keeps the animation running while the extra clicks arrive.
    await cell(page, 0, 8).click();
    await expect(page.getByTestId('board')).toHaveAttribute('data-animating', 'true');
    const during = await getState(page);
    await cell(page, 4, 4).click();
    await cell(page, 6, 6).click();
    const after = await getState(page);
    expect(after.selected).toBeNull();
    expect(after.board).toEqual(during.board);
    await expect(page.getByTestId('board')).toHaveAttribute('data-animating', 'false');
    await expect(cell(page, 0, 8)).toHaveAttribute('data-color', '1');
    await expect(cell(page, 4, 4)).toHaveAttribute('data-selected', 'false');
  });

  test('S2: the move animation takes at most 1 second', async ({ page }) => {
    await cell(page, 8, 0).click();
    const duration = await page.evaluate(async () => {
      const board = /** @type {HTMLElement} */ (
        globalThis.document.querySelector('[data-testid="board"]')
      );
      const target = /** @type {HTMLElement} */ (
        globalThis.document.querySelector('[data-testid="cell-0-8"]')
      );
      const start = performance.now();
      target.click();
      while (board.dataset.animating !== 'false') {
        await new Promise((resolve) => globalThis.requestAnimationFrame(resolve));
      }
      return performance.now() - start;
    });
    expect(duration).toBeLessThanOrEqual(1000);
  });

  test('S2: selecting and starting a move react within 100 ms', async ({ page }) => {
    const result = await page.evaluate(() => {
      const query = (/** @type {string} */ id) =>
        /** @type {HTMLElement} */ (globalThis.document.querySelector(`[data-testid="${id}"]`));
      const api = /** @type {any} */ (globalThis).__kulki;
      const t0 = performance.now();
      query('cell-8-0').click();
      const selected = api.getState().selected;
      const selectDuration = performance.now() - t0;
      const t1 = performance.now();
      query('cell-7-5').click();
      const animating = api.getState().animating;
      return { selected, selectDuration, animating, moveDuration: performance.now() - t1 };
    });
    expect(result.selected).toEqual({ row: 8, col: 0 });
    expect(result.animating).toBe(true);
    expect(result.selectDuration).toBeLessThan(100);
    expect(result.moveDuration).toBeLessThan(100);
  });
});
