import { expect, test } from '@playwright/test';

/** Values that make the rng pick the given 1-based position among `empty` empty cells. */
const pick = (/** @type {number} */ position, /** @type {number} */ empty) =>
  (position - 0.5) / empty;
/** Value that makes the rng pick the given color 1-7. */
const color = (/** @type {number} */ c) => (c - 0.5) / 7;

test.describe('S1: new game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app')).toHaveAttribute('data-ready', 'true');
  });

  test('S1: opening the game shows 5 balls, score 0 and a preview of 3', async ({ page }) => {
    await expect(page.locator('[data-testid^="cell-"]')).toHaveCount(81);
    await expect(page.locator('[data-testid^="cell-"]:not([data-color="0"])')).toHaveCount(5);
    await expect(page.getByTestId('score')).toHaveText('0');
    await expect(page.getByTestId('preview').getByTestId('preview-ball')).toHaveCount(3);

    const state = await page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getState());
    expect(state.board).toHaveLength(9);
    expect(state.board.join('').replace(/\./g, '')).toHaveLength(5);
    expect(state.preview).toHaveLength(3);
  });

  test('S1: starting balls come from the queue: cell then color, then the preview', async ({
    page,
  }) => {
    const queue = [
      pick(1, 81),
      color(2),
      pick(1, 80),
      color(3),
      pick(79, 79),
      color(4),
      pick(1, 78),
      color(5),
      pick(1, 77),
      color(6),
      color(7),
      color(1),
      color(2),
    ];
    await page.evaluate(
      (q) => /** @type {any} */ (globalThis).__kulki.setRandom({ queue: q }),
      queue,
    );
    await page.getByTestId('new-game').click();

    await expect
      .poll(() => page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getState().board))
      .toEqual([
        '2356.....',
        '.........',
        '.........',
        '.........',
        '.........',
        '.........',
        '.........',
        '.........',
        '........4',
      ]);
    expect(
      await page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getState().preview),
    ).toEqual([7, 1, 2]);
    await expect(page.getByTestId('cell-0-0')).toHaveAttribute('data-color', '2');
    await expect(page.getByTestId('cell-8-8')).toHaveAttribute('data-color', '4');
    const balls = page.getByTestId('preview').getByTestId('preview-ball');
    await expect(balls.nth(0)).toHaveAttribute('data-color', '7');
    await expect(balls.nth(1)).toHaveAttribute('data-color', '1');
    await expect(balls.nth(2)).toHaveAttribute('data-color', '2');
  });

  test('S1: a starting line is redrawn before the preview is drawn', async ({ page }) => {
    // Zeros place five balls of color 1 on cells 0-4 (a line); the second attempt has no line.
    const queue = [
      ...Array(10).fill(0),
      pick(81, 81),
      color(1),
      pick(80, 80),
      color(2),
      pick(79, 79),
      color(3),
      pick(78, 78),
      color(4),
      pick(77, 77),
      color(5),
      color(1),
      color(2),
      color(3),
    ];
    await page.evaluate(
      (q) => /** @type {any} */ (globalThis).__kulki.setRandom({ queue: q }),
      queue,
    );
    await page.getByTestId('new-game').click();

    await expect
      .poll(() => page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getState().board[8]))
      .toBe('....54321');
    expect(
      await page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getState().preview),
    ).toEqual([1, 2, 3]);
  });

  test('S1: starting balls never form a line (seeded sample)', async ({ page }) => {
    for (let seed = 1; seed <= 20; seed += 1) {
      await page.evaluate(
        (s) => /** @type {any} */ (globalThis).__kulki.setRandom({ seed: s }),
        seed,
      );
      await page.getByTestId('new-game').click();
      const board = await page.evaluate(
        () => /** @type {any} */ (globalThis).__kulki.getState().board,
      );
      const grid = board.map((/** @type {string} */ row) => row.split(''));
      for (let r = 0; r < 9; r += 1) {
        for (let c = 0; c < 9; c += 1) {
          const ch = grid[r][c];
          if (ch === '.') continue;
          for (const [dr, dc] of [
            [0, 1],
            [1, 0],
            [1, 1],
            [1, -1],
          ]) {
            let n = 0;
            while (grid[r + n * dr]?.[c + n * dc] === ch) n += 1;
            expect(n, `seed ${seed} row ${r} col ${c}`).toBeLessThan(5);
          }
        }
      }
    }
  });
});
