import { expect, test } from '@playwright/test';
import { arrange, cell, countBalls, getState, rows } from './helpers/game.js';

const BALLS = /** @type {Array<[number, number, number]>} */ ([
  [0, 0, 1],
  [0, 3, 2],
  [4, 4, 3],
  [8, 8, 4],
]);

test.describe('S1: new game with confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await arrange(page, { board: rows(BALLS), score: 25, best: 40, preview: [5, 6, 7] });
  });

  test('S1: the new-game button asks for confirmation and changes nothing yet', async ({
    page,
  }) => {
    await expect(page.getByTestId('confirm-dialog')).toHaveCount(0);
    await page.getByTestId('new-game').click();

    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    const state = await getState(page);
    expect(state.board).toEqual(rows(BALLS));
    expect(state.score).toBe(25);
    expect(state.preview).toEqual([5, 6, 7]);
  });

  test('S1: confirming starts a game with 5 balls, score 0 and the best score kept', async ({
    page,
  }) => {
    await page.getByTestId('new-game').click();
    await page.getByTestId('confirm-yes').click();

    await expect(page.getByTestId('confirm-dialog')).toHaveCount(0);
    await expect(page.getByTestId('score')).toHaveText('0');
    await expect(page.getByTestId('best-score')).toHaveText('40');
    const state = await getState(page);
    expect(countBalls(state.board)).toBe(5);
  });

  test('S1: declining closes the question and leaves board, score and preview as they were', async ({
    page,
  }) => {
    await page.getByTestId('new-game').click();
    await page.getByTestId('confirm-no').click();

    await expect(page.getByTestId('confirm-dialog')).toHaveCount(0);
    const state = await getState(page);
    expect(state.board).toEqual(rows(BALLS));
    expect(state.score).toBe(25);
    expect(state.preview).toEqual([5, 6, 7]);
  });

  test('S1: board clicks are ignored while the question is visible', async ({ page }) => {
    await page.getByTestId('new-game').click();
    await cell(page, 0, 0).click();
    await cell(page, 0, 1).click();

    const state = await getState(page);
    expect(state.selected).toBeNull();
    expect(state.board).toEqual(rows(BALLS));
  });

  test('S1: the question also appears before the first move', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('app').and(page.locator('[data-ready="true"]')).waitFor();
    await page.getByTestId('new-game').click();
    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
  });

  test('S1: after the game is over the new game starts at once, without a question', async ({
    page,
  }) => {
    await page.evaluate(() =>
      /** @type {any} */ (globalThis).__kulki.setState({
        board: [
          '123456712',
          '345671234',
          '567123456',
          '712345671',
          '234567123',
          '456712345',
          '671234567',
          '123456712',
          '345671234',
        ],
        score: 9,
        over: true,
      }),
    );
    await page.getByTestId('new-game').click();

    await expect(page.getByTestId('confirm-dialog')).toHaveCount(0);
    await expect(page.getByTestId('score')).toHaveText('0');
    expect(countBalls((await getState(page)).board)).toBe(5);
  });
});
