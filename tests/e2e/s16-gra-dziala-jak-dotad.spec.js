import { expect, test } from '@playwright/test';
import { cell, getState, rows } from './helpers/game.js';

const GAME_KEY = 'kulki.game.v1';
const BEST_KEY = 'kulki.best.v1';
const SOUND_KEY = 'kulki.sound.v1';

/** Board and score as the previous version of the game stored them (format v1). */
const SAVED_BOARD = rows([
  [0, 0, 1],
  [4, 4, 2],
  [4, 5, 3],
  [8, 8, 7],
]);
const SAVED_GAME = {
  board: SAVED_BOARD,
  score: 37,
  preview: [4, 5, 6],
  over: false,
  record: false,
};

/** @param {import('@playwright/test').Page} page */
const ready = (page) => page.getByTestId('app').and(page.locator('[data-ready="true"]')).waitFor();

test.describe('S16: the game works as before', () => {
  test('S16: a game, best score and sound setting saved by the previous version are shown unchanged', async ({
    page,
  }) => {
    await page.addInitScript(
      ([gameKey, game, bestKey, soundKey]) => {
        localStorage.setItem(gameKey, game);
        localStorage.setItem(bestKey, '120');
        localStorage.setItem(soundKey, 'off');
      },
      [GAME_KEY, JSON.stringify(SAVED_GAME), BEST_KEY, SOUND_KEY],
    );
    await page.goto('/');
    await ready(page);

    const state = await getState(page);
    expect(state.board).toEqual(SAVED_BOARD);
    expect(state.score).toBe(37);
    expect(state.best).toBe(120);
    expect(state.preview).toEqual([4, 5, 6]);
    expect(state.over).toBe(false);

    await expect(page.getByTestId('score')).toHaveText('37');
    await expect(page.getByTestId('best-score')).toHaveText('120');
    await expect(page.getByTestId('sound-toggle')).toHaveText('Dźwięk: wyciszony');
    await expect(page.getByTestId('sound-toggle')).toHaveAttribute('aria-pressed', 'false');
    await expect(cell(page, 4, 4)).toHaveAttribute('data-color', '2');
    await expect(cell(page, 8, 8)).toHaveAttribute('data-color', '7');
    const previewColors = await page
      .getByTestId('preview-ball')
      .evaluateAll((balls) => balls.map((b) => /** @type {HTMLElement} */ (b).dataset.color));
    expect(previewColors).toEqual(['4', '5', '6']);
  });

  test('S16: a finished game saved by the previous version returns with the end-of-game message', async ({
    page,
  }) => {
    const full = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => String(((3 * r + c) % 7) + 1)).join(''),
    );
    await page.addInitScript(
      ([gameKey, game, bestKey, soundKey]) => {
        localStorage.setItem(gameKey, game);
        localStorage.setItem(bestKey, '90');
        localStorage.setItem(soundKey, 'on');
      },
      [
        GAME_KEY,
        JSON.stringify({ board: full, score: 90, preview: [1, 2, 3], over: true, record: true }),
        BEST_KEY,
        SOUND_KEY,
      ],
    );
    await page.goto('/');
    await ready(page);
    await expect(page.getByTestId('game-over-score')).toHaveText('90');
    await expect(page.getByTestId('game-over-record')).toBeVisible();
    await expect(page.getByTestId('best-score')).toHaveText('90');
    await expect(page.getByTestId('sound-toggle')).toHaveText('Dźwięk: włączony');
  });

  test('S16: a move that clears a line works without page errors when opened from disk', async ({
    page,
  }) => {
    const fileUrl = process.env.E2E_FILE_URL;
    test.skip(!fileUrl, 'E2E_FILE_URL is not set');
    /** @type {string[]} */
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto(/** @type {string} */ (fileUrl));
    await ready(page);
    await page.evaluate(
      ({ board }) => {
        const api = /** @type {any} */ (globalThis).__kulki;
        api.setRandom({ queue: [0, 0, 0, 0, 0, 0] });
        api.setState({ board, score: 0, preview: [3, 4, 5] });
      },
      {
        board: rows([
          [8, 0, 1],
          [8, 1, 1],
          [8, 2, 1],
          [8, 3, 1],
          [6, 4, 1],
          [0, 0, 2],
        ]),
      },
    );
    await cell(page, 6, 4).click();
    await cell(page, 8, 4).click();
    await page.locator('[data-testid="board"][data-animating="false"]').waitFor();

    const state = await getState(page);
    expect(state.score).toBeGreaterThan(0);
    for (let col = 0; col < 5; col++) {
      await expect(cell(page, 8, col)).not.toHaveAttribute('data-color', '1');
    }
    expect(errors).toEqual([]);
  });
});
