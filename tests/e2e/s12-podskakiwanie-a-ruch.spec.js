import { expect, test } from '@playwright/test';
import { arrange, cell, rows } from './helpers/game.js';

/** @param {import('@playwright/test').Page} page */
const soundLog = (page) =>
  page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getSoundLog().length);

/** @param {import('@playwright/test').Page} page */
const bouncingCount = (page) => page.locator('[data-bouncing="true"]').count();

/** Waits until the bounce counter reaches `cycles`. */
const waitForCycles = (/** @type {import('@playwright/test').Page} */ page, cycles = 3) =>
  expect(async () => {
    const value = await page.getByTestId('board').getAttribute('data-bounce-cycles');
    expect(Number(value)).toBeGreaterThanOrEqual(cycles);
  }).toPass();

const WALLED = rows([
  [0, 0, 1],
  [0, 1, 2],
  [1, 0, 2],
  [1, 1, 2],
]);

test.describe('S12: bouncing versus moving and refusing', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });

  test('S10: the cycle counter grows by 3 without player action and the ball keeps bouncing', async ({
    page,
  }) => {
    await arrange(page, { board: rows([[4, 4, 1]]), score: 0, preview: [2, 3, 4] });
    await cell(page, 4, 4).click();
    await waitForCycles(page, 3);
    await expect(cell(page, 4, 4)).toHaveAttribute('data-bouncing', 'true');
  });

  test('S10: the counter is "0" when nothing bounces and resets when the bouncing cell changes', async ({
    page,
  }) => {
    await arrange(page, {
      board: rows([
        [4, 4, 1],
        [6, 6, 2],
      ]),
      score: 0,
      preview: [2, 3, 4],
    });
    const board = page.getByTestId('board');
    await expect(board).toHaveAttribute('data-bounce-cycles', '0');
    await cell(page, 4, 4).click();
    await waitForCycles(page, 1);
    const resetRightAfter = await page.evaluate(() => {
      const doc = globalThis.document;
      const other = /** @type {HTMLElement} */ (doc.querySelector('[data-testid="cell-6-6"]'));
      other.click();
      return /** @type {HTMLElement} */ (doc.querySelector('[data-testid="board"]')).dataset
        .bounceCycles;
    });
    expect(resetRightAfter).toBe('0');
    await cell(page, 6, 6).click();
    await expect(board).toHaveAttribute('data-bounce-cycles', '0');
    await expect(page.locator('[data-bouncing="true"]')).toHaveCount(0);
  });

  test('S12: with a path nothing bounces from the first step and the ball ends in its default state', async ({
    page,
  }) => {
    await arrange(page, { board: rows([[4, 4, 1]]), score: 0, preview: [2, 3, 4] });
    await cell(page, 4, 4).click();
    await expect(cell(page, 4, 4)).toHaveAttribute('data-bouncing', 'true');
    const during = await page.evaluate(() => {
      const doc = globalThis.document;
      const click = (/** @type {string} */ id) =>
        /** @type {HTMLElement} */ (doc.querySelector(`[data-testid="${id}"]`)).click();
      click('cell-4-6');
      const board = /** @type {HTMLElement} */ (doc.querySelector('[data-testid="board"]'));
      return {
        animating: board.dataset.animating,
        bouncing: doc.querySelectorAll('[data-bouncing="true"]').length,
        cycles: board.dataset.bounceCycles,
      };
    });
    expect(during).toEqual({ animating: 'true', bouncing: 0, cycles: '0' });
    await expect(page.getByTestId('board')).toHaveAttribute('data-animating', 'false');
    expect(await bouncingCount(page)).toBe(0);
    const ball = page.getByTestId('ball-4-6');
    await expect(page.getByTestId('cell-4-6')).toHaveAttribute('data-color', '1');
    await expect(ball).toHaveCSS('transform', 'none');
    expect(await ball.evaluate((node) => node.getAnimations().length)).toBe(0);
  });

  test('S12: a refused move shows the signal and the ball keeps bouncing', async ({ page }) => {
    await arrange(page, { board: WALLED, score: 0, preview: [2, 3, 4] });
    await cell(page, 0, 0).click();
    await waitForCycles(page, 1);
    await cell(page, 5, 5).click();
    const board = page.getByTestId('board');
    await expect(board).toHaveAttribute('data-rejected', 'true');
    await expect(cell(page, 0, 0)).toHaveAttribute('data-bouncing', 'true');
    await expect(board).toHaveAttribute('data-rejected', 'false');
    await expect(cell(page, 0, 0)).toHaveAttribute('data-bouncing', 'true');
    await expect(cell(page, 0, 0)).toHaveAttribute('data-selected', 'true');
    await waitForCycles(page, 1);
  });

  test('S12: after a move that clears a line nothing bounces when all animations end', async ({
    page,
  }) => {
    await arrange(page, {
      board: rows([
        [0, 0, 1],
        [0, 1, 1],
        [0, 2, 1],
        [0, 3, 1],
        [2, 4, 1],
        [8, 8, 2],
      ]),
      score: 0,
      preview: [2, 3, 4],
    });
    await cell(page, 2, 4).click();
    await waitForCycles(page, 1);
    await cell(page, 0, 4).click();
    await expect(page.getByTestId('board')).toHaveAttribute('data-animating', 'false');
    expect(await bouncingCount(page)).toBe(0);
    await expect(page.getByTestId('board')).toHaveAttribute('data-bounce-cycles', '0');
  });

  test('S12: after a move followed by spawning nothing bounces', async ({ page }) => {
    await arrange(page, { board: rows([[4, 4, 1]]), score: 0, preview: [2, 3, 4] });
    await cell(page, 4, 4).click();
    await cell(page, 4, 6).click();
    await expect(page.getByTestId('board')).toHaveAttribute('data-animating', 'false');
    expect(await bouncingCount(page)).toBe(0);
    expect(await page.evaluate(() => globalThis.document.getAnimations().length)).toBe(0);
  });

  test('S12: after a move that ends the game nothing bounces', async ({ page }) => {
    const grid = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)),
    );
    grid[0][0] = '.';
    grid[0][1] = '.';
    grid[0][2] = '.';
    // The ball at (0,3) walks to (0,0); the three spawned balls then fill the freed cells.
    await arrange(page, { board: grid.map((r) => r.join('')), score: 0, preview: [2, 3, 4] });
    await cell(page, 0, 3).click();
    await expect(cell(page, 0, 3)).toHaveAttribute('data-bouncing', 'true');
    await cell(page, 0, 0).click();
    await expect(page.getByTestId('board')).toHaveAttribute('data-animating', 'false');
    expect(await bouncingCount(page)).toBe(0);
  });

  test('S12: bouncing adds nothing to the sound log', async ({ page }) => {
    await arrange(page, { board: rows([[4, 4, 1]]), score: 0, preview: [2, 3, 4] });
    await cell(page, 4, 4).click();
    const before = await soundLog(page);
    await waitForCycles(page, 3);
    expect(await soundLog(page)).toBe(before);
  });
});
