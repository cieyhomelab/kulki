import { expect, test } from '@playwright/test';
import {
  arrange,
  playTimed,
  colorValue,
  countBalls,
  getState,
  move,
  rows,
} from './helpers/game.js';

/** Colors with no two neighbours alike (any direction), so the pattern holds no line. */
const patternColor = (/** @type {number} */ row, /** @type {number} */ col) =>
  ((3 * row + col) % 7) + 1;

test.describe('S5: new balls after a move', () => {
  test('S5: 3 balls from the preview land on cells that were empty, then a new preview shows', async ({
    page,
  }) => {
    await arrange(
      page,
      { board: rows([[8, 0, 5]]), preview: [2, 3, 4] },
      // Last empty cell, then the last of the remaining ones, then the first; new preview 5, 6, 7.
      [0.999, 0.999, 0, colorValue(5), colorValue(6), colorValue(7)],
    );
    const before = await getState(page);
    await move(page, [8, 0], [8, 1]);
    const state = await getState(page);
    expect(countBalls(state.board)).toBe(countBalls(before.board) + 3);
    expect(state.board[8][1]).toBe('5');
    expect(state.board[8][8]).toBe('2');
    expect(state.board[8][7]).toBe('3');
    expect(state.board[0][0]).toBe('4');
    expect(state.preview).toEqual([5, 6, 7]);
    await expect(page.getByTestId('preview-ball').nth(0)).toHaveAttribute('data-color', '5');
    await expect(page.getByTestId('preview-ball').nth(1)).toHaveAttribute('data-color', '6');
    await expect(page.getByTestId('preview-ball').nth(2)).toHaveAttribute('data-color', '7');
    expect(state.score).toBe(0);
  });

  test('S5: a ball dropped in by the spawn completes a line and it scores like S4', async ({
    page,
  }) => {
    await arrange(page, {
      board: rows([
        [0, 0, 2],
        [0, 1, 2],
        [0, 2, 2],
        [0, 3, 2],
        [8, 0, 5],
      ]),
      preview: [2, 3, 4],
      score: 6,
    });
    await move(page, [8, 0], [8, 1]);
    const state = await getState(page);
    expect(state.score).toBe(16);
    await expect(page.getByTestId('score')).toHaveText('16');
    expect(state.board[0].slice(0, 5)).toBe('.....');
    expect(state.board[0][5]).toBe('3');
    expect(state.board[0][6]).toBe('4');
  });

  test('S5: two lines of 5 in different colors made by the spawn clear 10 balls for 30 points', async ({
    page,
  }) => {
    await arrange(page, {
      board: rows([
        [0, 0, 1],
        [0, 1, 1],
        [0, 2, 1],
        [0, 3, 1],
        [1, 5, 2],
        [2, 5, 2],
        [3, 5, 2],
        [4, 5, 2],
        [8, 0, 5],
      ]),
      preview: [1, 2, 3],
    });
    await move(page, [8, 0], [8, 1]);
    const state = await getState(page);
    expect(state.score).toBe(30);
    // The mover, the third spawned ball (0,6) are what is left.
    expect(countBalls(state.board)).toBe(2);
    expect(state.board[0][6]).toBe('3');
    expect(state.board[8][1]).toBe('5');
  });

  test('S5: with fewer than 3 empty cells only as many balls appear as there is room, the rest are dropped', async ({
    page,
  }) => {
    /** @type {Array<[number, number, number]>} */
    const balls = [];
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) balls.push([row, col, patternColor(row, col)]);
    }
    const board = rows(balls).map((line) => line.split(''));
    // Four of a color in the first row; (0,4) and (8,8) are empty.
    for (let col = 0; col < 4; col += 1) board[0][col] = '1';
    board[0][4] = '.';
    board[8][8] = '.';
    await arrange(page, { board: board.map((line) => line.join('')), preview: [1, 6, 7] });
    const before = await getState(page);
    expect(countBalls(before.board)).toBe(79);
    await move(page, [8, 7], [8, 8]);
    const state = await getState(page);
    // The first ball completes the row of 5 (10 points); the second one lands on the freed (8,7).
    expect(state.score).toBe(10);
    expect(state.board[0].slice(0, 5)).toBe('.....');
    expect(state.board[8][7]).toBe('6');
    expect(state.over).toBe(false);
    expect(state.preview).toHaveLength(3);
    expect(state.preview).not.toEqual([1, 6, 7]);
  });

  test('S4: a clearing after the spawn that empties the board spawns again and shows a new preview', async ({
    page,
  }) => {
    await arrange(
      page,
      {
        board: rows([
          [0, 0, 1],
          [0, 1, 1],
          [8, 8, 1],
        ]),
        preview: [1, 1, 1],
      },
      [
        0,
        0,
        0,
        colorValue(5),
        colorValue(6),
        colorValue(7),
        0,
        0,
        0,
        colorValue(2),
        colorValue(3),
        colorValue(4),
      ],
    );
    await move(page, [8, 8], [0, 2]);
    const state = await getState(page);
    // Six 1s in a row: 2 x 6 + 2 x 1 = 14 points, then the board is empty and 5, 6, 7 appear.
    expect(state.score).toBe(14);
    expect(state.board[0]).toBe('567......');
    expect(countBalls(state.board)).toBe(3);
    expect(state.preview).toEqual([2, 3, 4]);
  });

  test('S2: clicks are ignored while new balls appear and the turn takes at most 1 s', async ({
    page,
  }) => {
    await arrange(page, { board: rows([[8, 0, 5]]), preview: [2, 3, 4] });
    const result = await playTimed(page, 'cell-8-0', 'cell-8-1', ['cell-8-1', 'cell-4-4']);
    expect(result.animating).toBe(true);
    expect(result.selected).toBeNull();
    expect(result.ms).toBeLessThanOrEqual(1000);
    expect(countBalls((await getState(page)).board)).toBe(4);
  });
});
