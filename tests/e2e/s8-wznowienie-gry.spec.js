import { expect, test } from '@playwright/test';
import { arrange, cell, getState, move, rows } from './helpers/game.js';

const GAME_KEY = 'kulki.game.v1';
const BEST_KEY = 'kulki.best.v1';
const LINE = /** @type {Array<[number, number, number]>} */ ([
  [8, 0, 1],
  [8, 1, 1],
  [8, 2, 1],
  [8, 3, 1],
  [6, 4, 1],
  [0, 0, 2],
]);

/** A full board in which neighbouring cells always differ, so no line exists. */
function fullBoard(/** @type {Array<[number, number, number]>} */ overrides = []) {
  const grid = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)),
  );
  for (const [row, col, color] of overrides) grid[row][col] = color === 0 ? '.' : String(color);
  return grid.map((r) => r.join(''));
}

/** @param {import('@playwright/test').Page} page */
async function reload(page) {
  await page.reload();
  await page.getByTestId('app').and(page.locator('[data-ready="true"]')).waitFor();
}

/** @param {import('@playwright/test').Page} page */
const snapshot = async (page) => {
  const { board, score, best, preview, selected, over, record } = await getState(page);
  return { board, score, best, preview, selected, over, record };
};

test.describe('S8: resuming a game after a reload', () => {
  test('S8: a new game before any move returns with the same balls and preview', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('app').and(page.locator('[data-ready="true"]')).waitFor();
    const before = await snapshot(page);
    await reload(page);
    expect(await snapshot(page)).toEqual(before);
    expect(before.board.join('').replaceAll('.', '')).toHaveLength(5);
  });

  test('S8: a game in progress returns with the same board, score and preview', async ({
    page,
  }) => {
    await arrange(page, { board: rows(LINE), score: 14, preview: [3, 4, 5] }, [0, 0, 0, 0, 0, 0]);
    await move(page, [6, 4], [8, 4]);
    const before = await snapshot(page);
    expect(before.score).toBeGreaterThan(14);
    await reload(page);
    expect(await snapshot(page)).toEqual(before);
    await expect(page.getByTestId('score')).toHaveText(String(before.score));
  });

  test('S8: nothing is selected after the reload', async ({ page }) => {
    await arrange(page, { board: rows(LINE), score: 0 });
    await cell(page, 6, 4).click();
    expect((await getState(page)).selected).toEqual({ row: 6, col: 4 });
    await reload(page);
    expect((await getState(page)).selected).toBeNull();
    await expect(page.locator('[data-selected="true"]')).toHaveCount(0);
  });

  test('S8: a finished game returns with the end-of-game message, score and record', async ({
    page,
  }) => {
    await arrange(page, { board: fullBoard(), score: 42, best: 10, over: true, record: true });
    await expect(page.getByTestId('game-over-record')).toBeVisible();
    await reload(page);
    await expect(page.getByTestId('game-over')).toBeVisible();
    await expect(page.getByTestId('game-over-score')).toHaveText('42');
    await expect(page.getByTestId('game-over-record')).toBeVisible();
    expect((await snapshot(page)).board).toEqual(fullBoard());
  });

  test('S8: a finished game without a record returns without the record note', async ({ page }) => {
    await arrange(page, { board: fullBoard(), score: 42, best: 100, over: true });
    await reload(page);
    await expect(page.getByTestId('game-over-score')).toHaveText('42');
    await expect(page.getByTestId('game-over-record')).toHaveCount(0);
  });

  test('S8: a reload during the animation resumes the finished turn', async ({ page }) => {
    await arrange(page, { board: rows(LINE), score: 0, preview: [3, 4, 5] }, [0, 0, 0, 0, 0, 0]);
    await cell(page, 6, 4).click();
    await cell(page, 8, 4).click();
    await expect(page.locator('[data-testid="board"][data-animating="true"]')).toBeVisible();
    // The turn is stored before the animation starts, so it is already there mid-animation.
    const saved = await page.evaluate((key) => localStorage.getItem(key), GAME_KEY);
    const logical = await snapshot(page);
    await reload(page);
    const after = await snapshot(page);
    expect(after).toEqual({ ...logical, selected: null });
    expect(JSON.parse(saved ?? 'null')).toMatchObject({
      board: logical.board,
      score: logical.score,
    });
  });

  test('S8: a corrupted saved game starts a new game and keeps the best score', async ({
    page,
  }) => {
    await page.addInitScript(
      ([game, best]) => {
        localStorage.setItem(game, '{"board": "oops"');
        localStorage.setItem(best, '77');
      },
      [GAME_KEY, BEST_KEY],
    );
    await page.goto('/');
    await expect(page.getByTestId('best-score')).toHaveText('77');
    await expect(page.getByTestId('score')).toHaveText('0');
    const state = await getState(page);
    expect(state.board.join('').replaceAll('.', '')).toHaveLength(5);
    expect(state.preview).toHaveLength(3);
    await expect(page.getByRole('alert')).toHaveCount(0);
    expect(await page.evaluate((key) => localStorage.getItem(key), BEST_KEY)).toBe('77');
  });

  test('S8: a new game after resuming replaces the saved one', async ({ page }) => {
    await arrange(page, { board: rows(LINE), score: 30, preview: [3, 4, 5] });
    await reload(page);
    expect((await getState(page)).score).toBe(30);
    await page.getByTestId('new-game').click();
    await page.getByTestId('confirm-yes').click();
    await expect(page.getByTestId('score')).toHaveText('0');
    const fresh = await snapshot(page);
    expect(fresh.board.join('').replaceAll('.', '')).toHaveLength(5);
    await reload(page);
    expect(await snapshot(page)).toEqual(fresh);
  });

  test('S8: unavailable storage does not stop the game and nothing is remembered', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(globalThis, 'localStorage', {
        get() {
          throw new Error('SecurityError');
        },
      });
    });
    await page.goto('/');
    await page.getByTestId('app').and(page.locator('[data-ready="true"]')).waitFor();
    await page.evaluate(() => {
      const api = /** @type {any} */ (globalThis).__kulki;
      api.setRandom({ queue: [0, 0, 0, 0, 0, 0] });
      api.setState({
        board: [
          '1111.....',
          '.........',
          '.........',
          '.........',
          '1........',
          ...Array(4).fill('.........'),
        ],
        score: 0,
      });
    });
    await move(page, [4, 0], [0, 4]);
    await expect(page.getByTestId('score')).not.toHaveText('0');
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
});
