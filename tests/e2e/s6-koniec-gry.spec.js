import { expect, test } from '@playwright/test';
import { arrange, cell, getState, move } from './helpers/game.js';

/** Value that makes the rng pick the given 1-based position among `empty` empty cells. */
const pick = (/** @type {number} */ position, /** @type {number} */ empty) =>
  (position - 0.5) / empty;

/**
 * A full board in which neighbouring cells always differ, so no line exists.
 * @param {Array<[number, number, number]>} [overrides] `[row, col, color]`, color 0 = empty
 * @returns {string[]}
 */
function fullBoard(overrides = []) {
  const grid = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)),
  );
  for (const [row, col, color] of overrides) grid[row][col] = color === 0 ? '.' : String(color);
  return grid.map((r) => r.join(''));
}

test.describe('S6: game over', () => {
  test('S6: filling the board shows the end-of-game message with the final score', async ({
    page,
  }) => {
    // Moving (1,0) to (0,0) leaves (0,1) and (1,0) empty; the two spawned balls fill the board.
    await arrange(
      page,
      {
        board: fullBoard([
          [0, 0, 0],
          [0, 1, 0],
        ]),
        score: 42,
        preview: [6, 7, 1],
      },
      [pick(1, 2), pick(1, 1), 0, 0, 0],
    );
    await expect(page.getByTestId('game-over')).toHaveCount(0);
    await move(page, [1, 0], [0, 0]);

    await expect(page.getByTestId('game-over')).toBeVisible();
    await expect(page.getByTestId('game-over-score')).toHaveText('42');
    expect((await getState(page)).over).toBe(true);
    expect((await getState(page)).board.join('')).not.toContain('.');
  });

  test('S6: spawned balls that fill the board but form a line keep the game going', async ({
    page,
  }) => {
    // Row 8 holds four balls of color 1; the third spawned ball completes them on the last empty cell.
    const board = fullBoard([
      [0, 0, 0],
      [0, 1, 0],
      [8, 0, 1],
      [8, 1, 1],
      [8, 2, 1],
      [8, 3, 1],
      [8, 4, 0],
    ]);
    await arrange(page, { board, score: 0, preview: [1, 1, 1] }, [
      pick(1, 3),
      pick(1, 2),
      pick(1, 1),
      0,
      0,
      0,
    ]);
    await move(page, [1, 0], [0, 0]);

    await expect(page.getByTestId('game-over')).toHaveCount(0);
    const state = await getState(page);
    expect(state.over).toBe(false);
    expect(state.board[8].slice(0, 5)).toBe('.....');
    expect(state.score).toBeGreaterThan(0);
  });

  test.describe('after the game is over', () => {
    test.beforeEach(async ({ page }) => {
      await arrange(page, {
        board: fullBoard(),
        score: 17,
        best: 30,
        preview: [1, 2, 3],
        over: true,
      });
    });

    test('S6: setState with over shows the message', async ({ page }) => {
      await expect(page.getByTestId('game-over')).toBeVisible();
      await expect(page.getByTestId('game-over-score')).toHaveText('17');
    });

    test('S6: clicking the board changes neither the board nor the score', async ({ page }) => {
      const before = await getState(page);
      await cell(page, 0, 0).click();
      await cell(page, 4, 4).click();
      const after = await getState(page);
      expect(after.board).toEqual(before.board);
      expect(after.score).toBe(17);
      expect(after.selected).toBeNull();
    });

    test('S6: the new-game button of the message starts a new game as in S1', async ({ page }) => {
      await page.getByTestId('game-over-new-game').click();

      await expect(page.getByTestId('game-over')).toHaveCount(0);
      await expect(page.getByTestId('score')).toHaveText('0');
      await expect(page.getByTestId('best-score')).toHaveText('30');
      await expect(page.locator('[data-testid^="cell-"]:not([data-color="0"])')).toHaveCount(5);
      expect((await getState(page)).over).toBe(false);
    });
  });
});
