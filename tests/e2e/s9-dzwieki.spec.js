import { expect, test } from '@playwright/test';
import { arrange, cell, getState, move, rows } from './helpers/game.js';

/** Value that makes the rng pick the given 1-based position among `empty` empty cells. */
const pick = (/** @type {number} */ position, /** @type {number} */ empty) =>
  (position - 0.5) / empty;

/** @param {import('@playwright/test').Page} page */
const soundLog = async (page) =>
  (await page.evaluate(() => /** @type {any} */ (globalThis).__kulki.getSoundLog())).map(
    (/** @type {{ event: string }} */ entry) => entry.event,
  );

/** A full board in which neighbouring cells differ, so no line exists. */
function fullBoard(/** @type {Array<[number, number, number]>} */ overrides = []) {
  const grid = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)),
  );
  for (const [row, col, color] of overrides) grid[row][col] = color === 0 ? '.' : String(color);
  return grid.map((r) => r.join(''));
}

/** Four balls of color 1 in row 0 plus a fifth that moves in from (2,4) to complete the line. */
const LINE_BOARD = rows([
  [0, 0, 1],
  [0, 1, 1],
  [0, 2, 1],
  [0, 3, 1],
  [2, 4, 1],
  [8, 8, 2],
]);

test.describe('S9: sounds', () => {
  test('S9: the sound button shows "on" on first launch', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('sound-toggle')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('sound-toggle')).toHaveText('Dźwięk: włączony');
    expect((await getState(page)).soundOn).toBe(true);
  });

  test('S9: a plain move is logged as move', async ({ page }) => {
    await arrange(page, { board: rows([[4, 4, 1]]), score: 0, preview: [2, 3, 4] });
    await move(page, [4, 4], [4, 6]);
    expect(await soundLog(page)).toEqual(['move']);
  });

  test('S9: a refused move is logged as reject', async ({ page }) => {
    // The ball at (0,0) is walled in by balls at (0,1), (1,0) and (1,1).
    await arrange(page, {
      board: rows([
        [0, 0, 1],
        [0, 1, 2],
        [1, 0, 2],
        [1, 1, 2],
      ]),
      score: 0,
      preview: [2, 3, 4],
    });
    await cell(page, 0, 0).click();
    await cell(page, 5, 5).click();
    await expect(page.getByTestId('board')).toHaveAttribute('data-rejected', 'true');
    expect(await soundLog(page)).toEqual(['reject']);
  });

  test('S9: a move that clears a line is logged as move then clear', async ({ page }) => {
    await arrange(page, { board: LINE_BOARD, score: 0, preview: [2, 3, 4] }, [
      pick(1, 70),
      pick(1, 69),
      pick(1, 68),
      0,
      0,
      0,
    ]);
    await move(page, [2, 4], [0, 4]);
    expect((await getState(page)).score).toBeGreaterThan(0);
    expect(await soundLog(page)).toEqual(['move', 'clear']);
  });

  test('S9: a line completed by a spawned ball is logged as clear after move', async ({ page }) => {
    // The first spawned ball lands on (0,4) and completes the line of color 1.
    await arrange(
      page,
      {
        board: rows([
          [0, 0, 1],
          [0, 1, 1],
          [0, 2, 1],
          [0, 3, 1],
          [8, 8, 2],
        ]),
        score: 0,
        preview: [1, 3, 4],
      },
      [pick(1, 76), pick(1, 75), pick(1, 74), 0, 0, 0],
    );
    await move(page, [8, 8], [8, 7]);
    expect((await getState(page)).board[0].slice(0, 5)).toBe('.....');
    expect(await soundLog(page)).toEqual(['move', 'clear']);
  });

  test('S9: the end of the game is logged as gameover', async ({ page }) => {
    await arrange(
      page,
      {
        board: fullBoard([
          [0, 0, 0],
          [0, 1, 0],
        ]),
        score: 0,
        preview: [6, 7, 1],
      },
      [pick(1, 2), pick(1, 1), 0, 0, 0],
    );
    await move(page, [1, 0], [0, 0]);
    await expect(page.getByTestId('game-over')).toBeVisible();
    expect(await soundLog(page)).toEqual(['move', 'gameover']);
  });

  test('S9: muting stops logging, unmuting resumes it', async ({ page }) => {
    await arrange(page, { board: rows([[4, 4, 1]]), score: 0, preview: [2, 3, 4] });
    const button = page.getByTestId('sound-toggle');

    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(button).toHaveText('Dźwięk: wyciszony');
    expect((await getState(page)).soundOn).toBe(false);
    await move(page, [4, 4], [4, 6]);
    expect(await soundLog(page)).toEqual([]);

    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveText('Dźwięk: włączony');
    await move(page, [4, 6], [4, 4]);
    expect(await soundLog(page)).toEqual(['move']);
  });

  test('S9: the setting survives a page reload', async ({ page }) => {
    await page.goto('/');
    const button = page.getByTestId('sound-toggle');
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'false');

    await page.reload();
    await expect(page.getByTestId('sound-toggle')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('sound-toggle')).toHaveText('Dźwięk: wyciszony');
    expect((await getState(page)).soundOn).toBe(false);

    await page.getByTestId('sound-toggle').click();
    await page.reload();
    await expect(page.getByTestId('sound-toggle')).toHaveAttribute('aria-pressed', 'true');
  });

  test('S9: the game keeps working without AudioContext', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(globalThis, 'AudioContext', { value: undefined });
      Object.defineProperty(globalThis, 'webkitAudioContext', { value: undefined });
    });
    const errors = /** @type {string[]} */ ([]);
    page.on('pageerror', (error) => errors.push(error.message));
    await arrange(page, { board: rows([[4, 4, 1]]), score: 0, preview: [2, 3, 4] });
    await move(page, [4, 4], [4, 6]);
    await expect(cell(page, 4, 6)).toHaveAttribute('data-color', '1');
    expect(await soundLog(page)).toEqual(['move']);
    expect(errors).toEqual([]);
  });

  test('S9: a throwing AudioContext does not break the game', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(globalThis, 'AudioContext', {
        value: function Broken() {
          throw new Error('audio blocked');
        },
      });
    });
    const errors = /** @type {string[]} */ ([]);
    page.on('pageerror', (error) => errors.push(error.message));
    await arrange(page, { board: rows([[4, 4, 1]]), score: 0, preview: [2, 3, 4] });
    await move(page, [4, 4], [4, 6]);
    await expect(cell(page, 4, 6)).toHaveAttribute('data-color', '1');
    expect(errors).toEqual([]);
  });
});
